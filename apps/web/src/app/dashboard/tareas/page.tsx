import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { tareasQueryOptions } from '@/features/tareas/api/queries';
import { activeUsersQueryOptions } from '@/features/clientes/api/queries';
import { TareaListing } from '@/features/tareas/components/tarea-listing';
import { TareaFormSheetTrigger } from '@/features/tareas/components/tarea-form-sheet';
import PageContainer from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default async function TareasPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(tareasQueryOptions()),
    queryClient.prefetchQuery(activeUsersQueryOptions()),
  ]);

  return (
    <PageContainer
      pageTitle="Tareas"
      pageDescription="Gestión de tareas del estudio"
      pageHeaderAction={<TareaFormSheetTrigger />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <TareaListing />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
