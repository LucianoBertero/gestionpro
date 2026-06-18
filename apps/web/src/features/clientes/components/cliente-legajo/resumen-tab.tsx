'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/ui/semaforo-badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { ClienteLegajo } from '../../api/types';

interface ResumenTabProps {
  legajo: ClienteLegajo;
  onEdit?: () => void;
}

function FieldRow({
  label,
  value,
  icon,
  mono,
  link,
}: {
  label: string;
  value: string | null | undefined;
  icon?: ReactNode;
  mono?: boolean;
  link?: boolean;
}) {
  if (!value) return null;

  const href =
    link && label === 'Email'
      ? `mailto:${value}`
      : link && label === 'WhatsApp'
        ? `https://wa.me/${value}?text=${encodeURIComponent(`Hola ${value}`)}`
        : null;

  const content = (
    <span
      className={`flex items-center gap-1.5 ${mono ? 'font-mono text-sm' : 'text-sm'} ${link ? 'text-blue-600 hover:underline' : ''}`}
    >
      {value}
    </span>
  );

  return (
    <div className='flex flex-col gap-1'>
      <span className='text-muted-foreground flex items-center gap-1 text-xs font-medium'>
        {icon}
        {label}
      </span>
      {href ? (
        <a href={href} target={label === 'WhatsApp' ? '_blank' : undefined} rel='noopener noreferrer'>
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export function ResumenTab({ legajo, onEdit }: ResumenTabProps) {
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
          <div className='flex items-center gap-2'>
            <SemaforoBadge value={legajo.semaforo} className='text-sm px-3 py-1' />
            {onEdit && (
              <Button type='button' variant='outline' size='sm' onClick={onEdit}>
                <Icons.edit className='mr-2 h-4 w-4' />
                Editar datos
              </Button>
            )}
          </div>
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
          <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
            <FieldRow
              label='Domicilio Fiscal'
              value={legajo.domicilio}
              icon={<Icons.mapPin className='h-3.5 w-3.5 text-muted-foreground' />}
            />
            <FieldRow
              label='Teléfono'
              value={legajo.telefono}
              icon={<Icons.phone className='h-3.5 w-3.5 text-muted-foreground' />}
            />
            <FieldRow
              label='Email'
              value={legajo.email}
              icon={<Icons.mail className='h-3.5 w-3.5 text-muted-foreground' />}
              link
            />
            <FieldRow
              label='WhatsApp'
              value={legajo.whatsapp}
              icon={<Icons.chat className='h-3.5 w-3.5 text-green-600' />}
              mono
              link
            />
          </div>
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
