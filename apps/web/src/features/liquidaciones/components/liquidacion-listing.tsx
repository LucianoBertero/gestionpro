'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { liquidacionesQueryOptions } from '../api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RESULTADO_LABELS, getResultadoBadgeVariant } from '@/constants';
import type { Liquidacion } from '../api/types';

export function LiquidacionListing() {
  const { data, isLoading } = useQuery(liquidacionesQueryOptions());
  const liquidaciones = data?.data ?? [];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Últimas Liquidaciones</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>
        ) : liquidaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin liquidaciones cargadas</p>
        ) : (
          <div className="space-y-2">
            {liquidaciones.slice(0, 20).map((l: Liquidacion) => (
              <div key={l.id} className="flex items-center justify-between border-b pb-2 text-sm">
                <div className="flex items-center gap-2">
                  {l.cliente ? (
                    <Link
                      href={`/dashboard/clientes/${l.cliente.id}`}
                      className="font-medium hover:text-foreground hover:underline"
                    >
                      {l.cliente.denominacion}
                    </Link>
                  ) : (
                    <span className="font-medium">Cliente #{l.clienteId}</span>
                  )}
                  <Badge variant="outline" className="text-xs">{l.impuesto}</Badge>
                  <span className="text-muted-foreground">{l.periodo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getResultadoBadgeVariant(l.resultado)}>
                    {RESULTADO_LABELS[l.resultado]}
                  </Badge>
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
