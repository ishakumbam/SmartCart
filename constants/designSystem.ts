import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

type Palette = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  card: string;
  cardAlt: string;
  meta: string;
  success: string;
  shadowMoss: string;
  shadowClay: string;
  gradientA: string;
  gradientB: string;
};

export const palettes: Record<ThemeMode, Palette> = {
  light: {
    background: '#FDFCF8',
    foreground: '#2C2C24',
    primary: '#5D7052',
    primaryForeground: '#F3F4F1',
    secondary: '#C18C5D',
    secondaryForeground: '#FFFFFF',
    accent: '#E6DCCD',
    accentForeground: '#4A4A40',
    muted: '#F0EBE5',
    mutedForeground: '#78786C',
    border: '#DED8CF',
    destructive: '#A85448',
    card: '#FEFEFA',
    cardAlt: '#F7F2EC',
    meta: '#8E8A80',
    success: '#4B7F56',
    shadowMoss: 'rgba(93, 112, 82, 0.15)',
    shadowClay: 'rgba(193, 140, 93, 0.2)',
    gradientA: '#5D7052',
    gradientB: '#9CB08C',
  },
  // Warm charcoal + muted sage — avoids generic “AI purple” dark UIs
  dark: {
    background: '#131312',
    foreground: '#ebeae8',
    primary: '#8a9b82',
    primaryForeground: '#121211',
    secondary: '#a89472',
    secondaryForeground: '#121211',
    accent: '#252524',
    accentForeground: '#d4d1cc',
    muted: '#1c1c1b',
    mutedForeground: '#9a9791',
    border: '#33322f',
    destructive: '#c45a50',
    card: '#1b1b1a',
    cardAlt: '#222120',
    meta: '#7a7873',
    success: '#7a9f78',
    shadowMoss: 'rgba(138, 155, 130, 0.14)',
    shadowClay: 'rgba(168, 148, 114, 0.12)',
    gradientA: '#6f7d68',
    gradientB: '#8a9b82',
  },
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  h1: 34,
  h2: 28,
  h3: 22,
  body: 16,
  meta: 13,
} as const;

export const safeTop = Platform.select({ ios: 56, android: 46, default: 46 }) ?? 46;
