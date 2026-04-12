import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import logger from '../lib/logger';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error('Unhandled error', { err });

  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: 'Validation error', issues: err.issues });
    return;
  }

  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Duplicate value conflict' });
      return;
    }
    res.status(400).json({ success: false, message: 'Database request error' });
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Database unavailable'
          : `Database unavailable: ${err.message}. Check DATABASE_URL, that PostgreSQL is running, and run \`npx prisma migrate dev\`.`,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid data for database' });
    return;
  }

  if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
    res.status(500).json({ success: false, message: err.message });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
