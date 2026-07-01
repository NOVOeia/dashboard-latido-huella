// supabase/functions/wompi-webhook/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WOMPI_EVENTS_SECRET = Deno.env.get('WOMPI_EVENTS_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function routeReference(reference: string): { table: string; id: string } | null {
  if (reference.startsWith('FUTBOL-A-'))  return { table: 'sports_team_registrations', id: reference.slice(9) }
  if (reference.startsWith('FUTBOL-N-'))  return { table: 'sports_team_registrations', id: reference.slice(9) }
  if (reference.startsWith('PADEL-'))     return { table: 'sports_team_registrations', id: reference.slice(6) }
  if (reference.startsWith('TENIS-'))     return { table: 'sports_team_registrations', id: reference.slice(6) }
  if (reference.startsWith('TOLDO-'))     return { table: 'toldos_reservations',       id: reference.slice(6) }
  if (reference.startsWith('FT-'))        return { table: 'expositor_reservations',    id: reference.slice(3) }
  if (reference.startsWith('STAND-'))     return { table: 'expositor_reservations',    id: reference.slice(6) }
  if (reference.startsWith('SPONSOR-'))   return { table: 'sponsor_inquiries',         id: reference.slice(8) }
  if (reference.startsWith('MURO-PETS-')) return { table: 'registrations_5k',          id: reference.slice(10) }
  if (UUID_REGEX.test(reference))         return { table: 'registrations_5k',          id: reference }
  return null
}

function statusToDb(wompiStatus: string): 'paid' | 'declined' {
  return wompiStatus === 'APPROVED' ? 'paid' : 'declined'
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function verifySignature(payload: any): Promise<boolean> {
  const props: string[] = payload?.signature?.properties || []
  const checksum: string = payload?.signature?.checksum || ''
  const timestamp = payload?.timestamp
  if (!props.length || !checksum || timestamp == null) return false
  const concat = props.map((path) => {
    const parts = path.split('.')
    let val: any = payload.data
    for (const p of parts) val = val?.[p]
    return String(val ?? '')
  }).join('') + String(timestamp) + WOMPI_EVENTS_SECRET
  const computed = await sha256Hex(concat)
  return computed.toLowerCase() === checksum.toLowerCase()
}

function fmtCOP(cents: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format((cents || 0) / 100)
}

// Mapeo de tabla → categoría de email
function getCategoryForTable(table: string, record: any): string {
  if (table === 'registrations_5k') return '5k'
  if (table === 'toldos_reservations') return 'toldo'
  if (table === 'sponsor_inquiries') return 'sponsor'
  if (table === 'sports_team_registrations') return 'deporte'
  if (table === 'expositor_reservations') {
    return record.category === 'foodtruck' ? 'foodtruck' : 'stand'
  }
  return 'general'
}

// Obtener nombre y email del registro
function getContactInfo(table: string, record: any): { nombre: string; email: string; vars: Record<string, string> } {
  const baseVars = {
    '{{fecha_evento}}': '26 de julio de 2026',
    '{{lugar_evento}}': 'Llanogrande, Antioquia',
    '{{contract_token}}': record.contract_token || '',
  }

  if (table === 'registrations_5k') {
    return {
      nombre: record.full_name || '',
      email: record.email || '',
      vars: {
        ...baseVars,
        '{{nombre}}': record.full_name || '',
        '{{tipo_registro}}': record.ticket_type || '',
        '{{monto}}': fmtCOP(record.amount_cents || record.total_amount * 100 || 0),
      }
    }
  }
  if (table === 'sports_team_registrations') {
    return {
      nombre: record.captain_name || '',
      email: record.captain_email || '',
      vars: {
        ...baseVars,
        '{{nombre}}': record.captain_name || '',
        '{{nombre_equipo}}': record.team_name || '',
        '{{deporte}}': record.sport || '',
        '{{num_jugadores}}': String(record.player_count || 0),
        '{{monto}}': fmtCOP(record.amount_cents || 0),
      }
    }
  }
  if (table === 'expositor_reservations') {
    return {
      nombre: record.responsible_name || record.brand_name || '',
      email: record.email || '',
      vars: {
        ...baseVars,
        '{{nombre}}': record.responsible_name || record.brand_name || '',
        '{{stand_id}}': record.stand_id || '',
        '{{tipo_registro}}': record.stand_type || record.category || '',
        '{{area_m2}}': record.ft_total_m2 ? String(record.ft_total_m2) : '',
        '{{monto}}': fmtCOP(record.amount_cents || 0),
      }
    }
  }
  if (table === 'toldos_reservations') {
    return {
      nombre: record.responsible_name || record.brand_name || '',
      email: record.email || '',
      vars: {
        ...baseVars,
        '{{nombre}}': record.responsible_name || record.brand_name || '',
        '{{cantidad_toldos}}': String(record.quantity || 1),
        '{{monto}}': fmtCOP(record.amount_cents || record.total_amount * 100 || 0),
      }
    }
  }
  if (table === 'sponsor_inquiries') {
    return {
      nombre: record.contact_name || record.company_name || '',
      email: record.email || '',
      vars: {
        ...baseVars,
        '{{nombre}}': record.contact_name || record.company_name || '',
        '{{empresa}}': record.company_name || '',
        '{{plan_nombre}}': record.plan_name || '',
        '{{monto}}': fmtCOP(record.amount_cents || 0),
      }
    }
  }
  return { nombre: '', email: '', vars: baseVars }
}

async function sendWelcomeEmail(table: string, record: any) {
  try {
    const category = getCategoryForTable(table, record)
    const { nombre, email, vars } = getContactInfo(table, record)

    if (!email) {
      console.warn('No email found for record', record.id)
      return
    }

    // Buscar plantilla activa para esta categoría
    const { data: templates } = await supabase
      .from('email_templates')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .limit(1)

    if (!templates || templates.length === 0) {
      console.warn('No template found for category:', category)
      return
    }

    const template = templates[0]

    // Reemplazar variables en el HTML y asunto
    let html = template.body_html
    let subject = template.subject
    Object.entries(vars).forEach(([k, v]) => {
      html = html.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v || '')
      subject = subject.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v || '')
    })

    // Enviar email via send-email Edge Function
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject,
        html,
        from: 'eventos@latidoyhuella.co',
        type: category,
      })
    })

    if (res.ok) {
      // Guardar log
      await supabase.from('email_logs').insert({
        template_id: template.id,
        template_name: template.name,
        to_email: email,
        to_name: nombre,
        category,
        subject,
        body_html: html,
      })
      console.log(`✅ Email enviado a ${email} (${category})`)
    } else {
      const err = await res.text()
      console.error('Error sending email:', err)
    }
  } catch (err) {
    console.error('sendWelcomeEmail error:', err)
  }
}

