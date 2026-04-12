import { Platform } from 'react-native';

/**
 * Point the app at your machine: iOS simulator can use localhost; Android emulator uses 10.0.2.2;
 * physical device needs your LAN IP (e.g. http://192.168.1.5:3000).
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';

export const apiBaseMessage =
  Platform.OS === 'web'
    ? 'Set EXPO_PUBLIC_API_URL in .env for web.'
    : 'Set EXPO_PUBLIC_API_URL to your server (see constants/config.ts).';
