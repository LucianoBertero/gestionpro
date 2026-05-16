'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const refresh = useAuthStore((state) => state.refresh);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!isInitialized) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    );
  }

  return <>{children}</>;
}
