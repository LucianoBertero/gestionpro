'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import type { Comunicacion, CreateComunicacionPayload, UpdateComunicacionPayload } from '../api/types';

interface ComunicacionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Comunicacion | null;
  onSave: (data: CreateComunicacionPayload | (UpdateComunicacionPayload & { id: number })) => void;
  onDelete: (id: number) => void;
}

const TIPOS_COMUNICACION = ['EMAIL', 'LLAMADA', 'REUNION', 'WHATSAPP', 'OTRO'];

export function ComunicacionFormModal({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
}: ComunicacionFormModalProps) {
  const [clienteId, setClienteId] = useState<number>(0);
  const [tipo, setTipo] = useState('EMAIL');
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');

  useEffect(() => {
    if (item) {
      setClienteId(item.clienteId);
      setTipo(item.tipo);
      setAsunto(item.asunto ?? '');
      setContenido(item.contenido ?? '');
    } else {
      setClienteId(0);
      setTipo('EMAIL');
      setAsunto('');
      setContenido('');
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      onSave({ id: item.id, tipo, asunto: asunto || undefined, contenido: contenido || undefined });
    } else {
      onSave({ clienteId, tipo, asunto: asunto || undefined, contenido: contenido || undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Comunicación' : 'Nueva Comunicación'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!item && (
            <div className="space-y-2">
              <Label htmlFor="clienteId">ID del Cliente</Label>
              <Input
                id="clienteId"
                type="number"
                value={clienteId || ''}
                onChange={(e) => setClienteId(Number(e.target.value))}
                placeholder="Ingresá el ID del cliente"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_COMUNICACION.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asunto">Asunto</Label>
            <Input
              id="asunto"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Asunto de la comunicación"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">Contenido</Label>
            <Textarea
              id="contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Contenido de la comunicación"
              rows={5}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {item && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(item.id)}
                className="mr-auto"
              >
                <Icons.trash className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
