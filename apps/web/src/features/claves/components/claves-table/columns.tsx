'use client';
import { useState } from 'react';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
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
    id: 'clave',
    accessorKey: 'clave',
    header: ({ column }: { column: Column<Clave, unknown> }) => (
      <DataTableColumnHeader column={column} title='Credencial' />
    ),
    cell: ({ row }) => {
      const [visible, setVisible] = useState(false);
      const value = row.original.clave;
      const obscured = '•'.repeat(12);

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success('Copiado', {
            description: `Clave de ${row.original.entidad} copiada al portapapeles`,
            duration: 2000,
          });
        } catch {
          toast.error('Error al copiar');
        }
      };

      return (
        <div className='flex items-center gap-1'>
          <span className='font-mono text-sm tracking-widest text-muted-foreground min-w-[96px]'>
            {visible ? value : obscured}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-muted-foreground hover:text-foreground'
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
          >
            {visible ? (
              <Icons.eyeOff className='h-3.5 w-3.5' />
            ) : (
              <Icons.eye className='h-3.5 w-3.5' />
            )}
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-muted-foreground hover:text-foreground'
            onClick={handleCopy}
            aria-label='Copiar clave'
          >
            <Icons.copy className='h-3.5 w-3.5' />
          </Button>
        </div>
      );
    },
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
