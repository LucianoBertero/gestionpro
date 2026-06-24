'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n/client';
import { toast } from 'sonner';
import { duplicateVencimientosYearMutation } from '../api/mutations';

const CURRENT_YEAR = new Date().getFullYear();

interface DuplicateYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateYearDialog({ open, onOpenChange }: DuplicateYearDialogProps) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const mutation = useMutation(duplicateVencimientosYearMutation);

  const [sourceYear, setSourceYear] = useState(CURRENT_YEAR - 1);
  const [targetYear, setTargetYear] = useState(CURRENT_YEAR);

  const handleSubmit = async () => {
    if (!sourceYear || !targetYear) return;

    try {
      const result = await mutation.mutateAsync({ sourceYear, targetYear });
      toast.success(
        tr('vencimiento.duplicate.success', '{{count}} vencimientos duplicados').replace('{{count}}', String(result.created ?? 0)),
      );
      onOpenChange(false);
    } catch {
      toast.error(tr('vencimiento.duplicate.error', 'No se pudo duplicar el año'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{tr('vencimiento.duplicate.title', 'Duplicar año')}</DialogTitle>
          <DialogDescription>
            {tr('vencimiento.duplicate.warning', 'Esto va a crear/actualizar vencimientos para el año de destino. Los existentes con el mismo (impuesto, año, mes, dígito) se sobrescribirán.')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>{tr('vencimiento.duplicate.sourceYear', 'Año de origen')}</Label>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={sourceYear}
              onChange={(e) => setSourceYear(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>{tr('vencimiento.duplicate.targetYear', 'Año de destino')}</Label>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={targetYear}
              onChange={(e) => setTargetYear(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tr('vencimiento.form.cancel', 'Cancelar')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!sourceYear || !targetYear}
            isLoading={mutation.isPending}
          >
            {tr('vencimiento.duplicate.confirm', 'Duplicar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
