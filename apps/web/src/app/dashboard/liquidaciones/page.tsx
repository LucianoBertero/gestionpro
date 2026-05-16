import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { liquidacionesQueryOptions } from '@/features/liquidaciones/api/queries';
import PageContainer from '@/components/layout/page-container';
import { LiquidacionListing } from '@/features/liquidaciones/components/liquidacion-listing';
import { Skeleton } from '@/components/ui/skeleton';

export default async function LiquidacionesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(liquidacionesQueryOptions());

  return (
    <PageContainer pageTitle="Liquidaciones" pageDescription="Carga y consulta de liquidaciones impositivas">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <LiquidacionListing />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
