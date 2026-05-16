'use client';

import { useCallback, useEffect, useState } from 'react';
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

export function NotificationsDropdown() {
  const router = useRouter();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const api = (await import('@/lib/auth/axios-instance')).default;
      const { data: listData } = await api.get('/v1/notificaciones', { params: { skip: 0, take: 5 } });
      setItems(listData?.data ?? []);
      const noLeidas = listData?.meta?.noLeidas ?? 0;
      if (!noLeidas) {
        const { data: countRes } = await api.get('/v1/notificaciones/no-leidas');
        setNoLeidas(countRes?.data ?? 0);
      } else {
        setNoLeidas(noLeidas);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkRead = useCallback(
    async (id: number, enlace?: string | null) => {
      try {
        const api = (await import('@/lib/auth/axios-instance')).default;
        await api.post(`/v1/notificaciones/${id}/leer`);
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
        setNoLeidas((prev) => Math.max(0, prev - 1));
        if (enlace) router.push(enlace);
      } catch {
        // ignore
      }
    },
    [router]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      const api = (await import('@/lib/auth/axios-instance')).default;
      await api.post('/v1/notificaciones/leer-todas');
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      // ignore
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Icons.notification className="h-4 w-4" />
          {noLeidas > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {Math.min(noLeidas, 99)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {items.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Marcar todas leídas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icons.notification className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No tenés notificaciones nuevas</p>
            </div>
          ) : (
            items.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={`flex cursor-pointer flex-col items-start gap-1 py-3 ${!notif.leida ? 'bg-muted/50' : ''}`}
                onClick={() => handleMarkRead(notif.id, notif.enlace)}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">{notif.titulo}</span>
                  {!notif.leida && <span className="h-2 w-2 rounded-full bg-destructive" />}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{notif.mensaje}</p>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.creadoEn), { addSuffix: true, locale: es })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm font-medium"
          onClick={() => router.push('/dashboard/notificaciones')}
        >
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
