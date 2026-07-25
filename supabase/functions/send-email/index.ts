import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })
  let body: any
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400, headers: cors }) }
  const { to, subject, html } = body
  if (!to || !subject || !html) return new Response('Missing fields', { status: 400, headers: cors })
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Latido y Huella <eventos@latidoyhuella.co>', to: Array.isArray(to) ? to : [to], subject, html })
  })
  const data = await res.json()
  if (!res.ok) return new Response(JSON.stringify({ error: data }), { status: 500, headers: cors })
  return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
})