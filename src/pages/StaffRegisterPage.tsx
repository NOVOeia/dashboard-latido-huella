import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

interface Empresa { id:string; brand_name:string; responsible_name:string; email:string; tipo:'expositor'|'patrocinador'; stand_id?:string; contract_token?:string; contract_signed_at?:string; nit?:string; cedula?:string }
interface StaffMember { full_name:string; cedula:string; cedula_url:string; phone:string; eps_name:string; arl_name:string; arl_eps_url:string }
const empty = (): StaffMember => ({ full_name:'', cedula:'', cedula_url:'', phone:'', eps_name:'', arl_name:'', arl_eps_url:'' })

const inp = { width:'100%', fontSize:13, padding:'7px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'white', outline:'none', boxSizing:'border-box' as const }

function UploadBtn({ label, value, onUrl, uploading, onFile }: { label:string; value:string; onUrl:(u:string)=>void; uploading:boolean; onFile:(f:File)=>void }) {
  if (value) return <a href={value} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'#4ade80',whiteSpace:'nowrap'as const,padding:'6px 8px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',borderRadius:6,display:'inline-block'}}>✅ Ver doc</a>
  return (
    <label style={{cursor:'pointer',padding:'6px 10px',background:'rgba(0,188,212,0.1)',border:'1px solid rgba(0,188,212,0.3)',borderRadius:6,display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'as const,fontSize:11,color:CYAN}}>
      {uploading ? '⏳ Subiendo...' : label}
      <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&onFile(e.target.files[0])}/>
    </label>
  )
}

