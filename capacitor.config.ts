import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Wraps the **Expo static web export** (`npm run build:web` → `dist/`).
 * This is optional: day-to-day dev still uses `npx expo start` (Expo Go / native).
 */
const config: CapacitorConfig = {
  appId: 'com.smartcart.app',
  appName: 'SmartCart',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
