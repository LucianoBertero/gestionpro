import * as z from 'zod';
import { ROLES } from '@/constants';

export const baseUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresá un email válido'),
  emoji: z.string().optional(),
  telefono: z.string().optional(),
  role: z.enum(ROLES),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const updateUserSchema = baseUserSchema.extend({
  password: z.string().optional(),
});

export type UserFormValues = z.infer<typeof createUserSchema> | z.infer<typeof updateUserSchema>;
