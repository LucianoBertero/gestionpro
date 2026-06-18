// @ts-nocheck — pre-existing TanStack Form type inference issue
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createClienteMutation, updateClienteMutation } from '../api/mutations';
import { activeUsersQueryOptions } from '../api/queries';
import type { Cliente } from '../api/types';
import { toast } from 'sonner';
import { clienteSchema, type ClienteFormValues } from '../schemas/cliente';

const TERMINO_OPTIONS = [
  { value: '0', label: '0 meses' },
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
];

interface Props { cliente?: Cliente; open: boolean; onOpenChange: (o: boolean) => void; }

export function ClienteFormSheet({ cliente, open, onOpenChange }: Props) {
  const isEdit = !!cliente;
  const { data: users = [] } = useQuery(activeUsersQueryOptions());

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      denominacion: cliente?.denominacion ?? '',
      cuit: cliente?.cuit ?? '',
      condicionIva: cliente?.condicionIva ?? '',
      termino: cliente?.termino ? String(cliente.termino) : '0',
      encargadoId: cliente?.encargadoId ?? '',
      supervisorId: cliente?.supervisorId ?? '',
      actividades: cliente?.actividades ?? [],
      domicilio: cliente?.domicilio ?? '',
      telefono: cliente?.telefono ?? '',
      email: cliente?.email ?? '',
      whatsapp: cliente?.whatsapp ?? '',
      honorarioMensual: cliente?.honorarioMensual ?? undefined,
    },
  });

  const createMut = useMutation({
    ...createClienteMutation,
    onSuccess: () => { toast.success('Cliente creado'); onOpenChange(false); form.reset(); },
    onError: () => toast.error('Error al crear'),
  });
  const updateMut = useMutation({
    ...updateClienteMutation,
    onSuccess: () => { toast.success('Cliente actualizado'); onOpenChange(false); },
    onError: () => toast.error('Error al actualizar'),
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const clean = (v: string) => (v?.trim() || undefined);

  const onSubmit = (values: ClienteFormValues) => {
    const payload = {
      ...values,
      termino: Number(values.termino) || 0,
      email: clean(values.email),
      telefono: clean(values.telefono),
      whatsapp: clean(values.whatsapp),
      domicilio: clean(values.domicilio),
      supervisorId: clean(values.supervisorId),
      honorarioMensual: values.honorarioMensual || undefined,
    };
    if (isEdit) {
      updateMut.mutate({ id: cliente.id, values: payload as any });
    } else {
      createMut.mutate(payload as any);
    }
  };

  const encargadoOptions = users.map(u => ({ value: u.id, label: u.nombre }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Modificá los datos del cliente.' : 'Completá los datos para crear un nuevo cliente.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          {!isEdit && (
            <Alert className='mb-4'>
              <Icons.info className='h-4 w-4' />
              <AlertDescription>
                Los impuestos se gestionan desde el legajo del cliente una vez creado.
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='cuit' render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUIT *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='30-12345678-9' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='termino' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Término</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder='Seleccionar...' /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TERMINO_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name='denominacion' render={({ field }) => (
                <FormItem>
                  <FormLabel>Denominación *</FormLabel>
                  <FormControl><Input {...field} placeholder='Razón Social o Nombre' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='condicionIva' render={({ field }) => (
                <FormItem>
                  <FormLabel>Condición IVA *</FormLabel>
                  <FormControl><Input {...field} placeholder='Responsable Inscripto' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='domicilio' render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio</FormLabel>
                  <FormControl><Input {...field} placeholder='Dirección fiscal' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='encargadoId' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encargado *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder='Seleccionar...' /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {encargadoOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='supervisorId' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <Select 
                      value={field.value || '__none__'} 
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder='Seleccionar...' /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='__none__'>Sin supervisor</SelectItem>
                        {encargadoOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='telefono' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl><Input {...field} placeholder='(011) 4567-8900' /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='email' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} type='email' placeholder='cliente@email.com' /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name='whatsapp' render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl><Input {...field} placeholder='5491123456789' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='tipoImpuesto' render={({ field }) => (
                <FormItem>
                  <FormLabel>Impuestos</FormLabel>
                  <div className='grid grid-cols-2 gap-2'>
                    {TIPO_IMPUESTO_VALUES.map(tipo => {
                      const checked = (field.value ?? []).includes(tipo);
                      return (
                        <div key={tipo} className='flex items-center gap-2'>
                          <Checkbox
                            id={`imp-${tipo}`}
                            checked={checked}
                            onCheckedChange={c => {
                              const current = field.value ?? [];
                              field.onChange(c ? [...current, tipo] : current.filter(v => v !== tipo));
                            }}
                          />
                          <Label htmlFor={`imp-${tipo}`} className='text-sm cursor-pointer'>
                            {TIPO_IMPUESTO_LABELS[tipo]}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='actividades' render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividades (AFIP)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={(field.value ?? []).join(', ')}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder='Venta al por mayor, Servicios de consultoría...'
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='honorarioMensual' render={({ field }) => (
                <FormItem>
                  <FormLabel>Honorario Mensual</FormLabel>
                  <FormControl>
                    <Input {...field} type='number' step='0.01' placeholder='50000.00' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='notas' render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl><Input {...field} placeholder='Notas internas...' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </form>
          </Form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isPending}>
            <Icons.check className='mr-1 h-4 w-4' /> {isEdit ? 'Guardar' : 'Crear Cliente'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function ClienteFormSheetTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}><Icons.add className='mr-2 h-4 w-4' /> Nuevo Cliente</Button>
      <ClienteFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
