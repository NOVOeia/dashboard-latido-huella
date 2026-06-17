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

// ── QR Code (usando API de Google Charts) ────────────────────────────────────
function QRCode({ url }: { url: string }) {
  const encoded = encodeURIComponent(url)
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-2xl border-2" style={{ borderColor: CYAN }}>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}`}
        alt="QR firma móvil"
        className="w-44 h-44"
      />
      <p className="text-xs text-center mt-2" style={{ color: '#666' }}>
        Escanea con tu celular para firmar con el dedo
      </p>
    </div>
  )
}

// ── Canvas de firma ──────────────────────────────────────────────────────────
function SignatureCanvas({ onSign }: { onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const signed = useRef(false)
  const onSignRef = useRef(onSign)
  onSignRef.current = onSign

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
      if ('touches' in e) {
        return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
      }
      return { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top }
    }

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      drawing.current = true
      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
    const move = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!drawing.current) return
      const pos = getPos(e)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
    const end = () => {
      if (!drawing.current) return
      drawing.current = false
      signed.current = true
      onSignRef.current(canvas.toDataURL('image/png'))
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', end)
    canvas.addEventListener('mouseleave', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', move, { passive: false })
    canvas.addEventListener('touchend', end)

    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('mouseup', end)
      canvas.removeEventListener('mouseleave', end)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)
    }
  }, [])

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    signed.current = false
    onSignRef.current('')
  }

  return (
    <div>
      <div className="relative border-2 rounded-xl overflow-hidden bg-white"
        style={{ borderColor: CYAN, height: 160 }}>
        <canvas ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ display: 'block' }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <p className="text-sm" style={{ color: '#ddd' }}>✍️ Dibuja tu firma aquí</p>
        </div>
      </div>
      <button onClick={clear}
        className="mt-2 text-xs px-3 py-1 rounded-lg border hover:bg-gray-50"
        style={{ color: '#666', borderColor: '#ddd' }}>
        Limpiar firma
      </button>
    </div>
  )
}

