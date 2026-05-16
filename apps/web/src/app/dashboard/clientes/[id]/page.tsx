import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { legajoQueryOptions } from '@/features/clientes/api/queries';
import PageContainer from '@/components/layout/page-container';
import { ClienteLegajoView } from '@/features/clientes/components/cliente-legajo-view';

export const metadata = {
  title: 'Dashboard: Legajo Cliente',
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ClienteLegajoPage(props: PageProps) {
  const params = await props.params;
  const id = Number(params.id);
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(legajoQueryOptions(id));

  return (
    <PageContainer pageTitle='Legajo del Cliente'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClienteLegajoView id={id} />
      </HydrationBoundary>
    </PageContainer>
  );
}
