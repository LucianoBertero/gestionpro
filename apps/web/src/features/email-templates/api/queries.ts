import { queryOptions } from '@tanstack/react-query';
import { getEmailTemplates, getEmailTemplate } from './service';

export const emailTemplateKeys = {
  all: ['email-templates'] as const,
  list: () => [...emailTemplateKeys.all, 'list'] as const,
  detail: (id: number) => [...emailTemplateKeys.all, 'detail', id] as const,
};

export const emailTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: emailTemplateKeys.list(),
    queryFn: getEmailTemplates,
  });

export const emailTemplateQueryOptions = (id: number) =>
  queryOptions({
    queryKey: emailTemplateKeys.detail(id),
    queryFn: () => getEmailTemplate(id),
  });
