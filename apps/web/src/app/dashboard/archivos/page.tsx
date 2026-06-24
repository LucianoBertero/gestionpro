'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useT } from '@/lib/i18n/client';
import { formatFileSize, formatRelative } from '@/lib/format';
import { NULL_PLACEHOLDER } from '@/constants';
import { archivosQueryOptions, archivosKeys } from '@/features/archivos/api/queries';
import { deleteArchivo } from '@/features/archivos/api/service';
import { UploadModal } from '@/features/archivos/components/upload-modal';
import type { Archivo, ArchivoParent } from '@/features/archivos/api/types';

const TIPO_BADGE: Record<string, string> = {
  COMPROBANTE: 'bg-green-100 text-green-800',
  DDJJ: 'bg-blue-100 text-blue-800',
  CONTRATO: 'bg-purple-100 text-purple-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

export default function ArchivosPage() {
  const t = useT();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [parentType, setParentType] = useState<ArchivoParent['type']>('cliente');
  const [parentId, setParentId] = useState<number | ''>('');

  const queryClient = getQueryClient();

  const filters = {
    parentType,
    parentId: typeof parentId === 'number' ? parentId : 0,
  };

  const { data: items, isLoading } = useQuery(archivosQueryOptions(filters));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteArchivo(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: archivosKeys.all, refetchType: 'active' }),
  });

  const handleUploadSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: archivosKeys.all, refetchType: 'active' });
  }, [queryClient]);

  const archivos: Archivo[] = items ?? [];

  if (isLoading) {
    return (
      <PageContainer
        pageTitle={t('archivos.title', { defaultValue: 'Archivos' })}
        pageDescription={t('archivos.description', { defaultValue: 'Gestión de archivos y documentos' })}
      >
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          {t('common.loading', { defaultValue: 'Cargando...' })}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle={t('archivos.title', { defaultValue: 'Archivos' })}
      pageDescription={t('archivos.description', { defaultValue: 'Gestión de archivos y documentos' })}
      pageHeaderAction={
        <Button onClick={() => setUploadOpen(true)} disabled={parentId === ''}>
          <Icons.upload className="mr-2 h-4 w-4" />
          {t('archivos.upload.button', { defaultValue: 'Subir Archivo' })}
        </Button>
      }
    >
      {/* Filter bar — select parent entity type and ID */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="parentType" className="text-xs">
            {t('archivos.filter.parentTypeLabel', { defaultValue: 'Entidad' })}
          </Label>
          <Select
            value={parentType}
            onValueChange={(v) => setParentType(v as ArchivoParent['type'])}
          >
            <SelectTrigger id="parentType" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cliente">
                {t('archivos.parent.cliente', { defaultValue: 'Cliente' })}
              </SelectItem>
              <SelectItem value="tarea">
                {t('archivos.parent.tarea', { defaultValue: 'Tarea' })}
              </SelectItem>
              <SelectItem value="liquidacion">
                {t('archivos.parent.liquidacion', { defaultValue: 'Liquidación' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parentId" className="text-xs">
            {t('archivos.filter.parentIdLabel', { defaultValue: 'ID' })}
          </Label>
          <Input
            id="parentId"
            type="number"
            value={parentId}
            onChange={(e) =>
              setParentId(e.target.value ? Number(e.target.value) : '')
            }
            placeholder="42"
            className="w-[120px]"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('archivos.table.name', { defaultValue: 'Nombre' })}
              </TableHead>
              <TableHead>
                {t('archivos.table.type', { defaultValue: 'Tipo' })}
              </TableHead>
              <TableHead>
                {t('archivos.table.period', { defaultValue: 'Período' })}
              </TableHead>
              <TableHead>
                {t('archivos.table.size', { defaultValue: 'Tamaño' })}
              </TableHead>
              <TableHead>
                {t('archivos.table.uploadedBy', { defaultValue: 'Subido por' })}
              </TableHead>
              <TableHead>
                {t('archivos.table.date', { defaultValue: 'Fecha' })}
              </TableHead>
              <TableHead className="w-24">
                {t('archivos.table.actions', { defaultValue: 'Acciones' })}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  {parentId
                    ? t('archivos.table.empty', {
                        defaultValue: 'No hay archivos cargados',
                      })
                    : t('archivos.filter.selectParent', {
                        defaultValue:
                          'Seleccioná un tipo de entidad y un ID para ver los archivos',
                      })}
                </TableCell>
              </TableRow>
            ) : (
              archivos.map((arc) => (
                <TableRow key={arc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Icons.fileText className="h-4 w-4 text-muted-foreground" />
                      {arc.originalName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TIPO_BADGE[arc.tipo] ?? ''}>
                      {arc.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {arc.periodo || NULL_PLACEHOLDER}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(arc.bytes)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {arc.subidoPorId ?? NULL_PLACEHOLDER}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatRelative(arc.creadoEn)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
                      onClick={() => {
                        if (
                          confirm(
                            t('archivos.delete.confirm', {
                              defaultValue: '¿Eliminar este archivo?',
                            }),
                          )
                        )
                          deleteMutation.mutate(arc.id);
                      }}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        parent={{ type: parentType, id: Number(parentId) || 0 }}
        onSuccess={handleUploadSuccess}
      />
    </PageContainer>
  );
}
