import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'
const WA = '+573332777912'

interface Empresa {
  id:string; brand_name:string; responsible_name:string; email:string;
  tipo:'expositor'|'patrocinador'; stand_id?:string; contract_token?:string;
  contract_signed_at?:string; nit?:string; phone?:string
}
interface StaffMember {
  full_name:string; cedula:string; cedula_url:string;
  phone:string; eps_name:string; arl_name:string; arl_eps_url:string
}
const empty = (): StaffMember => ({ full_name:'', cedula:'', cedula_url:'', phone:'', eps_name:'', arl_name:'', arl_eps_url:'' })

const inp = {
  width:'100%', fontSize:13, padding:'8px 12px', borderRadius:8,
  border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)',
  color:'white', outline:'none', boxSizing:'border-box' as const
}

const inpDark = {
  ...inp, background:'rgba(255,255,255,0.05)', color:'white'
}

function UploadBtn({ label, value, uploading, onFile }: {
  label:string; value:string; uploading:boolean; onFile:(f:File)=>void
}) {
  if (value) return (
    <div style={{display:'flex',alignItems:'center',gap:6}}>
      <span style={{fontSize:11,color:'#4ade80'}}>✅ Subido</span>
      <a href={value} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:CYAN}}>Ver</a>
    </div>
  )
  return (
    <label style={{cursor:'pointer',padding:'7px 12px',background:'rgba(0,188,212,0.1)',border:'1px solid rgba(0,188,212,0.3)',borderRadius:8,display:'inline-flex',alignItems:'center',gap:6,fontSize:12,color:CYAN}}>
      {uploading ? '⏳ Subiendo...' : label}
      <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&onFile(e.target.files[0])}/>
    </label>
  )
}

