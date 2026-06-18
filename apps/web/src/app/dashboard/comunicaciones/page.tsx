'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { NULL_PLACEHOLDER } from '@/constants';
import {
  comunicacionesQueryOptions,
  comunicacionKeys,
} from '@/features/comunicacion/api/queries';
import { deleteComunicacion, createComunicacion, updateComunicacion } from '@/features/comunicacion/api/service';
import { ComunicacionFormModal } from '@/features/comunicacion/components/comunicacion-form-modal';
import type { Comunicacion, CreateComunicacionPayload, UpdateComunicacionPayload } from '@/features/comunicacion/api/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoBadge: Record<string, string> = {
  EMAIL: 'bg-blue-100 text-blue-800',
  LLAMADA: 'bg-green-100 text-green-800',
  REUNION: 'bg-purple-100 text-purple-800',
  WHATSAPP: 'bg-green-100 text-green-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

export default function ComunicacionesPage() {
  const [editing, setEditing] = useState<Comunicacion | null>(null);
  const [creating, setCreating] = useState(false);
  const { data: items, isLoading } = useQuery(comunicacionesQueryOptions());
  const queryClient = getQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateComunicacionPayload) => createComunicacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comunicacionKeys.all, refetchType: 'all' });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateComunicacionPayload }) =>
      updateComunicacion(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comunicacionKeys.all, refetchType: 'all' });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteComunicacion(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: comunicacionKeys.all, refetchType: 'all' }),
  });

  const comunicaciones = items ?? [];

  if (isLoading) {
    return (
      <PageContainer pageTitle="Comunicaciones" pageDescription="Registro de comunicaciones con clientes">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Cargando...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle="Comunicaciones"
      pageDescription="Registro de comunicaciones con clientes"
      pageHeaderAction={
        <Button onClick={() => setCreating(true)}>
          <Icons.add className="mr-2 h-4 w-4" />
          Nueva Comunicación
        </Button>
      }
    >
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comunicaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No hay comunicaciones registradas
                </TableCell>
              </TableRow>
            ) : (
              comunicaciones.map((com) => (
                <TableRow key={com.id}>
                  <TableCell className="font-medium">
                    {com.cliente?.denominacion ?? `Cliente #${com.clienteId}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={tipoBadge[com.tipo] ?? ''}>
                      {com.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {com.asunto || NULL_PLACEHOLDER}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {com.usuario?.nombre ?? NULL_PLACEHOLDER}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(com.creadoEn), { addSuffix: true, locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(com)}>
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('¿Eliminar esta comunicación?')) deleteMutation.mutate(com.id);
                        }}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(creating || editing) && (
        <ComunicacionFormModal
          open={true}
          onOpenChange={(open) => { if (!open) { setCreating(false); setEditing(null); } }}
          item={editing}
          onSave={(data) => {
            if ('id' in data) {
              updateMutation.mutate({ id: data.id, values: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}
    </PageContainer>
  );
}
