// Entry point for Hostinger Node.js deployment & standard production runtime
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distServerPath = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(distServerPath)) {
  await import('./dist/server.cjs');
} else {
  console.warn('[Hostinger] dist/server.cjs not found. Starting with fallback loader...');
  // Dynamic import tsx runner if unbundled in development
  try {
    const { spawn } = await import('child_process');
    const child = spawn('npx', ['tsx', 'server.ts'], { stdio: 'inherit', env: process.env });
    child.on('exit', (code) => process.exit(code || 0));
  } catch (err) {
    console.error('[Hostinger] Failed to launch server:', err);
    process.exit(1);
  }
}