// ── Uploader de documento ────────────────────────────────────────────────────
function DocUploader({ label, field, recordId, existingUrl, onUploaded }:
  { label: string; field: string; recordId: string; existingUrl: string | null; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(existingUrl)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${field}_${recordId}_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('expositor-documents').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('expositor-documents').getPublicUrl(data.path)
      setUrl(urlData.publicUrl)
      onUploaded(urlData.publicUrl)
    }
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ borderColor: url ? '#4CAF50' : '#ddd', background: url ? '#f0fdf4' : '#fafafa' }}>
      <div className="flex-1">
        <div className="text-sm font-bold" style={{ color: url ? '#4CAF50' : '#333' }}>
          {url ? `✅ ${label}` : `📎 ${label}`}
        </div>
        {url && <div className="text-xs mt-0.5" style={{ color: '#666' }}>Documento recibido</div>}
      </div>
      {!url && (
        <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: CYAN }}>
          {uploading ? 'Subiendo...' : 'Subir'}
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg border font-bold"
          style={{ color: CYAN, borderColor: CYAN }}>Ver</a>
      )}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export function ContratoPage() {
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const isMobile = searchParams.get('firma') === 'mobile'

  const [record, setRecord] = useState<any>(null)
  const [table, setTable] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [alreadySigned, setAlreadySigned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Campos editables
  const [nombre, setNombre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [signatureName, setSignatureName] = useState('')
  const [signatureDataUrl, setSignatureDataUrl] = useState('')
  const [cedulaUrl, setCedulaUrl] = useState<string | null>(null)
  const [rutUrl, setRutUrl] = useState<string | null>(null)
  const [camaraUrl, setCamaraUrl] = useState<string | null>(null)

  // Personal de apoyo
  const [staff, setStaff] = useState([
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
    { full_name: '', cedula: '', phone: '', arl_eps: '' },
  ])

  // Checkmarks
  const [checks, setChecks] = useState({ obligaciones: false, declaraciones: false, datos: false, seguridad: false })
  const allChecked = Object.values(checks).every(Boolean)

  const onSign = useCallback((dataUrl: string) => {
    setSignatureDataUrl(dataUrl)
  }, [])

  // Buscar registro por token
  useEffect(() => {
    const buscar = async () => {
      const tablas = ['expositor_reservations', 'toldos_reservations', 'registrations_5k', 'sports_team_registrations', 'sponsor_inquiries']
      for (const t of tablas) {
        const { data } = await supabase.from(t).select('*').eq('contract_token', token).maybeSingle()
        if (data) {
          setRecord(data)
          setTable(t)
          setNombre(data.responsible_name || data.full_name || data.captain_name || data.contact_name || '')
          setEmpresa(data.brand_name || data.company_name || '')
          setCedula(data.cedula || data.document_id || '')
          setTelefono(data.phone || data.captain_phone || '')
          setEmail(data.email || data.captain_email || '')
          setAddress(data.address || '')
          setCity(data.city || '')
          setCedulaUrl(data.cedula_url || null)
          setRutUrl(data.rut_url || null)
          setCamaraUrl(data.camara_comercio_url || null)
          if (data.contract_signed_at || data.accepted_contract_at) setAlreadySigned(true)
          setLoading(false)
          return
        }
      }
      setNotFound(true)
      setLoading(false)
    }
    if (token) buscar()
  }, [token])

  // Realtime: escuchar firma desde móvil (en PC)
  useEffect(() => {
    if (!record || isMobile) return
    const channel = supabase.channel(`contrato-${record.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table,
        filter: `id=eq.${record.id}`
      }, (payload) => {
        const sig = payload.new?.mobile_signature_url
        if (sig && !signatureDataUrl) {
          setSignatureDataUrl(sig)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [record, table, isMobile, signatureDataUrl])

  // Guardar firma móvil en Supabase para sincronizar con PC
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
  const standId = record?.stand_id || '—'
  const standType = record?.stand_type || record?.category || '—'
  const monto = record?.amount_cents || record?.total_amount || 0
  const mobileUrl = `${window.location.origin}/contrato/${token}?firma=mobile`

  const validate = () => {
    const errs: string[] = []
    if (!nombre.trim()) errs.push('Nombre del responsable')
    if (!cedula.trim()) errs.push('Cédula / NIT')
    if (!telefono.trim()) errs.push('Teléfono')
    if (!email.trim()) errs.push('Email')
    if (!address.trim()) errs.push('Dirección')
    if (!city.trim()) errs.push('Ciudad')
    if (isExpositor) {
      if (!cedulaUrl) errs.push('Documento de identidad (CC/NIT)')
      if (!rutUrl) errs.push('RUT')
      if (!camaraUrl) errs.push('Cámara de Comercio')
    }
    if (!allChecked) errs.push('Debes marcar todos los checkmarks')
    if (!signatureName.trim()) errs.push('Nombre completo del firmante')
    if (!signatureDataUrl) errs.push('Firma manuscrita')
    setErrors(errs)
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
        responsible_name: nombre,
        brand_name: empresa,
        cedula: cedula,
        phone: telefono,
        email: email,
        address, city,
      }
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
    } catch (err) {
      console.error(err)
      alert('Ocurrió un error. Por favor intenta de nuevo.')
    }
    setSubmitting(false)
  }

  // ── Vista móvil — solo canvas de firma ───────────────────────────────────
  if (isMobile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: NAVY }}>
      <img src={LOGO_URL} alt="Logo" className="h-12 mb-6" />
      <h2 className="text-white font-bold text-xl mb-2 text-center">Firma tu Acta de Vinculación</h2>
      <p className="text-white/60 text-sm text-center mb-6">Dibuja tu firma con el dedo en el recuadro</p>
      <div className="w-full max-w-sm bg-white rounded-2xl p-4">
        <SignatureCanvas onSign={handleMobileSign} />
        {signatureDataUrl && (
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50' }}>
            ✅ Firma capturada — puedes continuar en el PC
          </div>
        )}
      </div>
    </div>
  )

  // ── Estados de carga ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center"><div className="text-4xl mb-4">⏳</div><p>Cargando acta...</p></div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center p-8">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Link no válido</h2>
        <p className="text-white/60">Este link no existe o ya expiró.</p>
      </div>
    </div>
  )

  if (alreadySigned && !done) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center p-8">
        <img src={LOGO_URL} alt="Logo" className="h-16 mx-auto mb-6" />
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">¡Acta ya firmada!</h2>
        <p className="text-white/60">Revisa tu correo para ver la copia del acta firmada.</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center p-8 max-w-md">
        <img src={LOGO_URL} alt="Logo" className="h-16 mx-auto mb-6" />
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">¡Acta firmada!</h2>
        <p className="text-white/70 mb-4">Recibirás una copia del acta firmada en tu correo electrónico.</p>
        <div className="bg-white/10 rounded-xl p-4 text-left text-sm space-y-1">
          <p><strong>Firmado por:</strong> {signatureName}</p>
          <p><strong>Empresa:</strong> {empresa || nombre}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      {/* Header */}
      <div className="py-6 px-4 text-center" style={{ background: NAVY }}>
        <img src={LOGO_URL} alt="Latido y Huella" className="h-12 mx-auto mb-2" />
        <h1 className="text-white font-bold text-lg">Acta de Vinculación Comercial</h1>
        <p className="text-white/60 text-sm">Latido y Huella 2026 · 26 de julio · Llanogrande</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Datos del expositor — editables */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>1. Información del expositor</h2>
          <p className="text-xs text-gray-400 mb-4">Verifica y corrige tus datos de contacto si es necesario.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nombre del responsable *', value: nombre, set: setNombre },
              { label: 'Empresa / Marca *', value: empresa, set: setEmpresa },
              { label: 'CC / NIT *', value: cedula, set: setCedula },
              { label: 'Teléfono *', value: telefono, set: setTelefono },
              { label: 'Email *', value: email, set: setEmail },
              { label: 'Dirección *', value: address, set: setAddress },
              { label: 'Ciudad *', value: city, set: setCity },
            ].map(({ label, value, set }) => (
              <div key={label} className={label === 'Dirección *' || label === 'Email *' ? 'col-span-2' : ''}>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
                <input className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
                  value={value} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
          {/* No editables */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[['Stand', standId], ['Tipo', standType], ['Valor total', fmtCOP(monto)]].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                <div className="font-medium text-gray-700 text-sm">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos */}
        {isExpositor && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>2. Documentos requeridos</h2>
            <p className="text-sm text-gray-500 mb-4">Obligatorios para completar el acta.</p>
            <div className="space-y-3">
              <DocUploader label="Cédula / NIT del responsable *" field="cedula" recordId={record.id} existingUrl={cedulaUrl} onUploaded={url => setCedulaUrl(url)} />
              <DocUploader label="RUT actualizado *" field="rut" recordId={record.id} existingUrl={rutUrl} onUploaded={url => setRutUrl(url)} />
              <DocUploader label="Cámara de Comercio (máx. 30 días) *" field="camara" recordId={record.id} existingUrl={camaraUrl} onUploaded={url => setCamaraUrl(url)} />
            </div>
          </div>
        )}

        {/* Personal de apoyo */}
        {isExpositor && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1" style={{ color: NAVY }}>3. Personal autorizado de apoyo</h2>
            <p className="text-sm text-gray-500 mb-4">Registra hasta 4 personas que estarán contigo en el stand.</p>
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

        {/* Acta completa */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>
            {isExpositor ? '4. Acta de Vinculación Comercial' : '4. Consentimiento Informado'}
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-4 max-h-96 overflow-y-auto pr-2 border rounded-xl p-4 bg-gray-50">
            <p className="font-bold text-center" style={{ color: NAVY }}>ACTA DE VINCULACIÓN COMERCIAL — EXPOSITOR<br />LATIDO Y HUELLA 2026<br />Feria Comercial, Familiar y Pet Friendly</p>
            <p>Por medio del presente documento, <strong>{nombre}</strong>, identificado(a) con CC / NIT No. <strong>{cedula}</strong>, actuando en nombre propio o en representación de la empresa / marca <strong>{empresa}</strong>, manifiesta su aceptación de vinculación comercial como EXPOSITOR en LATIDO y HUELLA 2026.</p>
            <div className="grid grid-cols-2 gap-2 text-xs bg-white border rounded-xl p-3">
              {[['Marca / empresa', empresa], ['Responsable', nombre], ['CC / NIT', cedula], ['Teléfono', telefono], ['Email', email], ['Dirección', address ? `${address} - ${city}` : '—'], ['Tipo de espacio', standType], ['Número de stand', standId], ['Valor total', fmtCOP(monto)]].map(([k, v]) => (
                <div key={k}><span className="text-gray-400">{k}:</span> <strong>{v}</strong></div>
              ))}
            </div>
            <p>El evento se llevará a cabo el día domingo <strong>26 de julio de 2026</strong>, en el <strong>Parque del Bienestar COMFAMA Llanogrande</strong>, Km 8.5, diagonal al Mall Llanogrande, entre las <strong>8:00 a.m. y las 5:00 p.m.</strong>, organizado por <strong>Diverxo S.A.S</strong>.</p>
            <p className="font-bold" style={{ color: NAVY }}>3. OBLIGACIONES DEL EXPOSITOR</p>
            <p>3.1. Realizar el pago: 50% al reservar y 50% restante máximo 15 días antes del evento.</p>
            <p>3.2. Montaje el 25 de julio entre 10:00 a.m. y 6:00 p.m. Desmontaje el 26 de julio a partir de las 5:00 p.m.</p>
            <p>3.3. Abstenerse de promocionar productos diferentes a los de su propia empresa.</p>
            <p>3.4. No comercializar armas, bebidas alcohólicas, tabaco, sustancias psicoactivas o elementos de riesgo.</p>
            <p>3.5. Cumplir todas las normas sanitarias, comerciales y legales aplicables.</p>
            <p>3.6. No ingresar pipetas de gas no certificadas ni conexiones eléctricas improvisadas.</p>
            <p>3.7. Respetar las dimensiones y ubicación asignadas para el stand.</p>
            <p>3.8. Entregar lista con nombres y documentos del personal de apoyo.</p>
            <p>3.9. Garantizar afiliación vigente al Sistema de Seguridad Social de todo el personal.</p>
            <p>3.10. Asumir plena responsabilidad sobre la custodia y seguridad de sus productos y equipos.</p>
            <p className="font-bold" style={{ color: NAVY }}>4. DECLARACIONES Y ACEPTACIONES</p>
            <p>4.1. EL ORGANIZADOR no será responsable por pérdidas o daños ocasionados por terceros.</p>
            <p>4.7. Autorizamos el uso de nombre comercial, logos y material de marca con fines promocionales de LATIDO y HUELLA 2026.</p>
            <p>4.8. Autorizamos el tratamiento de datos personales conforme a la Ley 1581 de 2012.</p>
            <p>4.9. Autorizamos la captura de fotografías y videos con fines promocionales del evento.</p>
            <p className="font-bold" style={{ color: NAVY }}>5. BENEFICIOS</p>
            <p>Espacio: <strong>{standId}</strong> — Tipo: <strong>{standType}</strong> — Valor: <strong>{fmtCOP(monto)}</strong></p>
            <p className="font-bold text-center mt-4" style={{ color: NAVY }}>
              Firmado digitalmente por: {nombre}<br />En representación de: {empresa}<br />Organizado por: Diverxo S.A.S
            </p>
          </div>
        </div>

        {/* Checkmarks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>5. Declaraciones obligatorias *</h2>
          <div className="space-y-3">
            {[
              { key: 'obligaciones', label: 'He leído y acepto las obligaciones del expositor (sección 3)' },
              { key: 'declaraciones', label: 'He leído y acepto todas las declaraciones y autorizaciones (sección 4)' },
              { key: 'datos', label: 'Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012' },
              { key: 'seguridad', label: 'Declaro que todo el personal registrado cuenta con afiliación vigente al Sistema de Seguridad Social' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-cyan-500"
                  checked={checks[key as keyof typeof checks]}
                  onChange={e => setChecks(c => ({ ...c, [key]: e.target.checked }))} />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Firma */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>6. Firma *</h2>
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-600 mb-1 block">Nombre completo del firmante *</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400"
              placeholder="Escribe tu nombre completo como aparece en tu documento"
              value={signatureName} onChange={e => setSignatureName(e.target.value)} />
          </div>

          {/* Opciones de firma */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Firma en PC */}
            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">Firma en este dispositivo</label>
              <SignatureCanvas onSign={onSign} />
              {signatureDataUrl && (
                <div className="mt-2 text-xs font-bold" style={{ color: '#4CAF50' }}>✅ Firma capturada</div>
              )}
            </div>
            {/* QR para móvil */}
            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">O firma desde tu celular</label>
              <QRCode url={mobileUrl} />
              {signatureDataUrl && (
                <div className="mt-2 p-2 rounded-xl text-xs text-center font-bold" style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50' }}>
                  ✅ Firma recibida desde móvil
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Al firmar confirmas haber leído y aceptado todos los términos. Firma digital válida conforme a la Ley 527 de 1999 de Colombia.
          </p>
        </div>

        {/* Errores de validación */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="font-bold text-red-600 mb-2 text-sm">⚠️ Por favor completa los siguientes campos:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map(e => <li key={e} className="text-sm text-red-500">{e}</li>)}
            </ul>
          </div>
        )}

        {/* Botón firmar */}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-50 transition-all shadow-lg"
          style={{ background: `linear-gradient(135deg, ${CYAN}, #0097A7)` }}>
          {submitting ? 'Enviando...' : '✍️ Firmar y aceptar el acta'}
        </button>

        <div className="text-center text-xs text-gray-400 pb-8">
          Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co
        </div>
      </div>
    </div>
  )
}
