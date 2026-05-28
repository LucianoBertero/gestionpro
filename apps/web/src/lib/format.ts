/**
 * Shared date formatting utilities.
 * All dates are formatted using es-AR locale.
 */
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const LOCALE = es;

export function formatDate(input: Date | string | undefined | null): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  return format(date, 'dd MMM yyyy', { locale: LOCALE });
}

export function formatDateShort(input: Date | string | undefined | null): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  return format(date, 'dd/MM/yyyy', { locale: LOCALE });
}

export function formatDateTime(input: Date | string | undefined | null): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  return format(date, "d MMM yyyy, HH:mm", { locale: LOCALE });
}

export function formatRelative(input: Date | string | undefined | null): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  return formatDistanceToNow(date, { addSuffix: true, locale: LOCALE });
}
