'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { formatFileSize } from '@/lib/format';
import { useT } from '@/lib/i18n/client';

import { UploadDropzone } from '@/features/archivos/components/upload-dropzone';
import { useUpload } from '@/features/archivos/hooks/use-upload';
import type { ArchivoParent } from '@/features/archivos/api/types';

// ---------------------------------------------------------------------------
// Icon resolver — shared with archivos-tab; kept here while both files need it.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UploadModalProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Call to change visibility. */
  onOpenChange: (open: boolean) => void;
  /** The parent entity this file is attached to. */
  parent: ArchivoParent;
  /** Fired after a successful upload so the parent can invalidate queries / toast. */
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UploadModal({ open, onOpenChange, parent, onSuccess }: UploadModalProps) {
  const t = useT();
  const { status, progress, error, upload, abort, reset } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  // ---- Reset local state whenever the modal opens ------------------------
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    wasOpenRef.current = open;
  }, [open, reset]);

  // ---- Manage the local-preview object URL lifecycle ---------------------
  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewUrl(null);
  }, [selectedFile]);

  // ---- Callbacks ----------------------------------------------------------

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    const result = await upload(selectedFile, parent);
    if (result) {
      onSuccess();
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      onOpenChange(false);
    }
  }, [selectedFile, upload, parent, onSuccess, reset, onOpenChange]);

  const handleCancel = useCallback(() => {
    if (status === 'uploading') {
      abort();
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  }, [status, abort, onOpenChange]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        handleCancel();
      } else {
        onOpenChange(true);
      }
    },
    [handleCancel, onOpenChange],
  );

  // ---- Derived state ------------------------------------------------------

  const isImage = selectedFile?.type.startsWith('image/');
  const isUploading = status === 'uploading';
  const hasError = status === 'error';

  let title: string;
  let description: string;
  if (!selectedFile) {
    title = t('archivos.modal.title', { defaultValue: 'Subir archivo' });
    description = t('archivos.modal.description.select', {
      defaultValue: 'Arrastrá o seleccioná un archivo PDF, imagen, Word o Excel.',
    });
  } else if (isUploading) {
    title = t('archivos.modal.uploading', { defaultValue: 'Subiendo...' });
    description = t('archivos.modal.description.uploading', {
      defaultValue: 'Por favor esperá mientras se sube el archivo.',
    });
  } else {
    title = t('archivos.modal.confirm.title', { defaultValue: '¿Subir este archivo?' });
    description = t('archivos.modal.description.confirm', {
      defaultValue: 'Revisá el archivo y confirmá para subirlo.',
    });
  }

  const extension = selectedFile?.name.split('.').pop() ?? '';

  // Non-image icon for the confirmation card
  const PreviewIcon = selectedFile && !isImage
    ? fileIcon(selectedFile.type, extension)
    : null;

  // ---- Render -------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!selectedFile ? (
          /* ── Step 1 — File selection ──────────────────────────────────── */
          <UploadDropzone onUpload={handleFileSelected} />
        ) : (
          /* ── Step 2 — Confirmation / Uploading ────────────────────────── */
          <div className="space-y-4">
            {/* Preview card */}
            <div className="flex flex-col items-stretch gap-4 rounded-lg border p-4 sm:flex-row sm:items-start">
              {isImage && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob: URLs are local; next/image can't handle them
                <img
                  src={previewUrl}
                  alt={selectedFile.name}
                  className="h-48 w-full shrink-0 rounded object-cover sm:h-40 sm:w-40"
                />
              ) : PreviewIcon ? (
                <div className="bg-muted flex h-48 w-full shrink-0 items-center justify-center rounded sm:h-40 sm:w-40">
                  <PreviewIcon className="text-muted-foreground h-16 w-16" />
                </div>
              ) : (
                <div className="bg-muted flex h-48 w-full shrink-0 items-center justify-center rounded sm:h-40 sm:w-40">
                  <Icons.fileText className="text-muted-foreground h-16 w-16" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p
                  className="line-clamp-2 break-all text-sm font-medium"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(selectedFile.size)}
                  {' · '}
                  {selectedFile.type || extension.toUpperCase() || '—'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-muted-foreground text-center text-xs">{progress}%</p>
              </div>
            )}

            {/* Error message */}
            {hasError && (
              <p className="text-destructive text-sm">
                {error?.message ??
                  t('archivos.modal.error', {
                    defaultValue: 'No se pudo subir el archivo',
                  })}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancel} disabled={isUploading}>
                {t('archivos.modal.confirm.cancel', { defaultValue: 'Cancelar' })}
              </Button>
              {!isUploading && (
                <Button onClick={handleUpload}>
                  {t('archivos.modal.confirm.upload', { defaultValue: 'Subir' })}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
