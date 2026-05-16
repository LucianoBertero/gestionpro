'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { vencimientosQueryOptions } from '@/features/vencimientos/api/queries';
import { ExcelImportModal } from '@/features/vencimientos/components/excel-import-modal';
import type { ColumnDef } from '@tanstack/react-table';
import type { Vencimiento } from '@/features/vencimientos/api/types';

const columns: ColumnDef<Vencimiento>[] = [
  {
    accessorKey: 'impuesto',
    header: 'Impuesto',
    cell: ({ row }) => <span className="font-medium">{row.getValue('impuesto')}</span>,
  },
  {
    accessorKey: 'anio',
    header: 'Año',
  },
  {
    accessorKey: 'mes',
    header: 'Mes',
  },
  {
    accessorKey: 'digitoCuit',
    header: 'Dígito CUIT',
  },
  {
    accessorKey: 'fechaVence',
    header: 'Vence',
    cell: ({ row }) => {
      const date = new Date(row.getValue('fechaVence'));
      return <Badge variant="outline">{date.toLocaleDateString('es-AR')}</Badge>;
    },
  },
];

export default function VencimientosPage() {
  const [importOpen, setImportOpen] = useState(false);
  const { data: vencimientos } = useSuspenseQuery(vencimientosQueryOptions());

  return (
    <PageContainer
      pageTitle="Vencimientos"
      pageDescription="Calendario de vencimientos impositivos"
      pageHeaderAction={
        <Button onClick={() => setImportOpen(true)}>
          <Icons.upload className="mr-2 h-4 w-4" />
          Importar Excel
        </Button>
      }
    >
      <DataTable columns={columns} data={vencimientos ?? []} />
      <ExcelImportModal open={importOpen} onOpenChange={setImportOpen} />
    </PageContainer>
  );
}
