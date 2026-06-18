'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ColumnDef, Column } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClavesCliente, clavesClienteKeys } from '../../api/queries-clave-cliente';
import { deleteClaveCliente } from '../../api/service-clave-cliente';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getQueryClient } from '@/lib/query-client';
import { ClaveClienteFormSheet } from './clave-cliente-form-sheet';
import type { ClaveCliente } from '../../api/types-clave-cliente';

interface ClavesClienteTabProps {
  clienteId: number;
}

function ClaveCell({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const obscured = '•'.repeat(12);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copiado', {
        description: 'Clave copiada al portapapeles',
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
}

function CellAction({ data, clienteId, isSocio }: { data: ClaveCliente; clienteId: number; isSocio: boolean }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteClaveCliente(clienteId, data.id),
    onSuccess: () => {
      toast.success('Clave eliminada');
      setDeleteOpen(false);
      getQueryClient().invalidateQueries({ queryKey: clavesClienteKeys.byCliente(clienteId) });
    },
    onError: () => {
      toast.error('Error al eliminar clave');
    },
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
      <ClaveClienteFormSheet
        clienteId={clienteId}
        clave={data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      {isSocio && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Abrir menú</span>
              <Icons.ellipsis className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              <Icons.trash className='mr-2 h-4 w-4' /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}

export function ClavesClienteTab({ clienteId }: ClavesClienteTabProps) {
  const { data, isLoading } = useClavesCliente(clienteId);
  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === 'SOCIO';
  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<ClaveCliente>[] = [
    {
      id: 'entidad',
      accessorKey: 'entidad',
      header: ({ column }: { column: Column<ClaveCliente, unknown> }) => (
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
      header: ({ column }: { column: Column<ClaveCliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='Credencial' />
      ),
      cell: ({ row }) => <ClaveCell value={row.original.clave} />,
    },
    {
      accessorKey: 'creadoEn',
      header: ({ column }: { column: Column<ClaveCliente, unknown> }) => (
        <DataTableColumnHeader column={column} title='Creado' />
      ),
      cell: ({ cell }) => {
        const date = cell.getValue<ClaveCliente['creadoEn']>();
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
      cell: ({ row }) => (
        <CellAction data={row.original} clienteId={clienteId} isSocio={isSocio} />
      ),
    },
  ];

  const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];
  const pageCount = Math.max(1, Math.ceil((data?.length ?? 0) / 10));

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] },
    },
  });

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Claves del Cliente ({data?.length ?? 0})</h3>
        {isSocio && (
          <Button size='sm' onClick={() => setFormOpen(true)}>
            <Icons.add className='mr-1 h-4 w-4' /> Nueva Clave
          </Button>
        )}
      </div>

      {data && data.length > 0 ? (
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      ) : (
        <div className='text-muted-foreground flex h-32 items-center justify-center rounded-lg border text-sm'>
          No hay claves registradas para este cliente.
        </div>
      )}

      <ClaveClienteFormSheet
        clienteId={clienteId}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
