'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { DatePicker } from '@/components/ui/date-picker';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { useT } from '@/lib/i18n/client';
import { formatFileSize, formatRelative } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { NULL_PLACEHOLDER } from '@/constants';
import {
  archivosQueryOptions,
  archivosKeys,
} from '@/features/archivos/api/queries';
import { deleteArchivo } from '@/features/archivos/api/service';
import { UploadModal } from '@/features/archivos/components/upload-modal';
import type {
  TipoArchivo,
  ArchivoWithParent,
} from '@/features/archivos/api/types';
import { TIPO_ARCHIVO_BADGE, TIPO_ARCHIVO_VALUES, TIPO_ARCHIVO_LABELS } from '@/features/archivos/constants';

import { toast } from 'sonner';

type ParentTypeFilter = 'all' | 'cliente' | 'tarea' | 'liquidacion' | 'estudio';
type DatePreset = 'none' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

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

function parentIcon(type: string) {
  switch (type) {
    case 'cliente':
      return Icons.building;
    case 'tarea':
      return Icons.tasks;
    case 'liquidacion':
      return Icons.calculator;
    default:
      return Icons.workspace;
  }
}

// ---- FilterBar ----

interface FilterBarProps {
  search: string;
  tipo: string;
  parentType: ParentTypeFilter;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  datePreset: DatePreset;
  onSearchChange: (v: string) => void;
  onTipoChange: (v: string) => void;
  onParentTypeChange: (v: ParentTypeFilter) => void;
  onDateFromChange: (v: Date | undefined) => void;
  onDateToChange: (v: Date | undefined) => void;
  onDatePresetChange: (v: DatePreset) => void;
  onClear: () => void;
}

