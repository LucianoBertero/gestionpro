/**
 * CUIT Utilities - Shared formatting and validation
 * Formato: XX-XXXXXXXX-X (11 dígitos, patrón: DD-DDDDDDDD-D)
 */

/**
 * Limpia el CUIT de caracteres no dígitos
 * @example cleanCuit('30-12345678-9') => '30123456789'
 */
export function cleanCuit(cuit: string): string {
  return cuit.replace(/\D/g, '');
}

/**
 * Valida que el CUIT tenga exactamente 11 dígitos
 * @example isValidCuit('30123456789') => true
 * @example isValidCuit('3012345678') => false
 */
export function isValidCuit(cuit: string): boolean {
  const cleaned = cleanCuit(cuit);
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
}

/**
 * Formatea el CUIT al patrón XX-XXXXXXXX-X
 * @example formatCuit('30123456789') => '30-12345678-9'
 * @example formatCuit('30-12345678-9') => '30-12345678-9' (idempotent)
 */
export function formatCuit(cuit: string): string {
  const cleaned = cleanCuit(cuit);

  if (cleaned.length !== 11) {
    return cuit; // Return as-is if invalid length
  }

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

/**
 * Normaliza CUIT: limpia, valida y formatea
 * Útil como transformación en forms
 * @example normalizeCuit('30-12345678-9') => '30-12345678-9'
 * @example normalizeCuit('30123456789') => '30-12345678-9'
 * @example normalizeCuit('301234567') => '' (invalid, returns empty)
 */
export function normalizeCuit(cuit: string): string {
  if (!cuit) return '';

  const trimmed = cuit.trim();

  if (!isValidCuit(trimmed)) {
    return '';
  }

  return formatCuit(trimmed);
}
