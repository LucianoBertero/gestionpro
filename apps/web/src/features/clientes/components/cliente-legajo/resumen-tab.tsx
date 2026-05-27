'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/ui/semaforo-badge';
import { Icons } from '@/components/icons';
import type { ClienteLegajo } from '../../api/types';

interface ResumenTabProps {
  legajo: ClienteLegajo;
}

function FieldRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-muted-foreground text-xs font-medium'>
        {label}
      </span>
      <span className={mono ? 'font-mono text-sm' : 'text-sm'}>
        {value}
      </span>
    </div>
  );
}

export function ResumenTab({ legajo }: ResumenTabProps) {
  return (
    <div className='grid gap-6'>
      {/* Header Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-xl'>{legajo.denominacion}</CardTitle>
            <p className='text-muted-foreground text-sm'>
              CUIT:{' '}
              <span className='font-mono'>{legajo.cuit}</span>
            </p>
          </div>
          <SemaforoBadge value={legajo.semaforo} className='text-sm px-3 py-1' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <FieldRow label='Condición IVA' value={legajo.condicionIva} />
            <FieldRow
              label='Término'
              value={
                legajo.termino != null ? `${legajo.termino} meses` : null
              }
            />
            <FieldRow label='Encargado' value={legajo.encargadoNombre} />
            {legajo.supervisorNombre && (
              <FieldRow label='Supervisor' value={legajo.supervisorNombre} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <FieldRow label='Domicilio' value={legajo.domicilio} />
            <FieldRow label='Teléfono' value={legajo.telefono} />
            <FieldRow label='Email' value={legajo.email} />
            <FieldRow
              label='WhatsApp'
              value={legajo.whatsapp}
              mono
            />
          </div>
          {legajo.whatsapp && (
            <a
              href={`https://wa.me/${legajo.whatsapp}?text=${encodeURIComponent(`Hola ${legajo.denominacion}`)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-3 inline-flex items-center gap-1 text-sm text-green-600 hover:underline'
            >
              <Icons.phone className='h-4 w-4' /> Enviar WhatsApp
            </a>
          )}
        </CardContent>
      </Card>

      {/* Actividades */}
      {legajo.actividades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='list-disc pl-5 space-y-1'>
              {legajo.actividades.map((act, i) => (
                <li key={i} className='text-sm'>
                  {act}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
