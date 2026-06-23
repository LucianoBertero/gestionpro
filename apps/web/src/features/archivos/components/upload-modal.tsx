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
import type { TipoArchivo, ArchivoParent } from '../api/types';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
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
      setValidationError('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    setFile(f);
    setValidationError(null);
  }, []);

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
          <DialogTitle>Subir Archivo</DialogTitle>
          <DialogDescription>
            Adjuntá un archivo a un cliente, tarea o liquidación. El archivo se almacena de forma segura.
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
              <p className="text-sm text-muted-foreground">Soltá el archivo aquí...</p>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Arrastrá y soltá tu archivo aquí
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, Excel, Word, Imágenes — Max 10MB
                </p>
              </div>
            )}
          </div>

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentType">Tipo</Label>
              <Select value={parentType} onValueChange={(v: ArchivoParent['type']) => setParentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="tarea">Tarea</SelectItem>
                  <SelectItem value="liquidacion">Liquidación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">ID</Label>
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
              <Label htmlFor="tipoArchivo">Categoría</Label>
              <Select value={tipo} onValueChange={(v: TipoArchivo) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPROBANTE">Comprobante</SelectItem>
                  <SelectItem value="DDJJ">DDJJ</SelectItem>
                  <SelectItem value="CONTRATO">Contrato</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo">Período (opcional)</Label>
              <Input
                id="periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="Ej: 2026-05"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!file || !parentId || uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <><Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</>
              ) : (
                <><Icons.upload className="mr-2 h-4 w-4" /> Subir</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
