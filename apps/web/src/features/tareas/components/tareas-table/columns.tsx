'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Tarea } from '../../api/types';

const prioridadColors: Record<string, string> = {
  ALTA: 'bg-red-100 text-red-800 border-red-200',
  MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  BAJA: 'bg-green-100 text-green-800 border-green-200',
};

const estadoColors: Record<string, string> = {
  PENDIENTE: 'bg-slate-100 text-slate-800 border-slate-200',
  EN_PROCESO: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETADA: 'bg-green-100 text-green-800 border-green-200',
  CANCELADA: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const columns: ColumnDef<Tarea>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'titulo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate font-medium">
        {row.getValue('titulo')}
      </div>
    ),
  },
  {
    accessorKey: 'cliente',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => {
      const cliente = row.original.cliente;
      return (
        <span className="text-sm text-muted-foreground">
          {cliente?.denominacion ?? '—'}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.getValue('tipo')}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'encargado',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Encargado" />,
    cell: ({ row }) => {
      const encargado = row.original.encargado;
      return (
        <span className="text-sm">{encargado?.nombre ?? '—'}</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'tiempoEstMin',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Est." />,
    cell: ({ row }) => {
      const min = row.getValue('tiempoEstMin') as number | null;
      return <span className="text-sm">{min ? `${min}min` : '—'}</span>;
    },
  },
  {
    accessorKey: 'prioridad',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prioridad" />,
    cell: ({ row }) => {
      const prioridad = row.getValue('prioridad') as string;
      return (
        <Badge className={`border text-xs ${prioridadColors[prioridad] || ''}`} variant="outline">
          {prioridad}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string;
      return (
        <Badge className={`border text-xs ${estadoColors[estado] || ''}`} variant="outline">
          {estado}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'vence',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vence" />,
    cell: ({ row }) => {
      const vence = row.getValue('vence') as string | null;
      if (!vence) return <span className="text-sm text-muted-foreground">—</span>;

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
