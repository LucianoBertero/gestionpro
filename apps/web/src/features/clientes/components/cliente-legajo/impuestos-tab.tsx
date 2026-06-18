'use client';

import { useQuery } from '@tanstack/react-query';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TIPO_IMPUESTO_LABELS, SOCIO } from '@/constants';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useT } from '@/lib/i18n/client';
import { formatDateLong } from '@/lib/format';

import { impuestosConEstadoQueryOptions } from '../../api/queries-impuestos-estado';
import type { ImpuestoConEstado } from '../../api/types-impuestos-estado';
import { ImpuestoDropdownMenu } from './impuesto-dropdown-menu';
import { StatusBadge } from './status-badge';

interface ImpuestosTabProps {
  clienteId: number;
}

type Tr = (key: string, fallback: string) => string;

function formatVencimiento(iso: string | null, tr: Tr): string {
  if (!iso) return tr('impuestoCliente.sinFecha', 'Sin fecha');
  return formatDateLong(iso);
}

export function ImpuestosTab({ clienteId }: ImpuestosTabProps) {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === SOCIO;

  const { data: impuestos, isLoading } = useQuery(
    impuestosConEstadoQueryOptions(clienteId),
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
        <CardContent className='text-muted-foreground py-8 text-center'>
          {tr('impuestoCliente.noResults', 'Este cliente no tiene impuestos registrados.')}
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
          tr={tr}
        />
      ))}
    </div>
  );
}

interface ImpuestoRowProps {
  clienteId: number;
  impuesto: ImpuestoConEstado;
  isSocio: boolean;
  tr: Tr;
}

function ImpuestoRow({ clienteId, impuesto, isSocio, tr }: ImpuestoRowProps) {
  const label = TIPO_IMPUESTO_LABELS[impuesto.tipo] ?? impuesto.tipo;
  const venceTexto = formatVencimiento(impuesto.proximoVencimiento, tr);

  return (
    <div className='hover:bg-accent/30 flex items-center justify-between rounded-lg border p-3 transition-colors'>
      <div className='flex min-w-0 flex-col gap-0.5'>
        <div className='flex items-center gap-3'>
          <span className='font-medium'>{label}</span>
          <span className='text-muted-foreground text-xs'>
            {tr('impuestoCliente.vence', 'Vence')}: {venceTexto}
          </span>
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
