import { z } from 'zod';

export const claveSchema = z.object({
  entidad: z.string().min(1, 'La entidad es obligatoria').max(100, 'Máximo 100 caracteres'),
  clave: z.string().min(1, 'La clave es obligatoria').max(500, 'Máximo 500 caracteres'),
});

export const updateClaveSchema = z.object({
  entidad: z.string().min(1).max(100).optional(),
  clave: z.string().min(1).max(500).optional(),
});

export type ClaveFormValues = z.infer<typeof claveSchema>;
