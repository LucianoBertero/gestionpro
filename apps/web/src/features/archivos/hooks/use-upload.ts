'use client';

import { useState, useRef, useCallback } from 'react';
import api from '@/lib/auth/axios-instance';
import type { ArchivoParent, Archivo, TipoArchivo } from '@/features/archivos/api/types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'aborted';

interface UploadState {
  status: UploadStatus;
  progress: number; // 0–100
  error: Error | null;
}

const MAX_RETRIES = 3;
const BACKOFF_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s exponential

/**
 * Generic upload hook for the archivos module.
 *
 * - Uses the JWT-aware `axios-instance` so auth headers and refresh work.
 * - Tracks real upload progress via `onUploadProgress`.
 * - Supports cancellation via `AbortController`.
 * - Retries on network/timeout errors up to 3 times with exponential backoff.
 *   Non-retryable errors (4xx, 5xx) fail immediately.
 */
export function useUpload(): {
  status: UploadStatus;
  progress: number;
  error: Error | null;
  /** Start an upload. Returns the created Archivo on success, null on failure/abort. */
  upload: (
    file: File,
    parent: ArchivoParent,
    tipo?: TipoArchivo,
    periodo?: string
  ) => Promise<Archivo | null>;
  /** Abort the in-flight upload. State resets to 'aborted'. */
  abort: () => void;
  /** Reset state back to idle. */
  reset: () => void;
} {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, error: null });
    abortControllerRef.current = null;
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({ status: 'aborted', progress: 0, error: null });
  }, []);

  const upload = useCallback(
    async (
      file: File,
      parent: ArchivoParent,
      tipo?: TipoArchivo,
      periodo?: string
    ): Promise<Archivo | null> => {
      setState({ status: 'uploading', progress: 0, error: null });

      const buildFormData = (): FormData => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('parent', JSON.stringify(parent));
        if (tipo) fd.append('tipo', tipo);
        if (periodo) fd.append('periodo', periodo);
        return fd;
      };

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const { data } = await api.post('/v1/archivos', buildFormData(), {
            signal: controller.signal,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setState((prev) => ({ ...prev, progress: percent }));
              }
            },
          });

          setState({ status: 'success', progress: 100, error: null });
          return data.data as Archivo;
        } catch (err: unknown) {
          // User-triggered abort — don't retry
          if (err instanceof Error && err.name === 'CanceledError') {
            // State already set by abort()
            return null;
          }

          // Only retry on network-level errors (connection refused, timeout, DNS)
          const isNetworkError =
            err instanceof Error &&
            (err.message.includes('Network Error') ||
              err.message.includes('timeout') ||
              err.message.includes('ECONNABORTED'));

          if (isNetworkError && attempt < MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, BACKOFF_DELAYS[attempt])
            );
            continue;
          }

          const error =
            err instanceof Error ? err : new Error('Upload failed');
          setState({ status: 'error', progress: 0, error });
          return null;
        }
      }

      // Exhausted all retries
      setState({
        status: 'error',
        progress: 0,
        error: new Error('Upload failed after all retries'),
      });
      return null;
    },
    []
  );

  return {
    status: state.status,
    progress: state.progress,
    error: state.error,
    upload,
    abort,
    reset,
  };
}
