'use client';

import { useEffect, useState } from 'react';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { COLABORADOR } from '@/constants';
import { useMutation } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import { userKeys } from '../api/queries';
import type { User } from '../api/types';
import { toast } from 'sonner';
import { createUserSchema, updateUserSchema, type UserFormValues } from '../schemas/user';
import { ROLE_OPTIONS } from './users-table/options';

interface Props { user?: User; open: boolean; onOpenChange: (o: boolean) => void; }

export function UserFormSheet({ user, open, onOpenChange }: Props) {
  const isEdit = !!user;
  const schema = isEdit ? updateUserSchema : createUserSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: user?.nombre ?? '',
      email: user?.email ?? '',
      emoji: user?.emoji ?? '👤',
      telefono: user?.telefono ?? '',
      role: user?.role ?? COLABORADOR,
      password: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      nombre: user?.nombre ?? '',
      email: user?.email ?? '',
      emoji: user?.emoji ?? '👤',
      telefono: user?.telefono ?? '',
      role: user?.role ?? COLABORADOR,
      password: '',
    });
  }, [form, open, user]);

  const createMut = useMutation({
    ...createUserMutation,
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: userKeys.all });
      toast.success('Usuario creado');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Error al crear'),
  });
  const updateMut = useMutation({
    ...updateUserMutation,
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: userKeys.all });
      toast.success('Usuario actualizado');
      onOpenChange(false);
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const isPending = createMut.isPending || updateMut.isPending;

  const onSubmit = (values: UserFormValues) => {
    if (isEdit) {
      const { password, ...rest } = values;
      updateMut.mutate({ id: user.id, values: rest });
    } else {
      createMut.mutate(values as any);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Modificá los datos del usuario.' : 'Completá los datos para crear un nuevo usuario.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='nombre' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl><Input {...field} placeholder='Ernesto' /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='emoji' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl><Input {...field} placeholder='👤' /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name='email' render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input {...field} type='email' placeholder='ernesto@estudiobb.com' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='telefono' render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl><Input {...field} placeholder='+54 11 5555-1234' /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='role' render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder='Seleccionar rol' /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {!isEdit && (
                <FormField control={form.control} name='password' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl><Input {...field} type='password' placeholder='Mínimo 6 caracteres' /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </form>
          </Form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isPending}>
            <Icons.check className='mr-1 h-4 w-4' /> {isEdit ? 'Guardar' : 'Crear Usuario'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}><Icons.add className='mr-2 h-4 w-4' /> Nuevo Usuario</Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
