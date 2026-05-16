'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { honorariosQueryOptions } from '../api/queries';

export function HonorariosSection() {
  const { data } = useSuspenseQuery(honorariosQueryOptions());
  const chartData = data ?? [];

  const totalFacturado = chartData.reduce((s, d) => s + d.facturado, 0);
  const totalCobrado = chartData.reduce((s, d) => s + d.cobrado, 0);
  const tasaCobro = totalFacturado > 0 ? ((totalCobrado / totalFacturado) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Facturado</p>
          <p className="text-2xl font-bold">${totalFacturado.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Cobrado</p>
          <p className="text-2xl font-bold text-green-600">${totalCobrado.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tasa de Cobro</p>
          <p className="text-2xl font-bold">{tasaCobro}%</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium">Evolución de Honorarios</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="facturado" name="Facturado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cobrado" name="Cobrado" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendiente" name="Pendiente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
