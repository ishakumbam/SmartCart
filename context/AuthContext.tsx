import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { apiFetch, authLogin, authLogout, authRegister } from '../lib/api';
import * as storage from '../lib/storage';
import type { ApiUser } from '../lib/types';

type AuthCtx = {
  user: ApiUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await apiFetch<ApiUser>('/api/users/me');
      setUser(me);
    } catch {
      await storage.clearTokens();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    await authLogin(email, password);
    const me = await apiFetch<ApiUser>('/api/users/me');
    setUser(me);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await authRegister(email, password, name);
    const me = await apiFetch<ApiUser>('/api/users/me');
    setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut, refreshSession }),
    [user, ready, signIn, signUp, signOut, refreshSession],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be inside AuthProvider');
  return v;
}

/** Keeps unauthenticated users on auth screens and signed-in users out of auth stack. */
export function useProtectedRoute(): void {
  const { user, ready } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const root = segments[0];
    const inAuth = root === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, ready, segments, router]);
}
