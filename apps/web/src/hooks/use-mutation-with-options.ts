'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

/**
 * Wrap a `useMutation` call so that the `onSuccess`/`onError`/`onSettled`
 * defined in a `mutationOptions` definition are ALWAYS called, even when
 * the call site also passes its own callbacks.
 *
 * Use this instead of `useMutation({ ...options, onSuccess: ... })` —
 * spreading overrides the original onSuccess, which silently drops
 * the cache invalidations you wired up in the mutationOptions.
 */
export function useMutationWithOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  extras?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  type Opts = UseMutationOptions<TData, TError, TVariables, TContext>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts = options as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ext = (extras ?? {}) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged: any = {
    ...opts,
    ...ext,
    onSuccess: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opts.onSuccess?.(...(args as any));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ext.onSuccess?.(...(args as any));
    },
    onError: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opts.onError?.(...(args as any));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ext.onError?.(...(args as any));
    },
    onSettled: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opts.onSettled?.(...(args as any));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ext.onSettled?.(...(args as any));
    },
  };

  return useMutation<TData, TError, TVariables, TContext>(merged);
}
