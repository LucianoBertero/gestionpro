'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import type { Column, ColumnDef } from '@tanstack/react-table';
import {
  getPrioridadBadgeVariant,
  getEstadoBadgeVariant,
  PRIORIDAD_LABELS,
  ESTADO_TAREA_LABELS,
  TIPO_TAREA_LABELS,
  NULL_PLACEHOLDER,
} from '@/constants';
import type { Tarea } from '../../api/types';
import type { ActiveUser } from '@/features/auth/api/types';

function getEncargadoNombre(encargadoId: string, users: ActiveUser[]): string {
  const user = users.find((u) => u.id === encargadoId);
  return user?.nombre ?? encargadoId;
}

export function getColumns(users: ActiveUser[]): ColumnDef<Tarea>[] {
  return [
    {
      accessorKey: 'titulo',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Tarea' />
      ),
      cell: ({ row }) => (
        <div className='flex max-w-[220px] flex-col'>
          <span className='font-medium'>{row.original.titulo}</span>
          <span className='text-muted-foreground text-xs'>
            {row.original.cliente?.denominacion ?? NULL_PLACEHOLDER}
          </span>
        </div>
      ),
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const search = String(value ?? '').toLowerCase().trim();
        if (!search) return true;

        return (
          row.original.titulo.toLowerCase().includes(search) ||
          (row.original.cliente?.denominacion?.toLowerCase().includes(search) ?? false)
        );
      },
      meta: {
        label: 'Tarea',
        placeholder: 'Buscar por tarea o cliente...',
        variant: 'text' as const,
        icon: Icons.text,
      },
    },
    {
      id: 'encargadoId',
      accessorKey: 'encargadoId',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Encargado' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{getEncargadoNombre(row.original.encargadoId, users)}</span>
      ),
    },
    {
      accessorKey: 'estado',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Estado' />
      ),
      cell: ({ row }) => {
        const estado = row.getValue('estado') as keyof typeof ESTADO_TAREA_LABELS;
        return (
          <Badge className='text-xs' variant={getEstadoBadgeVariant(estado)}>
            {ESTADO_TAREA_LABELS[estado]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'tipo',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Tipo' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='text-xs'>
          {TIPO_TAREA_LABELS[row.getValue('tipo') as keyof typeof TIPO_TAREA_LABELS]}
        </Badge>
      ),
    },
    {
      accessorKey: 'prioridad',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Prioridad' />
      ),
      cell: ({ row }) => {
        const prioridad = row.getValue('prioridad') as keyof typeof PRIORIDAD_LABELS;
        return (
          <Badge className='text-xs' variant={getPrioridadBadgeVariant(prioridad)}>
            {PRIORIDAD_LABELS[prioridad]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'tiempoEstMin',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Est.' />
      ),
      cell: ({ row }) => {
        const min = row.getValue('tiempoEstMin') as number | null;
        return <span className='text-sm'>{min ? `${min}min` : NULL_PLACEHOLDER}</span>;
      },
    },
    {
      accessorKey: 'vence',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Vence' />
      ),
      cell: ({ row }) => {
        const vence = row.getValue('vence') as string | null;
        if (!vence) return <span className='text-sm text-muted-foreground'>{NULL_PLACEHOLDER}</span>;

        const fecha = new Date(vence);
        const ahora = new Date();
        const diffDias = Math.ceil((fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));

        let color = 'text-green-600';
        if (diffDias < 0) color = 'text-red-600 font-semibold';
        else if (diffDias <= 7) color = 'text-orange-600';

        return (
          <span className={`text-sm ${color}`}>
            {fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </span>
        );
      },
    },
  ];
}
