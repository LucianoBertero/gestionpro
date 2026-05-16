'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { legajoQueryOptions } from '../api/queries';
import { ClienteLegajoTabs } from './cliente-legajo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

interface ClienteLegajoViewProps {
  id: number;
}

export function ClienteLegajoView({ id }: ClienteLegajoViewProps) {
  const { data: legajo } = useSuspenseQuery(legajoQueryOptions(id));

  if (!legajo) {
    return (
      <Alert variant='destructive'>
        <Icons.warning className='h-4 w-4' />
        <AlertDescription>Cliente no encontrado</AlertDescription>
      </Alert>
    );
  }

  return <ClienteLegajoTabs legajo={legajo} />;
}
