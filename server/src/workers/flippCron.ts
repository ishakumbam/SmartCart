import cron from 'node-cron';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { sendTargetedNotifications } from './notificationWorker';

type FlippDeal = {
  id: string;
  storeName: string;
  storeAddress: string;
  lat: number;
  lng: number;
  canonicalItem: string;
  category: string;
  regularPrice: number;
  salePrice: number;
  affiliateUrl: string;
  imageUrl?: string;
  expiresAt: string;
};

const mapDeal = (input: FlippDeal) => ({
  flippId: input.id,
  storeName: input.storeName,
  storeAddress: input.storeAddress,
  lat: input.lat,
  lng: input.lng,
  canonicalItem: input.canonicalItem,
  category: input.category as never,
  regularPrice: input.regularPrice,
  salePrice: input.salePrice,
  savingsPct: input.regularPrice > 0 ? (input.regularPrice - input.salePrice) / input.regularPrice : 0,
  affiliateUrl: input.affiliateUrl,
  imageUrl: input.imageUrl,
  expiresAt: new Date(input.expiresAt),
});

const flippKeyConfigured = (): boolean => {
  const key = process.env.FLIPP_API_KEY?.trim() ?? '';
  if (key.length === 0) return false;
  if (key.startsWith('REPLACE_')) return false;
  return true;
};

export const runFlippSyncOnce = async (): Promise<void> => {
  if (!flippKeyConfigured()) {
    logger.info('Flipp sync skipped: FLIPP_API_KEY not set (optional; add when you have partner API access)');
    return;
  }

  const endpoint = 'https://api.flipp.com/deals';
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.FLIPP_API_KEY ?? ''}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Flipp API failed with ${response.status}`);
  }
  const payload = (await response.json()) as { deals: FlippDeal[] };
  const newDeals: Array<{ id: string; canonicalItem: string; savingsPct: number; storeName: string }> = [];

  for (const raw of payload.deals ?? []) {
    const data = mapDeal(raw);
    const upserted = await prisma.deal.upsert({
      where: { flippId: data.flippId },
      create: data,
      update: data,
    });
    newDeals.push({
      id: upserted.id,
      canonicalItem: upserted.canonicalItem,
      savingsPct: upserted.savingsPct,
      storeName: upserted.storeName,
    });
  }

  await sendTargetedNotifications(newDeals);
};

export const startFlippCron = (): void => {
  if (!flippKeyConfigured()) {
    logger.info('Flipp cron not scheduled — set FLIPP_API_KEY to enable 3 AM UTC daily sync');
    return;
  }

  cron.schedule('0 3 * * *', async () => {
    try {
      await runFlippSyncOnce();
      logger.info('Flipp cron sync succeeded');
    } catch (error) {
      logger.error('Flipp cron sync failed', { error });
    }
  });
};
