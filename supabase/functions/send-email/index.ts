// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'eventos@latidoyhuella.co'
const FROM_NAME = 'Latido y Huella'

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body: any
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const { to, subject, html, type } = body

  if (!to || !subject || !html) {
    return new Response('Missing required fields: to, subject, html', { status: 400 })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(JSON.stringify({ error: data }), { status: 500 })
    }

    console.log(`✅ Email enviado [${type||'general'}] → ${to}`)
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error enviando email:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
