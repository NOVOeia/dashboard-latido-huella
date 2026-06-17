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

// ── QR Code ──────────────────────────────────────────────────────────────────
function QRCode({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-2xl border" style={{ borderColor: '#ddd' }}>
      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`} alt="QR" className="w-28 h-28" />
      <p className="text-xs text-center mt-2 text-gray-400">Escanea para firmar desde el celular</p>
    </div>
  )
}

// ── Canvas de firma ──────────────────────────────────────────────────────────
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
    ctx.strokeStyle = NAVY
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect()
      if ('touches' in e) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
      return { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top }
    }
    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault(); drawing.current = true; setShowPlaceholder(false)
      const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y)
    }
    const move = (e: MouseEvent | TouchEvent) => {
      e.preventDefault(); if (!drawing.current) return
      const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke()
    }
    const end = () => {
      if (!drawing.current) return; drawing.current = false
      onSignRef.current(canvas.toDataURL('image/png'))
    }
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', move, { passive: false })
    canvas.addEventListener('touchend', end)
    return () => {
      canvas.removeEventListener('mousedown', start); canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('mouseup', end); canvas.removeEventListener('mouseleave', end)
      canvas.removeEventListener('touchstart', start); canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)
    }
  }, [])

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    setShowPlaceholder(true); onSignRef.current('')
  }

  return (
    <div>
      <div className="relative border-2 rounded-xl overflow-hidden bg-white"
        style={{ borderColor: showPlaceholder ? '#ddd' : CYAN, height: 180 }}>
        <canvas ref={canvasRef} className="w-full h-full touch-none cursor-crosshair" style={{ display: 'block' }} />
        {showPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <p className="text-sm" style={{ color: '#ccc' }}>✍️ Dibuja tu firma aquí</p>
          </div>
        )}
      </div>
      <button onClick={clear} className="mt-2 text-xs px-3 py-1 rounded-lg border hover:bg-gray-50" style={{ color: '#666', borderColor: '#ddd' }}>Limpiar firma</button>
    </div>
  )
}

// ── Uploader ─────────────────────────────────────────────────────────────────
function DocUploader({ label, field, recordId, existingUrl, onUploaded }:
  { label: string; field: string; recordId: string; existingUrl: string | null; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(existingUrl)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${field}_${recordId}_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('expositor-documents').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('expositor-documents').getPublicUrl(data.path)
      setUrl(urlData.publicUrl); onUploaded(urlData.publicUrl)
    }
    setUploading(false)
  }
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: url ? '#4CAF50' : '#ddd', background: url ? '#f0fdf4' : '#fafafa' }}>
      <div className="flex-1">
        <div className="text-sm font-bold" style={{ color: url ? '#4CAF50' : '#333' }}>{url ? `✅ ${label}` : `📎 ${label}`}</div>
        {url && <div className="text-xs mt-0.5 text-gray-400">Documento recibido</div>}
      </div>
      {!url && <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: CYAN }}>
        {uploading ? 'Subiendo...' : 'Subir'}
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} />
      </label>}
      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg border font-bold" style={{ color: CYAN, borderColor: CYAN }}>Ver</a>}
    </div>
  )
}

// ── Campo editable ────────────────────────────────────────────────────────────
function Field({ label, value, set, type = 'text', colSpan = false }:
  { label: string; value: string; set: (v: string) => void; type?: string; colSpan?: boolean }) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
      <input type={type} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
        value={value} onChange={e => set(e.target.value)} />
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Check({ id, label, checked, set }: { id: string; label: string; checked: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50">
      <input type="checkbox" className="mt-0.5 w-4 h-4 accent-cyan-500" id={id} checked={checked} onChange={e => set(e.target.checked)} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

// ── Cabezote del documento ────────────────────────────────────────────────────
function DocHeader({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div className="text-center mb-4 pb-4 border-b">
      <div className="font-black text-lg" style={{ color: NAVY }}>LATIDO Y HUELLA 2026</div>
      <div className="font-bold text-base mt-1" style={{ color: NAVY }}>{titulo}</div>
      {subtitulo && <div className="text-sm text-gray-500 mt-1">{subtitulo}</div>}
      <div className="text-xs text-gray-400 mt-1">26 de julio de 2026 | Parque COMFAMA Llanogrande</div>
    </div>
  )
}

// ── Tabla de datos del participante ──────────────────────────────────────────
function DatosParticipante({ datos }: { datos: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {datos.map(([label, val]) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">{label}</div>
          <div className="font-medium text-gray-800 text-sm">{val || '—'}</div>
        </div>
      ))}
    </div>
  )
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export function ContratoPage() {
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const isMobile = searchParams.get('firma') === 'mobile'

  const [record, setRecord] = useState<any>(null)
  const [parentRecord, setParentRecord] = useState<any>(null)
  const [table, setTable] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [alreadySigned, setAlreadySigned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Campos comunes editables
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

  // Documentos
  const [cedulaUrl, setCedulaUrl] = useState<string | null>(null)
  const [rutUrl, setRutUrl] = useState<string | null>(null)
  const [camaraUrl, setCamaraUrl] = useState<string | null>(null)

  // Firma
  const [signatureName, setSignatureName] = useState('')
  const [signatureDataUrl, setSignatureDataUrl] = useState('')

  // Checkmarks dinámicos
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const setCheck = (k: string, v: boolean) => setChecks(c => ({ ...c, [k]: v }))
  const allChecked = Object.keys(checks).length > 0 && Object.values(checks).every(Boolean)

  // Staff para expositores
  const [staff, setStaff] = useState([
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
  ])

  const onSign = useCallback((dataUrl: string) => setSignatureDataUrl(dataUrl), [])

  // ── Buscar registro ──────────────────────────────────────────────────────
  useEffect(() => {
    const buscar = async () => {
      const tablas = [
        'registrations_5k', 'registration_attendees', 'sports_team_registrations',
        'sports_team_players', 'expositor_reservations', 'toldos_reservations', 'sponsor_inquiries'
      ]
      for (const t of tablas) {
        const { data } = await supabase.from(t).select('*').eq('contract_token', token).maybeSingle()
        if (data) {
          setRecord(data); setTable(t)
          // Cargar registro padre si es jugador o menor
          if (t === 'sports_team_players' && data.team_id) {
            const { data: parent } = await supabase.from('sports_team_registrations').select('*').eq('id', data.team_id).maybeSingle()
            setParentRecord(parent)
          }
          if (t === 'registration_attendees' && data.registration_id) {
            const { data: parent } = await supabase.from('registrations_5k').select('*').eq('id', data.registration_id).maybeSingle()
            setParentRecord(parent)
          }
          // Precargar campos
          setNombre(data.full_name || data.responsible_name || data.captain_name || data.contact_name || data.name || '')
          setEmpresa(data.brand_name || data.company_name || '')
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
          if (data.contract_signed_at || data.accepted_contract_at) setAlreadySigned(true)
          setLoading(false)
          return
        }
      }
      setNotFound(true); setLoading(false)
    }
    if (token) buscar()
  }, [token])

  // Realtime firma móvil
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
      const { data: urlData } = supabase.storage.from('expositor-documents').getPublicUrl(path)
      await supabase.from(table).update({ mobile_signature_url: urlData.publicUrl }).eq('id', record.id)
    }
  }

  const isExpositor = ['expositor_reservations', 'toldos_reservations'].includes(table)
  const isJugador = table === 'sports_team_players'
  const isCapitan = table === 'sports_team_registrations'
  const isMinor = table === 'registration_attendees' && record?.is_minor
  const isCaminata = table === 'registrations_5k'
  const isSponsor = table === 'sponsor_inquiries'
  const mobileUrl = `${window.location.origin}/contrato/${token}?firma=mobile`

  // ── Validación ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs: string[] = []
    if (!nombre.trim()) errs.push('Nombre completo')
    if (!documento.trim()) errs.push('Documento de identidad')
    if (!signatureName.trim()) errs.push('Nombre del firmante')
    if (!signatureDataUrl) errs.push('Firma manuscrita')
    if (!allChecked) errs.push('Debes marcar todos los checkmarks')
    if (isExpositor) {
      if (!cedulaUrl) errs.push('Documento de identidad (CC/NIT)')
      if (!rutUrl) errs.push('RUT')
      if (!camaraUrl) errs.push('Cámara de Comercio')
    }
    setErrors(errs)
    return errs.length === 0
  }

  // ── Guardar firma ────────────────────────────────────────────────────────
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
      }
      if (nombre) updates[table === 'sports_team_registrations' ? 'captain_name' : table === 'sports_team_players' ? 'name' : 'full_name'] = nombre
      if (documento) updates[table === 'sports_team_registrations' ? 'captain_cedula' : 'cedula'] = documento
      if (telefono) updates[table === 'sports_team_registrations' ? 'captain_phone' : 'phone'] = telefono
      if (email) updates[table === 'sports_team_registrations' ? 'captain_email' : 'email'] = email
      if (eps) updates.eps = eps
      if (address) updates.address = address
      if (city) updates.city = city
      if (emergName) updates.emergency_contact_name = emergName
      if (emergPhone) updates.emergency_contact_phone = emergPhone
      if (empresa) updates[table === 'sponsor_inquiries' ? 'company_name' : 'brand_name'] = empresa
      if (cedulaUrl) updates.cedula_url = cedulaUrl
      if (rutUrl) updates.rut_url = rutUrl
      if (camaraUrl) updates.camara_comercio_url = camaraUrl

      await supabase.from(table).update(updates).eq('id', record.id)

      if (isExpositor) {
        const staffToSave = staff.filter(s => s.full_name.trim())
        if (staffToSave.length > 0) {
          await supabase.from('stand_staff').insert(staffToSave.map(s => ({ ...s, expositor_id: record.id })))
        }
      }
      setDone(true)
    } catch (err) { console.error(err); alert('Error al enviar. Intenta de nuevo.') }
    setSubmitting(false)
  }

  // ── Vista móvil ──────────────────────────────────────────────────────────
  if (isMobile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: NAVY }}>
      <img src={LOGO_URL} alt="Logo" className="h-12 mb-6" />
      <h2 className="text-white font-bold text-xl mb-2 text-center">Firma tu documento</h2>
      <p className="text-white/60 text-sm text-center mb-6">Dibuja tu firma con el dedo</p>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-4 mb-4"><SignatureCanvas onSign={handleMobileSign} /></div>
        {signatureDataUrl
          ? <div className="p-4 rounded-2xl text-center font-bold" style={{ background: 'rgba(76,175,80,0.15)', color: '#4CAF50' }}>
              ✅ Firma capturada — vuelve al computador para completar
            </div>
          : <p className="text-white/40 text-xs text-center">Firma en el recuadro blanco con tu dedo</p>
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
        <h2 className="text-2xl font-bold mb-2">¡Documento firmado!</h2>
        <p className="text-white/70 mb-4">Recibirás una copia en tu correo electrónico.</p>
        <div className="bg-white/10 rounded-xl p-4 text-left text-sm space-y-1">
          <p><strong>Firmado por:</strong> {signatureName}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )

  // ── Renderizar contrato según tipo ───────────────────────────────────────
  const renderContrato = () => {
    // ── CAMINATA 5K ──────────────────────────────────────────────────────
    if (isCaminata) return (
      <>
        <DocHeader titulo="TÉRMINOS Y CONDICIONES DE PARTICIPACIÓN" subtitulo="Caminata Canina Pet Lovers — 6.5K" />
        <p className="text-sm text-gray-600 italic mb-4">Al inscribirme declaro que he leído, entendido y acepto los siguientes términos:</p>
        <DatosParticipante datos={[['Nombre', nombre], ['Documento', documento], ['Email', email], ['Teléfono', telefono]]} />
        <p className="font-bold text-sm mb-3" style={{ color: NAVY }}>3. CONDICIONES GENERALES</p>
        {[
          ['edad', 'EDAD MÍNIMA: Declaro ser mayor de 18 años. Si soy menor, estoy acompañado de un adulto responsable.'],
          ['salud', 'ESTADO DE SALUD: Declaro estar en condiciones físicas aptas para realizar actividad física moderada (caminata de 6.5 km).'],
          ['mascota', 'RESPONSABILIDAD POR MASCOTA: Soy responsable del comportamiento de mi mascota. Me comprometo a mantenerla con correa y recoger sus desechos.'],
          ['vacunas', 'REQUISITOS DE LA MASCOTA: Mi mascota cuenta con vacunas al día (rabia, parvovirus, moquillo) y carnet vigente.'],
          ['reembolso', 'POLÍTICA DE REEMBOLSO: No hay devolución de dinero. Puedo transferir mi inscripción hasta el Viernes 24 de Julio de 2026.'],
          ['fuerzaMayor', 'FUERZA MAYOR: El evento puede cancelarse por causas de fuerza mayor. Se ofrecerá cupón para nueva fecha o reembolso parcial (60%).'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
        <p className="font-bold text-sm mb-3 mt-3" style={{ color: NAVY }}>4. AUTORIZACIONES Y PROTECCIÓN DE DATOS</p>
        {[
          ['habesDatos', 'HABEAS DATA (Ley 1581/2012): Autorizo el tratamiento de mis datos personales para gestión del evento, comunicaciones y certificados.'],
          ['imagen', 'CESIÓN DE DERECHOS DE IMAGEN: Autorizo el uso de fotografías y videos del evento con fines promocionales, sin remuneración.'],
          ['kit', 'ENTREGA DE KIT: Entiendo que debo recoger mi kit en las fechas y lugares establecidos.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
        <p className="font-bold text-sm mb-3 mt-3" style={{ color: NAVY }}>5. DESCARGO DE RESPONSABILIDAD</p>
        <Check id="descargo" label="Eximo de toda responsabilidad legal a la organización LATIDO Y HUELLA 2026, sus patrocinadores y personal, por cualquier lesión, daño o accidente durante el evento. Participo bajo mi propio riesgo." checked={!!checks.descargo} set={v => setCheck('descargo', v)} />
        <Check id="aceptacion" label="HE LEÍDO Y ACEPTO TODOS LOS TÉRMINOS Y CONDICIONES. Declaro que toda la información es verídica." checked={!!checks.aceptacion} set={v => setCheck('aceptacion', v)} />
      </>
    )

    // ── MENOR DE EDAD ─────────────────────────────────────────────────────
    if (isMinor) return (
      <>
        <DocHeader titulo="AUTORIZACIÓN PARA PARTICIPACIÓN DE MENORES DE EDAD" />
        <p className="text-sm text-gray-600 italic mb-4">Este documento debe ser completado y firmado por el padre, madre o acudiente legal del menor.</p>
        <p className="font-bold text-sm mb-2" style={{ color: NAVY }}>DATOS DEL MENOR</p>
        <DatosParticipante datos={[
          ['Nombre del menor', record?.full_name || ''],
          ['Documento', record?.document_id || record?.ti || ''],
          ['Fecha de nacimiento', record?.birthdate || ''],
          ['Actividad', parentRecord?.ticket_type || 'Caminata 6.5K'],
        ]} />
        <p className="font-bold text-sm mb-2 mt-3" style={{ color: NAVY }}>DATOS DEL ACUDIENTE</p>
        <DatosParticipante datos={[['Nombre acudiente', nombre], ['Cédula', documento], ['Teléfono', telefono], ['Email', email]]} />
        <p className="font-bold text-sm mb-3 mt-3" style={{ color: NAVY }}>4. DECLARACIÓN Y AUTORIZACIÓN</p>
        {[
          ['autorizacion', 'AUTORIZACIÓN: Autorizo la participación del menor bajo mi responsabilidad legal en la actividad seleccionada.'],
          ['saludMenor', 'ESTADO DE SALUD: El menor se encuentra en buenas condiciones de salud y apto para realizar actividad física.'],
          ['responsabilidad', 'RESPONSABILIDAD: Me hago responsable de cualquier eventualidad médica o accidente. Eximo de responsabilidad a la organización.'],
          ['atencionMedica', 'ATENCIÓN MÉDICA: En caso de emergencia, autorizo al personal médico a brindar primeros auxilios. Estaré disponible en mi celular.'],
          ['imagenMenor', 'CESIÓN DE IMAGEN: Autorizo el uso de fotografías del menor con fines promocionales del evento.'],
          ['datosPersonales', 'PROTECCIÓN DE DATOS (Ley 1581/2012): Autorizo el tratamiento de los datos del menor para gestión del evento.'],
          ['acompanamiento', 'ACOMPAÑAMIENTO: Me comprometo a permanecer en el evento o designar un adulto responsable que acompañe al menor.'],
          ['aceptacionMenor', 'ACEPTO TODOS LOS TÉRMINOS. Declaro que la información es verídica.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
      </>
    )

    // ── EQUIPO DEPORTES (CAPITÁN) ─────────────────────────────────────────
    if (isCapitan) return (
      <>
        <DocHeader titulo="INSCRIPCIÓN DE EQUIPO DEPORTIVO" subtitulo={`${record?.sport?.toUpperCase()} — ${record?.category === 'ninos' ? 'Categoría Infantil' : 'Categoría Adultos'}`} />
        <DatosParticipante datos={[
          ['Deporte', record?.sport || ''],
          ['Nombre del equipo', record?.team_name || ''],
          ['Categoría', record?.category === 'ninos' ? 'Infantil (8-15 años)' : 'Adultos (16+)'],
          ['Capitán', nombre],
          ['Cédula capitán', documento],
          ['Celular', telefono],
          ['Email', email],
          ['Valor inscripción', record?.amount_cents ? fmtCOP(record.amount_cents) : '—'],
        ]} />
        <p className="font-bold text-sm mb-3" style={{ color: NAVY }}>4. TÉRMINOS Y CONDICIONES DEL TORNEO</p>
        {[
          ['reglamento', 'REGLAMENTO: El equipo se compromete a jugar bajo el reglamento FIFA/FIP adaptado según la categoría.'],
          ['arbitraje', 'ARBITRAJE: Acepto que las decisiones de los árbitros son INAPELABLES durante los partidos.'],
          ['jugadores', 'JUGADORES: Confirmo que todos los jugadores conocen y aceptan participar. Cada uno completará su descargo individual.'],
          ['cambios', 'CAMBIO DE JUGADORES: Puedo cambiar jugadores hasta el Viernes 24 de Julio de 2026 notificando a la organización.'],
          ['fairPlay', 'FAIR PLAY: El equipo mantiene conducta deportiva. Comportamientos violentos resultan en descalificación sin reembolso.'],
          ['reembolsoDeporte', 'POLÍTICA DE REEMBOLSO: No hay devolución. El cupo puede transferirse hasta el Viernes 24 de Julio de 2026.'],
          ['datosDeporte', 'PROTECCIÓN DE DATOS (Ley 1581/2012): Autorizo el tratamiento de datos del equipo y jugadores.'],
          ['imagenDeporte', 'CESIÓN DE IMAGEN: Autorizo el uso de fotos y videos del equipo con fines promocionales.'],
          ['aceptacionCapitan', 'COMO CAPITÁN, ACEPTO LOS TÉRMINOS DEL TORNEO y me comprometo a asegurar que todos los jugadores completen su descargo individual.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
      </>
    )

    // ── DESCARGO INDIVIDUAL JUGADOR ───────────────────────────────────────
    if (isJugador) return (
      <>
        <DocHeader titulo="DESCARGO INDIVIDUAL DE RESPONSABILIDAD" subtitulo={`${parentRecord?.sport?.toUpperCase() || 'DEPORTE'} — ${parentRecord?.team_name || 'Equipo'}`} />
        <p className="text-sm text-gray-600 italic mb-4">Cada jugador debe completar este documento de manera individual. La firma del capitán NO es válida para este descargo.</p>
        <DatosParticipante datos={[
          ['Nombre', nombre],
          ['Documento', documento],
          ['Email', email],
          ['Celular', telefono],
          ['EPS / Medicina Prepagada', eps],
          ['Deporte', parentRecord?.sport || ''],
          ['Equipo', parentRecord?.team_name || ''],
          ['Contacto emergencia', emergName],
          ['Tel. emergencia', emergPhone],
        ]} />
        <p className="font-bold text-sm mb-3" style={{ color: NAVY }}>3. DECLARACIÓN DE ESTADO DE SALUD</p>
        {[
          ['aptitud', 'APTITUD FÍSICA: Declaro que me encuentro en condiciones físicas APTAS para practicar deporte. No tengo restricciones médicas.'],
          ['seguroMedico', 'SEGURO MÉDICO: Cuento con afiliación vigente a EPS o medicina prepagada.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
        <p className="font-bold text-sm mb-3 mt-3" style={{ color: NAVY }}>4. DESCARGO DE RESPONSABILIDAD</p>
        {[
          ['exoneracion', 'EXONERACIÓN: EXIMO DE TODA RESPONSABILIDAD a la organización LATIDO Y HUELLA 2026, directivos, patrocinadores y personal por cualquier lesión o accidente durante el torneo.'],
          ['riesgo', 'ASUNCIÓN DE RIESGO: Reconozco que la práctica deportiva conlleva riesgos. PARTICIPO VOLUNTARIAMENTE bajo MI PROPIO RIESGO.'],
          ['atencionJugador', 'ATENCIÓN MÉDICA: Autorizo al personal médico a brindar primeros auxilios en caso de emergencia.'],
          ['seguroPropio', 'SEGURO PROPIO: Entiendo que cualquier tratamiento posterior será cubierto por mi seguro personal.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
        <p className="font-bold text-sm mb-3 mt-3" style={{ color: NAVY }}>5. TÉRMINOS DEPORTIVOS</p>
        {[
          ['reglamentoJ', 'REGLAMENTO: Me comprometo a jugar bajo el reglamento FIFA/FIP y a respetar árbitros y organizadores.'],
          ['fairPlayJ', 'FAIR PLAY: Mantendré conducta deportiva. Acepto que comportamientos violentos resultan en descalificación.'],
          ['arbitrajeJ', 'DECISIONES ARBITRALES: Las decisiones de los árbitros son INAPELABLES.'],
          ['datosJ', 'PROTECCIÓN DE DATOS (Ley 1581/2012): Autorizo el tratamiento de mis datos para gestión del evento.'],
          ['imagenJ', 'CESIÓN DE IMAGEN: Autorizo el uso de fotografías del evento con fines promocionales.'],
          ['aceptacionJ', 'HE LEÍDO Y ACEPTO TODOS LOS TÉRMINOS. Participo voluntariamente asumiendo todos los riesgos.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
      </>
    )

    // ── PATROCINADOR ──────────────────────────────────────────────────────
    if (isSponsor) return (
      <>
        <DocHeader titulo="CONTRATO DE PATROCINIO" />
        <DatosParticipante datos={[
          ['Empresa', empresa],
          ['Responsable', nombre],
          ['CC/NIT', documento],
          ['Email', email],
          ['Teléfono', telefono],
          ['Plan', record?.plan_name || ''],
          ['Valor', record?.amount_cents ? fmtCOP(record.amount_cents) : '—'],
        ]} />
        <p className="text-sm text-gray-700 mb-4">Por medio de la presente, manifestamos nuestra aceptación incondicional de vinculación como PATROCINADOR en LATIDO y HUELLA 2026, el día domingo 26 de julio de 2026 en el Parque del Bienestar COMFAMA Llanogrande, organizado por Diverxo S.A.S.</p>
        <p className="font-bold text-sm mb-3" style={{ color: NAVY }}>OBLIGACIONES Y TÉRMINOS</p>
        {[
          ['pagoSponsor', 'Realizaré el pago: 50% al reservar y 50% máximo 15 días antes del evento.'],
          ['montajeSponsor', 'Realizaré el montaje el 25 de julio entre 10:00 a.m. y 7:00 p.m. Desmontaje el 26 de julio a partir de las 5:00 p.m.'],
          ['exclusividad', 'Me abstendré de promocionar productos diferentes a los de mi empresa.'],
          ['normas', 'Cumpliré con todas las normas sanitarias, comerciales y legales aplicables.'],
          ['materialGrafico', 'Enviaré el material gráfico (logos, artes) con 20 días de anticipación al correo latidoyhuella@gmail.com.'],
          ['responsabilidad', 'EL ORGANIZADOR no será responsable por pérdidas o daños ocasionados por terceros.'],
          ['fuerzaMayorS', 'En caso de fuerza mayor, el evento podrá reprogramarse sin obligación de indemnización adicional.'],
          ['usoBrand', 'Autorizo el uso de nuestro nombre comercial, logos y material de marca con fines promocionales de LATIDO y HUELLA 2026.'],
          ['datosSponsor', 'Autorizo el tratamiento de datos personales conforme a la Ley 1581 de 2012.'],
          ['imagenSponsor', 'Autorizo la captura de fotografías y videos con fines promocionales del evento.'],
          ['aceptacionSponsor', 'ACEPTO TODOS LOS TÉRMINOS DEL CONTRATO DE PATROCINIO.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
      </>
    )

    // ── EXPOSITOR / TOLDO (Acta de Vinculación) ───────────────────────────
    return (
      <>
        <DocHeader titulo="ACTA DE VINCULACIÓN COMERCIAL — EXPOSITOR" />
        <DatosParticipante datos={[
          ['Responsable', nombre], ['Empresa / Marca', empresa], ['CC / NIT', documento],
          ['Teléfono', telefono], ['Email', email], ['Dirección', address ? `${address} — ${city}` : '—'],
          ['Stand / Espacio', record?.stand_id || '—'], ['Tipo', record?.stand_type || record?.category || '—'],
          ['Valor total', record?.amount_cents ? fmtCOP(record.amount_cents) : '—'],
        ]} />
        <p className="font-bold text-sm mb-3" style={{ color: NAVY }}>3. OBLIGACIONES DEL EXPOSITOR</p>
        {[
          ['pago', 'Realizar el pago: 50% al reservar y 50% máximo 15 días antes del evento.'],
          ['montaje', 'Montaje el 25 de julio entre 10:00 a.m. y 6:00 p.m. Desmontaje el 26 de julio a partir de las 5:00 p.m.'],
          ['productos', 'Abstenerse de promocionar productos diferentes a los de su empresa.'],
          ['normasExp', 'Cumplir con normas sanitarias, comerciales y legales aplicables.'],
          ['espacio', 'Respetar las dimensiones y ubicación asignadas. No instalar elementos fuera del espacio autorizado.'],
          ['seguridad', 'Garantizar afiliación vigente al Sistema de Seguridad Social de todo el personal.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
        <p className="font-bold text-sm mb-3 mt-3" style={{ color: NAVY }}>4. DECLARACIONES Y AUTORIZACIONES</p>
        {[
          ['responsabilidadExp', 'EL ORGANIZADOR no será responsable por pérdidas o daños ocasionados por terceros.'],
          ['usoBrandExp', 'Autorizo el uso de nombre comercial, logos y material de marca con fines promocionales de LATIDO y HUELLA 2026.'],
          ['datosExp', 'Autorizo el tratamiento de datos personales conforme a la Ley 1581 de 2012.'],
          ['imagenExp', 'Autorizo la captura de fotografías y videos con fines promocionales del evento.'],
          ['aceptacionExp', 'HE LEÍDO Y ACEPTO TODAS LAS OBLIGACIONES Y DECLARACIONES.'],
        ].map(([k, l]) => <Check key={k} id={k} label={l} checked={!!checks[k]} set={v => setCheck(k, v)} />)}
      </>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      <div className="py-6 px-4 text-center" style={{ background: NAVY }}>
        <img src={LOGO_URL} alt="Logo" className="h-12 mx-auto mb-2" />
        <h1 className="text-white font-bold text-lg">
          {isCaminata ? 'Términos y Condiciones — Caminata 6.5K'
            : isMinor ? 'Autorización de Menor de Edad'
            : isCapitan ? 'Inscripción de Equipo Deportivo'
            : isJugador ? 'Descargo Individual de Responsabilidad'
            : isSponsor ? 'Contrato de Patrocinio'
            : 'Acta de Vinculación Comercial'}
        </h1>
        <p className="text-white/60 text-sm">Latido y Huella 2026 · 26 de julio · Llanogrande</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Datos editables según tipo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Verifica tus datos</h2>
          <p className="text-xs text-gray-400 mb-4">Corrige si es necesario antes de firmar.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre completo *" value={nombre} set={setNombre} colSpan />
            {(isExpositor || isSponsor) && <Field label="Empresa / Marca *" value={empresa} set={setEmpresa} colSpan />}
            <Field label="Documento de identidad *" value={documento} set={setDocumento} />
            <Field label="Teléfono *" value={telefono} set={setTelefono} />
            <Field label="Email *" value={email} set={setEmail} colSpan type="email" />
            {(isJugador || isCaminata) && <Field label="EPS / Medicina Prepagada" value={eps} set={setEps} colSpan />}
            {(isJugador) && <>
              <Field label="Contacto de emergencia" value={emergName} set={setEmergName} />
              <Field label="Tel. emergencia" value={emergPhone} set={setEmergPhone} />
            </>}
            {isExpositor && <>
              <Field label="Dirección *" value={address} set={setAddress} colSpan />
              <Field label="Ciudad *" value={city} set={setCity} />
            </>}
          </div>
        </div>

        {/* Documentos solo para expositores */}
        {isExpositor && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Documentos requeridos</h2>
            <p className="text-sm text-gray-500 mb-4">Obligatorios para completar el acta.</p>
            <div className="space-y-3">
              <DocUploader label="Cédula / NIT *" field="cedula" recordId={record.id} existingUrl={cedulaUrl} onUploaded={url => setCedulaUrl(url)} />
              <DocUploader label="RUT actualizado *" field="rut" recordId={record.id} existingUrl={rutUrl} onUploaded={url => setRutUrl(url)} />
              <DocUploader label="Cámara de Comercio *" field="camara" recordId={record.id} existingUrl={camaraUrl} onUploaded={url => setCamaraUrl(url)} />
            </div>
          </div>
        )}

        {/* Personal de apoyo solo para expositores */}
        {isExpositor && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Personal autorizado de apoyo</h2>
            <p className="text-sm text-gray-500 mb-4">Registra hasta 4 personas en el stand.</p>
            <div className="space-y-3">
              {staff.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50">
                  <div className="col-span-2 text-xs font-bold text-gray-500">Persona {i + 1}</div>
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Nombre completo"
                    value={s.full_name} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, full_name: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Cédula"
                    value={s.cedula} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, cedula: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="Teléfono"
                    value={s.phone} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} />
                  <input className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-400" placeholder="ARL / EPS"
                    value={s.arl_eps} onChange={e => setStaff(st => st.map((x, j) => j === i ? { ...x, arl_eps: e.target.value } : x))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contrato */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-700 leading-relaxed space-y-2 max-h-96 overflow-y-auto pr-2 border rounded-xl p-4 bg-gray-50">
            {renderContrato()}
          </div>
        </div>

        {/* Firma */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>Firma *</h2>
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-600 mb-1 block">Nombre completo del firmante *</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400"
              placeholder="Escribe tu nombre completo" value={signatureName} onChange={e => setSignatureName(e.target.value)} />
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
              {signatureDataUrl && <div className="mt-2 p-2 rounded-xl text-xs text-center font-bold" style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50' }}>✅ Firma recibida</div>}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Firma digital válida conforme a la Ley 527 de 1999 de Colombia.</p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="font-bold text-red-600 mb-2 text-sm">⚠️ Por favor completa:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map(e => <li key={e} className="text-sm text-red-500">{e}</li>)}
            </ul>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-50 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${CYAN}, #0097A7)` }}>
          {submitting ? 'Enviando...' : '✍️ Firmar y aceptar'}
        </button>

        <div className="text-center text-xs text-gray-400 pb-8">
          Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co
        </div>
      </div>
    </div>
  )
}
