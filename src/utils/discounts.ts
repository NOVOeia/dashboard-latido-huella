import { supabase } from './supabase';

export interface DiscountCode {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // percentage 1-100 OR cents for fixed
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface DiscountValidationResult {
  valid: boolean;
  discount?: DiscountCode;
  message?: string;
}

export async function validateDiscountCode(
code: string)
: Promise<DiscountValidationResult> {
  if (!code || code.trim() === '') {
    return { valid: false, message: 'Ingresa un código' };
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    // Use ilike for case-insensitive match in case codes are stored differently
    const { data, error } = await supabase.
    from('discount_codes').
    select('*').
    ilike('code', cleanCode).
    maybeSingle();

    if (error) {
      console.error('[discount] Supabase error:', error);
      return {
        valid: false,
        message: `Error al validar: ${error.message}`
      };
    }

    if (!data) {
      console.warn('[discount] Code not found in DB:', cleanCode);
      return { valid: false, message: 'Código de descuento inválido' };
    }

    console.log('[discount] Code found:', data);

    const discount = data as DiscountCode;

    // Check active flag (support both is_active and active for safety)
    const isActive =
    'is_active' in discount ?
    discount.is_active :
    (discount as any).active !== false;
    if (!isActive) {
      return { valid: false, message: 'Este código ya no está activo' };
    }

    // Check expiration
    if (discount.expires_at) {
      const expiresDate = new Date(discount.expires_at);
      if (expiresDate <= new Date()) {
        return { valid: false, message: 'Este código ha expirado' };
      }
    }

    // Check usage limit
    if (
    discount.max_uses !== null &&
    discount.max_uses !== undefined &&
    (discount.used_count ?? 0) >= discount.max_uses)
    {
      return {
        valid: false,
        message: 'Este código ha alcanzado su límite de uso'
      };
    }

    return { valid: true, discount };
  } catch (err: any) {
    console.error('[discount] Unexpected error:', err);
    return {
      valid: false,
      message: `Error inesperado: ${err?.message || 'desconocido'}`
    };
  }
}

/**
 * Returns the discount amount in the same unit as subtotal (pesos or cents — caller decides).
 * For percentage: discount = subtotal * (discount_value / 100)
 * For fixed: discount_value is in CENTS, so caller must convert if subtotal is in pesos.
 *
 * Caminata5KPage works in pesos, so we expose a helper that handles both.
 */
export function calculateDiscount(
subtotalInPesos: number,
discount: DiscountCode)
: number {
  if (discount.discount_type === 'percentage') {
    return Math.round(subtotalInPesos * (discount.discount_value / 100));
  }
  // 'fixed' — discount_value is in cents per spec
  const discountInPesos = Math.round(discount.discount_value / 100);
  return Math.min(discountInPesos, subtotalInPesos);
}