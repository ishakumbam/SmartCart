import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(1),
});

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const accessSignOpts: SignOptions = {
  expiresIn: (process.env.JWT_ACCESS_EXPIRES ?? '24h') as SignOptions['expiresIn'],
};

const signAccessToken = (id: string, email: string): string =>
  jwt.sign({ id, email }, process.env.JWT_SECRET ?? '', accessSignOpts);

const refreshSignOpts: SignOptions = { expiresIn: '30d' };

const signRefreshToken = (id: string, email: string): string =>
  jwt.sign({ id, email }, process.env.JWT_REFRESH_SECRET ?? '', refreshSignOpts);

router.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        provider: 'EMAIL',
      },
    });

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id, user.email);
    res.cookie('refresh_token', refreshToken, cookieOpts);
    res.status(201).json({ success: true, data: { accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id, user.email);
    res.cookie('refresh_token', refreshToken, cookieOpts);
    res.json({ success: true, data: { accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const input = googleSchema.parse(req.body);
    const ticket = await googleClient.verifyIdToken({
      idToken: input.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).json({ success: false, message: 'Invalid Google token payload' });
      return;
    }

    const user = await prisma.user.upsert({
      where: { email: payload.email },
      create: {
        email: payload.email,
        name: payload.name ?? 'Google User',
        provider: 'GOOGLE',
      },
      update: {
        name: payload.name ?? undefined,
      },
    });

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id, user.email);
    res.cookie('refresh_token', refreshToken, cookieOpts);
    res.json({ success: true, data: { accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const bodyToken =
      req.body && typeof (req.body as { refreshToken?: string }).refreshToken === 'string'
        ? (req.body as { refreshToken: string }).refreshToken
        : undefined;
    const token = bodyToken ?? (req.cookies?.refresh_token as string | undefined);
    if (!token) {
      res.status(401).json({ success: false, message: 'Missing refresh token' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET ?? '') as {
      id: string;
      email: string;
    };
    const accessToken = signAccessToken(decoded.id, decoded.email);
    const nextRefresh = signRefreshToken(decoded.id, decoded.email);
    res.cookie('refresh_token', nextRefresh, cookieOpts);
    res.json({ success: true, data: { accessToken, refreshToken: nextRefresh } });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (_req, res, next) => {
  try {
    res.clearCookie('refresh_token', cookieOpts);
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (error) {
    logger.error('Logout failed', { error });
    next(error);
  }
});

export default router;
