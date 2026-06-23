'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { uploadArchivo } from '../api/service';
import { getQueryClient } from '@/lib/query-client';
import { archivosKeys } from '../api/queries';
import { useT } from '@/lib/i18n/client';
import type { TipoArchivo, ArchivoParent } from '../api/types';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const t = useT();

  const [file, setFile] = useState<File | null>(null);
  const [parentType, setParentType] = useState<ArchivoParent['type']>('cliente');
  const [parentId, setParentId] = useState<number>(0);
  const [tipo, setTipo] = useState<TipoArchivo>('COMPROBANTE');
  const [periodo, setPeriodo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const queryClient = getQueryClient();

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      const parent: ArchivoParent = { type: parentType, id: parentId };
      return uploadArchivo(file, parent, tipo, periodo || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: archivosKeys.all });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setValidationError(err.message);
    },
  });

  const resetForm = () => {
    setFile(null);
    setParentType('cliente');
    setParentId(0);
    setTipo('COMPROBANTE');
    setPeriodo('');
    setValidationError(null);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;

    if (f.size > MAX_SIZE_BYTES) {
      setValidationError(t('archivos.upload.fileTooBig', { defaultValue: 'File is too large. Maximum size: 10MB' }));
      return;
    }

    setFile(f);
    setValidationError(null);
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_SIZE_BYTES,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !parentId) return;
    uploadMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('archivos.upload.title', { defaultValue: 'Upload file' })}</DialogTitle>
          <DialogDescription>
            {t('archivos.upload.description', { defaultValue: 'Attach a file to a client, task, or settlement. The file is stored securely.' })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Icons.upload className="mb-2 h-8 w-8 text-muted-foreground" />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : isDragActive ? (
              <p className="text-sm text-muted-foreground">
                {t('archivos.upload.dropActive', { defaultValue: 'Drop the file here...' })}
              </p>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('archivos.upload.dragHere', { defaultValue: 'Drag and drop your file here' })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('archivos.upload.formats', { defaultValue: 'PDF, Excel, Word, Images — Max 10MB' })}
                </p>
              </div>
            )}
          </div>

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentType">{t('archivos.upload.parentType', { defaultValue: 'Type' })}</Label>
              <Select value={parentType} onValueChange={(v: ArchivoParent['type']) => setParentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">{t('archivos.parent.cliente', { defaultValue: 'Client' })}</SelectItem>
                  <SelectItem value="tarea">{t('archivos.parent.tarea', { defaultValue: 'Task' })}</SelectItem>
                  <SelectItem value="liquidacion">{t('archivos.parent.liquidacion', { defaultValue: 'Settlement' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">{t('archivos.upload.parentId', { defaultValue: 'ID' })}</Label>
              <Input
                id="parentId"
                type="number"
                value={parentId || ''}
                onChange={(e) => setParentId(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoArchivo">{t('archivos.upload.category', { defaultValue: 'Category' })}</Label>
              <Select value={tipo} onValueChange={(v: TipoArchivo) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPROBANTE">
                    {t('archivos.tipo.COMPROBANTE', { defaultValue: 'Comprobante' })}
                  </SelectItem>
                  <SelectItem value="DDJJ">
                    {t('archivos.tipo.DDJJ', { defaultValue: 'DDJJ' })}
                  </SelectItem>
                  <SelectItem value="CONTRATO">
                    {t('archivos.tipo.CONTRATO', { defaultValue: 'Contrato' })}
                  </SelectItem>
                  <SelectItem value="OTRO">
                    {t('archivos.tipo.OTRO', { defaultValue: 'Otro' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo">{t('archivos.upload.periodo', { defaultValue: 'Period (optional)' })}</Label>
              <Input
                id="periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder={t('archivos.upload.periodoPlaceholder', { defaultValue: 'e.g. 2026-05' })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('archivos.upload.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={!file || !parentId || uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <><Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> {t('archivos.upload.uploading', { defaultValue: 'Uploading...' })}</>
              ) : (
                <><Icons.upload className="mr-2 h-4 w-4" /> {t('archivos.upload.submit', { defaultValue: 'Upload' })}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
