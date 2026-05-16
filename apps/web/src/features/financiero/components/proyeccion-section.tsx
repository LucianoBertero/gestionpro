'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { proyeccionQueryOptions } from '../api/queries';

export function ProyeccionSection() {
  const { data } = useSuspenseQuery(proyeccionQueryOptions());
  const chartData = data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium">Proyección a 6 Meses</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="real"
                name="Real"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="proyectado"
                name="Proyectado"
                stroke="#f59e0b"
                fill="#f59e0b / 0.15"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
