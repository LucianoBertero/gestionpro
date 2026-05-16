'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { SEMAFORO_OPTIONS } from './options';
import type { Cliente } from '../../api/types';
import type { ActiveUser } from '@/features/auth/api/types';

function getEncargadoNombre(
  encargadoId: string,
  users: ActiveUser[]
): string {
  const user = users.find((u) => u.id === encargadoId);
  return user?.nombre ?? encargadoId;
}

function SemaforoBadge({ semaforo }: { semaforo: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
    VERDE: 'default',
    AMARILLO: 'secondary',
    ROJO: 'destructive',
  };
  const option = SEMAFORO_OPTIONS.find((o) => o.value === semaforo);
  return (
    <Badge variant={variantMap[semaforo] ?? 'outline'} className='capitalize'>
      {option?.label ?? semaforo}
    </Badge>
  );
}

export function getColumns(users: ActiveUser[]): ColumnDef<Cliente>[] {
  return [
    {
      accessorKey: 'denominacion',
      header: ({ column }: { column: Column<Cliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='Denominación' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.denominacion}</span>
          <span className='text-muted-foreground text-xs'>
            {row.original.actividades?.[0] ?? ''}
          </span>
        </div>
      ),
      meta: {
        label: 'Denominación',
        placeholder: 'Buscar por denominación o CUIT...',
        variant: 'text' as const,
        icon: Icons.text,
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'cuit',
      header: ({ column }: { column: Column<Cliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='CUIT' />
      ),
      cell: ({ getValue }) => (
        <span className='font-mono text-sm'>{getValue<string>()}</span>
      ),
    },
    {
      id: 'encargado',
      accessorKey: 'encargadoId',
      header: ({ column }: { column: Column<Cliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='Encargado' />
      ),
      cell: ({ getValue }) => {
        const name = getEncargadoNombre(getValue<string>(), users);
        return <span className='text-sm'>{name}</span>;
      },
      meta: {
        label: 'Encargado',
        variant: 'select' as const,
        options: users.map((u) => ({ value: u.id, label: u.nombre })),
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'semaforo',
      enableSorting: false,
      header: ({ column }: { column: Column<Cliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='Semáforo' />
      ),
      cell: ({ getValue }) => (
        <SemaforoBadge semaforo={getValue<string>()} />
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Semáforo',
        variant: 'multiSelect' as const,
        options: SEMAFORO_OPTIONS,
      },
    },
    {
      id: 'impuestos',
      header: 'Impuestos',
      enableSorting: false,
      cell: () => (
        <span className='text-muted-foreground text-xs'>
          Ver en legajo
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />,
    },
  ];
}
