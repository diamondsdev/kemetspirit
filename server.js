// ============================================================================
// Kemet Spirit — Hostinger Node.js Production Entry Point
// ============================================================================
// When Hostinger is configured with "Entry file: server.js", this root script
// resolves and executes the compiled production bundle at dist/server.cjs.
// ============================================================================
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distServerPath = path.resolve(__dirname, 'dist', 'server.cjs');

console.log('[Hostinger Root Entry] server.js startup initialized');
console.log(`[Hostinger Root Entry] Node version: ${process.version}`);
console.log(`[Hostinger Root Entry] Working Directory (cwd): ${process.cwd()}`);
console.log(`[Hostinger Root Entry] Target server bundle: ${distServerPath}`);

if (fs.existsSync(distServerPath)) {
  console.log('[Hostinger Root Entry] Found dist/server.cjs. Launching production server...');
  const require = createRequire(import.meta.url);
  require(distServerPath);
} else {
  console.error('[Hostinger Root Entry] FATAL ERROR: dist/server.cjs was not found!');
  console.error('[Hostinger Root Entry] Please ensure the Hostinger build command is set to:');
  console.error('[Hostinger Root Entry] npm run build');
  process.exit(1);
}

