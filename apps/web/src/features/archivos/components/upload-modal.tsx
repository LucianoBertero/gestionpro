'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/format';
import { useT } from '@/lib/i18n/client';
import { clientesQueryOptions } from '@/features/clientes/api/queries';
import { tareasQueryOptions } from '@/features/tareas/api/queries';
import { liquidacionesQueryOptions } from '@/features/liquidaciones/api/queries';

import { UploadDropzone } from '@/features/archivos/components/upload-dropzone';
import { useUpload } from '@/features/archivos/hooks/use-upload';
import type { ArchivoParent, TipoArchivo } from '@/features/archivos/api/types';
import { TIPO_ARCHIVO_VALUES, TIPO_ARCHIVO_LABELS } from '@/features/archivos/constants';

// ---- helpers ----

function fileIcon(mimeType: string, extension: string) {
  const ext = extension.toLowerCase();
  if (mimeType === 'application/pdf' || ext === 'pdf') return Icons.fileTypePdf;
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument.wordprocessingml') ||
    ext === 'doc' ||
    ext === 'docx'
  )
    return Icons.fileTypeDoc;
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheetml') ||
    ext === 'xls' ||
    ext === 'xlsx' ||
    ext === 'csv'
  )
    return Icons.fileTypeXls;
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return Icons.fileZip;
  return Icons.fileText;
}

// ---- Props ----

export interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Pre-set the parent entity. When provided, the parent picker is hidden. */
  parent?: ArchivoParent;
}

type ParentTypeChoice = ArchivoParent['type'];

interface EntityOption {
  value: number;
  label: string;
}

// ---- Component ----

