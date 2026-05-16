'use client';

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  completarTareaMutation,
  deleteTareaMutation,
} from '../../api/mutations';
import type { Tarea } from '../../api/types';

interface CellActionProps {
  row: Row<Tarea>;
  onEdit?: (tarea: Tarea) => void;
}

export function CellAction({ row, onEdit }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const tarea = row.original;

  const completar = useMutation(completarTareaMutation);
  const eliminar = useMutation(deleteTareaMutation);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Icons.moreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {tarea.estado !== 'COMPLETADA' && (
          <DropdownMenuItem
            onClick={() => completar.mutate(tarea.id)}
            disabled={completar.isPending}
          >
            <Icons.toastSuccess className="mr-2 h-4 w-4 text-green-600" />
            Completar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => { onEdit?.(tarea); setOpen(false); }}>
          <Icons.edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => eliminar.mutate(tarea.id)}
          disabled={eliminar.isPending}
          className="text-red-600"
        >
          <Icons.trash className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
