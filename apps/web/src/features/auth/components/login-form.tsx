'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';

const loginSchema = z.object({
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  email: string;
  nombre: string;
  emoji: string | null;
  onBack: () => void;
}

function LoginForm({ email, nombre, emoji, onBack }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(email, values.password);
    } catch {
      form.setError('password', { message: 'Contraseña incorrecta. Intentá de nuevo.' });
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader className='text-center'>
        <span className='text-5xl leading-none' role='img' aria-label={nombre}>
          {emoji || '👤'}
        </span>
        <CardTitle className='mt-3'>{nombre}</CardTitle>
        <CardDescription>Ingresá tu contraseña para continuar</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField control={form.control} name='password' render={({ field }) => (
              <FormItem>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      autoFocus
                      className='pr-10'
                    />
                  </FormControl>
                  <button
                    type='button'
                    onClick={() => setShowPassword(p => !p)}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors'
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <Icons.eyeOff className='h-4 w-4' /> : <Icons.eye className='h-4 w-4' />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
          <CardFooter className='flex flex-col gap-2'>
            <Button type='submit' className='w-full' isLoading={isLoading}>Ingresar</Button>
            <Button type='button' variant='ghost' className='w-full' onClick={onBack}>
              <Icons.chevronLeft className='h-4 w-4' /> Volver
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export { LoginForm };
