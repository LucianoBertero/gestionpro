'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';
import type { TipoImpuesto } from '@/constants';
import { vencimientosQueryOptions } from '@/features/vencimientos/api/queries';
import { ExcelImportModal } from '@/features/vencimientos/components/excel-import-modal';
import { ProximosVencimientosCard } from '@/features/vencimientos/components/proximos-vencimientos-card';
import { VencimientosFilterBar } from '@/features/vencimientos/components/vencimientos-filter-bar';
import { VencimientosTable } from '@/features/vencimientos/components/vencimientos-table';

export default function VencimientosPage() {
  const t = useT();
  const [importOpen, setImportOpen] = useState(false);

  // Filters
  const [impuesto, setImpuesto] = useState<TipoImpuesto | 'all'>('all');
  const [anio, setAnio] = useState<number | 'all'>('all');
  const [mes, setMes] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);

  const filters = {
    ...(impuesto !== 'all' ? { impuesto } : {}),
    ...(anio !== 'all' ? { anio } : {}),
    ...(mes !== 'all' ? { mes } : {}),
    page,
    limit: 20,
  };

  const { data: result, isLoading } = useQuery(vencimientosQueryOptions(filters));

  const items = result?.data ?? [];
  const meta = result ? { total: result.total, skip: result.skip, take: result.take } : undefined;

  const handleClear = useCallback(() => {
    setImpuesto('all');
    setAnio('all');
    setMes('all');
    setPage(1);
  }, []);

  return (
    <PageContainer
      pageTitle={t('vencimiento.title', { defaultValue: 'Vencimientos' })}
      pageDescription={t('vencimiento.periodo', { defaultValue: 'Calendario de vencimientos impositivos' })}
      pageHeaderAction={
        <Button onClick={() => setImportOpen(true)}>
          <Icons.upload className="mr-2 h-4 w-4" />
          {t('vencimiento.importExcel', { defaultValue: 'Importar Excel' })}
        </Button>
      }
    >
      {/* Top: Próximos vencimientos */}
      <ProximosVencimientosCard />

      {/* Filters */}
      <VencimientosFilterBar
        impuesto={impuesto}
        anio={anio}
        mes={mes}
        onImpuestoChange={(v) => { setImpuesto(v); setPage(1); }}
        onAnioChange={(v) => { setAnio(v); setPage(1); }}
        onMesChange={(v) => { setMes(v); setPage(1); }}
        onClear={handleClear}
      />

      {/* Table */}
      <VencimientosTable
        data={items}
        meta={meta}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />

      <ExcelImportModal open={importOpen} onOpenChange={setImportOpen} />
    </PageContainer>
  );
}
