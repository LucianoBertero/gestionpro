'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { useT } from '@/lib/i18n/client';
import { clavesClienteKeys } from '../../api/queries-clave-cliente';
import { createClaveCliente, updateClaveCliente } from '../../api/service-clave-cliente';
import { claveClienteSchema, type ClaveClienteFormValues } from '../../schemas/clave-cliente';
import type { ClaveCliente } from '../../api/types-clave-cliente';

interface Props {
  clienteId: number;
  clave?: ClaveCliente;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function ClaveClienteFormSheet({ clienteId, clave, open, onOpenChange }: Props) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });
  const isEdit = !!clave;

  const form = useForm<ClaveClienteFormValues>({
    resolver: zodResolver(claveClienteSchema),
    defaultValues: {
      entidad: clave?.entidad ?? '',
      clave: clave?.clave ?? '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      entidad: clave?.entidad ?? '',
      clave: clave?.clave ?? '',
    });
  }, [form, open, clave]);

  const createMut = useMutation({
    mutationFn: (values: ClaveClienteFormValues) => createClaveCliente(clienteId, values),
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: clavesClienteKeys.byCliente(clienteId) });
      toast.success(tr('claveCliente.created', 'Clave creada'));
      onOpenChange(false);
      form.reset();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? tr('claveCliente.createError', 'Error al crear clave');
      toast.error(msg);
    },
  });

  const updateMut = useMutation({
    mutationFn: (values: ClaveClienteFormValues) => updateClaveCliente(clienteId, clave!.id, values),
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: clavesClienteKeys.byCliente(clienteId) });
      toast.success(tr('claveCliente.updated', 'Clave actualizada'));
      onOpenChange(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? tr('claveCliente.updateError', 'Error al actualizar clave');
      toast.error(msg);
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;

  const onSubmit = (values: ClaveClienteFormValues) => {
    if (isEdit && clave) {
      updateMut.mutate(values);
    } else {
      createMut.mutate(values);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? tr('claveCliente.edit', 'Editar Clave') : tr('claveCliente.add', 'Nueva Clave')}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? tr('claveCliente.formEditDescription', 'Modificá los datos de la clave del cliente.')
              : tr('claveCliente.formAddDescription', 'Agregá una nueva credencial para este cliente.')}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='entidad'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr('claveCliente.entidad', 'Entidad')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={tr('claveCliente.entidadPlaceholder', 'AFIP, Rentas CABA, ANSES...')}
                        disabled={isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='clave'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr('claveCliente.contrasena', 'Contraseña')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder={tr('claveCliente.contrasenaPlaceholder', 'Ingresá la contraseña')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {tr('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isPending}>
            <Icons.check className='mr-1 h-4 w-4' />
            {isEdit ? tr('common.save', 'Guardar') : tr('claveCliente.createCta', 'Crear Clave')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
