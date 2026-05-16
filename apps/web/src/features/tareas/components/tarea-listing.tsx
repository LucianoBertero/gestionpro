'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { tareasQueryOptions } from '../api/queries';
import { activeUsersQueryOptions } from '@/features/clientes/api/queries';
import { TareasTable } from './tareas-table/index';
import { TareaFormSheet } from './tarea-form-sheet';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Tarea } from '../api/types';

export function TareaListing() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);

  const { data } = useSuspenseQuery(tareasQueryOptions());
  const { data: users } = useSuspenseQuery(activeUsersQueryOptions());

  const tareas = data?.data ?? [];
  const encargados = (users as { id: string; nombre: string }[]) ?? [];

  const handleEdit = (tarea: Tarea) => {
    setEditingTarea(tarea);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditingTarea(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={handleNew} size="sm">
          <Icons.add className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <TareasTable data={tareas} onEdit={handleEdit} />

      <TareaFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        tarea={editingTarea}
        encargados={encargados}
      />
    </div>
  );
}
