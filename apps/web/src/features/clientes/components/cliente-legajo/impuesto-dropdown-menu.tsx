'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';

import {
  impuestosEstadoKeys,
  marcarImpuestoPresentado,
} from '../../api/queries-impuestos-estado';
import type { ImpuestoConEstado } from '../../api/types-impuestos-estado';
import { HistorialImpuestoSheet } from './historial-impuesto-sheet';

interface ImpuestoDropdownMenuProps {
  clienteId: number;
  impuesto: ImpuestoConEstado;
  isSocio: boolean;
}

export function ImpuestoDropdownMenu({
  clienteId,
  impuesto,
  isSocio,
}: ImpuestoDropdownMenuProps) {
  const queryClient = useQueryClient();
  const [historialOpen, setHistorialOpen] = useState(false);

  const marcarMutation = useMutation({
    mutationFn: () =>
      marcarImpuestoPresentado(clienteId, impuesto.clienteImpuestoId),
    onSuccess: () => {
      toast.success('Impuesto marcado como presentado');
      queryClient.invalidateQueries({
        queryKey: impuestosEstadoKeys.byCliente(clienteId),
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al marcar como presentado';
      toast.error(message);
    },
  });

  const yaPresentado = impuesto.estado === 'PRESENTADO';
  const isPending = marcarMutation.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            aria-label='Acciones del impuesto'
          >
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem
            disabled={!isSocio}
            onSelect={(e) => {
              e.preventDefault();
              toast.info('Funcionalidad próximamente: subir DDJJ con comprobante');
            }}
          >
            <Icons.upload className='mr-2 h-4 w-4' />
            Subir DDJJ
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!isSocio || yaPresentado || isPending}
            onSelect={(e) => {
              e.preventDefault();
              marcarMutation.mutate();
            }}
          >
            {isPending ? (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Icons.check className='mr-2 h-4 w-4' />
            )}
            {yaPresentado ? 'Ya presentado' : 'Marcar Presentado'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setHistorialOpen(true);
            }}
          >
            <Icons.clock className='mr-2 h-4 w-4' />
            Ver Historial
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <HistorialImpuestoSheet
        clienteId={clienteId}
        clienteImpuestoId={impuesto.clienteImpuestoId}
        tipo={impuesto.tipo}
        open={historialOpen}
        onOpenChange={setHistorialOpen}
      />
    </>
  );
}
