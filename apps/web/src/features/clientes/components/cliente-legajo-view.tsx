'use client';

import { useQuery } from '@tanstack/react-query';
import { legajoQueryOptions } from '../api/queries';
import { ClienteLegajoTabs } from './cliente-legajo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface ClienteLegajoViewProps {
  id: number;
}

export function ClienteLegajoView({ id }: ClienteLegajoViewProps) {
  const { data: legajo, isLoading, error } = useQuery(legajoQueryOptions(id));

  const breadcrumb = (
    <nav className='mb-2 flex items-center gap-2 text-sm'>
      <Link 
        href='/dashboard/clientes' 
        className='text-muted-foreground hover:text-foreground transition-colors'
      >
        Clientes
      </Link>
      <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
      <span className='text-foreground font-medium'>
        {isLoading ? '...' : legajo?.denominacion ?? 'Cliente'}
      </span>
    </nav>
  );

  if (isLoading) {
    return (
      <PageContainer pageTitle='Legajo del Cliente'>
        {breadcrumb}
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </PageContainer>
    );
  }

  if (error || !legajo) {
    return (
      <PageContainer pageTitle='Legajo del Cliente'>
        {breadcrumb}
        <Alert variant='destructive'>
          <Icons.warning className='h-4 w-4' />
          <AlertDescription>Cliente no encontrado</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={legajo.denominacion} pageDescription={`CUIT: ${legajo.cuit}`}>
      {breadcrumb}
      <ClienteLegajoTabs legajo={legajo} />
    </PageContainer>
  );
}
