// supabase/functions/generate-payment-link/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WOMPI_PUBLIC_KEY = 'pub_prod_c3KnNzhHf9P0aRWwfeTzggSDX7UOl1Sr'
const WOMPI_INTEGRITY_KEY = 'prod_integrity_gFwVI13EBqz9Khb672Ve042FU41xEvse'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TABLES = [
  'registrations_5k',
  'expositor_reservations',
  'toldos_reservations',
  'sports_team_registrations',
  'sponsor_inquiries',
]

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { record_id } = await req.json()
    if (!record_id) return new Response(JSON.stringify({ error: 'Missing record_id' }), { status: 400, headers: corsHeaders })

    // Buscar el registro
    let record: any = null
    let table = ''
    for (const t of TABLES) {
      const { data } = await supabase.from(t).select('*').eq('id', record_id).maybeSingle()
      if (data) { record = data; table = t; break }
    }
    if (!record) return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404, headers: corsHeaders })

    const amount = record.amount_cents || (record.total_amount ? record.total_amount * 100 : 0)
    if (!amount) return new Response(JSON.stringify({ error: 'No amount found' }), { status: 400, headers: corsHeaders })

    // Generar prefix según tabla
    const prefix =
      table === 'registrations_5k' ? 'MURO-PETS-' :
      table === 'expositor_reservations' && record.category === 'foodtruck' ? 'FT-' :
      table === 'expositor_reservations' ? 'STAND-' :
      table === 'toldos_reservations' ? 'TOLDO-' :
      table === 'sports_team_registrations' ? 'FUTBOL-A-' :
      table === 'sponsor_inquiries' ? 'SPONSOR-' : ''

    const reference = `${prefix}${record_id}`

    // Calcular integrity hash: reference + amount + currency + integrity_key
    const integrityString = `${reference}${amount}COP${WOMPI_INTEGRITY_KEY}`
    const integrityHash = await sha256Hex(integrityString)

    const paymentUrl = `https://checkout.wompi.co/p/?public-key=${WOMPI_PUBLIC_KEY}&currency=COP&amount-in-cents=${amount}&reference=${reference}&signature:integrity=${integrityHash}`

    return new Response(JSON.stringify({ success: true, payment_url: paymentUrl, amount, reference }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})