'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { notasQueryOptions, notasKeys } from '../../api/queries';
import { createNota, updateNota, deleteNota } from '../../api/service';
import { getQueryClient } from '@/lib/query-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n/client';
import { formatDateTimeShort } from '@/lib/format';
import { toast } from 'sonner';
import type { Nota } from '../../api/types';

interface NotasTabProps {
  clienteId: number;
}

type Tr = (key: string, fallback: string) => string;

function NotaCard({
  nota,
  onEdit,
  onDelete,
  isEditing,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  isSaving,
  isOwnerOrSocio,
  tr,
}: {
  nota: Nota;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
  isOwnerOrSocio: boolean;
  tr: Tr;
}) {
  if (isEditing) {
    return (
      <Card>
        <CardContent className='pt-4'>
          <Textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className='min-h-[100px]'
            disabled={isSaving}
          />
          <div className='mt-2 flex justify-end gap-2'>
            <Button variant='outline' size='sm' onClick={onCancelEdit} disabled={isSaving}>
              {tr('common.cancel', 'Cancelar')}
            </Button>
            <Button size='sm' onClick={onSaveEdit} disabled={isSaving || !editContent.trim()}>
              {isSaving ? <Icons.spinner className='h-4 w-4 animate-spin' /> : null}
              {tr('common.save', 'Guardar')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className='pt-4'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <span className='text-base'>{nota.creadoPor.emoji || '👤'}</span>
            <span className='text-foreground font-medium'>{nota.creadoPor.nombre}</span>
            <span>&middot;</span>
            <span>{formatDateTimeShort(nota.creadoEn)}</span>
            {nota.actualizadoEn !== nota.creadoEn && (
              <>
                <span>&middot;</span>
                <span className='italic'>{tr('nota.edited', 'editado')}</span>
              </>
            )}
          </div>
          {isOwnerOrSocio && (
            <div className='flex gap-1'>
              <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onEdit}>
                <Icons.edit className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive h-7 w-7'
                onClick={onDelete}
              >
                <Icons.trash className='h-3.5 w-3.5' />
              </Button>
            </div>
          )}
        </div>
        <p className='text-sm leading-relaxed whitespace-pre-wrap'>{nota.contenido}</p>
      </CardContent>
    </Card>
  );
}

export function NotasTab({ clienteId }: NotasTabProps) {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
  const { data: notas, isLoading } = useQuery(notasQueryOptions(clienteId));
  const user = useAuthStore((s) => s.user);

  const [nuevoContenido, setNuevoContenido] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const createMutation = useMutation({
    mutationFn: () => createNota({ clienteId, contenido: nuevoContenido.trim() }),
    onSuccess: () => {
      setNuevoContenido('');
      setShowForm(false);
      getQueryClient().invalidateQueries({ queryKey: notasKeys.byCliente(clienteId) });
      toast.success(tr('nota.created', 'Nota creada'));
    },
    onError: () => toast.error(tr('nota.createError', 'No se pudo crear la nota')),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateNota(editingId!, { contenido: editContent.trim() }),
    onSuccess: () => {
      setEditingId(null);
      setEditContent('');
      getQueryClient().invalidateQueries({ queryKey: notasKeys.byCliente(clienteId) });
      toast.success(tr('nota.updated', 'Nota actualizada'));
    },
    onError: () => toast.error(tr('nota.updateError', 'No se pudo actualizar la nota')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNota(id),
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: notasKeys.byCliente(clienteId) });
      toast.success(tr('nota.deleted', 'Nota eliminada'));
    },
    onError: () => toast.error(tr('nota.deleteError', 'No se pudo eliminar la nota')),
  });

  const isOwnerOrSocio = (nota: Nota) => {
    if (!user) return false;
    return user.id === nota.creadoPorId || user.role === 'SOCIO';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{tr('nota.title', 'Notas')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>
          {tr('nota.title', 'Notas')} ({notas?.length ?? 0})
        </h3>
        <Button size='sm' onClick={() => setShowForm(!showForm)}>
          <Icons.add className='mr-1 h-4 w-4' />
          {tr('nota.add', 'Agregar nota')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className='pt-4'>
            <Textarea
              value={nuevoContenido}
              onChange={(e) => setNuevoContenido(e.target.value)}
              placeholder={tr('nota.placeholder', 'Escribí una nota...')}
              className='min-h-[100px]'
              disabled={createMutation.isPending}
            />
            <div className='mt-2 flex justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowForm(false);
                  setNuevoContenido('');
                }}
                disabled={createMutation.isPending}
              >
                {tr('common.cancel', 'Cancelar')}
              </Button>
              <Button
                size='sm'
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !nuevoContenido.trim()}
              >
                {createMutation.isPending ? (
                  <Icons.spinner className='h-4 w-4 animate-spin' />
                ) : null}
                {tr('common.save', 'Guardar')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(!notas || notas.length === 0) && !showForm ? (
        <Card>
          <CardContent className='text-muted-foreground py-8 text-center'>
            {tr('nota.noResults', 'No hay notas para este cliente.')}
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {notas?.map((nota) => (
            <NotaCard
              key={nota.id}
              nota={nota}
              isOwnerOrSocio={isOwnerOrSocio(nota)}
              onEdit={() => {
                setEditingId(nota.id);
                setEditContent(nota.contenido);
              }}
              onDelete={() => {
                if (confirm(tr('nota.confirmDelete', '¿Eliminar esta nota?'))) {
                  deleteMutation.mutate(nota.id);
                }
              }}
              isEditing={editingId === nota.id}
              editContent={editingId === nota.id ? editContent : ''}
              onEditContentChange={setEditContent}
              onSaveEdit={() => updateMutation.mutate()}
              onCancelEdit={() => {
                setEditingId(null);
                setEditContent('');
              }}
              isSaving={updateMutation.isPending}
              tr={tr}
            />
          ))}
        </div>
      )}
    </div>
  );
}