function FilterBar({
  search,
  tipo,
  parentType,
  dateFrom,
  dateTo,
  datePreset,
  onSearchChange,
  onTipoChange,
  onParentTypeChange,
  onDateFromChange,
  onDateToChange,
  onDatePresetChange,
  onClear,
}: FilterBarProps) {
  const t = useT();
  const hasFilters =
    search || tipo !== 'all' || parentType !== 'all' || dateFrom || dateTo;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <Label htmlFor="search" className="text-xs">
          {t('archivos.filter.searchPlaceholder', {
            defaultValue: 'Buscar por nombre...',
          })}
        </Label>
        <div className="relative">
          <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('archivos.filter.searchPlaceholder', {
              defaultValue: 'Buscar por nombre...',
            })}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          {t('archivos.filter.tipoLabel', { defaultValue: 'Tipo' })}
        </Label>
        <Select value={tipo} onValueChange={onTipoChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('archivos.filter.tipoAll', { defaultValue: 'Todos' })}
            </SelectItem>
            {TIPO_ARCHIVO_VALUES.map((v) => (
              <SelectItem key={v} value={v}>
                {TIPO_ARCHIVO_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          {t('archivos.filter.parentTypeLabel', { defaultValue: 'Padre' })}
        </Label>
        <Select
          value={parentType}
          onValueChange={(v) => onParentTypeChange(v as ParentTypeFilter)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('archivos.filter.parentTypeAll', { defaultValue: 'Todos' })}
            </SelectItem>
            <SelectItem value="cliente">
              {t('archivos.parent.cliente', { defaultValue: 'Cliente' })}
            </SelectItem>
            <SelectItem value="tarea">
              {t('archivos.parent.tarea', { defaultValue: 'Tarea' })}
            </SelectItem>
            <SelectItem value="liquidacion">
              {t('archivos.parent.liquidacion', {
                defaultValue: 'Liquidación',
              })}
            </SelectItem>
            <SelectItem value="estudio">
              {t('archivos.parent.estudio', { defaultValue: 'Estudio' })}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          {t('archivos.filter.datePresetLabel', {
            defaultValue: 'Período',
          })}
        </Label>
        <Select
          value={datePreset}
          onValueChange={(v) => onDatePresetChange(v as DatePreset)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {t('archivos.filter.datePreset.none', {
                defaultValue: 'Cualquier fecha',
              })}
            </SelectItem>
            <SelectItem value="today">
              {t('archivos.filter.datePreset.today', {
                defaultValue: 'Hoy',
              })}
            </SelectItem>
            <SelectItem value="last7">
              {t('archivos.filter.datePreset.last7', {
                defaultValue: 'Últimos 7 días',
              })}
            </SelectItem>
            <SelectItem value="last30">
              {t('archivos.filter.datePreset.last30', {
                defaultValue: 'Últimos 30 días',
              })}
            </SelectItem>
            <SelectItem value="thisMonth">
              {t('archivos.filter.datePreset.thisMonth', {
                defaultValue: 'Este mes',
              })}
            </SelectItem>
            <SelectItem value="custom">
              {t('archivos.filter.datePreset.custom', {
                defaultValue: 'Personalizado',
              })}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          {t('archivos.filter.dateFromLabel', { defaultValue: 'Desde' })}
        </Label>
        <DatePicker
          value={dateFrom}
          onChange={(v) => {
            onDateFromChange(v);
            onDatePresetChange('custom');
          }}
          placeholder={t('archivos.filter.dateFromLabel', {
            defaultValue: 'Desde',
          })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          {t('archivos.filter.dateToLabel', { defaultValue: 'Hasta' })}
        </Label>
        <DatePicker
          value={dateTo}
          onChange={(v) => {
            onDateToChange(v);
            onDatePresetChange('custom');
          }}
          placeholder={t('archivos.filter.dateToLabel', {
            defaultValue: 'Hasta',
          })}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          {t('archivos.filter.clear', { defaultValue: 'Limpiar filtros' })}
        </Button>
      )}
    </div>
  );
}

// ---- Page ----

const DEFAULT_FILTERS = {
  search: '',
  tipo: 'all' as string,
  parentType: 'all' as ParentTypeFilter,
  dateFrom: undefined as Date | undefined,
  dateTo: undefined as Date | undefined,
  datePreset: 'none' as DatePreset,
  page: 1,
  limit: 20,
};

export default function ArchivosPage() {
  const t = useT();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState(DEFAULT_FILTERS.search);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [tipo, setTipo] = useState(DEFAULT_FILTERS.tipo);
  const [parentType, setParentType] = useState<ParentTypeFilter>(
    DEFAULT_FILTERS.parentType,
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    DEFAULT_FILTERS.dateFrom,
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    DEFAULT_FILTERS.dateTo,
  );
  const [datePreset, setDatePreset] = useState<DatePreset>(
    DEFAULT_FILTERS.datePreset,
  );
  const [page, setPage] = useState(DEFAULT_FILTERS.page);

  const queryClient = getQueryClient();

  const filters = {
    search: debouncedSearch || undefined,
    tipo: tipo !== 'all' ? (tipo as TipoArchivo) : undefined,
    parentType,
    dateFrom: dateFrom
      ? dateFrom.toISOString().slice(0, 10)
      : undefined,
    dateTo: dateTo
      ? dateTo.toISOString().slice(0, 10)
      : undefined,
    page,
    limit: DEFAULT_FILTERS.limit,
  };

  const { data, isLoading } = useQuery(archivosQueryOptions(filters));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteArchivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: archivosKeys.all,
        refetchType: 'active',
      });
      toast.success(
        t('archivos.delete.success', { defaultValue: 'Archivo eliminado' }),
      );
    },
    onError: () =>
      toast.error(
        t('archivos.delete.error', {
          defaultValue: 'No se pudo eliminar el archivo',
        }),
      ),
  });

  const handleUploadSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: archivosKeys.all,
      refetchType: 'active',
    });
  }, [queryClient]);

  const handleDatePresetChange = useCallback(
    (value: DatePreset) => {
      setDatePreset(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (value === 'today') {
        setDateFrom(today);
        setDateTo(today);
      } else if (value === 'last7') {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        setDateFrom(d);
        setDateTo(today);
      } else if (value === 'last30') {
        const d = new Date(today);
        d.setDate(d.getDate() - 30);
        setDateFrom(d);
        setDateTo(today);
      } else if (value === 'thisMonth') {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateFrom(first);
        setDateTo(today);
      } else if (value === 'none') {
        setDateFrom(undefined);
        setDateTo(undefined);
      }
      // 'custom': don't change dates — dates were already set by the user
      setPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setSearch(DEFAULT_FILTERS.search);
    setTipo(DEFAULT_FILTERS.tipo);
    setParentType(DEFAULT_FILTERS.parentType);
    setDateFrom(DEFAULT_FILTERS.dateFrom);
    setDateTo(DEFAULT_FILTERS.dateTo);
    setDatePreset(DEFAULT_FILTERS.datePreset);
    setPage(DEFAULT_FILTERS.page);
  }, []);

  const archivos: ArchivoWithParent[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_FILTERS.limit));

  const hasActiveFilters = useMemo(
    () =>
      debouncedSearch !== '' ||
      tipo !== 'all' ||
      parentType !== 'all' ||
      dateFrom !== undefined ||
      dateTo !== undefined,
    [debouncedSearch, tipo, parentType, dateFrom, dateTo],
  );

  return (
    <PageContainer
      pageTitle={t('archivos.title', { defaultValue: 'Archivos' })}
      pageDescription={t('archivos.description', {
        defaultValue: 'Gestión de archivos y documentos',
      })}
      pageHeaderAction={
        <Button onClick={() => setUploadOpen(true)}>
          <Icons.upload className="mr-2 h-4 w-4" />
          {t('archivos.upload.button', { defaultValue: 'Subir Archivo' })}
        </Button>
      }
    >
      <FilterBar
        search={search}
        tipo={tipo}
        parentType={parentType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        datePreset={datePreset}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onTipoChange={(v) => {
          setTipo(v);
          setPage(1);
        }}
        onParentTypeChange={(v) => {
          setParentType(v);
          setPage(1);
        }}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage(1);
        }}
        onDatePresetChange={handleDatePresetChange}
        onClear={clearFilters}
      />

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
                {t('archivos.table.parent', { defaultValue: 'Padre' })}
              </TableHead>
              <TableHead>
                {t('archivos.table.uploadedBy', {
                  defaultValue: 'Subido por',
                })}
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8} className="py-2">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : archivos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  {hasActiveFilters ? (
                    <div className="flex flex-col items-center gap-3">
                      <p>
                        {t('archivos.table.empty.filteredHint', {
                          defaultValue:
                            'No se encontraron archivos con los filtros aplicados',
                        })}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        {t('archivos.table.empty.filteredCta', {
                          defaultValue: 'Limpiar filtros',
                        })}
                      </Button>
                    </div>
                  ) : (
                    <p>
                      {t('archivos.table.empty.noFiles', {
                        defaultValue: 'No hay archivos todavía',
                      })}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              archivos.map((arc) => {
                const Icon = fileIcon(arc.mimeType, arc.extension);
                const ParentIcon = parentIcon(arc.parent.type);
                return (
                  <TableRow key={arc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1 max-w-[250px]">
                          {arc.originalName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={TIPO_ARCHIVO_BADGE[arc.tipo]}
                      >
                        {TIPO_ARCHIVO_LABELS[arc.tipo] || arc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {arc.periodo || NULL_PLACEHOLDER}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(arc.bytes)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <ParentIcon className="h-3.5 w-3.5" />
                        {arc.parent.type === 'cliente' && arc.parent.id ? (
                          <Link
                            href={`/dashboard/clientes/${arc.parent.id}`}
                            className="hover:underline"
                          >
                            {arc.parent.name || arc.parent.id}
                          </Link>
                        ) : arc.parent.type === 'estudio' ? (
                          <span>
                            {t('archivos.table.parent.estudio', {
                              defaultValue: 'Estudio',
                            })}
                          </span>
                        ) : (
                          <span>
                            {arc.parent.name ||
                              arc.parent.id ||
                              arc.parent.type}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {arc.subidoPorNombre || arc.subidoPorId.slice(0, 8) || NULL_PLACEHOLDER}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > DEFAULT_FILTERS.limit && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('archivos.pagination.pageOf', {
              defaultValue: `Página ${page} de ${totalPages}`,
              page,
              total: totalPages,
            })}
            {' · '}
            {total} {t('common.total', { defaultValue: 'Total' }).toLowerCase()}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                >
                  <Icons.chevronLeft className="h-4 w-4" />
                  <span className="ml-1">
                    {t('archivos.pagination.previous', {
                      defaultValue: 'Anterior',
                    })}
                  </span>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                >
                  <span className="mr-1">
                    {t('archivos.pagination.next', {
                      defaultValue: 'Siguiente',
                    })}
                  </span>
                  <Icons.chevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
      />
    </PageContainer>
  );
}
