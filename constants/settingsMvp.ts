export const settingsMvpCopy: Record<
  string,
  { title: string; subtitle: string; body: string; icon: string }
> = {
  email: {
    icon: 'EM',
    title: 'Email',
    subtitle: 'Account email',
    body: 'Your email is verified. Change address or recovery options will ship after auth is wired to the backend.',
  },
  phone: {
    icon: 'PH',
    title: 'Phone',
    subtitle: 'SMS & alerts',
    body: 'Add a phone number to get flash deal texts. MVP screen — connect Prisma user profile next.',
  },
  security: {
    icon: 'SC',
    title: 'Security',
    subtitle: 'Face ID & sessions',
    body: 'Face ID is a local preference. Server-side session revoke and 2FA will appear here.',
  },
  radius: {
    icon: 'RD',
    title: 'Search radius',
    subtitle: 'Deals near you',
    body: 'Currently 25 mi. Slider + saved home/store pins will live on this screen.',
  },
  notif: {
    icon: 'NT',
    title: 'Notifications',
    subtitle: 'What we ping you about',
    body: 'Toggle categories: price drops, expiring promos, weekly digest. Hooks to Expo push later.',
  },
  stores: {
    icon: 'ST',
    title: 'Favorite stores',
    subtitle: 'Your top 3',
    body: 'Reorder and add chains you actually shop. Feeds the deal ranker.',
  },
  help: {
    icon: 'HP',
    title: 'Help center',
    subtitle: 'We got you',
    body: 'FAQs, contact support, and report a bad scan. Content placeholder for MVP.',
  },
  legal: {
    icon: 'LG',
    title: 'Legal',
    subtitle: 'Terms & privacy',
    body: 'Terms of service and privacy policy summaries. Full docs linked in production.',
  },
};
