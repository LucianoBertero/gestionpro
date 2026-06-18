'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/ui/semaforo-badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import type { ClienteLegajo } from '../../api/types';

interface ResumenTabProps {
  legajo: ClienteLegajo;
  onEdit?: () => void;
}

type FieldKey =
  | 'cuit'
  | 'condicionIva'
  | 'termino'
  | 'encargado'
  | 'supervisor'
  | 'domicilioFiscal'
  | 'telefono'
  | 'email'
  | 'whatsapp';

function FieldRow({
  fieldKey,
  value,
  icon,
  mono,
  link,
  tr,
}: {
  fieldKey: FieldKey;
  value: string | null | undefined;
  icon?: ReactNode;
  mono?: boolean;
  link?: boolean;
  tr: (key: string, fallback: string) => string;
}) {
  if (!value) return null;

  const label = tr(`cliente.field.${fieldKey}`, fieldKey);

  const href =
    link && fieldKey === 'email'
      ? `mailto:${value}`
      : link && fieldKey === 'whatsapp'
        ? `https://wa.me/${value}?text=${encodeURIComponent(
            tr('cliente.whatsappGreeting', 'Hola') + ' ' + value,
          )}`
        : null;

  const content = (
    <span
      className={cn(
        'flex items-center gap-1.5',
        mono ? 'font-mono text-sm' : 'text-sm',
        link && 'text-blue-600 hover:underline',
      )}
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
        <a
          href={href}
          target={fieldKey === 'whatsapp' ? '_blank' : undefined}
          rel='noopener noreferrer'
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export function ResumenTab({ legajo, onEdit }: ResumenTabProps) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  return (
    <div className='grid gap-6'>
      {/* Header Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-xl'>{legajo.denominacion}</CardTitle>
            <p className='text-muted-foreground text-sm'>
              {tr('cliente.field.cuit', 'CUIT')}:{' '}
              <span className='font-mono'>{legajo.cuit}</span>
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <SemaforoBadge value={legajo.semaforo} className='text-sm px-3 py-1' />
            {onEdit && (
              <Button type='button' variant='outline' size='sm' onClick={onEdit}>
                <Icons.edit className='mr-2 h-4 w-4' />
                {tr('cliente.editDatos', 'Editar datos')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <FieldRow fieldKey='condicionIva' value={legajo.condicionIva} tr={tr} />
            <FieldRow
              fieldKey='termino'
              value={legajo.termino != null ? `${legajo.termino} ${tr('cliente.terminoUnit', 'meses')}` : null}
              tr={tr}
            />
            <FieldRow fieldKey='encargado' value={legajo.encargadoNombre} tr={tr} />
            {legajo.supervisorNombre && (
              <FieldRow fieldKey='supervisor' value={legajo.supervisorNombre} tr={tr} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{tr('cliente.contacto', 'Contacto')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
            <FieldRow
              fieldKey='domicilioFiscal'
              value={legajo.domicilio}
              icon={<Icons.mapPin className='text-muted-foreground h-3.5 w-3.5' />}
              tr={tr}
            />
            <FieldRow
              fieldKey='telefono'
              value={legajo.telefono}
              icon={<Icons.phone className='text-muted-foreground h-3.5 w-3.5' />}
              tr={tr}
            />
            <FieldRow
              fieldKey='email'
              value={legajo.email}
              icon={<Icons.mail className='text-muted-foreground h-3.5 w-3.5' />}
              link
              tr={tr}
            />
            <FieldRow
              fieldKey='whatsapp'
              value={legajo.whatsapp}
              icon={<Icons.chat className='h-3.5 w-3.5 text-green-600' />}
              mono
              link
              tr={tr}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actividades */}
      {legajo.actividades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              {tr('cliente.actividades', 'Actividades')}
            </CardTitle>
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
