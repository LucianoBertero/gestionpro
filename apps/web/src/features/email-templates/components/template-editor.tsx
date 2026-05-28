'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [nombre, setNombre] = useState(template?.nombre ?? '');
  const [tipo, setTipo] = useState<TipoTemplate>(template?.tipo ?? 'GENERAL');
  const [asunto, setAsunto] = useState(template?.asunto ?? '');
  const [cuerpo, setCuerpo] = useState(template?.cuerpo ?? '');

  useEffect(() => {
    setNombre(template?.nombre ?? '');
    setTipo(template?.tipo ?? 'GENERAL');
    setAsunto(template?.asunto ?? '');
    setCuerpo(template?.cuerpo ?? '');
  }, [template]);

  const preview = useMemo(() => {
    return sanitizePreviewHtml(replaceTemplateVars(cuerpo))
      .replace(/{{cliente}}/g, 'Juan Pérez')
      .replace(/{{periodo}}/g, '2026-05')
      .replace(/{{impuesto}}/g, 'IVA')
      .replace(/{{vencimiento}}/g, '15/06/2026')
      .replace(/{{importe}}/g, '$ 25,000')
      .replace(/{{estudio}}/g, 'Estudio BB');
  }, [cuerpo]);

  const subjectPreview = useMemo(() => {
    return asunto.replace(/{{(\w+)}}/g, (_, key) => {
      const vars: Record<string, string> = {
        cliente: 'Juan Pérez',
        periodo: '2026-05',
        impuesto: 'IVA',
        vencimiento: '15/06/2026',
        importe: '$ 25,000',
        estudio: 'Estudio BB',
      };

      return vars[key] ?? `{{${key}}}`;
    });
  }, [asunto]);

  function replaceTemplateVars(value: string) {
    return value
      .replace(/{{cliente}}/g, 'Juan Pérez')
      .replace(/{{periodo}}/g, '2026-05')
      .replace(/{{impuesto}}/g, 'IVA')
      .replace(/{{vencimiento}}/g, '15/06/2026')
      .replace(/{{importe}}/g, '$ 25,000')
      .replace(/{{estudio}}/g, 'Estudio BB');
  }

  function sanitizePreviewHtml(html: string) {
    if (typeof DOMParser === 'undefined') {
      return html.replace(/<script[\s\S]*?<\/script>/gi, '');
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    document.querySelectorAll('script, iframe, object, embed').forEach((element) => {
      element.remove();
    });

    document.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        if (attribute.name.startsWith('on')) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    return document.body.innerHTML;
  }

  const updateBodyAtCursor = (insertText: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setCuerpo((prev) => `${prev}${insertText}`);
      return;
    }

    const start = textarea.selectionStart ?? cuerpo.length;
    const end = textarea.selectionEnd ?? cuerpo.length;
    const nextValue = `${cuerpo.slice(0, start)}${insertText}${cuerpo.slice(end)}`;
    setCuerpo(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + insertText.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleInsertImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      const dataUrl = await readFileAsDataUrl(file);
      updateBodyAtCursor(`\n<img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; border-radius: 12px; display: block; margin: 12px 0;" />\n`);
    }

    event.target.value = '';
  };

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

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
    updateBodyAtCursor(varName);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border bg-background p-6 shadow-sm'>
      <input ref={imageInputRef} type='file' accept='image/*' className='hidden' multiple onChange={handleImageSelected} />

      <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>{template ? 'Editar plantilla' : 'Nueva plantilla'}</h2>
          <p className='text-muted-foreground text-sm'>Armá correos con variables, imágenes y vista previa en vivo.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {VARIABLES.slice(0, 3).map((v) => (
            <Button
              key={v.name}
              type='button'
              variant='outline'
              size='sm'
              className='text-xs'
              onClick={() => insertVariable(v.name)}
              title={v.desc}
            >
              {v.name}
            </Button>
          ))}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='nombre'>Nombre</Label>
          <Input
            id='nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder='Ej: Recordatorio Vencimiento IVA'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='tipo'>Tipo</Label>
          <Select value={tipo} onValueChange={(v: TipoTemplate) => setTipo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='VENCIMIENTO'>Vencimiento</SelectItem>
              <SelectItem value='LIQUIDACION'>Liquidación</SelectItem>
              <SelectItem value='RECORDATORIO'>Recordatorio</SelectItem>
              <SelectItem value='GENERAL'>General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='asunto'>Asunto</Label>
        <Input
          id='asunto'
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder='Ej: Vencimiento {{impuesto}} - Período {{periodo}}'
          required
        />
      </div>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'>
        <div className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <Label htmlFor='cuerpo'>Cuerpo del email</Label>
              <p className='text-muted-foreground text-sm'>Podés escribir HTML simple e insertar imágenes.</p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button type='button' variant='outline' size='sm' onClick={handleInsertImage}>
                <Icons.upload className='mr-2 h-4 w-4' />
                Subir imagen
              </Button>
              {VARIABLES.slice(3).map((v) => (
                <Button
                  key={v.name}
                  type='button'
                  variant='outline'
                  size='sm'
                  className='text-xs'
                  onClick={() => insertVariable(v.name)}
                  title={v.desc}
                >
                  {v.name}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            id='cuerpo'
            ref={textareaRef}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            placeholder='Escribí el cuerpo del email. Podés usar {{variables}} o pegar HTML.'
            rows={18}
            required
            className='min-h-[420px] font-mono text-sm'
          />

          <div className='rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground'>
            Las imágenes se insertan como contenido embebido en el template. Si querés enviarlas más adelante como archivo externo, después lo podemos llevar a storage.
          </div>
        </div>

        <div className='space-y-4 rounded-2xl border bg-gradient-to-br from-muted/40 to-background p-5'>
          <div>
            <div className='text-lg font-semibold'>Vista previa</div>
            <div className='text-muted-foreground text-sm'>Así va a quedar el contenido al reemplazar variables.</div>
          </div>

          <div className='rounded-2xl border bg-background p-4 shadow-sm'>
            <div className='text-muted-foreground mb-3 text-xs uppercase tracking-wide'>Asunto</div>
            <div className='font-medium break-words'>{subjectPreview || 'Sin asunto'}</div>
          </div>

          <div className='rounded-2xl border bg-card p-5 shadow-sm'>
            <div
              className='prose prose-sm dark:prose-invert max-w-none leading-relaxed'
              dangerouslySetInnerHTML={{
                __html: preview.replace(/\n/g, '<br />'),
              }}
            />
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button type='submit' className='min-w-[140px]'>
          <Icons.check className='mr-2 h-4 w-4' />
          {template ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
