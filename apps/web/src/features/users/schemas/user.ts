import * as z from 'zod';

export const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresá un email válido'),
  emoji: z.string().optional(),
  telefono: z.string().optional(),
  role: z.enum(['SOCIO', 'COLABORADOR']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;
