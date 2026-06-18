'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMutationWithOptions } from '@/hooks/use-mutation-with-options';
import { deleteClienteMutation } from '../../api/mutations';
import { ClienteFormSheet } from '../cliente-form-sheet';
import type { Cliente } from '../../api/types';
import { Icons } from '@/components/icons';

interface CellActionProps {
  data: Cliente;
}

export function CellAction({ data }: CellActionProps) {
  const t = useT();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutationWithOptions(deleteClienteMutation, {
    onSuccess: () => {
      toast.success(t('cliente.deleteSuccess', 'Cliente eliminado correctamente'));
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error(t('cliente.deleteError', 'Error al eliminar el cliente'));
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
      <TooltipProvider delayDuration={300}>
      <div className='flex items-center gap-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => router.push(`/dashboard/clientes/${data.id}`)}
            >
              <Icons.eye className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('cliente.viewLegajo', 'Ver legajo')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => setEditOpen(true)}
            >
              <Icons.edit className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.edit', 'Editar')}</TooltipContent>
        </Tooltip>

        {data.whatsapp && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={handleWhatsApp}
              >
                <Icons.phone className='h-3.5 w-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('cliente.sendWhatsApp', 'Enviar WhatsApp')}</TooltipContent>
          </Tooltip>
        )}

        {data.email && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={handleEmail}
              >
                <Icons.send className='h-3.5 w-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('cliente.sendEmail', 'Enviar email')}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={() => setDeleteOpen(true)}
            >
              <Icons.trash className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.delete', 'Eliminar')}</TooltipContent>
        </Tooltip>
      </div>
      </TooltipProvider>
    </>
  );
}
