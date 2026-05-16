import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from './service';
import { emailTemplateKeys } from './queries';
import type { CreateEmailTemplatePayload, UpdateEmailTemplatePayload } from './types';

export const createEmailTemplateMutation = mutationOptions({
  mutationFn: (data: CreateEmailTemplatePayload) => createEmailTemplate(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: emailTemplateKeys.all });
  },
});

export const updateEmailTemplateMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: UpdateEmailTemplatePayload }) =>
    updateEmailTemplate(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: emailTemplateKeys.all });
  },
});

export const deleteEmailTemplateMutation = mutationOptions({
  mutationFn: (id: number) => deleteEmailTemplate(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: emailTemplateKeys.all });
  },
});
