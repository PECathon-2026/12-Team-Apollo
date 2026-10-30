import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { issRouter } from './routes/iss';
import { restoreRouter } from './routes/restore';
import { newsRouter } from './routes/news';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [TSUKUYOMI-SERVER] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    realm: 'Tsukuyomi Watch API',
    realmJapanese: '月読の監視バックエンド',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Mount modular feature routes
app.use('/api/iss', issRouter);
app.use('/api/restore', restoreRouter);
app.use('/api/news', newsRouter);

// Start server with port conflict handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ======================================================
     TSUKUYOMI WATCH API • 月読の監視バックエンド
  ======================================================
  Celestial Server is listening on port ${PORT}
  - Health check:     http://localhost:${PORT}/api/health
  - ISS telemetry:    http://localhost:${PORT}/api/iss/current
  - ISS predictions:  http://localhost:${PORT}/api/iss/passes
  - Image restore:    http://localhost:${PORT}/api/restore
  ======================================================
  Frontend Web App:   http://localhost:5173
  ======================================================
  (Live dev server running - press Ctrl + C to stop)
  `);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`
  ❌ [PORT CONFLICT] Port ${PORT} is already in use by another program.
  Please check what is using port ${PORT} or specify PORT=5002 in .env.
    `);
  } else {
    console.error('❌ [SERVER ERROR]', err);
  }
});
