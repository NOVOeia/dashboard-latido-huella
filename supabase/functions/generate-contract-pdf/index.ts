// supabase/functions/generate-contract-pdf/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const NAVY = rgb(0.05, 0.11, 0.43)
const CYAN = rgb(0, 0.74, 0.83)
const GRAY = rgb(0.4, 0.4, 0.4)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TABLES = ['registrations_5k','registration_attendees','sports_team_registrations','sports_team_players','expositor_reservations','toldos_reservations','sponsor_inquiries']

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const { contract_token } = await req.json()
    if (!contract_token) return new Response(JSON.stringify({ error: 'Missing contract_token' }), { status: 400, headers: corsHeaders })

    // Buscar el registro
    let record: any = null
    let table = ''
    for (const t of TABLES) {
      const { data } = await supabase.from(t).select('*').eq('contract_token', contract_token).maybeSingle()
      if (data) { record = data; table = t; break }
    }
    if (!record) return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404, headers: corsHeaders })

    const nombre = record.full_name || record.responsible_name || record.captain_name || record.contact_name || record.name || ''
    const empresa = record.brand_name || record.company_name || ''
    const documento = record.document_id || record.cedula || record.ti || record.captain_cedula || ''
    const email = record.email || record.captain_email || ''
    const telefono = record.phone || record.captain_phone || ''

    const tipoDoc =
      table === 'registrations_5k' ? 'Términos y Condiciones — Caminata 6.5K' :
      table === 'registration_attendees' ? 'Autorización Menor de Edad' :
      table === 'sports_team_registrations' ? 'Inscripción de Equipo Deportivo' :
      table === 'sports_team_players' ? 'Descargo Individual de Responsabilidad' :
      table === 'sponsor_inquiries' ? 'Contrato de Patrocinio' :
      table === 'toldos_reservations' ? 'Acta de Vinculación Comercial — Toldos' :
      record.category === 'foodtruck' ? 'Acta de Vinculación Comercial — Food Truck' :
      'Acta de Vinculación Comercial — Expositor'

    // Crear PDF
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage([595, 842]) // A4
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const { width, height } = page.getSize()
    let y = height - 60

    // Header
    page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: NAVY })
    page.drawText('LATIDO Y HUELLA 2026', { x: 50, y: height - 45, size: 20, font: fontBold, color: rgb(1, 1, 1) })
    page.drawText(tipoDoc, { x: 50, y: height - 68, size: 12, font: fontRegular, color: rgb(0.85, 0.85, 0.85) })
    page.drawText('26 de julio de 2026 | Parque del Bienestar COMFAMA Llanogrande', { x: 50, y: height - 85, size: 9, font: fontRegular, color: rgb(0.7, 0.7, 0.7) })
    y = height - 130

    // Datos del firmante
    page.drawText('DATOS DEL FIRMANTE', { x: 50, y, size: 12, font: fontBold, color: NAVY })
    y -= 20
    const datos: [string, string][] = [
      ['Nombre completo', nombre],
      ...(empresa ? [['Empresa / Marca', empresa] as [string, string]] : []),
      ['Documento de identidad', documento],
      ['Email', email],
      ['Teléfono', telefono],
    ]
    for (const [label, val] of datos) {
      page.drawText(`${label}:`, { x: 50, y, size: 10, font: fontBold, color: GRAY })
      page.drawText(val || '—', { x: 200, y, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) })
      y -= 18
    }
    y -= 10

    // Línea separadora
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) })
    y -= 25

    // Texto del documento (resumen — texto completo en la web)
    page.drawText('DECLARACIÓN', { x: 50, y, size: 12, font: fontBold, color: NAVY })
    y -= 20
    const declaracion = `El firmante declara haber leído y aceptado en su totalidad los términos, condiciones, obligaciones y autorizaciones del documento "${tipoDoc}" correspondiente al evento LATIDO Y HUELLA 2026, incluyendo las políticas de tratamiento de datos personales conforme a la Ley 1581 de 2012, cesión de derechos de imagen, y demás cláusulas establecidas. El texto completo del documento fue presentado y aceptado digitalmente antes de la firma.`
    const lines = wrapText(declaracion, fontRegular, 10, width - 100)
    for (const line of lines) {
      page.drawText(line, { x: 50, y, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) })
      y -= 16
    }
    y -= 20

    // Firma
    if (record.contract_signature_url) {
      try {
        const sigRes = await fetch(record.contract_signature_url)
        const sigBytes = new Uint8Array(await sigRes.arrayBuffer())
        const sigImage = await pdfDoc.embedPng(sigBytes)
        const sigDims = sigImage.scale(0.3)
        page.drawText('FIRMA:', { x: 50, y, size: 10, font: fontBold, color: GRAY })
        y -= sigDims.height + 10
        page.drawImage(sigImage, { x: 50, y, width: Math.min(sigDims.width, 200), height: Math.min(sigDims.height, 80) })
        y -= 20
      } catch (e) {
        console.error('Error embedding signature:', e)
      }
    }

    // Timestamp
    page.drawText(`Firmado digitalmente el: ${new Date(record.contract_signed_at || Date.now()).toLocaleString('es-CO')}`, { x: 50, y, size: 9, font: fontRegular, color: GRAY })
    y -= 14
    page.drawText(`Documento válido conforme a la Ley 527 de 1999 de Colombia (Comercio Electrónico)`, { x: 50, y, size: 8, font: fontRegular, color: rgb(0.6, 0.6, 0.6) })

    // Footer
    page.drawRectangle({ x: 0, y: 0, width, height: 40, color: NAVY })
    page.drawText('Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co', { x: 50, y: 15, size: 8, font: fontRegular, color: rgb(0.8, 0.8, 0.8) })

    const pdfBytes = await pdfDoc.save()

    // Guardar en Storage
    const fileName = `contratos-pdf/${table}_${record.id}_${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage.from('expositor-documents').upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    })
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500, headers: corsHeaders })
    }

    const { data: urlData } = supabase.storage.from('expositor-documents').getPublicUrl(fileName)

    // Guardar URL del PDF en el registro
    await supabase.from(table).update({ contract_pdf_url: urlData.publicUrl }).eq('id', record.id)

    return new Response(JSON.stringify({ success: true, pdf_url: urlData.publicUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})