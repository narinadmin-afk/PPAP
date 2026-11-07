import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './server/routes';

async function bootstrap() {
  const app = express();
  
  // In AI Studio preview, port must be 3000. On Render/Cloud deployments, use host's PORT.
  const isAIStudio = process.env.DISABLE_HMR !== undefined || process.cwd() === '/app/applet';
  const PORT = !isAIStudio && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API router
  app.use('/api', apiRouter);

  // Simulated static file downloads
  app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(`PPAP Document Archive Content for: ${filename}\nIssued under IATF 16949 Automotive Quality Management System.`);
  });

  if (isProduction) {
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }

    app.get('*', (_req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Build Missing | PPAP Management System</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 650px; margin: 40px auto; border-radius: 12px; border: 1px solid #334155; line-height: 1.6; }
                h2 { color: #f87171; margin-top: 0; }
                code { background: #1e293b; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }
                ol { padding-left: 1.5rem; color: #cbd5e1; }
                li { margin-bottom: 0.5rem; }
              </style>
            </head>
            <body>
              <h2>Production Build Missing (dist/index.html)</h2>
              <p>The server started in production mode, but <code>dist/index.html</code> was not found at <code>${indexPath}</code>.</p>
              <h3>How to solve on Render:</h3>
              <ol>
                <li>In your Render Dashboard, open this Web Service and go to <strong>Settings</strong>.</li>
                <li>Verify your <strong>Build Command</strong> is set to: <code>npm install && npm run build</code></li>
                <li>Verify your <strong>Start Command</strong> is set to: <code>npm start</code></li>
                <li>Click <strong>Manual Deploy &gt; Deploy latest commit</strong>.</li>
              </ol>
            </body>
          </html>
        `);
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PPAP Management System] Running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });

  process.on('SIGTERM', () => {
    console.log('[PPAP Management System] SIGTERM received, shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error starting PPAP server:', err);
  process.exit(1);
});
