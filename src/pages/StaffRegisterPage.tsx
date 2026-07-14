import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

interface Empresa { id:string; brand_name:string; responsible_name:string; email:string; tipo:'expositor'|'patrocinador'; stand_id?:string; contract_token?:string; contract_signed_at?:string }
interface StaffMember { full_name:string; cedula:string; cedula_url:string; phone:string; eps_name:string; arl_name:string; arl_eps_url:string }
const emptyMember = (): StaffMember => ({ full_name:'', cedula:'', cedula_url:'', phone:'', eps_name:'', arl_name:'', arl_eps_url:'' })

type StaffType = 'montaje' | 'servicio'

export function StaffRegisterPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [selected, setSelected] = useState<Empresa|null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<StaffType|null>(null)
  const [montajeList, setMontajeList] = useState<StaffMember[]>([emptyMember()])
  const [servicioList, setServicioList] = useState<StaffMember[]>([emptyMember()])
  const [montajeSaved, setMontajeSaved] = useState(false)
  const [servicioSaved, setServicioSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingKey, setUploadingKey] = useState<string|null>(null)
  const [termsChecked, setTermsChecked] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: exps }, { data: spons }] = await Promise.all([
        supabase.from('expositor_reservations').select('id,brand_name,responsible_name,email,stand_id,contract_token,contract_signed_at,category').in('status',['paid','approved']),
        supabase.from('sponsor_inquiries').select('id,company_name,contact_name,email,contract_token,contract_signed_at').in('status',['paid','approved'])
      ])
      const list: Empresa[] = [
        ...(exps||[]).map((e:any) => ({ id:e.id, brand_name:e.brand_name, responsible_name:e.responsible_name, email:e.email, tipo:'expositor' as const, stand_id:e.stand_id, contract_token:e.contract_token, contract_signed_at:e.contract_signed_at })),
        ...(spons||[]).map((s:any) => ({ id:s.id, brand_name:s.company_name, responsible_name:s.contact_name, email:s.email, tipo:'patrocinador' as const, contract_token:s.contract_token, contract_signed_at:s.contract_signed_at }))
      ]
      setEmpresas(list)
      setLoading(false)
    }
    load()
  }, [])

  const uploadFile = async (file: File, key: string, onDone: (url:string)=>void) => {
    setUploadingKey(key)
    const ext = file.name.split('.').pop()
    const path = `staff-docs/${selected?.id}_${Date.now()}_${key}.${ext}`
    const { error: upErr } = await supabase.storage.from('expositor-documents').upload(path, file, { upsert: true })
    if (upErr) { setError('Error al subir archivo'); setUploadingKey(null); return }
    const { data: urlData } = supabase.storage.from('expositor-documents').getPublicUrl(path)
    onDone(urlData.publicUrl)
    setUploadingKey(null)
  }

  const updateMember = (list: StaffMember[], setList: React.Dispatch<React.SetStateAction<StaffMember[]>>, idx: number, field: keyof StaffMember, value: string) => {
    setList(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const saveStaff = async (type: StaffType) => {
    const list = type === 'montaje' ? montajeList : servicioList
    for (let i = 0; i < list.length; i++) {
      if (!list[i].full_name || !list[i].cedula || !list[i].phone) {
        setError(`Empleado ${i+1}: nombre, cédula y teléfono son obligatorios`); return
      }
    }
    if (!termsChecked) { setError('Debes aceptar los términos y condiciones'); return }
    setSaving(true); setError('')
    const inserts = list.map(m => ({
      expositor_id: selected?.tipo === 'expositor' ? selected.id : null,
      sponsor_id: selected?.tipo === 'patrocinador' ? selected.id : null,
      full_name: m.full_name, cedula: m.cedula, cedula_url: m.cedula_url,
      phone: m.phone, eps_name: m.eps_name, arl_name: m.arl_name,
      arl_eps_url: m.arl_eps_url, arl_eps: `${m.eps_name} / ${m.arl_name}`,
      staff_type: type
    }))
    const { error: insErr } = await supabase.from('stand_staff').insert(inserts)
    if (insErr) { setError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }
    // Enviar email de confirmación
    try {
      const names = list.map(m => m.full_name).join(', ')
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5"><div style="background:#0D1B6E;padding:32px;text-align:center;border-radius:16px 16px 0 0"><img src="${LOGO_URL}" style="height:55px"/></div><div style="background:white;padding:32px;border-radius:0 0 16px 16px"><h2 style="color:#0D1B6E">¡Registro confirmado! ✅</h2><p>Se registraron <strong>${list.length} empleado${list.length>1?'s':''}</strong> de <strong>${type === 'montaje' ? 'montaje' : 'servicio'}</strong> para <strong>${selected?.brand_name}</strong>.</p><p style="color:#555;font-size:14px"><strong>Personal registrado:</strong><br/>${names}</p><p style="color:#888;font-size:12px">Latido y Huella 2026 · 26 Jul · Llanogrande · eventos@latidoyhuella.co</p></div></div>`
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selected?.email, subject: `✅ Staff ${type} registrado — Latido y Huella 2026`, html, from: 'eventos@latidoyhuella.co', type: 'staff' })
      })
    } catch(_e) {}
    if (type === 'montaje') setMontajeSaved(true)
    else setServicioSaved(true)
    setActiveModal(null); setSaving(false)
  }

  const inp = (style={}) => ({ style: { width:'100%', fontSize:13, padding:'7px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'white', outline:'none', boxSizing:'border-box' as const, ...style } })

  const UploadBtn = ({ value, onUrl, keyId }: { value:string; onUrl:(u:string)=>void; keyId:string }) => (
    value
      ? <a href={value} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'#4ade80',whiteSpace:'nowrap' as const}}>✅ Ver</a>
      : <label style={{cursor:'pointer',padding:'6px 8px',background:'rgba(0,188,212,0.15)',border:'1px solid rgba(0,188,212,0.3)',borderRadius:6,display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap' as const}}>
          <span style={{fontSize:11,color:CYAN}}>{uploadingKey===keyId?'⏳':'📷'}</span>
          <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0],keyId,onUrl)}/>
        </label>
  )

  const MemberForm = ({ list, setList, type }: { list:StaffMember[]; setList:React.Dispatch<React.SetStateAction<StaffMember[]>>; type:StaffType }) => (
    <div>
      {list.map((m, idx) => (
        <div key={idx} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'12px 14px',marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:12,fontWeight:600}}>Empleado {idx+1}</span>
            {list.length>1&&<button onClick={()=>setList(p=>p.filter((_,i)=>i!==idx))} style={{background:'rgba(239,68,68,0.1)',border:'none',color:'#f87171',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11}}>✕</button>}
          </div>
          {/* Fila 1 */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1.5fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
            <input {...inp()} placeholder="Nombre completo *" value={m.full_name} onChange={e=>updateMember(list,setList,idx,'full_name',e.target.value)}/>
            <input {...inp()} placeholder="Cédula *" value={m.cedula} onChange={e=>updateMember(list,setList,idx,'cedula',e.target.value)}/>
            <input {...inp()} placeholder="Teléfono *" value={m.phone} onChange={e=>updateMember(list,setList,idx,'phone',e.target.value)}/>
            <UploadBtn value={m.cedula_url} onUrl={url=>updateMember(list,setList,idx,'cedula_url',url)} keyId={`${idx}-cedula`}/>
          </div>
          {/* Fila 2 */}
          <div style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr auto',gap:8,alignItems:'center'}}>
            <input {...inp()} placeholder="EPS" value={m.eps_name} onChange={e=>updateMember(list,setList,idx,'eps_name',e.target.value)}/>
            <input {...inp()} placeholder="ARL" value={m.arl_name} onChange={e=>updateMember(list,setList,idx,'arl_name',e.target.value)}/>
            <UploadBtn value={m.arl_eps_url} onUrl={url=>updateMember(list,setList,idx,'arl_eps_url',url)} keyId={`${idx}-arl`}/>
          </div>
        </div>
      ))}
      <button onClick={()=>setList(p=>[...p,emptyMember()])} style={{width:'100%',padding:'8px',borderRadius:8,background:'transparent',border:'1px dashed rgba(0,188,212,0.4)',color:CYAN,cursor:'pointer',fontSize:12,marginBottom:12}}>+ Agregar empleado</button>
      {type==='servicio'&&servicioList.length>=4&&<p style={{color:'#fbbf24',fontSize:11,textAlign:'center',marginBottom:8}}>⚠️ Máximo 4 empleados de servicio</p>}
      <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:12}}>
        <input type="checkbox" checked={termsChecked} onChange={e=>setTermsChecked(e.target.checked)} style={{marginTop:2,flexShrink:0}}/>
        <span style={{color:'rgba(255,255,255,0.6)',fontSize:12}}>Certifico que la información es correcta y acepto los términos de Latido y Huella 2026</span>
      </div>
      {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'8px 12px',color:'#f87171',fontSize:12,marginBottom:12}}>{error}</div>}
      <button onClick={()=>saveStaff(type)} disabled={saving} style={{width:'100%',padding:12,borderRadius:10,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:14,opacity:saving?0.7:1}}>
        {saving?'⏳ Guardando...':`✅ Registrar ${list.length} empleado${list.length>1?'s':''}`}
      </button>
    </div>
  )

  if (loading) return <div style={{minHeight:'100vh',background:NAVY,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'white',textAlign:'center'}}><div style={{fontSize:40}}>⏳</div><p>Cargando...</p></div></div>

  return (
    <div style={{minHeight:'100vh',background:'#080d22',paddingBottom:60}}>
      {/* Header */}
      <div style={{background:NAVY,padding:'28px 24px',textAlign:'center'}}>
        <img src={LOGO_URL} style={{height:52,marginBottom:12}} alt="Latido y Huella"/>
        <h1 style={{color:'white',fontSize:18,fontWeight:700,margin:'0 0 4px'}}>Registro de Personal</h1>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,margin:0}}>Latido y Huella 2026 · Llanogrande</p>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>
        {/* Selector empresa */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:16,marginBottom:20}}>
          <label style={{color:'rgba(255,255,255,0.6)',fontSize:12,display:'block',marginBottom:6}}>Selecciona tu empresa</label>
          <select value={selected?.id||''} onChange={e=>{const emp=empresas.find(x=>x.id===e.target.value)||null; setSelected(emp); setMontajeList([emptyMember()]); setServicioList([emptyMember()]); setMontajeSaved(false); setServicioSaved(false)}}
            style={{width:'100%',fontSize:14,padding:'9px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'white',outline:'none'}}>
            <option value="">-- Selecciona tu empresa --</option>
            {empresas.map(e=><option key={e.id} value={e.id}>{e.brand_name} {e.tipo==='expositor'?'🏪':'⭐'}</option>)}
          </select>

          {!selected&&(
            <div style={{marginTop:12,padding:12,background:'rgba(0,188,212,0.08)',border:'1px solid rgba(0,188,212,0.2)',borderRadius:10,textAlign:'center'}}>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,margin:'0 0 10px'}}>¿Tu empresa no aparece en la lista?</p>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
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

          {selected&&(
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap' as const,alignItems:'center'}}>
              <span style={{background:'rgba(0,188,212,0.15)',color:CYAN,fontSize:11,padding:'3px 10px',borderRadius:20}}>{selected.tipo==='expositor'?'🏪 Expositor':'⭐ Patrocinador'}</span>
              {selected.stand_id&&<span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:11,padding:'3px 10px',borderRadius:20}}>Stand {selected.stand_id}</span>}
              <span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:11,padding:'3px 10px',borderRadius:20}}>{selected.responsible_name}</span>
            </div>
          )}
        </div>

        {selected&&(
          <>
            {/* 3 botones de acción */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12,marginBottom:20}}>

              {/* Staff montaje */}
              <div onClick={()=>!montajeSaved&&setActiveModal(activeModal==='montaje'?null:'montaje')}
                style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${montajeSaved?'#4CAF50':'rgba(239,68,68,0.4)'}`,borderRadius:12,padding:14,cursor:montajeSaved?'default':'pointer',transition:'all 0.2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <div style={{color:'white',fontSize:14,fontWeight:600}}>🔧 Staff de montaje</div>
                    <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginTop:2}}>Personal de montaje y desmontaje · ilimitado</div>
                  </div>
                  <span style={{background:montajeSaved?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:montajeSaved?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,whiteSpace:'nowrap' as const,flexShrink:0}}>
                    {montajeSaved?`✅ ${montajeList.length} registrados`:'🔴 Pendiente'}
                  </span>
                </div>
                <div style={{color:'#fbbf24',fontSize:11}}>📅 Fecha límite: 20 de julio</div>
                {montajeSaved&&<button onClick={(e)=>{e.stopPropagation();window.open(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-staff-pdf?empresa_id=${selected.id}&tipo=montaje`)}} style={{marginTop:8,width:'100%',padding:'6px',borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'white',cursor:'pointer',fontSize:12}}>📥 Descargar lista PDF</button>}
              </div>

              {/* Staff servicio */}
              <div onClick={()=>!servicioSaved&&setActiveModal(activeModal==='servicio'?null:'servicio')}
                style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${servicioSaved?'#4CAF50':'rgba(239,68,68,0.4)'}`,borderRadius:12,padding:14,cursor:servicioSaved?'default':'pointer',transition:'all 0.2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <div style={{color:'white',fontSize:14,fontWeight:600}}>👔 Staff de servicio</div>
                    <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginTop:2}}>Personal el día del evento · máx 4</div>
                  </div>
                  <span style={{background:servicioSaved?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:servicioSaved?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,whiteSpace:'nowrap' as const,flexShrink:0}}>
                    {servicioSaved?`✅ ${servicioList.length}/4`:`🔴 0/4`}
                  </span>
                </div>
                <div style={{color:'#fbbf24',fontSize:11}}>📅 Fecha límite: 22 de julio</div>
                {servicioSaved&&<button onClick={(e)=>{e.stopPropagation();window.open(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-staff-pdf?empresa_id=${selected.id}&tipo=servicio`)}} style={{marginTop:8,width:'100%',padding:'6px',borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'white',cursor:'pointer',fontSize:12}}>📥 Descargar lista PDF</button>}
              </div>

              {/* Contrato */}
              <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${selected.contract_signed_at?'#4CAF50':'rgba(239,68,68,0.4)'}`,borderRadius:12,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <div style={{color:'white',fontSize:14,fontWeight:600}}>📄 Contrato</div>
                    <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginTop:2}}>Consentimiento de {selected.tipo}</div>
                  </div>
                  <span style={{background:selected.contract_signed_at?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:selected.contract_signed_at?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,whiteSpace:'nowrap' as const,flexShrink:0}}>
                    {selected.contract_signed_at?'✅ Firmado':'🔴 Pendiente'}
                  </span>
                </div>
                <div style={{color:'#fbbf24',fontSize:11,marginBottom:8}}>📅 Fecha límite: 22 de julio</div>
                {selected.contract_token&&!selected.contract_signed_at&&(
                  <a href={`${window.location.origin}/contrato/${selected.contract_token}`} target="_blank" rel="noopener noreferrer"
                    style={{display:'block',textAlign:'center',padding:'7px',borderRadius:8,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',textDecoration:'none',fontSize:13,fontWeight:700}}>
                    ✍️ Firmar contrato
                  </a>
                )}
                {selected.contract_signed_at&&(
                  <div style={{display:'flex',gap:6}}>
                    <a href={`${window.location.origin}/contrato/${selected.contract_token}`} target="_blank" rel="noopener noreferrer"
                      style={{flex:1,display:'block',textAlign:'center',padding:'7px',borderRadius:8,background:'rgba(255,255,255,0.08)',color:'white',textDecoration:'none',fontSize:12,border:'1px solid rgba(255,255,255,0.15)'}}>
                      👁️ Ver contrato
                    </a>
                    <a href={`${window.location.origin}/ecard/${selected.id}`} target="_blank" rel="noopener noreferrer"
                      style={{flex:1,display:'block',textAlign:'center',padding:'7px',borderRadius:8,background:'rgba(255,255,255,0.08)',color:'white',textDecoration:'none',fontSize:12,border:'1px solid rgba(255,255,255,0.15)'}}>
                      🎟️ Ver E-Card
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario staff */}
            {activeModal&&(
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:20,marginBottom:20}}>
                <h3 style={{color:'white',fontSize:15,fontWeight:700,margin:'0 0 16px'}}>
                  {activeModal==='montaje'?'🔧 Registrar staff de montaje':'👔 Registrar staff de servicio'}
                </h3>
                <MemberForm list={activeModal==='montaje'?montajeList:servicioList} setList={activeModal==='montaje'?setMontajeList:setServicioList} type={activeModal}/>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}