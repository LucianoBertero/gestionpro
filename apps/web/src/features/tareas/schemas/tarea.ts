import { z } from 'zod';

export const tareaFormSchema = z.object({
  clienteId: z.number().optional(),
  encargadoId: z.string().uuid('Seleccioná un encargado'),
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  descripcion: z.string().optional(),
  tipo: z.enum(['DDJJ', 'VEP', 'INTERNA', 'BALANCE', 'OTRO']),
  impuesto: z
    .enum(['AUTONOMOS', 'IVA', 'IIBB_LOCAL', 'MUNICIPAL', 'SUELDOS', 'MONOTRIBUTO', 'GANANCIAS'])
    .optional(),
  periodo: z.string().optional(),
  tiempoEstMin: z.number().min(5).optional(),
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']).default('MEDIA'),
  vence: z.string().optional(),
  esRecurrente: z.boolean().optional(),
  notas: z.string().optional(),
});

export type TareaFormValues = z.infer<typeof tareaFormSchema>;
