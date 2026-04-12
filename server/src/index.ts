/// <reference path="./types/express.d.ts" />
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import receiptsRoutes from './routes/receipts';
import dealsRoutes from './routes/deals';
import habitsRoutes from './routes/habits';
import usersRoutes from './routes/users';
import clicksRoutes from './routes/clicks';
import notificationsRoutes from './routes/notifications';
import { errorHandler } from './middleware/errorHandler';
import logger from './lib/logger';
import redis from './lib/redis';
import { startFlippCron } from './workers/flippCron';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clicks', clicksRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await redis.connect();
    await redis.ping();
    logger.info('Redis connected');
    require('./workers/receiptWorker');
    startFlippCron();
    app.listen(port, () => {
      logger.info(`🚀 SmartCart API running on port ${port}`);
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Startup failed', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });
    process.exit(1);
  }
};

void start();
