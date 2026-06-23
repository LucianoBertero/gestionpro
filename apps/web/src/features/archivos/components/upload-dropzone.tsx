'use client';

import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Icons } from '@/components/icons';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export interface UploadDropzoneProps {
  /** Called with the accepted File when the user drops/selects one. */
  onUpload: (file: File) => void;
  /** Whether an upload is currently in progress. Locks the dropzone. */
  isUploading?: boolean;
  /** Upload progress 0–100. Shown when isUploading is true. */
  progress?: number;
  /** Max file size in bytes. Default 10 MB. */
  maxSize?: number;
  /** Accepted MIME types map (react-dropzone format). */
  accept?: Record<string, string[]>;
  /** Disable the dropzone entirely. */
  disabled?: boolean;
  /** Called when the user clicks cancel during an upload. */
  onCancel?: () => void;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const DEFAULT_ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
};

function rejectionMessage(rejection: FileRejection, t: ReturnType<typeof useT>): string {
  const err = rejection.errors[0];
  if (!err) return t('archivos.errors.unknown', { defaultValue: 'Unknown error' });
  switch (err.code) {
    case 'file-too-large':
      return t('archivos.errors.fileTooBig', { defaultValue: 'File exceeds the maximum size' });
    case 'file-invalid-type':
      return t('archivos.errors.unsupportedType', { defaultValue: 'Unsupported file type' });
    default:
      return err.message;
  }
}

export function UploadDropzone({
  onUpload,
  isUploading = false,
  progress = 0,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  onCancel,
}: UploadDropzoneProps) {
  const t = useT();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize,
    accept,
    disabled: disabled || isUploading,
  });

  const rejection = fileRejections[0];
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          (disabled || isUploading) && 'cursor-not-allowed opacity-60',
          !isDragActive && !disabled && !isUploading && 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          /* ---- Uploading state ---- */
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('archivos.dropzone.uploading', { defaultValue: 'Uploading...' })}
            </p>
            <Progress value={progress} className="w-48" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
            {onCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                {t('archivos.dropzone.cancel', { defaultValue: 'Cancel' })}
              </button>
            )}
          </div>
        ) : rejection ? (
          /* ---- Rejection state ---- */
          <div className="flex flex-col items-center gap-2 text-center">
            <Icons.warning className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">
              {rejectionMessage(rejection, t)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('archivos.dropzone.hint', {
                defaultValue: `Drag a file or click to select — max ${maxSizeMB} MB`,
                maxSizeMB,
              })}
            </p>
          </div>
        ) : isDragActive ? (
          /* ---- Drag-active state ---- */
          <div className="flex flex-col items-center gap-2 text-center">
            <Icons.upload className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-primary">
              {t('archivos.dropzone.dropHere', { defaultValue: 'Drop the file here' })}
            </p>
          </div>
        ) : (
          /* ---- Idle state ---- */
          <div className="flex flex-col items-center gap-2 text-center">
            <Icons.upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('archivos.dropzone.placeholder', {
                defaultValue: 'Drag a file or click to select',
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('archivos.dropzone.hint', {
                defaultValue: `PDF, Excel, Word, Images — max ${maxSizeMB} MB`,
                maxSizeMB,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
