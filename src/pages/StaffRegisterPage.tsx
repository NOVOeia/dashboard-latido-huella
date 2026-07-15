import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'
const WA = '+573332777912'

interface Empresa { id:string; brand_name:string; responsible_name:string; email:string; tipo:'expositor'|'patrocinador'; stand_id?:string; contract_token?:string; contract_signed_at?:string; nit?:string; phone?:string }
interface StaffMember { full_name:string; cedula:string; cedula_url:string; phone:string; eps_name:string; arl_name:string; arl_eps_url:string }
const empty = (): StaffMember => ({ full_name:'', cedula:'', cedula_url:'', phone:'', eps_name:'', arl_name:'', arl_eps_url:'' })
const inp = { width:'100%', fontSize:13, padding:'7px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'white', outline:'none', boxSizing:'border-box' as const }

function UploadBtn({ label, value, uploading, onFile }: { label:string; value:string; uploading:boolean; onFile:(f:File)=>void }) {
  if (value) return <span style={{fontSize:11,color:'#4ade80',padding:'6px 8px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',borderRadius:6,display:'inline-block'}}>✅ Subido</span>
  return (
    <label style={{cursor:'pointer',padding:'6px 10px',background:'rgba(0,188,212,0.1)',border:'1px solid rgba(0,188,212,0.3)',borderRadius:6,display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'as const,fontSize:11,color:CYAN}}>
      {uploading ? '⏳' : label}
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
          <UploadBtn label="📷 Subir CC" value={m.cedula_url} uploading={uploadingKey===`${idx}-cc`} onFile={f=>onUpload(f,'cedula_url')}/>
        </div>
      </div>
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
          <UploadBtn label="📄 ARL/EPS" value={m.arl_eps_url} uploading={uploadingKey===`${idx}-arl`} onFile={f=>onUpload(f,'arl_eps_url')}/>
        </div>
      </div>
    </div>
  )
}

export function StaffRegisterPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [empresa, setEmpresa] = useState<Empresa|null>(null)
  const [nitInput, setNitInput] = useState('')
  const [verified, setVerified] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [montaje, setMontaje] = useState<StaffMember[]>([empty()])
  const [montajeSaved, setMontajeSaved] = useState(false)
  const [existingMontaje, setExistingMontaje] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [terms, setTerms] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string|null>(null)
  const [showContractModal, setShowContractModal] = useState(false)

  const filteredEmpresas = empresas.filter(e => e.brand_name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const load = async () => {
      const [{ data: exps }, { data: spons }] = await Promise.all([
        supabase.from('expositor_reservations').select('id,brand_name,responsible_name,email,phone,stand_id,contract_token,contract_signed_at,document_id').in('status',['paid','approved']),
        supabase.from('sponsor_inquiries').select('id,company_name,contact_name,email,contract_token,contract_signed_at,document_id').in('status',['paid','approved'])
      ])
      const list: Empresa[] = [
        ...(exps||[]).map((e:any) => ({ id:e.id, brand_name:e.brand_name, responsible_name:e.responsible_name, email:e.email, phone:e.phone, tipo:'expositor'as const, stand_id:e.stand_id, contract_token:e.contract_token, contract_signed_at:e.contract_signed_at, nit:e.document_id })),
        ...(spons||[]).map((s:any) => ({ id:s.id, brand_name:s.company_name, responsible_name:s.contact_name, email:s.email, tipo:'patrocinador'as const, contract_token:s.contract_token, contract_signed_at:s.contract_signed_at, nit:s.document_id }))
      ]
      setEmpresas(list)

      // Restaurar sesión
      const savedId = sessionStorage.getItem('staff_verified_id')
      if (savedId) {
        const emp = list.find(e => e.id === savedId)
        if (emp) {
          setEmpresa(emp)
          setSelectedId(emp.id)
          setSearch(emp.brand_name)
          setVerified(true)
          loadExistingStaff(savedId)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const loadExistingStaff = async (empId: string) => {
    const { data } = await supabase.from('stand_staff').select('*').or(`expositor_id.eq.${empId},sponsor_id.eq.${empId}`).eq('staff_type','montaje')
    if (data && data.length > 0) {
      setExistingMontaje(data)
      setMontajeSaved(true)
    }
  }

  const selectEmpresa = (emp: Empresa) => {
    setSelectedId(emp.id)
    setSearch(emp.brand_name)
    setShowList(false)
    setVerified(false)
    setNitInput('')
    setVerifyError('')
    setEmpresa(emp)
    setExistingMontaje([])
    setMontajeSaved(false)
  }

  const handleVerify = async () => {
    if (!empresa) return
    const input = nitInput.trim().replace(/[.\-\s]/g, '').toLowerCase()
    const nit = (empresa.nit || '').trim().replace(/[.\-\s]/g, '').toLowerCase()
    const email = (empresa.email || '').trim().toLowerCase()
    const phone = (empresa.phone || '').trim().replace(/[.\-\s+]/g, '')
    const inputPhone = nitInput.trim().replace(/[.\-\s+]/g, '')

    if ((nit && input === nit) || (email && nitInput.trim().toLowerCase() === email) || (phone && inputPhone === phone)) {
      setVerified(true)
      setVerifyError('')
      sessionStorage.setItem('staff_verified_id', empresa.id)
      loadExistingStaff(empresa.id)
    } else {
      setVerifyError('Dato incorrecto. Verifica el NIT, email o número de celular registrado.')
    }
  }

  const uploadFile = async (file: File, idx: number, field: 'cedula_url'|'arl_eps_url') => {
    const key = `${idx}-${field==='cedula_url'?'cc':'arl'}`
    setUploadingKey(key)
    const ext = file.name.split('.').pop()
    const path = `staff-docs/${empresa?.id}_${Date.now()}_${key}.${ext}`
    const { error } = await supabase.storage.from('expositor-documents').upload(path, file, { upsert: true })
    if (error) { setUploadingKey(null); return }
    const { data } = supabase.storage.from('expositor-documents').getPublicUrl(path)
    setMontaje(prev => prev.map((m, i) => i === idx ? { ...m, [field]: data.publicUrl } : m))
    setUploadingKey(null)
  }

  const updateMember = (idx: number, field: keyof StaffMember, value: string) => {
    setMontaje(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const saveMontaje = async () => {
    setSaveError('')
    for (let i = 0; i < montaje.length; i++) {
      if (!montaje[i].full_name || !montaje[i].cedula || !montaje[i].phone) {
        setSaveError(`Empleado ${i+1}: nombre, cédula y teléfono son obligatorios`); return
      }
    }
    if (!terms) { setSaveError('Debes aceptar los términos y condiciones'); return }
    setSaving(true)
    const inserts = montaje.map(m => ({
      expositor_id: empresa?.tipo === 'expositor' ? empresa.id : null,
      sponsor_id: empresa?.tipo === 'patrocinador' ? empresa.id : null,
      full_name: m.full_name, cedula: m.cedula, cedula_url: m.cedula_url,
      phone: m.phone, eps_name: m.eps_name, arl_name: m.arl_name,
      arl_eps_url: m.arl_eps_url, arl_eps: `${m.eps_name} / ${m.arl_name}`,
      staff_type: 'montaje'
    }))
    const { error } = await supabase.from('stand_staff').insert(inserts)
    if (error) { setSaveError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }

    // Email confirmación mejorado
    try {
      const rows = montaje.map((m,i) => `<tr style="border-bottom:1px solid #eee"><td style="padding:8px 12px;font-size:13px">${i+1}</td><td style="padding:8px 12px;font-size:13px">${m.full_name}</td><td style="padding:8px 12px;font-size:13px">${m.cedula}</td><td style="padding:8px 12px;font-size:13px">${m.phone}</td><td style="padding:8px 12px;font-size:13px">${m.eps_name||'—'} / ${m.arl_name||'—'}</td></tr>`).join('')
      const html = `<div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#f5f5f5"><div style="background:#0D1B6E;padding:32px;text-align:center;border-radius:16px 16px 0 0"><img src="${LOGO}" style="height:55px"/></div><div style="background:white;padding:32px;border-radius:0 0 16px 16px"><h2 style="color:#0D1B6E;margin:0 0 8px">✅ Staff de montaje registrado</h2><p style="color:#555;font-size:14px;margin:0 0 20px">El siguiente personal fue registrado para <strong>${empresa?.brand_name}</strong> como staff de montaje y desmontaje.</p><div style="background:#fff3e0;border-left:4px solid #FFB300;padding:14px 16px;border-radius:0 10px 10px 0;margin:0 0 20px"><p style="color:#e65100;font-weight:700;margin:0 0 4px;font-size:14px">⚠️ Fecha límite: 20 de julio de 2026</p><p style="color:#555;font-size:13px;margin:0">Esta lista será entregada a las directivas del Parque COMFAMA Llanogrande el 20 de julio. <strong>No podrá ser modificada</strong> después de esta fecha. Para cambios contacta: WhatsApp +57 333 277 7912</p></div><table style="width:100%;border-collapse:collapse;margin:0 0 20px"><thead><tr style="background:#0D1B6E;color:white"><th style="padding:10px 12px;text-align:left;font-size:12px">#</th><th style="padding:10px 12px;text-align:left;font-size:12px">Nombre</th><th style="padding:10px 12px;text-align:left;font-size:12px">Cédula</th><th style="padding:10px 12px;text-align:left;font-size:12px">Teléfono</th><th style="padding:10px 12px;text-align:left;font-size:12px">EPS / ARL</th></tr></thead><tbody>${rows}</tbody></table><p style="color:#888;font-size:12px;text-align:center">Latido y Huella 2026 · 26 Jul · Llanogrande · eventos@latidoyhuella.co</p></div></div>`
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method:'POST',
        headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
        body: JSON.stringify({ to: empresa?.email, subject: `✅ Staff de montaje registrado — ${empresa?.brand_name} — Latido y Huella 2026`, html, from:'eventos@latidoyhuella.co', type:'staff' })
      })
    } catch(_e) {}

    await loadExistingStaff(empresa!.id)
    setMontajeSaved(true)
    setSaving(false)
  }

  const btnStyle = (color: string) => ({ display:'flex',justifyContent:'space-between'as const,alignItems:'center'as const,background:'rgba(255,255,255,0.04)',border:`1px solid ${color}`,borderRadius:12,padding:'14px 16px',cursor:'pointer',width:'100%',textAlign:'left'as const })

  if (loading) return <div style={{minHeight:'100vh',background:NAVY,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'white',textAlign:'center'}}><div style={{fontSize:36}}>⏳</div><p>Cargando...</p></div></div>

  return (
    <div style={{minHeight:'100vh',background:'#080d22',paddingBottom:60}}>
      <div style={{background:NAVY,padding:'28px 24px',textAlign:'center'}}>
        <img src={LOGO} style={{height:50,marginBottom:14}} alt="Latido y Huella"/>
        <h1 style={{color:'white',fontSize:20,fontWeight:700,margin:'0 0 4px'}}>Registro Administrativo</h1>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,margin:0}}>Latido y Huella 2026 · Llanogrande · 26 de julio</p>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>

        {/* Selector empresa */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:6}}>Busca tu empresa o stand</div>
          <div style={{position:'relative'}}>
            <input style={{...inp,fontSize:14,padding:'9px 12px'}} placeholder="Escribe el nombre de tu empresa..."
              value={search} onChange={e=>{setSearch(e.target.value);setShowList(true);if(!e.target.value){setSelectedId('');setEmpresa(null);setVerified(false);sessionStorage.removeItem('staff_verified_id')}}}
              onFocus={()=>setShowList(true)}/>
            {showList&&search&&filteredEmpresas.length>0&&(
              <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1a2050',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,zIndex:100,maxHeight:200,overflowY:'auto'as const,marginTop:4}}>
                {filteredEmpresas.map(e=>(
                  <div key={e.id} onClick={()=>selectEmpresa(e)}
                    style={{padding:'10px 14px',cursor:'pointer',color:'white',fontSize:13,borderBottom:'1px solid rgba(255,255,255,0.06)'}}
                    onMouseOver={el=>(el.currentTarget.style.background='rgba(255,255,255,0.08)')}
                    onMouseOut={el=>(el.currentTarget.style.background='transparent')}>
                    {e.brand_name} {e.tipo==='expositor'?'🏪':'⭐'}
                  </div>
                ))}
              </div>
            )}
          </div>

          {search&&filteredEmpresas.length===0&&(
            <div style={{marginTop:12,padding:12,background:'rgba(0,188,212,0.06)',border:'1px solid rgba(0,188,212,0.15)',borderRadius:10,textAlign:'center'}}>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:12,margin:'0 0 10px'}}>¿Tu empresa no aparece en la lista?</p>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'as const}}>
                <a href="https://latidoyhuella.com/expositores" target="_blank" rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:8,background:CYAN,color:'white',textDecoration:'none',fontSize:13,fontWeight:700}}>🏪 Registrarme como Expositor</a>
                <a href="https://latidoyhuella.com/patrocinadores" target="_blank" rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:8,background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',fontSize:13,fontWeight:700,border:'1px solid rgba(255,255,255,0.2)'}}>⭐ Registrarme como Patrocinador</a>
              </div>
            </div>
          )}

          {empresa&&(
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'as const}}>
              <span style={{background:'rgba(0,188,212,0.15)',color:CYAN,fontSize:11,padding:'3px 10px',borderRadius:20}}>{empresa.tipo==='expositor'?'🏪 Expositor':'⭐ Patrocinador'}</span>
              {empresa.stand_id&&<span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:11,padding:'3px 10px',borderRadius:20}}>Stand {empresa.stand_id}</span>}
            </div>
          )}
        </div>

        {/* Verificación */}
        {empresa&&!verified&&(
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,179,0,0.3)',borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{color:'#fbbf24',fontSize:13,fontWeight:600,marginBottom:4}}>🔐 Verificación de identidad</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:12}}>Ingresa el NIT de la empresa, email o número de celular registrado</div>
            <div style={{display:'flex',gap:8}}>
              <input style={{...inp,flex:1}} placeholder="NIT, email o celular" value={nitInput} onChange={e=>setNitInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleVerify()}/>
              <button onClick={handleVerify} style={{padding:'7px 16px',borderRadius:8,background:CYAN,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:13,whiteSpace:'nowrap'as const}}>Verificar</button>
            </div>
            {verifyError&&<div style={{color:'#f87171',fontSize:12,marginTop:8}}>{verifyError}</div>}
          </div>
        )}

        {/* Panel principal */}
        {empresa&&verified&&(
          <>
            {/* Aviso importante */}
            <div style={{background:'rgba(255,179,0,0.08)',border:'1px solid rgba(255,179,0,0.3)',borderRadius:12,padding:'12px 16px',marginBottom:16}}>
              <p style={{color:'#fbbf24',fontSize:13,fontWeight:700,margin:'0 0 4px'}}>⚠️ Información importante</p>
              <p style={{color:'rgba(255,255,255,0.6)',fontSize:12,margin:0}}>La lista de personal será entregada a las directivas del <strong style={{color:'white'}}>Parque COMFAMA Llanogrande el 20 de julio</strong>. Una vez enviada no podrá modificarse. Para cambios: <a href={`https://wa.me/${WA}`} style={{color:CYAN}}>WhatsApp {WA}</a></p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginBottom:16}}>

              {/* Staff montaje */}
              <button style={btnStyle(montajeSaved?'#4CAF50':'rgba(239,68,68,0.4)')} onClick={()=>{}}>
                <div>
                  <div style={{color:'white',fontSize:14,fontWeight:600}}>🔧 Staff de montaje</div>
                  <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Personal de montaje y desmontaje · ilimitado</div>
                  <div style={{color:'#fbbf24',fontSize:11,marginTop:2}}>📅 Límite: 20 de julio</div>
                </div>
                <span style={{background:montajeSaved?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:montajeSaved?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,flexShrink:0}}>
                  {montajeSaved?`✅ ${existingMontaje.length} registrados`:'🔴 Pendiente'}
                </span>
              </button>

              {/* Contrato */}
              <div style={{...btnStyle(empresa.contract_signed_at?'#4CAF50':'rgba(239,68,68,0.4)'),cursor:'default'}}>
                <div>
                  <div style={{color:'white',fontSize:14,fontWeight:600}}>📄 Contrato + Staff de servicio</div>
                  <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Consentimiento y personal del día del evento</div>
                  <div style={{color:'#fbbf24',fontSize:11,marginTop:2}}>📅 Límite: 22 de julio</div>
                </div>
                <div style={{display:'flex',flexDirection:'column'as const,gap:6,alignItems:'flex-end'}}>
                  <span style={{background:empresa.contract_signed_at?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:empresa.contract_signed_at?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,whiteSpace:'nowrap'as const}}>
                    {empresa.contract_signed_at?'✅ Firmado':'🔴 Pendiente'}
                  </span>
                  {empresa.contract_token&&!empresa.contract_signed_at&&(
                    <button onClick={()=>setShowContractModal(true)} style={{padding:'5px 10px',borderRadius:8,background:CYAN,color:'white',border:'none',cursor:'pointer',fontSize:12,fontWeight:700,whiteSpace:'nowrap'as const}}>✍️ Firmar contrato</button>
                  )}
                  {empresa.contract_signed_at&&(
                    <a href={`${window.location.origin}/ecard/${empresa.id}`} target="_blank" rel="noopener noreferrer" style={{padding:'5px 10px',borderRadius:8,background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',fontSize:12,whiteSpace:'nowrap'as const}}>🎟️ Ver E-Card</a>
                  )}
                </div>
              </div>
            </div>

            {/* Lista existente montaje */}
            {montajeSaved&&existingMontaje.length>0&&(
              <div style={{background:'rgba(76,175,80,0.05)',border:'1px solid rgba(76,175,80,0.2)',borderRadius:14,padding:16,marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div>
                    <div style={{color:'#4ade80',fontSize:14,fontWeight:700}}>✅ Staff de montaje registrado</div>
                    <div style={{color:'rgba(255,255,255,0.4)',fontSize:12,marginTop:2}}>{existingMontaje.length} empleado{existingMontaje.length>1?'s':''} · Solo lectura</div>
                  </div>
                </div>
                <div style={{overflowX:'auto'as const}}>
                  <table style={{width:'100%',borderCollapse:'collapse'as const,fontSize:12}}>
                    <thead>
                      <tr style={{background:'rgba(255,255,255,0.05)'}}>
                        <th style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600}}>#</th>
                        <th style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600}}>Nombre</th>
                        <th style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600}}>Cédula</th>
                        <th style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600}}>Teléfono</th>
                        <th style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600}}>EPS / ARL</th>
                        <th style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600}}>Docs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingMontaje.map((s,i)=>(
                        <tr key={s.id} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                          <td style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)'}}>{i+1}</td>
                          <td style={{padding:'8px 10px',color:'white',fontWeight:600}}>{s.full_name}</td>
                          <td style={{padding:'8px 10px',color:'rgba(255,255,255,0.7)'}}>{s.cedula}</td>
                          <td style={{padding:'8px 10px',color:'rgba(255,255,255,0.7)'}}>{s.phone}</td>
                          <td style={{padding:'8px 10px',color:'rgba(255,255,255,0.6)'}}>{s.arl_eps||'—'}</td>
                          <td style={{padding:'8px 10px'}}>
                            <div style={{display:'flex',gap:4}}>
                              {s.cedula_url&&<a href={s.cedula_url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:CYAN}}>CC</a>}
                              {s.arl_eps_url&&<a href={s.arl_eps_url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:CYAN}}>ARL</a>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{marginTop:10,padding:'10px 14px',background:'rgba(255,179,0,0.08)',border:'1px solid rgba(255,179,0,0.2)',borderRadius:8}}>
                  <p style={{color:'#fbbf24',fontSize:11,margin:0}}>⚠️ Esta lista ya fue enviada. Para modificaciones contacta: <a href={`https://wa.me/${WA}`} style={{color:CYAN}}>WhatsApp {WA}</a></p>
                </div>
              </div>
            )}

            {/* Formulario montaje (solo si no está guardado) */}
            {!montajeSaved&&(
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:20,marginBottom:16}}>
                <h3 style={{color:'white',fontSize:15,fontWeight:700,margin:'0 0 14px'}}>🔧 Registrar staff de montaje</h3>
                {montaje.map((m, idx) => (
                  <MemberRow key={idx} m={m} idx={idx} total={montaje.length}
                    onChange={(f,v)=>updateMember(idx,f,v)}
                    onRemove={()=>setMontaje(p=>p.filter((_,i)=>i!==idx))}
                    onUpload={(f,field)=>uploadFile(f,idx,field)}
                    uploadingKey={uploadingKey}
                  />
                ))}
                <button onClick={()=>setMontaje(p=>[...p,empty()])} style={{width:'100%',padding:'8px',borderRadius:8,background:'transparent',border:`1px dashed rgba(0,188,212,0.4)`,color:CYAN,cursor:'pointer',fontSize:12,marginBottom:12}}>+ Agregar empleado</button>
                <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:12}}>
                  <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{marginTop:2,flexShrink:0}}/>
                  <span style={{color:'rgba(255,255,255,0.6)',fontSize:12}}>Certifico que la información es correcta. Una vez enviada <strong style={{color:'white'}}>no podrá modificarse</strong>. Esta lista será entregada a COMFAMA el 20 de julio.</span>
                </div>
                {saveError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'8px 12px',color:'#f87171',fontSize:12,marginBottom:12}}>{saveError}</div>}
                <button onClick={saveMontaje} disabled={saving} style={{width:'100%',padding:13,borderRadius:10,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:14,opacity:saving?0.7:1}}>
                  {saving?'⏳ Guardando...':`✅ Registrar ${montaje.length} empleado${montaje.length>1?'s':''}`}
                </button>
              </div>
            )}
          </>
        )}

        <p style={{color:'rgba(255,255,255,0.2)',fontSize:11,textAlign:'center',marginTop:24}}>Latido y Huella 2026 · eventos@latidoyhuella.co · WhatsApp +57 333 277 7912</p>
      </div>

      {/* Modal contrato */}
      {showContractModal&&empresa?.contract_token&&(
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column'as const,alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{width:'100%',maxWidth:720,background:'white',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column'as const,height:'90vh'}}>
            <div style={{background:NAVY,padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
              <span style={{color:'white',fontWeight:700,fontSize:14}}>📄 Contrato — {empresa.brand_name}</span>
              <button onClick={()=>setShowContractModal(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:8,padding:'4px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>✕ Cerrar</button>
            </div>
            <iframe key={empresa.contract_token} src={`${window.location.origin}/contrato/${empresa.contract_token}`} style={{flex:1,border:'none',width:'100%'}} title="Contrato" allow="camera"/>
          </div>
        </div>
      )}
    </div>
  )
}