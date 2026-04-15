import { ItemCategory } from '@prisma/client';

export type ParsedItem = {
  rawName: string;
  canonicalName: string;
  category: ItemCategory;
  price: number;
  quantity: number;
  unit?: string;
};

const map: Record<string, string> = {
  'ORG WHL MLK': 'Organic Whole Milk',
  'WW BRD': 'Whole Wheat Bread',
  'FRG EGG': 'Free Range Eggs',
  'CHKN BRST': 'Chicken Breast',
  'APPL': 'Apples',
  'BNNA': 'Bananas',
  'GRC BEEF': 'Ground Beef',
  'ALM MLK': 'Almond Milk',
  'YOGRT': 'Yogurt',
  'CHDR CHS': 'Cheddar Cheese',
};

const descriptorTokens = [
  ['ORG', 'Organic'],
  ['WHL', 'Whole'],
  ['GRN', 'Green'],
  ['FRSH', 'Fresh'],
  ['LGT', 'Light'],
  ['RSTD', 'Roasted'],
  ['NTRL', 'Natural'],
  ['GLTN FR', 'Gluten Free'],
  ['LOW FAT', 'Low Fat'],
  ['XVRGN', 'Extra Virgin'],
  ['UNSWT', 'Unsweetened'],
] as const;

const itemTokens = [
  ['MLK', 'Milk'],
  ['BRD', 'Bread'],
  ['EGG', 'Eggs'],
  ['CHS', 'Cheese'],
  ['YOG', 'Yogurt'],
  ['APL', 'Apples'],
  ['BNN', 'Bananas'],
  ['CHKN', 'Chicken'],
  ['BEEF', 'Beef'],
  ['RCE', 'Rice'],
  ['PSTA', 'Pasta'],
  ['BNS', 'Beans'],
  ['CRKR', 'Crackers'],
  ['JCE', 'Juice'],
  ['WTR', 'Water'],
  ['CFE', 'Coffee'],
  ['TEA', 'Tea'],
  ['OIL', 'Oil'],
  ['SPCE', 'Spice'],
  ['SNCK', 'Snack'],
] as const;

for (const [abbrDesc, fullDesc] of descriptorTokens) {
  for (const [abbrItem, fullItem] of itemTokens) {
    map[`${abbrDesc} ${abbrItem}`] = `${fullDesc} ${fullItem}`;
  }
}

const categoryKeywords: Array<{ category: ItemCategory; keys: string[] }> = [
  {
    category: 'DAIRY',
    keys: [
      'MILK',
      'CHEESE',
      'YOGURT',
      'YOGHURT',
      'EGG',
      'BUTTER',
      'CREAM',
      'COTTAGE',
      'MOZZ',
      'CHEDDAR',
      'SHREDDED',
      'HALF AND HALF',
    ],
  },
  {
    category: 'PRODUCE',
    keys: [
      'APPLE',
      'BANANA',
      'LETTUCE',
      'TOMATO',
      'ONION',
      'POTATO',
      'CARROT',
      'SPINACH',
      'BROCCOLI',
      'AVOCADO',
      'LIME',
      'LEMON',
      'BERRY',
      'GRAPE',
    ],
  },
  { category: 'BAKERY', keys: ['BREAD', 'BAGEL', 'MUFFIN', 'BUN', 'ROLL', 'TORTILLA', 'CROISSANT'] },
  {
    category: 'MEAT',
    keys: ['BEEF', 'CHICKEN', 'PORK', 'TURKEY', 'SAUSAGE', 'BACON', 'STEAK', 'GROUND', 'WINGS'],
  },
  { category: 'SEAFOOD', keys: ['SALMON', 'TUNA', 'SHRIMP', 'FISH', 'COD', 'TILAPIA'] },
  {
    category: 'BEVERAGES',
    keys: ['DRINK', 'SODA', 'JUICE', 'WATER', 'TEA', 'COFFEE', 'ENERGY', 'SPORT', 'KOMBUCHA'],
  },
  { category: 'SNACKS', keys: ['CHIPS', 'COOKIE', 'CRACKER', 'POPCORN', 'GRANOLA', 'PROTEIN BAR'] },
  { category: 'CEREAL', keys: ['CEREAL', 'OAT', 'GRANOLA', 'MUESLI'] },
  { category: 'FROZEN', keys: ['FROZEN', 'ICE CREAM', 'PIZZA'] },
  { category: 'PASTA', keys: ['PASTA', 'NOODLE', 'SPAGHETTI', 'PENNE'] },
  { category: 'RICE', keys: ['RICE', 'QUINOA'] },
  { category: 'BEANS', keys: ['BEANS', 'LENTIL', 'CHICKPEA', 'BLACK BEAN'] },
  { category: 'OILS', keys: ['OIL', 'OLIVE', 'CANOLA', 'COCONUT OIL'] },
  { category: 'CONDIMENTS', keys: ['KETCHUP', 'MUSTARD', 'MAYO', 'MAYONNAISE', 'DRESSING', 'SAUCE'] },
  { category: 'ORGANIC', keys: ['ORGANIC', 'ORG '] },
];

const ignoreTokens = ['TOTAL', 'SUBTOTAL', 'TAX', 'CHANGE', 'DATE', 'TIME', 'THANK YOU'];

const normalizeName = (raw: string): string => {
  const upper = raw.toUpperCase().replace(/\s+/g, ' ').trim();
  if (map[upper]) return map[upper];
  return upper
    .replace(/[^A-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const inferCategory = (name: string): ItemCategory => {
  const upper = name.toUpperCase();
  for (const entry of categoryKeywords) {
    if (entry.keys.some((key) => upper.includes(key))) {
      return entry.category;
    }
  }
  return 'OTHER';
};

const extractPrice = (line: string): number | null => {
  const match = line.match(/(\d+\.\d{2})/g);
  if (!match || match.length === 0) return null;
  const value = Number(match[match.length - 1]);
  return Number.isFinite(value) ? value : null;
};

const extractQuantity = (line: string): number => {
  const qty = line.match(/\b(\d+)x\b/i) ?? line.match(/\bQTY\s*(\d+)\b/i);
  if (!qty) return 1;
  const parsed = Number(qty[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export const parseReceiptItems = (rawText: string): ParsedItem[] => {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const items: ParsedItem[] = [];

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (ignoreTokens.some((token) => upper.includes(token))) continue;
    const price = extractPrice(line);
    if (price === null) continue;

    const namePart = line.replace(/(\d+\.\d{2}).*$/, '').trim();
    if (!namePart) continue;

    const canonicalName = normalizeName(namePart);
    const category = inferCategory(canonicalName);
    const quantity = extractQuantity(line);

    items.push({
      rawName: namePart,
      canonicalName,
      category,
      price,
      quantity,
    });
  }

  return items;
};
