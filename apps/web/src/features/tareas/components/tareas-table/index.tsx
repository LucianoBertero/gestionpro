'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useQueryStates, parseAsInteger } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { getColumns } from './columns';
import type { OnUpdateField } from './columns';
import { CellAction } from './cell-action';
import { updateTareaMutation } from '../../api/mutations';
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

  // Single mutation instance shared across all editable cells — lifted to
  // the table level for performance (one subscription, not N per cell).
  const updateMutation = useMutation(updateTareaMutation);
  const { mutate } = updateMutation;

  const onUpdateField: OnUpdateField = useCallback(
    (tareaId, values) => {
      mutate({ id: tareaId, values });
    },
    [mutate]
  );

  const actionColumn = useMemo(
    () => ({
      id: 'actions',
      cell: ({ row }: { row: { original: Tarea } }) => <CellAction row={row as any} onEdit={onEdit} />,
    }),
    [onEdit]
  );

  const columns = useMemo(
    () => [...getColumns(users, onUpdateField), actionColumn],
    [actionColumn, users, onUpdateField]
  );

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

  // Fix: when client-side filtering reduces the dataset to fewer pages
  // than the current page index, reset to a valid page to avoid showing
  // an empty table. The upper-bound pageCount from `data.length` can
  // still show stale page numbers, but at least rows are never empty.
  const prevFilteredCount = useRef(table.getFilteredRowModel().rows.length);
  useEffect(() => {
    const current = table.getFilteredRowModel().rows.length;
    if (current === prevFilteredCount.current) return;
    prevFilteredCount.current = current;

    const maxPageIndex = Math.max(0, Math.ceil(current / params.perPage) - 1);
    if (table.getState().pagination.pageIndex > maxPageIndex) {
      table.setPageIndex(maxPageIndex);
    }
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
