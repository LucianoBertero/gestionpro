import { z } from 'zod';

export const claveClienteSchema = z.object({
  entidad: z.string().min(1, 'La entidad es requerida').max(100),
  clave: z.string().min(1, 'La clave es requerida').max(500),
});

export type ClaveClienteFormValues = z.infer<typeof claveClienteSchema>;
