// ============================================================
// 🔧 CONFIGURACIÓN DE WEBHOOKS — GoHighLevel (GHL)
// ============================================================
// Reemplaza cada URL con tu webhook de GHL correspondiente.
// Formato: https://services.leadconnectorhq.com/hooks/xxxxxxxxxxxxxxx
//
// Para obtener tu webhook:
// GHL → Automation → Workflows → Trigger: Inbound Webhook → Copiar URL
// ============================================================

export const GHL_WEBHOOKS = {
  // Webhook 1: Formulario de Contacto (sección contacto de la home)
  CONTACTO:
  'https://services.leadconnectorhq.com/hooks/fSGKFAskjzH7pBxfOSIj/webhook-trigger/d5abe19e-8080-49ff-a0c4-08f72bf82595',

  // Webhook 2: Inscripción Caminata 5K
  CAMINATA_5K: 'TU_WEBHOOK_CAMINATA_5K_AQUI',

  // Webhook 3: Inscripción Deportes (Fútbol y Pádel)
  DEPORTES: 'TU_WEBHOOK_DEPORTES_AQUI',

  // Webhook 4: Soporte de pagos (Muro de Huellas / pagos pendientes)
  SOPORTE_PAGOS: 'TU_WEBHOOK_SOPORTE_PAGOS_AQUI'
} as const;

// ============================================================
// Helper para enviar datos al webhook de GHL
// ============================================================
interface WebhookPayload {
  [key: string]: unknown;
}

export async function sendToGHL(
webhookUrl: string,
data: WebhookPayload)
: Promise<{success: boolean;error?: string;}> {
  // No enviar si la URL no ha sido configurada
  if (
  webhookUrl.startsWith('TU_WEBHOOK_') ||
  !webhookUrl.startsWith('https://'))
  {
    console.warn(
      '⚠️ Webhook no configurado. Actualiza la URL en utils/webhooks.ts'
    );
    return {
      success: false,
      error: 'Webhook no configurado'
    };
  }

  const payload = {
    ...data,
    // Metadata común a todos los envíos
    source: 'latidoyhuella_web',
    event: 'Latido & Huella 2026',
    submitted_at: new Date().toISOString()
  };

  try {
    // Intentar primero con CORS normal
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('✅ Datos enviados a GHL exitosamente');
    return { success: true };
  } catch (corsError) {
    // Si falla por CORS, reintentar con no-cors (los datos SÍ se envían,
    // pero no podemos leer la respuesta del servidor)
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      });

      console.log('✅ Datos enviados a GHL (modo no-cors)');
      return { success: true };
    } catch (networkError) {
      console.error('❌ Error de red enviando datos a GHL:', networkError);
      return {
        success: false,
        error:
        networkError instanceof Error ? networkError.message : 'Error de red'
      };
    }
  }
}