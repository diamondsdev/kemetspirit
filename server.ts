import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/apiRouter';
import { fetchPublishedTours } from './server/supabaseServer';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

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

  // Client Routing & Static Assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kemet Spirit] Server operating securely on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Kemet Spirit] Server failed to start:', err);
  process.exit(1);
});
