'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import type { EmailTemplate, CreateEmailTemplatePayload, UpdateEmailTemplatePayload, TipoTemplate } from '../api/types';

const VARIABLES = [
  { name: '{{cliente}}', desc: 'Nombre del cliente' },
  { name: '{{periodo}}', desc: 'Período (ej: 2026-05)' },
  { name: '{{impuesto}}', desc: 'Tipo de impuesto' },
  { name: '{{vencimiento}}', desc: 'Fecha de vencimiento' },
  { name: '{{importe}}', desc: 'Importe a pagar' },
  { name: '{{estudio}}', desc: 'Nombre del estudio' },
];

interface TemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: (data: CreateEmailTemplatePayload | (UpdateEmailTemplatePayload & { id: number })) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [nombre, setNombre] = useState(template?.nombre ?? '');
  const [tipo, setTipo] = useState<TipoTemplate>(template?.tipo ?? 'GENERAL');
  const [asunto, setAsunto] = useState(template?.asunto ?? '');
  const [cuerpo, setCuerpo] = useState(template?.cuerpo ?? '');

  const preview = useMemo(() => {
    return cuerpo
      .replace(/{{cliente}}/g, 'Juan Pérez')
      .replace(/{{periodo}}/g, '2026-05')
      .replace(/{{impuesto}}/g, 'IVA')
      .replace(/{{vencimiento}}/g, '15/06/2026')
      .replace(/{{importe}}/g, '$ 25,000')
      .replace(/{{estudio}}/g, 'Estudio BB');
  }, [cuerpo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (template) {
      onSave({
        id: template.id,
        nombre,
        tipo,
        asunto,
        cuerpo,
      });
    } else {
      onSave({ nombre, tipo, asunto, cuerpo });
    }
  };

  const insertVariable = (varName: string) => {
    setCuerpo((prev) => prev + varName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Recordatorio Vencimiento IVA"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={tipo} onValueChange={(v: TipoTemplate) => setTipo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VENCIMIENTO">Vencimiento</SelectItem>
              <SelectItem value="LIQUIDACION">Liquidación</SelectItem>
              <SelectItem value="RECORDATORIO">Recordatorio</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="asunto">Asunto</Label>
        <Input
          id="asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Vencimiento {{impuesto}} - Período {{periodo}}"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="cuerpo">Cuerpo</Label>
            <div className="flex gap-1">
              {VARIABLES.map((v) => (
                <Button
                  key={v.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => insertVariable(v.name)}
                  title={v.desc}
                >
                  {v.name}
                </Button>
              ))}
            </div>
          </div>
          <Textarea
            id="cuerpo"
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            placeholder="Escribí el cuerpo del email... Usá {{variable}} para datos dinámicos"
            rows={12}
            required
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>Vista previa</Label>
          <div className="min-h-[300px] rounded-lg border bg-card p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Asunto: {asunto.replace(/{{(\w+)}}/g, (_, key) => {
                const vars: Record<string, string> = {
                  cliente: 'Juan Pérez',
                  periodo: '2026-05',
                  impuesto: 'IVA',
                  vencimiento: '15/06/2026',
                  importe: '$ 25,000',
                  estudio: 'Estudio BB',
                };
                return vars[key] ?? `{{${key}}}`;
              })}
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: preview.replace(/\n/g, '<br />'),
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Icons.check className="mr-2 h-4 w-4" />
          {template ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
