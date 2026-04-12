import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeMode, palettes } from '../../constants/designSystem';

type ThemeCtx = {
  mode: ThemeMode;
  colors: (typeof palettes)['light'];
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
};

const fallbackTheme: ThemeCtx = {
  mode: 'dark',
  colors: palettes.dark,
  toggleMode: () => {},
  setMode: () => {},
};

const AppThemeContext = createContext<ThemeCtx>(fallbackTheme);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const value = useMemo(
    () => ({
      mode,
      colors: palettes[mode],
      toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
      setMode,
    }),
    [mode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
