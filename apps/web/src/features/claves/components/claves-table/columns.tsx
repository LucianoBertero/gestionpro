'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import type { Clave } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Clave>[] = [
  {
    id: 'entidad',
    accessorKey: 'entidad',
    header: ({ column }: { column: Column<Clave, unknown> }) => (
      <DataTableColumnHeader column={column} title='Entidad' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Icons.key className='h-4 w-4 text-muted-foreground' />
        <span className='font-medium'>{row.original.entidad}</span>
      </div>
    ),
    meta: {
      label: 'Entidad',
      placeholder: 'Buscar por entidad...',
      variant: 'text' as const,
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'creadoEn',
    header: ({ column }: { column: Column<Clave, unknown> }) => (
      <DataTableColumnHeader column={column} title='Creado' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Clave['creadoEn']>();
      return (
        <span className='text-muted-foreground text-sm'>
          {new Date(date).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
