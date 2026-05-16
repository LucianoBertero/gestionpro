'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';
import { columns } from './columns';
import { CellAction } from './cell-action';
import { TareasTableOptions } from './options';
import { DataTable } from '@/components/ui/table/data-table';
import type { Tarea } from '../../api/types';

interface TareasTableProps {
  data: Tarea[];
  onEdit?: (tarea: Tarea) => void;
}

export function TareasTable({ data, onEdit }: TareasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [prioridadFilter, setPrioridadFilter] = useState('all');
  const [encargadoFilter, setEncargadoFilter] = useState('all');

  const filteredData = useMemo(() => {
    let result = data;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.titulo.toLowerCase().includes(s) ||
          (t.cliente?.denominacion?.toLowerCase().includes(s) ?? false)
      );
    }
    if (estadoFilter !== 'all') result = result.filter((t) => t.estado === estadoFilter);
    if (prioridadFilter !== 'all') result = result.filter((t) => t.prioridad === prioridadFilter);
    if (encargadoFilter !== 'all') result = result.filter((t) => t.encargadoId === encargadoFilter);
    return result;
  }, [data, search, estadoFilter, prioridadFilter, encargadoFilter]);

  const actionColumn = useMemo(
    () => ({
      id: 'actions',
      cell: ({ row }: { row: { original: Tarea } }) => <CellAction row={row as any} onEdit={onEdit} />,
    }),
    [onEdit]
  );

  const tableColumns = useMemo(() => [...columns, actionColumn], [actionColumn]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="space-y-4">
      <TareasTableOptions
        table={table}
        search={search}
        setSearch={setSearch}
        estadoFilter={estadoFilter}
        setEstadoFilter={setEstadoFilter}
        prioridadFilter={prioridadFilter}
        setPrioridadFilter={setPrioridadFilter}
        encargadoFilter={encargadoFilter}
        setEncargadoFilter={setEncargadoFilter}
      />
      <DataTable table={table} />
    </div>
  );
}
