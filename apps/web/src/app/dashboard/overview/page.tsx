import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { metricasQueryOptions, semaforosQueryOptions, tareasColaboradorQueryOptions, vencimientosSemanaQueryOptions } from '@/features/dashboard/api/queries';
import { clavesQueryOptions } from '@/features/claves/api/queries';
import PageContainer from '@/components/layout/page-container';
import { DashboardView } from '@/features/overview/components/dashboard-view';
import { Skeleton } from '@/components/ui/skeleton';

export default async function OverviewPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(metricasQueryOptions()),
    queryClient.prefetchQuery(semaforosQueryOptions()),
    queryClient.prefetchQuery(tareasColaboradorQueryOptions()),
    queryClient.prefetchQuery(vencimientosSemanaQueryOptions()),
    queryClient.prefetchQuery(clavesQueryOptions()),
  ]);

  return (
    <PageContainer pageTitle="Dashboard" pageDescription="Resumen del estudio">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <DashboardView />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
