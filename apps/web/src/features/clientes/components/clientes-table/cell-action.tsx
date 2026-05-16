'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteClienteMutation } from '../../api/mutations';
import type { Cliente } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClienteFormSheet } from '../cliente-form-sheet';
import { useRouter } from 'next/navigation';

interface CellActionProps {
  data: Cliente;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutation({
    ...deleteClienteMutation,
    onSuccess: () => {
      toast.success('Cliente eliminado correctamente');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Error al eliminar el cliente');
    },
  });

  const handleWhatsApp = () => {
    if (data.whatsapp) {
      const msg = encodeURIComponent(`Hola ${data.denominacion}`);
      window.open(`https://wa.me/${data.whatsapp}?text=${msg}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (data.email) {
      window.location.href = `mailto:${data.email}`;
    }
  };

  const handleViewLegajo = () => {
    router.push(`/dashboard/clientes/${data.id}`);
  };

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <ClienteFormSheet
        cliente={data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Abrir menú</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleViewLegajo}>
            <Icons.eye className='mr-2 h-4 w-4' /> Ver Legajo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Icons.edit className='mr-2 h-4 w-4' /> Editar
          </DropdownMenuItem>
          {data.whatsapp && (
            <DropdownMenuItem onClick={handleWhatsApp}>
              <Icons.phone className='mr-2 h-4 w-4' /> WhatsApp
            </DropdownMenuItem>
          )}
          {data.email && (
            <DropdownMenuItem onClick={handleEmail}>
              <Icons.send className='mr-2 h-4 w-4' /> Email
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-destructive focus:text-destructive'
          >
            <Icons.trash className='mr-2 h-4 w-4' /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
