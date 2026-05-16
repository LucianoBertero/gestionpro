'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { liquidacionesQueryOptions } from '../api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Liquidacion } from '../api/types';

const resultadoBadge: Record<string, string> = {
  A_PAGAR: 'bg-red-100 text-red-800',
  SALDO_A_FAVOR: 'bg-green-100 text-green-800',
  SIN_MOVIMIENTO: 'bg-gray-100 text-gray-600',
};

export function LiquidacionListing() {
  const { data } = useSuspenseQuery(liquidacionesQueryOptions());
  const liquidaciones = data?.data ?? [];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Últimas Liquidaciones</CardTitle></CardHeader>
      <CardContent>
        {liquidaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin liquidaciones cargadas</p>
        ) : (
          <div className="space-y-2">
            {liquidaciones.slice(0, 20).map((l: Liquidacion) => (
              <div key={l.id} className="flex items-center justify-between border-b pb-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{l.cliente?.denominacion ?? `Cliente #${l.clienteId}`}</span>
                  <Badge variant="outline" className="text-xs">{l.impuesto}</Badge>
                  <span className="text-muted-foreground">{l.periodo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={resultadoBadge[l.resultado] ? `text-xs px-2 py-0.5 rounded ${resultadoBadge[l.resultado]}` : ''}>
                    {l.resultado.replace('_', ' ')}
                  </span>
                  {l.importe != null && (
                    <span className="font-mono text-sm">${l.importe.toLocaleString('es-AR')}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{l.cargadoPor?.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
