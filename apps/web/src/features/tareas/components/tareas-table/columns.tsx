'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import type { Column, ColumnDef } from '@tanstack/react-table';
import {
  getPrioridadBadgeVariant,
  getEstadoBadgeVariant,
  PRIORIDAD_LABELS,
  PRIORIDAD_VALUES,
  ESTADO_TAREA_LABELS,
  ESTADO_TAREA_VALUES,
  TIPO_TAREA_LABELS,
  TIPO_TAREA_VALUES,
  NULL_PLACEHOLDER,
} from '@/constants';
import type { Tarea } from '../../api/types';
import type { ActiveUser } from '@/features/auth/api/types';
import { EditableSelectCell } from './editable-cell';
import type { UpdateTareaPayload } from '../../api/types';

function getEncargadoNombre(encargadoId: string, users: ActiveUser[]): string {
  const user = users.find((u) => u.id === encargadoId);
  return user?.nombre ?? encargadoId;
}

/**
 * Callback for inline field editing. Receives the tarea id and a partial
 * payload that will be sent via updateTareaMutation.
 */
export type OnUpdateField = (
  tareaId: number,
  values: Pick<UpdateTareaPayload, 'estado' | 'prioridad' | 'tipo'>
) => void;

export function getColumns(
  users: ActiveUser[],
  onUpdateField?: OnUpdateField
): ColumnDef<Tarea>[] {
  return [
    {
      accessorKey: 'titulo',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Tarea' />
      ),
      cell: ({ row }) => {
        const cliente = row.original.cliente;
        return (
          <div className='flex max-w-[220px] flex-col'>
            <span className='font-medium'>{row.original.titulo}</span>
            <span className='text-muted-foreground text-xs'>
              {cliente ? (
                <Link
                  href={`/dashboard/clientes/${cliente.id}`}
                  className='hover:text-foreground hover:underline'
                >
                  {cliente.denominacion}
                </Link>
              ) : (
                NULL_PLACEHOLDER
              )}
            </span>
          </div>
        );
      },
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

        if (!onUpdateField) {
          return (
            <Badge className='text-xs' variant={getEstadoBadgeVariant(estado)}>
              {ESTADO_TAREA_LABELS[estado]}
            </Badge>
          );
        }

        const options = ESTADO_TAREA_VALUES.map((v) => ({
          value: v,
          label: ESTADO_TAREA_LABELS[v],
        }));

        return (
          <EditableSelectCell
            value={estado}
            options={options}
            onChange={(newVal) =>
              onUpdateField(row.original.id, { estado: newVal })
            }
            renderBadge={(v) => (
              <Badge className='text-xs' variant={getEstadoBadgeVariant(v)}>
                {ESTADO_TAREA_LABELS[v]}
              </Badge>
            )}
          />
        );
      },
    },
    {
      accessorKey: 'tipo',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Tipo' />
      ),
      cell: ({ row }) => {
        const tipo = row.getValue('tipo') as keyof typeof TIPO_TAREA_LABELS;

        if (!onUpdateField) {
          return (
            <Badge variant='outline' className='text-xs'>
              {TIPO_TAREA_LABELS[tipo]}
            </Badge>
          );
        }

        const options = TIPO_TAREA_VALUES.map((v) => ({
          value: v,
          label: TIPO_TAREA_LABELS[v],
        }));

        return (
          <EditableSelectCell
            value={tipo}
            options={options}
            onChange={(newVal) =>
              onUpdateField(row.original.id, { tipo: newVal })
            }
            renderBadge={(v) => (
              <Badge variant='outline' className='text-xs'>
                {TIPO_TAREA_LABELS[v]}
              </Badge>
            )}
          />
        );
      },
    },
    {
      accessorKey: 'prioridad',
      header: ({ column }: { column: Column<Tarea, unknown> }) => (
        <DataTableColumnHeader column={column} title='Prioridad' />
      ),
      cell: ({ row }) => {
        const prioridad = row.getValue('prioridad') as keyof typeof PRIORIDAD_LABELS;

        if (!onUpdateField) {
          return (
            <Badge className='text-xs' variant={getPrioridadBadgeVariant(prioridad)}>
              {PRIORIDAD_LABELS[prioridad]}
            </Badge>
          );
        }

        const options = PRIORIDAD_VALUES.map((v) => ({
          value: v,
          label: PRIORIDAD_LABELS[v],
        }));

        return (
          <EditableSelectCell
            value={prioridad}
            options={options}
            onChange={(newVal) =>
              onUpdateField(row.original.id, { prioridad: newVal })
            }
            renderBadge={(v) => (
              <Badge className='text-xs' variant={getPrioridadBadgeVariant(v)}>
                {PRIORIDAD_LABELS[v]}
              </Badge>
            )}
          />
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