export function UploadModal({
  open,
  onOpenChange,
  onSuccess,
  parent: presetParent,
}: UploadModalProps) {
  const t = useT();
  const { status, progress, error, upload, abort, reset } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  // Form state
  const [parentTypeChoice, setParentTypeChoice] =
    useState<ParentTypeChoice>(presetParent?.type ?? 'estudio');
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(
    presetParent && presetParent.type !== 'estudio' ? presetParent.id : null,
  );
  const [entitySearch, setEntitySearch] = useState('');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [tipoValue, setTipoValue] = useState<TipoArchivo | 'all'>('all');
  const [periodoValue, setPeriodoValue] = useState('');

  const showParentPicker = !presetParent;

  // Reset state on open
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setParentTypeChoice(presetParent?.type ?? 'estudio');
      setSelectedEntityId(
        presetParent && presetParent.type !== 'estudio'
          ? presetParent.id
          : null,
      );
      setEntitySearch('');
      setComboboxOpen(false);
      setTipoValue('all');
      setPeriodoValue('');
    }
    wasOpenRef.current = open;
  }, [open, reset, presetParent]);

  // Preview URL for images
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

  // Queries for entity pickers
  const clientesQuery = useQuery(
    clientesQueryOptions({ search: entitySearch, take: 50 }),
  );
  const tareasQuery = useQuery(
    tareasQueryOptions({ search: entitySearch }),
  );
  // Liquidaciones doesn't have a search param — fetch all, filter client-side
  const liquidacionesQuery = useQuery(liquidacionesQueryOptions({}));

  const entityOptions: EntityOption[] = useMemo(() => {
    switch (parentTypeChoice) {
      case 'cliente': {
        const items = clientesQuery.data?.data ?? [];
        return items.map((c: { id: number; denominacion: string }) => ({
          value: c.id,
          label: c.denominacion,
        }));
      }
      case 'tarea': {
        const items = tareasQuery.data?.data ?? [];
        return items.map((t: { id: number; titulo: string }) => ({
          value: t.id,
          label: t.titulo,
        }));
      }
      case 'liquidacion': {
        const items = liquidacionesQuery.data?.data ?? [];
        return items.map(
          (l: { id: number; periodo: string; impuesto?: string }) => ({
            value: l.id,
            label: [l.periodo, l.impuesto].filter(Boolean).join(' — '),
          }),
        );
      }
      default:
        return [];
    }
  }, [
    parentTypeChoice,
    clientesQuery.data,
    tareasQuery.data,
    liquidacionesQuery.data,
  ]);

  const selectedEntity = selectedEntityId
    ? entityOptions.find((o) => o.value === selectedEntityId)
    : null;

  const canUpload =
    selectedFile &&
    (!!presetParent ||
      parentTypeChoice === 'estudio' ||
      selectedEntityId !== null);

  // Build parent object
  const parent: ArchivoParent | null = useMemo(() => {
    if (presetParent) return presetParent;
    if (parentTypeChoice === 'estudio') {
      return { type: 'estudio' };
    }
    if (selectedEntityId) {
      return {
        type: parentTypeChoice as Exclude<ParentTypeChoice, 'estudio'>,
        id: selectedEntityId,
      } as ArchivoParent;
    }
    return null;
  }, [presetParent, parentTypeChoice, selectedEntityId]);

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !parent) return;
    const result = await upload(
      selectedFile,
      parent,
      tipoValue !== 'all' ? tipoValue : undefined,
      periodoValue || undefined,
    );
    if (result) {
      onSuccess();
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      onOpenChange(false);
    }
  }, [
    selectedFile,
    parent,
    tipoValue,
    periodoValue,
    upload,
    onSuccess,
    reset,
    onOpenChange,
  ]);

  const handleCancel = useCallback(() => {
    if (status === 'uploading') abort();
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  }, [status, abort, onOpenChange]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) handleCancel();
      else onOpenChange(true);
    },
    [handleCancel, onOpenChange],
  );

  // Derived state
  const isImage = selectedFile?.type.startsWith('image/');
  const isUploading = status === 'uploading';
  const hasError = status === 'error';
  const extension = selectedFile?.name.split('.').pop() ?? '';

  const PreviewIcon =
    selectedFile && !isImage ? fileIcon(selectedFile.type, extension) : null;

  let title: string;
  let description: string;
  if (!selectedFile) {
    title = t('archivos.modal.title', { defaultValue: 'Subir archivo' });
    description = t('archivos.modal.description.select', {
      defaultValue:
        'Arrastrá o seleccioná un archivo PDF, imagen, Word o Excel.',
    });
  } else if (isUploading) {
    title = t('archivos.modal.uploading', { defaultValue: 'Subiendo...' });
    description = t('archivos.modal.description.uploading', {
      defaultValue: 'Por favor esperá mientras se sube el archivo.',
    });
  } else {
    title = t('archivos.modal.confirm.title', {
      defaultValue: '¿Subir este archivo?',
    });
    description = t('archivos.modal.description.confirm', {
      defaultValue: 'Revisá el archivo y confirmá para subirlo.',
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!selectedFile ? (
          <UploadDropzone onUpload={handleFileSelected} />
        ) : (
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

            {/* --- Form fields: parent, tipo, periodo --- */}
            <div className="space-y-3">
              {/* Parent type select — hidden when parent is pre-set */}
              {showParentPicker && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {t('archivos.modal.parentLabel', {
                        defaultValue: 'Adjuntar a',
                      })}
                    </Label>
                    <Select
                      value={parentTypeChoice}
                      onValueChange={(v) => {
                        setParentTypeChoice(v as ParentTypeChoice);
                        setSelectedEntityId(null);
                        setEntitySearch('');
                        setComboboxOpen(false);
                      }}
                      disabled={isUploading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">
                          {t('archivos.modal.parentType.cliente', {
                            defaultValue: 'Cliente',
                          })}
                        </SelectItem>
                        <SelectItem value="tarea">
                          {t('archivos.modal.parentType.tarea', {
                            defaultValue: 'Tarea',
                          })}
                        </SelectItem>
                        <SelectItem value="liquidacion">
                          {t('archivos.modal.parentType.liquidacion', {
                            defaultValue: 'Liquidación',
                          })}
                        </SelectItem>
                        <SelectItem value="estudio">
                          {t('archivos.modal.parentType.estudio', {
                            defaultValue: 'Estudio (general)',
                          })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Entity picker (except estudio) — shadcn Combobox */}
                  {parentTypeChoice !== 'estudio' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {parentTypeChoice === 'cliente'
                          ? t(
                              'archivos.modal.parentSearch.clientePlaceholder',
                              {
                                defaultValue: 'Buscar cliente...',
                              },
                            )
                          : parentTypeChoice === 'tarea'
                            ? t(
                                'archivos.modal.parentSearch.tareaPlaceholder',
                                {
                                  defaultValue: 'Buscar tarea...',
                                },
                              )
                            : t(
                                'archivos.modal.parentSearch.liquidacionPlaceholder',
                                {
                                  defaultValue: 'Buscar liquidación...',
                                },
                              )}
                      </Label>
                      <div className="flex gap-1">
                        <Popover
                          open={comboboxOpen}
                          onOpenChange={setComboboxOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={comboboxOpen}
                              aria-controls="parent-entity-combobox-list"
                              className="flex-1 justify-between font-normal"
                              disabled={isUploading}
                            >
                              {selectedEntity ? (
                                selectedEntity.label
                              ) : (
                                <span className="text-muted-foreground">
                                  {t(
                                    'archivos.modal.parentSearchPlaceholder',
                                    { defaultValue: 'Buscar...' },
                                  )}
                                </span>
                              )}
                              <Icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[400px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder={t(
                                  'archivos.modal.parentSearchPlaceholder',
                                  { defaultValue: 'Buscar...' },
                                )}
                                value={entitySearch}
                                onValueChange={setEntitySearch}
                              />
                              <CommandList id="parent-entity-combobox-list">
                                <CommandEmpty>
                                  {t(
                                    'archivos.modal.parentEmpty.noResults',
                                    { defaultValue: 'Sin resultados' },
                                  )}
                                </CommandEmpty>
                                <CommandGroup>
                                  {entityOptions.map((opt) => (
                                    <CommandItem
                                      key={opt.value}
                                      value={opt.label}
                                      onSelect={() => {
                                        setSelectedEntityId(opt.value);
                                        setEntitySearch('');
                                        setComboboxOpen(false);
                                      }}
                                    >
                                      <Icons.check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          selectedEntityId === opt.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {opt.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {selectedEntity && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => {
                              setSelectedEntityId(null);
                            }}
                            disabled={isUploading}
                          >
                            <Icons.close className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Tipo */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {t('archivos.table.type', { defaultValue: 'Tipo' })}
                </Label>
                <Select
                  value={tipoValue}
                  onValueChange={(v) =>
                    setTipoValue(v as TipoArchivo | 'all')
                  }
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('archivos.filter.tipoAll', {
                        defaultValue: '—',
                      })}
                    </SelectItem>
                    {TIPO_ARCHIVO_VALUES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {TIPO_ARCHIVO_LABELS[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Periodo */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {t('archivos.table.period', { defaultValue: 'Período' })}
                </Label>
                <Input
                  value={periodoValue}
                  onChange={(e) => setPeriodoValue(e.target.value)}
                  placeholder="2026-06"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-muted-foreground text-center text-xs">
                  {progress}%
                </p>
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
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isUploading}
              >
                {t('archivos.modal.confirm.cancel', {
                  defaultValue: 'Cancelar',
                })}
              </Button>
              {!isUploading && (
                <Button onClick={handleUpload} disabled={!canUpload}>
                  {t('archivos.modal.confirm.upload', {
                    defaultValue: 'Subir',
                  })}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
