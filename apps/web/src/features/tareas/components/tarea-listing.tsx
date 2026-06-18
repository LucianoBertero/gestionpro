'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tareasQueryOptions } from '../api/queries';
import { activeUsersQueryOptions } from '@/features/clientes/api/queries';
import { TareasTable } from './tareas-table/index';
import { TareaFormSheet } from './tarea-form-sheet';
import type { Tarea } from '../api/types';
import type { ActiveUser } from '@/features/auth/api/types';

export function TareaListing() {
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);

  const { data, isLoading } = useQuery(tareasQueryOptions());
  const { data: users } = useQuery(activeUsersQueryOptions());

  const tareas = data?.data ?? [];
  const encargados = (users as ActiveUser[]) ?? [];

  const handleEdit = (tarea: Tarea) => {
    setEditingTarea(tarea);
  };

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col gap-4'>
        <div className='bg-muted h-10 w-full rounded animate-pulse' />
        <div className='bg-muted h-96 w-full rounded-lg animate-pulse' />
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <TareasTable data={tareas} users={encargados} onEdit={handleEdit} />

      <TareaFormSheet
        open={!!editingTarea}
        onOpenChange={(open) => {
          if (!open) setEditingTarea(null);
        }}
        tarea={editingTarea}
        encargados={encargados}
      />
    </div>
  );
}
