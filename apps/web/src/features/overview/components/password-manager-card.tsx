'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { clavesQueryOptions } from '@/features/claves/api/queries';
import type { Clave } from '@/features/claves/api/types';

// ─── Component ─────────────────────────────────────────────────────────

export function PasswordManagerCard() {
  const { data: claves = [] } = useQuery(clavesQueryOptions());

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-base'>Gestión de Claves</CardTitle>
        <Icons.key className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent className='space-y-0'>
        {claves.length === 0 ? (
          <p className='py-4 text-sm text-muted-foreground text-center'>No hay claves registradas</p>
        ) : (
          claves.map((item, index) => (
            <CredentialRow key={item.id} item={item} isLast={index === claves.length - 1} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Credential Row ───────────────────────────────────────────────────

function CredentialRow({ item, isLast }: { item: Clave; isLast: boolean }) {
  const [visible, setVisible] = useState(false);

  const obscured = '•'.repeat(12);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.clave);
      toast.success('Copiado', {
        description: `Clave de ${item.entidad} copiada al portapapeles`,
        duration: 2000,
      });
    } catch {
      toast.error('Error al copiar');
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 py-3 ${!isLast ? 'border-b border-border/50' : ''}`}>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium truncate'>{item.entidad}</p>
        <p className='mt-0.5 font-mono text-sm tracking-widest text-muted-foreground'>
          {visible ? item.clave : obscured}
        </p>
      </div>

      <div className='flex shrink-0 items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:text-foreground'
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
        >
          {visible ? <Icons.eyeOff className='h-4 w-4' /> : <Icons.eye className='h-4 w-4' />}
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:text-foreground'
          onClick={handleCopy}
          aria-label='Copiar clave'
        >
          <Icons.copy className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

// ─── Skeleton Loading ──────────────────────────────────────────────────

export function PasswordManagerCardSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-base'>Gestión de Claves</CardTitle>
        <Icons.key className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='flex items-center justify-between gap-3 py-2'>
            <div className='space-y-1 flex-1'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3.5 w-32' />
            </div>
            <div className='flex gap-1'>
              <Skeleton className='h-8 w-8 rounded-md' />
              <Skeleton className='h-8 w-8 rounded-md' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
