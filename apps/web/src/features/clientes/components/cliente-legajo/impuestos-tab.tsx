'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TIPO_IMPUESTO_LABELS } from '@/constants';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { SOCIO } from '@/constants';

import { impuestosConEstadoQueryOptions } from '../../api/queries-impuestos-estado';
import type { ImpuestoConEstado } from '../../api/types-impuestos-estado';
import { ImpuestoDropdownMenu } from './impuesto-dropdown-menu';
import { StatusBadge } from './status-badge';

interface ImpuestosTabProps {
  clienteId: number;
}

function formatVencimiento(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  return format(new Date(iso), "d 'de' MMMM yyyy", { locale: es });
}

export function ImpuestosTab({ clienteId }: ImpuestosTabProps) {
  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === SOCIO;

  const { data: impuestos, isLoading } = useQuery(
    impuestosConEstadoQueryOptions(clienteId)
  );

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    );
  }

  if (!impuestos || impuestos.length === 0) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>
          Este cliente no tiene impuestos registrados.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-2'>
      {impuestos.map((imp) => (
        <ImpuestoRow
          key={imp.clienteImpuestoId}
          clienteId={clienteId}
          impuesto={imp}
          isSocio={isSocio}
        />
      ))}
    </div>
  );
}

interface ImpuestoRowProps {
  clienteId: number;
  impuesto: ImpuestoConEstado;
  isSocio: boolean;
}

function ImpuestoRow({ clienteId, impuesto, isSocio }: ImpuestoRowProps) {
  const label = TIPO_IMPUESTO_LABELS[impuesto.tipo] ?? impuesto.tipo;
  const venceTexto = formatVencimiento(impuesto.proximoVencimiento);

  return (
    <div className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/30'>
      <div className='flex min-w-0 flex-col gap-0.5'>
        <div className='flex items-center gap-3'>
          <span className='font-medium'>{label}</span>
          <span className='text-xs text-muted-foreground'>Vence: {venceTexto}</span>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <StatusBadge estado={impuesto.estado} />
        <ImpuestoDropdownMenu
          clienteId={clienteId}
          impuesto={impuesto}
          isSocio={isSocio}
        />
      </div>
    </div>
  );
}
