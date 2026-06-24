'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { UploadDropzone } from '@/features/archivos/components/upload-dropzone';
import { useUpload } from '@/features/archivos/hooks/use-upload';
import { deleteArchivoMutation } from '@/features/archivos/api/mutations';
import { getArchivo } from '@/features/archivos/api/service';
import { archivosClienteQueryOptions, archivosClienteKeys } from '../../api/queries';
import { getQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { SOCIO } from '@/constants';
import { useT } from '@/lib/i18n/client';
import { formatFileSize, formatDateTimeShort } from '@/lib/format';

import type { ClienteArchivoListItem } from '../../api/types';

interface ArchivosTabProps {
  clienteId: number;
}

type Tr = (key: string, fallback: string) => string;

function fileIcon(mimeType: string, extension: string) {
  const ext = extension.toLowerCase();
  if (mimeType === 'application/pdf' || ext === 'pdf') return Icons.fileTypePdf;
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument.wordprocessingml') ||
    ext === 'doc' ||
    ext === 'docx'
  ) {
    return Icons.fileTypeDoc;
  }
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheetml') ||
    ext === 'xls' ||
    ext === 'xlsx' ||
    ext === 'csv'
  ) {
    return Icons.fileTypeXls;
  }
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return Icons.fileZip;
  return Icons.fileText;
}

export function ArchivosTab({ clienteId }: ArchivosTabProps) {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === SOCIO;

  const { data: archivos, isLoading } = useQuery(archivosClienteQueryOptions(clienteId));
  const { status, progress, error, upload, abort } = useUpload();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deleteArchivoMutation,
    onSuccess: () => {
      toast.success(
        tr('archivos.success.deleted', 'Archivo eliminado correctamente'),
      );
    },
    onError: () => {
      toast.error(
        tr('archivos.errors.deleteFailed', 'No se pudo eliminar el archivo'),
      );
    },
  });

  // `tr` (the i18n helper) is intentionally NOT in the dep arrays below.
  // It's stable per locale and only changes when the user switches languages
  // (which remounts the component), so re-creating these callbacks on every
  // render would defeat the point of `useCallback`. oxlint flags this as
  // missing-dep; suppress with `// oxlint-disable` for the array lines.
  const handleFile = useCallback(
    async (file: File) => {
      const result = await upload(file, { type: 'cliente', id: clienteId });
      if (result) {
        // The backend attach is atomic with the upload, so the new file
        // is already linked. Just invalidate so the list refetches.
        getQueryClient().invalidateQueries({
          queryKey: archivosClienteKeys.byCliente(clienteId),
        });
        toast.success(
          tr('archivos.success.uploaded', 'Archivo subido correctamente'),
        );
      } else if (status === 'error') {
        toast.error(
          error?.message ??
            tr('archivos.errors.uploadFailed', 'Error al subir el archivo'),
        );
      }
    },
    // oxlint-disable react-hooks/exhaustive-deps
    [upload, clienteId, status, error],
  );

  const handleDownload = useCallback(
    async (archivoId: number) => {
      setDownloadingId(archivoId);
      try {
        const archivo = await getArchivo(archivoId);
        if (archivo.signedUrl) {
          window.open(archivo.signedUrl, '_blank', 'noopener,noreferrer');
        }
      } catch {
        toast.error(
          tr(
            'archivos.errors.downloadFailed',
            'No se pudo obtener el link de descarga',
          ),
        );
      } finally {
        setDownloadingId(null);
      }
    },
    // oxlint-disable react-hooks/exhaustive-deps
    [],
  );

  const handleDelete = useCallback(
    (archivoId: number, nombre: string) => {
      if (
        !confirm(
          tr(
            'archivos.delete.confirm',
            `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
          ),
        )
      ) {
        return;
      }
      deleteMutation.mutate(archivoId);
    },
    // oxlint-disable react-hooks/exhaustive-deps
    [deleteMutation],
  );

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    );
  }

  const list: ClienteArchivoListItem[] = archivos ?? [];
  const isUploading = status === 'uploading';

  return (
    <div className='space-y-4'>
      <UploadDropzone
        onUpload={handleFile}
        isUploading={isUploading}
        progress={progress}
        onCancel={isUploading ? abort : undefined}
      />

      {list.length === 0 ? (
        <Card>
          <CardContent className='text-muted-foreground py-8 text-center text-sm'>
            {tr('archivos.table.empty', 'Este cliente no tiene archivos todavía.')}
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-2'>
          {list.map((item) => {
            const archivo = item.archivo;
            const Icon = fileIcon(archivo.mimeType, archivo.extension);
            const isDownloading = downloadingId === archivo.id;
            const isDeleting =
              deleteMutation.isPending &&
              deleteMutation.variables === archivo.id;

            return (
              <div
                key={archivo.id}
                className='hover:bg-accent/30 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors'
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <Icon className='text-muted-foreground h-5 w-5 shrink-0' />
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <span
                      className='truncate font-medium'
                      title={archivo.originalName}
                    >
                      {archivo.originalName}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      {formatFileSize(archivo.bytes)} ·{' '}
                      {formatDateTimeShort(archivo.creadoEn)}
                    </span>
                  </div>
                </div>

                <div className='flex shrink-0 items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => handleDownload(archivo.id)}
                    disabled={isDownloading}
                    title={tr('archivos.actions.download', 'Descargar')}
                    aria-label={tr('archivos.actions.download', 'Descargar')}
                  >
                    {isDownloading ? (
                      <Icons.spinner className='h-4 w-4 animate-spin' />
                    ) : (
                      <Icons.fileText className='h-4 w-4' />
                    )}
                  </Button>

                  {isSocio && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-destructive h-8 w-8'
                      onClick={() => handleDelete(archivo.id, archivo.originalName)}
                      disabled={isDeleting}
                      title={tr('common.delete', 'Eliminar')}
                      aria-label={tr('common.delete', 'Eliminar')}
                    >
                      {isDeleting ? (
                        <Icons.spinner className='h-4 w-4 animate-spin' />
                      ) : (
                        <Icons.trash className='h-4 w-4' />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
