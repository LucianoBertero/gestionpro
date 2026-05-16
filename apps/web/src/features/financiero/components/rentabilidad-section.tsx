'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { rentabilidadQueryOptions } from '../api/queries';

export function RentabilidadSection() {
  const { data } = useSuspenseQuery(rentabilidadQueryOptions());
  const chartData = data ?? [];

  const totalGanancia = chartData.reduce((s, d) => s + d.ganancia, 0);
  const margen = chartData.reduce((s, d) => s + d.ingresos, 0) > 0
    ? ((totalGanancia / chartData.reduce((s, d) => s + d.ingresos, 0)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ingresos Totales</p>
          <p className="text-2xl font-bold">
            ${chartData.reduce((s, d) => s + d.ingresos, 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ganancia Neta</p>
          <p className="text-2xl font-bold text-green-600">${totalGanancia.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Margen</p>
          <p className="text-2xl font-bold">{margen}%</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium">Rentabilidad por Mes</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                name="Ingresos"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="costos"
                name="Costos"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="ganancia"
                name="Ganancia"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
