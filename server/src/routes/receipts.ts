import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { createReceiptUploadUrl } from '../services/s3Service';
import { getReceiptsQueue } from '../lib/queue';

const router = Router();

const submitSchema = z.object({
  receiptId: z.string().cuid(),
  s3Url: z.string().url(),
});

router.get('/upload-url', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const key = `receipts/${userId}/${Date.now()}.jpg`;
    const { uploadUrl, s3Url } = await createReceiptUploadUrl(key);
    const receipt = await prisma.receipt.create({
      data: { userId, s3Url, status: 'PENDING' },
    });

    res.json({ success: true, data: { uploadUrl, receiptId: receipt.id, s3Url } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const input = submitSchema.parse(req.body);
    const userId = req.user!.id;

    const existing = await prisma.receipt.findFirst({
      where: { id: input.receiptId, userId },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Receipt not found' });
      return;
    }
    const receipt = await prisma.receipt.update({
      where: { id: input.receiptId },
      data: { s3Url: input.s3Url, status: 'PROCESSING' },
    });

    await getReceiptsQueue().add('process-receipt', {
      receiptId: receipt.id,
      s3Url: input.s3Url,
      userId,
    });

    res.json({ success: true, data: { receiptId: receipt.id, status: 'PROCESSING' } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = z.string().cuid().parse(req.params.id);
    const userId = req.user!.id;
    const receipt = await prisma.receipt.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!receipt) {
      res.status(404).json({ success: false, message: 'Receipt not found' });
      return;
    }
    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
});

export default router;
