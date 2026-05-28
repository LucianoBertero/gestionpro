'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const refresh = useAuthStore((state) => state.refresh);
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only call refresh once on mount — not on every pathname change.
    // Auth is handled client-side: login sets user + token, redirect happens.
    // Guard redirects if not authenticated. No need to re-fetch profile on every navigation.
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      refresh();
    }
  }, [refresh]);

  return <>{children}</>;
}