function MemberRow({ m, idx, total, onChange, onRemove, onUpload, uploadingKey }: {
  m:StaffMember; idx:number; total:number;
  onChange:(f:keyof StaffMember,v:string)=>void;
  onRemove:()=>void;
  onUpload:(f:File,field:'cedula_url'|'arl_eps_url')=>void;
  uploadingKey:string|null
}) {
  return (
    <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'14px',marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{color:'white',fontSize:13,fontWeight:700}}>Empleado {idx+1}</span>
        {total>1&&<button onClick={onRemove} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',borderRadius:6,padding:'3px 10px',cursor:'pointer',fontSize:12}}>✕ Eliminar</button>}
      </div>
      {/* Fila 1: Nombre · Cédula · Foto CC */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1fr',gap:10,marginBottom:10,alignItems:'end'}}>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>Nombre completo *</div>
          <input style={inp} placeholder="Nombre y apellidos" value={m.full_name} onChange={e=>onChange('full_name',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>Cédula *</div>
          <input style={inp} placeholder="Número de cédula" value={m.cedula} onChange={e=>onChange('cedula',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>📷 Foto cédula</div>
          <UploadBtn label="📷 Subir CC" value={m.cedula_url} uploading={uploadingKey===`${idx}-cc`} onFile={f=>onUpload(f,'cedula_url')}/>
        </div>
      </div>
      {/* Fila 2: Teléfono · EPS · ARL · Doc seguro */}
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 1.5fr 1fr',gap:10,alignItems:'end'}}>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>Teléfono *</div>
          <input style={inp} placeholder="300 000 0000" value={m.phone} onChange={e=>onChange('phone',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>EPS</div>
          <input style={inp} placeholder="Nombre EPS" value={m.eps_name} onChange={e=>onChange('eps_name',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>ARL</div>
          <input style={inp} placeholder="Nombre ARL" value={m.arl_name} onChange={e=>onChange('arl_name',e.target.value)}/>
        </div>
        <div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>📄 Doc seguro</div>
          <UploadBtn label="📄 Subir ARL/EPS" value={m.arl_eps_url} uploading={uploadingKey===`${idx}-arl`} onFile={f=>onUpload(f,'arl_eps_url')}/>
        </div>
      </div>
    </div>
  )
}

const DEADLINE_MONTAJE = new Date('2026-07-22T23:59:59-05:00')
const isPastDeadline = () => new Date() > DEADLINE_MONTAJE

export function StaffRegisterPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(false)
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
  const [vehicle, setVehicle] = useState({ placa:'', tipo_vehiculo:'', marca:'' })
  const [uploadingKey, setUploadingKey] = useState<string|null>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [regTipo, setRegTipo] = useState<'expositor'|'patrocinador'>('expositor')
  const [regForm, setRegForm] = useState({ brand_name:'', responsible_name:'', document_id:'', email:'', phone:'' })
  const [regDocs, setRegDocs] = useState({ cedula_url:'', rut_url:'', camara_url:'' })
  const [regUploading, setRegUploading] = useState<string|null>(null)
  const [regSaving, setRegSaving] = useState(false)
  const [regError, setRegError] = useState('')
  const filteredEmpresas = empresas.filter(e => e.brand_name.toLowerCase().includes(search.toLowerCase()))

  const loadEmpresas = async () => {
    const [{ data: exps }, { data: spons }] = await Promise.all([
      supabase.from('expositor_reservations').select('id,brand_name,responsible_name,email,phone,stand_id,contract_token,contract_signed_at,document_id').in('status',['paid','approved','pending_payment']),
      supabase.from('sponsor_inquiries').select('id,company_name,contact_name,email,phone,contract_token,contract_signed_at,document_id').in('status',['paid','approved','pending_payment'])
    ])
    const list: Empresa[] = [
      ...(exps||[]).map((e:any) => ({ id:e.id, brand_name:e.brand_name, responsible_name:e.responsible_name, email:e.email, phone:e.phone, tipo:'expositor'as const, stand_id:e.stand_id, contract_token:e.contract_token, contract_signed_at:e.contract_signed_at, nit:e.document_id })),
      ...(spons||[]).map((s:any) => ({ id:s.id, brand_name:s.company_name, responsible_name:s.contact_name, email:s.email, phone:s.phone, tipo:'patrocinador'as const, contract_token:s.contract_token, contract_signed_at:s.contract_signed_at, nit:s.document_id }))
    ]
    return list
  }

  useEffect(() => {
    const init = async () => {
      const list = await loadEmpresas()
      setEmpresas(list)
      const savedId = sessionStorage.getItem('staff_verified_id')
      if (savedId) {
        const emp = list.find(e => e.id === savedId)
        if (emp) {
          setEmpresa(emp)
          setSearch(emp.brand_name)
          setVerified(true)
          await loadExistingStaff(savedId)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const loadExistingStaff = async (empId: string) => {
    const { data } = await supabase.from('stand_staff').select('*')
      .or(`expositor_id.eq.${empId},sponsor_id.eq.${empId}`)
      .eq('staff_type','montaje')
      .order('created_at',{ascending:true})
    if (data && data.length > 0) {
      setExistingMontaje(data)
      setMontajeSaved(true)
      setMontaje(data.map((s:any) => ({
        full_name: s.full_name||'', cedula: s.cedula||'', cedula_url: s.cedula_url||'',
        phone: s.phone||'', eps_name: s.eps_name||'', arl_name: s.arl_name||'', arl_eps_url: s.arl_eps_url||''
      })))
    } else {
      setExistingMontaje([])
      setMontajeSaved(false)
    }
  }

  const refresh = async () => {
    if (!empresa) return
    setLoading(true)
    const list = await loadEmpresas()
    setEmpresas(list)
    const updated = list.find(e => e.id === empresa.id)
    if (updated) setEmpresa(updated)
    await loadExistingStaff(empresa.id)
    setLoading(false)
  }

  const selectEmpresa = (emp: Empresa) => {
    setEmpresa(emp)
    setSearch(emp.brand_name)
    setShowList(false)
    setVerified(false)
    setNitInput('')
    setVerifyError('')
    setExistingMontaje([])
    setMontajeSaved(false)
    sessionStorage.removeItem('staff_verified_id')
  }

  const handleVerify = async () => {
    if (!empresa) return
    const input = nitInput.trim().replace(/[.\-\s]/g,'').toLowerCase()
    const nit = (empresa.nit||'').trim().replace(/[.\-\s]/g,'').toLowerCase()
    const email = (empresa.email||'').trim().toLowerCase()
    const phone = (empresa.phone||'').trim().replace(/[.\-\s+]/g,'')
    const inputPhone = nitInput.trim().replace(/[.\-\s+]/g,'')
    if ((nit&&input===nit)||(email&&nitInput.trim().toLowerCase()===email)||(phone&&inputPhone===phone)) {
      setVerified(true)
      setVerifyError('')
      sessionStorage.setItem('staff_verified_id', empresa.id)
      await loadExistingStaff(empresa.id)
    } else {
      setVerifyError('Dato incorrecto. Verifica el NIT, email o número de celular registrado.')
    }
  }

  const uploadFile = async (file: File, idx: number, field: 'cedula_url'|'arl_eps_url') => {
    const key = `${idx}-${field==='cedula_url'?'cc':'arl'}`
    setUploadingKey(key)
    const ext = file.name.split('.').pop()
    const path = `staff-docs/${empresa?.id}_${Date.now()}_${key}.${ext}`
    await supabase.storage.from('expositor-documents').upload(path, file, { upsert:true })
    const { data } = supabase.storage.from('expositor-documents').getPublicUrl(path)
    setMontaje(prev => prev.map((m,i) => i===idx ? {...m,[field]:data.publicUrl} : m))
    setUploadingKey(null)
  }

  const uploadRegDoc = async (file: File, field: 'cedula_url'|'rut_url'|'camara_url') => {
    setRegUploading(field)
    const ext = file.name.split('.').pop()
    const path = `reg-docs/${Date.now()}_${field}.${ext}`
    await supabase.storage.from('expositor-documents').upload(path, file, { upsert:true })
    const { data } = supabase.storage.from('expositor-documents').getPublicUrl(path)
    setRegDocs(prev => ({...prev,[field]:data.publicUrl}))
    setRegUploading(null)
  }

  const updateMember = (idx: number, field: keyof StaffMember, value: string) => {
    setMontaje(prev => prev.map((m,i) => i===idx ? {...m,[field]:value} : m))
  }

  const saveMontaje = async () => {
    setSaveError('')
    for (let i=0; i<montaje.length; i++) {
      if (!montaje[i].full_name||!montaje[i].cedula||!montaje[i].phone) {
        setSaveError(`Empleado ${i+1}: nombre, cédula y teléfono son obligatorios`); return
      }
    }
    if (!terms) { setSaveError('Debes aceptar los términos'); return }
    setSaving(true)
    // Eliminar registros anteriores antes de guardar los nuevos
    await supabase.from('stand_staff')
      .delete()
      .or(`expositor_id.eq.${empresa!.id},sponsor_id.eq.${empresa!.id}`)
      .eq('staff_type','montaje')

    const inserts = montaje.map(m => ({      expositor_id: empresa?.tipo==='expositor' ? empresa.id : null,
      sponsor_id: empresa?.tipo==='patrocinador' ? empresa.id : null,
      full_name:m.full_name, cedula:m.cedula, cedula_url:m.cedula_url,
      phone:m.phone, eps_name:m.eps_name, arl_name:m.arl_name,
      arl_eps_url:m.arl_eps_url, arl_eps:`${m.eps_name} / ${m.arl_name}`,
      staff_type:'montaje'
    }))
    const { error } = await supabase.from('stand_staff').insert(inserts)
    if (error) { setSaveError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }
    // Email con tabla
    try {
      const rows = montaje.map((m,i) => `
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:10px 12px;font-size:13px;color:#555">${i+1}</td>
          <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#0D1B6E">${m.full_name}</td>
          <td style="padding:10px 12px;font-size:13px;color:#555">${m.cedula}</td>
          <td style="padding:10px 12px;font-size:13px;color:#555">${m.phone}</td>
          <td style="padding:10px 12px;font-size:13px;color:#555">${m.eps_name||'—'}</td>
          <td style="padding:10px 12px;font-size:13px;color:#555">${m.arl_name||'—'}</td>
          <td style="padding:10px 12px;font-size:13px">
            ${m.cedula_url?`<a href="${m.cedula_url}" style="color:#00BCD4;font-size:12px">📋 CC</a>`:'—'}
            ${m.arl_eps_url?` · <a href="${m.arl_eps_url}" style="color:#00BCD4;font-size:12px">📋 ARL</a>`:''}
          </td>
        </tr>`).join('')
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#f5f5f5">
          <div style="background:#0D1B6E;padding:32px;text-align:center;border-radius:16px 16px 0 0">
            <img src="${LOGO}" style="height:55px"/>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 16px 16px">
            <h2 style="color:#0D1B6E;margin:0 0 6px">✅ Staff de montaje registrado</h2>
            <p style="color:#555;font-size:14px;margin:0 0 6px">Empresa: <strong>${empresa?.brand_name}</strong>${empresa?.stand_id?' · Stand: '+empresa.stand_id:''}</p>
            <p style="color:#555;font-size:14px;margin:0 0 24px">${montaje.length} empleado${montaje.length>1?'s':''} registrado${montaje.length>1?'s':''}</p>
            <div style="background:#fff3e0;border-left:4px solid #FFB300;padding:14px 16px;border-radius:0 10px 10px 0;margin:0 0 24px">
              <p style="color:#e65100;font-weight:700;margin:0 0 4px;font-size:14px">⚠️ Fecha límite: 22 de julio de 2026</p>
              <p style="color:#666;font-size:13px;margin:0">Esta lista no podrá modificarse después de esta fecha. Para cambios: WhatsApp +57 333 277 7912</p>
            </div>
            <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
              <thead>
                <tr style="background:#0D1B6E">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">#</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">Nombre</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">Cédula</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">Teléfono</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">EPS</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">ARL</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:white;font-weight:600">Docs</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="color:#888;font-size:12px;text-align:center;margin:0">Latido y Huella 2026 · 26 de julio · Llanogrande, Antioquia · eventos@latidoyhuella.co</p>
          </div>
        </div>`
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method:'POST',
        headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
        body: JSON.stringify({ to:empresa?.email, subject:`✅ Staff de montaje registrado — ${empresa?.brand_name} — Latido y Huella 2026`, html, from:'eventos@latidoyhuella.co', type:'staff' })
      })
    } catch(_e){}

    // Guardar vehículo si se ingresó
    if (vehicle.placa && vehicle.tipo_vehiculo && vehicle.marca) {
      await supabase.from('stand_vehicles').insert({
        expositor_id: empresa?.tipo==='expositor' ? empresa.id : null,
        sponsor_id: empresa?.tipo==='patrocinador' ? empresa.id : null,
        placa: vehicle.placa.toUpperCase(),
        tipo_vehiculo: vehicle.tipo_vehiculo,
        marca: vehicle.marca,
      })
    }

    await loadExistingStaff(empresa!.id)
    setSaving(false)
  }

  const registerNewEmpresa = async () => {
    setRegError('')
    if (!regForm.brand_name||!regForm.responsible_name||!regForm.email) {
      setRegError('Nombre empresa, responsable y email son obligatorios'); return
    }
    setRegSaving(true)
    const token = crypto.randomUUID()
    const table = regTipo==='expositor' ? 'expositor_reservations' : 'sponsor_inquiries'
    const insData = regTipo==='expositor'
      ? { brand_name:regForm.brand_name, responsible_name:regForm.responsible_name, document_id:regForm.document_id, email:regForm.email, phone:regForm.phone, cedula_url:regDocs.cedula_url, rut_url:regDocs.rut_url, camara_comercio_url:regDocs.camara_url, contract_token:token, status:'approved', category:'comercial' }
      : { company_name:regForm.brand_name, contact_name:regForm.responsible_name, document_id:regForm.document_id, email:regForm.email, phone:regForm.phone, cedula_url:regDocs.cedula_url, rut_url:regDocs.rut_url, contract_token:token, status:'approved' }
    const { data, error } = await supabase.from(table).insert(insData).select().single()
    if (error||!data) { setRegError('Error al registrar. Intenta de nuevo.'); setRegSaving(false); return }
    const list = await loadEmpresas()
    setEmpresas(list)
    const newEmp = list.find(e=>e.id===data.id)
    if (newEmp) {
      setEmpresa(newEmp)
      setSearch(newEmp.brand_name)
      setVerified(true)
      sessionStorage.setItem('staff_verified_id', newEmp.id)
    }
    setShowRegisterModal(false)
    setRegSaving(false)
    setRegForm({ brand_name:'', responsible_name:'', document_id:'', email:'', phone:'' })
    setRegDocs({ cedula_url:'', rut_url:'', camara_url:'' })
  }

  const printPDF = async () => {
    if (!empresa||!existingMontaje.length) return
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-staff-pdf?empresa_id=${empresa.id}&tipo=montaje`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
    })
    if (!res.ok) { alert('Error generando PDF. Intenta de nuevo.'); return }
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Staff-Montaje-${empresa.brand_name.replace(/\s+/g,'-')}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:NAVY,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'white',textAlign:'center'}}><div style={{fontSize:40,marginBottom:12}}>⏳</div><p>Cargando...</p></div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#080d22',paddingBottom:60}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg, #0D1B6E 0%, #0a1550 60%, #051030 100%)`,padding:'36px 24px 28px',textAlign:'center',position:'relative'as const,overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'rgba(0,188,212,0.06)'}}/>
        <div style={{position:'absolute',bottom:-30,left:-30,width:120,height:120,borderRadius:'50%',background:'rgba(0,188,212,0.04)'}}/>
        <img src={LOGO} style={{height:52,marginBottom:16,position:'relative'}} alt="Latido y Huella"/>
        <div style={{position:'relative'}}>
          <h1 style={{color:'white',fontSize:22,fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.3px'}}>Registro Administrativo</h1>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:12,margin:'0 0 16px'}}>Latido y Huella 2026 · Llanogrande, Antioquia</p>
          <div style={{display:'inline-flex',alignItems:'center',gap:16,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:30,padding:'8px 20px'}}>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>📅 <strong style={{color:'white'}}>26 Jul 2026</strong></span>
            <span style={{width:1,height:14,background:'rgba(255,255,255,0.15)'}}/>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>📍 <strong style={{color:'white'}}>COMFAMA Llanogrande</strong></span>
            <span style={{width:1,height:14,background:'rgba(255,255,255,0.15)'}}/>
            <span style={{color:CYAN,fontSize:12,fontWeight:700}}>🔧 Montaje · 📄 Contrato</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>

        {/* 3 Pasos */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:20}}>
          {[
            { num:'①', title:'Busca tu empresa', desc:'Escribe el nombre de tu stand o empresa en el buscador para encontrarla', color:'#00BCD4' },
            { num:'②', title:'¿No apareces?', desc:'Regístrate aquí como Expositor o Patrocinador — el proceso es rápido', color:'#4ade80' },
            { num:'③', title:'Completa cada sección', desc:'Staff de montaje · Contrato · Puedes volver cuando quieras a revisar tu información', color:'#fbbf24' },
          ].map(s=>(
            <div key={s.num} style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${s.color}25`,borderRadius:12,padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{background:`${s.color}20`,border:`1px solid ${s.color}40`,borderRadius:10,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,color:s.color,fontWeight:800}}>{s.num}</div>
              <div>
                <div style={{color:'white',fontSize:13,fontWeight:700,marginBottom:4}}>{s.title}</div>
                <div style={{color:'rgba(255,255,255,0.45)',fontSize:12,lineHeight:1.5}}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selector empresa */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:8}}>Busca tu empresa o stand</div>
          <div style={{position:'relative'}}>
            <input style={{...inp,fontSize:14,padding:'10px 14px'}}
              placeholder="Escribe el nombre de tu empresa..."
              value={search}
              onChange={e=>{setSearch(e.target.value);setShowList(true);if(!e.target.value){setEmpresa(null);setVerified(false);sessionStorage.removeItem('staff_verified_id')}}}
              onFocus={()=>setShowList(true)}/>
            {showList&&search&&filteredEmpresas.length>0&&(
              <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1a2050',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,zIndex:100,maxHeight:220,overflowY:'auto'as const,marginTop:4,boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>
                {filteredEmpresas.map(e=>(
                  <div key={e.id} onClick={()=>selectEmpresa(e)}
                    style={{padding:'11px 16px',cursor:'pointer',color:'white',fontSize:13,borderBottom:'1px solid rgba(255,255,255,0.06)'}}
                    onMouseOver={el=>(el.currentTarget.style.background='rgba(255,255,255,0.08)')}
                    onMouseOut={el=>(el.currentTarget.style.background='transparent')}>
                    <span style={{fontWeight:600}}>{e.brand_name}</span>
                    <span style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginLeft:8}}>{e.tipo==='expositor'?'🏪 Expositor':'⭐ Patrocinador'}{e.stand_id?' · Stand '+e.stand_id:''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* No encontrada */}
          {search&&filteredEmpresas.length===0&&(
            <div style={{marginTop:14,padding:14,background:'rgba(0,188,212,0.06)',border:'1px solid rgba(0,188,212,0.2)',borderRadius:10,textAlign:'center'}}>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,margin:'0 0 12px'}}>¿Tu empresa no aparece? Regístrate aquí</p>
              <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'as const}}>
                <button onClick={()=>{setRegTipo('expositor');setShowRegisterModal(true)}}
                  style={{padding:'10px 20px',borderRadius:10,background:CYAN,color:'white',border:'none',cursor:'pointer',fontSize:13,fontWeight:700}}>
                  🏪 Registrarme como Expositor
                </button>
                <button onClick={()=>{setRegTipo('patrocinador');setShowRegisterModal(true)}}
                  style={{padding:'10px 20px',borderRadius:10,background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',cursor:'pointer',fontSize:13,fontWeight:700}}>
                  ⭐ Registrarme como Patrocinador
                </button>
              </div>
            </div>
          )}

          {empresa&&(
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'as const,alignItems:'center'}}>
              <span style={{background:'rgba(0,188,212,0.15)',color:CYAN,fontSize:11,padding:'3px 10px',borderRadius:20}}>{empresa.tipo==='expositor'?'🏪 Expositor':'⭐ Patrocinador'}</span>
              {empresa.stand_id&&<span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:11,padding:'3px 10px',borderRadius:20}}>Stand {empresa.stand_id}</span>}
            </div>
          )}
        </div>

        {/* Verificación */}
        {empresa&&!verified&&(
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,179,0,0.3)',borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{color:'#fbbf24',fontSize:14,fontWeight:700,marginBottom:6}}>🔐 Verificación de identidad</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginBottom:12}}>
              Ingresa el NIT de la empresa, email o número de celular registrado para acceder
            </div>
            <div style={{display:'flex',gap:8}}>
              <input style={{...inp,flex:1}} placeholder="NIT, email o celular"
                value={nitInput} onChange={e=>setNitInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleVerify()}/>
              <button onClick={handleVerify}
                style={{padding:'8px 20px',borderRadius:8,background:CYAN,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:13,whiteSpace:'nowrap'as const}}>
                Verificar
              </button>
            </div>
            {verifyError&&<div style={{color:'#f87171',fontSize:12,marginTop:8}}>⚠️ {verifyError}</div>}
          </div>
        )}

        {/* Panel verificado */}
        {empresa&&verified&&(
          <>
            {/* Aviso + Refrescar */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:16,flexWrap:'wrap'as const}}>
              <div style={{flex:1,background:'rgba(255,179,0,0.08)',border:'1px solid rgba(255,179,0,0.25)',borderRadius:12,padding:'12px 16px'}}>
                <p style={{color:'#fbbf24',fontSize:13,fontWeight:700,margin:'0 0 4px'}}>⚠️ Información importante</p>
                <p style={{color:'rgba(255,255,255,0.55)',fontSize:12,margin:0}}>
                  Las listas de personal serán entregadas a COMFAMA el <strong style={{color:'white'}}>22 de julio</strong>. Una vez enviadas no podrán modificarse.
                  Para cambios: <a href={`https://wa.me/${WA}`} style={{color:CYAN}}>WhatsApp {WA}</a>
                </p>
              </div>
              <button onClick={refresh}
                style={{padding:'10px 16px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'white',cursor:'pointer',fontSize:13,whiteSpace:'nowrap'as const,flexShrink:0}}>
                🔄 Actualizar
              </button>
            </div>

            {/* Botones de acción */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12,marginBottom:20}}>

              {/* Staff montaje */}
              <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${montajeSaved?'#4CAF50':'rgba(239,68,68,0.4)'}`,borderRadius:12,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{color:'white',fontSize:14,fontWeight:700}}>🔧 Staff de montaje</div>
                    <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Personal de montaje y desmontaje · ilimitado</div>
                    <div style={{color:'#fbbf24',fontSize:11,marginTop:4}}>📅 Límite: 22 de julio de 2026</div>
                  </div>
                  <span style={{background:montajeSaved?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:montajeSaved?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,flexShrink:0}}>
                    {montajeSaved?`✅ ${existingMontaje.length} registrados`:'🔴 Pendiente'}
                  </span>
                </div>
                {montajeSaved&&(
                  <button onClick={printPDF}
                    style={{width:'100%',padding:'7px',borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'white',cursor:'pointer',fontSize:12,marginTop:4}}>
                    📥 Descargar / Imprimir PDF
                  </button>
                )}
              </div>

              {/* Contrato */}
              <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${empresa.contract_signed_at?'#4CAF50':'rgba(239,68,68,0.4)'}`,borderRadius:12,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{color:'white',fontSize:14,fontWeight:700}}>📄 Contrato + Staff de servicio</div>
                    <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2}}>Consentimiento y personal del día del evento</div>
                    <div style={{color:'#fbbf24',fontSize:11,marginTop:4}}>📅 Límite: 22 de julio de 2026</div>
                  </div>
                  <span style={{background:empresa.contract_signed_at?'rgba(76,175,80,0.2)':'rgba(239,68,68,0.15)',color:empresa.contract_signed_at?'#4ade80':'#f87171',fontSize:11,padding:'3px 8px',borderRadius:20,flexShrink:0}}>
                    {empresa.contract_signed_at?'✅ Firmado':'🔴 Pendiente'}
                  </span>
                </div>
                {empresa.contract_token&&!empresa.contract_signed_at&&(
                  <button onClick={()=>setShowContractModal(true)}
                    style={{width:'100%',padding:'7px',borderRadius:8,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,marginTop:4}}>
                    ✍️ Firmar contrato
                  </button>
                )}
                {empresa.contract_signed_at&&(
                  <a href={`${window.location.origin}/ecard/${empresa.id}`} target="_blank" rel="noopener noreferrer"
                    style={{display:'block',textAlign:'center',padding:'7px',borderRadius:8,background:'rgba(255,255,255,0.08)',color:'white',textDecoration:'none',fontSize:12,marginTop:4,border:'1px solid rgba(255,255,255,0.15)'}}>
                    🎟️ Ver E-Card de ingreso
                  </a>
                )}
              </div>
            </div>

            {/* Lista existente */}
            {montajeSaved&&existingMontaje.length>0&&(
              <div style={{background:'rgba(76,175,80,0.05)',border:'1px solid rgba(76,175,80,0.2)',borderRadius:14,padding:16,marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div>
                    <div style={{color:'#4ade80',fontSize:14,fontWeight:700}}>✅ Personal de montaje registrado</div>
                    <div style={{color:'rgba(255,255,255,0.4)',fontSize:12,marginTop:2}}>{existingMontaje.length} empleado{existingMontaje.length>1?'s':''} · {isPastDeadline()?'Solo lectura — registro cerrado':'Puedes editar hasta el 22 de julio'}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    {!isPastDeadline()&&<button onClick={()=>setMontajeSaved(false)}
                      style={{padding:'8px 14px',borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
                      ✏️ Editar
                    </button>}
                    <button onClick={printPDF} style={{padding:'8px 14px',borderRadius:8,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:'pointer',fontSize:12,fontWeight:700}}>
                      📥 PDF
                    </button>
                  </div>
                </div>
                <div style={{overflowX:'auto'as const}}>
                  <table style={{width:'100%',borderCollapse:'collapse'as const,fontSize:12}}>
                    <thead>
                      <tr style={{background:'rgba(255,255,255,0.06)'}}>
                        {['#','Nombre','Cédula','Teléfono','EPS','ARL','Docs'].map(h=>(
                          <th key={h} style={{padding:'8px 10px',color:'rgba(255,255,255,0.5)',textAlign:'left'as const,fontWeight:600,fontSize:11}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {existingMontaje.map((s,i)=>(
                        <tr key={s.id} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                          <td style={{padding:'9px 10px',color:'rgba(255,255,255,0.4)'}}>{i+1}</td>
                          <td style={{padding:'9px 10px',color:'white',fontWeight:600}}>{s.full_name}</td>
                          <td style={{padding:'9px 10px',color:'rgba(255,255,255,0.7)'}}>{s.cedula}</td>
                          <td style={{padding:'9px 10px',color:'rgba(255,255,255,0.7)'}}>{s.phone}</td>
                          <td style={{padding:'9px 10px',color:'rgba(255,255,255,0.6)'}}>{s.eps_name||'—'}</td>
                          <td style={{padding:'9px 10px',color:'rgba(255,255,255,0.6)'}}>{s.arl_name||'—'}</td>
                          <td style={{padding:'9px 10px'}}>
                            <div style={{display:'flex',gap:6}}>
                              {s.cedula_url&&<a href={s.cedula_url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:CYAN,background:'rgba(0,188,212,0.1)',padding:'2px 6px',borderRadius:4}}>CC</a>}
                              {s.arl_eps_url&&<a href={s.arl_eps_url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:CYAN,background:'rgba(0,188,212,0.1)',padding:'2px 6px',borderRadius:4}}>ARL</a>}
                              {!s.cedula_url&&!s.arl_eps_url&&<span style={{color:'rgba(255,255,255,0.3)',fontSize:11}}>—</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{marginTop:10,padding:'10px 14px',background:'rgba(255,179,0,0.08)',border:'1px solid rgba(255,179,0,0.2)',borderRadius:8}}>
                  <p style={{color:'#fbbf24',fontSize:11,margin:0}}>⚠️ Lista enviada. Para cambios: <a href={`https://wa.me/${WA}`} style={{color:CYAN}}>WhatsApp {WA}</a></p>
                </div>
              </div>
            )}

            {/* Formulario montaje */}
            {!montajeSaved&&(
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:20,marginBottom:16}}>
                <h3 style={{color:'white',fontSize:15,fontWeight:700,margin:'0 0 16px'}}>🔧 Registrar staff de montaje</h3>
                {isPastDeadline()&&(
                  <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:10,padding:'12px 16px',marginBottom:16,textAlign:'center'}}>
                    <p style={{color:'#f87171',fontSize:14,fontWeight:700,margin:'0 0 4px'}}>🔒 Registro cerrado</p>
                    <p style={{color:'rgba(255,255,255,0.5)',fontSize:12,margin:0}}>La fecha límite de registro fue el 22 de julio de 2026. Para modificaciones contacta: <a href={`https://wa.me/${WA}`} style={{color:CYAN}}>WhatsApp {WA}</a></p>
                  </div>
                )}
                {montaje.map((m,idx)=>(
                  <MemberRow key={idx} m={m} idx={idx} total={montaje.length}
                    onChange={(f,v)=>updateMember(idx,f,v)}
                    onRemove={()=>setMontaje(p=>p.filter((_,i)=>i!==idx))}
                    onUpload={(f,field)=>uploadFile(f,idx,field)}
                    uploadingKey={uploadingKey}
                  />
                ))}
                <button onClick={()=>setMontaje(p=>[...p,empty()])}
                  style={{width:'100%',padding:'9px',borderRadius:8,background:'transparent',border:`1px dashed rgba(0,188,212,0.4)`,color:CYAN,cursor:'pointer',fontSize:13,marginBottom:14}}>
                  + Agregar empleado
                </button>
                {/* Sección vehículo */}
                <div style={{background:'rgba(0,188,212,0.06)',border:'1px solid rgba(0,188,212,0.2)',borderRadius:12,padding:16,marginBottom:14}}>
                  <div style={{color:CYAN,fontSize:13,fontWeight:700,marginBottom:4}}>🚗 Vehículo de ingreso al parque</div>
                  <div style={{background:'rgba(255,179,0,0.1)',border:'1px solid rgba(255,179,0,0.3)',borderRadius:8,padding:'10px 12px',marginBottom:12}}>
                    <p style={{color:'#fbbf24',fontSize:12,margin:'0 0 4px',fontWeight:700}}>⚠️ Solo se permite 1 vehículo por empresa dentro del Parque COMFAMA.</p>
                    <p style={{color:'rgba(255,255,255,0.55)',fontSize:11,margin:'0 0 4px'}}>Los demás vehículos deben estacionarse en los parqueaderos cercanos al parque.</p>
                    <p style={{color:'#f87171',fontSize:11,margin:0,fontWeight:700}}>🗓️ Fecha límite de registro: 22 de julio de 2026. Después de esta fecha no se podrán hacer cambios.</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                    <div>
                      <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>Placa *</div>
                      <input style={inp} placeholder="AAA000" value={vehicle.placa} onChange={e=>setVehicle(v=>({...v,placa:e.target.value.toUpperCase()}))}/>
                    </div>
                    <div>
                      <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>Tipo de vehículo *</div>
                      <select value={vehicle.tipo_vehiculo} onChange={e=>setVehicle(v=>({...v,tipo_vehiculo:e.target.value}))}
                        style={{...inp,background:'#1a2050',color:'white'}}>
                        <option value="" style={{background:'#1a2050',color:'white'}}>Selecciona...</option>
                        <option value="Carro" style={{background:'#1a2050',color:'white'}}>Carro</option>
                        <option value="Camioneta" style={{background:'#1a2050',color:'white'}}>Camioneta</option>
                        <option value="Van" style={{background:'#1a2050',color:'white'}}>Van</option>
                        <option value="Camión" style={{background:'#1a2050',color:'white'}}>Camión</option>
                      </select>
                    </div>
                    <div>
                      <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>Marca / Modelo *</div>
                      <input style={inp} placeholder="Ej: Renault Duster" value={vehicle.marca} onChange={e=>setVehicle(v=>({...v,marca:e.target.value}))}/>
                    </div>
                  </div>
                </div>

                <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:12}}>
                  <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{marginTop:2,flexShrink:0}}/>
                  <span style={{color:'rgba(255,255,255,0.6)',fontSize:12}}>
                    Certifico que la información es correcta. Una vez enviada <strong style={{color:'white'}}>no podrá modificarse</strong>. Esta lista será utilizada para el control de acceso al montaje.
                  </span>
                </div>
                {saveError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'8px 12px',color:'#f87171',fontSize:12,marginBottom:12}}>⚠️ {saveError}</div>}
                <button onClick={saveMontaje} disabled={saving||isPastDeadline()}
                  style={{width:'100%',padding:14,borderRadius:10,background:isPastDeadline()?'rgba(255,255,255,0.1)':`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:isPastDeadline()?'not-allowed':'pointer',fontWeight:700,fontSize:15,opacity:saving?0.7:1}}>
                {saving?'⏳ Guardando...':'✅ Confirmar registro'}
                </button>
              </div>
            )}
          </>
        )}

        <p style={{color:'rgba(255,255,255,0.2)',fontSize:11,textAlign:'center',marginTop:24}}>
          Latido y Huella 2026 · eventos@latidoyhuella.co · WhatsApp +57 333 277 7912
        </p>
      </div>

      {/* Modal contrato */}
      {showContractModal&&empresa?.contract_token&&(
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.92)',display:'flex',flexDirection:'column'as const,alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{width:'100%',maxWidth:720,background:'white',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column'as const,height:'90vh'}}>
            <div style={{background:NAVY,padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
              <span style={{color:'white',fontWeight:700,fontSize:14}}>📄 Contrato — {empresa.brand_name}</span>
              <button onClick={()=>{setShowContractModal(false);refresh()}}
                style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:8,padding:'5px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>
                ✕ Cerrar
              </button>
            </div>
            <iframe
              key={empresa.contract_token}
              src={`${window.location.origin}/contrato/${empresa.contract_token}`}
              style={{flex:1,border:'none',width:'100%'}}
              title="Contrato"
              allow="camera"
            />
          </div>
        </div>
      )}

      {/* Modal registro nueva empresa */}
      {showRegisterModal&&(
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{width:'100%',maxWidth:580,background:'#0f1535',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,overflow:'hidden',maxHeight:'90vh',overflowY:'auto'as const}}>
            <div style={{background:NAVY,padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky'as const,top:0}}>
              <span style={{color:'white',fontWeight:700,fontSize:14}}>
                {regTipo==='expositor'?'🏪 Registro como Expositor':'⭐ Registro como Patrocinador'}
              </span>
              <button onClick={()=>setShowRegisterModal(false)}
                style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:8,padding:'5px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>
                ✕
              </button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'flex',gap:8,marginBottom:20}}>
                <button onClick={()=>setRegTipo('expositor')} style={{flex:1,padding:'9px',borderRadius:8,background:regTipo==='expositor'?CYAN:'rgba(255,255,255,0.06)',color:'white',border:`1px solid ${regTipo==='expositor'?CYAN:'rgba(255,255,255,0.15)'}`,cursor:'pointer',fontSize:13,fontWeight:700}}>🏪 Expositor</button>
                <button onClick={()=>setRegTipo('patrocinador')} style={{flex:1,padding:'9px',borderRadius:8,background:regTipo==='patrocinador'?CYAN:'rgba(255,255,255,0.06)',color:'white',border:`1px solid ${regTipo==='patrocinador'?CYAN:'rgba(255,255,255,0.15)'}`,cursor:'pointer',fontSize:13,fontWeight:700}}>⭐ Patrocinador</button>
              </div>

              {[
                {key:'brand_name',label:'Nombre de la empresa *',placeholder:'Nombre comercial'},
                {key:'responsible_name',label:'Responsable *',placeholder:'Nombre y apellidos'},
                {key:'document_id',label:'NIT o cédula',placeholder:'Número sin puntos'},
                {key:'email',label:'Email *',placeholder:'correo@empresa.com'},
                {key:'phone',label:'Teléfono',placeholder:'300 000 0000'},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:12}}>
                  <div style={{color:'rgba(255,255,255,0.5)',fontSize:11,marginBottom:4}}>{f.label}</div>
                  <input style={inpDark} placeholder={f.placeholder}
                    value={regForm[f.key as keyof typeof regForm]}
                    onChange={e=>setRegForm(prev=>({...prev,[f.key]:e.target.value}))}/>
                </div>
              ))}

              <div style={{marginTop:16,marginBottom:8,color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600}}>Documentos</div>
              <div style={{display:'flex',flexDirection:'column'as const,gap:10,marginBottom:20}}>
                {[
                  {key:'cedula_url',label:'📋 Cédula del representante'},
                  {key:'rut_url',label:'📄 RUT de la empresa'},
                  {key:'camara_url',label:'🏢 Cámara de Comercio'},
                ].map(d=>(
                  <div key={d.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'10px 14px'}}>
                    <span style={{color:'rgba(255,255,255,0.7)',fontSize:13}}>{d.label}</span>
                    <UploadBtn label="Subir" value={regDocs[d.key as keyof typeof regDocs]} uploading={regUploading===d.key} onFile={f=>uploadRegDoc(f,d.key as any)}/>
                  </div>
                ))}
              </div>

              {regError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',color:'#f87171',fontSize:12,marginBottom:14}}>⚠️ {regError}</div>}

              <button onClick={registerNewEmpresa} disabled={regSaving}
                style={{width:'100%',padding:14,borderRadius:10,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:'pointer',fontWeight:700,fontSize:15,opacity:regSaving?0.7:1}}>
                {regSaving?'⏳ Registrando...':'✅ Completar registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}