const TABLES_WITH_CONTRACT = [
  'expositor_reservations',
  'toldos_reservations',
  'sponsor_inquiries',
  'registrations_5k',
  'sports_team_registrations',
]

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let payload: any
  try { payload = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const ok = await verifySignature(payload)
  if (!ok) {
    console.warn('Invalid Wompi signature for reference:', payload?.data?.transaction?.reference)
    return new Response('Invalid signature', { status: 401 })
  }

  const tx = payload?.data?.transaction
  if (!tx) return new Response('No transaction', { status: 400 })

  const route = routeReference(tx.reference)
  if (!route) {
    console.warn('Unknown reference prefix:', tx.reference)
    return new Response('ok', { status: 200 })
  }

  const newStatus = statusToDb(tx.status)
  const updates: Record<string, any> = {
    status: newStatus,
    wompi_transaction_id: tx.id,
  }

  if (newStatus === 'paid') {
    updates.paid_at = new Date().toISOString()
    if (TABLES_WITH_CONTRACT.includes(route.table)) {
      updates.contract_token = crypto.randomUUID()
    }
  }

  const { error } = await supabase
    .from(route.table)
    .update(updates)
    .eq('id', route.id)

  if (error) {
    console.error('Supabase update error:', error, 'route:', route)
    return new Response('DB error', { status: 500 })
  }

  console.log(`✅ ${route.table} ${route.id} → ${newStatus}`)

  // Enviar email de bienvenida automáticamente cuando el pago es confirmado
  if (newStatus === 'paid') {
    const { data: updatedRecord } = await supabase
      .from(route.table)
      .select('*')
      .eq('id', route.id)
      .maybeSingle()

    if (updatedRecord) {
      await sendWelcomeEmail(route.table, updatedRecord)
    }
  }

  return new Response('ok', { status: 200 })
})