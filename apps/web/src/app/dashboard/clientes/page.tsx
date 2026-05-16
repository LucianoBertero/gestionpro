import PageContainer from '@/components/layout/page-container';
import ClienteListingPage from '@/features/clientes/components/cliente-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import { ClienteFormSheetTrigger } from '@/features/clientes/components/cliente-form-sheet';
import { Suspense } from 'react';
import { ClientesTableSkeleton } from '@/features/clientes/components/clientes-table';

export const metadata = {
  title: 'Dashboard: Clientes',
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ClientesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Clientes'
      pageDescription='Gestión de clientes del estudio contable'
      pageHeaderAction={<ClienteFormSheetTrigger />}
    >
      <Suspense fallback={<ClientesTableSkeleton />}>
        <ClienteListingPage />
      </Suspense>
    </PageContainer>
  );
}
