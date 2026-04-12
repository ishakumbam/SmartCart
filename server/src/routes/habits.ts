import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const items = await prisma.receiptItem.findMany({
      where: { userId },
      include: { receipt: true },
    });

    const categorySpendMap = new Map<string, number>();
    for (const item of items) {
      categorySpendMap.set(item.category, (categorySpendMap.get(item.category) ?? 0) + item.price);
    }
    const categorySpend = Array.from(categorySpendMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    const weeklyBuckets = new Map<string, number>();
    for (const item of items) {
      const dt = item.receipt.createdAt;
      if (dt < eightWeeksAgo) continue;
      const week = `${dt.getUTCFullYear()}-W${Math.ceil(dt.getUTCDate() / 7)}`;
      weeklyBuckets.set(week, (weeklyBuckets.get(week) ?? 0) + item.price);
    }
    const weeklyTrend = Array.from(weeklyBuckets.entries()).map(([week, total]) => ({ week, total }));

    const totalCategory = categorySpend.reduce((sum, x) => sum + x.amount, 0) || 1;
    const categoryPie = categorySpend.map((entry) => ({
      category: entry.category,
      pct: Number(((entry.amount / totalCategory) * 100).toFixed(2)),
    }));

    const topItems = await prisma.buyProfile.findMany({
      where: { userId },
      orderBy: { frequencyScore: 'desc' },
      take: 10,
    });

    const clicks = await prisma.dealClick.findMany({
      where: { userId },
      include: { deal: true },
    });
    const totalSaved = clicks.reduce((sum, click) => sum + (click.deal.regularPrice - click.deal.salePrice), 0);

    const monthSpend = items
      .filter((item) => item.receipt.createdAt >= startMonth)
      .reduce((sum, item) => sum + item.price, 0);

    res.json({
      success: true,
      data: {
        categorySpend,
        weeklyTrend,
        categoryPie,
        topItems,
        totalSaved,
        totalSpent: monthSpend,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
