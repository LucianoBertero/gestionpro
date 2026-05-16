'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClienteImpuesto, TipoImpuesto } from '../../api/types';

const TIPO_IMPUESTO_LABELS: Record<TipoImpuesto, string> = {
  AUTONOMOS: 'Autónomos',
  IVA: 'IVA',
  IIBB_LOCAL: 'IIBB Local',
  MUNICIPAL: 'Municipal',
  SUELDOS: 'Sueldos',
  MONOTRIBUTO: 'Monotributo',
  GANANCIAS: 'Ganancias',
};

interface ImpuestosTabProps {
  impuestos: ClienteImpuesto[];
}

export function ImpuestosTab({ impuestos }: ImpuestosTabProps) {
  if (impuestos.length === 0) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>
          No hay impuestos registrados para este cliente.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>
          Impuestos ({impuestos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {impuestos.map((imp) => (
            <div
              key={imp.id}
              className='flex items-center justify-between rounded-lg border p-3'
            >
              <div className='flex items-center gap-3'>
                <Badge variant='outline' className='text-sm'>
                  {TIPO_IMPUESTO_LABELS[imp.tipo] ?? imp.tipo}
                </Badge>
              </div>
              <Badge
                variant={imp.activo ? 'default' : 'secondary'}
                className='text-xs'
              >
                {imp.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
