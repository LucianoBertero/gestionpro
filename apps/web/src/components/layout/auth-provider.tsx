'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <>{children}</>;
}
