'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { User } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { ROLE_OPTIONS } from './options';

export const columns: ColumnDef<User>[] = [
  {
    id: 'nombre',
    accessorFn: (row) => row.nombre,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span>{row.original.emoji}</span>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.nombre}</span>
          <span className='text-muted-foreground text-xs'>{row.original.email}</span>
        </div>
      </div>
    ),
    meta: {
      label: 'Nombre',
      placeholder: 'Buscar usuarios...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'role',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<User['role']>();
      return (
        <Badge variant={role === 'SOCIO' ? 'default' : 'outline'}>
          {role === 'SOCIO' ? 'Socio' : 'Colaborador'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Rol',
      variant: 'multiSelect' as const,
      options: ROLE_OPTIONS
    }
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ cell }) => {
      const activo = cell.getValue<User['activo']>();
      return (
        <Badge variant={activo ? 'default' : 'secondary'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
