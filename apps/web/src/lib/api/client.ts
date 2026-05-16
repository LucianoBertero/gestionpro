import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './types';

// ═══════════════════════════════════════════════════════════════════
// API base URL
// ═══════════════════════════════════════════════════════════════════
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ═══════════════════════════════════════════════════════════════════
// NestJS envelope unwrapper
//
// All API responses follow: { statusCode, message, timestamp, data }
// But the OpenAPI types use intersections (ApiSuccessResponseDto & { data?: T }),
// so we use a loose signature that extracts `.data` from the envelope.
// ═══════════════════════════════════════════════════════════════════

/**
 * Unwraps the NestJS API envelope to get the typed inner payload.
 * Throws if the response is missing or the nested data is undefined.
 *
 * @example
 * const result = await api.POST('/v1/auth/login', { body: {...} });
 * const { accessToken, user } = unwrap(result.data);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<T>(envelope: any): T {
  if (!envelope) throw new Error('API response is empty');
  if (envelope.statusCode >= 400) {
    throw new Error(envelope.message || 'API error');
  }
  if (envelope.data === undefined) throw new Error('API response has no data');
  return envelope.data as T;
}

// ═══════════════════════════════════════════════════════════════════
// Auth state — configured by auth store (same pattern as axios)
// ═══════════════════════════════════════════════════════════════════
let getAccessToken: (() => string | null) | null = null;
let onRefreshSuccess: ((accessToken: string) => void) | null = null;
let onRefreshFailure: (() => void) | null = null;

export function configureApiAuth(config: {
  getAccessToken: () => string | null;
  onRefreshSuccess: (accessToken: string) => void;
  onRefreshFailure: () => void;
}) {
  getAccessToken = config.getAccessToken;
  onRefreshSuccess = config.onRefreshSuccess;
  onRefreshFailure = config.onRefreshFailure;
}

// ═══════════════════════════════════════════════════════════════════
// Queue-based token refresh (same logic as axios interceptor)
// ═══════════════════════════════════════════════════════════════════
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  // Use native fetch (no interceptor) to avoid infinite loop
  const res = await fetch(`${BASE_URL}/v1/auth/refresh-token`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Refresh failed');
  const body = (await res.json()) as { data: { accessToken: string } };
  return body.data.accessToken;
}

// ═══════════════════════════════════════════════════════════════════
// Auth middleware
// ═══════════════════════════════════════════════════════════════════
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAccessToken?.();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },

  async onResponse({ request, response }) {
    if (response.status !== 401) return response;

    const url = new URL(request.url);
    // Don't intercept refresh-token calls themselves
    if (url.pathname.endsWith('/v1/auth/refresh-token')) return response;

    // If another request is already refreshing, queue this one
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            const retryReq = new Request(request, {
              headers: {
                ...Object.fromEntries(request.headers.entries()),
                Authorization: `Bearer ${token}`,
              },
            });
            resolve(fetch(retryReq));
          },
          reject: (err: unknown) => reject(err as Error),
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      onRefreshSuccess?.(newToken);
      processQueue(null, newToken);

      // Retry the original request with the new token
      const retryReq = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          Authorization: `Bearer ${newToken}`,
        },
      });
      return fetch(retryReq);
    } catch (refreshError) {
      processQueue(refreshError, null);
      onRefreshFailure?.();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
    // eslint-disable-next-line no-unreachable
    return response;
  },
};

// ═══════════════════════════════════════════════════════════════════
// Typed API client
// ═══════════════════════════════════════════════════════════════════
const api = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
});

api.use(authMiddleware);

export default api;
