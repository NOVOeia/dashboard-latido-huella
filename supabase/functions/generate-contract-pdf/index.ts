// supabase/functions/generate-contract-pdf/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const NAVY = rgb(0.05, 0.11, 0.43)
const CYAN = rgb(0, 0.74, 0.83)
const GRAY = rgb(0.45, 0.45, 0.45)
const GREEN = rgb(0.30, 0.69, 0.31)
const RED = rgb(0.97, 0.44, 0.44)
const DARK = rgb(0.1, 0.1, 0.1)
const LOGO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TABLES = ['registrations_5k','registration_attendees','sports_team_registrations','sports_team_players','expositor_reservations','toldos_reservations','sponsor_inquiries']

function fmtCOP(cents: number) {
  if (!cents) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cents / 100)
}

class PdfBuilder {
  doc: any
  page: any
  fontBold: any
  fontRegular: any
  y = 0
  width = 595
  height = 842
  margin = 50

  async init() {
    this.doc = await PDFDocument.create()
    this.fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold)
    this.fontRegular = await this.doc.embedFont(StandardFonts.Helvetica)
    this.newPage()
  }

  newPage() {
    this.page = this.doc.addPage([595, 842])
    this.y = this.height - 50
  }

  checkSpace(needed: number) {
    if (this.y - needed < 80) this.newPage()
  }

  wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
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

  async drawHeader(logoBytes: Uint8Array | null, titulo: string, subtitulo?: string) {
    this.page.drawRectangle({ x: 0, y: this.height - 100, width: this.width, height: 100, color: NAVY })
    if (logoBytes) {
      try {
        const logoImg = await this.doc.embedPng(logoBytes)
        const dims = logoImg.scale(0.08)
        this.page.drawImage(logoImg, { x: this.margin, y: this.height - 70, width: Math.min(dims.width, 50), height: Math.min(dims.height, 50) })
      } catch (_e) { /* skip logo if fails */ }
    }
    const textX = logoBytes ? this.margin + 60 : this.margin
    this.page.drawText('LATIDO Y HUELLA 2026', { x: textX, y: this.height - 45, size: 16, font: this.fontBold, color: rgb(1, 1, 1) })
    this.page.drawText(titulo, { x: textX, y: this.height - 65, size: 10, font: this.fontRegular, color: rgb(0.85, 0.85, 0.85) })
    if (subtitulo) this.page.drawText(subtitulo, { x: textX, y: this.height - 80, size: 9, font: this.fontRegular, color: CYAN })
    this.y = this.height - 130
  }

  sectionTitle(text: string) {
    this.checkSpace(30)
    this.page.drawText(text, { x: this.margin, y: this.y, size: 12, font: this.fontBold, color: NAVY })
    this.y -= 20
  }

  paragraph(text: string, size = 9.5) {
    const lines = this.wrapText(text, this.fontRegular, size, this.width - this.margin * 2)
    for (const line of lines) {
      this.checkSpace(16)
      this.page.drawText(line, { x: this.margin, y: this.y, size, font: this.fontRegular, color: DARK })
      this.y -= 14
    }
    this.y -= 6
  }

  dataRow(label: string, value: string) {
    this.checkSpace(18)
    this.page.drawText(`${label}:`, { x: this.margin, y: this.y, size: 9.5, font: this.fontBold, color: GRAY })
    this.page.drawText(value || '—', { x: this.margin + 170, y: this.y, size: 9.5, font: this.fontRegular, color: DARK })
    this.y -= 16
  }

  checkItem(checked: boolean, text: string) {
    const lines = this.wrapText(text, this.fontRegular, 9, this.width - this.margin * 2 - 25)
    this.checkSpace(lines.length * 13 + 6)
    this.page.drawRectangle({ x: this.margin, y: this.y - 9, width: 11, height: 11, borderColor: checked ? GREEN : RED, borderWidth: 1.2, color: checked ? rgb(0.92, 0.98, 0.93) : rgb(1, 0.96, 0.96) })
    if (checked) this.page.drawText('X', { x: this.margin + 2, y: this.y - 8, size: 8, font: this.fontBold, color: GREEN })
    for (let i = 0; i < lines.length; i++) {
      this.page.drawText(lines[i], { x: this.margin + 18, y: this.y - (i * 13), size: 9, font: this.fontRegular, color: DARK })
    }
    this.y -= lines.length * 13 + 8
  }

  divider() {
    this.checkSpace(15)
    this.page.drawLine({ start: { x: this.margin, y: this.y }, end: { x: this.width - this.margin, y: this.y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) })
    this.y -= 15
  }

  async drawSignature(sigUrl: string | null, signerName: string, signedAt: string) {
    this.checkSpace(140)
    this.divider()
    this.page.drawText('FIRMA DEL DOCUMENTO', { x: this.margin, y: this.y, size: 11, font: this.fontBold, color: NAVY })
    this.y -= 20
    if (sigUrl) {
      try {
        const res = await fetch(sigUrl)
        const bytes = new Uint8Array(await res.arrayBuffer())
        const img = await this.doc.embedPng(bytes)
        const targetW = 180
        const scale = targetW / img.width
        const targetH = img.height * scale
        this.page.drawRectangle({ x: this.margin, y: this.y - targetH - 5, width: targetW + 10, height: targetH + 10, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 })
        this.page.drawImage(img, { x: this.margin + 5, y: this.y - targetH, width: targetW, height: targetH })
        this.y -= targetH + 20
      } catch (_e) {
        this.page.drawText('[Firma no disponible]', { x: this.margin, y: this.y, size: 9, font: this.fontRegular, color: GRAY })
        this.y -= 20
      }
    }
    this.page.drawText(`Firmado por: ${signerName}`, { x: this.margin, y: this.y, size: 9.5, font: this.fontBold, color: DARK })
    this.y -= 14
    this.page.drawText(`Fecha y hora: ${new Date(signedAt).toLocaleString('es-CO')}`, { x: this.margin, y: this.y, size: 9, font: this.fontRegular, color: GRAY })
    this.y -= 14
    this.page.drawText('Firma digital con validez legal conforme a la Ley 527 de 1999 de Colombia.', { x: this.margin, y: this.y, size: 8, font: this.fontRegular, color: rgb(0.6, 0.6, 0.6) })
    this.y -= 14
  }

  finalize() {
    const pages = this.doc.getPages()
    pages.forEach((p: any, i: number) => {
      p.drawRectangle({ x: 0, y: 0, width: 595, height: 30, color: NAVY })
      p.drawText('Latido y Huella 2026 - Diverxo S.A.S - eventos@latidoyhuella.co', { x: 50, y: 11, size: 7, font: this.fontRegular, color: rgb(0.8, 0.8, 0.8) })
      p.drawText(`Pagina ${i + 1} de ${pages.length}`, { x: 595 - 100, y: 11, size: 7, font: this.fontRegular, color: rgb(0.8, 0.8, 0.8) })
    })
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const { contract_token } = await req.json()
    if (!contract_token) return new Response(JSON.stringify({ error: 'Missing contract_token' }), { status: 400, headers: corsHeaders })

    let record: any = null
    let table = ''
    for (const t of TABLES) {
      const { data } = await supabase.from(t).select('*').eq('contract_token', contract_token).maybeSingle()
      if (data) { record = data; table = t; break }
    }
    if (!record) return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404, headers: corsHeaders })

    let parentRecord: any = null
    let players: any[] = []
    let staffList: any[] = []
    if (table === 'sports_team_players' && record.team_id) {
      const { data } = await supabase.from('sports_team_registrations').select('*').eq('id', record.team_id).maybeSingle()
      parentRecord = data
    }
    if (table === 'registration_attendees' && record.registration_id) {
      const { data } = await supabase.from('registrations_5k').select('*').eq('id', record.registration_id).maybeSingle()
      parentRecord = data
    }
    if (table === 'sports_team_registrations') {
      const { data } = await supabase.from('sports_team_players').select('*').eq('team_id', record.id).order('player_index')
      players = data || []
    }
    if (table === 'expositor_reservations' || table === 'toldos_reservations') {
      const { data } = await supabase.from('stand_staff').select('*').eq('expositor_id', record.id)
      staffList = data || []
    }

    const nombre = record.full_name || record.responsible_name || record.captain_name || record.contact_name || record.name || ''
    const empresa = record.brand_name || record.company_name || ''
    const documento = record.document_id || record.cedula || record.ti || record.captain_cedula || ''
    const email = record.email || record.captain_email || ''
    const telefono = record.phone || record.captain_phone || ''
    const checks: Record<string, boolean> = record.contract_checks || {}
    const signerName = record.signature_name || nombre

    const isExpositor = table === 'expositor_reservations' && record.category !== 'foodtruck'
    const isFoodTruck = table === 'expositor_reservations' && record.category === 'foodtruck'
    const isToldo = table === 'toldos_reservations'
    const isJugador = table === 'sports_team_players'
    const isCapitan = table === 'sports_team_registrations'
    const isMinor = table === 'registration_attendees' && record.is_minor
    const isCaminata = table === 'registrations_5k'
    const isSponsor = table === 'sponsor_inquiries'

    let logoBytes: Uint8Array | null = null
    try {
      const logoRes = await fetch(LOGO_URL)
      logoBytes = new Uint8Array(await logoRes.arrayBuffer())
    } catch (_e) { console.error('Logo fetch failed') }

    const pdf = new PdfBuilder()
    await pdf.init()

    if (isCaminata) {
      await pdf.drawHeader(logoBytes, 'Terminos y Condiciones de Participacion', 'Caminata Canina Pet Lovers - 6.5K')
      pdf.sectionTitle('1. DATOS DEL PARTICIPANTE')
      pdf.dataRow('Nombre completo', nombre)
      pdf.dataRow('Documento de identidad', documento)
      pdf.dataRow('Email', email)
      pdf.dataRow('WhatsApp / Celular', telefono)
      pdf.divider()
      pdf.sectionTitle('3. CONDICIONES GENERALES')
      const cond5k: [string, string][] = [
        ['edad', 'EDAD MINIMA: Declaro ser mayor de 18 anos. Si soy menor, estoy acompanado de un adulto responsable que acepta estos terminos.'],
        ['salud', 'ESTADO DE SALUD: Declaro estar en condiciones fisicas aptas para realizar actividad fisica moderada (caminata de 6,5 km). Asumo total responsabilidad sobre mi estado de salud.'],
        ['mascota', 'RESPONSABILIDAD POR MASCOTA: Soy unica y exclusivamente responsable del comportamiento de mi mascota durante el evento.'],
        ['vacunas', 'REQUISITOS DE LA MASCOTA: Mi mascota cuenta con vacunas al dia y carnet de vacunacion vigente.'],
        ['reembolso', 'POLITICA DE REEMBOLSO: Entiendo que no hay devolucion de dinero. Puedo transferir mi inscripcion hasta el Viernes 24 de Julio 2026.'],
        ['fuerzaMayor', 'FUERZA MAYOR: Acepto que el evento puede ser cancelado o reprogramado por causas de fuerza mayor.'],
      ]
      for (const [k, l] of cond5k) pdf.checkItem(!!checks[k], l)
      pdf.sectionTitle('4. AUTORIZACIONES Y PROTECCION DE DATOS')
      const auth5k: [string, string][] = [
        ['habesDatos', 'HABEAS DATA (Ley 1581/2012): Autorizo el tratamiento de mis datos personales para gestion del evento.'],
        ['imagen', 'CESION DE DERECHOS DE IMAGEN: Autorizo el uso de fotografias y videos del evento donde aparezca mi imagen y/o la de mi mascota.'],
        ['kit', 'ENTREGA DE KIT: Entiendo que debo recoger mi kit en las fechas y lugares establecidos.'],
      ]
      for (const [k, l] of auth5k) pdf.checkItem(!!checks[k], l)
      pdf.sectionTitle('5. DESCARGO DE RESPONSABILIDAD')
      pdf.checkItem(!!checks.descargo, 'Eximo de toda responsabilidad legal a la organizacion del evento LATIDO Y HUELLA 2026, sus patrocinadores, aliados y personal, por cualquier lesion, dano, perdida o accidente. Participo bajo mi propio riesgo.')
      pdf.checkItem(!!checks.aceptacionFinal, 'HE LEIDO Y ACEPTO TODOS LOS TERMINOS Y CONDICIONES ANTERIORES. Declaro que toda la informacion suministrada es veridica.')
    }

    if (isMinor) {
      await pdf.drawHeader(logoBytes, 'Autorizacion para Participacion de Menores de Edad')
      pdf.sectionTitle('1. DATOS DEL MENOR DE EDAD')
      pdf.dataRow('Nombre completo', record.full_name || '')
      pdf.dataRow('Tarjeta de Identidad (TI)', record.ti || record.document_id || '')
      pdf.dataRow('Fecha de nacimiento', record.birthdate || '')
      pdf.dataRow('EPS o seguro medico', record.eps || '')
      pdf.divider()
      pdf.sectionTitle('2. DATOS DEL PADRE / MADRE O ACUDIENTE LEGAL')
      pdf.dataRow('Nombre completo', parentRecord?.full_name || nombre)
      pdf.dataRow('Cedula de ciudadania', parentRecord?.document_id || documento)
      pdf.dataRow('Celular', parentRecord?.phone || telefono)
      pdf.dataRow('Email', parentRecord?.email || email)
      pdf.divider()
      pdf.sectionTitle('4. DECLARACION Y AUTORIZACION')
      pdf.paragraph(`Yo, ${parentRecord?.full_name || nombre}, identificado(a) con cedula No. ${parentRecord?.document_id || documento}, en mi calidad de padre/madre/acudiente legal del menor ${record.full_name}, AUTORIZO expresamente su participacion en el evento LATIDO Y HUELLA 2026 y DECLARO:`)
      const condMenor: [string, string][] = [
        ['autorizacion', 'AUTORIZACION DE PARTICIPACION: Autorizo la participacion del menor bajo mi responsabilidad legal en la actividad seleccionada.'],
        ['saludMenor', 'ESTADO DE SALUD: Declaro que el menor se encuentra en buenas condiciones de salud y apto para realizar actividad fisica.'],
        ['responsabilidad', 'RESPONSABILIDAD: Me hago responsable de cualquier eventualidad medica, lesion o accidente. Eximo de responsabilidad a la organizacion.'],
        ['atencionMedica', 'ATENCION MEDICA: Autorizo al personal medico del evento a brindar los primeros auxilios necesarios.'],
        ['imagenMenor', 'CESION DE IMAGEN: Autorizo el uso de fotografias y videos del menor con fines promocionales.'],
        ['datosPersonales', 'PROTECCION DE DATOS (Ley 1581/2012): Autorizo el tratamiento de los datos personales del menor.'],
        ['acompanamiento', 'ACOMPANAMIENTO: Me comprometo a permanecer en el evento o designar un adulto responsable que acompane al menor.'],
        ['aceptacionMenor', 'ACEPTO TODOS LOS TERMINOS Y CONDICIONES. Declaro que toda la informacion es veridica.'],
      ]
      for (const [k, l] of condMenor) pdf.checkItem(!!checks[k], l)
    }

    if (isCapitan) {
      await pdf.drawHeader(logoBytes, 'Inscripcion de Equipo Deportivo', `${(record.sport || '').toUpperCase()} - ${record.category === 'ninos' ? 'Infantil' : 'Adultos'}`)
      pdf.sectionTitle('1. DATOS DEL EQUIPO')
      pdf.dataRow('Deporte', record.sport || '')
      pdf.dataRow('Nombre del equipo', record.team_name || '')
      pdf.dataRow('Categoria', record.category === 'ninos' ? 'Infantil (8-15 anos)' : 'Adultos (16+)')
      pdf.divider()
      pdf.sectionTitle('2. DATOS DEL CAPITAN')
      pdf.dataRow('Nombre completo', nombre)
      pdf.dataRow('Documento de identidad', documento)
      pdf.dataRow('Celular', telefono)
      pdf.dataRow('Email', email)
      pdf.divider()
      pdf.sectionTitle('3. LISTA DE JUGADORES INSCRITOS')
      if (players.length > 0) {
        for (let i = 0; i < players.length; i++) {
          const p = players[i]
          pdf.checkSpace(16)
          pdf.page.drawText(`${i + 1}. ${p.name}${p.is_captain ? ' (Capitan)' : ''} - CC: ${p.cedula || p.ti || '-'}`, { x: pdf.margin, y: pdf.y, size: 9.5, font: pdf.fontRegular, color: DARK })
          pdf.y -= 15
        }
      } else {
        pdf.paragraph('No hay jugadores registrados.')
      }
      pdf.y -= 5
      pdf.divider()
      pdf.sectionTitle('4. TERMINOS Y CONDICIONES DEL TORNEO')
      const condCapitan: [string, string][] = [
        ['reglamento', 'REGLAMENTO: El equipo se compromete a jugar bajo el reglamento FIFA/FIP adaptado segun la categoria.'],
        ['arbitraje', 'ARBITRAJE: Acepto que las decisiones de los arbitros durante los partidos son INAPELABLES.'],
        ['jugadores', 'JUGADORES: Confirmo que todos los jugadores conocen y aceptan participar. Cada uno completara su descargo individual.'],
        ['cambios', 'CAMBIO DE JUGADORES: Puedo cambiar jugadores hasta el Viernes 24 de Julio de 2026.'],
        ['fairPlay', 'FAIR PLAY: El equipo se compromete a mantener conducta deportiva.'],
        ['reembolsoD', 'POLITICA DE REEMBOLSO: No hay devolucion de dinero.'],
        ['fuerzaMayorD', 'FUERZA MAYOR: El torneo puede cancelarse o reprogramarse por causas de fuerza mayor.'],
        ['datosD', 'PROTECCION DE DATOS (Ley 1581/2012): Autorizo el tratamiento de datos del equipo y jugadores.'],
        ['imagenD', 'CESION DE IMAGEN: Autorizo el uso de fotos y videos del equipo con fines promocionales.'],
        ['aceptacionCapitan', 'COMO CAPITAN, ACEPTO LOS TERMINOS DEL TORNEO.'],
      ]
      for (const [k, l] of condCapitan) pdf.checkItem(!!checks[k], l)
    }

    if (isJugador) {
      await pdf.drawHeader(logoBytes, 'Descargo Individual de Responsabilidad', `${(parentRecord?.sport || 'DEPORTES').toUpperCase()} - ${parentRecord?.team_name || ''}`)
      pdf.sectionTitle('1. DATOS DEL JUGADOR')
      pdf.dataRow('Nombre completo', nombre)
      pdf.dataRow('Documento de identidad', documento)
      pdf.dataRow('Email', email)
      pdf.dataRow('Celular', telefono)
      pdf.dataRow('EPS / Medicina Prepagada', record.eps || '')
      pdf.dataRow('Equipo', parentRecord?.team_name || '')
      pdf.divider()
      pdf.sectionTitle('2. CONTACTO DE EMERGENCIA')
      pdf.dataRow('Nombre', record.emergency_contact_name || '')
      pdf.dataRow('Telefono', record.emergency_contact_phone || '')
      pdf.divider()
      pdf.sectionTitle('3. DECLARACION DE ESTADO DE SALUD')
      pdf.checkItem(!!checks.aptitud, 'APTITUD FISICA: Declaro estar en condiciones fisicas APTAS para practicar deporte.')
      pdf.checkItem(!!checks.seguroMedico, 'SEGURO MEDICO: Cuento con afiliacion vigente a EPS o medicina prepagada.')
      pdf.sectionTitle('4. DESCARGO DE RESPONSABILIDAD MEDICA Y LEGAL')
      const condJ: [string, string][] = [
        ['exoneracion', 'EXONERACION: EXIMO DE TODA RESPONSABILIDAD LEGAL Y CIVIL a la organizacion LATIDO Y HUELLA 2026 por cualquier lesion o accidente.'],
        ['riesgo', 'ASUNCION DE RIESGO: PARTICIPO VOLUNTARIAMENTE y bajo MI PROPIO RIESGO.'],
        ['atencionJ', 'ATENCION MEDICA: Autorizo al personal medico a brindar primeros auxilios en caso de emergencia.'],
        ['seguroPropio', 'SEGURO PROPIO: Entiendo que cualquier tratamiento posterior sera cubierto por mi seguro personal.'],
      ]
      for (const [k, l] of condJ) pdf.checkItem(!!checks[k], l)
      pdf.sectionTitle('5. TERMINOS DEPORTIVOS')
      const termJ: [string, string][] = [
        ['reglamentoJ', 'REGLAMENTO: Me comprometo a jugar bajo el reglamento FIFA/FIP adaptado.'],
        ['fairPlayJ', 'FAIR PLAY: Mantendre conducta deportiva en todo momento.'],
        ['arbitrajeJ', 'DECISIONES ARBITRALES: Acepto que las decisiones de los arbitros son INAPELABLES.'],
        ['datosJ', 'PROTECCION DE DATOS (Ley 1581/2012): Autorizo el tratamiento de mis datos personales.'],
        ['imagenJ', 'CESION DE IMAGEN: Autorizo el uso de fotografias y videos del evento.'],
        ['aceptacionJ', 'HE LEIDO Y ACEPTO TODOS LOS TERMINOS, CONDICIONES Y DESCARGOS ANTERIORES.'],
      ]
      for (const [k, l] of termJ) pdf.checkItem(!!checks[k], l)
    }

    if (isSponsor) {
      await pdf.drawHeader(logoBytes, 'Contrato de Patrocinio')
      pdf.paragraph('Senores LATIDO y HUELLA 2026 - Medellin. Asunto: Vinculacion Patrocinador.')
      pdf.sectionTitle('DATOS DEL PATROCINADOR')
      pdf.dataRow('Empresa', empresa)
      pdf.dataRow('Responsable', nombre)
      pdf.dataRow('CC / NIT', documento)
      pdf.dataRow('Email', email)
      pdf.dataRow('Telefono', telefono)
      pdf.dataRow('Plan de patrocinio', record.plan_name || '')
      pdf.dataRow('Valor', fmtCOP(record.amount_cents))
      pdf.divider()
      pdf.paragraph('Por medio de la presente comunicacion, manifestamos nuestra aceptacion incondicional de vinculacion comercial como PATROCINADOR en LATIDO y HUELLA 2026, evento que se llevara a cabo el dia Domingo 26 de julio de 2026 en el Parque del Bienestar COMFAMA Llanogrande.')
      pdf.sectionTitle('OBLIGACIONES Y TERMINOS')
      const condS: [string, string][] = [
        ['pagoS', 'Pago: 50% al momento de la reserva y 50% restante maximo 15 dias antes del evento.'],
        ['montajeS', 'Montaje el 25 de julio entre 10:00 a.m. y 7:00 p.m. Desmontaje el 26 de julio desde las 5:00 p.m.'],
        ['productosS', 'Abstenernos de promocionar productos diferentes a los de nuestra empresa.'],
        ['normasS', 'Abstenernos de comercializar armas, alcohol, tabaco o sustancias psicoactivas.'],
        ['materialS', 'Enviar material grafico con 20 dias de anticipacion a latidoyhuella@gmail.com.'],
        ['responsabilidadS', 'EL ORGANIZADOR no sera responsable por perdidas o danos ocasionados por terceros.'],
        ['fuerzaMayorS', 'En caso de fuerza mayor, EL ORGANIZADOR podra reprogramar el evento.'],
        ['usoBrandS', 'Autorizamos el uso de nuestro nombre comercial y material de marca con fines promocionales.'],
        ['datosS', 'Autorizamos el tratamiento de datos personales conforme a la Ley 1581 de 2012.'],
        ['imagenS', 'Autorizamos la captura de fotografias y videos con fines promocionales.'],
        ['aceptacionS', 'ACEPTAMOS TODOS LOS TERMINOS Y CONDICIONES DEL CONTRATO DE PATROCINIO.'],
      ]
      for (const [k, l] of condS) pdf.checkItem(!!checks[k], l)
    }

    if (isExpositor || isFoodTruck || isToldo) {
      const tipo = isFoodTruck ? 'FOOD TRUCK' : isToldo ? 'TOLDOS' : 'EXPOSITOR'
      await pdf.drawHeader(logoBytes, `Acta de Vinculacion Comercial - ${tipo}`, 'Feria Comercial, Familiar y Pet Friendly')
      pdf.sectionTitle('1. INFORMACION GENERAL')
      pdf.paragraph(`Por medio del presente documento, ${nombre}, identificado(a) con CC / NIT No. ${documento}, actuando en nombre propio o en representacion de la empresa / marca ${empresa}, manifiesta su aceptacion de vinculacion comercial como ${tipo} en LATIDO y HUELLA 2026.`)
      pdf.dataRow('Marca / empresa', empresa)
      pdf.dataRow('Responsable', nombre)
      pdf.dataRow('CC / NIT', documento)
      pdf.dataRow('Telefono', telefono)
      pdf.dataRow('Email', email)
      pdf.dataRow('Direccion', record.address && record.city ? `${record.address} - ${record.city}` : '—')
      if (isExpositor) {
        pdf.dataRow('Numero de stand', record.stand_id || '—')
        pdf.dataRow('Tipo de espacio', record.stand_type || '—')
      }
      if (isFoodTruck) {
        pdf.dataRow('Spot asignado', record.stand_id || '—')
        pdf.dataRow('Dimensiones', record.ft_width_m ? `${record.ft_width_m}m x ${record.ft_length_m}m = ${record.ft_total_m2}m2` : '—')
        pdf.dataRow('Tipo de producto', record.product_type || '—')
      }
      if (isToldo) {
        pdf.dataRow('Cantidad de toldos', String(record.quantity || 1))
      }
      pdf.dataRow('Valor total', fmtCOP(record.amount_cents || (record.total_amount ? record.total_amount * 100 : 0)))
      pdf.divider()
      pdf.paragraph('El evento se llevara a cabo el dia domingo 26 de julio de 2026, en el Parque del Bienestar COMFAMA Llanogrande, ubicado en la Milla de Oro Llanogrande, Km 8.5, diagonal al Mall Llanogrande, entre las 8:00 a.m. y las 5:00 p.m., organizado por LATIDO y HUELLA.')

      pdf.sectionTitle('3. OBLIGACIONES')
      let obligaciones: [string, string][] = []
      if (isExpositor) {
        obligaciones = [
          ['pago', '3.1. Pago: 50% al reservar y 50% restante maximo 15 dias antes del evento.'],
          ['montaje', '3.2. Montaje el 25 de julio entre 10:00 a.m. y 6:00 p.m. Desmontaje el 26 de julio desde las 5:00 p.m.'],
          ['productos', '3.3. Abstenernos de promocionar productos diferentes a los de mi propia empresa.'],
          ['comercializacion', '3.4. Abstenernos de comercializar armas, alcohol, tabaco o sustancias psicoactivas.'],
          ['normasSanitarias', '3.5. Cumplir con todas las normas sanitarias, comerciales y legales aplicables.'],
          ['gas', '3.6. Abstenernos de ingresar pipetas de gas no certificadas o conexiones electricas improvisadas.'],
          ['espacio', '3.7. Respetar las dimensiones y ubicacion asignadas para el stand.'],
          ['listaPersonal', '3.8. Entregar lista con nombres y documentos del personal de montaje y operacion.'],
          ['seguridad', '3.9. Garantizar afiliacion vigente al Sistema de Seguridad Social de todo el personal.'],
          ['custodia', '3.10. Asumir plena responsabilidad sobre la custodia y seguridad de productos y equipos.'],
          ['cesion', '3.11. Abstenernos de ceder, compartir o subarrendar el espacio contratado.'],
        ]
      } else if (isFoodTruck) {
        obligaciones = [
          ['pagoFT', '3.1. Pago: 50% al reservar y 50% restante maximo 15 dias antes del evento.'],
          ['montajeFT', '3.2. Montaje el 25 de julio entre 10:00 a.m. y 6:00 p.m. Desmontaje el 26 de julio desde las 5:00 p.m.'],
          ['productosFT', '3.3. Abstenernos de comercializar productos diferentes a los declarados.'],
          ['permisosFT', '3.4. Garantizar permisos sanitarios, certificados de manipulacion de alimentos y permisos INVIMA vigentes.'],
          ['gasFT', '3.5. No ingresar pipetas de gas no certificadas ni conexiones electricas improvisadas.'],
          ['extintorFT', '3.6. Ingresar con extintor vigente y seguro del vehiculo al dia.'],
          ['espacioFT', '3.7. Respetar el espacio asignado sin instalar fuera del area autorizada.'],
          ['seguridadFT', '3.8. Garantizar afiliacion vigente al Sistema de Seguridad Social del personal.'],
          ['custodiaFT', '3.9. Asumir responsabilidad sobre la seguridad de equipos, vehiculo y mercancia.'],
        ]
      } else {
        obligaciones = [
          ['pagoT', '3.1. Pago: 50% al reservar y 50% restante maximo 15 dias antes del evento.'],
          ['montajeT', '3.2. Montaje el 25 de julio entre 10:00 a.m. y 6:00 p.m. Desmontaje el 26 de julio desde las 5:00 p.m.'],
          ['productosT', '3.3. Abstenernos de comercializar productos diferentes a los declarados.'],
          ['permisosT', '3.4. Garantizar permisos sanitarios y certificados de manipulacion de alimentos vigentes.'],
          ['espacioT', '3.5. Respetar la ubicacion asignada por zonas.'],
          ['seguridadT', '3.6. Garantizar afiliacion vigente al Sistema de Seguridad Social del personal.'],
          ['custodiaT', '3.7. Asumir responsabilidad sobre la seguridad de equipos y mercancia.'],
        ]
      }
      for (const [k, l] of obligaciones) pdf.checkItem(!!checks[k], l)

      pdf.sectionTitle('4. DECLARACIONES Y ACEPTACIONES')
      let declaraciones: [string, string][] = []
      if (isExpositor) {
        declaraciones = [
          ['decl1', '4.1. EL ORGANIZADOR no sera responsable por perdidas, robos o danos ocasionados por terceros.'],
          ['decl2', '4.2. Somos responsables por la seguridad del personal vinculado.'],
          ['decl3', '4.3. EL ORGANIZADOR podra celebrar acuerdos comerciales con otras marcas.'],
          ['decl4', '4.4. En caso de fuerza mayor, EL ORGANIZADOR podra reprogramar el evento.'],
          ['decl5', '4.5. En caso de cancelacion, ambas partes quedan exentas de obligaciones.'],
          ['decl6', '4.6. En caso de cancelacion, EL ORGANIZADOR devolvera los bienes entregados.'],
          ['decl7', '4.7. Autorizamos el uso de nombre comercial, logos y material de marca.'],
          ['decl8', '4.8. Autorizamos el tratamiento de datos conforme a la Ley 1581 de 2012.'],
          ['decl9', '4.9. Autorizamos la captura de fotografias y videos con fines promocionales.'],
        ]
      } else if (isFoodTruck) {
        declaraciones = [
          ['declFT1', '4.1. EL ORGANIZADOR no sera responsable por perdidas o danos ocasionados por terceros.'],
          ['declFT2', '4.2. Somos responsables por la seguridad del personal vinculado.'],
          ['declFT3', '4.3. En caso de fuerza mayor, EL ORGANIZADOR podra reprogramar el evento.'],
          ['declFT4', '4.7. Autorizamos el uso de nombre comercial y material de marca.'],
          ['declFT5', '4.8. Autorizamos el tratamiento de datos personales.'],
          ['declFT6', '4.9. Autorizamos la captura de fotografias y videos.'],
        ]
      } else {
        declaraciones = [
          ['declT1', '4.1. EL ORGANIZADOR no sera responsable por perdidas o danos ocasionados por terceros.'],
          ['declT2', '4.2. Somos responsables por la seguridad del personal vinculado.'],
          ['declT3', '4.3. En caso de fuerza mayor, EL ORGANIZADOR podra reprogramar el evento.'],
          ['declT4', '4.7. Autorizamos el uso de nombre comercial y logos.'],
          ['declT5', '4.8. Autorizamos el tratamiento de datos personales.'],
          ['declT6', '4.9. Autorizamos la captura de fotografias y videos.'],
        ]
      }
      for (const [k, l] of declaraciones) pdf.checkItem(!!checks[k], l)

      const aceptKey = isExpositor ? 'aceptacionExp' : isFoodTruck ? 'aceptacionFT' : 'aceptacionT'
      pdf.checkItem(!!checks[aceptKey], 'En constancia de aceptacion de todos los terminos anteriores, firmo el presente documento.')

      pdf.divider()
      pdf.sectionTitle('DOCUMENTOS ENTREGADOS')
      pdf.checkItem(!!record.cedula_url, 'Cedula / NIT del responsable - Documento recibido')
      pdf.checkItem(!!record.rut_url, 'RUT actualizado - Documento recibido')
      pdf.checkItem(!!record.camara_comercio_url, 'Camara de Comercio - Documento recibido')

      if (staffList.length > 0) {
        pdf.divider()
        pdf.sectionTitle('PERSONAL AUTORIZADO DE APOYO')
        for (let i = 0; i < staffList.length; i++) {
          const s = staffList[i]
          pdf.checkSpace(16)
          pdf.page.drawText(`${i + 1}. ${s.full_name} - CC: ${s.cedula || '-'} - Tel: ${s.phone || '-'} - ARL/EPS: ${s.arl_eps || '-'}`, { x: pdf.margin, y: pdf.y, size: 8.5, font: pdf.fontRegular, color: DARK })
          pdf.y -= 14
        }
      }
    }

    await pdf.drawSignature(record.contract_signature_url, signerName, record.contract_signed_at || new Date().toISOString())
    pdf.finalize()

    const pdfBytes = await pdf.doc.save()
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