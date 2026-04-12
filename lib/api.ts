import { API_URL } from '../constants/config';
import * as storage from './storage';

type ApiEnvelope<T> = { success: true; data: T } | { success: false; message: string };

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const rt = await storage.getRefreshToken();
      if (!rt) return false;
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      const body = await parseJson<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(res);
      if (!res.ok || !body.success) return false;
      await storage.setTokens(body.data.accessToken, body.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const { skipAuth, ...rest } = init ?? {};
  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  };
  if (!headers['Content-Type'] && rest.body && typeof rest.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  if (!skipAuth) {
    const token = await storage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${path}`, { ...rest, headers });

  if (res.status === 401 && !skipAuth) {
    const ok = await tryRefresh();
    if (ok) {
      const token = await storage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      res = await fetch(`${API_URL}${path}`, { ...rest, headers });
    }
  }

  const data = await parseJson<ApiEnvelope<T> | { success: false; message?: string }>(res);
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'message' in data && data.message
        ? data.message
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (!data || typeof data !== 'object' || !('success' in data) || !data.success) {
    const msg = data && typeof data === 'object' && 'message' in data ? String(data.message) : 'Request failed';
    throw new Error(msg);
  }
  return (data as { success: true; data: T }).data;
}

export async function authLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<ApiEnvelope<{ accessToken: string; refreshToken: string }> | { success: false; message?: string }>(res);
  if (!res.ok || !data || !('success' in data) || !data.success) {
    const msg = data && 'message' in data && data.message ? data.message : 'Login failed';
    throw new Error(msg);
  }
  await storage.setTokens(data.data.accessToken, data.data.refreshToken);
}

export async function authRegister(email: string, password: string, name: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await parseJson<ApiEnvelope<{ accessToken: string; refreshToken: string }> | { success: false; message?: string }>(res);
  if (!res.ok || !data || !('success' in data) || !data.success) {
    const msg = data && 'message' in data && data.message ? data.message : 'Register failed';
    throw new Error(msg);
  }
  await storage.setTokens(data.data.accessToken, data.data.refreshToken);
}

export async function authLogout(): Promise<void> {
  try {
    const token = await storage.getAccessToken();
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } finally {
    await storage.clearTokens();
  }
}