function MemberRow({ m, idx, total, onChange, onRemove, onUpload, uploadingKey }: {
  m:StaffMember; idx:number; total:number; onChange:(f:keyof StaffMember,v:string)=>void;
  onRemove:()=>void; onUpload:(f:File,field:'cedula_url'|'arl_eps_url')=>void; uploadingKey:string|null
}) {
  return (
    <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'12px 14px',marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{color:'rgba(255,255,255,0.7)',fontSize:13,fontWeight:600}}>Empleado {idx+1}</span>
        {total>1&&<button onClick={onRemove} style={{background:'rgba(239,68,68,0.1)',border:'none',color:'#f87171',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11}}>✕ Eliminar</button>}
      </div>
      {/* Fila 1: Nombre · Cédula · Subir CC */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1.5fr auto',gap:8,marginBottom:8,alignItems:'end'}}>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>Nombre completo *</div>
          <input style={inp} placeholder="Nombre y apellidos" value={m.full_name} onChange={e=>onChange('full_name',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>Número de cédula *</div>
          <input style={inp} placeholder="CC" value={m.cedula} onChange={e=>onChange('cedula',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>Foto cédula</div>
          <UploadBtn label="📷 Subir foto CC" value={m.cedula_url} onUrl={u=>onChange('cedula_url',u)} uploading={uploadingKey===`${idx}-cc`} onFile={f=>onUpload(f,'cedula_url')}/>
        </div>
      </div>
      {/* Fila 2: Teléfono · EPS · ARL · Subir doc */}
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 1.5fr auto',gap:8,alignItems:'end'}}>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>Teléfono *</div>
          <input style={inp} placeholder="300 000 0000" value={m.phone} onChange={e=>onChange('phone',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>EPS</div>
          <input style={inp} placeholder="Nombre EPS" value={m.eps_name} onChange={e=>onChange('eps_name',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>ARL</div>
          <input style={inp} placeholder="Nombre ARL" value={m.arl_name} onChange={e=>onChange('arl_name',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:3}}>Doc seguro</div>
          <UploadBtn label="📄 Subir ARL/EPS" value={m.arl_eps_url} onUrl={u=>onChange('arl_eps_url',u)} uploading={uploadingKey===`${idx}-arl`} onFile={f=>onUpload(f,'arl_eps_url')}/>
        </div>
      </div>
    </div>
  )
}

export function StaffRegisterPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [empresa, setEmpresa] = useState<Empresa|null>(null)
  const [nitInput, setNitInput] = useState('')
  const [verified, setVerified] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [activeTab, setActiveTab] = useState<'montaje'|'servicio'|null>(null)
  const [montaje, setMontaje] = useState<StaffMember[]>([empty()])
  const [servicio, setServicio] = useState<StaffMember[]>([empty()])
  const [montajeSaved, setMontajeSaved] = useState(false)
  const [servicioSaved, setServicioSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [terms, setTerms] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string|null>(null)

  useEffect(() => {
    const load = async () => {
      const [{ data: exps }, { data: spons }] = await Promise.all([
        supabase.from('expositor_reservations').select('id,brand_name,responsible_name,email,stand_id,contract_token,contract_signed_at,document_id').in('status',['paid','approved']),
        supabase.from('sponsor_inquiries').select('id,company_name,contact_name,email,contract_token,contract_signed_at,document_id').in('status',['paid','approved'])
      ])
      const list: Empresa[] = [
        ...(exps||[]).map((e:any) => ({ id:e.id, brand_name:e.brand_name, responsible_name:e.responsible_name, email:e.email, tipo:'expositor'as const, stand_id:e.stand_id, contract_token:e.contract_token, contract_signed_at:e.contract_signed_at, nit:e.document_id })),
        ...(spons||[]).map((s:any) => ({ id:s.id, brand_name:s.company_name, responsible_name:s.contact_name, email:s.email, tipo:'patrocinador'as const, contract_token:s.contract_token, contract_signed_at:s.contract_signed_at, nit:s.document_id }))
      ]
      setEmpresas(list)
      setLoading(false)
    }
    load()
  }, [])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setVerified(false)
    setNitInput('')
    setVerifyError('')
    setActiveTab(null)
    const emp = empresas.find(e => e.id === id) || null
    setEmpresa(emp)
  }

  const handleVerify = () => {
    if (!empresa) return
    const stored = (empresa.nit || '').trim().replace(/[.\-\s]/g, '')
    const input = nitInput.trim().replace(/[.\-\s]/g, '')
    if (stored && input === stored) {
      setVerified(true)
      setVerifyError('')
    } else {
      setVerifyError('NIT/Cédula incorrecto. Verifica el dato registrado.')
    }
  }

  const uploadFile = async (file: File, idx: number, field: 'cedula_url'|'arl_eps_url', type: 'montaje'|'servicio') => {
    const key = `${idx}-${field==='cedula_url'?'cc':'arl'}`
    setUploadingKey(key)
    const ext = file.name.split('.').pop()
    const path = `staff-docs/${empresa?.id}_${Date.now()}_${key}.${ext}`
    const { error } = await supabase.storage.from('expositor-documents').upload(path, file, { upsert: true })
    if (error) { setUploadingKey(null); return }
    const { data } = supabase.storage.from('expositor-documents').getPublicUrl(path)
    const url = data.publicUrl
    const setter = type === 'montaje' ? setMontaje : setServicio
    setter(prev => prev.map((m, i) => i === idx ? { ...m, [field]: url } : m))
    setUploadingKey(null)
  }

  const updateMember = (type: 'montaje'|'servicio', idx: number, field: keyof StaffMember, value: string) => {
    const setter = type === 'montaje' ? setMontaje : setServicio
    setter(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const saveStaff = async (type: 'montaje'|'servicio') => {
    const list = type === 'montaje' ? montaje : servicio
    setSaveError('')
    for (let i = 0; i < list.length; i++) {
      if (!list[i].full_name || !list[i].cedula || !list[i].phone) {
        setSaveError(`Empleado ${i+1}: nombre, cédula y teléfono son obligatorios`); return
      }
    }
    if (!terms) { setSaveError('Debes aceptar los términos y condiciones'); return }
    setSaving(true)
    const inserts = list.map(m => ({
      expositor_id: empresa?.tipo === 'expositor' ? empresa.id : null,
      sponsor_id: empresa?.tipo === 'patrocinador' ? empresa.id : null,
      full_name: m.full_name, cedula: m.cedula, cedula_url: m.cedula_url,
      phone: m.phone, eps_name: m.eps_name, arl_name: m.arl_name,
      arl_eps_url: m.arl_eps_url, arl_eps: `${m.eps_name} / ${m.arl_name}`,
      staff_type: type
    }))
    const { error } = await supabase.from('stand_staff').insert(inserts)
    if (error) { setSaveError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }
    // Email confirmación
    try {
      const names = list.map(m => m.full_name).join(', ')
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0D1B6E;padding:28px;text-align:center;border-radius:16px 16px 0 0"><img src="${LOGO}" style="height:52px"/></div><div style="background:white;padding:28px;border-radius:0 0 16px 16px"><h2 style="color:#0D1B6E">✅ Staff ${type} registrado</h2><p>Se registraron <strong>${list.length} empleado${list.length>1?'s':''}</strong> de <strong>${type}</strong> para <strong>${empresa?.brand_name}</strong>.</p><p style="color:#555;font-size:14px"><strong>Personal registrado:</strong><br/>${names}</p><p style="color:#888;font-size:12px">Latido y Huella 2026 · 26 Jul · Llanogrande · eventos@latidoyhuella.co</p></div></div>`
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method:'POST',
        headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
        body: JSON.stringify({ to: empresa?.email, subject: `✅ Staff ${type} registrado — Latido y Huella 2026`, html, from:'eventos@latidoyhuella.co', type:'staff' })
      })
    } catch(_e) {}
    if (type === 'montaje') setMontajeSaved(true)
    else setServicioSaved(true)
    setActiveTab(null)
    setSaving(false)
  }

  const btn = (color: string) => ({ display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.04)',border:`1px solid ${color}`,borderRadius:12,padding:'14px 16px',cursor:'pointer',width:'100%',textAlign:'left'as const })

  if (loading) return <div style={{minHeight:'100vh',background:NAVY,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'white',textAlign:'center'}}><div style={{fontSize:36}}>⏳</div><p>Cargando...</p></div></div>

  return (
    <div style={{minHeight:'100vh',background:'#080d22',paddingBottom:60}}>
      {/* Header */}
      <div style={{background:NAVY,padding:'28px 24px',textAlign:'center'}}>
        <img src={LOGO} style={{height:50,marginBottom:14}} alt="Latido y Huella"/>
        <h1 style={{color:'white',fontSize:20,fontWeight:700,margin:'0 0 4px'}}>Registro Administrativo</h1>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,margin:0}}>Latido y Huella 2026 · Llanogrande</p>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>

        {/* PASO 1: Selector empresa */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:6}}>Selecciona tu empresa</div>
          <select value={selectedId} onChange={e=>handleSelect(e.target.value)}
            style={{width:'100%',fontSize:14,padding:'9px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'#1a2050',color:'white',outline:'none'}}>
            <option value="">-- Selecciona tu empresa --</option>
            {empresas.map(e=><option key={e.id} value={e.id}>{e.brand_name} {e.tipo==='expositor'?'🏪':'⭐'}</option>)}
          </select>

          {/* No está en la lista */}
          {!selectedId&&(
            <div style={{marginTop:12,padding:12,background:'rgba(0,188,212,0.06)',border:'1px solid rgba(0,188,212,0.15)',borderRadius:10,textAlign:'center'}}>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:12,margin:'0 0 10px'}}>¿Tu empresa no aparece en la lista?</p>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'as const}}>
                <a href="https://latidoyhuella.com/expositores" target="_blank" rel="noopener noreferrer"
                  style={{padding:'8px 16px',borderRadius:8,background:CYAN,color:'white',textDecoration:'none',fontSize:13,fontWeight:700}}>
                  🏪 Registrarme como Expositor
                </a>
                <a href="https://latidoyhuella.com/patrocinadores" target="_blank" rel="noopener noreferrer"
                  style={{padding:'8px 16px',borderRadius:8,background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',fontSize:13,fontWeight:700,border:'1px solid rgba(255,255,255,0.2)'}}>
                  ⭐ Registrarme como Patrocinador
                </a>
              </div>
            </div>
          )}

          {/* Info empresa seleccionada */}
          {empresa&&(
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'as const,alignItems:'center'}}>
              <span style={{background:'rgba(0,188,212,0.15)',color:CYAN,fontSize:11,padding:'3px 10px',borderRadius:20}}>{empresa.tipo==='expositor'?'🏪 Expositor':'⭐ Patrocinador'}</span>
              {empresa.stand_id&&<span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:11,padding:'3px 10px',borderRadius:20}}>Stand {empresa.stand_id}</span>}
              <span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:11,padding:'3px 10px',borderRadius:20}}>{empresa.responsible_name}</span>
            </div>
          )}
        </div>

        {/* PASO 2: Verificación NIT/Cédula */}
        {empresa&&!verified&&(
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,179,0,0.3)',borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{color:'#fbbf24',fontSize:13,fontWeight:600,marginBottom:4}}>🔐 Verificación de identidad</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:12}}>Ingresa el NIT o cédula con el que se registró tu empresa para continuar</div>
            <div style={{display:'flex',gap:8}}>
              <input style={{...inp,flex:1}} placeholder="NIT o cédula de la empresa" value={nitInput} onChange={e=>setNitInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleVerify()}/>
              <button onClick={handleVerify} style={{padding:'7px 16px',borderRadius:8,background:CYAN,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:13,whiteSpace:'nowrap'as const}}>Verificar</button>
            </div>
            {verifyError&&<div style={{color:'#f87171',fontSize:12,marginTop:8}}>{verifyError}</div>}
          </div>
        )}

        {/* PASO 3: Acciones (solo si verificado) */}
        {empresa&&verified&&(
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginBottom:16}}>

              {/* Staff montaje */}
              <button style={btn(montajeSaved?'#4CAF50':'rgba(239,68,68,0.4)')} onClick={()=>!montajeSaved&&setActiveTab(activeTab==='montaje'?null:'montaje')}>
                <div>
                  <div style={{color:'white',fontSize:14,fontWeight:600}}>🔧 Staff de montaje</div>
                  <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Personal de montaje y desmontaje · ilimitado</div>
                  <div style={{color:'#fbbf24',fontSize:11,marginTop:2}}>📅 Límite: 20 julio</div>
                </div>
                <span style={{background:montajeSaved?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:montajeSaved?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,flexShrink:0}}>
                  {montajeSaved?`✅ ${montaje.length} registrados`:'🔴 Pendiente'}
                </span>
              </button>

              {/* Staff servicio */}
              <button style={btn(servicioSaved?'#4CAF50':'rgba(239,68,68,0.4)')} onClick={()=>!servicioSaved&&setActiveTab(activeTab==='servicio'?null:'servicio')}>
                <div>
                  <div style={{color:'white',fontSize:14,fontWeight:600}}>👔 Staff de servicio</div>
                  <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Personal día del evento · máx 4</div>
                  <div style={{color:'#fbbf24',fontSize:11,marginTop:2}}>📅 Límite: 22 julio</div>
                </div>
                <span style={{background:servicioSaved?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:servicioSaved?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,flexShrink:0}}>
                  {servicioSaved?`✅ ${servicio.length}/4`:'🔴 0/4'}
                </span>
              </button>

              {/* Contrato */}
              <div style={{...btn(empresa.contract_signed_at?'#4CAF50':'rgba(239,68,68,0.4)'),cursor:'default'}}>
                <div>
                  <div style={{color:'white',fontSize:14,fontWeight:600}}>📄 Contrato</div>
                  <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Consentimiento de {empresa.tipo}</div>
                  <div style={{color:'#fbbf24',fontSize:11,marginTop:2}}>📅 Límite: 22 julio</div>
                </div>
                <div style={{display:'flex',flexDirection:'column'as const,gap:6,alignItems:'flex-end'}}>
                  <span style={{background:empresa.contract_signed_at?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:empresa.contract_signed_at?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,whiteSpace:'nowrap'as const}}>
                    {empresa.contract_signed_at?'✅ Firmado':'🔴 Pendiente'}
                  </span>
                  {empresa.contract_token&&!empresa.contract_signed_at&&(
                    <a href={`${window.location.origin}/contrato/${empresa.contract_token}`} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{padding:'5px 10px',borderRadius:8,background:CYAN,color:'white',textDecoration:'none',fontSize:12,fontWeight:700,whiteSpace:'nowrap'as const}}>
                      ✍️ Ir a firmar
                    </a>
                  )}
                  {empresa.contract_signed_at&&(
                    <a href={`${window.location.origin}/ecard/${empresa.id}`} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{padding:'5px 10px',borderRadius:8,background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',fontSize:12,whiteSpace:'nowrap'as const}}>
                      🎟️ Ver E-Card
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario staff activo */}
            {activeTab&&(
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:20,marginBottom:16}}>
                <h3 style={{color:'white',fontSize:15,fontWeight:700,margin:'0 0 14px'}}>
                  {activeTab==='montaje'?'🔧 Staff de montaje':'👔 Staff de servicio'}
                  {activeTab==='servicio'&&<span style={{color:'rgba(255,255,255,0.4)',fontWeight:400,fontSize:12}}> — máx 4 personas</span>}
                </h3>

                {(activeTab==='montaje'?montaje:servicio).map((m, idx) => (
                  <MemberRow
                    key={idx} m={m} idx={idx}
                    total={(activeTab==='montaje'?montaje:servicio).length}
                    onChange={(f,v)=>updateMember(activeTab,idx,f,v)}
                    onRemove={()=>{const setter=activeTab==='montaje'?setMontaje:setServicio; setter(p=>p.filter((_,i)=>i!==idx))}}
                    onUpload={(f,field)=>uploadFile(f,idx,field,activeTab)}
                    uploadingKey={uploadingKey}
                  />
                ))}

                {(activeTab==='servicio'?(servicio.length<4):true)&&(
                  <button onClick={()=>{const setter=activeTab==='montaje'?setMontaje:setServicio; setter(p=>[...p,empty()])}}
                    style={{width:'100%',padding:'8px',borderRadius:8,background:'transparent',border:`1px dashed rgba(0,188,212,0.4)`,color:CYAN,cursor:'pointer',fontSize:12,marginBottom:12}}>
                    + Agregar empleado
                  </button>
                )}

                <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:12}}>
                  <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{marginTop:2,flexShrink:0}}/>
                  <span style={{color:'rgba(255,255,255,0.6)',fontSize:12}}>Certifico que la información es correcta y acepto los términos de participación de Latido y Huella 2026. Una vez enviado no podrá modificarse — para cambios contacta a eventos@latidoyhuella.co</span>
                </div>

                {saveError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'8px 12px',color:'#f87171',fontSize:12,marginBottom:12}}>{saveError}</div>}

                <button onClick={()=>saveStaff(activeTab)} disabled={saving}
                  style={{width:'100%',padding:13,borderRadius:10,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:14,opacity:saving?0.7:1}}>
                  {saving?'⏳ Guardando...':`✅ Registrar ${(activeTab==='montaje'?montaje:servicio).length} empleado${(activeTab==='montaje'?montaje:servicio).length>1?'s':''}`}
                </button>
              </div>
            )}
          </>
        )}

        <p style={{color:'rgba(255,255,255,0.2)',fontSize:11,textAlign:'center',marginTop:24}}>
          Latido y Huella 2026 · eventos@latidoyhuella.co · WhatsApp +57 333 277 7912
        </p>
      </div>
    </div>
  )
}