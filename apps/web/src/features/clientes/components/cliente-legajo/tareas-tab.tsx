'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { tareasQueryOptions, tareasKeys } from '@/features/tareas/api/queries';
import {
  createTareaMutation,
  updateTareaMutation,
  completarTareaMutation,
  deleteTareaMutation,
} from '@/features/tareas/api/mutations';
import { getQueryClient } from '@/lib/query-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n/client';
import {
  PRIORIDAD_VALUES,
  PRIORIDAD_LABELS,
  PRIORIDAD_DOT_CLASS,
  getEstadoBadgeVariant,
  type Prioridad,
  type EstadoTarea,
} from '@/constants';
import { formatDateShort } from '@/lib/format';
import type { Tarea } from '@/features/tareas/api/types';
import { toast } from 'sonner';

// ─── Props ─────────────────────────────────────

interface TareasTabProps {
  clienteId: number;
}

// ─── Edit Sheet ────────────────────────────────

function EditTareaSheet({
  open,
  onOpenChange,
  tarea,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarea: Tarea | null;
}) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA');
  const [estado, setEstado] = useState<EstadoTarea>('PENDIENTE');
  const [vence, setVence] = useState('');

  // Reset form when tarea changes
  useEffect(() => {
    if (open && tarea) {
      setTitulo(tarea.titulo);
      setDescripcion(tarea.descripcion ?? '');
      setPrioridad(tarea.prioridad);
      setEstado(tarea.estado);
      setVence(tarea.vence ? new Date(tarea.vence).toISOString().slice(0, 10) : '');
    }
  }, [open, tarea]);

  const updateMutation = useMutation({
    ...updateTareaMutation,
    onSuccess: () => {
      toast.success(tr('tarea.updated', 'Tarea actualizada'));
      onOpenChange(false);
    },
    onError: () => toast.error(tr('tarea.updateError', 'No se pudo actualizar la tarea')),
  });

  const handleSave = () => {
    if (!tarea) return;
    updateMutation.mutate({
      id: tarea.id,
      values: {
        titulo: titulo || tarea.titulo,
        descripcion: descripcion || undefined,
        prioridad,
        estado,
        vence: vence ? new Date(vence).toISOString() : undefined,
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] overflow-y-auto sm:w-[480px]'>
        <SheetHeader>
          <SheetTitle>{tr('tarea.edit', 'Editar Tarea')}</SheetTitle>
          <SheetDescription>
            {tr('tarea.formEditDescription', 'Modificá los campos de la tarea.')}
          </SheetDescription>
        </SheetHeader>
        <div className='mt-6 space-y-4'>
          <div className='space-y-2'>
            <Label>{tr('tarea.titulo', 'Título')}</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={tr('tarea.placeholderTitulo', 'Título de la tarea')}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>{tr('tarea.prioridad', 'Prioridad')}</Label>
              <Select value={prioridad} onValueChange={(v) => setPrioridad(v as Prioridad)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORIDAD_VALUES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORIDAD_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>{tr('tarea.estado', 'Estado')}</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoTarea)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'] as EstadoTarea[]).map((e) => (
                    <SelectItem key={e} value={e}>
                      {tr(`tarea.options.estado.${e}`, e)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='space-y-2'>
            <Label>{tr('tarea.vence', 'Vence')}</Label>
            <Input
              type='date'
              value={vence}
              onChange={(e) => setVence(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label>{tr('tarea.descripcion', 'Descripción')}</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tr('tarea.placeholderDescripcion', 'Detalles adicionales...')}
              rows={3}
            />
          </div>
          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              {tr('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Icons.spinner className='h-4 w-4 animate-spin' />
              ) : null}
              {tr('common.save', 'Guardar')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Component ─────────────────────────────

export function TareasTab({ clienteId }: TareasTabProps) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });
  const user = useAuthStore((s) => s.user);
  const { data: tareasData, isLoading } = useQuery(
    tareasQueryOptions({ clienteId }),
  );

  const [titulo, setTitulo] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA');
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);

  const createMutation = useMutation({
    ...createTareaMutation,
    onSuccess: () => {
      setTitulo('');
      getQueryClient().invalidateQueries({ queryKey: tareasKeys.list({ clienteId }) });
      toast.success(tr('tarea.created', 'Tarea creada'));
    },
    onError: () => toast.error(tr('tarea.createError', 'No se pudo crear la tarea')),
  });

  const completeMutation = useMutation({
    ...completarTareaMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: tareasKeys.list({ clienteId }) });
      toast.success(tr('tarea.completed_toast', 'Tarea completada'));
    },
    onError: () => toast.error(tr('tarea.completeError', 'No se pudo completar la tarea')),
  });

  const deleteMutation = useMutation({
    ...deleteTareaMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: tareasKeys.list({ clienteId }) });
      toast.success(tr('tarea.deleted', 'Tarea eliminada'));
    },
    onError: () => toast.error(tr('tarea.deleteError', 'No se pudo eliminar la tarea')),
  });

  const handleSubmit = () => {
    const trimmed = titulo.trim();
    if (!trimmed || !user) return;

    createMutation.mutate({
      titulo: trimmed,
      clienteId,
      encargadoId: user.id,
      tipo: 'INTERNA',
      prioridad,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleComplete = (id: number) => completeMutation.mutate(id);
  const handleDelete = (id: number) => {
    if (confirm(tr('tarea.confirmDelete', '¿Eliminar esta tarea?'))) {
      deleteMutation.mutate(id);
    }
  };

  const tareas = tareasData?.data ?? [];
  const pendientes = tareas.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO',
  );
  const completadas = tareas.filter(
    (t) => t.estado === 'COMPLETADA' || t.estado === 'CANCELADA',
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{tr('tarea.title', 'Tareas')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-32 w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>
          {tr('tarea.title', 'Tareas')} ({pendientes.length})
        </h3>
      </div>

      {/* Quick-add row */}
      <Card>
        <CardContent className='pt-4'>
          <div className='flex items-center gap-3'>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tr('tarea.placeholderAdd', 'Añadir nueva tarea...')}
              className='flex-1'
              disabled={createMutation.isPending}
            />
            <Select
              value={prioridad}
              onValueChange={(v) => setPrioridad(v as Prioridad)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger className='w-[130px] shrink-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDAD_VALUES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORIDAD_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !titulo.trim()}
              className='shrink-0'
            >
              {createMutation.isPending ? (
                <Icons.spinner className='h-4 w-4 animate-spin' />
              ) : (
                tr('common.add', 'Agregar')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending tasks */}
      {pendientes.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
            <Icons.tasks className='text-muted-foreground h-12 w-12' />
            <div>
              <p className='text-lg font-semibold text-muted-foreground'>
                {tr('tarea.pendingEmpty', 'No hay tareas pendientes para este cliente')}
              </p>
              <p className='text-muted-foreground text-sm'>
                {tr('tarea.pendingEmptyHint', 'Agregá una tarea usando el campo de arriba')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='divide-y pt-2'>
            {pendientes.map((tarea) => (
              <div
                key={tarea.id}
                className='group flex items-center justify-between py-3 first:pt-1 last:pb-1'
              >
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  {/* Complete checkbox */}
                  <button
                    onClick={() => handleComplete(tarea.id)}
                    disabled={completeMutation.isPending}
                    className='hover:bg-muted shrink-0 rounded-full p-0.5 transition-colors'
                    title={tr('tarea.markComplete', 'Marcar como completada')}
                  >
                    <Icons.circle className='text-muted-foreground/50 h-5 w-5 hover:text-green-500' />
                  </button>

                  {/* Priority dot */}
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${PRIORIDAD_DOT_CLASS[tarea.prioridad]}`}
                  />

                  {/* Title + metadata */}
                  <div className='min-w-0 flex-1'>
                    <button
                      onClick={() => setEditingTarea(tarea)}
                      className='truncate text-left text-sm hover:underline'
                    >
                      {tarea.titulo}
                    </button>
                    <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                      <span>
                        {tarea.vence
                          ? formatDateShort(tarea.vence)
                          : tr('tarea.sinFecha', 'Sin fecha')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions dropdown */}
                <div className='flex shrink-0 items-center gap-1'>
                  <span className='text-muted-foreground/70 mr-2 text-xs'>
                    {tarea.encargado.nombre}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <Icons.ellipsis className='h-3.5 w-3.5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuItem onClick={() => setEditingTarea(tarea)}>
                        <Icons.edit className='mr-2 h-3.5 w-3.5' />
                        {tr('common.edit', 'Editar')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleComplete(tarea.id)}>
                        <Icons.check className='mr-2 h-3.5 w-3.5' />
                        {tr('tarea.options.estado.COMPLETADA', 'Completada')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(tarea.id)}
                        className='text-destructive'
                      >
                        <Icons.trash className='mr-2 h-3.5 w-3.5' />
                        {tr('common.delete', 'Eliminar')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed tasks */}
      {completadas.length > 0 && (
        <details className='group'>
          <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium transition-colors'>
            {tr('tarea.completed', 'Completadas')} ({completadas.length})
          </summary>
          <Card className='mt-2'>
            <CardContent className='divide-y pt-2'>
              {completadas.map((tarea) => (
                <div
                  key={tarea.id}
                  className='flex items-center justify-between py-2.5 first:pt-1 last:pb-1'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <Icons.circleCheck className='text-green-500 h-4 w-4 shrink-0' />
                    <span className='text-muted-foreground truncate text-sm line-through'>
                      {tarea.titulo}
                    </span>
                  </div>
                  <span className='text-muted-foreground shrink-0 text-xs'>
                    {tarea.vence ? formatDateShort(tarea.vence) : tr('tarea.sinFecha', 'Sin fecha')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </details>
      )}

      {/* Edit sheet */}
      <EditTareaSheet
        open={!!editingTarea}
        onOpenChange={(open) => {
          if (!open) setEditingTarea(null);
        }}
        tarea={editingTarea}
      />
    </div>
  );
}
