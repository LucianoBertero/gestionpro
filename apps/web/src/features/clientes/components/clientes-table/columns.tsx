'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { SemaforoBadge, semaforoDot } from '@/components/ui/semaforo-badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { useT } from '@/lib/i18n/client';
import { useMutationWithOptions } from '@/hooks/use-mutation-with-options';
import { CellAction } from './cell-action';
import { updateClienteMutation } from '../../api/mutations';
import { SEMAFORO_OPTIONS } from './options';
import type { Cliente, EstadoSemaforo } from '../../api/types';
import type { ActiveUser } from '@/features/auth/api/types';

function getEncargadoNombre(encargadoId: string, users: ActiveUser[]): string {
  const user = users.find((u) => u.id === encargadoId);
  return user?.nombre ?? encargadoId;
}

function SemaforoCell({ row }: { row: { original: Cliente } }) {
  const t = useT();
  const semaforo = row.original.semaforo;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(semaforo);

  const mutation = useMutationWithOptions(updateClienteMutation, {
    onSuccess: () => {
      toast.success(t('cliente.updateSuccess', 'Cliente actualizado'));
      setEditing(false);
    },
    onError: () => {
      toast.error(t('cliente.updateError', 'Error al actualizar el cliente'));
      setValue(semaforo);
    },
  });

  const handleChange = (newValue: string) => {
    setValue(newValue as EstadoSemaforo);
    mutation.mutate({ id: row.original.id, values: { semaforo: newValue as EstadoSemaforo } });
    setEditing(false);
  };

  const option = SEMAFORO_OPTIONS.find((o) => o.value === value);

  if (editing) {
    return (
      <Select
        open
        onOpenChange={(open) => {
          if (!open) setEditing(false);
        }}
        value={value}
        onValueChange={handleChange}
      >
        <SelectTrigger className='h-8 w-[140px]'>
          {option?.label ?? value}
        </SelectTrigger>
        <SelectContent>
          {SEMAFORO_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className='flex items-center gap-2'>
                <span className={`h-2 w-2 rounded-full ${semaforoDot[opt.value] ?? ''}`} />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      className='cursor-pointer transition-colors hover:ring-2 hover:ring-ring rounded-lg'
      onClick={() => setEditing(true)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditing(true);
        }
      }}
    >
      <SemaforoBadge value={value} />
    </span>
  );
}

export function getColumns(users: ActiveUser[]): ColumnDef<Cliente>[] {
  const t = (key: string, fallback: string) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return (useT())(key, fallback);
    } catch {
      return fallback;
    }
  };

  // We'll use a helper component approach instead of inline t()
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
      },
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
      },
    },
    {
      accessorKey: 'semaforo',
      enableSorting: false,
      header: ({ column }: { column: Column<Cliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='Semáforo' />
      ),
      cell: ({ row }) => <SemaforoCell row={row} />,
      meta: {
        label: 'Semáforo',
        options: SEMAFORO_OPTIONS,
      },
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => <CellAction data={row.original} />,
    },
  ];
}
