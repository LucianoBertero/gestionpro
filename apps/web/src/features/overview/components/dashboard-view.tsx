'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { metricasQueryOptions, semaforosQueryOptions, tareasColaboradorQueryOptions, vencimientosSemanaQueryOptions } from '@/features/dashboard/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { NULL_PLACEHOLDER } from '@/constants';
import { PasswordManagerCard } from './password-manager-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = { VERDE: '#22c55e', AMARILLO: '#eab308', ROJO: '#ef4444' };

export function DashboardView() {
  const { data: metricas } = useSuspenseQuery(metricasQueryOptions());
  const { data: semaforos } = useSuspenseQuery(semaforosQueryOptions());
  const { data: tareasColab } = useSuspenseQuery(tareasColaboradorQueryOptions());
  const { data: vencimientos } = useSuspenseQuery(vencimientosSemanaQueryOptions());

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Icons.teams className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.totalClientes ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total cartera</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Icons.forms className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.tareasPendientes ?? 0}</div>
            <p className="text-xs text-muted-foreground">Sin completar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <Icons.toastWarning className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metricas?.tareasUrgentes ?? 0}</div>
            <p className="text-xs text-muted-foreground">Prioridad alta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <Icons.notification className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metricas?.alertasSemaforo ?? 0}</div>
            <p className="text-xs text-muted-foreground">Semáforo rojo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Semáforos Pie Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Distribución de Cartera</CardTitle></CardHeader>
          <CardContent>
            {semaforos && (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[
                    { name: 'Verde', value: semaforos.verde },
                    { name: 'Amarillo', value: semaforos.amarillo },
                    { name: 'Rojo', value: semaforos.rojo },
                  ]} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill={COLORS.VERDE} />
                    <Cell fill={COLORS.AMARILLO} />
                    <Cell fill={COLORS.ROJO} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tareas por Colaborador */}
        <Card>
          <CardHeader><CardTitle className="text-base">Carga por Colaborador</CardTitle></CardHeader>
          <CardContent>
            {tareasColab && tareasColab.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tareasColab}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pendientes" name="Pendientes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alta" name="Urgentes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin tareas pendientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vencimientos + Claves */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Vencimientos Próximos 7 Días</CardTitle></CardHeader>
          <CardContent>
            {vencimientos && vencimientos.length > 0 ? (
              <div className="space-y-2">
                {vencimientos.slice(0, 10).map((v) => (
                  <div key={v.id} className="flex items-center justify-between border-b pb-2 text-sm">
                    <div>
                      <span className="font-medium">{v.titulo}</span>
                      <span className="text-muted-foreground ml-2">
                        {v.cliente?.denominacion ?? 'Sin cliente'} — {v.encargado.nombre}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {v.vence ? new Date(v.vence).toLocaleDateString('es-AR') : NULL_PLACEHOLDER}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Sin vencimientos próximos</p>
            )}
          </CardContent>
        </Card>

        <PasswordManagerCard />
      </div>
    </div>
  );
}
