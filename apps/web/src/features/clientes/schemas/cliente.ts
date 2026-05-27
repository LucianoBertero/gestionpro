import * as z from 'zod';
import { isValidCuit, formatCuit } from '@/lib/utils/cuit';

export const tipoImpuestoSchema = z.enum([
  'AUTONOMOS',
  'IVA',
  'IIBB_LOCAL',
  'MUNICIPAL',
  'SUELDOS',
  'MONOTRIBUTO',
  'GANANCIAS',
]);

export const terminoOptions = [
  { value: '0', label: '0 meses' },
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
] as const;

export const clienteSchema = z.object({
  denominacion: z.string().min(1, 'La denominación es requerida').max(200),
  cuit: z
    .string()
    .min(1, 'El CUIT es requerido')
    .refine((cuit) => isValidCuit(cuit), 'El CUIT debe tener 11 dígitos')
    .transform((cuit) => formatCuit(cuit)),
  condicionIva: z.string().min(1, 'La condición de IVA es requerida'),
  termino: z.string().optional(),
  encargadoId: z.string().min(1, 'El encargado es requerido'),
  supervisorId: z.string().optional(),
  tipoImpuesto: z.array(tipoImpuestoSchema).optional().default([]),
  actividades: z.array(z.string()).optional().default([]),
  domicilio: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  notas: z.string().optional(),
  honorarioMensual: z.coerce.number().min(0, 'El honorario debe ser positivo').optional(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
