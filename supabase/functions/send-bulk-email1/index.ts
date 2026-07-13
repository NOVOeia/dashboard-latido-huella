// supabase/functions/on-payment-confirmed/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_MckDrrRF_PiVjeJWrRZ6aTT1dhYjH9GHb'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    const record = payload.record

    if (!record) return new Response('No record', { status: 400 })

    // Solo procesar cuando status cambia a 'paid' o 'approved'
    const oldRecord = payload.old_record
    const newStatus = record.status
    const oldStatus = oldRecord?.status

    if (!['paid', 'approved'].includes(newStatus) || oldStatus === newStatus) {
      return new Response(JSON.stringify({ skipped: true }), { headers: corsHeaders })
    }

    // Generar contract_token si no tiene
    let contractToken = record.contract_token
    if (!contractToken) {
      contractToken = crypto.randomUUID()
      await supabase
        .from('registrations_5k')
        .update({ contract_token: contractToken })
        .eq('id', record.id)
    }

    // Si ya se envió el email1, no reenviar
    if (record.email1_sent_at) {
      return new Response(JSON.stringify({ skipped: 'email1 already sent' }), { headers: corsHeaders })
    }

    const email = record.email
    const nombre = record.full_name?.split(' ')[0] || record.full_name || 'Participante'
    const contractUrl = `https://admin-latidoyhuella.netlify.app/contrato/${contractToken}`

    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5"><div style="background:#0D1B6E;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:65px" alt="Latido y Huella"/><p style="color:rgba(255,255,255,0.7);font-size:13px;margin:12px 0 0">26 de julio de 2026 · Parque del Bienestar COMFAMA · Llanogrande</p></div><div style="background:white;padding:36px 32px"><h1 style="color:#0D1B6E;font-size:26px;margin:0 0 8px">¡Hola ${nombre}! 🐾</h1><p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 24px">Tu registro para la <strong>Caminata Canina 6.5K Pet Lovers</strong> en Latido y Huella 2026 está confirmado. ¡Estamos muy felices de que seas parte de esta gran celebración familiar, canina y deportiva! 🎉</p><div style="background:#f0f4ff;border-radius:14px;padding:20px;margin:0 0 24px"><p style="margin:0 0 8px;color:#333"><strong>📅 Fecha:</strong> Domingo 26 de julio de 2026</p><p style="margin:0 0 8px;color:#333"><strong>⏰ Hora:</strong> 7:00 AM</p><p style="margin:0;color:#333"><strong>📍 Lugar:</strong> Parque del Bienestar COMFAMA Llanogrande</p></div><div style="background:#fff8e1;border-left:4px solid #FFB300;border-radius:0 12px 12px 0;padding:20px;margin:0 0 24px"><p style="color:#e65100;font-weight:700;margin:0 0 8px;font-size:15px">⚠️ Paso importante — Firma tu consentimiento</p><p style="color:#555;font-size:14px;margin:0 0 16px;line-height:1.6">Para completar tu registro debes firmar el consentimiento informado. Es rápido y lo puedes hacer desde tu celular.</p><div style="text-align:center"><a href="${contractUrl}" style="background:linear-gradient(135deg,#00BCD4,#0097A7);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px">✍️ Firmar consentimiento</a></div></div><div style="margin:0 0 24px"><h2 style="color:#0D1B6E;font-size:18px;margin:0 0 12px">🐾 Una causa que nos une</h2><p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 12px">Latido y Huella es mucho más que una caminata — es un espacio para celebrar el amor por las mascotas, el deporte y el bienestar familiar.</p><p style="color:#555;font-size:14px;line-height:1.7;margin:0"><strong>¡Comparte el evento con tus amigos y familia!</strong> 🌟</p></div><div style="background:#f0fdf4;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #c3f0ca"><h3 style="color:#1b5e20;font-size:16px;margin:0 0 14px">🐕 Recomendaciones para las mascotas</h3><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🦮 <strong>Siempre cerca de ti:</strong> cuídala con collar, placa y traílla.</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">💧 <strong>Mucha agua:</strong> la hidratación para ti y tu mascota es fundamental.</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🐛 <strong>Cuída de ella:</strong> desparasítala antes de ir a la caminata.</p><p style="color:#2e7d32;font-size:14px;margin:0">💉 <strong>Esquema de vacunas:</strong> completa su esquema y porta el carné.</p></div><div style="background:#f3e5f5;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #ce93d8"><h3 style="color:#4a148c;font-size:16px;margin:0 0 14px">🎁 Entrega de kits</h3><p style="color:#555;font-size:14px;margin:0 0 14px">Tendremos dos lugares de entrega. En el próximo email podrás seleccionar el tuyo.</p><p style="color:#6a1b9a;font-size:14px;font-weight:700;margin:0 0 4px">📍 Medellín — Vitrina Chery, Calle 31 # 43-73</p><p style="color:#555;font-size:13px;margin:0 0 12px">Vie 24 Jul: 9AM–4PM · Sáb 25 Jul: 9AM–12M</p><p style="color:#6a1b9a;font-size:14px;font-weight:700;margin:0 0 4px">📍 Llanogrande — La Finca de Rigo, Glorieta El Tablazo</p><p style="color:#555;font-size:13px;margin:0">Vie 24 Jul: 9AM–4PM · Sáb 25 Jul: 9AM–12M</p></div><div style="background:#e3f2fd;border-radius:14px;padding:20px;margin:0 0 24px"><h3 style="color:#0D1B6E;font-size:16px;margin:0 0 12px">📌 Tus próximos pasos</h3><p style="color:#333;font-size:14px;margin:0 0 8px">1️⃣ <strong>Firmar el consentimiento</strong> — el link está arriba</p><p style="color:#333;font-size:14px;margin:0 0 8px">2️⃣ <strong>Seleccionar punto de kit</strong> — recibirás otro email</p><p style="color:#333;font-size:14px;margin:0">3️⃣ <strong>¡Disfrutar el evento el 26 de julio!</strong> 🎉</p></div><div style="text-align:center;margin:24px 0"><a href="https://latidoyhuella.com" style="background:#0D1B6E;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block">Ver detalles del evento →</a></div><p style="color:#888;font-size:12px;text-align:center;margin:0">¿Tienes preguntas? <a href="mailto:eventos@latidoyhuella.co" style="color:#00BCD4">eventos@latidoyhuella.co</a> · WhatsApp +57 333 277 7912</p></div><div style="background:#0D1B6E;padding:20px 32px;text-align:center;border-radius:0 0 16px 16px"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:36px;margin-bottom:10px"/><p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0">Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co</p></div></div>`

    // Enviar email via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Latido y Huella <eventos@latidoyhuella.co>',
        to: [email],
        subject: '🐾 ¡Tu registro en Latido y Huella 2026 está confirmado!',
        html,
      }),
    })

    if (resendRes.ok) {
      const now = new Date().toISOString()
      // Actualizar email1_sent_at
      await supabase.from('registrations_5k').update({ email1_sent_at: now }).eq('id', record.id)
      // Guardar en email_logs
      await supabase.from('email_logs').insert({
        template_name: 'Email 1 — Bienvenida automática',
        to_email: email,
        to_name: record.full_name,
        category: '5k',
        subject: '🐾 ¡Tu registro en Latido y Huella 2026 está confirmado!',
        sent_at: now,
        status: 'sent',
        body_html: html,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: corsHeaders
    })
  }
})