import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

type NewDeal = {
  id: string;
  canonicalItem: string;
  savingsPct: number;
  storeName: string;
};

export const sendTargetedNotifications = async (newDeals: NewDeal[]): Promise<void> => {
  const items = Array.from(new Set(newDeals.map((d) => d.canonicalItem)));
  if (items.length === 0) return;

  const profiles = await prisma.buyProfile.findMany({
    where: { canonicalItem: { in: items } },
    include: { user: true },
  });

  const messages: ExpoPushMessage[] = [];
  const records: Array<{
    userId: string;
    title: string;
    body: string;
    dealId: string;
  }> = [];

  for (const profile of profiles) {
    const user = profile.user;
    if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) continue;
    const matched = newDeals.filter((d) => d.canonicalItem === profile.canonicalItem);
    for (const deal of matched) {
      const title = `🏷️ ${Math.round(deal.savingsPct * 100)}% off ${deal.canonicalItem}!`;
      const body = `On sale at ${deal.storeName} near you`;
      messages.push({
        to: user.expoPushToken,
        title,
        body,
        data: { dealId: deal.id },
      });
      records.push({ userId: user.id, title, body, dealId: deal.id });
    }
  }

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      logger.error('Expo push send failed', { error });
    }
  }

  if (records.length > 0) {
    await prisma.notification.createMany({
      data: records.map((r) => ({
        userId: r.userId,
        title: r.title,
        body: r.body,
        dealId: r.dealId,
      })),
    });
  }
};
