import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { deal: true },
    });
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const id = z.string().cuid().parse(req.params.id);
    const row = await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { read: true },
    });
    if (row.count === 0) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
});

export default router;
