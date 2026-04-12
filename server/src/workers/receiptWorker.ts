import { Worker } from 'bullmq';
import prisma from '../lib/prisma';
import redis from '../lib/redis';
import logger from '../lib/logger';
import { runReceiptOcr } from '../services/ocrService';
import { parseReceiptItems } from '../services/itemNormalizer';
import { updateBuyProfiles } from '../services/buyProfileService';

type ReceiptJob = {
  receiptId: string;
  s3Url: string;
  userId: string;
};

const detectStoreName = (rawText: string): string | undefined => {
  const firstLine = rawText.split('\n').map((x) => x.trim()).find(Boolean);
  return firstLine ?? undefined;
};

const detectTotalAmount = (rawText: string): number | undefined => {
  const totalMatch = rawText.match(/TOTAL[^0-9]*(\d+\.\d{2})/i);
  if (!totalMatch) return undefined;
  const parsed = Number(totalMatch[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const receiptWorker = new Worker<ReceiptJob>(
  'receipts',
  async (job) => {
    const { receiptId, s3Url, userId } = job.data;
    try {
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'PROCESSING' },
      });

      const rawText = await runReceiptOcr(s3Url);
      if (!rawText.trim()) {
        throw new Error('OCR returned empty text');
      }

      const parsedItems = parseReceiptItems(rawText);
      const storeName = detectStoreName(rawText);
      const totalAmount = detectTotalAmount(rawText);

      await prisma.$transaction(async (tx) => {
        await tx.receipt.update({
          where: { id: receiptId },
          data: {
            status: 'PROCESSED',
            rawText,
            storeName,
            totalAmount,
          },
        });

        await tx.receiptItem.createMany({
          data: parsedItems.map((item) => ({
            receiptId,
            userId,
            rawName: item.rawName,
            canonicalName: item.canonicalName,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
        });
      });

      await updateBuyProfiles(
        userId,
        parsedItems.map((item) => ({
          canonicalName: item.canonicalName,
          category: item.category,
        })),
      );

      logger.info('Receipt processed', { receiptId, itemCount: parsedItems.length });
    } catch (error) {
      logger.error('Receipt worker failed', { error, receiptId });
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  { connection: redis },
);

receiptWorker.on('failed', (job, err) => {
  logger.error('Receipt job failed event', { jobId: job?.id, error: err.message });
});
