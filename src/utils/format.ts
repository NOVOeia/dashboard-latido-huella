// =====================================================
// 💰 Format helpers — Colombian peso + IVA calculation
// =====================================================
// Use these utilities EVERYWHERE prices are displayed
// or sent to the payment gateway, to keep formatting and
// tax math consistent across the app.

export const IVA_RATE = 0.19;

/**
 * Formats a number as Colombian pesos with thousand separators.
 * Example: 500000 → "$500.000"
 */
export function formatCOP(value: number): string {
  if (!Number.isFinite(value)) return '$0';
  const rounded = Math.round(value);
  return `$${rounded.toLocaleString('es-CO')}`;
}

/**
 * Returns the IVA (19%) for a given net (pre-tax) amount.
 * Example: withIVA(100000).iva === 19000
 */
export function calculateIVA(netAmount: number): number {
  return Math.round(netAmount * IVA_RATE);
}

/**
 * Returns the total INCLUDING 19% IVA. Result is rounded to integer pesos.
 * Example: withIVA(100000) === 119000
 */
export function withIVA(netAmount: number): number {
  return Math.round(netAmount * (1 + IVA_RATE));
}

/**
 * Returns the IVA-inclusive total expressed in cents (for Wompi/Stripe).
 * Example: withIVAInCents(100000) === 11900000
 */
export function withIVAInCents(netAmount: number): number {
  return withIVA(netAmount) * 100;
}

/**
 * Returns a structured breakdown for UIs that show subtotal / IVA / total.
 */
export function priceBreakdown(netAmount: number) {
  const subtotal = Math.round(netAmount);
  const iva = calculateIVA(subtotal);
  const total = subtotal + iva;
  return { subtotal, iva, total };
}