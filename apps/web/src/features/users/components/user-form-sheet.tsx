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
import { useMutationWithOptions } from '@/hooks/use-mutation-with-options';
import { useT } from '@/lib/i18n/client';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import { userKeys } from '../api/queries';
import type { User } from '../api/types';
import { toast } from 'sonner';
import { createUserSchema, updateUserSchema, type UserFormValues } from '../schemas/user';
import { ROLE_OPTIONS } from './users-table/options';

type Tr = (key: string, fallback: string) => string;

interface Props { user?: User; open: boolean; onOpenChange: (o: boolean) => void; }

export function UserFormSheet({ user, open, onOpenChange }: Props) {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
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

  const createMut = useMutationWithOptions(createUserMutation, {
    onSuccess: () => {
      toast.success(tr('user.created', 'Usuario creado'));
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error(tr('user.createError', 'Error al crear')),
  });
  const updateMut = useMutationWithOptions(updateUserMutation, {
    onSuccess: () => {
      toast.success(tr('user.updated', 'Usuario actualizado'));
      onOpenChange(false);
    },
    onError: () => toast.error(tr('user.updateError', 'Error al actualizar')),
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
          <SheetTitle>
            {isEdit ? tr('user.editUser', 'Editar Usuario') : tr('user.addUser', 'Agregar Usuario')}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? tr('user.formEditDescription', 'Modificá los datos del usuario.')
              : tr('user.formAddDescription', 'Completá los datos para crear un nuevo usuario.')}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='nombre' render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr('user.name', 'Nombre')} *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={tr('user.placeholder.nombre', 'Ernesto')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='emoji' render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr('user.emoji', 'Emoji')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={tr('user.placeholder.emoji', '👤')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name='email' render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr('user.email', 'Email')} *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder={tr('user.placeholder.email', 'ernesto@estudiobb.com')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='telefono' render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr('user.phone', 'Teléfono')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={tr('user.placeholder.telefono', '+54 11 5555-1234')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='role' render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr('user.role', 'Rol')} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tr('user.placeholder.role', 'Seleccionar rol')} />
                      </SelectTrigger>
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
                    <FormLabel>{tr('user.password', 'Contraseña')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder={tr('user.placeholder.password', 'Mínimo 6 caracteres')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </form>
          </Form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {tr('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isPending}>
            <Icons.check className='mr-1 h-4 w-4' />
            {isEdit ? tr('common.save', 'Guardar') : tr('user.create', 'Crear Usuario')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        {tr('user.newUser', 'Nuevo Usuario')}
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
