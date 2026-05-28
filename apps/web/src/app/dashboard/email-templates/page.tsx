'use client';

import { useState } from 'react';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      {creating || editing ? (
        <TemplateEditor
          template={editing}
          onSave={(data) => {
            if ('id' in data) {
              updateMutation.mutate({ id: data.id, values: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No hay plantillas creadas
                  </TableCell>
                </TableRow>
              ) : (
                items.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">{tpl.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={getTipoTemplateBadgeVariant(tpl.tipo)}>
                        {tpl.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {tpl.asunto}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tpl.activo ? 'default' : 'secondary'}>
                        {tpl.activo ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(tpl)}
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('¿Eliminar esta plantilla?')) deleteMutation.mutate(tpl.id);
                          }}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
}
