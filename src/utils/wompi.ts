// =====================================================
// 💳 Wompi Checkout — URL builder con firma de integridad
// =====================================================
// Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/
//
// Flujo:
// 1) buildWompiCheckoutUrl({ reference, amountInCents, customer, redirectUrl })
// 2) window.location.href = url
// 3) Usuario paga en Wompi
// 4) Wompi llama tu webhook (n8n) y redirige al usuario a redirectUrl
// =====================================================

const WOMPI_PUBLIC_KEY = 'pub_test_L3NPjcWK62uxOU6FtoQrTfuLNw4JbCoT';
const WOMPI_INTEGRITY_SECRET = 'test_integrity_UbYRUmWZ4uBR9mgcS0aCGiVgFDiZqRni';
const WOMPI_CHECKOUT_BASE = 'https://checkout.wompi.co/p/';
const CURRENCY = 'COP';

interface CustomerData {
  email: string;
  fullName: string;
  phone?: string;
  legalIdType?: string; // 'CC' | 'CE' | 'NIT' | 'PP'
  legalId?: string;
}

interface WompiCheckoutParams {
  reference: string; // ID único del registro en Supabase
  amountInCents: number; // monto en centavos (ej $140.000 = 14000000)
  customer: CustomerData;
  redirectUrl: string; // URL absoluta a la que vuelve el usuario
}

/**
 * Genera el hash SHA-256 de la firma de integridad de Wompi.
 * Formato: SHA256(reference + amountInCents + currency + integritySecret)
 */
async function generateIntegritySignature(
reference: string,
amountInCents: number,
currency: string)
: Promise<string> {
  const concat = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(concat);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Construye la URL completa de Wompi Web Checkout con firma de integridad.
 */
export async function buildWompiCheckoutUrl(
params: WompiCheckoutParams)
: Promise<string> {
  const { reference, amountInCents, customer, redirectUrl } = params;

  const signature = await generateIntegritySignature(
    reference,
    amountInCents,
    CURRENCY
  );

  const queryParams = new URLSearchParams();
  queryParams.append('public-key', WOMPI_PUBLIC_KEY);
  queryParams.append('currency', CURRENCY);
  queryParams.append('amount-in-cents', String(amountInCents));
  queryParams.append('reference', reference);
  queryParams.append('signature:integrity', signature);
  queryParams.append('redirect-url', redirectUrl);
  queryParams.append('customer-data:email', customer.email);
  queryParams.append('customer-data:full-name', customer.fullName);
  if (customer.phone) {
    queryParams.append('customer-data:phone-number', customer.phone);
  }
  if (customer.legalIdType && customer.legalId) {
    queryParams.append('customer-data:legal-id-type', customer.legalIdType);
    queryParams.append('customer-data:legal-id', customer.legalId);
  }

  return `${WOMPI_CHECKOUT_BASE}?${queryParams.toString()}`;
}

/**
 * Helper directo: construye la URL y redirige.
 */
export async function redirectToWompi(
params: WompiCheckoutParams)
: Promise<void> {
  const url = await buildWompiCheckoutUrl(params);
  window.location.href = url;
}