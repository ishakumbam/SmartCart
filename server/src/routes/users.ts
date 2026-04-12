import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const pushTokenSchema = z.object({
  expoPushToken: z.string().min(1),
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, provider: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.patch('/push-token', authMiddleware, async (req, res, next) => {
  try {
    const input = pushTokenSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { expoPushToken: input.expoPushToken },
    });
    res.json({ success: true, data: { id: user.id, expoPushToken: user.expoPushToken } });
  } catch (error) {
    next(error);
  }
});

export default router;
