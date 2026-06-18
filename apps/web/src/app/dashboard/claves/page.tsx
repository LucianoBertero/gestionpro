import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import ClaveListingPage from '@/features/claves/components/clave-listing';
import { ClavesTableSkeleton } from '@/features/claves/components/claves-table';
import { ClaveFormSheetTrigger } from '@/features/claves/components/clave-form-sheet';

export const metadata = {
  title: 'Dashboard: Claves',
};

export default function ClavesPage() {
  return (
    <PageContainer
      pageTitle='Claves del Estudio'
      pageDescription='Administrá las credenciales de AFIP, Rentas, ANSES y demás organismos'
      pageHeaderAction={<ClaveFormSheetTrigger />}
    >
      <Suspense fallback={<ClavesTableSkeleton />}>
        <ClaveListingPage />
      </Suspense>
    </PageContainer>
  );
}
