'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';

export function UserNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const logout = useAuthStore((s) => s.logout);

  // Still initializing — show nothing to avoid flicker
  if (!isInitialized) return null;

  // Loading token refresh
  if (isLoading) {
    return (
      <div className='flex h-8 w-8 items-center justify-center'>
        <div className='border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Link
        href='/login'
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Iniciar sesión
      </Link>
    );
  }

  const initials = user.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 gap-2 px-2'>
          <Avatar className='h-7 w-7'>
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
          <span className='hidden text-sm font-medium md:inline-block'>
            {user.nombre}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' sideOffset={8}>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-medium leading-none'>{user.nombre}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer text-destructive focus:text-destructive'
          onClick={handleLogout}
        >
          <Icons.logout className='mr-2 h-4 w-4' />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
