'use client';

import { useState } from 'react';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { useT } from '@/lib/i18n/client';
import { getTipoTemplateBadgeVariant } from '@/constants';
import {
  emailTemplatesQueryOptions,
  emailTemplateKeys,
} from '@/features/email-templates/api/queries';
import { deleteEmailTemplate, createEmailTemplate, updateEmailTemplate } from '@/features/email-templates/api/service';
import { TemplateEditor } from '@/features/email-templates/components/template-editor';
import type { EmailTemplate, CreateEmailTemplatePayload, UpdateEmailTemplatePayload } from '@/features/email-templates/api/types';

export default function EmailTemplatesPage() {
  const t = useT();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const { data: templates } = useSuspenseQuery(emailTemplatesQueryOptions());
  const queryClient = getQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateEmailTemplatePayload) => createEmailTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateEmailTemplatePayload }) =>
      updateEmailTemplate(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmailTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all }),
  });

  const items = templates ?? [];
  const activeCount = items.filter((template) => template.activo).length;
  const typeCount = new Set(items.map((template) => template.tipo)).size;

  const templatePreview = (value: string) =>
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);

  return (
    <PageContainer
      pageTitle="Plantillas de Email"
      pageDescription="Gestioná las plantillas de correo electrónico"
      pageHeaderAction={
        !creating && !editing ? (
          <Button onClick={() => setCreating(true)}>
            <Icons.add className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-0">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Total</div>
                <div className="text-2xl font-semibold">{items.length}</div>
              </CardContent>
            </Card>
            <Card className="p-0">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Activas</div>
                <div className="text-2xl font-semibold">{activeCount}</div>
              </CardContent>
            </Card>
            <Card className="p-0">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Tipos</div>
                <div className="text-2xl font-semibold">{typeCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b pb-5">
              <CardTitle className="text-lg">Plantillas guardadas</CardTitle>
              <CardDescription>Elegí una para editar o crear una nueva desde cero.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No hay plantillas creadas todavía.
                </div>
              ) : (
                items.map((tpl) => (
                  <div
                    key={tpl.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setEditing(tpl);
                      }
                    }}
                    onClick={() => setEditing(tpl)}
                    className={`group w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${editing?.id === tpl.id ? 'border-primary/40 bg-primary/5' : 'bg-background'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium">{tpl.nombre}</div>
                          <Badge variant={getTipoTemplateBadgeVariant(tpl.tipo)}>
                            {tpl.tipo}
                          </Badge>
                          <Badge variant={tpl.activo ? 'default' : 'secondary'}>
                            {tpl.activo ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground truncate text-sm">{tpl.asunto}</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          {templatePreview(tpl.cuerpo) || 'Sin contenido'}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditing(tpl);
                        }}
                      >
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (confirm('¿Eliminar esta plantilla?')) deleteMutation.mutate(tpl.id);
                        }}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {creating || editing ? (
            <TemplateEditor
              template={editing}
              onSave={(data) => {
                if ('id' in data) {
                  const { id, ...values } = data;
                  updateMutation.mutate({ id, values });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => { setCreating(false); setEditing(null); }}
            />
          ) : (
            <Card className="min-h-[520px] border-dashed bg-gradient-to-br from-muted/40 to-background">
              <CardContent className="flex h-full min-h-[520px] flex-col items-center justify-center p-10 text-center">
                <div className="bg-primary/10 text-primary mb-4 rounded-2xl p-4">
                  <Icons.edit className="h-8 w-8" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-semibold">Abrí una plantilla para editarla</h3>
                  <p className="text-muted-foreground text-sm">
                    Vas a ver el editor completo con variables, carga de imágenes y vista previa en vivo.
                  </p>
                </div>
                <Button className="mt-6" onClick={() => setCreating(true)}>
                  <Icons.add className="mr-2 h-4 w-4" />
                  Crear plantilla
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
