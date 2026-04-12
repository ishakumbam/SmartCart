import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const clicks = await prisma.dealClick.findMany({
      where: { userId: req.user!.id },
      orderBy: { clickedAt: 'desc' },
      include: { deal: true },
    });
    res.json({ success: true, data: clicks });
  } catch (error) {
    next(error);
  }
});

export default router;
