import { Platform } from 'react-native';

/** SmartCart — dark-first premium design system */
export const colors = {
  bg: '#0a0a0a',
  card: '#1a1a1a',
  cardUnread: '#222222',
  border: '#2a2a2a',
  heading: '#ffffff',
  subtitle: '#a0a0a0',
  meta: '#666666',
  accentStart: '#6366f1',
  accentEnd: '#8b5cf6',
  success: '#22c55e',
  danger: '#ef4444',
  urgency: '#f87171',
  pureBlack: '#000000',
} as const;

export const radii = {
  card: 16,
  button: 12,
  sheet: 24,
  chip: 20,
  iconSq: 12,
  pill: 100,
} as const;

export const space = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const safeTop = Platform.select({ ios: 56, android: 48, default: 48 }) ?? 48;

export const cardShadow = {
  shadowColor: '#6366f1',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 14,
} as const;

export const glowUnread = {
  shadowColor: '#6366f1',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.45,
  shadowRadius: 10,
  elevation: 8,
} as const;
