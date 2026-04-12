export type MockDeal = {
  id: string;
  name: string;
  original: string;
  sale: string;
  save: string;
  store: string;
  dist: string;
  urgent: boolean;
  /** Approximate store location (Austin area) for map previews */
  latitude: number;
  longitude: number;
};

export const mockDeals: MockDeal[] = [
  { id: '1', name: 'Organic whole milk', original: '$6.65', sale: '$3.99', save: '40%', store: 'Walmart', dist: '0.8 mi', urgent: true, latitude: 30.2681, longitude: -97.7438 },
  { id: '2', name: 'Whole wheat bread', original: '$3.29', sale: '$2.49', save: '25%', store: 'Target', dist: '1.2 mi', urgent: false, latitude: 30.2645, longitude: -97.7375 },
  { id: '3', name: 'Free range eggs', original: '$7.10', sale: '$4.99', save: '30%', store: 'Kroger', dist: '2.1 mi', urgent: true, latitude: 30.2724, longitude: -97.7512 },
  { id: '4', name: 'Salmon flash deal', original: '$18.00', sale: '$11.99', save: '33%', store: 'Whole Foods', dist: '3.0 mi', urgent: true, latitude: 30.2588, longitude: -97.7355 },
];

/** Region that fits all mock deal markers */
export function regionForMockDeals(): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  const deals = mockDeals;
  const lats = deals.map((d) => d.latitude);
  const lngs = deals.map((d) => d.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const lat = (minLat + maxLat) / 2;
  const lng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02) + 0.02;
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02) + 0.02;
  return { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
}

export function getMockDeal(id: string): MockDeal | undefined {
  return mockDeals.find((d) => d.id === id);
}
