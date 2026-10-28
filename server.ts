import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes/apiRouter';
import { fetchPublishedTours, isServerSupabaseConfigured } from './server/supabaseServer';

// Load environment variables from .env if present
dotenv.config();

const getDirname = (): string => {
  try {
    // In CommonJS bundles, __dirname is already defined
    if (typeof __dirname !== 'undefined') {
      return __dirname;
    }
  } catch {}
  try {
    // In ES modules (tsx dev mode)
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};

function resolveDistPath(): string {
  const currentDir = getDirname();
  const candidates = [
    // If running bundled inside dist/server.cjs, currentDir is the dist directory itself
    currentDir,
    // If running from project root (e.g. node server.js or tsx server.ts)
    path.resolve(currentDir, 'dist'),
    // If running via process.cwd()
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd()),
    // Parent dist in case of nested execution
    path.resolve(currentDir, '..', 'dist'),
  ];

  for (const candidate of candidates) {
    const testIndex = path.join(candidate, 'index.html');
    if (fs.existsSync(testIndex)) {
      return candidate;
    }
  }

  // Default fallback
  return path.resolve(process.cwd(), 'dist');
}

async function startServer() {
  const app = express();
  const rawPort = process.env.PORT;
  let listenTarget: number | string = 3000;

  if (rawPort) {
    const numericPort = Number(rawPort);
    if (!Number.isNaN(numericPort) && numericPort > 0) {
      listenTarget = numericPort;
    } else {
      // Unix domain socket or named pipe provided by Hostinger Passenger
      listenTarget = rawPort;
    }
  }

  const distPath = resolveDistPath();
  const indexPath = path.join(distPath, 'index.html');
  const hasBuiltFrontend = fs.existsSync(indexPath);
  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'publish';

  console.log('[Kemet Spirit] ========================================');
  console.log('[Kemet Spirit] Server starting...');
  console.log(`[Kemet Spirit] Node.js version: ${process.version}`);
  console.log(`[Kemet Spirit] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Kemet Spirit] Raw PORT env: ${rawPort || '(not set)'}`);
  console.log(`[Kemet Spirit] Listen target: ${listenTarget}`);
  console.log(`[Kemet Spirit] Frontend directory: ${distPath}`);
  console.log(`[Kemet Spirit] Frontend index.html exists: ${hasBuiltFrontend}`);
  console.log(`[Kemet Spirit] Supabase configured: ${isServerSupabaseConfigured}`);
  console.log('[Kemet Spirit] ========================================');

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Top-level /health probe for hosting provider health checks (in addition to /api/health)
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Kemet Spirit Hostinger Deployment',
      timestamp: new Date().toISOString()
    });
  });

  // Mount Authoritative API Router
  app.use('/api', apiRouter);

  // Backward compatibility alias: route old /api/excursions to /api/tours
  app.get('/api/excursions', (req, res) => {
    res.redirect(307, '/api/tours');
  });

  // Dynamic Sitemap
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const tours = await fetchPublishedTours();
      const host = req.get('host') || 'kemetspirit.com';
      const protocol = req.protocol || 'https';
      const baseUrl = `${protocol}://${host}`;
      const today = new Date().toISOString().split('T')[0];

      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/#tours', priority: '0.9', changefreq: 'daily' },
        { url: '/#map', priority: '0.8', changefreq: 'weekly' },
        { url: '/#scribe', priority: '0.8', changefreq: 'weekly' },
        { url: '/#faq', priority: '0.6', changefreq: 'monthly' },
        { url: '/#bookings', priority: '0.8', changefreq: 'daily' },
      ];

      const tourPages = tours.map(t => ({
        url: `/#tour-${t.slug || t.id}`,
        priority: '0.85',
        changefreq: 'weekly'
      }));

      const allPages = [...staticPages, ...tourPages];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (e) {
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'kemetspirit.com';
    const protocol = req.protocol || 'https';
    const content = `User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /#admin

Sitemap: ${protocol}://${host}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  // Explicit API 404 handler to prevent API requests from falling through to the SPA index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    });
  });

  // Client Routing & Static Assets
  if (!isProd) {
    try {
      // Dynamic import in development so production bundles never require Vite at module load
      const viteModule = await import('vite');
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[Kemet Spirit] Running with Vite development middleware');
    } catch (e: any) {
      console.warn('[Kemet Spirit] Failed to start Vite middleware, falling back to static files:', e.message);
      app.use(express.static(distPath, { maxAge: '1d', index: false }));
    }
  } else {
    // Production / Published mode with pre-built frontend
    console.log(`[Kemet Spirit] Serving production frontend from: ${distPath}`);
    app.use(express.static(distPath, {
      maxAge: '1d',
      index: false,
    }));

    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      app.use('/assets', express.static(assetsPath, {
        maxAge: '1y',
        immutable: true,
      }));
    }

    // SPA catch-all fallback
    app.get('*', (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).json({
          error: 'Frontend build not found',
          message: 'The frontend has not been built yet. Please run "npm run build" to generate dist/index.html.',
          distPath
        });
      }
    });
  }

  if (typeof listenTarget === 'number') {
    const host = process.env.HOST || '0.0.0.0';
    app.listen(listenTarget, host, () => {
      console.log(`[Kemet Spirit] Server listening on http://${host}:${listenTarget}`);
    });
  } else {
    app.listen(listenTarget, () => {
      console.log(`[Kemet Spirit] Server listening on socket ${listenTarget}`);
    });
  }
}

startServer().catch((err) => {
  console.error('[Kemet Spirit] Server failed to start:', err);
  process.exit(1);
});
