'use client';

import { useMemo } from 'react';
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

  const estados = useMemo(() => ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'], []);
  const prioridades = useMemo(() => ['ALTA', 'MEDIA', 'BAJA'], []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Buscar tareas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-[200px]"
      />
      <Select value={estadoFilter} onValueChange={setEstadoFilter}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {estados.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {prioridades.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={encargadoFilter} onValueChange={setEncargadoFilter}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Encargado" />
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
  );
}
