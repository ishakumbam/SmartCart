import { ItemCategory } from '@prisma/client';
import prisma from '../lib/prisma';

type PurchasedItem = {
  canonicalName: string;
  category: ItemCategory;
};

export const updateBuyProfiles = async (userId: string, items: PurchasedItem[]): Promise<void> => {
  const now = new Date();

  const grouped = new Map<string, { count: number; category: ItemCategory }>();
  for (const item of items) {
    const existing = grouped.get(item.canonicalName);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(item.canonicalName, { count: 1, category: item.category });
    }
  }

  for (const [canonicalItem, meta] of grouped.entries()) {
    const current = await prisma.buyProfile.findUnique({
      where: { userId_canonicalItem: { userId, canonicalItem } },
    });

    const totalPurchases = (current?.totalPurchases ?? 0) + meta.count;
    await prisma.buyProfile.upsert({
      where: { userId_canonicalItem: { userId, canonicalItem } },
      create: {
        userId,
        canonicalItem,
        category: meta.category,
        totalPurchases,
        frequencyScore: 0,
        lastPurchased: now,
      },
      update: {
        category: meta.category,
        totalPurchases,
        lastPurchased: now,
      },
    });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const profiles = await prisma.buyProfile.findMany({ where: { userId } });
  const maxPurchases = profiles.reduce((max, p) => Math.max(max, p.totalPurchases), 1);

  for (const profile of profiles) {
    const recentCount = await prisma.receiptItem.count({
      where: {
        userId,
        canonicalName: profile.canonicalItem,
        receipt: { createdAt: { gte: since } },
      },
    });
    const score = Math.min(1, recentCount / maxPurchases);
    await prisma.buyProfile.update({
      where: { id: profile.id },
      data: { frequencyScore: score },
    });
  }
};
