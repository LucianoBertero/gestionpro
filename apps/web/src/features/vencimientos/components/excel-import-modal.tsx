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
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { importExcel } from '../api/service';
import { vencimientosKeys } from '../api/queries';

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcelImportModal({ open, onOpenChange }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  const queryClient = getQueryClient();

  const importMutation = useMutation({
    mutationFn: (rows: { impuesto: string; anio: number; mes: number; digitoCuit: number; fechaVence: string }[]) =>
      importExcel(rows),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: vencimientosKeys.all });
    },
    onError: (err: Error) => {
      setResult({ created: 0, errors: [err.message] });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(Boolean);
        const rows = lines.slice(1).map((line) => {
          const cols = line.split(',');
          return {
            impuesto: cols[0]?.trim() || '',
            anio: parseInt(cols[1]?.trim()) || 0,
            mes: parseInt(cols[2]?.trim()) || 0,
            digitoCuit: parseInt(cols[3]?.trim()) || 0,
            fechaVence: cols[4]?.trim() || '',
          };
        });
        importMutation.mutate(rows);
      } catch {
        setResult({ created: 0, errors: ['Error al procesar el archivo. Asegurate de que sea un CSV válido.'] });
      } finally {
        setParsing(false);
      }
    };
    reader.readAsText(f);
  }, [importMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setResult(null); setFile(null); } }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Vencimientos desde Excel</DialogTitle>
          <DialogDescription>
            Subí un archivo CSV o Excel con columnas: impuesto, año, mes, dígito CUIT, fecha de vencimiento.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Icons.upload className="mb-2 h-8 w-8 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-muted-foreground">Soltá el archivo aquí...</p>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Arrastrá y soltá tu archivo Excel/CSV aquí
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  o hacé clic para seleccionar
                </p>
              </div>
            )}
            {file && (
              <p className="mt-2 text-sm font-medium">{file.name}</p>
            )}
          </div>
        )}

        {parsing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Procesando archivo...</span>
          </div>
        )}

        {importMutation.isPending && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Importando vencimientos...</span>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Filas procesadas: {result.created}
              </p>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Errores ({result.errors.length}):
                </p>
                <ul className="mt-1 list-inside list-disc text-xs text-red-600 dark:text-red-400">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={() => { onOpenChange(false); setResult(null); setFile(null); }} className="w-full">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
