import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const CYAN = '#00BCD4'
const NAVY = '#0D1B6E'

function fmtCOP(cents: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format((cents || 0) / 100)
}

function QRCode({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-2xl border" style={{ borderColor: '#ddd' }}>
      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`} alt="QR" className="w-28 h-28" />
      <p className="text-xs text-center mt-2 text-gray-400">Escanea para firmar desde el celular</p>
    </div>
  )
}

function SignatureCanvas({ onSign }: { onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const onSignRef = useRef(onSign)
  onSignRef.current = onSign
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.strokeStyle = NAVY; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect()
      if ('touches' in e) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
      return { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top }
    }
    const start = (e: MouseEvent | TouchEvent) => { e.preventDefault(); drawing.current = true; setShowPlaceholder(false); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
    const move = (e: MouseEvent | TouchEvent) => { e.preventDefault(); if (!drawing.current) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke() }
    const end = () => { if (!drawing.current) return; drawing.current = false; onSignRef.current(canvas.toDataURL('image/png')) }
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', end)
    canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', end)
    return () => { canvas.removeEventListener('mousedown', start); canvas.removeEventListener('mousemove', move); canvas.removeEventListener('mouseup', end); canvas.removeEventListener('mouseleave', end); canvas.removeEventListener('touchstart', start); canvas.removeEventListener('touchmove', move); canvas.removeEventListener('touchend', end) }
  }, [])

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    setShowPlaceholder(true); onSignRef.current('')
  }
  return (
    <div>
      <div className="relative border-2 rounded-xl overflow-hidden bg-white" style={{ borderColor: showPlaceholder ? '#ddd' : CYAN, height: 180 }}>
        <canvas ref={canvasRef} className="w-full h-full touch-none cursor-crosshair" style={{ display: 'block' }} />
        {showPlaceholder && <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"><p className="text-sm" style={{ color: '#ccc' }}>✍️ Dibuja tu firma aquí</p></div>}
      </div>
      <button onClick={clear} className="mt-2 text-xs px-3 py-1 rounded-lg border hover:bg-gray-50" style={{ color: '#666', borderColor: '#ddd' }}>Limpiar firma</button>
    </div>
  )
}

function DocUploader({ label, field, recordId, existingUrl, onUploaded, required = false }:
  { label: string; field: string; recordId: string; existingUrl: string | null; onUploaded: (url: string) => void; required?: boolean }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(existingUrl)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const { data, error } = await supabase.storage.from('expositor-documents').upload(`${field}_${recordId}_${Date.now()}.${ext}`, file, { upsert: true })
    if (!error && data) { const { data: u } = supabase.storage.from('expositor-documents').getPublicUrl(data.path); setUrl(u.publicUrl); onUploaded(u.publicUrl) }
    setUploading(false)
  }
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: url ? '#4CAF50' : required ? '#f87171' : '#ddd', background: url ? '#f0fdf4' : required ? '#fff5f5' : '#fafafa' }}>
      <div className="flex-1">
        <div className="text-sm font-bold" style={{ color: url ? '#4CAF50' : required ? '#f87171' : '#333' }}>{url ? `✅ ${label}` : `📎 ${label}${required ? ' *' : ''}`}</div>
        {url && <div className="text-xs mt-0.5 text-gray-400">Documento recibido</div>}
        {!url && required && <div className="text-xs mt-0.5" style={{ color: '#f87171' }}>Obligatorio</div>}
      </div>
      {!url && <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: CYAN }}>{uploading ? 'Subiendo...' : 'Subir'}<input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} /></label>}
      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg border font-bold" style={{ color: CYAN, borderColor: CYAN }}>Ver</a>}
    </div>
  )
}

function Field({ label, value, set, type = 'text', colSpan = false, required = false }:
  { label: string; value: string; set: (v: string) => void; type?: string; colSpan?: boolean; required?: boolean }) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="text-xs font-bold text-gray-500 mb-1 block">{label}{required && <span style={{ color: '#f87171' }}> *</span>}</label>
      <input type={type} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400" value={value} onChange={e => set(e.target.value)} />
    </div>
  )
}

function Check({ id, label, checked, set }: { id: string; label: string; checked: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 border border-transparent" style={{ borderColor: checked ? 'transparent' : 'transparent' }}>
      <input type="checkbox" className="mt-0.5 w-4 h-4 accent-cyan-500 flex-shrink-0" id={id} checked={checked} onChange={e => set(e.target.checked)} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function DocHeader({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: NAVY }}>
      <div className="font-black text-xl mb-1" style={{ color: NAVY }}>LATIDO Y HUELLA 2026</div>
      <div className="font-bold text-base mt-1" style={{ color: NAVY }}>{titulo}</div>
      {subtitulo && <div className="text-sm font-medium mt-1" style={{ color: CYAN }}>{subtitulo}</div>}
      <div className="text-xs text-gray-400 mt-2">26 de julio de 2026 | Parque del Bienestar COMFAMA Llanogrande</div>
    </div>
  )
}

function DatosTable({ datos }: { datos: [string, string][] }) {
  return (
    <table className="w-full text-sm mb-4 border-collapse">
      <tbody>
        {datos.map(([label, val]) => (
          <tr key={label} className="border-b">
            <td className="py-1.5 pr-3 font-bold text-gray-600 w-1/3">{label}</td>
            <td className="py-1.5 text-gray-800">{val || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ContratoPage() {
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const isMobile = searchParams.get('firma') === 'mobile'

  const [record, setRecord] = useState<any>(null)
  const [parentRecord, setParentRecord] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [table, setTable] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [alreadySigned, setAlreadySigned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [editing, setEditing] = useState(false)
  const [mobileConfirmed, setMobileConfirmed] = useState(false)

  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [eps, setEps] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [emergName, setEmergName] = useState('')
  const [emergPhone, setEmergPhone] = useState('')
  const [razonSocial, setRazonSocial] = useState('')

  const [cedulaUrl, setCedulaUrl] = useState<string | null>(null)
  const [rutUrl, setRutUrl] = useState<string | null>(null)
  const [camaraUrl, setCamaraUrl] = useState<string | null>(null)
  const [docUrl, setDocUrl] = useState<string | null>(null)

  const [signatureName, setSignatureName] = useState('')
  const [signatureDataUrl, setSignatureDataUrl] = useState('')
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const setCheck = (k: string, v: boolean) => setChecks(c => ({ ...c, [k]: v }))
  const allChecked = Object.keys(checks).length > 0 && Object.values(checks).every(Boolean)

  const [staff, setStaff] = useState([
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
  ])
  const [staffToldo, setStaffToldo] = useState([
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
  ])

  const onSign = useCallback((dataUrl: string) => setSignatureDataUrl(dataUrl), [])

  useEffect(() => {
    const buscar = async () => {
      const tablas = ['registrations_5k','registration_attendees','sports_team_registrations','sports_team_players','expositor_reservations','toldos_reservations','sponsor_inquiries']
      for (const t of tablas) {
        const { data } = await supabase.from(t).select('*').eq('contract_token', token).maybeSingle()
        if (data) {
          setRecord(data); setTable(t)
          if (t === 'sports_team_players' && data.team_id) {
            const { data: p } = await supabase.from('sports_team_registrations').select('*').eq('id', data.team_id).maybeSingle()
            setParentRecord(p)
          }
          if (t === 'registration_attendees' && data.registration_id) {
            const { data: p } = await supabase.from('registrations_5k').select('*').eq('id', data.registration_id).maybeSingle()
            setParentRecord(p)
          }
          if (t === 'sports_team_registrations') {
            const { data: pl } = await supabase.from('sports_team_players').select('*').eq('team_id', data.id).order('player_index')
            setPlayers(pl || [])
          }
          setNombre(data.full_name || data.responsible_name || data.captain_name || data.contact_name || data.name || '')
          setEmpresa(data.brand_name || data.company_name || '')
          setRazonSocial(data.company_name || '')
          setDocumento(data.document_id || data.cedula || data.ti || data.captain_cedula || '')
          setTelefono(data.phone || data.captain_phone || '')
          setEmail(data.email || data.captain_email || '')
          setEps(data.eps || '')
          setAddress(data.address || '')
          setCity(data.city || '')
          setEmergName(data.emergency_contact_name || data.responsable_name || '')
          setEmergPhone(data.emergency_contact_phone || data.responsable_phone || '')
          setCedulaUrl(data.cedula_url || null)
          setRutUrl(data.rut_url || null)
          setCamaraUrl(data.camara_comercio_url || null)
          if (data.contract_signed_at) setAlreadySigned(true)
          setLoading(false); return
        }
      }
      setNotFound(true); setLoading(false)
    }
    if (token) buscar()
  }, [token])

  useEffect(() => {
    if (!record || isMobile) return
    const ch = supabase.channel(`contrato-${record.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter: `id=eq.${record.id}` }, (payload) => {
        const sig = payload.new?.mobile_signature_url
        if (sig && !signatureDataUrl) setSignatureDataUrl(sig)
      }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [record, table, isMobile, signatureDataUrl])

  const handleMobileSign = async (dataUrl: string) => {
    if (!dataUrl || !record) return
    setSignatureDataUrl(dataUrl)
    const blob = await fetch(dataUrl).then(r => r.blob())
    const path = `signatures/mobile_${record.id}_${Date.now()}.png`
    const { data } = await supabase.storage.from('expositor-documents').upload(path, blob, { contentType: 'image/png', upsert: true })
    if (data) {
      const { data: u } = supabase.storage.from('expositor-documents').getPublicUrl(path)
      await supabase.from(table).update({ mobile_signature_url: u.publicUrl }).eq('id', record.id)
    }
  }

  const isExpositor = table === 'expositor_reservations' && record?.category === 'comercial'
  const isFoodTruck = table === 'expositor_reservations' && record?.category === 'foodtruck'
  const isToldo = table === 'toldos_reservations'
  const isComercial = isExpositor || isFoodTruck || isToldo
  const isJugador = table === 'sports_team_players'
  const isCapitan = table === 'sports_team_registrations'
  const isMinor = table === 'registration_attendees' && record?.is_minor
  const isCaminata = table === 'registrations_5k'
  const isSponsor = table === 'sponsor_inquiries'
  const mobileUrl = `${window.location.origin}/contrato/${token}?firma=mobile`

  const validate = () => {
    const errs: string[] = []
    if (!nombre.trim()) errs.push('Nombre completo')
    if (!documento.trim()) errs.push('Número de documento de identidad')
    if (!signatureName.trim()) errs.push('Nombre del firmante')
    if (!signatureDataUrl) errs.push('Firma manuscrita')
    if (!allChecked) errs.push('Debes marcar TODOS los checkmarks obligatorios')
    if (isComercial) {
      if (!cedulaUrl) errs.push('Cédula / NIT del responsable')
      if (!rutUrl) errs.push('RUT actualizado')
      if (!camaraUrl) errs.push('Cámara de Comercio')
      if (!address.trim()) errs.push('Dirección')
      if (!city.trim()) errs.push('Ciudad')
    }
    if ((isCaminata || isJugador) && !docUrl && !cedulaUrl) errs.push('Documento de identidad (cédula o TI)')
    if (isMinor && !docUrl) errs.push('Documento del menor (TI o cédula)')
    setErrors(errs)
    if (errs.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return errs.length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const blob = await fetch(signatureDataUrl).then(r => r.blob())
      const sigPath = `signatures/contrato_${record.id}_${Date.now()}.png`
      await supabase.storage.from('expositor-documents').upload(sigPath, blob, { contentType: 'image/png', upsert: true })
      const { data: sigUrl } = supabase.storage.from('expositor-documents').getPublicUrl(sigPath)

      const updates: Record<string, any> = {
        contract_signed_at: new Date().toISOString(),
        contract_signature_url: sigUrl.publicUrl,
        accepted_contract_at: new Date().toISOString(),
        contract_checks: checks,
        signature_name: signatureName,
      }
      if (nombre) updates[
        table === 'sports_team_registrations' ? 'captain_name' : 
        table === 'sports_team_players' ? 'name' : 
        table === 'expositor_reservations' ? 'responsible_name' :
        table === 'toldos_reservations' ? 'responsible_name' :
        table === 'sponsor_inquiries' ? 'contact_name' :
        'full_name'
      ] = nombre
      if (documento) updates[table === 'sports_team_registrations' ? 'captain_cedula' : table === 'registrations_5k' ? 'document_id' : 'cedula'] = documento
      if (telefono) updates[table === 'sports_team_registrations' ? 'captain_phone' : 'phone'] = telefono
      if (email) updates[table === 'sports_team_registrations' ? 'captain_email' : 'email'] = email
      if (eps && ['sports_team_players','registration_attendees'].includes(table)) updates.eps = eps
      if (address && ['expositor_reservations','toldos_reservations'].includes(table)) updates.address = address
      if (city && ['expositor_reservations','toldos_reservations'].includes(table)) updates.city = city
      if (emergName && table === 'sports_team_players') updates.emergency_contact_name = emergName
      if (emergPhone && table === 'sports_team_players') updates.emergency_contact_phone = emergPhone
      if (empresa && ['expositor_reservations','toldos_reservations'].includes(table)) updates.brand_name = empresa
      if (empresa && table === 'sponsor_inquiries') updates.company_name = empresa
      if (cedulaUrl && ['expositor_reservations','toldos_reservations','sponsor_inquiries'].includes(table)) updates.cedula_url = cedulaUrl
      if (rutUrl && ['expositor_reservations','toldos_reservations'].includes(table)) updates.rut_url = rutUrl
      if (camaraUrl && ['expositor_reservations','toldos_reservations'].includes(table)) updates.camara_comercio_url = camaraUrl
      if (docUrl) updates.cedula_url = docUrl

      const { error: updateError } = await supabase.from(table).update(updates).eq('id', record.id)
      if (updateError) {
        console.error('Error guardando firma:', updateError)
        setErrors([`Error al guardar la firma: ${updateError.message}. Por favor intenta de nuevo.`])
        setSubmitting(false)
        return
      }

      if (isComercial && !isToldo) {
        const staffToSave = staff.filter(s => s.full_name.trim())
        if (staffToSave.length > 0) await supabase.from('stand_staff').insert(staffToSave.map(s => ({ ...s, expositor_id: record.id })))
      }
      if (isToldo) {
        const staffToSave = staffToldo.filter(s => s.full_name.trim())
        if (staffToSave.length > 0) await supabase.from('stand_staff').insert(staffToSave.map(s => ({ ...s, expositor_id: record.id })))
      }

      // Generar PDF y enviar emails
      try {
        const pdfRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-contract-pdf`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ contract_token: token })
        })
        const pdfData = await pdfRes.json()
        const pdfUrl = pdfData.pdf_url || ''
        const recipientEmail = email || record.email || record.captain_email || ''
        const recipientName = nombre || ''

        const tipoDoc = isCaminata ? 'Términos y Condiciones — Caminata 6.5K'
          : isMinor ? 'Autorización Menor de Edad'
          : isCapitan ? 'Inscripción de Equipo Deportivo'
          : isJugador ? 'Descargo Individual de Responsabilidad'
          : isSponsor ? 'Contrato de Patrocinio'
          : isFoodTruck ? 'Acta de Vinculación — Food Truck'
          : isToldo ? 'Acta de Vinculación — Toldos'
          : 'Acta de Vinculación Comercial'

        const ecardUrl = `https://admin-latidoyhuella.netlify.app/ecard/${record.id}`
        const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5">
          
          <!-- Header -->
          <div style="background:#0D1B6E;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0">
            <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:65px;margin-bottom:16px" alt="Latido y Huella"/>
            <div style="background:rgba(76,175,80,0.2);border:1px solid #4CAF50;border-radius:30px;display:inline-block;padding:8px 20px;margin-bottom:16px">
              <span style="color:#4CAF50;font-weight:700;font-size:14px">✅ ¡Todo listo! Ya eres parte del evento</span>
            </div>
            <h1 style="color:white;font-size:28px;margin:0;font-weight:800;line-height:1.2">¡Tu registro está<br/>100% completo! 🎉</h1>
          </div>

          <!-- Body -->
          <div style="background:white;padding:36px 32px">
            
            <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px">Hola <strong>${recipientName}</strong>,</p>
            
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px">
              Tu <strong>${tipoDoc}</strong> ha sido firmado exitosamente. 
              Ya eres parte oficial de <strong>Latido y Huella 2026</strong>, 
              la feria más especial del año para los amantes de las mascotas y el deporte. 
              ¡Nos emociona tenerte con nosotros! 🐾❤️
            </p>

            <!-- Evento info -->
            <div style="background:linear-gradient(135deg,#0D1B6E,#1a2d8a);border-radius:16px;padding:24px;margin:24px 0;color:white">
              <h2 style="margin:0 0 16px;font-size:18px;color:#00BCD4">📅 Información del evento</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1)">
                    <span style="color:rgba(255,255,255,0.6);font-size:12px">📅 FECHA</span><br/>
                    <strong style="color:white;font-size:15px">Domingo 26 de julio de 2026</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1)">
                    <span style="color:rgba(255,255,255,0.6);font-size:12px">⏰ HORA</span><br/>
                    <strong style="color:white;font-size:15px">7:00 AM — 5:00 PM</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0">
                    <span style="color:rgba(255,255,255,0.6);font-size:12px">📍 LUGAR</span><br/>
                    <strong style="color:white;font-size:15px">Parque del Bienestar COMFAMA Llanogrande</strong><br/>
                    <span style="color:rgba(255,255,255,0.6);font-size:13px">Km 8.5, Milla de Oro Llanogrande, Antioquia</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Mensaje motivador -->
            <div style="background:#f0f4ff;border-left:4px solid #00BCD4;border-radius:0 12px 12px 0;padding:20px;margin:24px 0">
              <p style="color:#0D1B6E;font-size:15px;font-weight:700;margin:0 0 8px">🌟 ¡Comparte este momento!</p>
              <p style="color:#444;font-size:14px;line-height:1.6;margin:0">
                Invita a tus amigos y familia a ser parte de este gran evento. 
                Cuantos más seamos, más especial será la experiencia. 
                Juntos haremos de Latido y Huella 2026 un día inolvidable. ¡Nos vemos el 26!
              </p>
            </div>

            <!-- E-Card -->
            <div style="background:#f8f9ff;border:2px dashed #00BCD4;border-radius:16px;padding:24px;margin:24px 0;text-align:center">
              <div style="font-size:32px;margin-bottom:8px">🎫</div>
              <h3 style="color:#0D1B6E;margin:0 0 8px;font-size:18px">Tu E-Card de ingreso está lista</h3>
              <p style="color:#666;font-size:13px;margin:0 0 20px;line-height:1.6">
                Adjunto encontrarás tu ticket digital de ingreso.<br/>
                <strong>Descárgalo y guárdalo en tu celular</strong> — lo necesitarás para ingresar al evento.<br/>
                El staff escaneará tu QR en la entrada.
              </p>
              <a href="${ecardUrl}" style="background:linear-gradient(135deg,#0D1B6E,#00BCD4);color:white;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:800;display:inline-block;font-size:15px">
                🎫 Ver y descargar mi E-Card
              </a>
            </div>

            ${pdfUrl ? `<!-- PDF -->
            <div style="text-align:center;margin:16px 0">
              <a href="${pdfUrl}" style="color:#0D1B6E;font-size:13px;text-decoration:underline">📄 Ver documento firmado (PDF)</a>
            </div>` : ''}

            <!-- Kit pickup -->
            <div style="background:#fff3e0;border-radius:14px;padding:24px;margin:24px 0;border:1px solid #FFB300">
              <h3 style="color:#e65100;font-size:16px;margin:0 0 8px">👕 ¿Dónde recoges tu Kit Caminata Canina?</h3>
              <p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6">Selecciona el punto de entrega más conveniente para ti. Tu elección quedará registrada.</p>
              <div style="background:white;border-radius:10px;padding:16px;margin:0 0 12px;border:1px solid #ffe0b2">
                <p style="color:#0D1B6E;font-weight:700;font-size:15px;margin:0 0 6px">🏙️ Medellín</p>
                <p style="color:#333;font-size:13px;margin:0 0 4px">📍 <strong>Vitrina Chery</strong> — Calle 31 # 43-73</p>
                <p style="color:#555;font-size:13px;margin:0 0 4px">📅 Viernes 24 Jul: 9:00 AM – 4:00 PM</p>
                <p style="color:#555;font-size:13px;margin:0 0 14px">📅 Sábado 25 Jul: 9:00 AM – 12:00 M</p>
                <a href="https://admin-latidoyhuella.netlify.app/kit/${record.id}/medellin" style="background:#0D1B6E;color:white;padding:11px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block">👕 Recoger en Medellín</a>
              </div>
              <div style="background:white;border-radius:10px;padding:16px;border:1px solid #ffe0b2">
                <p style="color:#0D1B6E;font-weight:700;font-size:15px;margin:0 0 6px">🌄 Llanogrande</p>
                <p style="color:#333;font-size:13px;margin:0 0 4px">📍 <strong>La Finca de Rigo</strong> — Glorieta El Tablazo, Llanogrande (Rionegro)</p>
                <p style="color:#555;font-size:13px;margin:0 0 4px">📅 Viernes 24 Jul: 9:00 AM – 4:00 PM</p>
                <p style="color:#555;font-size:13px;margin:0 0 14px">📅 Sábado 25 Jul: 9:00 AM – 12:00 M</p>
                <a href="https://admin-latidoyhuella.netlify.app/kit/${record.id}/llanogrande" style="background:#00BCD4;color:white;padding:11px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block">👕 Recoger en Llanogrande</a>
              </div>
            </div>

            <!-- Tips -->
            <div style="background:#fff8e1;border-radius:12px;padding:20px;margin:24px 0">
              <h3 style="color:#F57F17;margin:0 0 12px;font-size:15px">💡 Recuerda el día del evento</h3>
              <ul style="color:#555;font-size:13px;line-height:2;margin:0;padding-left:20px">
                <li>Llega con tiempo — el acceso abre a las 7:00 AM</li>
                <li>Presenta tu E-Card (QR) en la entrada</li>
                <li>Lleva documento de identidad</li>
                <li>Si traes mascota: correa, agua y carnet de vacunas</li>
                <li>¡Usa ropa cómoda y mucha energía! 🎉</li>
              </ul>
            </div>

            <p style="color:#555;font-size:14px;line-height:1.7;margin:24px 0 0;text-align:center">
              ¿Tienes preguntas? Escríbenos a<br/>
              <a href="mailto:eventos@latidoyhuella.co" style="color:#00BCD4;font-weight:700">eventos@latidoyhuella.co</a><br/>
              o por WhatsApp al <strong>+57 333 277 7912</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#0D1B6E;padding:24px 32px;text-align:center;border-radius:0 0 16px 16px">
            <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:40px;margin-bottom:12px" alt="Latido y Huella"/>
            <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0;line-height:1.8">
              Latido y Huella 2026 · Organizado por Diverxo S.A.S<br/>
              eventos@latidoyhuella.co · www.latidoyhuella.com<br/>
              WhatsApp: +57 333 277 7912
            </p>
          </div>
        </div>`

        // Email al usuario
        if (recipientEmail) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipientEmail, subject: `✅ Documento firmado — ${tipoDoc}`, html: emailHtml, from: 'eventos@latidoyhuella.co', type: 'contrato' })
          })
        }

        // Email a eventos@latidoyhuella.co
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: 'eventos@latidoyhuella.co', subject: `📋 Nuevo contrato firmado — ${recipientName} (${tipoDoc})`, html: emailHtml, from: 'noresponder@latidoyhuella.co', type: 'contrato' })
        })
      } catch (emailErr) {
        console.error('Error sending post-signature email:', emailErr)
        // No bloqueamos el flujo si el email falla
      }

      setDone(true)
    } catch (err) { console.error(err); alert('Error al enviar. Por favor intenta de nuevo.') }
    setSubmitting(false)
  }

  if (isMobile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: NAVY }}>
      <img src={LOGO_URL} alt="Logo" className="h-12 mb-6" />
      <h2 className="text-white font-bold text-xl mb-2 text-center">Firma tu documento</h2>
      <p className="text-white/60 text-sm text-center mb-6">Dibuja tu firma con el dedo en el recuadro</p>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-4 mb-4">
          <SignatureCanvas onSign={url => { setSignatureDataUrl(url) }} />
          {signatureDataUrl && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Vista previa de tu firma:</p>
              <img src={signatureDataUrl} alt="Firma" className="w-full border rounded-xl" style={{ maxHeight: 80, objectFit: 'contain', background: '#f9f9f9' }} />
            </div>
          )}
        </div>
        {!mobileConfirmed
          ? <>
              {signatureDataUrl && (
                <button onClick={async () => {
                  const blob = await fetch(signatureDataUrl).then(r => r.blob())
                  const path = `signatures/mobile_${record?.id}_${Date.now()}.png`
                  const { data } = await supabase.storage.from('expositor-documents').upload(path, blob, { contentType: 'image/png', upsert: true })
                  if (data) {
                    const { data: u } = supabase.storage.from('expositor-documents').getPublicUrl(path)
                    await supabase.from(table).update({ mobile_signature_url: u.publicUrl }).eq('id', record.id)
                    setMobileConfirmed(true)
                  }
                }} className="w-full py-3 rounded-2xl font-bold text-white mb-3" style={{ background: 'linear-gradient(135deg,#4CAF50,#388E3C)' }}>
                  ✅ Confirmar mi firma
                </button>
              )}
              <p className="text-white/40 text-xs text-center">Dibuja tu firma y presiona Confirmar</p>
            </>
          : <div className="p-4 rounded-2xl text-center font-bold" style={{ background: 'rgba(76,175,80,0.15)', color: '#4CAF50' }}>
              ✅ Firma confirmada — vuelve al computador para completar el documento
            </div>
        }
      </div>
    </div>
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}><div className="text-white text-center"><div className="text-4xl mb-4">⏳</div><p>Cargando documento...</p></div></div>
  if (notFound) return <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}><div className="text-white text-center p-8"><div className="text-6xl mb-4">❌</div><h2 className="text-2xl font-bold mb-2">Link no válido</h2><p className="text-white/60">Este link no existe o ya expiró.</p></div></div>
  if (alreadySigned && !done) return <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}><div className="text-white text-center p-8"><img src={LOGO_URL} alt="Logo" className="h-16 mx-auto mb-6" /><div className="text-6xl mb-4">✅</div><h2 className="text-2xl font-bold mb-2">¡Documento ya firmado!</h2><p className="text-white/60">Revisa tu correo para ver la copia.</p></div></div>
  if (done) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center p-8 max-w-md">
        <img src={LOGO_URL} alt="Logo" className="h-16 mx-auto mb-6" />
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">¡Documento firmado exitosamente!</h2>
        <p className="text-white/70 mb-4">Recibirás una copia en tu correo electrónico.</p>
        <div className="bg-white/10 rounded-xl p-4 text-left text-sm space-y-1">
          <p><strong>Firmado por:</strong> {signatureName}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )

  const titulo = isCaminata ? 'TÉRMINOS Y CONDICIONES DE PARTICIPACIÓN'
    : isMinor ? 'AUTORIZACIÓN PARA PARTICIPACIÓN DE MENORES DE EDAD'
    : isCapitan ? 'INSCRIPCIÓN DE EQUIPO DEPORTIVO'
    : isJugador ? 'DESCARGO INDIVIDUAL DE RESPONSABILIDAD'
    : isSponsor ? 'CONTRATO DE PATROCINIO'
    : isFoodTruck ? 'ACTA DE VINCULACIÓN COMERCIAL — FOOD TRUCK'
    : isToldo ? 'ACTA DE VINCULACIÓN COMERCIAL — TOLDOS'
    : 'ACTA DE VINCULACIÓN COMERCIAL — EXPOSITOR'

  const subtitulo = isCapitan ? `${record?.sport?.toUpperCase()} — ${record?.category === 'ninos' ? 'Categoría Infantil' : 'Categoría Adultos'}`
    : isJugador ? `${parentRecord?.sport?.toUpperCase() || ''} — ${parentRecord?.team_name || ''}`
    : isCaminata ? 'Caminata Canina Pet Lovers — 6.5K' : undefined

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      <div className="py-6 px-4 text-center" style={{ background: NAVY }}>
        <img src={LOGO_URL} alt="Logo" className="h-12 mx-auto mb-2" />
        <h1 className="text-white font-bold text-lg">{titulo}</h1>
        <p className="text-white/60 text-sm">Latido y Huella 2026 · 26 de julio · Llanogrande</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* NOTA CAMPOS OBLIGATORIOS */}
        <div className="rounded-2xl p-4 text-sm font-medium" style={{ background: 'rgba(0,188,212,0.1)', border: `1px solid ${CYAN}`, color: NAVY }}>
          ⚠️ <strong>Todos los campos marcados con * son obligatorios.</strong> Todos los checkmarks deben ser marcados para poder firmar el documento. Por favor verifica que tus datos estén correctos antes de firmar.
        </div>

        {/* DATOS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-lg" style={{ color: NAVY }}>Tus datos de registro</h2>
            <button onClick={() => setEditing(!editing)}
              className="text-xs px-3 py-1.5 rounded-lg font-bold border transition-all"
              style={{ color: editing ? '#f87171' : CYAN, borderColor: editing ? '#f87171' : CYAN, background: editing ? 'rgba(248,113,113,0.1)' : 'rgba(0,188,212,0.1)' }}>
              {editing ? '🔒 Bloquear edición' : '✏️ Editar mis datos'}
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: editing ? '#f87171' : '#999' }}>
            {editing ? '⚠️ Estás editando tus datos. Asegúrate de que sean correctos antes de firmar.' : '✅ Tus datos están correctos. Activa la edición solo si necesitas corregir algo.'}
          </p>
          {!editing
            ? <div className="grid grid-cols-2 gap-3">
                {[
                  ['Nombre completo', nombre],
                  ...(isComercial ? [['Empresa / Marca', empresa], ['Razón social', razonSocial]] : []),
                  ...(isSponsor ? [['Empresa', empresa]] : []),
                  ['Documento de identidad', documento],
                  ['Teléfono / WhatsApp', telefono],
                  ['Correo electrónico', email],
                  ...(isJugador ? [['Contacto emergencia', emergName], ['Tel. emergencia', emergPhone]] : []),
                  ...(isComercial ? [['Dirección', address], ['Ciudad', city]] : []),
                ].map(([label, val]) => (
                  <div key={label} className={label === 'Correo electrónico' || label === 'Empresa / Marca' || label === 'Razón social' ? 'col-span-2' : ''}>
                    <div className="text-xs font-bold text-gray-400 mb-0.5">{label}</div>
                    <div className="text-sm font-medium text-gray-800 bg-gray-50 rounded-xl px-3 py-2">{val || '—'}</div>
                  </div>
                ))}
              </div>
            : <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre completo *" value={nombre} set={setNombre} colSpan required />
                {isComercial && <Field label="Empresa / Marca *" value={empresa} set={setEmpresa} colSpan required />}
                {isComercial && <Field label="Razón social" value={razonSocial} set={setRazonSocial} colSpan />}
                {isSponsor && <Field label="Empresa / Razón social *" value={empresa} set={setEmpresa} colSpan required />}
                <Field label="Documento de identidad *" value={documento} set={setDocumento} required />
                <Field label="Teléfono / WhatsApp *" value={telefono} set={setTelefono} required />
                <Field label="Correo electrónico *" value={email} set={setEmail} type="email" colSpan required />
                {(isCaminata || isJugador) && <Field label="EPS o Medicina Prepagada" value={eps} set={setEps} colSpan />}
                {isJugador && <>
                  <Field label="Nombre contacto de emergencia *" value={emergName} set={setEmergName} required />
                  <Field label="Teléfono contacto de emergencia *" value={emergPhone} set={setEmergPhone} required />
                </>}
                {isComercial && <>
                  <Field label="Dirección *" value={address} set={setAddress} colSpan required />
                  <Field label="Ciudad *" value={city} set={setCity} required />
                </>}
              </div>
          }
        </div>

        {/* DOCUMENTOS */}
        {(isComercial || isCaminata || isJugador || isMinor || isSponsor) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Documentos requeridos *</h2>
            <p className="text-sm text-gray-500 mb-4">Obligatorios para completar el documento. Si ya los subiste anteriormente aparecerán verificados.</p>
            <div className="space-y-3">
              {isComercial && <>
                <DocUploader label="Cédula / NIT del responsable" field="cedula" recordId={record.id} existingUrl={cedulaUrl} onUploaded={u => setCedulaUrl(u)} required />
                <DocUploader label="RUT actualizado" field="rut" recordId={record.id} existingUrl={rutUrl} onUploaded={u => setRutUrl(u)} required />
                <DocUploader label="Cámara de Comercio (máx. 30 días de vigencia)" field="camara" recordId={record.id} existingUrl={camaraUrl} onUploaded={u => setCamaraUrl(u)} required />
              </>}
              {(isCaminata || isJugador) && !cedulaUrl && (
                <DocUploader label="Cédula de ciudadanía o Tarjeta de Identidad" field="doc" recordId={record.id} existingUrl={docUrl} onUploaded={u => setDocUrl(u)} required />
              )}
              {isMinor && (
                <DocUploader label="Documento del menor (TI o Cédula)" field="doc_menor" recordId={record.id} existingUrl={docUrl} onUploaded={u => setDocUrl(u)} required />
              )}
              {isSponsor && (
                <DocUploader label="Cédula / NIT del representante legal" field="cedula" recordId={record.id} existingUrl={cedulaUrl} onUploaded={u => setCedulaUrl(u)} required />
              )}
            </div>
          </div>
        )}

        {/* PERSONAL DE APOYO — EXPOSITOR / FOOD TRUCK */}
        {(isExpositor || isFoodTruck) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Personal autorizado de apoyo al stand</h2>
            <p className="text-sm text-gray-500 mb-4">Registra hasta 4 personas autorizadas. Deben contar con afiliación vigente al Sistema de Seguridad Social.</p>
            <div className="space-y-3">
              {staff.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50">
                  <div className="col-span-2 text-xs font-bold text-gray-500">Persona {i + 1}</div>
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Nombre completo" value={s.full_name} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, full_name: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Cédula" value={s.cedula} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, cedula: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Teléfono" value={s.phone} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="ARL / EPS" value={s.arl_eps} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, arl_eps: e.target.value } : x))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERSONAL DE APOYO — TOLDO (max 2) */}
        {isToldo && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Personal autorizado de apoyo</h2>
            <p className="text-sm text-gray-500 mb-4">Registra hasta 2 personas autorizadas.</p>
            <div className="space-y-3">
              {staffToldo.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50">
                  <div className="col-span-2 text-xs font-bold text-gray-500">Persona {i + 1}</div>
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Nombre completo" value={s.full_name} onChange={e => setStaffToldo(st => st.map((x, j) => j === i ? { ...x, full_name: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Cédula" value={s.cedula} onChange={e => setStaffToldo(st => st.map((x, j) => j === i ? { ...x, cedula: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Teléfono" value={s.phone} onChange={e => setStaffToldo(st => st.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="ARL / EPS" value={s.arl_eps} onChange={e => setStaffToldo(st => st.map((x, j) => j === i ? { ...x, arl_eps: e.target.value } : x))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTRATO COMPLETO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>Documento a firmar</h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-4 max-h-[500px] overflow-y-auto pr-2 border rounded-xl p-5 bg-gray-50">

            {/* ── CAMINATA 5K ── */}
            {isCaminata && <>
              <DocHeader titulo="TÉRMINOS Y CONDICIONES DE PARTICIPACIÓN" subtitulo="Caminata Canina Pet Lovers — 6.5K" />
              <p className="italic text-gray-600">Al inscribirme en la Caminata Canina Pet Lovers 6.5K del evento LATIDO Y HUELLA 2026, declaro que he leído, entendido y acepto los siguientes términos:</p>
              <p className="font-bold" style={{ color: NAVY }}>1. DATOS DEL PARTICIPANTE</p>
              <DatosTable datos={[['Nombre completo', nombre], ['Documento de identidad', documento], ['Email', email], ['WhatsApp / Celular', telefono]]} />
              <p className="font-bold" style={{ color: NAVY }}>3. CONDICIONES GENERALES</p>
              <p>A continuación marque cada condición que acepta:</p>
              {[
                ['edad', 'EDAD MÍNIMA: Declaro ser mayor de 18 años. Si soy menor, estoy acompañado de un adulto responsable que acepta estos términos.'],
                ['salud', 'ESTADO DE SALUD: Declaro estar en condiciones físicas aptas para realizar actividad física moderada (caminata de 6,5 km). Asumo total responsabilidad sobre mi estado de salud.'],
                ['mascota', 'RESPONSABILIDAD POR MASCOTA: Soy única y exclusivamente responsable del comportamiento de mi mascota durante el evento. Me comprometo a mantenerla con correa en todo momento y a recoger sus desechos.'],
                ['vacunas', 'REQUISITOS DE LA MASCOTA: Mi mascota cuenta con vacunas al día (rabia, parvovirus, moquillo) y carnet de vacunación vigente.'],
                ['reembolso', 'POLÍTICA DE REEMBOLSO: Entiendo que no hay devolución de dinero. Puedo transferir mi inscripción a otra persona el Viernes 24 de Julio 2026 antes del evento, notificando al organizador.'],
                ['fuerzaMayor', 'FUERZA MAYOR: Acepto que el evento puede ser cancelado o reprogramado por causas de fuerza mayor (clima, emergencias, órdenes gubernamentales). En ese caso se ofrecerá cupón para nueva fecha o reembolso parcial (60%).'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>4. AUTORIZACIONES Y PROTECCIÓN DE DATOS</p>
              {[
                ['habesDatos', 'HABEAS DATA (Ley 1581/2012): Autorizo el tratamiento de mis datos personales para: gestión del evento, envío de comunicaciones relacionadas, elaboración de certificados digitales y estadísticas anónimas. Política de privacidad disponible en: www.latidoyhuella.com/privacidad'],
                ['imagen', 'CESIÓN DE DERECHOS DE IMAGEN: Autorizo el uso de fotografías y videos del evento donde aparezca mi imagen y/o la de mi mascota, con fines promocionales y de difusión del evento, sin remuneración económica. Puedo revocar esta autorización en cualquier momento.'],
                ['kit', 'ENTREGA DE KIT: Entiendo que debo recoger mi kit en las fechas y lugares establecidos por la organización. No hay envíos a domicilio.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>5. DESCARGO DE RESPONSABILIDAD</p>
              <Check id="descargo" label="Eximo de toda responsabilidad legal a la organización del evento LATIDO Y HUELLA 2026, sus patrocinadores, aliados y personal, por cualquier lesión, daño, pérdida o accidente que pueda ocurrirme a mí o a mi mascota durante el desarrollo del evento. Participo bajo mi propio riesgo en la caminata y/o actividades del parque." checked={!!checks.descargo} set={v => setCheck('descargo', v)} />
              <Check id="aceptacionFinal" label="HE LEÍDO Y ACEPTO TODOS LOS TÉRMINOS Y CONDICIONES ANTERIORES. Declaro que toda la información suministrada es verídica y me comprometo a cumplir con las normas del evento." checked={!!checks.aceptacionFinal} set={v => setCheck('aceptacionFinal', v)} />
            </>}

            {/* ── MENOR DE EDAD ── */}
            {isMinor && <>
              <DocHeader titulo="AUTORIZACIÓN PARA PARTICIPACIÓN DE MENORES DE EDAD" />
              <p className="italic text-gray-600">Este documento debe ser completado y firmado por el padre, madre o acudiente legal del menor de edad que participará en cualquiera de las actividades del evento LATIDO Y HUELLA 2026.</p>
              <p className="font-bold" style={{ color: NAVY }}>1. DATOS DEL MENOR DE EDAD</p>
              <DatosTable datos={[
                ['Nombre completo del menor', record?.full_name || ''],
                ['Tarjeta de Identidad (TI)', record?.ti || record?.document_id || ''],
                ['Fecha de nacimiento', record?.birthdate || ''],
                ['Actividad en la que participa', parentRecord?.ticket_type === 'pet_lover' ? '☑ Caminata 6.5K' : parentRecord?.ticket_type === 'deportista' ? '☑ Deporte' : '☑ Caminata 6.5K'],
                ['EPS o seguro médico', eps || ''],
              ]} />
              <p className="font-bold" style={{ color: NAVY }}>2. DATOS DEL PADRE / MADRE O ACUDIENTE LEGAL</p>
              <DatosTable datos={[
                ['Nombre completo', parentRecord?.full_name || nombre],
                ['Cédula de ciudadanía', parentRecord?.document_id || documento],
                ['Celular', parentRecord?.phone || telefono],
                ['Email', parentRecord?.email || email],
              ]} />
              <p className="font-bold" style={{ color: NAVY }}>4. DECLARACIÓN Y AUTORIZACIÓN</p>
              <p>Yo, <strong>{parentRecord?.full_name || nombre}</strong>, identificado(a) con cédula No. <strong>{parentRecord?.document_id || documento}</strong>, en mi calidad de padre/madre/acudiente legal del menor <strong>{record?.full_name}</strong>, AUTORIZO expresamente su participación en el evento LATIDO Y HUELLA 2026 y DECLARO:</p>
              {[
                ['autorizacion', 'AUTORIZACIÓN DE PARTICIPACIÓN: Autorizo la participación del menor bajo mi responsabilidad legal en la actividad seleccionada del evento.'],
                ['saludMenor', 'ESTADO DE SALUD: Declaro que el menor se encuentra en buenas condiciones de salud y apto para realizar actividad física. No presenta ninguna condición médica que le impida participar.'],
                ['responsabilidad', 'RESPONSABILIDAD: Me hago responsable de cualquier eventualidad médica, lesión o accidente que pueda ocurrirle al menor durante el evento. Eximo de responsabilidad a la organización, patrocinadores y personal del evento.'],
                ['atencionMedica', 'ATENCIÓN MÉDICA: En caso de emergencia médica, autorizo al personal médico del evento a brindar los primeros auxilios necesarios. Me comprometo a estar disponible en mi celular durante todo el evento.'],
                ['imagenMenor', 'CESIÓN DE IMAGEN: Autorizo el uso de fotografías y videos del menor en el evento para fines promocionales y de difusión, sin remuneración económica.'],
                ['datosPersonales', 'PROTECCIÓN DE DATOS (Ley 1581/2012): Autorizo el tratamiento de los datos personales del menor para la gestión del evento, certificados y comunicaciones relacionadas.'],
                ['acompanamiento', 'ACOMPAÑAMIENTO: Me comprometo a permanecer en el evento o designar un adulto responsable que acompañe al menor durante toda la actividad.'],
                ['aceptacionMenor', 'ACEPTO TODOS LOS TÉRMINOS Y CONDICIONES. Declaro que toda la información es verídica y me comprometo a cumplir con las normas del evento.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
            </>}

            {/* ── CAPITÁN EQUIPO ── */}
            {isCapitan && <>
              <DocHeader titulo="INSCRIPCIÓN DE EQUIPO DEPORTIVO" subtitulo={subtitulo} />
              <p className="italic text-gray-600">Este formulario lo completa únicamente el CAPITÁN del equipo. Cada jugador deberá completar individualmente el DESCARGO INDIVIDUAL DE RESPONSABILIDAD.</p>
              <p className="font-bold" style={{ color: NAVY }}>1. DATOS DEL EQUIPO</p>
              <DatosTable datos={[
                ['Deporte', record?.sport || ''],
                ['Nombre del equipo', record?.team_name || ''],
                ['Categoría', record?.category === 'ninos' ? 'Infantil (8-15 años)' : 'Adultos (16+ años)'],
              ]} />
              <p className="font-bold" style={{ color: NAVY }}>2. DATOS DEL CAPITÁN</p>
              <DatosTable datos={[['Nombre completo', nombre], ['Documento de identidad', documento], ['Celular', telefono], ['Email', email]]} />
              <p className="font-bold" style={{ color: NAVY }}>3. LISTA DE JUGADORES INSCRITOS</p>
              <p className="text-xs text-gray-500 mb-2">IMPORTANTE: Cada jugador debe llenar su propio DESCARGO INDIVIDUAL con firma personal.</p>
              {players.length > 0
                ? <div className="space-y-1">
                    {players.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border text-sm">
                        <span className="w-5 text-gray-400 text-xs">{i + 1}.</span>
                        <span className="flex-1 font-medium">{p.name}</span>
                        <span className="text-gray-400 text-xs">{p.cedula || p.ti || '—'}</span>
                        {p.is_captain && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,188,212,0.15)', color: CYAN }}>Capitán</span>}
                      </div>
                    ))}
                  </div>
                : <p className="text-gray-400 text-xs">No hay jugadores registrados aún.</p>
              }
              <p className="font-bold mt-3" style={{ color: NAVY }}>4. TÉRMINOS Y CONDICIONES DEL TORNEO</p>
              {[
                ['reglamento', 'REGLAMENTO: El equipo se compromete a jugar bajo el reglamento FIFA/FIP adaptado según la categoría. Las reglas específicas se comunicarán antes del evento.'],
                ['arbitraje', 'ARBITRAJE: Acepto que habrá árbitros certificados y que sus decisiones durante los partidos son INAPELABLES. No se permiten reclamos posteriores.'],
                ['jugadores', 'JUGADORES: Confirmo que todos los jugadores listados conocen y aceptan participar en el torneo. Cada uno completará su descargo individual obligatoriamente.'],
                ['cambios', 'CAMBIO DE JUGADORES: Puedo cambiar jugadores hasta el Viernes 24 de Julio de 2026 antes del evento, notificado por email a la organización. El nuevo jugador debe completar el descargo individual.'],
                ['fairPlay', 'FAIR PLAY: El equipo se compromete a mantener conducta deportiva. Comportamientos violentos o irrespetuosos resultará en descalificación inmediata sin reembolso.'],
                ['reembolsoD', 'POLÍTICA DE REEMBOLSO: No hay devolución de dinero. Si el equipo se retira, puede transferir su cupo a otro equipo hasta el Viernes 24 de Julio de 2026.'],
                ['fuerzaMayorD', 'FUERZA MAYOR: El torneo puede cancelarse o reprogramarse por causas de fuerza mayor. Se ofrecerá cupón para nueva fecha o reembolso parcial (60%).'],
                ['datosD', 'PROTECCIÓN DE DATOS (Ley 1581/2012): Autorizo el tratamiento de datos personales del equipo y jugadores para gestión del torneo, certificados y comunicaciones.'],
                ['imagenD', 'CESIÓN DE IMAGEN: Autorizo el uso de fotos y videos del equipo durante el evento con fines promocionales, sin remuneración.'],
                ['aceptacionCapitan', 'COMO CAPITÁN, ACEPTO LOS TÉRMINOS DEL TORNEO y me comprometo a asegurar que todos los jugadores completen su descargo individual.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
            </>}

            {/* ── DESCARGO JUGADOR ── */}
            {isJugador && <>
              <DocHeader titulo="DESCARGO INDIVIDUAL DE RESPONSABILIDAD" subtitulo={`${parentRecord?.sport?.toUpperCase() || 'DEPORTES'}: Fútbol — Pádel — Tenis`} />
              <p className="italic text-gray-600">CADA JUGADOR debe completar este documento de manera INDIVIDUAL. La firma del capitán NO es válida para este descargo. Si eres menor de edad, tu padre/madre/acudiente debe firmar la AUTORIZACIÓN PARA MENORES.</p>
              <p className="font-bold" style={{ color: NAVY }}>1. DATOS DEL JUGADOR</p>
              <DatosTable datos={[
                ['Nombre completo', nombre],
                ['Documento de identidad', documento],
                ['Email', email],
                ['Celular / WhatsApp', telefono],
                ['EPS o Medicina Prepagada', eps],
                ['Deporte', parentRecord?.sport || ''],
                ['Nombre del equipo', parentRecord?.team_name || ''],
              ]} />
              <p className="font-bold" style={{ color: NAVY }}>2. CONTACTO DE EMERGENCIA</p>
              <DatosTable datos={[['Nombre', emergName], ['Teléfono', emergPhone]]} />
              <p className="font-bold" style={{ color: NAVY }}>3. DECLARACIÓN DE ESTADO DE SALUD</p>
              {[
                ['aptitud', 'APTITUD FÍSICA: Declaro que me encuentro en condiciones físicas APTAS para practicar deporte de forma recreativa/competitiva. No tengo restricciones médicas que me impidan participar.'],
                ['seguroMedico', 'SEGURO MÉDICO: Cuento con afiliación vigente a EPS o medicina prepagada.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>4. DESCARGO DE RESPONSABILIDAD MÉDICA Y LEGAL</p>
              {[
                ['exoneracion', 'EXONERACIÓN DE RESPONSABILIDAD: EXIMO DE TODA RESPONSABILIDAD LEGAL Y CIVIL a la organización del evento LATIDO Y HUELLA 2026, sus directivos, patrocinadores, personal, árbitros, paramédicos y cualquier persona relacionada con el evento, por cualquier LESIÓN, DAÑO, ACCIDENTE o INCIDENTE que pueda ocurrirme durante mi participación en el torneo deportivo, incluyendo pero no limitándose a: lesiones musculares, fracturas, esguinces, golpes, traumatismos, deshidratación, insolación, problemas cardiovasculares o cualquier otra eventualidad médica.'],
                ['riesgo', 'ASUNCIÓN DE RIESGO: Reconozco que la práctica deportiva conlleva riesgos inherentes de lesión. PARTICIPO VOLUNTARIAMENTE y bajo MI PROPIO RIESGO, asumiendo toda responsabilidad por las consecuencias.'],
                ['atencionJ', 'ATENCIÓN MÉDICA: Autorizo al personal médico del evento a brindar primeros auxilios en caso de emergencia. Sé que el evento cuenta con paramédicos, pero no reemplazan atención médica especializada.'],
                ['seguroPropio', 'SEGURO MÉDICO PROPIO: Entiendo que debo contar con mi propio seguro médico (EPS o privado) y que cualquier tratamiento posterior será cubierto por mi seguro personal, no por la organización.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>5. TÉRMINOS DEPORTIVOS</p>
              {[
                ['reglamentoJ', 'REGLAMENTO: Me comprometo a jugar bajo el reglamento FIFA/FIP adaptado y a respetar las indicaciones de árbitros y organizadores.'],
                ['fairPlayJ', 'FAIR PLAY: Mantendré conducta deportiva en todo momento. Acepto que comportamientos violentos o irrespetuosos resultan en descalificación inmediata.'],
                ['arbitrajeJ', 'DECISIONES ARBITRALES: Acepto que las decisiones de los árbitros son INAPELABLES durante el partido.'],
                ['datosJ', 'PROTECCIÓN DE DATOS (Ley 1581/2012): Autorizo el tratamiento de mis datos personales para gestión del evento, certificados y comunicaciones. Política disponible en: www.latidoyhuella.com/privacidad'],
                ['imagenJ', 'CESIÓN DE IMAGEN: Autorizo el uso de fotografías y videos del evento donde aparezca mi imagen, con fines promocionales, sin remuneración económica.'],
                ['aceptacionJ', 'HE LEÍDO Y ACEPTO TODOS LOS TÉRMINOS, CONDICIONES Y DESCARGOS ANTERIORES. Declaro que la información es verídica y participo voluntariamente asumiendo todos los riesgos.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
            </>}

            {/* ── PATROCINADOR ── */}
            {isSponsor && <>
              <DocHeader titulo="CONTRATO DE PATROCINIO" />
              <p>Señores LATIDO y HUELLA 2026 — Medellín</p>
              <p className="font-bold mt-2">Asunto: Vinculación Patrocinador – LATIDO y HUELLA 2026</p>
              <DatosTable datos={[['Empresa', empresa], ['Responsable', nombre], ['CC / NIT', documento], ['Email', email], ['Teléfono', telefono], ['Plan de patrocinio', record?.plan_name || ''], ['Valor', record?.amount_cents ? fmtCOP(record.amount_cents) : '—']]} />
              <p>Por medio de la presente comunicación, manifestamos nuestra aceptación incondicional de vinculación comercial como PATROCINADOR en LATIDO y HUELLA 2026, evento que se llevará a cabo el día Domingo 26 de julio de 2026 en el Parque del Bienestar COMFAMA Llanogrande, ubicado en la Milla de Oro Llanogrande, Km 8.5, diagonal al Mall Llanogrande, en el horario comprendido entre las 8:00 a.m. y las 5:00 p.m., organizado por LATIDO y HUELLA.</p>
              <p className="font-bold" style={{ color: NAVY }}>OBLIGACIONES Y TÉRMINOS</p>
              {[
                ['pagoS', 'Realizar el pago correspondiente al valor total del patrocinio adquirido de la siguiente manera: 50% al momento de la reserva y el 50% restante máximo quince (15) días calendario antes de la realización del evento. El incumplimiento en el pago total facultará a EL ORGANIZADOR para cancelar unilateralmente la participación del PATROCINADOR sin lugar a reembolso o según negociación realizada que no es superior a 30 días después del evento.'],
                ['montajeS', 'Realizar el montaje del stand el día 25 de julio de 2026 entre las 10:00 a.m. y las 7:00 p.m. El desmontaje deberá realizarse el día 26 de julio de 2026 a partir de las 5:00 p.m. y hasta las 7:00 p.m.'],
                ['productosS', 'Abstenernos de promocionar productos y servicios diferentes a los de nuestra propia empresa.'],
                ['normasS', 'Abstenernos de comercializar o promocionar armas, bebidas alcohólicas, tabaco, cigarrillos electrónicos, sustancias psicoactivas, productos ilegales, pirotecnia o cualquier elemento que ponga en riesgo la seguridad del evento.'],
                ['materialS', 'Enviar al correo electrónico oficial de EL ORGANIZADOR (latidoyhuella@gmail.com) todo el material gráfico requerido con una anticipación mínima de veinte (20) días calendario previos a la realización del evento.'],
                ['responsabilidadS', 'EL ORGANIZADOR no será responsable por pérdidas, robos, daños, accidentes o lesiones del PATROCINADOR ocasionados por terceros o situaciones ajenas a su control.'],
                ['fuerzaMayorS', 'En caso de fuerza mayor, caso fortuito, condiciones climáticas extremas, emergencias sanitarias u órdenes gubernamentales que obliguen a modificar, aplazar o cancelar el evento, EL ORGANIZADOR podrá reprogramar el evento o definir mecanismos de compensación, sin obligación de indemnización adicional.'],
                ['usoBrandS', 'Autorizamos a EL ORGANIZADOR el uso de nuestro nombre comercial, logos, fotografías y material de marca con fines promocionales relacionados con LATIDO y HUELLA 2026.'],
                ['datosS', 'Autorizamos el tratamiento de datos personales conforme a la Ley 1581 de 2012 y demás normas concordantes.'],
                ['imagenS', 'Autorizamos la captura y uso de fotografías y videos donde aparezca nuestro stand, marca, personal o activaciones con fines promocionales y publicitarios del evento.'],
                ['aceptacionS', 'ACEPTAMOS TODOS LOS TÉRMINOS Y CONDICIONES DEL CONTRATO DE PATROCINIO.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
            </>}

            {/* ── EXPOSITOR STAND ── */}
            {isExpositor && <>
              <DocHeader titulo="ACTA DE VINCULACIÓN COMERCIAL — EXPOSITOR" subtitulo="Feria Comercial, Familiar y Pet Friendly" />
              <p>Señores LATIDO y HUELLA 2026 — Medellín</p>
              <p className="font-bold mt-2">Asunto: Vinculación Comercial — Expositor Feria Comercial LATIDO y HUELLA 2026</p>
              <p className="font-bold mt-3" style={{ color: NAVY }}>1. INFORMACIÓN GENERAL DEL EXPOSITOR Y LA VINCULACIÓN</p>
              <p>Por medio del presente documento, <strong>{nombre}</strong>, identificado(a) con CC / NIT No. <strong>{documento}</strong>, actuando en nombre propio o en representación de la empresa / marca <strong>{empresa}</strong>, manifiesta su aceptación de vinculación comercial como EXPOSITOR en LATIDO y HUELLA 2026.</p>
              <DatosTable datos={[
                ['Marca / empresa participante', empresa], ['Razón social', razonSocial], ['Responsable / representante', nombre],
                ['CC / NIT', documento], ['Teléfono / WhatsApp', telefono], ['Correo electrónico', email],
                ['Dirección / ciudad', address && city ? `${address} — ${city}` : '—'],
                ['Tipo de registro', 'Expositor Comercial'], ['Tipo de espacio', record?.stand_type || ''],
                ['Número de stand / espacio', record?.stand_id || ''], ['Valor total de la vinculación', record?.amount_cents ? fmtCOP(record.amount_cents) : '—'],
                ['Fecha de generación del contrato', new Date().toLocaleDateString('es-CO')],
              ]} />
              <p>El evento se llevará a cabo el día domingo 26 de julio de 2026, en el Parque del Bienestar COMFAMA Llanogrande, ubicado en la Milla de Oro Llanogrande, Km 8.5, diagonal al Mall Llanogrande, en el horario comprendido entre las 8:00 a.m. y las 5:00 p.m., organizado por LATIDO y HUELLA.</p>
              <p className="font-bold" style={{ color: NAVY }}>2. ACEPTACIÓN DE VINCULACIÓN</p>
              <p>Por medio de la presente comunicación, manifestamos nuestra aceptación incondicional de vinculación comercial como EXPOSITOR en LATIDO y HUELLA 2026, evento que se llevará a cabo el día Domingo 26 de julio de 2026 en el Parque del Bienestar COMFAMA Llanogrande, ubicado en la Milla de Oro Llanogrande, Km 8.5, diagonal al Mall Llanogrande, en el horario comprendido entre las 8:00 a.m. y las 5:00 p.m., organizado por LATIDO y HUELLA.</p>
              <p className="font-bold" style={{ color: NAVY }}>3. OBLIGACIONES DEL EXPOSITOR</p>
              {[
                ['pago', '3.1. Realizar el pago correspondiente al valor total del stand adquirido, de la siguiente manera: 50% al momento de la reserva y el 50% restante máximo quince (15) días calendario antes de la realización del evento. El incumplimiento en el pago total facultará a EL ORGANIZADOR para cancelar unilateralmente la participación del EXPOSITOR sin lugar a reembolso.'],
                ['montaje', '3.2. Realizar el montaje del stand el día 25 de julio de 2026 en el horario establecido por EL ORGANIZADOR, entre las 10:00 a.m. y las 6:00 p.m. El desmontaje deberá realizarse el día 26 de julio de 2026 a partir de las 5:00 p.m. y hasta las 7:00 p.m. Fuera de dichos horarios no se permitirá el ingreso ni retiro de mercancía, salvo autorización expresa.'],
                ['productos', '3.3. Abstenernos de promocionar productos y servicios diferentes a los de mi propia empresa.'],
                ['comercializacion', '3.4. Abstenernos de comercializar o promocionar armas, bebidas alcohólicas, tabaco, cigarrillos electrónicos, sustancias psicoactivas, productos ilegales, pirotecnia o cualquier elemento que pueda poner en riesgo la seguridad de los asistentes, animales o participantes del evento.'],
                ['normasSanitarias', '3.5. Cumplir con todas las normas sanitarias, comerciales y legales aplicables a los productos y servicios ofrecidos durante el evento.'],
                ['gas', '3.6. Abstenernos de ingresar pipetas de gas no certificadas, conexiones eléctricas improvisadas o equipos que representen riesgo para la seguridad del evento.'],
                ['espacio', '3.7. Respetar las dimensiones y ubicación asignadas para el stand. No podremos instalar elementos, mobiliario, publicidad, estructuras o activaciones fuera del espacio autorizado sin aprobación previa y escrita de EL ORGANIZADOR.'],
                ['listaPersonal', '3.8. Entregar previamente a EL ORGANIZADOR una lista con los nombres y números de documento del personal encargado de montaje, desmontaje, logística, promoción y operación del stand.'],
                ['seguridad', '3.9. Garantizar que todas las personas vinculadas por nosotros para el desarrollo de la actividad cuentan con afiliación vigente y pagos al día al Sistema de Seguridad Social Integral, incluyendo EPS, ARL y pensión, según corresponda.'],
                ['custodia', '3.10. Asumir plena responsabilidad sobre la custodia, seguridad y protección de nuestros productos, mercancía, equipos y elementos exhibidos durante el evento.'],
                ['cesion', '3.11. Abstenernos de ceder, compartir, subarrendar o transferir el espacio contratado sin autorización previa y escrita de EL ORGANIZADOR.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>4. DECLARACIONES Y ACEPTACIONES</p>
              {[
                ['decl1', '4.1. EL ORGANIZADOR no será responsable por pérdidas, robos, daños, accidentes, lesiones personales, daños a mercancía, equipos, estructuras o personal del EXPOSITOR ocasionados por terceros, asistentes, otros participantes, mascotas o situaciones ajenas a su control.'],
                ['decl2', '4.2. Somos responsables por la seguridad e integridad física del personal vinculado por nuestra empresa para el desarrollo de la actividad comercial dentro del evento.'],
                ['decl3', '4.3. EL ORGANIZADOR podrá celebrar acuerdos comerciales con otras marcas patrocinadoras o expositoras, incluso pertenecientes a categorías similares, salvo acuerdo expreso de exclusividad debidamente suscrito por escrito.'],
                ['decl4', '4.4. En caso de fuerza mayor, caso fortuito, condiciones climáticas extremas, emergencias sanitarias, órdenes gubernamentales, situaciones de orden público o cualquier circunstancia ajena al control de EL ORGANIZADOR que obligue a modificar, aplazar o cancelar el evento, EL ORGANIZADOR podrá reprogramar el evento o definir mecanismos de compensación, sin que exista obligación de indemnización adicional.'],
                ['decl5', '4.5. En caso de fuerza mayor o caso fortuito o por decisión de EL ORGANIZADOR de ser cancelado el evento, ambas partes quedaremos exentas de las obligaciones contenidas en la presente comunicación, sin que haya lugar a indemnización o pago alguno por tal motivo.'],
                ['decl6', '4.6. En caso tal de que el evento sea cancelado, EL ORGANIZADOR hará la devolución a EL EXPOSITOR de la totalidad de los bienes entregados.'],
                ['decl7', '4.7. Autorizamos a EL ORGANIZADOR el uso de nuestro nombre comercial, logos, fotografías y material de marca con fines promocionales relacionados con LATIDO y HUELLA 2026.'],
                ['decl8', '4.8. Autorizamos el tratamiento de datos personales conforme a la Ley 1581 de 2012 y demás normas concordantes.'],
                ['decl9', '4.9. Autorizamos la captura y uso de fotografías y videos donde aparezca nuestro stand, marca, personal o activaciones con fines promocionales y publicitarios del evento.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>5. BENEFICIOS DE LA VINCULACIÓN</p>
              <DatosTable datos={[
                ['Espacio asignado', record?.stand_id || '—'],
                ['Tipo de espacio', record?.stand_type || '—'],
                ['Valor total', record?.amount_cents ? fmtCOP(record.amount_cents) : '—'],
              ]} />
              <p className="font-bold" style={{ color: NAVY }}>6. DOCUMENTOS ANEXOS</p>
              <p>Finalmente, anexamos los siguientes documentos: 6.1. Copia del RUT actualizado. 6.2. Certificado de Cámara de Comercio con vigencia no superior a 30 días. 6.3. Copia del documento de identidad del representante legal. 6.4. Logo de la marca participante en formato PDF editable o Illustrator 2020, enviado al correo latidoyhuella@gmail.com con mínimo quince (15) días de anticipación.</p>
              <Check id="aceptacionExp" label="En constancia de aceptación de todos los términos anteriores, firmo el presente documento." checked={!!checks.aceptacionExp} set={v => setCheck('aceptacionExp', v)} />
            </>}

            {/* ── FOOD TRUCK ── */}
            {isFoodTruck && <>
              <DocHeader titulo="ACTA DE VINCULACIÓN COMERCIAL — FOOD TRUCK" subtitulo="Zona Food Trucks — Feria Comercial, Familiar y Pet Friendly" />
              <p>Señores LATIDO y HUELLA 2026 — Medellín</p>
              <p className="font-bold mt-2">Asunto: Vinculación Comercial — Food Truck LATIDO y HUELLA 2026</p>
              <p className="font-bold mt-3" style={{ color: NAVY }}>1. INFORMACIÓN GENERAL</p>
              <p>Por medio del presente documento, <strong>{nombre}</strong>, identificado(a) con CC / NIT No. <strong>{documento}</strong>, actuando en nombre propio o en representación de la empresa / marca <strong>{empresa}</strong>, manifiesta su aceptación de vinculación comercial como FOOD TRUCK en LATIDO y HUELLA 2026.</p>
              <DatosTable datos={[
                ['Marca / empresa', empresa], ['Responsable', nombre], ['CC / NIT', documento],
                ['Teléfono', telefono], ['Email', email], ['Dirección / ciudad', address && city ? `${address} — ${city}` : '—'],
                ['Spot asignado', record?.stand_id || '—'],
                ['Dimensiones del vehículo', record?.ft_width_m && record?.ft_length_m ? `${record.ft_width_m}m × ${record.ft_length_m}m = ${record.ft_total_m2}m²` : '—'],
                ['Tipo de producto', record?.product_type || '—'],
                ['Valor total', record?.amount_cents ? fmtCOP(record.amount_cents) : '—'],
                ['Fecha de generación', new Date().toLocaleDateString('es-CO')],
              ]} />
              <p>El evento se llevará a cabo el día domingo 26 de julio de 2026, en el Parque del Bienestar COMFAMA Llanogrande, Km 8.5, diagonal al Mall Llanogrande, entre las 8:00 a.m. y las 5:00 p.m., organizado por LATIDO y HUELLA.</p>
              <p className="font-bold" style={{ color: NAVY }}>3. OBLIGACIONES DEL FOOD TRUCK</p>
              {[
                ['pagoFT', '3.1. Realizar el pago correspondiente al valor total del espacio: 50% al momento de la reserva y el 50% restante máximo quince (15) días antes del evento.'],
                ['montajeFT', '3.2. Realizar el montaje el día 25 de julio de 2026 entre las 10:00 a.m. y las 6:00 p.m. El desmontaje el 26 de julio de 2026 a partir de las 5:00 p.m.'],
                ['productosFT', '3.3. Abstenernos de comercializar productos diferentes a los declarados. No se permite la venta de bebidas alcohólicas, tabaco o sustancias psicoactivas.'],
                ['permisosFT', '3.4. Garantizar contar con todos los permisos sanitarios vigentes, certificados de manipulación de alimentos, permisos INVIMA y demás autorizaciones exigidas por la normatividad colombiana.'],
                ['gasFT', '3.5. No ingresar pipetas de gas no certificadas ni conexiones eléctricas improvisadas. En caso de usar gas GLP, plantas eléctricas o equipos especiales, entregar previamente los certificados técnicos.'],
                ['extintorFT', '3.6. Ingresar con extintor vigente y seguro del vehículo al día. El incumplimiento impedirá el ingreso al evento.'],
                ['espacioFT', '3.7. Respetar el espacio asignado. No podrá instalarse fuera del área autorizada sin aprobación escrita de EL ORGANIZADOR.'],
                ['seguridadFT', '3.8. Garantizar afiliación vigente al Sistema de Seguridad Social de todo el personal.'],
                ['custodiaFT', '3.9. Asumir plena responsabilidad sobre la seguridad de sus equipos, vehículo y mercancía durante el evento.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>4. DECLARACIONES Y ACEPTACIONES</p>
              {[
                ['declFT1', '4.1. EL ORGANIZADOR no será responsable por pérdidas, robos, daños o accidentes del FOOD TRUCK ocasionados por terceros o situaciones ajenas a su control.'],
                ['declFT2', '4.2. Somos responsables por la seguridad e integridad física del personal vinculado.'],
                ['declFT3', '4.3. En caso de fuerza mayor que obligue a cancelar o modificar el evento, EL ORGANIZADOR podrá reprogramar sin obligación de indemnización adicional.'],
                ['declFT4', '4.7. Autorizamos el uso de nombre comercial, logos y material de marca con fines promocionales de LATIDO y HUELLA 2026.'],
                ['declFT5', '4.8. Autorizamos el tratamiento de datos personales conforme a la Ley 1581 de 2012.'],
                ['declFT6', '4.9. Autorizamos la captura de fotografías y videos con fines promocionales del evento.'],
                ['aceptacionFT', 'En constancia de aceptación de todos los términos anteriores, firmo el presente documento.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
            </>}

            {/* ── TOLDO ── */}
            {isToldo && <>
              <DocHeader titulo="ACTA DE VINCULACIÓN COMERCIAL — TOLDO GASTRONÓMICO" subtitulo="Zona Toldos — Feria Comercial, Familiar y Pet Friendly" />
              <p>Señores LATIDO y HUELLA 2026 — Medellín</p>
              <p className="font-bold mt-2">Asunto: Vinculación Comercial — Toldos LATIDO y HUELLA 2026</p>
              <p className="font-bold mt-3" style={{ color: NAVY }}>1. INFORMACIÓN GENERAL</p>
              <p>Por medio del presente documento, <strong>{nombre}</strong>, identificado(a) con CC / NIT No. <strong>{documento}</strong>, actuando en nombre propio o en representación de la empresa / marca <strong>{empresa}</strong>, manifiesta su aceptación de vinculación como TOLDO GASTRONÓMICO en LATIDO y HUELLA 2026.</p>
              <DatosTable datos={[
                ['Marca / empresa', empresa], ['Responsable', nombre], ['CC / NIT', documento],
                ['Teléfono', telefono], ['Email', email], ['Dirección / ciudad', address && city ? `${address} — ${city}` : '—'],
                ['Cantidad de toldos', record?.quantity ? String(record.quantity) : '1'],
                ['Valor total', record?.amount_cents ? fmtCOP(record.amount_cents) : record?.total_amount ? fmtCOP(record.total_amount * 100) : '—'],
                ['Fecha de generación', new Date().toLocaleDateString('es-CO')],
              ]} />
              <p>El evento se llevará a cabo el día domingo 26 de julio de 2026, en el Parque del Bienestar COMFAMA Llanogrande, Km 8.5, diagonal al Mall Llanogrande, entre las 8:00 a.m. y las 5:00 p.m., organizado por LATIDO y HUELLA.</p>
              <p className="font-bold" style={{ color: NAVY }}>3. OBLIGACIONES DEL TOLDO GASTRONÓMICO</p>
              {[
                ['pagoT', '3.1. Realizar el pago: 50% al momento de la reserva y el 50% restante máximo quince (15) días antes del evento.'],
                ['montajeT', '3.2. Realizar el montaje el día 25 de julio de 2026 entre las 10:00 a.m. y las 6:00 p.m. El desmontaje el 26 de julio a partir de las 5:00 p.m.'],
                ['productosT', '3.3. Abstenernos de comercializar productos diferentes a los declarados. No se permite venta de bebidas alcohólicas ni sustancias psicoactivas.'],
                ['permisosT', '3.4. Garantizar contar con permisos sanitarios vigentes, certificados de manipulación de alimentos y permisos INVIMA requeridos.'],
                ['espacioT', '3.5. Respetar la ubicación asignada por zonas. La ubicación exacta será asignada el día del evento según disponibilidad.'],
                ['seguridadT', '3.6. Garantizar afiliación vigente al Sistema de Seguridad Social de todo el personal.'],
                ['custodiaT', '3.7. Asumir plena responsabilidad sobre la seguridad de sus equipos y mercancía durante el evento.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
              <p className="font-bold" style={{ color: NAVY }}>4. DECLARACIONES Y ACEPTACIONES</p>
              {[
                ['declT1', '4.1. EL ORGANIZADOR no será responsable por pérdidas, robos o daños ocasionados por terceros o situaciones ajenas a su control.'],
                ['declT2', '4.2. Somos responsables por la seguridad del personal vinculado.'],
                ['declT3', '4.3. En caso de fuerza mayor, EL ORGANIZADOR podrá reprogramar el evento sin obligación de indemnización adicional.'],
                ['declT4', '4.7. Autorizamos el uso de nombre comercial y logos con fines promocionales de LATIDO y HUELLA 2026.'],
                ['declT5', '4.8. Autorizamos el tratamiento de datos personales conforme a la Ley 1581 de 2012.'],
                ['declT6', '4.9. Autorizamos la captura de fotografías y videos con fines promocionales del evento.'],
                ['aceptacionT', 'En constancia de aceptación de todos los términos anteriores, firmo el presente documento.'],
              ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
            </>}

          </div>
        </div>

        {/* FIRMA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>Firma *</h2>
          <p className="text-xs text-gray-400 mb-4">⚠️ La firma es obligatoria. Puedes firmar en este dispositivo o escanear el QR para firmar desde tu celular.</p>
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-600 mb-1 block">Nombre completo del firmante *</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400"
              placeholder="Escribe tu nombre completo como aparece en tu documento"
              value={signatureName} onChange={e => setSignatureName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">Firma en este dispositivo</label>
              <SignatureCanvas onSign={onSign} />
              {signatureDataUrl && <div className="mt-2 text-xs font-bold" style={{ color: '#4CAF50' }}>✅ Firma capturada</div>}
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">O firma desde tu celular</label>
              <QRCode url={mobileUrl} />
              {signatureDataUrl && (
                <div className="mt-2">
                  <div className="p-2 rounded-xl text-xs text-center font-bold mb-2" style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50' }}>✅ Firma recibida desde móvil</div>
                  <img src={signatureDataUrl} alt="Firma móvil" className="w-full border-2 rounded-xl" style={{ maxHeight: 80, objectFit: 'contain', background: 'white', borderColor: CYAN }} />
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Firma digital con validez legal conforme a la Ley 527 de 1999 de Colombia. Al firmar confirma que ha leído y acepta todos los términos del presente documento.</p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <p className="font-bold text-red-600 mb-2">⚠️ Por favor completa los siguientes campos obligatorios antes de firmar:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map(e => <li key={e} className="text-sm text-red-500">{e}</li>)}
            </ul>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-50 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${CYAN}, #0097A7)` }}>
          {submitting ? 'Enviando...' : '✍️ Firmar y aceptar el documento'}
        </button>

        <div className="text-center text-xs text-gray-400 pb-8">
          Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co · www.latidoyhuella.com | WhatsApp: +57 333 277 7912
        </div>
      </div>
    </div>
  )
}