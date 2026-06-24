'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsArrayOf, useQueryState } from 'nuqs';
import {
  clientesQueryOptions,
  activeUsersQueryOptions,
} from '../../api/queries';
import { getColumns } from './columns';
import { ClientesFilterBar } from './clientes-filter-bar';
import { useMemo } from 'react';

const ARRAY_SEPARATOR = ',';

export function ClientesTable() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [encargadoId, setEncargadoId] = useQueryState('encargadoId', parseAsString.withDefault(''));
  const [semaforo, setSemaforo] = useQueryState(
    'semaforo',
    parseAsArrayOf(parseAsString, ARRAY_SEPARATOR).withDefault([])
  );

  const filters = {
    ...(search && { search }),
    ...(semaforo.length > 0 && { semaforo: semaforo.join(ARRAY_SEPARATOR) }),
    ...(encargadoId && { encargadoId }),
    skip: ((page ?? 1) - 1) * (perPage ?? 10),
    take: perPage ?? 10,
  };

  const { data: clientesData, isLoading } = useQuery({
    ...clientesQueryOptions(filters),
    placeholderData: (prev) => prev,
  });
  const { data: users = [], isLoading: usersLoading } = useQuery({
    ...activeUsersQueryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const clientes = clientesData?.data ?? [];
  // Backend now returns meta.total from the paginated envelope.
  const total = clientesData?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / (perPage ?? 10)));

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

  if (isLoading) {
    return <ClientesTableSkeleton />;
  }

  return (
    <DataTable table={table}>
      <ClientesFilterBar
        search={search ?? ''}
        encargadoId={encargadoId ?? ''}
        semaforo={semaforo ?? []}
        setSearch={setSearch}
        setEncargadoId={setEncargadoId}
        setSemaforo={setSemaforo}
        users={users}
      />
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
