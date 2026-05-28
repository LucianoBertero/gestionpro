import api from '@/lib/auth/axios-instance';
import type { EmailTemplate, CreateEmailTemplatePayload, UpdateEmailTemplatePayload } from './types';

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const { data } = await api.get('/v1/admin/email-templates');
  return data.data;
}

export async function getEmailTemplate(id: number): Promise<EmailTemplate> {
  const { data } = await api.get(`/v1/admin/email-templates/${id}`);
  return data.data;
}

export async function createEmailTemplate(payload: CreateEmailTemplatePayload): Promise<EmailTemplate> {
  const { data } = await api.post('/v1/admin/email-templates', payload);
  return data.data;
}

export async function updateEmailTemplate(id: number, payload: UpdateEmailTemplatePayload): Promise<EmailTemplate> {
  const { data } = await api.patch(`/v1/admin/email-templates/${id}`, payload);
  return data.data;
}

export async function deleteEmailTemplate(id: number): Promise<void> {
  await api.delete(`/v1/admin/email-templates/${id}`);
}
