'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import type { Notificacion } from '@/features/notificaciones/api/types';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  notificacionesKeys,
  notificacionesQueryOptions,
} from '@/features/notificaciones/api/queries';
import { marcarLeida, marcarTodasLeidas, getNotificaciones } from '@/features/notificaciones/api/service';
import { getQueryClient } from '@/lib/query-client';

const POLL_INTERVAL_MS = 30_000;

export function NotificationsDropdown() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // React Query handles polling + pause when tab is in background +
  // invalidation on mutations + dedup. Way better than setInterval.
  const { data } = useQuery({
    ...notificacionesQueryOptions(0, 5),
    enabled: open, // only fetch when the dropdown is open
    refetchInterval: open ? POLL_INTERVAL_MS : false,
  });

  const items: Notificacion[] = (data as { data?: Notificacion[] } | undefined)?.data ?? [];
  const noLeidas = items.filter((n) => !n.leida).length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => marcarLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => marcarTodasLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });

  const handleMarkRead = useCallback(
    (id: number, enlace?: string | null) => {
      markReadMutation.mutate(id);
      if (enlace) router.push(enlace);
    },
    [markReadMutation, router]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative h-8 w-8'>
          <Icons.notification className='h-4 w-4' />
          {noLeidas > 0 && (
            <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground'>
              {Math.min(noLeidas, 99)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>Notificaciones</span>
          {items.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className='text-xs text-muted-foreground hover:text-foreground'
            >
              Marcar todas leídas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className='h-[300px]'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Icons.notification className='mb-2 h-8 w-8 text-muted-foreground/50' />
              <p className='text-sm text-muted-foreground'>No tenés notificaciones nuevas</p>
            </div>
          ) : (
            items.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={`flex cursor-pointer flex-col items-start gap-1 py-3 ${!notif.leida ? 'bg-muted/50' : ''}`}
                onClick={() => handleMarkRead(notif.id, notif.enlace)}
              >
                <div className='flex w-full items-center justify-between'>
                  <span className='text-sm font-medium'>{notif.titulo}</span>
                  {!notif.leida && <span className='h-2 w-2 rounded-full bg-destructive' />}
                </div>
                <p className='line-clamp-2 text-xs text-muted-foreground'>{notif.mensaje}</p>
                <span className='text-[10px] text-muted-foreground'>
                  {formatDistanceToNow(new Date(notif.creadoEn), { addSuffix: true, locale: es })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='justify-center text-sm font-medium'
          onClick={() => router.push('/dashboard/notificaciones')}
        >
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
