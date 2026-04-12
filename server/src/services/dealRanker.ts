import prisma from '../lib/prisma';

const toRad = (value: number): number => (value * Math.PI) / 180;

export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const getRankedDeals = async (
  userId: string,
  lat: number,
  lng: number,
  radiusKm: number,
) => {
  const profiles = await prisma.buyProfile.findMany({
    where: { userId },
    orderBy: { frequencyScore: 'desc' },
    take: 20,
  });

  const freqByItem = new Map(profiles.map((p) => [p.canonicalItem, p.frequencyScore]));
  const items = profiles.map((p) => p.canonicalItem);

  const now = new Date();

  const deals =
    items.length > 0
      ? await prisma.deal.findMany({
          where: {
            canonicalItem: { in: items },
            expiresAt: { gte: now },
          },
        })
      : await prisma.deal.findMany({
          where: { expiresAt: { gte: now } },
        });

  return deals
    .map((deal) => {
      const distanceKm = haversineKm(lat, lng, deal.lat, deal.lng);
      const frequencyScore = freqByItem.get(deal.canonicalItem) ?? 0;
      const score =
        items.length > 0
          ? deal.savingsPct * 0.6 + frequencyScore * 0.4
          : deal.savingsPct * 0.85 + (1 / (distanceKm + 0.1)) * 0.15;
      return { ...deal, distanceKm, frequencyScore, score };
    })
    .filter((deal) => deal.distanceKm <= radiusKm)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
};
