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
import { createArchivo } from '../api/service';
import { getQueryClient } from '@/lib/query-client';
import { archivosKeys } from '../api/queries';
import type { TipoArchivo } from '../api/types';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_SIZE_KB = 10240; // 10MB

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [clienteId, setClienteId] = useState<number>(0);
  const [tipo, setTipo] = useState<TipoArchivo>('COMPROBANTE');
  const [periodo, setPeriodo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const queryClient = getQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: { clienteId: number; nombre: string; tipo: TipoArchivo; periodo?: string; url: string; tamanioKb?: number }) =>
      createArchivo(data),
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
    setClienteId(0);
    setTipo('COMPROBANTE');
    setPeriodo('');
    setValidationError(null);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;

    const sizeKb = Math.round(f.size / 1024);
    if (sizeKb > MAX_SIZE_KB) {
      setValidationError(`El archivo es demasiado grande. Tamaño máximo: 10MB`);
      return;
    }

    setFile(f);
    setValidationError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_SIZE_KB * 1024,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !clienteId) return;

    uploadMutation.mutate({
      clienteId,
      nombre: file.name,
      tipo,
      periodo: periodo || undefined,
      url: URL.createObjectURL(file),
      tamanioKb: Math.round(file.size / 1024),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Archivo</DialogTitle>
          <DialogDescription>
            Cargá un archivo al sistema. Se guardará la metadata; el almacenamiento físico se habilitará próximamente.
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
              <Label htmlFor="clienteId">ID del Cliente</Label>
              <Input
                id="clienteId"
                type="number"
                value={clienteId || ''}
                onChange={(e) => setClienteId(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!file || !clienteId || uploadMutation.isPending}>
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
