import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { getRankedDeals } from '../services/dealRanker';

const router = Router();

const querySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().positive(),
});

const clickSchema = z.object({
  dealId: z.string().cuid(),
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const parsed = querySchema.parse(req.query);
    const deals = await getRankedDeals(req.user!.id, parsed.lat, parsed.lng, parsed.radius);
    res.json({ success: true, data: deals });
  } catch (error) {
    next(error);
  }
});

router.post('/click', authMiddleware, async (req, res, next) => {
  try {
    const parsed = clickSchema.parse(req.body);
    const deal = await prisma.deal.findUnique({ where: { id: parsed.dealId } });
    if (!deal) {
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }
    await prisma.dealClick.create({
      data: {
        userId: req.user!.id,
        dealId: deal.id,
        affiliateUrl: deal.affiliateUrl,
      },
    });
    res.json({ success: true, data: { redirectUrl: deal.affiliateUrl } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = z.string().cuid().parse(req.params.id);
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }
    res.json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
});

export default router;
