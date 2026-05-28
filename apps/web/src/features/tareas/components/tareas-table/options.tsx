'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSuspenseQuery } from '@tanstack/react-query';
import { activeUsersQueryOptions } from '@/features/clientes/api/queries';
import {
  PRIORIDAD_VALUES,
  PRIORIDAD_LABELS,
  ESTADO_TAREA_VALUES,
  ESTADO_TAREA_LABELS,
} from '@/constants';
import type { Table } from '@tanstack/react-table';

interface TareasTableOptionsProps<TData> {
  table: Table<TData>;
  search: string;
  setSearch: (value: string) => void;
  estadoFilter: string;
  setEstadoFilter: (value: string) => void;
  prioridadFilter: string;
  setPrioridadFilter: (value: string) => void;
  encargadoFilter: string;
  setEncargadoFilter: (value: string) => void;
}

export function TareasTableOptions<TData>({
  table,
  search,
  setSearch,
  estadoFilter,
  setEstadoFilter,
  prioridadFilter,
  setPrioridadFilter,
  encargadoFilter,
  setEncargadoFilter,
}: TareasTableOptionsProps<TData>) {
  const { data: users } = useSuspenseQuery(activeUsersQueryOptions());

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <span className="text-xs text-muted-foreground mb-1 block">Buscar</span>
        <Input
          placeholder="Titulo, cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-[200px]"
        />
      </div>
      <div className="relative">
        <span className="text-xs text-muted-foreground mb-1 block">Estado</span>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {ESTADO_TAREA_VALUES.map((e) => (
              <SelectItem key={e} value={e}>
                {ESTADO_TAREA_LABELS[e]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <span className="text-xs text-muted-foreground mb-1 block">Prioridad</span>
        <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PRIORIDAD_VALUES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORIDAD_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <span className="text-xs text-muted-foreground mb-1 block">Encargado</span>
        <Select value={encargadoFilter} onValueChange={setEncargadoFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {users?.map((u: { id: string; nombre: string }) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
