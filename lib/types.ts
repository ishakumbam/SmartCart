/** Subset of Prisma Deal + ranker fields from GET /api/deals */
export type ApiDeal = {
  id: string;
  flippId: string;
  storeName: string;
  storeAddress: string;
  lat: number;
  lng: number;
  canonicalItem: string;
  category: string;
  regularPrice: number;
  salePrice: number;
  savingsPct: number;
  affiliateUrl: string;
  imageUrl: string | null;
  expiresAt: string;
  createdAt: string;
  distanceKm?: number;
  frequencyScore?: number;
  score?: number;
};

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  provider: string;
  createdAt: string;
};

export type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  dealId: string | null;
  read: boolean;
  createdAt: string;
  deal: ApiDeal | null;
};

export type HabitsPayload = {
  categorySpend: { category: string; amount: number }[];
  weeklyTrend: { week: string; total: number }[];
  categoryPie: { category: string; pct: number }[];
  topItems: {
    id: string;
    canonicalItem: string;
    category: string;
    frequencyScore: number;
    totalPurchases: number;
    lastPurchased: string;
  }[];
  totalSaved: number;
  totalSpent: number;
};
