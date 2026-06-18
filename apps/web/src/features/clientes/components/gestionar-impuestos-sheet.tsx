'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  TIPO_IMPUESTO_VALUES,
  TIPO_IMPUESTO_LABELS,
  type TipoImpuesto,
} from '@/constants';
import { useT } from '@/lib/i18n/client';

import { clientesKeys, legajoQueryOptions } from '../api/queries';
import { impuestosEstadoKeys } from '../api/queries-impuestos-estado';
import {
  addClienteImpuesto,
  removeClienteImpuesto,
  toggleClienteImpuesto,
} from '../api/service-cliente-impuesto';

interface GestionarImpuestosSheetProps {
  clienteId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tr = (key: string, fallback: string, options?: Record<string, string>) => string;

export function GestionarImpuestosSheet({
  clienteId,
  open,
  onOpenChange,
}: GestionarImpuestosSheetProps) {
  const t = useT();
  const tr: Tr = (key, fallback, options) => t(key, { defaultValue: fallback, ...options });
  const queryClient = useQueryClient();
  const { data: legajo, isLoading } = useQuery({
    ...legajoQueryOptions(clienteId),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: clientesKeys.legajo(clienteId) });
    queryClient.invalidateQueries({ queryKey: impuestosEstadoKeys.byCliente(clienteId) });
  };

  const addMutation = useMutation({
    mutationFn: (tipo: TipoImpuesto) => addClienteImpuesto(clienteId, tipo),
    onSuccess: () => {
      toast.success(tr('impuestoCliente.gestionar.added', 'Impuesto agregado'));
      invalidate();
    },
    onError: () =>
      toast.error(tr('impuestoCliente.gestionar.addError', 'No se pudo agregar el impuesto')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      clienteImpuestoId,
      activo,
    }: {
      clienteImpuestoId: number;
      activo: boolean;
    }) => toggleClienteImpuesto(clienteId, clienteImpuestoId, activo),
    onSuccess: (_, { activo }) => {
      toast.success(
        activo
          ? tr('impuestoCliente.gestionar.activated', 'Impuesto activado')
          : tr('impuestoCliente.gestionar.deactivated', 'Impuesto desactivado'),
      );
      invalidate();
    },
    onError: () =>
      toast.error(tr('impuestoCliente.gestionar.toggleError', 'No se pudo cambiar el estado')),
  });

  const removeMutation = useMutation({
    mutationFn: (clienteImpuestoId: number) =>
      removeClienteImpuesto(clienteId, clienteImpuestoId),
    onSuccess: () => {
      toast.success(tr('impuestoCliente.gestionar.removed', 'Impuesto eliminado'));
      invalidate();
    },
    onError: () =>
      toast.error(tr('impuestoCliente.gestionar.removeError', 'No se pudo eliminar el impuesto')),
  });

  // Mapa: tipo -> ClienteImpuesto del backend (puede ser undefined si no existe)
  const byTipo = new Map<TipoImpuesto, { id: number; activo: boolean }>();
  legajo?.impuestos.forEach((i) => byTipo.set(i.tipo, { id: i.id, activo: i.activo }));

  const isPending =
    addMutation.isPending ||
    toggleMutation.isPending ||
    removeMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='flex flex-col sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>
            {tr('impuestoCliente.gestionar.title', 'Gestionar Impuestos')}
          </SheetTitle>
          <SheetDescription>
            {tr('impuestoCliente.gestionar.description', 'Activá o desactivá los impuestos que el cliente declara.')}
            {' '}
            {tr('impuestoCliente.gestionar.descriptionHint', 'Los impuestos desactivados no se muestran en el legajo pero su historial se conserva.')}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6'>
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <div className='space-y-2'>
              {TIPO_IMPUESTO_VALUES.map((tipo) => {
                const current = byTipo.get(tipo);
                const exists = !!current;
                const isActive = current?.activo ?? false;
                const label = TIPO_IMPUESTO_LABELS[tipo];

                return (
                  <div
                    key={tipo}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex min-w-0 flex-col gap-1'>
                      <span className='font-medium'>{label}</span>
                      {exists && !isActive && (
                        <Badge variant='secondary' className='w-fit text-xs'>
                          {tr('impuestoCliente.gestionar.desactivado', 'Desactivado')}
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center gap-2'>
                      {exists ? (
                        <>
                          <Switch
                            checked={isActive}
                            disabled={isPending}
                            onCheckedChange={(checked) => {
                              if (!current) return;
                              toggleMutation.mutate({
                                clienteImpuestoId: current.id,
                                activo: checked,
                              });
                            }}
                          />
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-destructive hover:text-destructive h-8 w-8'
                            disabled={isPending}
                            onClick={() => {
                              if (!current) return;
                              if (
                                confirm(
                                  tr(
                                    'impuestoCliente.gestionar.confirmRemove',
                                    '¿Eliminar "{{label}}"? El historial de liquidaciones se conserva.',
                                    { label },
                                  ),
                                )
                              ) {
                                removeMutation.mutate(current.id);
                              }
                            }}
                            aria-label={tr(
                              'impuestoCliente.gestionar.removeLabel',
                              'Eliminar {{label}}',
                              { label },
                            )}
                          >
                            <Icons.trash className='h-4 w-4' />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isPending}
                          onClick={() => addMutation.mutate(tipo)}
                        >
                          {addMutation.isPending && addMutation.variables === tipo ? (
                            <Icons.spinner className='mr-1 h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <Icons.add className='mr-1 h-3.5 w-3.5' />
                          )}
                          {tr('impuestoCliente.gestionar.agregar', 'Agregar')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {tr('common.close', 'Cerrar')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
