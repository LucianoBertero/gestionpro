/**
 * CUIT Utilities - Backend shared formatting and validation
 * Formato: XX-XXXXXXXX-X (11 dígitos, patrón: DD-DDDDDDDD-D)
 */

/**
 * Limpia el CUIT de caracteres no dígitos
 */
export function cleanCuit(cuit: string): string {
  return cuit.replace(/\D/g, '');
}

/**
 * Valida que el CUIT tenga exactamente 11 dígitos
 */
export function isValidCuit(cuit: string): boolean {
  const cleaned = cleanCuit(cuit);
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
}

/**
 * Formatea el CUIT al patrón XX-XXXXXXXX-X
 */
export function formatCuit(cuit: string): string {
  const cleaned = cleanCuit(cuit);

  if (cleaned.length !== 11) {
    return cuit;
  }

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

/**
 * Normaliza CUIT: limpia, valida y formatea
 */
export function normalizeCuit(cuit: string): string {
  if (!cuit) return '';

  const trimmed = cuit.trim();

  if (!isValidCuit(trimmed)) {
    return '';
  }

  return formatCuit(trimmed);
}
