'use client';

import { useMemo } from 'react';
import { useQueryStates, parseAsInteger } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { getColumns } from './columns';
import { CellAction } from './cell-action';
import type { Tarea } from '../../api/types';
import type { ActiveUser } from '@/features/auth/api/types';

interface TareasTableProps {
  data: Tarea[];
  users: ActiveUser[];
  onEdit?: (tarea: Tarea) => void;
}

const columnIds = ['titulo', 'encargadoId', 'estado', 'actions'];

export function TareasTable({ data, users, onEdit }: TareasTableProps) {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const actionColumn = useMemo(
    () => ({
      id: 'actions',
      cell: ({ row }: { row: { original: Tarea } }) => <CellAction row={row as any} onEdit={onEdit} />,
    }),
    [onEdit]
  );

  const columns = useMemo(() => [...getColumns(users), actionColumn], [actionColumn, users]);
  const pageCount = Math.max(1, Math.ceil(data.length / params.perPage));

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function TareasTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
