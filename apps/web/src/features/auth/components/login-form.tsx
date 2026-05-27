'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';

const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
    } catch {
      form.setError('root', { message: 'Email o contraseña incorrectos.' });
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader className='text-center'>
        <span className='text-5xl leading-none' role='img' aria-label='Estudio BB'>
          🏢
        </span>
        <CardTitle className='mt-3'>GestiónPro</CardTitle>
        <CardDescription>Ingresá tu email y contraseña para continuar</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='nombre@estudio.com'
                      autoFocus
                      autoComplete='email'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        autoComplete='current-password'
                        className='pr-10'
                      />
                    </FormControl>
                    <button
                      type='button'
                      onClick={() => setShowPassword((p) => !p)}
                      className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors'
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <Icons.eyeOff className='h-4 w-4' /> : <Icons.eye className='h-4 w-4' />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className='text-destructive text-sm text-center'>
                {form.formState.errors.root.message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' isLoading={isLoading}>
              Ingresar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export { LoginForm };
