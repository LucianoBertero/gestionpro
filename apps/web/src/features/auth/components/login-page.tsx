'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoginForm } from '@/features/auth/components/login-form';

function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Only redirect when we have a real user (refresh succeeded)
  useEffect(() => {
    if (user) {
      router.replace('/dashboard/overview');
    }
  }, [user, router]);

  // Already logged in — show nothing while redirecting
  if (user) {
    return null;
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <LoginForm />
      </div>
    </div>
  );
}

export { LoginPage };
