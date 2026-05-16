'use client';

import { useState, useEffect } from 'react';
import { getActiveUsers } from '@/features/auth/api/service';
import type { ActiveUser } from '@/features/auth/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface UserPickerProps {
  onSelect: (user: ActiveUser) => void;
}

function UserPicker({ onSelect }: UserPickerProps) {
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveUsers()
      .then(setUsers)
      .catch(() => setError('No se pudieron cargar los usuarios. Verificá que el servidor esté corriendo.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Spinner className='text-muted-foreground h-10 w-10' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center gap-4 py-16 text-center'>
        <p className='text-muted-foreground text-sm'>{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-16 text-center'>
        <p className='text-muted-foreground text-sm'>No hay usuarios activos.</p>
        <p className='text-muted-foreground text-xs'>Contactá a un administrador para que cree tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h1 className='text-foreground text-2xl font-semibold tracking-tight'>
          ¿Quién sos?
        </h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          Seleccioná tu usuario para ingresar
        </p>
      </div>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'>
        {users.map((user) => (
          <Card
            key={user.id}
            className={cn(
              'cursor-pointer border-2 transition-all duration-150',
              'hover:border-primary hover:shadow-md',
              'active:scale-[0.98]'
            )}
            onClick={() => onSelect(user)}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(user);
              }
            }}
          >
            <CardContent className='flex flex-col items-center gap-3 px-4 py-6'>
              <span className='text-5xl leading-none' role='img' aria-label={user.nombre}>
                {user.emoji || '👤'}
              </span>
              <span className='text-foreground text-sm font-medium leading-tight text-center'>
                {user.nombre}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { UserPicker };
