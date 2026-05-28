'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const refresh = useAuthStore((state) => state.refresh);
  const pathname = usePathname();

  useEffect(() => {
    // Never call refresh on the login page — it handles its own auth flow
    if (pathname === '/login') return;
    refresh();
  }, [refresh, pathname]);

  return <>{children}</>;
}
