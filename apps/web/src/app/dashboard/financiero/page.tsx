import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { FinancieroTabs } from './financiero-tabs';

export default function FinancieroPage() {
  return (
    <PageContainer pageTitle="Financiero" pageDescription="Métricas financieras del estudio">
      <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground">Cargando datos financieros...</div>}>
        <FinancieroTabs />
      </Suspense>
    </PageContainer>
  );
}
