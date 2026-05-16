import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import AgendaContent from '@/features/agenda/components/full-calendar-wrapper';

export default function AgendaPage() {
  return (
    <PageContainer pageTitle="Agenda" pageDescription="Agenda personal y del equipo">
      <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground">Cargando calendario...</div>}>
        <AgendaContent />
      </Suspense>
    </PageContainer>
  );
}
