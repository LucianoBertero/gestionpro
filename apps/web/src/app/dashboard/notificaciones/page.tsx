'use client';

import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import {
  notificacionesQueryOptions,
  notificacionesKeys,
} from '@/features/notificaciones/api/queries';
import { marcarLeida } from '@/features/notificaciones/api/service';
import type { Notificacion } from '@/features/notificaciones/api/types';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoColors: Record<string, string> = {
  VENCIMIENTO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  TAREA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SISTEMA: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function NotificacionesPage() {
  const router = useRouter();
  const { data } = useSuspenseQuery(notificacionesQueryOptions());
  const queryClient = getQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id: number) => marcarLeida(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificacionesKeys.all }),
  });

  const notificaciones: Notificacion[] = data?.data ?? [];

  const handleClick = (notif: Notificacion) => {
    if (!notif.leida) {
      markReadMutation.mutate(notif.id);
    }
    if (notif.enlace) {
      router.push(notif.enlace);
    }
  };

  return (
    <PageContainer pageTitle="Notificaciones" pageDescription="Centro de notificaciones">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-24">Tipo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead className="w-32">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notificaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No tenés notificaciones
                </TableCell>
              </TableRow>
            ) : (
              notificaciones.map((notif) => (
                <TableRow
                  key={notif.id}
                  className={`cursor-pointer ${!notif.leida ? 'bg-muted/30' : ''}`}
                  onClick={() => handleClick(notif)}
                >
                  <TableCell>
                    {!notif.leida && <span className="block h-2 w-2 rounded-full bg-destructive" />}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={tipoColors[notif.tipo] ?? ''}>
                      {notif.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className={notif.leida ? '' : 'font-medium'}>
                    {notif.titulo}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                    {notif.mensaje}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.creadoEn), { addSuffix: true, locale: es })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
