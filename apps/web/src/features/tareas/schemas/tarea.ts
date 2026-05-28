import { z } from 'zod';
import { TIPO_IMPUESTO_VALUES, PRIORIDAD_VALUES, TIPO_TAREA_VALUES } from '@/constants';

export const tareaFormSchema = z.object({
  clienteId: z.number().optional(),
  encargadoId: z.string().uuid('Seleccioná un encargado'),
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  descripcion: z.string().optional(),
  tipo: z.enum(TIPO_TAREA_VALUES),
  impuesto: z.enum(TIPO_IMPUESTO_VALUES).optional(),
  periodo: z.string().optional(),
  tiempoEstMin: z.number().min(5).optional(),
  prioridad: z.enum(PRIORIDAD_VALUES).default('MEDIA'),
  vence: z.string().optional(),
  esRecurrente: z.boolean().optional(),
  notas: z.string().optional(),
});

export type TareaFormValues = z.infer<typeof tareaFormSchema>;
