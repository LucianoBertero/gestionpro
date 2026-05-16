'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import {
  clientesQueryOptions,
  activeUsersQueryOptions,
} from '../../api/queries';
import { getColumns } from './columns';
import { useMemo } from 'react';

const columnIds = ['denominacion', 'cuit', 'encargado', 'semaforo', 'impuestos', 'actions'];

export function ClientesTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    search: parseAsString,
    semaforo: parseAsString,
    encargadoId: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const filters = {
    ...(params.search && { search: params.search }),
    ...(params.semaforo && { semaforo: params.semaforo }),
    ...(params.encargadoId && { encargadoId: params.encargadoId }),
  };

  const { data: clientesData } = useSuspenseQuery(
    clientesQueryOptions(filters)
  );
  const { data: users = [] } = useSuspenseQuery(activeUsersQueryOptions());

  const clientes = clientesData.data;
  const total = clientesData.total;
  const pageCount = Math.ceil(total / params.perPage);

  const columns = useMemo(() => getColumns(users), [users]);

  const { table } = useDataTable({
    data: clientes,
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

export function ClientesTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
