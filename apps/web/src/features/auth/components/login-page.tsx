'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoginForm } from '@/features/auth/components/login-form';
import { Spinner } from '@/components/ui/spinner';
import { UserPicker } from '@/features/auth/components/user-picker';
import type { ActiveUser } from '@/features/auth/api/types';

function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [selectedUser, setSelectedUser] = useState<{
    email: string;
    nombre: string;
    emoji: string | null;
  } | null>(null);

  // Only redirect when we have a real user (refresh succeeded)
  useEffect(() => {
    if (isInitialized && user) {
      router.replace('/dashboard/overview');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner className='text-muted-foreground h-10 w-10' />
      </div>
    );
  }

  // Already logged in — show nothing while redirecting
  if (user) {
    return null;
  }

  function handleUserSelect(u: ActiveUser) {
    setSelectedUser({
      email: u.email,
      nombre: u.nombre,
      emoji: u.emoji,
    });
  }

  function handleBack() {
    setSelectedUser(null);
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {selectedUser ? (
          <LoginForm
            email={selectedUser.email}
            nombre={selectedUser.nombre}
            emoji={selectedUser.emoji}
            onBack={handleBack}
          />
        ) : (
          <UserPicker onSelect={handleUserSelect} />
        )}
      </div>
    </div>
  );
}

export { LoginPage };
