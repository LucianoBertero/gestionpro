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
import { archivosQueryOptions, archivosKeys } from '@/features/archivos/api/queries';
import { deleteArchivo } from '@/features/archivos/api/service';
import { UploadModal } from '@/features/archivos/components/upload-modal';
import type { Archivo } from '@/features/archivos/api/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoBadge: Record<string, string> = {
  COMPROBANTE: 'bg-green-100 text-green-800',
  DDJJ: 'bg-blue-100 text-blue-800',
  CONTRATO: 'bg-purple-100 text-purple-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

function formatFileSize(kb: number | null): string {
  if (!kb) return NULL_PLACEHOLDER;
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ArchivosPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: items, isLoading } = useQuery(archivosQueryOptions());
  const queryClient = getQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteArchivo(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: archivosKeys.all, refetchType: 'active' }),
  });

  const archivos: Archivo[] = items ?? [];

  if (isLoading) {
    return (
      <PageContainer pageTitle="Archivos" pageDescription="Gestión de archivos y documentos">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Cargando...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle="Archivos"
      pageDescription="Gestión de archivos y documentos"
      pageHeaderAction={
        <Button onClick={() => setUploadOpen(true)}>
          <Icons.upload className="mr-2 h-4 w-4" />
          Subir Archivo
        </Button>
      }
    >
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Subido por</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No hay archivos cargados
                </TableCell>
              </TableRow>
            ) : (
              archivos.map((arc) => (
                <TableRow key={arc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Icons.fileText className="h-4 w-4 text-muted-foreground" />
                      {arc.nombre}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={tipoBadge[arc.tipo] ?? ''}>
                      {arc.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {arc.periodo || NULL_PLACEHOLDER}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(arc.tamanioKb)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {arc.subidoPor?.nombre ?? NULL_PLACEHOLDER}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(arc.creadoEn), { addSuffix: true, locale: es })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('¿Eliminar este archivo?')) deleteMutation.mutate(arc.id);
                      }}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </PageContainer>
  );
}
