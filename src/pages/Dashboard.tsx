import { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface Reg5k { id:string;created_at:string;full_name:string;email:string;phone:string;document_id:string;ticket_type:string;total_amount:number;amount_cents:number|null;status:string;payment_provider:string|null;payment_method:string|null;wompi_transaction_id:string|null;paid_at:string|null;accepted_agreement_at:string|null }
interface Attendee { id:string;registration_id:string;attendee_index:number;is_primary:boolean;is_minor:boolean;full_name:string;email:string|null;phone:string|null;document_id:string|null;amount_cents:number;birthdate:string|null;photo_url:string|null;created_at:string }
interface EmailTemplate { id:string;name:string;category:string;subject:string;body_html:string;is_active:boolean;created_at:string;updated_at:string }
interface Pet { id:string;registration_id:string;name:string;breed:string;age:string;size:string;photo_url:string|null;is_primary:boolean;bio:string|null;amount_cents:number;approved_for_wall:boolean;created_at:string }
interface Expositor { id:string;created_at:string;brand_name:string;responsible_name:string;email:string;phone:string;cedula:string|null;stand_id:string|null;stand_type:string|null;category:string;product_type:string|null;status:string;payment_method:string|null;amount_cents:number;cedula_url:string|null;rut_url:string|null;camara_comercio_url:string|null;accepted_contract_at:string|null;wompi_transaction_id:string|null;paid_at:string|null }
interface Toldo { id:string;created_at:string;brand_name:string;responsible_name:string;email:string;phone:string;cedula:string|null;quantity:number;product_type:string|null;status:string;payment_method:string|null;amount_cents:number;cedula_url:string|null;rut_url:string|null;camara_comercio_url:string|null;accepted_contract_at:string|null;wompi_transaction_id:string|null;paid_at:string|null }
interface Sponsor { id:string;created_at:string;company_name:string;contact_name:string;email:string;phone:string;cedula:string|null;plan_type:string;plan_name:string;status:string;payment_method:string;amount_cents:number;cedula_url:string|null;rut_url:string|null;camara_comercio_url:string|null;accepted_agreement_at:string|null;extra_spaces:string[]|null;wompi_transaction_id:string|null;paid_at:string|null;comments:string|null }
interface SponsorItem { id:string;sponsor_inquiry_id:string;product_name:string;variant_label:string|null;quantity:number;unit_price_cents:number;total_price_cents:number }
interface PublicSponsor { id:string;name:string;logo_url:string;tier:string;display_order:number;is_active:boolean;created_at:string }
interface SportTeam { id:string;created_at:string;sport:string;category:string|null;team_name:string|null;captain_name:string;captain_email:string;captain_phone:string;captain_cedula:string|null;player_count:number;amount_cents:number;status:string;payment_method:string;wompi_transaction_id:string|null;paid_at:string|null;accepted_terms_at:string|null }
interface SportPlayer { id:string;team_id:string;player_index:number;is_captain:boolean;name:string;age:number|null;cedula:string|null;ti:string|null;email:string|null;phone:string|null;responsable_name:string|null;responsable_phone:string|null }
interface AdminUser { id:string;created_at:string;full_name:string;email:string;password_hash:string;role:string;is_active:boolean }

type Page = 'home'|'5k'|'mascotas'|'comercial'|'deportes'|'patrocinadores'|'marcas'|'pagos'|'emails'|'admin'|'dev'|'papelera'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const PM = ['wompi','efectivo','transferencia']
const PL:Record<string,string> = {wompi:'Wompi',efectivo:'Efectivo',transferencia:'Transferencia'}
const SC:Record<string,string> = {
  approved:'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  paid:'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  pending_payment:'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  declined:'bg-red-500/20 text-red-400 border border-red-500/30',
  voided:'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  expired:'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  available:'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
}
const SL:Record<string,string> = {approved:'Pagado',paid:'Pagado',pending_payment:'Pendiente',declined:'Rechazado',voided:'Anulado',expired:'Expirado',available:'Disponible'}
const TIERS = ['oro','plata','bronce','aliado','medios']
const TC:Record<string,string> = {oro:'bg-yellow-500/20 text-yellow-400',plata:'bg-gray-400/20 text-gray-300',bronce:'bg-orange-500/20 text-orange-400',aliado:'bg-blue-500/20 text-blue-400',medios:'bg-purple-500/20 text-purple-400'}

const fmtCOP = (c:number) => `$${Math.round(c/100).toLocaleString('es-CO')}`
const fmtDate = (d:string|null) => d ? new Date(d).toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'2-digit'}) : '—'
const isOk = (s:string) => s==='approved'||s==='paid'

// ─── PEQUEÑOS ────────────────────────────────────────────────────────────────
function Badge({status}:{status:string}) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${SC[status]||'bg-gray-500/20 text-gray-400'}`}>{SL[status]||status}</span>
}
function DocBadge({ok,label,url}:{ok:boolean;label:string;url?:string|null}) {
  if(ok&&url) return <a href={url} target="_blank" rel="noreferrer" className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">✓{label}</a>
  return <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${ok?'bg-emerald-500/20 text-emerald-400':'bg-red-500/10 text-red-400'}`}>{ok?`✓${label}`:`✗${label}`}</span>
}
function Btn({icon,label,color,onClick,disabled}:{icon:string;label?:string;color:string;onClick:()=>void;disabled?:boolean}) {
  return <motion.button whileHover={{scale:disabled?1:1.05}} whileTap={{scale:disabled?1:0.95}} onClick={onClick} disabled={disabled} className={`text-xs px-2 py-1 rounded-lg font-bold transition-colors whitespace-nowrap disabled:opacity-40 ${color}`}>{icon}{label?` ${label}`:''}</motion.button>
}
function AddBtn({label,onClick}:{label:string;onClick:()=>void}) {
  return (
    <motion.button onClick={onClick} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
      style={{background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 4px 15px rgba(5,150,105,0.3)'}}>
      ➕ {label}
    </motion.button>
  )
}

// ─── MODAL BASE ───────────────────────────────────────────────────────────────
function Modal({children,onClose,wide,full,xl}:{children:React.ReactNode;onClose:()=>void;wide?:boolean;full?:boolean;xl?:boolean}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.9,opacity:0}}
        className={`bg-[#12122a] border border-white/10 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto ${xl?'w-[980px]':full?'w-[860px]':wide?'w-[700px]':'w-[480px]'} max-w-full`}>
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── EDIT MODAL — con soporte de imágenes ────────────────────────────────────
function EditModal({record,table,fields,title,onClose,onSaved}:{record:any;table:string;fields:{key:string;label:string;type?:string;options?:string[]}[];title?:string;onClose:()=>void;onSaved:()=>void}) {
  const [vals,setVals]=useState<Record<string,any>>(()=>{const v:Record<string,any>={};fields.forEach(f=>{v[f.key]=record[f.key]??''});return v})
  const [saving,setSaving]=useState(false)
  const [result,setResult]=useState<{ok:boolean;msg:string}|null>(null)
  const [uploading,setUploading]=useState<string|null>(null) // key del campo que se está subiendo
  const imgRefs=useRef<Record<string,HTMLInputElement|null>>({})

  const uploadImage=async(key:string,file:File)=>{
    setUploading(key)
    const bucket=key==='photo_url'?'pet-photos':key.includes('cedula')?'docs':key.includes('rut')?'docs':'docs'
    const ext=file.name.split('.').pop()?.toLowerCase()||'jpg'
    const filename=`${table}-${record.id}-${key}-${Date.now()}.${ext}`
    const {error:upErr}=await supabase.storage.from(bucket).upload(filename,file,{cacheControl:'3600',upsert:true})
    if(upErr){setResult({ok:false,msg:`Error subiendo imagen: ${upErr.message}`});setUploading(null);return}
    const {data:{publicUrl}}=supabase.storage.from(bucket).getPublicUrl(filename)
    setVals(v=>({...v,[key]:publicUrl}))
    setUploading(null)
  }

  const save=async()=>{
    setSaving(true);setResult(null)
    const {error}=await supabase.from(table).update(vals).eq('id',record.id)
    setSaving(false)
    if(error){setResult({ok:false,msg:error.message})}
    else{setResult({ok:true,msg:'✓ Guardado'});onSaved();setTimeout(onClose,700)}
  }

  const isImageField=(key:string)=>key.endsWith('_url')||key.endsWith('_photo')||key==='photo_url'||key==='logo_url'

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">✏️ {title||'Editar'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map(f=>(
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              {f.options
                ?<select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" value={vals[f.key]||''} onChange={e=>setVals({...vals,[f.key]:e.target.value})}>
                    {f.options.map(o=><option key={o} value={o} className="bg-[#12122a]">{PL[o]||SL[o]||o}</option>)}</select>
                :isImageField(f.key)
                  ?<div>
                    {/* Preview de imagen actual */}
                    {vals[f.key]&&(
                      <div className="mb-2 flex items-center gap-3 bg-white/5 rounded-xl p-2 border border-white/10">
                        <img src={vals[f.key]} alt="preview" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 truncate">{vals[f.key]}</div>
                          <div className="text-xs text-emerald-400 mt-0.5">✓ Imagen actual</div>
                        </div>
                      </div>
                    )}
                    {/* Subir nueva imagen */}
                    <div className="flex gap-2">
                      <input ref={el=>imgRefs.current[f.key]=el} type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.svg" className="hidden"
                        onChange={e=>{const file=e.target.files?.[0];if(file)uploadImage(f.key,file)}}/>
                      <button onClick={()=>imgRefs.current[f.key]?.click()} disabled={uploading===f.key}
                        className="flex-1 text-xs py-2.5 rounded-xl font-bold border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50">
                        {uploading===f.key?'⏳ Subiendo...':'📸 Subir nueva imagen'}
                      </button>
                    </div>
                    {/* También permitir pegar URL manualmente */}
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none focus:border-emerald-500 mt-1 placeholder-gray-600"
                      placeholder="O pega una URL aquí..." value={vals[f.key]||''} onChange={e=>setVals({...vals,[f.key]:e.target.value})}/>
                  </div>
                  :<input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" type={f.type||'text'} value={vals[f.key]||''} onChange={e=>setVals({...vals,[f.key]:e.target.value})}/>}
            </div>
          ))}
        </div>
        {result&&<div className={`mt-3 text-xs rounded-xl px-3 py-2.5 font-medium ${result.ok?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{result.msg}</div>}
        <div className="flex gap-2 mt-5">
          <button onClick={save} disabled={saving||!!uploading} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">{saving?'Guardando...':'💾 Guardar'}</button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cancelar</button>
        </div>
      </div>
    </Modal>
  )
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────
function CreateModal({table,fields,title,defaults,onClose,onSaved}:{table:string;fields:{key:string;label:string;type?:string;options?:string[];required?:boolean}[];title:string;defaults?:Record<string,any>;onClose:()=>void;onSaved:()=>void}) {
  const [vals,setVals]=useState<Record<string,any>>(()=>{
    const v:Record<string,any>={...(defaults||{})}
    fields.forEach(f=>{if(!(f.key in v))v[f.key]=f.options?f.options[0]:''})
    return v
  })
  const [saving,setSaving]=useState(false);const [err,setErr]=useState('')
  const save=async()=>{
    setSaving(true);setErr('')
    const {error}=await supabase.from(table).insert({...vals,created_at:new Date().toISOString()})
    setSaving(false)
    if(error){setErr(error.message)}else{onSaved();onClose()}
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">➕ {title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {fields.map(f=>(
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}{f.required&&<span className="text-red-400 ml-1">*</span>}</label>
              {f.options
                ?<select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" value={vals[f.key]||''} onChange={e=>setVals({...vals,[f.key]:e.target.value})}>
                    {f.options.map(o=><option key={o} value={o} className="bg-[#12122a]">{PL[o]||o}</option>)}</select>
                :<input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600" type={f.type||'text'} value={vals[f.key]||''} onChange={e=>setVals({...vals,[f.key]:e.target.value})} placeholder={f.label}/>}
            </div>
          ))}
        </div>
        {err&&<div className="mt-3 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2.5">{err}</div>}
        <div className="flex gap-2 mt-5">
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">{saving?'Creando...':'✅ Crear registro'}</button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cancelar</button>
        </div>
      </div>
    </Modal>
  )
}

// ─── APPROVE MODAL ────────────────────────────────────────────────────────────
function ApproveModal({record,table,onClose,onSaved}:{record:any;table:string;onClose:()=>void;onSaved:()=>void}) {
  const [method,setMethod]=useState(record.payment_method||'wompi')
  const [saving,setSaving]=useState(false);const [result,setResult]=useState<{ok:boolean;msg:string}|null>(null)
  const approve=async()=>{
    setSaving(true);setResult(null)
    const {error}=await supabase.from(table).update({status:'paid',payment_method:method,paid_at:new Date().toISOString()}).eq('id',record.id)
    setSaving(false)
    if(error){setResult({ok:false,msg:'Error: '+error.message})}
    else{setResult({ok:true,msg:'✓ ¡Aprobado!'});onSaved();setTimeout(onClose,800)}
  }
  const name=record.full_name||record.responsible_name||record.company_name||record.captain_name||'—'
  const amount=record.amount_cents||record.total_amount||0
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">✅ Aprobar pago</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5">
          <div className="text-sm font-bold text-white">{name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{record.email||record.captain_email}</div>
          {amount>0&&<div className="text-lg font-black text-emerald-400 mt-1">{fmtCOP(amount)}</div>}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PM.map(m=>(
            <button key={m} onClick={()=>setMethod(m)}
              className={`py-4 rounded-xl text-sm font-bold border-2 transition-all ${method===m?'border-emerald-500 bg-emerald-500/20 text-emerald-400':'border-white/10 text-gray-500 hover:border-white/20'}`}>
              <div className="text-2xl mb-1">{m==='wompi'?'💳':m==='efectivo'?'💵':'🏦'}</div>
              <div className="text-xs">{PL[m]}</div>
            </button>
          ))}
        </div>
        {result&&<div className={`mb-4 text-xs rounded-xl px-3 py-2.5 font-medium ${result.ok?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{result.msg}</div>}
        <button onClick={approve} disabled={saving||result?.ok}
          className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
          {saving?'Procesando...':result?.ok?'✓ Aprobado':'✅ Confirmar'}
        </button>
      </div>
    </Modal>
  )
}

// ─── CONTRACT MODAL ───────────────────────────────────────────────────────────
function ContractModal({name,email,recordId,table,contractToken,contractSignedAt,contractPdfUrl,email1SentAt,onClose}:{
  name:string;email:string;recordId:string;table:string;
  contractToken?:string;contractSignedAt?:string;contractPdfUrl?:string;email1SentAt?:string;onClose:()=>void
}) {
  const [sending,setSending]=useState<string|null>(null)
  const [sentLog,setSentLog]=useState<Record<string,string>>({})
  const [error,setError]=useState('')
  const isSigned=!!contractSignedAt
  const hasToken=!!contractToken
  const contractUrl=contractToken?`${window.location.origin}/contrato/${contractToken}`:''
  const ecardUrl=`${window.location.origin}/ecard/${recordId}`

  const fmtDate=(d?:string)=>d?new Date(d).toLocaleString('es-CO',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):''

  const sendEmail=async(tipo:'email1'|'email2'|'recordatorio')=>{
    if(!email) return
    setSending(tipo);setError('')
    try{
      let subject='',html=''
      if(tipo==='email1'){
        subject='🐾 ¡Tu registro en Latido y Huella 2026 está confirmado!'
        html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5"><div style="background:#0D1B6E;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:65px" alt="Latido y Huella"/><p style="color:rgba(255,255,255,0.7);font-size:13px;margin:12px 0 0">26 de julio de 2026 · Parque del Bienestar COMFAMA · Llanogrande</p></div><div style="background:white;padding:36px 32px"><h1 style="color:#0D1B6E;font-size:26px;margin:0 0 8px">¡Hola ${name}! 🐾</h1><p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 24px">Tu registro para la <strong>Caminata Canina 6.5K Pet Lovers</strong> en Latido y Huella 2026 está confirmado. ¡Estamos muy felices de que seas parte de esta gran celebración familiar, canina y deportiva! 🎉</p><div style="background:#f0f4ff;border-radius:14px;padding:20px;margin:0 0 24px"><p style="margin:0 0 8px;color:#333"><strong>📅 Fecha:</strong> Domingo 26 de julio de 2026</p><p style="margin:0 0 8px;color:#333"><strong>⏰ Hora:</strong> 7:00 AM</p><p style="margin:0;color:#333"><strong>📍 Lugar:</strong> Parque del Bienestar COMFAMA Llanogrande</p></div><div style="background:#fff8e1;border-left:4px solid #FFB300;border-radius:0 12px 12px 0;padding:20px;margin:0 0 24px"><p style="color:#e65100;font-weight:700;margin:0 0 8px;font-size:15px">⚠️ Paso importante — Firma tu consentimiento</p><p style="color:#555;font-size:14px;margin:0 0 16px;line-height:1.6">Para completar tu registro debes firmar el consentimiento informado. Es rápido y lo puedes hacer desde tu celular.</p><div style="text-align:center"><a href="${contractUrl}" style="background:linear-gradient(135deg,#00BCD4,#0097A7);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px">✍️ Firmar consentimiento</a></div></div><div style="margin:0 0 24px"><h2 style="color:#0D1B6E;font-size:18px;margin:0 0 12px">🐾 Una causa que nos une</h2><p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 12px">Latido y Huella es mucho más que una caminata — es un espacio para celebrar el amor por las mascotas, el deporte y el bienestar familiar. Cada registro ayuda a fortalecer iniciativas de protección animal en nuestra región.</p><p style="color:#555;font-size:14px;line-height:1.7;margin:0"><strong>¡Comparte el evento con tus amigos y familia!</strong> Cuantos más seamos, más especial será el día. 🌟</p></div><div style="background:#f0fdf4;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #c3f0ca"><h3 style="color:#1b5e20;font-size:16px;margin:0 0 14px">🐕 Recomendaciones para las mascotas</h3><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🦮 <strong>Siempre cerca de ti:</strong> cuídala con collar, placa y traílla.</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">💧 <strong>Mucha agua:</strong> la hidratación para ti y tu mascota es fundamental.</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🐛 <strong>Cuída de ella:</strong> desparasítala antes de ir a la caminata.</p><p style="color:#2e7d32;font-size:14px;margin:0">💉 <strong>Esquema de vacunas:</strong> completa su esquema y porta el carné.</p></div><div style="background:#f3e5f5;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #ce93d8"><h3 style="color:#4a148c;font-size:16px;margin:0 0 14px">🎁 Entrega de kits</h3><p style="color:#555;font-size:14px;margin:0 0 14px">Tendremos dos lugares de entrega. En el próximo email podrás seleccionar el tuyo.</p><p style="color:#6a1b9a;font-size:14px;font-weight:700;margin:0 0 4px">📍 Medellín</p><p style="color:#555;font-size:13px;margin:0 0 12px">Vitrina Chery — Calle 31 # 43-73<br>Viernes 24 Jul: 9 AM – 4 PM · Sábado 25 Jul: 9 AM – 12 M</p><p style="color:#6a1b9a;font-size:14px;font-weight:700;margin:0 0 4px">📍 Llanogrande</p><p style="color:#555;font-size:13px;margin:0">La Finca de Rigo — Glorieta El Tablazo, Llanogrande (Rionegro)<br>Viernes 24 Jul: 9 AM – 4 PM · Sábado 25 Jul: 9 AM – 12 M</p></div><div style="background:#e3f2fd;border-radius:14px;padding:20px;margin:0 0 24px"><h3 style="color:#0D1B6E;font-size:16px;margin:0 0 12px">📌 Tus próximos pasos</h3><p style="color:#333;font-size:14px;margin:0 0 8px">1️⃣ <strong>Firmar el consentimiento</strong> — el link está arriba</p><p style="color:#333;font-size:14px;margin:0 0 8px">2️⃣ <strong>Seleccionar punto de kit</strong> — recibirás otro email con esta info</p><p style="color:#333;font-size:14px;margin:0">3️⃣ <strong>¡Disfrutar el evento el 26 de julio!</strong> 🎉</p></div><div style="text-align:center;margin:24px 0"><a href="https://latidoyhuella.com" style="background:#0D1B6E;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block">Ver detalles del evento →</a></div><p style="color:#888;font-size:12px;text-align:center;margin:0">¿Tienes preguntas? <a href="mailto:eventos@latidoyhuella.co" style="color:#00BCD4">eventos@latidoyhuella.co</a> · WhatsApp <strong>+57 333 277 7912</strong></p></div><div style="background:#0D1B6E;padding:20px 32px;text-align:center;border-radius:0 0 16px 16px"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:36px;margin-bottom:10px"/><p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0">Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co</p></div></div>`
      } else if(tipo==='recordatorio'){
        subject='⏰ Recuerda firmar tu consentimiento — Latido y Huella 2026'
        html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5"><div style="background:#0D1B6E;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:65px"/></div><div style="background:white;padding:36px 32px;border-radius:0 0 16px 16px"><h1 style="color:#0D1B6E;font-size:24px;margin:0 0 12px">¡Hola ${name}! 👋</h1><p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 20px">Te recordamos que tienes un consentimiento pendiente de firma para el evento <strong>Latido y Huella 2026</strong>. Sin esta firma tu registro no estará completo.</p><div style="background:#fff3e0;border-radius:12px;padding:16px;margin:0 0 24px"><p style="color:#e65100;font-weight:bold;margin:0">⚠️ El evento es el 26 de julio — ¡no olvides firmar antes!</p></div><div style="text-align:center;margin:24px 0"><a href="${contractUrl}" style="background:linear-gradient(135deg,#00BCD4,#0097A7);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px">✍️ Firmar ahora</a></div><p style="color:#888;font-size:12px;text-align:center">Latido y Huella 2026 · eventos@latidoyhuella.co · WhatsApp +57 333 277 7912</p></div></div>`
      } else if(tipo==='email2'){
        subject='✅ ¡Tu registro en Latido y Huella 2026 está completo!'
        html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5"><div style="background:#0D1B6E;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:65px"/><div style="background:rgba(76,175,80,0.2);border:1px solid #4CAF50;border-radius:30px;display:inline-block;padding:8px 20px;margin:16px 0 0"><span style="color:#4CAF50;font-weight:700;font-size:13px">✅ ¡Tu registro está 100% completo!</span></div></div><div style="background:white;padding:36px 32px"><h1 style="color:#0D1B6E;font-size:26px;margin:0 0 8px">¡${name}, ya eres parte del evento! 🎉</h1><p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 24px">Todo está listo. Tu consentimiento fue firmado y tu registro en <strong>Latido y Huella 2026</strong> está 100% completo. ¡Nos vemos el 26 de julio con toda la actitud y mucha energía! 🐾❤️</p><div style="background:linear-gradient(135deg,#0D1B6E,#1a2d8a);border-radius:14px;padding:24px;margin:0 0 24px"><h2 style="color:#00BCD4;font-size:17px;margin:0 0 16px">📅 Información del evento</h2><p style="color:white;margin:0 0 8px;font-size:14px">🗓️ <strong>Fecha:</strong> Domingo 26 de julio de 2026</p><p style="color:white;margin:0 0 8px;font-size:14px">⏰ <strong>Hora:</strong> 7:00 AM</p><p style="color:white;margin:0;font-size:14px">📍 <strong>Lugar:</strong> Parque del Bienestar COMFAMA Llanogrande</p></div><div style="background:#f8f9ff;border:2px dashed #00BCD4;border-radius:14px;padding:24px;margin:0 0 24px;text-align:center"><div style="font-size:32px;margin-bottom:8px">🎟️</div><h3 style="color:#0D1B6E;margin:0 0 8px;font-size:17px">Tu E-Card de ingreso está lista</h3><p style="color:#666;font-size:13px;margin:0 0 20px;line-height:1.6">Descárgala y guárdala en tu celular — la necesitarás para ingresar al evento. El staff escaneará tu QR en la entrada.</p><a href="${ecardUrl}" style="background:linear-gradient(135deg,#0D1B6E,#00BCD4);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px">🎟️ Ver y descargar mi E-Card</a></div>${contractPdfUrl?`<div style="text-align:center;margin:0 0 24px"><a href="${contractPdfUrl}" style="color:#0D1B6E;font-size:13px;text-decoration:underline">📄 Descargar consentimiento firmado (PDF)</a></div>`:''}<div style="background:#fff3e0;border-radius:14px;padding:24px;margin:0 0 24px;border:1px solid #FFB300"><h3 style="color:#e65100;font-size:16px;margin:0 0 8px">👕 ¿Dónde recoges tu Kit Caminata Canina?</h3><p style="color:#555;font-size:14px;margin:0 0 20px;line-height:1.6">Selecciona el punto de entrega más conveniente para ti. Tu elección quedará registrada.</p><div style="background:white;border-radius:10px;padding:16px;margin:0 0 12px;border:1px solid #ffe0b2"><p style="color:#0D1B6E;font-weight:700;font-size:15px;margin:0 0 6px">🏙️ Medellín</p><p style="color:#333;font-size:13px;margin:0 0 4px">📍 <strong>Vitrina Chery</strong> — Calle 31 # 43-73</p><p style="color:#555;font-size:13px;margin:0 0 4px">📅 Viernes 24 Jul: 9:00 AM – 4:00 PM</p><p style="color:#555;font-size:13px;margin:0 0 14px">📅 Sábado 25 Jul: 9:00 AM – 12:00 M</p><a href="https://admin-latidoyhuella.netlify.app/kit/${recordId}/medellin" style="background:#0D1B6E;color:white;padding:11px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block">👕 Recoger en Medellín</a></div><div style="background:white;border-radius:10px;padding:16px;border:1px solid #ffe0b2"><p style="color:#0D1B6E;font-weight:700;font-size:15px;margin:0 0 6px">🌄 Llanogrande</p><p style="color:#333;font-size:13px;margin:0 0 4px">📍 <strong>La Finca de Rigo</strong> — Glorieta El Tablazo, Llanogrande (Rionegro)</p><p style="color:#555;font-size:13px;margin:0 0 4px">📅 Viernes 24 Jul: 9:00 AM – 4:00 PM</p><p style="color:#555;font-size:13px;margin:0 0 14px">📅 Sábado 25 Jul: 9:00 AM – 12:00 M</p><a href="https://admin-latidoyhuella.netlify.app/kit/${recordId}/llanogrande" style="background:#00BCD4;color:white;padding:11px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block">👕 Recoger en Llanogrande</a></div></div><div style="background:#f0fdf4;border-radius:14px;padding:20px;margin:0 0 24px;border:1px solid #c3f0ca"><h3 style="color:#1b5e20;font-size:16px;margin:0 0 14px">💡 Recomendaciones para el día del evento</h3><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">⏰ <strong>Llega temprano</strong> — el acceso abre a las 7:00 AM</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🎟️ <strong>Presenta tu E-Card</strong> (QR) en la entrada</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🪪 <strong>Lleva tu documento de identidad</strong></p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">🦮 <strong>Traílla y collar</strong> para tu mascota en todo momento</p><p style="color:#2e7d32;font-size:14px;margin:0 0 8px">💧 <strong>Agua para ti y tu mascota</strong> — ¡la hidratación es clave!</p><p style="color:#2e7d32;font-size:14px;margin:0">🧹 <strong>Bolsas para recoger</strong> los desechos de tu mascota</p></div><div style="background:#e3f2fd;border-radius:14px;padding:20px;margin:0 0 24px;text-align:center"><h3 style="color:#0D1B6E;font-size:16px;margin:0 0 8px">🌟 ¡Comparte el evento!</h3><p style="color:#555;font-size:14px;margin:0 0 16px">Invita a tus amigos y familia. Cuantos más seamos, más especial será el día.</p><a href="https://latidoyhuella.com" style="background:#0D1B6E;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block">Ver detalles del evento →</a></div><p style="color:#888;font-size:12px;text-align:center;margin:0">¿Tienes preguntas? <a href="mailto:eventos@latidoyhuella.co" style="color:#00BCD4">eventos@latidoyhuella.co</a> · WhatsApp <strong>+57 333 277 7912</strong></p></div><div style="background:#0D1B6E;padding:20px 32px;text-align:center;border-radius:0 0 16px 16px"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:36px;margin-bottom:10px"/><p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0">Latido y Huella 2026 · Organizado por Diverxo S.A.S · eventos@latidoyhuella.co</p></div></div>`
      }
      const res=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,{
        method:'POST',
        headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({to:email,subject,html,from:'eventos@latidoyhuella.co',type:'contrato'})
      })
      if(res.ok){
        const now=new Date().toISOString()
        setSentLog(p=>({...p,[tipo]:now}))
        if(tipo==='email1'){
          await supabase.from(table).update({email1_sent_at:now}).eq('id',recordId)
        }
        // Guardar en email_logs
        await supabase.from('email_logs').insert({
          template_name: tipo==='email1'?'Email 1 — Bienvenida':tipo==='email2'?'Email 2 — eCard + Kit':'Recordatorio de firma',
          to_email: email,
          to_name: name,
          category: 'contrato',
          subject,
          sent_at: now,
          status: 'sent',
          body_html: html
        })
      } else setError('Error al enviar. Intenta de nuevo.')
    }catch{setError('Error de conexión.')}
    setSending(null)
  }

  const email1Date=email1SentAt||sentLog['email1']
  const email2Date=sentLog['email2']
  const recDate=sentLog['recordatorio']

  return (
    <Modal onClose={onClose}>
      <div className="p-6 space-y-3" style={{minWidth:320}}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">📋 Gestión del contrato</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Participante */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-gray-500 mb-0.5">Participante</div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-xs text-gray-400">{email}</div>
        </div>

        {/* Estado general */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl p-2.5 text-center border ${isSigned?'bg-emerald-500/10 border-emerald-500/30':'bg-amber-500/10 border-amber-500/30'}`}>
            <div className={`text-xs font-bold ${isSigned?'text-emerald-400':'text-amber-400'}`}>{isSigned?'✅ Firmado':'⏳ Sin firmar'}</div>
            {isSigned&&<div className="text-xs text-gray-500 mt-0.5">{fmtDate(contractSignedAt)}</div>}
          </div>
          <div className={`rounded-xl p-2.5 text-center border ${hasToken?'bg-emerald-500/10 border-emerald-500/30':'bg-red-500/10 border-red-500/30'}`}>
            <div className={`text-xs font-bold ${hasToken?'text-emerald-400':'text-red-400'}`}>{hasToken?'✅ Con token':'❌ Sin token'}</div>
            {email1Date&&<div className="text-xs text-gray-500 mt-0.5">Email 1: {fmtDate(email1Date)}</div>}
          </div>
        </div>

        {error&&<div className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded-xl">{error}</div>}

        {/* BOTONES */}
        <div className="space-y-2">

          {/* Email 1 — solo si tiene token */}
          {hasToken&&(
            <button onClick={()=>sendEmail('email1')} disabled={!!sending}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-between px-4"
              style={{background:'linear-gradient(135deg,#0D1B6E,#1a2d8a)'}}>
              <span>{sending==='email1'?'Enviando...':'📧 Enviar Email 1 — Bienvenida + firma'}</span>
              {email1Date&&<span className="text-xs text-white/50">✓ {fmtDate(email1Date)}</span>}
            </button>
          )}

          {/* Recordatorio — solo si tiene token y no ha firmado */}
          {hasToken&&!isSigned&&(
            <button onClick={()=>sendEmail('recordatorio')} disabled={!!sending}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-between px-4"
              style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>
              <span>{sending==='recordatorio'?'Enviando...':'⏰ Enviar recordatorio de firma'}</span>
              {recDate&&<span className="text-xs text-white/50">✓ {fmtDate(recDate)}</span>}
            </button>
          )}

          {/* Email 2 — solo si ya firmó */}
          {isSigned&&(
            <button onClick={()=>sendEmail('email2')} disabled={!!sending}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-between px-4"
              style={{background:'linear-gradient(135deg,#4CAF50,#388E3C)'}}>
              <span>{sending==='email2'?'Enviando...':'🎫 Enviar Email 2 — eCard + PDF'}</span>
              {email2Date&&<span className="text-xs text-white/50">✓ {fmtDate(email2Date)}</span>}
            </button>
          )}

          {/* Ver contrato */}
          {hasToken&&(
            <a href={contractUrl} target="_blank" rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border"
              style={{color:'#00BCD4',borderColor:'rgba(0,188,212,0.3)'}}>
              👁️ Ver contrato
            </a>
          )}

          {/* Ver eCard */}
          <a href={ecardUrl} target="_blank" rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border"
            style={{color:'#00BCD4',borderColor:'rgba(0,188,212,0.3)'}}>
            🎫 Ver E-Card
          </a>

          {/* Descargar PDF */}
          {contractPdfUrl&&(
            <a href={contractPdfUrl} target="_blank" rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border"
              style={{color:'#4CAF50',borderColor:'rgba(76,175,80,0.3)'}}>
              📄 Descargar PDF firmado
            </a>
          )}

          {/* Sin token */}
          {!hasToken&&(
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
              <div className="text-red-400 text-sm font-bold">⚠️ Sin token de contrato</div>
              <div className="text-xs text-gray-400 mt-1">El usuario debe completar el pago primero</div>
            </div>
          )}

          {/* Copiar link */}
          {hasToken&&(
            <div className="flex gap-2">
              <input readOnly value={contractUrl} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none"/>
              <button onClick={()=>navigator.clipboard.writeText(contractUrl)} className="px-3 py-2 rounded-xl text-xs border border-white/10 text-gray-400 hover:bg-white/5">📋</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── ECARD DEL USUARIO ────────────────────────────────────────────────────────
const HERO_URL='https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45d0dbe569a25de124a8.png'
const LOGO_URL='https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const CYAN='#00BCD4'; const NAVY='#0D1B6E'; const GREEN='#4CAF50'; const YELLOW='#FFB300'

function ProfileModal({record,table,allData,onClose,onSaved,onApprove,onContract}:{
  record:any;table:string;
  allData:{regs5k:Reg5k[];expositores:Expositor[];toldos:Toldo[];sponsors:Sponsor[];teams:SportTeam[];pets:Pet[];attendees:Attendee[]};
  onClose:()=>void;onSaved:()=>void;onApprove?:()=>void;onContract?:()=>void
}) {
  const [activeSection,setActiveSection]=useState<string|null>(null)
  const [editingBase,setEditingBase]=useState(false)
  const [createSection,setCreateSection]=useState<string|null>(null)

  // ── Detectar tipo de registro ──────────────────────────────────────────────
  const isAttendee=table==='registration_attendees'
  const isMinor=isAttendee&&record.is_minor
  const isPet=table==='registration_pets'
  const isPlayer=table==='sports_team_players'

  // ── Datos propios según tipo ───────────────────────────────────────────────
  const email=isMinor||isPet?'':isPlayer?(record.email||''):(record.email||record.captain_email||'')
  const name=record.full_name||record.name||record.responsible_name||record.company_name||record.captain_name||'—'
  const phone=isMinor||isPet?'':(record.phone||record.captain_phone||record.responsable_phone||'')
  const docId=isMinor||isPet?'':(record.document_id||record.cedula||record.ti||record.captain_cedula||'')
  const amount=record.amount_cents||record.total_amount||0
  const contractAt=record.accepted_agreement_at||record.accepted_contract_at||null
  const hasCedula=!!record.cedula_url; const hasRut=!!record.rut_url

  // ── Responsable para niños, mascotas y jugadores menores ──────────────────
  const responsableReg=isPet||isMinor?allData.regs5k.find(r=>r.id===record.registration_id):null
  const responsableName=responsableReg?.full_name||record.responsable_name||''
  const responsablePhone=responsableReg?.phone||record.responsable_phone||''

  // ── Equipo para jugadores ──────────────────────────────────────────────────
  const playerTeam=isPlayer?allData.teams.find(t=>t.id===record.team_id):null

  // ── Participación (buscar por email en todas las tablas) ──────────────────
  const linked5k=email?allData.regs5k.filter(r=>r.email===email):[]
  const linkedExp=email?allData.expositores.filter(e=>e.email===email):[]
  const linkedToldo=email?allData.toldos.filter(t=>t.email===email):[]
  const linkedSponsor=email?allData.sponsors.filter(s=>s.email===email):[]
  const linkedTeam=email?allData.teams.filter(t=>t.captain_email===email):[]
  const linkedPets=allData.pets.filter(p=>linked5k.some(r=>r.id===p.registration_id))

  // ── Hero: foto mascota del grupo o hero del evento ────────────────────────
  const groupPets=isAttendee
    ?allData.pets.filter(p=>p.registration_id===record.registration_id)
    :isPlayer
    ?[]
    :linkedPets
  const petPhoto=isPet
    ?record.photo_url
    :groupPets.find(p=>p.photo_url)?.photo_url
    ||linkedPets.find(p=>p.photo_url)?.photo_url
    ||null
  const heroBg=petPhoto||HERO_URL

  // Si es niño o mascota, hereda los registros del responsable
  const linkedPetsForSection=isPet?[record as Pet]:linkedPets

  const sections=[
    {id:'5k',icon:'🐾',label:'5K',count:linked5k.length,active:linked5k.length>0,records:linked5k,tbl:'registrations_5k'},
    {id:'mascotas',icon:'🐶',label:'Mascota',count:linkedPetsForSection.length,active:linkedPetsForSection.length>0,records:linkedPetsForSection,tbl:'registration_pets'},
    {id:'stand',icon:'🏪',label:'Stand',count:linkedExp.length,active:linkedExp.length>0,records:linkedExp,tbl:'expositor_reservations'},
    {id:'toldo',icon:'⛺',label:'Toldo',count:linkedToldo.length,active:linkedToldo.length>0,records:linkedToldo,tbl:'toldos_reservations'},
    {id:'sponsor',icon:'⭐',label:'Patroc.',count:linkedSponsor.length,active:linkedSponsor.length>0,records:linkedSponsor,tbl:'sponsor_inquiries'},
    {id:'deporte',icon:'⚽',label:'Deporte',count:linkedTeam.length+(isPlayer&&playerTeam?1:0),active:linkedTeam.length>0||(isPlayer&&!!playerTeam),records:isPlayer&&playerTeam?[playerTeam,...linkedTeam]:linkedTeam,tbl:'sports_team_registrations'},
  ]

  const create5k=[{key:'full_name',label:'Nombre',required:true},{key:'document_id',label:'Cédula'},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'ticket_type',label:'Ticket',options:['pet_lover','1p_1m','familiar']},{key:'payment_method',label:'Pago',options:PM}]
  const createExp=[{key:'brand_name',label:'Marca',required:true},{key:'responsible_name',label:'Responsable',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'stand_type',label:'Tipo',options:['A','B','C','food_truck']},{key:'payment_method',label:'Pago',options:PM}]
  const createToldo=[{key:'brand_name',label:'Marca',required:true},{key:'responsible_name',label:'Responsable',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'quantity',label:'Cantidad',type:'number'},{key:'payment_method',label:'Pago',options:PM}]
  const createSponsor=[{key:'company_name',label:'Empresa',required:true},{key:'contact_name',label:'Contacto',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'plan_type',label:'Tipo',options:['empresarial','deportivo','espacios']},{key:'plan_name',label:'Plan'},{key:'payment_method',label:'Pago',options:PM}]
  const createTeam=[{key:'captain_name',label:'Capitán',required:true},{key:'captain_email',label:'Email',type:'email',required:true},{key:'captain_phone',label:'Teléfono'},{key:'team_name',label:'Equipo'},{key:'sport',label:'Deporte',options:['futbol','padel']},{key:'category',label:'Categoría',options:['adultos','ninos']},{key:'payment_method',label:'Pago',options:PM}]

  const getCreateFields=(sectionId:string)=>{
    const defaults={email,status:'pending_payment'}
    switch(sectionId){
      case '5k':return{fields:create5k,table:'registrations_5k',title:'Registrar en Caminata 5K',defaults:{...defaults,full_name:name}}
      case 'stand':return{fields:createExp,table:'expositor_reservations',title:'Registrar Stand',defaults:{...defaults,responsible_name:name}}
      case 'toldo':return{fields:createToldo,table:'toldos_reservations',title:'Registrar Toldo',defaults:{...defaults,responsible_name:name}}
      case 'sponsor':return{fields:createSponsor,table:'sponsor_inquiries',title:'Registrar Patrocinio',defaults:{...defaults,contact_name:name}}
      case 'deporte':return{fields:createTeam,table:'sports_team_registrations',title:'Registrar Equipo',defaults:{captain_email:email,captain_name:name,status:'pending_payment'}}
      default:return null
    }
  }

  const editFields=[
    ...(record.full_name!==undefined?[{key:'full_name',label:'Nombre'}]:[]),
    ...(record.responsible_name!==undefined?[{key:'responsible_name',label:'Responsable'}]:[]),
    ...(record.company_name!==undefined?[{key:'company_name',label:'Empresa'}]:[]),
    ...(record.captain_name!==undefined?[{key:'captain_name',label:'Capitán'}]:[]),
    {key:'email',label:'Email'},{key:'phone',label:'Teléfono'},
    {key:'status',label:'Estado',options:['paid','pending_payment','declined']},
    {key:'payment_method',label:'Forma de pago',options:PM},
    {key:'photo_url',label:'Foto de perfil'},
    ...(record.cedula_url!==undefined?[{key:'cedula_url',label:'Cédula (CC)'}]:[]),
    ...(record.rut_url!==undefined?[{key:'rut_url',label:'RUT'}]:[]),
    ...(record.camara_comercio_url!==undefined?[{key:'camara_comercio_url',label:'Cámara de Comercio'}]:[]),
  ]

  const activeS=sections.find(s=>s.id===activeSection)

  // Número eCard
  const eCardNum=`#LH-${record.id?.slice(-4).toUpperCase()||'0000'}`

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.9,opacity:0}}
        style={{width:380,maxHeight:'92vh',overflowY:'auto',background:NAVY,borderRadius:28,border:`1px solid rgba(0,188,212,0.2)`,fontFamily:"'DM Sans',sans-serif",scrollbarWidth:'none'}}>

        {/* ── HERO ── */}
        <div style={{position:'relative',height:220,borderRadius:'28px 28px 0 0'}}>
          {/* imagen con clip propio */}
          <div style={{position:'absolute',inset:0,borderRadius:'28px 28px 0 0',overflow:'hidden'}}>
            <img src={heroBg} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',display:'block'}} alt=""/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(13,27,110,0.1) 0%,rgba(13,27,110,0.88) 85%,rgba(13,27,110,1) 100%)'}}/>
          </div>          {/* Badge estado */}
          <div style={{position:'absolute',top:14,right:14,background:isOk(record.status)?'rgba(76,175,80,0.2)':'rgba(245,158,11,0.2)',border:`1px solid ${isOk(record.status)?GREEN:YELLOW}`,borderRadius:20,padding:'4px 10px',backdropFilter:'blur(8px)'}}>
            <span style={{fontSize:11,fontWeight:600,color:isOk(record.status)?GREEN:YELLOW}}>{isOk(record.status)?'✓ Aprobado':'⏳ Pendiente'}</span>
          </div>
          {/* eCard ID */}
          <div style={{position:'absolute',top:14,left:14,background:'rgba(13,27,110,0.6)',border:`1px solid rgba(0,188,212,0.3)`,borderRadius:20,padding:'4px 10px',backdropFilter:'blur(8px)'}}>
            <span style={{fontSize:10,fontWeight:500,color:CYAN}}>{eCardNum}</span>
          </div>
          {/* Avatar — fuera del clip, sobre el borde del hero */}
          <div style={{position:'absolute',bottom:-54,left:'50%',transform:'translateX(-50%)',zIndex:20}}>
            <div style={{width:108,height:108,borderRadius:'50%',border:`4px solid ${CYAN}`,background:NAVY,overflow:'hidden',boxShadow:`0 0 0 5px rgba(0,188,212,0.12),0 10px 30px rgba(0,0,0,0.5)`}}>
              {record.photo_url
                ?<img src={record.photo_url} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}} alt={name} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                :<div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${NAVY},rgba(0,188,212,0.3))`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,color:CYAN}}>
                  {name.charAt(0).toUpperCase()}
                </div>
              }
            </div>
            {isOk(record.status)&&<div style={{position:'absolute',bottom:6,right:6,width:18,height:18,borderRadius:'50%',background:GREEN,border:`3px solid ${NAVY}`}}/>}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{padding:'62px 20px 20px',textAlign:'center'}}>

          {/* Nombre */}
          <h2 style={{fontSize:22,fontWeight:700,color:'#fff',margin:'0 0 3px',letterSpacing:-0.3}}>{name}</h2>
          <p style={{fontSize:12,color:CYAN,margin:'0 0 2px',fontWeight:500}}>{email||'—'}</p>
          <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',margin:'0 0 18px'}}>
            {isPet?`🐾 ${record.breed||'Mascota'} · ${record.size||''}`
            :isMinor?'👶 Menor de edad'
            :isPlayer?`${playerTeam?.sport==='tenis'?'🎾':'⚽'} ${playerTeam?.team_name||`Equipo ${(playerTeam as any)?.team_slot||1}`} · ${playerTeam?.sport||''}`
            :(record.ticket_type||record.plan_name||record.sport||'Participante')}
          </p>

          {/* Responsable — para niños, mascotas y jugadores menores */}
          {(isMinor||isPet||(isPlayer&&record.responsable_name))&&(
            <div style={{background:'rgba(255,179,0,0.08)',border:`1px solid rgba(255,179,0,0.2)`,borderRadius:12,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16}}>👨‍👩‍👧</span>
              <div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>Responsable</div>
                <div style={{fontSize:13,fontWeight:600,color:YELLOW}}>{responsableName||record.responsable_name||'—'}</div>
                {(responsablePhone||record.responsable_phone)&&<div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>{responsablePhone||record.responsable_phone}</div>}
              </div>
            </div>
          )}

          {/* Info fields */}
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:18,textAlign:'left'}}>
            {phone&&<div style={{background:'rgba(255,255,255,0.05)',border:`1px solid rgba(0,188,212,0.15)`,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16,color:CYAN,flexShrink:0}}>📱</span>
              <div><div style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>Teléfono</div><div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{phone}</div></div>
            </div>}
            {docId&&<div style={{background:'rgba(255,255,255,0.05)',border:`1px solid rgba(0,188,212,0.15)`,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16,color:CYAN,flexShrink:0}}>🪪</span>
              <div><div style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>{record.ti?'T.I.':'Cédula'}</div><div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{docId}</div></div>
            </div>}
            {isMinor&&record.birthdate&&<div style={{background:'rgba(255,255,255,0.05)',border:`1px solid rgba(0,188,212,0.15)`,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16,color:CYAN,flexShrink:0}}>🎂</span>
              <div><div style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>Fecha de nacimiento</div><div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{fmtDate(record.birthdate)}</div></div>
            </div>}
            {isPet&&record.age&&<div style={{background:'rgba(255,255,255,0.05)',border:`1px solid rgba(0,188,212,0.15)`,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16,color:CYAN,flexShrink:0}}>🐾</span>
              <div><div style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>Edad · Tamaño</div><div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{record.age} · {record.size}</div></div>
            </div>}
            {amount>0&&!isPet&&!isMinor&&<div style={{background:'rgba(255,255,255,0.05)',border:`1px solid rgba(0,188,212,0.15)`,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16,color:CYAN,flexShrink:0}}>💳</span>
              <div><div style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>Pago · Monto</div>
              <div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{PL[record.payment_method||record.payment_provider||'']||'—'} · <span style={{color:GREEN,fontWeight:600}}>{fmtCOP(amount)}</span></div></div>
            </div>}
          </div>

          {/* Participación — círculos */}
          <div style={{marginBottom:18}}>
            <p style={{fontSize:9,color:'rgba(255,255,255,0.4)',letterSpacing:'0.08em',textTransform:'uppercase',margin:'0 0 12px'}}>Participación en el evento</p>
            <div style={{display:'flex',justifyContent:'center',gap:10}}>
              {sections.map(s=>(
                <motion.div key={s.id} onClick={()=>setActiveSection(activeSection===s.id?null:s.id)}
                  whileHover={{scale:1.1,y:-3}} whileTap={{scale:0.95}}
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',opacity:s.active?1:0.28}}>
                  <div style={{
                    position:'relative',width:54,height:54,borderRadius:'50%',
                    background:s.active?(activeSection===s.id?`rgba(0,188,212,0.35)`:`rgba(0,188,212,0.18)`):'rgba(255,255,255,0.04)',
                    border:`2px solid ${s.active?CYAN:'rgba(255,255,255,0.1)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    boxShadow:s.active?`0 0 16px rgba(0,188,212,0.3),0 0 0 4px rgba(0,188,212,0.08)`:'none',
                    transition:'all 0.2s'
                  }}>
                    <span style={{fontSize:24,filter:s.active?'none':'grayscale(1)'}}>{s.icon}</span>
                    {s.count>0&&<div style={{position:'absolute',top:-4,right:-4,width:17,height:17,borderRadius:'50%',background:GREEN,border:`2px solid ${NAVY}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:9,fontWeight:700,color:'white'}}>{s.count}</span>
                    </div>}
                  </div>
                  <span style={{fontSize:9,color:s.active?CYAN:'rgba(255,255,255,0.4)',fontWeight:s.active?600:400}}>{s.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Panel sección activa */}
          <AnimatePresence>
            {activeSection&&activeS&&(
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                style={{marginBottom:16,borderRadius:16,overflow:'hidden',border:`1px solid rgba(0,188,212,0.2)`}}>
                <div style={{background:'rgba(0,188,212,0.08)',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:CYAN}}>{activeS.icon} {activeS.label}</span>
                  {activeSection!=='mascotas'&&(
                    <button onClick={()=>setCreateSection(activeSection)}
                      style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:'rgba(0,188,212,0.2)',border:`1px solid rgba(0,188,212,0.3)`,color:CYAN,cursor:'pointer',fontWeight:600}}>
                      ➕ Agregar
                    </button>
                  )}
                </div>
                {activeS.records.length===0
                  ?<div style={{padding:'14px',textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.3)'}}>Sin registros</div>
                  :activeS.records.map((r:any,i:number)=>{
                    // Para 5K mostrar estructura de grupo completa
                    if(activeSection==='5k'){
                      const grpAttendees=allData.attendees.filter((a:Attendee)=>a.registration_id===r.id)
                      const adults=grpAttendees.filter((a:Attendee)=>!a.is_minor)
                      const minors=grpAttendees.filter((a:Attendee)=>a.is_minor)
                      const grpPets=allData.pets.filter((p:Pet)=>p.registration_id===r.id)
                      return (
                        <div key={i}>
                          <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div>
                              <div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{r.full_name}</div>
                              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{r.ticket_type} · {fmtDate(r.created_at)}</div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <Badge status={r.status}/>
                              {(r.amount_cents||r.total_amount)?<span style={{fontSize:11,fontWeight:700,color:'#10b981'}}>{fmtCOP(r.amount_cents||r.total_amount)}</span>:null}
                            </div>
                          </div>
                          {grpAttendees.length>0&&(
                            <div style={{padding:'4px 14px 8px 28px',background:'rgba(0,0,0,0.15)'}}>
                              {adults.map((a:Attendee)=>(
                                <div key={a.id} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                                  <span style={{fontSize:11}}>{a.is_primary?'👑':'👤'}</span>
                                  <div style={{flex:1}}>
                                    <span style={{fontSize:11,fontWeight:600,color:'#e2e8f0'}}>{a.full_name}</span>
                                    {a.is_primary&&<span style={{fontSize:9,marginLeft:4,color:CYAN}}>Titular</span>}
                                    <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginLeft:6}}>{a.document_id||''}</span>
                                  </div>
                                  <span style={{fontSize:10,color:'#10b981'}}>{fmtCOP(a.amount_cents)}</span>
                                </div>
                              ))}
                              {minors.map((a:Attendee)=>(
                                <div key={a.id} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                                  <span style={{fontSize:11}}>👶</span>
                                  <div style={{flex:1}}>
                                    <span style={{fontSize:11,fontWeight:600,color:'#fbbf24'}}>{a.full_name}</span>
                                    <span style={{fontSize:9,marginLeft:4,color:'#fbbf24'}}>Niño</span>
                                    {a.birthdate&&<span style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginLeft:6}}>Nac: {fmtDate(a.birthdate)}</span>}
                                  </div>
                                  <span style={{fontSize:10,color:'#fbbf24'}}>{fmtCOP(a.amount_cents)}</span>
                                </div>
                              ))}
                              {grpPets.map((p:Pet)=>(
                                <div key={p.id} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                                  <span style={{fontSize:11}}>🐾</span>
                                  <div style={{flex:1}}>
                                    <span style={{fontSize:11,fontWeight:600,color:'#10b981'}}>{p.name}</span>
                                    <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginLeft:6}}>{p.breed} · {p.size}</span>
                                  </div>
                                  {p.photo_url&&<img src={p.photo_url} style={{width:24,height:24,borderRadius:4,objectFit:'cover'}} alt={p.name}/>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }
                    return (
                      <div key={i} style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{r.name||r.full_name||r.brand_name||r.captain_name||r.company_name||'—'}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{r.breed||r.ticket_type||r.plan_name||r.sport||fmtDate(r.created_at)}</div>
                        </div>
                        {r.status&&<Badge status={r.status}/>}
                      </div>
                    )
                  })
                }
              </motion.div>
            )}
          </AnimatePresence>

          {/* Docs badges */}
          <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:16,flexWrap:'wrap'}}>
            {hasCedula
              ?<a href={record.cedula_url} target="_blank" rel="noreferrer" style={{background:'rgba(0,188,212,0.1)',border:`1px solid rgba(0,188,212,0.3)`,borderRadius:20,padding:'4px 10px',fontSize:10,color:CYAN,fontWeight:500,textDecoration:'none'}}>📄 Ver CC</a>
              :<span style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,padding:'4px 10px',fontSize:10,color:'#f87171',fontWeight:500}}>✗ Sin CC</span>}
            {hasRut
              ?<a href={record.rut_url} target="_blank" rel="noreferrer" style={{background:'rgba(0,188,212,0.1)',border:`1px solid rgba(0,188,212,0.3)`,borderRadius:20,padding:'4px 10px',fontSize:10,color:CYAN,fontWeight:500,textDecoration:'none'}}>📄 Ver RUT</a>
              :<span style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,padding:'4px 10px',fontSize:10,color:'#f87171',fontWeight:500}}>✗ Sin RUT</span>}
            {contractAt
              ?<span style={{background:'rgba(76,175,80,0.12)',border:`1px solid rgba(76,175,80,0.3)`,borderRadius:20,padding:'4px 10px',fontSize:10,color:GREEN,fontWeight:500}}>✓ Contrato firmado</span>
              :<span style={{background:'rgba(255,179,0,0.12)',border:`1px solid rgba(255,179,0,0.3)`,borderRadius:20,padding:'4px 10px',fontSize:10,color:YELLOW,fontWeight:500}}>⚠ Sin contrato</span>}
          </div>

          {/* Botones acción */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            {!isOk(record.status)
              ?<button onClick={onApprove} style={{background:`linear-gradient(135deg,${CYAN},#0097A7)`,border:'none',borderRadius:12,padding:12,fontSize:12,fontWeight:600,color:'white',cursor:'pointer'}}>✅ Aprobar</button>
              :<button disabled style={{background:'rgba(76,175,80,0.15)',border:`1px solid rgba(76,175,80,0.3)`,borderRadius:12,padding:12,fontSize:12,fontWeight:600,color:GREEN,cursor:'default'}}>✓ Aprobado</button>}
            <button onClick={()=>setEditingBase(true)} style={{background:`rgba(0,188,212,0.1)`,border:`1px solid rgba(0,188,212,0.35)`,borderRadius:12,padding:12,fontSize:12,fontWeight:600,color:CYAN,cursor:'pointer'}}>✏️ Editar</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
            <button onClick={onContract} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:12,fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.55)',cursor:'pointer'}}>📝 Contrato</button>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:12,fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.55)',cursor:'pointer'}}>✕ Cerrar</button>
          </div>

          {/* Footer logo */}
          <div style={{borderTop:`1px solid rgba(0,188,212,0.12)`,paddingTop:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <img src={LOGO_URL} style={{height:28,objectFit:'contain'}} alt="Latido y Huella"/>
            <span style={{fontSize:10,color:'rgba(255,255,255,0.25)'}}>26 Jul 2026 · Llanogrande</span>
          </div>
        </div>
      </motion.div>

      {editingBase&&<AnimatePresence><EditModal record={record} table={table} fields={editFields} title="Editar datos" onClose={()=>setEditingBase(false)} onSaved={()=>{onSaved();setEditingBase(false)}}/></AnimatePresence>}
      {createSection&&(()=>{const c=getCreateFields(createSection);return c?<AnimatePresence><CreateModal table={c.table} fields={c.fields} title={c.title} defaults={c.defaults} onClose={()=>setCreateSection(null)} onSaved={()=>{onSaved();setCreateSection(null)}}/></AnimatePresence>:null})()}
    </motion.div>
  )
}



// ─── LOGO EDIT MODAL ──────────────────────────────────────────────────────────
function LogoEditModal({logo,onClose,onSaved}:{logo:PublicSponsor;onClose:()=>void;onSaved:()=>void}) {
  const [name,setName]=useState(logo.name);const [tier,setTier]=useState(logo.tier)
  const [order,setOrder]=useState(logo.display_order);const [active,setActive]=useState(logo.is_active)
  const [saving,setSaving]=useState(false);const [msg,setMsg]=useState('')
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">✏️ Editar marca</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex items-center gap-4 mb-5 bg-white/5 rounded-xl p-4">
          <div className="w-14 h-14 bg-white rounded-xl p-2 flex-shrink-0"><img src={logo.logo_url} alt={logo.name} className="w-full h-full object-contain"/></div>
          <div className="text-xs text-gray-400">{logo.name}</div>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-400 mb-1 block">Nombre</label><input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Categoría</label>
            <select className="w-full bg-[#12122a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" value={tier} onChange={e=>setTier(e.target.value)}>
              {TIERS.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Orden</label><input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" value={order} onChange={e=>setOrder(Number(e.target.value))}/></div>
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <span className="text-sm text-white">Visible en web</span>
            <button onClick={()=>setActive(!active)} className={`w-12 h-6 rounded-full relative transition-colors ${active?'bg-emerald-500':'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all ${active?'right-0.5':'left-0.5'}`}/>
            </button>
          </div>
        </div>
        {msg&&<div className={`mt-3 text-xs rounded-xl px-3 py-2 ${msg.startsWith('✓')?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{msg}</div>}
        <div className="flex gap-2 mt-5">
          <button disabled={saving} onClick={async()=>{
            setSaving(true);setMsg('')
            const {error}=await supabase.from('public_sponsors').update({name,tier,display_order:order,is_active:active}).eq('id',logo.id)
            setSaving(false)
            if(error){setMsg(`Error: ${error.message}`)}else{setMsg('✓ Guardado');onSaved();setTimeout(onClose,700)}
          }} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
            {saving?'Guardando...':'💾 Guardar'}
          </button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cancelar</button>
        </div>
      </div>
    </Modal>
  )
}

// ─── TEAM MODAL ───────────────────────────────────────────────────────────────
function TeamModal({team,players,onClose,onSaved}:{team:SportTeam;players:SportPlayer[];onClose:()=>void;onSaved:()=>void}) {
  const [editing,setEditing]=useState(false)
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">{team.sport==='futbol'?'⚽':'🎾'}</div>
            <div>
              <h3 className="text-lg font-bold text-white">{team.team_name||team.captain_name}</h3>
              <span className="text-xs text-gray-400">{team.sport.toUpperCase()} · {team.category||'Pádel'} · {team.player_count} jugadores</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{l:'Capitán',v:team.captain_name,i:'👑'},{l:'Email',v:team.captain_email,i:'📧'},{l:'Teléfono',v:team.captain_phone,i:'📱'},{l:'Estado',v:<Badge status={team.status}/>,i:'🔖'},{l:'Monto',v:fmtCOP(team.amount_cents),i:'💰'},{l:'Fecha',v:fmtDate(team.created_at),i:'📅'}].map((item,i)=>(
            <div key={i} className="bg-white/5 rounded-xl p-3"><div className="text-xs text-gray-500 mb-1">{item.i} {item.l}</div><div className="text-sm font-semibold text-white">{item.v}</div></div>
          ))}
        </div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">👥 Jugadores ({players.length})</h4>
        <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
          {!players.length&&<div className="text-xs text-gray-600 text-center py-6">Sin jugadores</div>}
          {players.map(p=>(
            <div key={p.id} className="bg-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 w-5">{p.player_index}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white flex items-center gap-2">{p.name}{p.is_captain&&<span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Cap</span>}</div>
                <div className="text-xs text-gray-500">{p.cedula&&`CC:${p.cedula} `}{p.ti&&`TI:${p.ti} `}{p.age&&`· ${p.age}a`}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button onClick={()=>setEditing(true)} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-500">✏️ Editar equipo</button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cerrar</button>
        </div>
      </div>
      {editing&&<AnimatePresence><EditModal record={team} table="sports_team_registrations"
        fields={[{key:'captain_name',label:'Capitán'},{key:'captain_email',label:'Email'},{key:'captain_phone',label:'Teléfono'},{key:'team_name',label:'Nombre equipo'},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'payment_method',label:'Pago',options:PM}]}
        title="Editar equipo" onClose={()=>setEditing(false)} onSaved={()=>{onSaved();setEditing(false)}}/></AnimatePresence>}
    </Modal>
  )
}

// ─── TABLA ────────────────────────────────────────────────────────────────────
function DTable({headers,children,empty}:{headers:string[];children:React.ReactNode;empty?:boolean}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{background:'#0b0b1a',border:'1px solid rgba(255,255,255,0.06)'}}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{minWidth:600}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {headers.map((h,i)=><th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {empty&&<div className="text-center py-12 text-gray-600 text-sm">Sin registros aún</div>}
    </div>
  )
}
function TR({children}:{children:React.ReactNode}) {
  return <tr style={{borderTop:'1px solid rgba(255,255,255,0.04)'}} className="hover:bg-white/[0.025] transition-colors">{children}</tr>
}
function TD({children,cls=''}:{children:React.ReactNode;cls?:string}) {
  return <td className={`px-4 py-3 text-gray-300 ${cls}`}>{children}</td>
}
function Tabs({options,value,onChange}:{options:{id:string;label:string;count?:number}[];value:string;onChange:(v:string)=>void}) {
  return (
    <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{background:'rgba(255,255,255,0.05)'}}>
      {options.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)}
          className="px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap"
          style={value===t.id?{background:'rgba(16,185,129,0.2)',color:'#10b981',border:'1px solid rgba(16,185,129,0.3)'}:{color:'#6b7280'}}>
          {t.label}{t.count!==undefined&&<span className="ml-1 text-xs opacity-60">({t.count})</span>}
        </button>
      ))}
    </div>
  )
}

// ─── DELETE MODAL — con fricción ─────────────────────────────────────────────
function DeleteModal({record,table,onClose,onDeleted}:{record:any;table:string;onClose:()=>void;onDeleted:()=>void}) {
  const [deleting,setDeleting]=useState(false);const [result,setResult]=useState<{ok:boolean;msg:string}|null>(null)
  const name=record.full_name||record.responsible_name||record.brand_name||record.company_name||record.captain_name||record.name||'—'
  const doDelete=async()=>{
    setDeleting(true);setResult(null)
    const {error}=await supabase.from(table).update({deleted_at:new Date().toISOString()}).eq('id',record.id)
    setDeleting(false)
    if(error){setResult({ok:false,msg:error.message})}
    else{setResult({ok:true,msg:'✓ Movido a papelera'});onDeleted();setTimeout(onClose,800)}
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">🗑️ Mover a papelera</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
          <div className="text-sm font-bold text-white mb-1">{name}</div>
          <div className="text-xs text-gray-400">Este registro será movido a la papelera. Podrás restaurarlo después.</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-xs text-amber-400">
          ⚠️ El registro desaparecerá de todas las vistas del dashboard pero NO se eliminará permanentemente.
        </div>
        {result&&<div className={`mb-4 text-xs rounded-xl px-3 py-2.5 font-medium ${result.ok?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{result.msg}</div>}
        <div className="flex gap-2">
          <button onClick={doDelete} disabled={deleting||result?.ok}
            className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-500 disabled:opacity-50">
            {deleting?'Moviendo...':'🗑️ Sí, mover a papelera'}
          </button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cancelar</button>
        </div>
      </div>
    </Modal>
  )
}

// ─── HARD DELETE MODAL — doble confirmación ───────────────────────────────────
function HardDeleteModal({record,table,onClose,onDeleted}:{record:any;table:string;onClose:()=>void;onDeleted:()=>void}) {
  const [confirm,setConfirm]=useState('');const [deleting,setDeleting]=useState(false)
  const name=record.full_name||record.responsible_name||record.brand_name||record.company_name||record.captain_name||record.name||'—'
  const doHardDelete=async()=>{
    if(confirm!=='ELIMINAR')return
    setDeleting(true)
    await supabase.from(table).delete().eq('id',record.id)
    setDeleting(false)
    onDeleted();onClose()
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-red-400">⛔ Eliminar permanentemente</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <div className="text-sm font-bold text-white mb-1">{name}</div>
          <div className="text-xs text-red-400 font-bold">⛔ Esta acción es IRREVERSIBLE. El registro se eliminará para siempre.</div>
        </div>
        <label className="text-xs text-gray-400 mb-1.5 block">Escribe <span className="font-bold text-red-400">ELIMINAR</span> para confirmar</label>
        <input className="w-full bg-white/5 border border-red-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 mb-5"
          placeholder="ELIMINAR" value={confirm} onChange={e=>setConfirm(e.target.value)}/>
        <div className="flex gap-2">
          <button onClick={doHardDelete} disabled={confirm!=='ELIMINAR'||deleting}
            className="flex-1 bg-red-700 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-600 disabled:opacity-30">
            {deleting?'Eliminando...':'⛔ Eliminar permanentemente'}
          </button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cancelar</button>
        </div>
      </div>
    </Modal>
  )
}


// ─── STAND STATUS BTN — dropdown inline ──────────────────────────────────────
function StandStatusBtn({record,table,onSaved}:{record:any;table:string;onSaved:()=>void}) {
  const [open,setOpen]=useState(false)
  const [saving,setSaving]=useState(false)

  const STAND_STATES=[
    {value:'available',label:'Disponible',color:'#10b981',bg:'rgba(16,185,129,0.15)'},
    {value:'pending_payment',label:'Reservado',color:'#f59e0b',bg:'rgba(245,158,11,0.15)'},
    {value:'approved',label:'Vendido',color:'#60a5fa',bg:'rgba(59,130,246,0.15)'},
    {value:'paid',label:'Pagado',color:'#4ade80',bg:'rgba(74,222,128,0.15)'},
    {value:'expired',label:'Expirado',color:'#fb923c',bg:'rgba(249,115,22,0.15)'},
    {value:'declined',label:'Rechazado',color:'#f87171',bg:'rgba(239,68,68,0.15)'},
  ]
  const current=STAND_STATES.find(s=>s.value===record.status)||STAND_STATES[1]

  const changeStatus=async(newStatus:string)=>{
    setSaving(true);setOpen(false)
    await supabase.from(table).update({status:newStatus}).eq('id',record.id)
    setSaving(false);onSaved()
  }

  return (
    <div style={{position:'relative',display:'inline-block'}}>
      <button onClick={()=>setOpen(!open)} disabled={saving}
        style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:8,fontSize:11,fontWeight:700,background:current.bg,color:current.color,border:`1px solid ${current.color}40`,cursor:'pointer',whiteSpace:'nowrap'}}>
        {saving?'...':<>{current.label} ▾</>}
      </button>
      {open&&(
        <>
          <div style={{position:'fixed',inset:0,zIndex:998}} onClick={()=>setOpen(false)}/>
          <div style={{position:'absolute',top:'100%',left:0,marginTop:4,zIndex:999,borderRadius:12,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)',background:'#12122a',border:'1px solid rgba(255,255,255,0.15)',minWidth:140}}>
            {STAND_STATES.map(s=>(
              <button key={s.value} onClick={()=>changeStatus(s.value)}
                style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 12px',fontSize:12,fontWeight:600,color:s.color,background:'transparent',border:'none',cursor:'pointer',textAlign:'left'}}
                onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}
                onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
                <span style={{width:8,height:8,borderRadius:'50%',background:s.color,display:'inline-block',flexShrink:0}}/>
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── ORBITAL MENU — responsive con ResizeObserver ────────────────────────────
function OrbitalMenu({dark,br,tp,orbNodes,onNavigate}:{dark:boolean;br:string;tp:string;ts?:string;orbNodes:any[];onNavigate:(p:string)=>void}) {
  const containerRef=useRef<HTMLDivElement>(null)
  const [size,setSize]=useState({w:800,h:500})

  useEffect(()=>{
    const el=containerRef.current; if(!el) return
    const ro=new ResizeObserver(entries=>{
      const e=entries[0]; if(e) setSize({w:e.contentRect.width,h:e.contentRect.height})
    })
    ro.observe(el)
    setSize({w:el.offsetWidth,h:el.offsetHeight})
    return()=>ro.disconnect()
  },[])

  // Radio máximo que cabe en el contenedor con margen para los nodos
  const maxR=Math.min(size.w/2, size.h/2) - 100
  const dynR=Math.max(100, Math.min(maxR, 240))
  const scale=dynR/160
  const logoS=Math.round(Math.min(130, 80*scale))
  const logoImg=Math.round(Math.min(80, 50*scale))
  const iconS=Math.round(Math.min(72, 44*scale))
  const emojiS=Math.round(Math.min(30, 20*scale))
  const nodeW=Math.round(Math.min(90, 60*scale))
  const fontSize=Math.max(10, Math.round(12*scale))

  return (
    <div ref={containerRef} className="relative mb-6 rounded-2xl flex items-center justify-center"
      style={{height:'calc(100vh - 340px)',minHeight:460,maxHeight:600,background:dark?'linear-gradient(135deg,#0d0d1f,#0a0a14)':'linear-gradient(135deg,#f0fdf4,#ecfdf5)',border:`1px solid ${br}`,overflow:'hidden'}}>
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 50%,rgba(5,150,105,0.12),transparent 65%)'}}/>
      {[dynR*2,dynR*2.9].map((s,i)=>(
        <motion.div key={i} animate={{rotate:i%2===0?360:-360}} transition={{duration:i===0?80:120,repeat:Infinity,ease:'linear'}}
          className="absolute rounded-full pointer-events-none" style={{width:s,height:s,border:'1px dashed rgba(16,185,129,0.12)'}}/>
      ))}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(16,185,129,0.5)"/><stop offset="100%" stopColor="rgba(16,185,129,0.03)"/></linearGradient></defs>
        {orbNodes.map((n:any,i:number)=>{const r=(n.angle*Math.PI)/180;return <motion.line key={i} x1="50%" y1="50%" x2={`${50+Math.cos(r)*32}%`} y2={`${50+Math.sin(r)*38}%`} stroke="url(#lg1)" strokeWidth="1" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3+i*0.1}}/>})}
      </svg>
      {/* Logo central */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="absolute rounded-full blur-3xl" style={{inset:-40,background:'rgba(5,150,105,0.25)'}}/>
        <motion.div animate={{y:[0,-8,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut'}}>
          <div className="rounded-full flex items-center justify-center" style={{width:logoS,height:logoS,background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 0 60px rgba(5,150,105,0.6)'}}>
            <img src="/Logo_latido_y_huella_ICONO_blanco.png" style={{width:logoImg,height:logoImg,objectFit:'contain'}} alt="" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          </div>
        </motion.div>
      </div>
      {/* Nodos orbitales */}
      {orbNodes.map((n:any,i:number)=>{
        const r=(n.angle*Math.PI)/180
        const x=Math.cos(r)*dynR; const y=Math.sin(r)*dynR
        const half=nodeW/2
        return (
          <motion.button key={i} onClick={()=>onNavigate(n.page)}
            initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
            transition={{type:'spring',stiffness:120,damping:12,delay:0.3+i*0.1}}
            whileHover={{scale:1.15,y:-5}} whileTap={{scale:0.95}}
            className="absolute flex flex-col items-center gap-1.5 group"
            style={{left:`calc(50% + ${x}px - ${half+10}px)`,top:`calc(50% + ${y}px - ${half+16}px)`,width:nodeW+20,zIndex:10}}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity" style={{background:'rgba(16,185,129,0.35)'}}/>
              <div className="rounded-2xl flex items-center justify-center relative z-10"
                style={{width:iconS,height:iconS,fontSize:emojiS,background:dark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.9)',border:`1px solid ${br}`,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
                {n.emoji}
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold group-hover:text-emerald-400 transition-colors whitespace-nowrap" style={{color:tp,fontSize}}>{n.label}</div>
              <div className="font-black mt-0.5 px-2 py-0.5 rounded-full" style={{background:'rgba(16,185,129,0.2)',color:'#10b981',fontSize:Math.max(9,fontSize-2)}}>{n.count}</div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── PAPELERA PAGE ────────────────────────────────────────────────────────────
function PapeleraPage({dark,br,tp,ts,card,onHardDelete,onRestore}:{dark:boolean;br:string;tp:string;ts:string;card:string;onHardDelete:(r:any,t:string)=>void;onRestore:()=>void}) {
  const [trashData,setTrashData]=useState<{records:any[];table:string;cat:string}[]>([])
  const [trashLoading,setTrashLoading]=useState(true)
  const [trashTab,setTrashTab]=useState('all')

  const loadTrash=useCallback(async()=>{
    setTrashLoading(true)
    const tables=[
      {table:'registrations_5k',cat:'🐾 Caminata 5K'},
      {table:'registration_pets',cat:'🐶 Mascotas'},
      {table:'expositor_reservations',cat:'🏪 Expositores'},
      {table:'toldos_reservations',cat:'⛺ Toldos'},
      {table:'sponsor_inquiries',cat:'⭐ Patrocinadores'},
      {table:'sports_team_registrations',cat:'⚽ Deportes'},
    ]
    const results=await Promise.all(tables.map(async t=>{
      const {data}=await supabase.from(t.table).select('*').not('deleted_at','is',null).order('deleted_at',{ascending:false})
      return{...t,records:data||[]}
    }))
    setTrashData(results)
    setTrashLoading(false)
  },[])

  useEffect(()=>{loadTrash()},[loadTrash])

  const allDeleted=trashData.flatMap(t=>t.records.map(r=>({...r,_cat:t.cat,_table:t.table})))
  const filtered=trashTab==='all'?allDeleted:allDeleted.filter(r=>r._table===trashTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{color:tp}}>🗑️ Papelera</h1>
          <p className="text-sm mt-0.5" style={{color:ts}}>{allDeleted.length} registros eliminados</p>
        </div>
      </div>
      <Tabs value={trashTab} onChange={setTrashTab} options={[
        {id:'all',label:'Todos',count:allDeleted.length},
        {id:'registrations_5k',label:'🐾 5K',count:trashData.find(t=>t.table==='registrations_5k')?.records.length||0},
        {id:'expositor_reservations',label:'🏪 Stands',count:trashData.find(t=>t.table==='expositor_reservations')?.records.length||0},
        {id:'toldos_reservations',label:'⛺ Toldos',count:trashData.find(t=>t.table==='toldos_reservations')?.records.length||0},
        {id:'sports_team_registrations',label:'⚽ Deportes',count:trashData.find(t=>t.table==='sports_team_registrations')?.records.length||0},
      ]}/>
      {trashLoading
        ?<div className="text-center py-12 text-gray-500">Cargando papelera...</div>
        :!filtered.length
        ?<div className="text-center py-16 rounded-2xl" style={{background:card,border:`1px solid ${br}`}}>
          <div className="text-4xl mb-3">🗑️</div>
          <div className="text-sm font-bold" style={{color:tp}}>Papelera vacía</div>
          <div className="text-xs mt-1" style={{color:ts}}>No hay registros eliminados</div>
        </div>
        :<DTable headers={['Categoría','Nombre','Email','Eliminado el','']}>
          {filtered.map((r,i)=>{
            const name=r.full_name||r.responsible_name||r.brand_name||r.company_name||r.captain_name||r.name||'—'
            const email=r.email||r.captain_email||'—'
            return (
              <TR key={i}>
                <TD><span className="text-xs px-2 py-1 rounded-lg" style={{background:'rgba(255,255,255,0.06)'}}>{r._cat}</span></TD>
                <TD cls="font-semibold">{name}</TD>
                <TD cls="text-xs" style={{color:ts}}>{email}</TD>
                <TD cls="text-xs" style={{color:ts}}>{r.deleted_at?new Date(r.deleted_at).toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'2-digit'}):'—'}</TD>
                <TD><div className="flex gap-1">
                  <Btn icon="♻️" label="Restaurar" color="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" onClick={async()=>{
                    await supabase.from(r._table).update({deleted_at:null}).eq('id',r.id)
                    onRestore()
                    loadTrash()
                  }}/>
                  <Btn icon="⛔" label="Eliminar" color="bg-red-500/15 text-red-400 hover:bg-red-500/25" onClick={()=>onHardDelete(r,r._table)}/>
                </div></TD>
              </TR>
            )
          })}
        </DTable>
      }
    </div>
  )
}

// ─── EMAILS PAGE ─────────────────────────────────────────────────────────────
const CAT_LABELS:Record<string,string>={
  '5k':'🐾 Caminata 5K','stand':'🏪 Stand','foodtruck':'🚚 Food Truck',
  'toldo':'⛺ Toldo','deporte':'⚽ Deporte','sponsor':'⭐ Patrocinador','general':'📧 General'
}
const VARIABLES=[
  '{{nombre}}','{{email}}','{{tipo_registro}}','{{monto}}','{{estado_pago}}',
  '{{fecha_evento}}','{{lugar_evento}}','{{stand_id}}','{{nombre_equipo}}',
  '{{deporte}}','{{num_jugadores}}','{{nombre_mascota}}','{{empresa}}',
  '{{plan_nombre}}','{{area_m2}}','{{cantidad_toldos}}'
]

function EmailsPage({dark,br,tp,ts,card,regs5k,expositores,toldos,sponsors,teams}:{
  dark:boolean;br:string;tp:string;ts:string;card:string;
  regs5k:Reg5k[];expositores:Expositor[];toldos:Toldo[];sponsors:Sponsor[];teams:SportTeam[]
}) {
  const [templates,setTemplates]=useState<EmailTemplate[]>([])
  const [logs,setLogs]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [editingTpl,setEditingTpl]=useState<EmailTemplate|null>(null)
  const [isNew,setIsNew]=useState(false)
  const [preview,setPreview]=useState(false)
  const [saving,setSaving]=useState(false)
  const [sending,setSending]=useState(false)
  const [sendModal,setSendModal]=useState<{template:EmailTemplate}|null>(null)
  const [sendTarget,setSendTarget]=useState<'category'|'single'>('category')
  const [singleEmail,setSingleEmail]=useState('')
  const [fromEmail,setFromEmail]=useState('eventos@latidoyhuella.co')
  const [sendResult,setSendResult]=useState<{ok:boolean;msg:string}|null>(null)
  const [activeTab,setActiveTab]=useState<'plantillas'|'historial'>('plantillas')
  const [previewEmail,setPreviewEmail]=useState<any>(null)

  const FROM_OPTIONS=['eventos@latidoyhuella.co','contacto@latidoyhuella.co','noresponder@latidoyhuella.co']

  const loadAll=useCallback(async()=>{
    setLoading(true)
    const [tRes,lRes]=await Promise.all([
      supabase.from('email_templates').select('*').order('created_at'),
      supabase.from('email_logs').select('*').order('sent_at',{ascending:false}).limit(100)
    ])
    if(tRes.data) setTemplates(tRes.data)
    if(lRes.data) setLogs(lRes.data)
    setLoading(false)
  },[])

  useEffect(()=>{loadAll()},[loadAll])

  // Real-time email logs
  useEffect(()=>{
    const channel=supabase.channel('email_logs_rt')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'email_logs'},()=>{
        supabase.from('email_logs').select('*').order('sent_at',{ascending:false}).limit(100)
          .then(({data})=>{if(data)setLogs(data)})
      })
      .subscribe()
    return ()=>{supabase.removeChannel(channel)}
  },[])

  const saveTemplate=async()=>{
    if(!editingTpl) return
    setSaving(true)
    if(isNew){
      await supabase.from('email_templates').insert({...editingTpl,id:undefined})
    } else {
      await supabase.from('email_templates').update({
        name:editingTpl.name,category:editingTpl.category,
        subject:editingTpl.subject,body_html:editingTpl.body_html,
        is_active:editingTpl.is_active,updated_at:new Date().toISOString()
      }).eq('id',editingTpl.id)
    }
    setSaving(false);setEditingTpl(null);loadAll()
  }

  const deleteTemplate=async(id:string)=>{
    if(!confirm('¿Eliminar esta plantilla?')) return
    await supabase.from('email_templates').delete().eq('id',id)
    loadAll()
  }

  const replaceVars=(html:string,data:Record<string,string>)=>{
    let r=html
    Object.entries(data).forEach(([k,v])=>{ r=r.replace(new RegExp(k.replace(/[{}]/g,'\\$&'),'g'),v||'') })
    return r
  }

  const sendOne=async(template:EmailTemplate,to:string,toName:string,vars:Record<string,string>,skipIfSent=false)=>{
    // Control: no reenviar bienvenida si ya fue enviada
    if(skipIfSent){
      const alreadySent=logs.some(l=>l.to_email===to&&l.template_id===template.id)
      if(alreadySent) return 'skipped'
    }
    const html=replaceVars(template.body_html,vars)
    const subject=replaceVars(template.subject,vars)
    try {
      const res=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,{
        method:'POST',
        headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({to,subject,html,from:fromEmail,type:template.category})
      })
      if(res.ok){
        // Guardar log
        await supabase.from('email_logs').insert({
          template_id:template.id,template_name:template.name,
          to_email:to,to_name:toName,category:template.category,subject,body_html:html
        })
        return 'sent'
      }
      return 'failed'
    } catch { return 'failed' }
  }

  const handleSend=async()=>{
    if(!sendModal) return
    setSending(true);setSendResult(null)
    const template=sendModal.template
    const baseVars={'{{fecha_evento}}':'26 de julio de 2026','{{lugar_evento}}':'Llanogrande, Antioquia'}
    const isWelcome=template.name.toLowerCase().includes('confirmación')||template.name.toLowerCase().includes('bienvenid')
    let sent=0;let skipped=0;let failed=0

    if(sendTarget==='single'&&singleEmail){
      const r=await sendOne(template,singleEmail,'Participante',{...baseVars,'{{nombre}}':'Participante'},false)
      r==='sent'?sent++:r==='skipped'?skipped++:failed++
    } else {
      const cat=template.category
      let records:Array<{email:string;name:string;vars:Record<string,string>}>=[]
      if(cat==='5k'||cat==='general') regs5k.forEach(r=>records.push({email:r.email,name:r.full_name,vars:{...baseVars,'{{nombre}}':r.full_name,'{{monto}}':fmtCOP(r.amount_cents||r.total_amount||0),'{{tipo_registro}}':r.ticket_type||''}}))
      if(cat==='stand'||cat==='general') expositores.forEach(e=>records.push({email:e.email,name:e.responsible_name||e.brand_name,vars:{...baseVars,'{{nombre}}':e.responsible_name||e.brand_name,'{{stand_id}}':e.stand_id||'','{{monto}}':fmtCOP(e.amount_cents||0)}}))
      if(cat==='toldo'||cat==='general') toldos.forEach(t=>records.push({email:t.email,name:t.responsible_name||t.brand_name,vars:{...baseVars,'{{nombre}}':t.responsible_name||t.brand_name,'{{cantidad_toldos}}':String(t.quantity||1),'{{monto}}':fmtCOP(t.amount_cents||0)}}))
      if(cat==='deporte'||cat==='general') teams.forEach(t=>records.push({email:t.captain_email,name:t.captain_name,vars:{...baseVars,'{{nombre}}':t.captain_name,'{{nombre_equipo}}':t.team_name||t.captain_name,'{{deporte}}':t.sport||'','{{num_jugadores}}':String(t.player_count||0),'{{monto}}':fmtCOP(t.amount_cents||0)}}))
      if(cat==='sponsor'||cat==='general') sponsors.forEach(s=>records.push({email:s.email,name:s.contact_name||s.company_name,vars:{...baseVars,'{{nombre}}':s.contact_name||s.company_name,'{{empresa}}':s.company_name||'','{{plan_nombre}}':s.plan_name||'','{{monto}}':fmtCOP(s.amount_cents||0)}}))

      // Enviar en paralelo con límite de 5 a la vez
      const BATCH=5
      for(let i=0;i<records.length;i+=BATCH){
        const batch=records.slice(i,i+BATCH)
        const results=await Promise.all(batch.map(r=>sendOne(template,r.email,r.name,r.vars,isWelcome)))
        results.forEach(r=>r==='sent'?sent++:r==='skipped'?skipped++:failed++)
      }
    }

    setSending(false)
    setSendResult({
      ok:failed===0,
      msg:`✅ ${sent} enviados${skipped>0?` · ${skipped} ya tenían este email`:''}${failed>0?` · ⚠️ ${failed} fallidos`:''}`
    })
    loadAll()
    setTimeout(()=>{if(failed===0) setSendModal(null);setSendResult(null)},4000)
  }

  const [quickSend,setQuickSend]=useState(false)
  const [quickEmail,setQuickEmail]=useState('')
  const [quickSubject,setQuickSubject]=useState('')
  const [quickBody,setQuickBody]=useState('<p>Hola {{nombre}},</p>\n<p>Escribe tu mensaje aquí.</p>')
  const [quickTemplate,setQuickTemplate]=useState('')
  const [quickMode,setQuickMode]=useState<'simple'|'html'|'preview'>('simple')
  const [quickSending,setQuickSending]=useState(false)
  const [quickResult,setQuickResult]=useState<{ok:boolean;msg:string}|null>(null)

  const EMAIL_HEADER=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1B6E;border-radius:16px 16px 0 0;padding:24px;text-align:center"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:50px" alt="Latido y Huella"/></div><div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:white;padding:32px">`
  const EMAIL_FOOTER=`</div><div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1B6E;border-radius:0 0 16px 16px;padding:16px;text-align:center"><p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0">Latido y Huella · 26 Jul 2026 · Llanogrande, Antioquia</p></div>`

  const buildFullHtml=(body:string)=>{
    // Si el HTML ya tiene su propio header con el logo, no agregar otro
    const alreadyHasHeader = body.includes('6a0b45bdc474827cc4087698') || body.includes('background:#0D1B6E')
    if(alreadyHasHeader) return body
    return `${EMAIL_HEADER}${body}${EMAIL_FOOTER}`
  }

  const handleQuickSend=async()=>{
    if(!quickEmail||!quickSubject) return
    setQuickSending(true)
    const fullHtml=buildFullHtml(quickBody)
    try {
      const res=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,{
        method:'POST',
        headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({to:quickEmail,subject:quickSubject,html:fullHtml,from:fromEmail,type:'manual'})
      })
      if(res.ok){
        const tpl=templates.find(t=>t.id===quickTemplate)
        await supabase.from('email_logs').insert({
          template_id:tpl?.id||null,template_name:tpl?.name||'Email manual',
          to_email:quickEmail,to_name:quickEmail,category:'general',subject:quickSubject,body_html:fullHtml
        })
        setQuickResult({ok:true,msg:'✅ Email enviado'})
        loadAll()
        setTimeout(()=>{setQuickSend(false);setQuickResult(null);setQuickEmail('');setQuickSubject('');setQuickBody('<p>Hola {{nombre}},</p>\n<p>Escribe tu mensaje aquí.</p>');setQuickTemplate('')},2000)
      } else {
        setQuickResult({ok:false,msg:'⚠️ Error al enviar'})
      }
    } catch { setQuickResult({ok:false,msg:'⚠️ Error de conexión'}) }
    setQuickSending(false)
  }

  const [previewLog,setPreviewLog]=useState<any|null>(null)

  // ── Editor ────────────────────────────────────────────────────────────────
  if(editingTpl) return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={()=>setEditingTpl(null)} className="text-sm px-3 py-1.5 rounded-xl border hover:bg-white/5" style={{color:ts,borderColor:br}}>← Volver</button>
        <h1 className="text-xl font-black" style={{color:tp}}>{isNew?'Nueva plantilla':'Editar plantilla'}</h1>
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2 space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block" style={{color:ts}}>Nombre de la plantilla</label>
            <input className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{background:card,border:`1px solid ${br}`,color:tp}}
              value={editingTpl.name} onChange={e=>setEditingTpl({...editingTpl,name:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block" style={{color:ts}}>Categoría</label>
            <select className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{background:card,border:`1px solid ${br}`,color:tp}}
              value={editingTpl.category} onChange={e=>setEditingTpl({...editingTpl,category:e.target.value})}>
              {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k} className="bg-[#12122a]">{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block" style={{color:ts}}>Asunto del email</label>
            <input className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{background:card,border:`1px solid ${br}`,color:tp}}
              value={editingTpl.subject} onChange={e=>setEditingTpl({...editingTpl,subject:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs font-bold mb-2 block" style={{color:ts}}>Variables disponibles</label>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map(v=>(
                <button key={v} onClick={()=>setEditingTpl({...editingTpl,body_html:editingTpl.body_html+v})}
                  className="text-xs px-2 py-0.5 rounded-lg font-mono hover:opacity-80"
                  style={{background:'rgba(0,188,212,0.15)',color:'#00BCD4',border:'1px solid rgba(0,188,212,0.3)'}}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editingTpl.is_active} onChange={e=>setEditingTpl({...editingTpl,is_active:e.target.checked})} id="active"/>
            <label htmlFor="active" className="text-sm cursor-pointer" style={{color:tp}}>Plantilla activa</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveTemplate} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{background:'linear-gradient(135deg,#00BCD4,#0097A7)'}}>
              {saving?'Guardando...':'💾 Guardar'}
            </button>
            <button onClick={()=>setEditingTpl(null)} className="px-4 py-2.5 rounded-xl text-sm border" style={{color:ts,borderColor:br}}>Cancelar</button>
          </div>
        </div>
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold" style={{color:ts}}>Cuerpo del email (HTML)</label>
            <button onClick={()=>setPreview(!preview)}
              className="text-xs px-3 py-1 rounded-lg font-bold"
              style={{background:preview?'rgba(76,175,80,0.2)':'rgba(255,255,255,0.05)',color:preview?'#4CAF50':ts,border:`1px solid ${br}`}}>
              {preview?'✏️ Editar':'👁️ Preview'}
            </button>
          </div>
          {preview
            ?<div className="rounded-xl overflow-hidden border" style={{borderColor:br,height:'calc(100vh - 280px)'}}>
              <iframe srcDoc={editingTpl.body_html} className="w-full h-full" style={{border:'none',background:'white'}} title="preview"/>
            </div>
            :<textarea className="w-full rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none resize-none"
              style={{background:card,border:`1px solid ${br}`,color:tp,height:'calc(100vh - 280px)'}}
              value={editingTpl.body_html} onChange={e=>setEditingTpl({...editingTpl,body_html:e.target.value})}/>
          }
        </div>
      </div>
    </div>
  )

  // ── Vista principal ────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{color:tp}}>📧 Emails</h1>
          <p className="text-sm mt-0.5" style={{color:ts}}>{templates.length} plantillas · {logs.length} enviados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setQuickSend(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{background:'rgba(76,175,80,0.15)',color:'#4CAF50',border:'1px solid rgba(76,175,80,0.3)'}}>
            📤 Nuevo email
          </button>
          <button onClick={()=>{setIsNew(true);setEditingTpl({id:'',name:'',category:'general',subject:'',body_html:'<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">\n  <h1>Hola {{nombre}}</h1>\n  <p>Contenido del email aquí.</p>\n</div>',is_active:true,created_at:'',updated_at:''})}}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{background:'linear-gradient(135deg,#00BCD4,#0097A7)'}}>
            ➕ Nueva plantilla
          </button>
        </div>
      </div>

      {/* Composer — envío rápido estilo Gmail */}
      {quickSend&&(
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}}>
          <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}}
            className="w-full rounded-2xl overflow-hidden shadow-2xl"
            style={{maxWidth:760,background:'#0D1B6E',border:'1px solid rgba(0,188,212,0.2)'}}>
            {/* Header del composer */}
            <div className="flex items-center justify-between px-5 py-3" style={{background:'rgba(0,188,212,0.15)',borderBottom:'1px solid rgba(0,188,212,0.2)'}}>
              <div className="flex items-center gap-3">
                <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style={{height:28,objectFit:'contain'}} alt="Logo"/>
                <span className="font-bold text-sm text-white">Nuevo email</span>
              </div>
              <button onClick={()=>{setQuickSend(false);setQuickResult(null)}} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>

            <div className="p-5">
              {/* Campos Para / Asunto / Remitente */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 pb-2" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  <span className="text-xs font-bold w-16 text-right" style={{color:'rgba(255,255,255,0.4)'}}>Para</span>
                  <input className="flex-1 bg-transparent text-sm focus:outline-none text-white placeholder-gray-500"
                    placeholder="email@ejemplo.com"
                    value={quickEmail} onChange={e=>setQuickEmail(e.target.value)}/>
                </div>
                <div className="flex items-center gap-3 pb-2" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  <span className="text-xs font-bold w-16 text-right" style={{color:'rgba(255,255,255,0.4)'}}>Asunto</span>
                  <input className="flex-1 bg-transparent text-sm focus:outline-none text-white placeholder-gray-500"
                    placeholder="Asunto del email"
                    value={quickSubject} onChange={e=>setQuickSubject(e.target.value)}/>
                </div>
                <div className="flex items-center gap-3 pb-2" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  <span className="text-xs font-bold w-16 text-right" style={{color:'rgba(255,255,255,0.4)'}}>De</span>
                  <select className="flex-1 bg-transparent text-sm focus:outline-none text-white"
                    value={fromEmail} onChange={e=>setFromEmail(e.target.value)}>
                    {FROM_OPTIONS.map(o=><option key={o} value={o} className="bg-[#0D1B6E]">{o}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pb-2" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  <span className="text-xs font-bold w-16 text-right" style={{color:'rgba(255,255,255,0.4)'}}>Plantilla</span>
                  <select className="flex-1 bg-transparent text-sm focus:outline-none text-white"
                    value={quickTemplate}
                    onChange={e=>{
                      setQuickTemplate(e.target.value)
                      const tpl=templates.find(t=>t.id===e.target.value)
                      if(tpl){setQuickSubject(tpl.subject);setQuickBody(tpl.body_html)}
                    }}>
                    <option value="" className="bg-[#0D1B6E]">Sin plantilla (email libre)</option>
                    {templates.filter(t=>t.is_active).map(t=>(
                      <option key={t.id} value={t.id} className="bg-[#0D1B6E]">{CAT_LABELS[t.category]||t.category} · {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toolbar modos */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  {(['simple','html','preview'] as const).map(m=>(
                    <button key={m} onClick={()=>setQuickMode(m)}
                      className="text-xs px-3 py-1 rounded-lg font-bold"
                      style={{background:quickMode===m?'rgba(0,188,212,0.25)':'rgba(255,255,255,0.05)',color:quickMode===m?'#00BCD4':'rgba(255,255,255,0.5)',border:`1px solid ${quickMode===m?'rgba(0,188,212,0.4)':'rgba(255,255,255,0.08)'}`}}>
                      {m==='simple'?'📝 Simple':m==='html'?'</> HTML':'👁️ Preview'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {['{{nombre}}','{{fecha_evento}}','{{lugar_evento}}','{{monto}}'].map(v=>(
                    <button key={v} onClick={()=>setQuickBody(b=>b+v)}
                      className="text-xs px-1.5 py-0.5 rounded font-mono hover:opacity-80"
                      style={{background:'rgba(0,188,212,0.1)',color:'#00BCD4',border:'1px solid rgba(0,188,212,0.2)'}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="rounded-xl overflow-hidden mb-4" style={{border:'1px solid rgba(255,255,255,0.1)',height:220}}>
                {quickMode==='preview'
                  ?<iframe srcDoc={buildFullHtml(quickBody)} className="w-full h-full" style={{border:'none',background:'white'}} title="preview"/>
                  :<textarea className="w-full h-full px-3 py-2.5 text-xs font-mono focus:outline-none resize-none"
                    style={{background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'none'}}
                    placeholder={quickMode==='simple'?'Escribe el cuerpo del email aquí...\n\nPuedes usar HTML básico: <b>negrita</b>, <br> salto de línea, <a href="">links</a>':'HTML completo del email...'}
                    value={quickBody} onChange={e=>setQuickBody(e.target.value)}/>
                }
              </div>

              {/* Footer preview note */}
              <div className="text-xs mb-4 px-3 py-2 rounded-lg" style={{background:'rgba(0,188,212,0.08)',color:'rgba(255,255,255,0.4)'}}>
                ✨ Se agrega automáticamente el header con el logo y el footer del evento
              </div>

              {quickResult&&<div className={`mb-4 text-xs rounded-xl px-3 py-2.5 font-medium ${quickResult.ok?'bg-emerald-500/15 text-emerald-400':'bg-amber-500/15 text-amber-400'}`}>{quickResult.msg}</div>}

              <div className="flex gap-2 justify-end">
                <button onClick={()=>{setQuickSend(false);setQuickResult(null)}} className="px-4 py-2 rounded-xl text-sm border" style={{color:'rgba(255,255,255,0.5)',borderColor:'rgba(255,255,255,0.1)'}}>Cancelar</button>
                <button onClick={handleQuickSend} disabled={quickSending||!quickEmail||!quickSubject}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2"
                  style={{background:'linear-gradient(135deg,#00BCD4,#0097A7)'}}>
                  {quickSending?'Enviando...':'📤 Enviar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Tabs value={activeTab} onChange={v=>setActiveTab(v as any)} options={[
        {id:'plantillas',label:'📋 Plantillas',count:templates.length},
        {id:'historial',label:'📊 Historial',count:logs.length},
      ]}/>

      {activeTab==='plantillas'&&(
        loading
          ?<div className="text-center py-12" style={{color:ts}}>Cargando...</div>
          :<div className="space-y-4 mt-4">
            {Object.entries(CAT_LABELS).map(([catKey,catLabel])=>{
              const catTpls=templates.filter(t=>t.category===catKey)
              if(!catTpls.length) return null
              return (
                <div key={catKey}>
                  <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{color:ts}}>{catLabel}</div>
                  <div className="space-y-2">
                    {catTpls.map(t=>{
                      const sentCount=logs.filter(l=>l.template_id===t.id).length
                      return (
                        <div key={t.id} className="flex items-center justify-between p-4 rounded-xl" style={{background:card,border:`1px solid ${br}`}}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.is_active?'bg-emerald-400':'bg-gray-600'}`}/>
                            <div>
                              <div className="font-bold text-sm" style={{color:tp}}>{t.name}</div>
                              <div className="text-xs mt-0.5 flex items-center gap-2" style={{color:ts}}>
                                <span>{t.subject}</span>
                                {sentCount>0&&<span className="px-1.5 py-0.5 rounded-full text-xs" style={{background:'rgba(0,188,212,0.15)',color:'#00BCD4'}}>📤 {sentCount} enviados</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>{setSendModal({template:t});setSendTarget('category');setSingleEmail('')}}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold"
                              style={{background:'rgba(76,175,80,0.15)',color:'#4CAF50',border:'1px solid rgba(76,175,80,0.3)'}}>
                              📤 Enviar
                            </button>
                            <button onClick={()=>{setIsNew(false);setEditingTpl(t)}}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold"
                              style={{background:'rgba(0,188,212,0.15)',color:'#00BCD4',border:'1px solid rgba(0,188,212,0.3)'}}>
                              ✏️ Editar
                            </button>
                            <button onClick={()=>deleteTemplate(t.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold"
                              style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.2)'}}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
      )}

      {activeTab==='historial'&&(
        <div className="mt-4">
          <DTable headers={['Plantilla','Para','Categoría','Fecha','Estado','']} empty={!logs.length}>
            {logs.map((l,i)=>(
              <TR key={i}>
                <TD cls="font-medium text-sm">{l.template_name}</TD>
                <TD><div className="font-medium">{l.to_name||'—'}</div><div className="text-xs" style={{color:ts}}>{l.to_email}</div></TD>
                <TD><span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(0,188,212,0.15)',color:'#00BCD4'}}>{CAT_LABELS[l.category]||l.category}</span></TD>
                <TD cls="text-xs" style={{color:ts}}>{fmtDate(l.sent_at)}</TD>
                <TD><span className="text-xs font-bold text-emerald-400">✓ Enviado</span></TD>
                <TD><div className="flex gap-1">
                  {l.body_html&&<Btn icon="👁️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setPreviewEmail(l)}/>}
                  <Btn icon="↩️" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={async()=>{
                    if(!l.to_email||!l.subject||!l.body_html) return
                    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,{
                      method:'POST',
                      headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
                      body:JSON.stringify({to:l.to_email,subject:`[Reenvío] ${l.subject}`,html:l.body_html,from:'eventos@latidoyhuella.co',type:l.category})
                    })
                    alert(`Email reenviado a ${l.to_email}`)
                  }}/>
                </div></TD>
              </TR>
            ))}
          </DTable>
        </div>
      )}

      {/* Preview email modal */}
      {previewEmail&&(
        <Modal onClose={()=>setPreviewEmail(null)}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold" style={{color:tp}}>{previewEmail.subject}</div>
                <div className="text-xs" style={{color:ts}}>Para: {previewEmail.to_email}</div>
              </div>
              <button onClick={()=>setPreviewEmail(null)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{maxHeight:500,overflowY:'auto'}}>
              <iframe srcDoc={previewEmail.body_html} style={{width:'100%',minHeight:400,border:'none',borderRadius:8,background:'white'}} title="Preview email"/>
            </div>
          </div>
        </Modal>
      )}

      {sendModal&&(
        <Modal onClose={()=>setSendModal(null)}>
          <div className="p-6">
            <h3 className="text-base font-bold mb-1" style={{color:tp}}>📤 Enviar email</h3>
            <p className="text-xs mb-4" style={{color:ts}}>{sendModal.template.name}</p>
            <div className="mb-4">
              <label className="text-xs font-bold mb-1 block" style={{color:ts}}>Remitente</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${br}`,color:tp}}
                value={fromEmail} onChange={e=>setFromEmail(e.target.value)}>
                {FROM_OPTIONS.map(o=><option key={o} value={o} className="bg-[#12122a]">{o}</option>)}
              </select>
            </div>
            <div className="space-y-3 mb-5">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl hover:bg-white/5">
                <input type="radio" checked={sendTarget==='category'} onChange={()=>setSendTarget('category')}/>
                <span className="text-sm" style={{color:tp}}>Enviar a todos de esta categoría <span style={{color:'#00BCD4'}}>({CAT_LABELS[sendModal.template.category]})</span></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl hover:bg-white/5">
                <input type="radio" checked={sendTarget==='single'} onChange={()=>setSendTarget('single')}/>
                <span className="text-sm" style={{color:tp}}>Enviar a un email específico</span>
              </label>
              {sendTarget==='single'&&(
                <input className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${br}`,color:tp}}
                  placeholder="email@ejemplo.com" value={singleEmail} onChange={e=>setSingleEmail(e.target.value)}/>
              )}
            </div>
            {sendResult&&<div className={`mb-4 text-xs rounded-xl px-3 py-2.5 font-medium ${sendResult.ok?'bg-emerald-500/15 text-emerald-400':'bg-amber-500/15 text-amber-400'}`}>{sendResult.msg}</div>}
            <div className="flex gap-2">
              <button onClick={handleSend} disabled={sending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{background:'linear-gradient(135deg,#4CAF50,#388E3C)'}}>
                {sending?'Enviando...':'📤 Enviar ahora'}
              </button>
              <button onClick={()=>setSendModal(null)} className="px-4 rounded-xl text-sm border" style={{color:ts,borderColor:br}}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
// ─── STAFF PAGE ───────────────────────────────────────────────────────────────
function StaffPage({user,dark,br,tp,ts,card}:{user:any;dark:boolean;br:string;tp:string;ts:string;card:string}) {
  const [scanning,setScanning]=useState(false)
  const [result,setResult]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [checkedIn,setCheckedIn]=useState(false)
  const [manualInput,setManualInput]=useState('')
  const videoRef=useRef<HTMLVideoElement>(null)
  const scannerRef=useRef<any>(null)
  const processingRef=useRef(false)

  const stopScanner=()=>{
    if(scannerRef.current){
      try{scannerRef.current.reset()}catch(_e){}
      scannerRef.current=null
    }
    setScanning(false)
  }

  const startScanner=async()=>{
    setScanning(true)
    processingRef.current=false
    await new Promise(r=>setTimeout(r,300))
    try{
      const {BrowserMultiFormatReader}=await import('@zxing/browser')
      const codeReader=new BrowserMultiFormatReader()
      scannerRef.current=codeReader
      const videoInputDevices=await BrowserMultiFormatReader.listVideoInputDevices()
      const deviceId=videoInputDevices.find(d=>d.label.toLowerCase().includes('back')||d.label.toLowerCase().includes('rear')||d.label.toLowerCase().includes('environment'))?.deviceId||videoInputDevices[videoInputDevices.length-1]?.deviceId
      if(!videoRef.current){setScanning(false);return}
      await codeReader.decodeFromVideoDevice(deviceId,videoRef.current,(result,_error)=>{
        if(result&&!processingRef.current){
          processingRef.current=true
          stopScanner()
          handleQRResult(result.getText())
        }
      })
    }catch(e){
      console.error('Scanner error:',e)
      setScanning(false)
      alert('No se pudo activar la cámara. Verifica los permisos.')
    }
  }

  useEffect(()=>()=>{stopScanner()},[])

  const handleQRResult=async(raw:string)=>{
    setLoading(true);setResult(null);setCheckedIn(false)
    try{
      let registroId=raw.trim()
      try{const data=JSON.parse(raw);registroId=data.registroId||data.id||raw.trim()}catch(_e){}
      registroId=registroId.replace(/^#LH-/,'').trim()
      if(!registroId){setResult({error:'QR inválido'});setLoading(false);return}
      const tablas=['registrations_5k','expositor_reservations','toldos_reservations','sports_team_registrations','sponsor_inquiries']
      for(const t of tablas){
        const{data:rec}=await supabase.from(t).select('*').eq('id',registroId).maybeSingle()
        if(rec){setResult({record:rec,table:t});setLoading(false);return}
      }
      setResult({error:'Registro no encontrado'})
    }catch{setResult({error:'QR inválido o ilegible'})}
    setLoading(false)
  }

  const handleManualSubmit=(e:React.FormEvent)=>{e.preventDefault();if(manualInput.trim())handleQRResult(manualInput.trim())}

  const handleCheckIn=async()=>{
    if(!result?.record||!result?.table)return
    await supabase.from(result.table).update({checked_in_at:new Date().toISOString(),checked_in_by:user?.name||user?.email||'Staff'}).eq('id',result.record.id)
    setCheckedIn(true)
    setResult((prev:any)=>({...prev,record:{...prev.record,checked_in_at:new Date().toISOString()}}))
  }

  const [sendingEmail,setSendingEmail]=useState(false)
  const [emailSent,setEmailSent]=useState<string|null>(null)

  const sendEmail=async(tipo:'pago'|'firma')=>{
    if(!r)return
    setSendingEmail(true)
    const email=r.email||r.captain_email||''
    const nombre2=r.full_name||r.responsible_name||r.captain_name||''
    if(!email){alert('Este registro no tiene email registrado.');setSendingEmail(false);return}
    let subject='',html=''
    if(tipo==='pago'){
      // Generar link de pago dinámico usando supabase client
      let paymentUrl=''
      try{
        const {data:plData,error:plError}=await supabase.functions.invoke('generate-payment-link',{
          body:{record_id:r.id}
        })
        if(!plError&&plData?.payment_url) paymentUrl=plData.payment_url
      }catch(_e){}
      subject='⚠️ Tienes un pago pendiente — Latido y Huella 2026'
      html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1B6E;border-radius:16px;overflow:hidden"><div style="padding:24px;text-align:center"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:50px"/></div><div style="background:white;padding:32px;border-radius:0 0 16px 16px"><h2 style="color:#0D1B6E">Hola ${nombre2} 👋</h2><p>Tienes un pago pendiente para completar tu registro en <strong>Latido y Huella 2026</strong>. Sin el pago confirmado no podrás ingresar al evento.</p>${paymentUrl?`<div style="text-align:center;margin:24px 0"><a href="${paymentUrl}" style="background:linear-gradient(135deg,#0D1B6E,#00BCD4);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">💳 Completar pago ahora</a></div>`:'<p><strong>Contacta al organizador para completar tu pago.</strong></p>'}<p style="color:#666;font-size:12px">Latido y Huella 2026 · eventos@latidoyhuella.co · WhatsApp: +57 333 277 7912</p></div></div>`
    } else {
      const token=r.contract_token||''
      const link=`${window.location.origin}/contrato/${token}`
      subject='✍️ Tienes un documento pendiente de firma — Latido y Huella 2026'
      html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1B6E;border-radius:16px;overflow:hidden"><div style="padding:24px;text-align:center"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:50px"/></div><div style="background:white;padding:32px;border-radius:0 0 16px 16px"><h2 style="color:#0D1B6E">Hola ${nombre2} 👋</h2><p>Tienes un consentimiento pendiente de firma para poder ingresar al evento <strong>Latido y Huella 2026</strong>.</p><div style="text-align:center;margin:24px 0"><a href="${link}" style="background:linear-gradient(135deg,#00BCD4,#0097A7);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">✍️ Firmar documento</a></div><p style="color:#666;font-size:12px">Latido y Huella 2026 · eventos@latidoyhuella.co</p></div></div>`
    }
    const res=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,{
      method:'POST',
      headers:{'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({to:email,subject,html,from:'eventos@latidoyhuella.co',type:'staff'})
    })
    if(res.ok) setEmailSent(tipo==='pago'?'Email de pago enviado ✅':'Email de firma enviado ✅')
    else alert('Error al enviar el email')
    setSendingEmail(false)
  }

  const resetAll=()=>{setResult(null);setCheckedIn(false);setManualInput('');setEmailSent(null);stopScanner()}

  const r=result?.record
  const isPaid=r?.status==='paid'||r?.status==='approved'
  const isSigned=!!r?.contract_signed_at||!!r?.accepted_contract_at
  const isCheckedIn=checkedIn||!!r?.checked_in_at
  const nombre=r?.full_name||r?.responsible_name||r?.captain_name||r?.contact_name||''
  const tipo=result?.table==='registrations_5k'?'🐾 Caminata 5K':result?.table==='expositor_reservations'?'🏪 Expositor':result?.table==='toldos_reservations'?'⛺ Toldo':result?.table==='sports_team_registrations'?'⚽ Deportes':'⭐ Patrocinador'

  return (
    <div style={{maxWidth:480,margin:'0 auto',padding:'24px 16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:900,color:tp,margin:0}}>📱 Validador QR</h1>
          <p style={{fontSize:12,color:ts,margin:'4px 0 0'}}>Staff: {user?.name||user?.email}</p>
        </div>
        <div style={{fontSize:11,padding:'6px 12px',borderRadius:20,fontWeight:700,background:'rgba(0,188,212,0.15)',color:'#00BCD4'}}>Latido y Huella 2026</div>
      </div>

      {/* Video element — siempre en DOM */}
      <video ref={videoRef} style={{display:scanning?'block':'none',width:'100%',borderRadius:16,background:'#000',marginBottom:scanning?12:0}} autoPlay playsInline muted/>

      {/* Cancelar cámara */}
      {scanning&&(
        <button onClick={stopScanner} style={{width:'100%',padding:12,borderRadius:12,fontSize:14,color:'white',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',cursor:'pointer',fontWeight:600,marginBottom:12}}>
          ✕ Cancelar cámara
        </button>
      )}

      {/* Pantalla inicial */}
      {!scanning&&!result&&!loading&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={startScanner}
            style={{width:'100%',padding:24,borderRadius:16,fontWeight:700,color:'white',fontSize:18,background:'linear-gradient(135deg,#00BCD4,#0097A7)',border:'none',cursor:'pointer'}}>
            📷 Escanear QR
          </button>
          <form onSubmit={handleManualSubmit} style={{display:'flex',gap:8}}>
            <input value={manualInput} onChange={e=>setManualInput(e.target.value)}
              placeholder="O pega el ID del registro aquí..."
              style={{flex:1,borderRadius:12,padding:'10px 14px',fontSize:14,background:card,border:`1px solid ${br}`,color:tp,outline:'none'}}/>
            <button type="submit"
              style={{padding:'10px 18px',borderRadius:12,fontWeight:700,color:'white',background:'#00BCD4',border:'none',cursor:'pointer'}}>
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading&&<div style={{textAlign:'center',padding:'48px 0',color:ts,fontSize:16}}>⏳ Buscando registro...</div>}

      {/* Resultado */}
      {result&&!loading&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {result.error
            ? <div style={{padding:24,borderRadius:16,textAlign:'center',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)'}}>
                <div style={{fontSize:40,marginBottom:8}}>❌</div>
                <div style={{fontWeight:700,color:'#f87171',fontSize:16}}>{result.error}</div>
              </div>
            : <>
                {/* Estado principal */}
                <div style={{padding:24,borderRadius:16,textAlign:'center',
                  background:isCheckedIn?'rgba(76,175,80,0.1)':!isPaid?'rgba(239,68,68,0.1)':!isSigned?'rgba(245,158,11,0.1)':'rgba(0,188,212,0.1)',
                  border:`2px solid ${isCheckedIn?'#4CAF50':!isPaid?'#f87171':!isSigned?'#FFB300':'#00BCD4'}`}}>
                  <div style={{fontSize:48,marginBottom:8}}>{isCheckedIn?'✅':!isPaid?'❌':!isSigned?'⚠️':'🎫'}</div>
                  <div style={{fontWeight:900,fontSize:20,color:isCheckedIn?'#4CAF50':!isPaid?'#f87171':!isSigned?'#FFB300':'#00BCD4'}}>
                    {isCheckedIn?'¡Ingreso registrado!':!isPaid?'Pago pendiente':!isSigned?'Consentimiento pendiente':'Ticket válido'}
                  </div>
                </div>

                {/* Datos */}
                <div style={{borderRadius:16,padding:16,background:card,border:`1px solid ${br}`}}>
                  <div style={{fontSize:20,fontWeight:900,color:tp,marginBottom:4}}>{nombre}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'#00BCD4',marginBottom:12}}>{tipo}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div style={{borderRadius:12,padding:10,background:'rgba(255,255,255,0.05)'}}>
                      <div style={{fontSize:10,color:ts,marginBottom:3}}>Pago</div>
                      <div style={{fontWeight:700,fontSize:13,color:isPaid?'#4ade80':'#f87171'}}>{isPaid?'✅ Pagado':'❌ Pendiente'}</div>
                    </div>
                    <div style={{borderRadius:12,padding:10,background:'rgba(255,255,255,0.05)'}}>
                      <div style={{fontSize:10,color:ts,marginBottom:3}}>Consentimiento</div>
                      <div style={{fontWeight:700,fontSize:13,color:isSigned?'#4ade80':'#fbbf24'}}>{isSigned?'✅ Firmado':'⚠️ Pendiente'}</div>
                    </div>
                    {r?.stand_id&&<div style={{borderRadius:12,padding:10,background:'rgba(255,255,255,0.05)',gridColumn:'span 2'}}>
                      <div style={{fontSize:10,color:ts,marginBottom:3}}>Stand</div>
                      <div style={{fontWeight:700,color:tp}}>{r.stand_id}</div>
                    </div>}
                    {r?.team_name&&<div style={{borderRadius:12,padding:10,background:'rgba(255,255,255,0.05)',gridColumn:'span 2'}}>
                      <div style={{fontSize:10,color:ts,marginBottom:3}}>Equipo</div>
                      <div style={{fontWeight:700,color:tp}}>{r.team_name}</div>
                    </div>}
                    {isCheckedIn&&r?.checked_in_at&&<div style={{borderRadius:12,padding:10,background:'rgba(76,175,80,0.1)',border:'1px solid rgba(76,175,80,0.3)',gridColumn:'span 2'}}>
                      <div style={{fontSize:10,color:'rgba(74,222,128,0.6)',marginBottom:3}}>Ingresó el</div>
                      <div style={{fontWeight:700,color:'#4ade80',fontSize:12}}>{new Date(r.checked_in_at).toLocaleString('es-CO')}</div>
                    </div>}
                  </div>
                </div>

                {/* Email enviado */}
                {emailSent&&<div style={{padding:12,borderRadius:12,textAlign:'center',background:'rgba(76,175,80,0.1)',border:'1px solid rgba(76,175,80,0.3)',color:'#4ade80',fontWeight:700,fontSize:13}}>✅ {emailSent}</div>}

                {/* Botones de acción */}
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {/* Pago pendiente */}
                  {!isPaid&&!isCheckedIn&&(
                    <button onClick={()=>sendEmail('pago')} disabled={sendingEmail}
                      style={{width:'100%',padding:16,borderRadius:12,fontWeight:700,color:'white',fontSize:14,background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',cursor:'pointer',opacity:sendingEmail?0.6:1}}>
                      {sendingEmail?'Enviando...':'📧 Enviar link de pago'}
                    </button>
                  )}

                  {/* Consentimiento pendiente — mostrar siempre que falte firma */}
                  {!isSigned&&!isCheckedIn&&r?.contract_token&&(
                    <button onClick={()=>sendEmail('firma')} disabled={sendingEmail}
                      style={{width:'100%',padding:16,borderRadius:12,fontWeight:700,color:'white',fontSize:14,background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',cursor:'pointer',opacity:sendingEmail?0.6:1}}>
                      {sendingEmail?'Enviando...':'📧 Enviar link de firma'}
                    </button>
                  )}

                  {/* Validar ingreso — solo si pagó */}
                  {isPaid&&!isCheckedIn&&(
                    <button onClick={handleCheckIn}
                      style={{width:'100%',padding:16,borderRadius:12,fontWeight:700,color:'white',fontSize:15,background:isSigned?'linear-gradient(135deg,#4CAF50,#388E3C)':'rgba(76,175,80,0.3)',border:isSigned?'none':'1px solid rgba(76,175,80,0.5)',cursor:'pointer'}}>
                      {isSigned?'✅ Validar ingreso':'⚠️ Validar de todas formas (sin firma)'}
                    </button>
                  )}

                  <button onClick={()=>{setResult(null);setCheckedIn(false);setManualInput('');setEmailSent(null)}}
                    style={{width:'100%',padding:16,borderRadius:12,fontWeight:700,fontSize:15,color:'white',background:'linear-gradient(135deg,#00BCD4,#0097A7)',border:'none',cursor:'pointer'}}>
                    📷 Escanear otro QR
                  </button>
                  <button onClick={resetAll}
                    style={{width:'100%',padding:16,borderRadius:12,fontWeight:700,fontSize:15,color:'white',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',cursor:'pointer'}}>
                    ← Regresar al inicio
                  </button>
                </div>
              </>
          }
        </div>
      )}
    </div>
  )
}
function LoginScreen({onLogin}:{onLogin:(u:{id:string;email:string;role:string;name:string})=>void}) {
  const [email,setEmail]=useState('');const [pass,setPass]=useState('');const [err,setErr]=useState('');const [loading,setLoading]=useState(false)
  const doLogin=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);setErr('')
    const {data}=await supabase.from('admin_users').select('*').eq('email',email).eq('password_hash',pass).eq('is_active',true).single()
    if(data){
      const u={id:data.id,email:data.email,role:data.role,name:data.full_name}
      localStorage.setItem('lh_admin',JSON.stringify(u));onLogin(u)
    }else{setErr('Credenciales incorrectas o usuario inactivo');setLoading(false)}
  }
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(135deg,#060612,#0a0a1f,#060612)'}}>
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 40%,rgba(5,150,105,0.15),transparent 60%)'}}/>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <motion.div animate={{y:[0,-8,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut'}}
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 0 60px rgba(5,150,105,0.4)'}}>
            <img src="/Logo_latido_y_huella_ICONO_blanco.png" className="w-12 h-12 object-contain" alt="" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          </motion.div>
          <h1 className="text-2xl font-black text-white">Latido & Huella</h1>
          <p className="text-sm text-gray-400 mt-1">Panel de Administración</p>
        </div>
        <div className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',backdropFilter:'blur(20px)'}}>
          <form onSubmit={doLogin} className="space-y-4">
            <div><label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600"
                placeholder="admin@latidoyhuella.com"/></div>
            <div><label className="text-xs text-gray-400 mb-1.5 block">Contraseña</label>
              <input type="password" required value={pass} onChange={e=>setPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600"
                placeholder="••••••••"/></div>
            {err&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs text-red-400 font-medium">⚠️ {err}</motion.div>}
            <motion.button type="submit" disabled={loading} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
              className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-60"
              style={{background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 4px 20px rgba(5,150,105,0.3)'}}>
              {loading?'Verificando...':'🔐 Ingresar'}
            </motion.button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">Solo personal autorizado · Latido & Huella</p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export function Dashboard() {
  const [authUser,setAuthUser]=useState<{id:string;email:string;role:string;name:string}|null>(()=>{
    try{const s=localStorage.getItem('lh_admin');return s?JSON.parse(s):null}catch{return null}
  })
  const [page,setPage]=useState<Page>('home')
  const [dark,setDark]=useState(true)

  const [regs5k,setRegs5k]=useState<Reg5k[]>([])
  const [pets,setPets]=useState<Pet[]>([])
  const [expositores,setExpositores]=useState<Expositor[]>([])
  const [toldos,setToldos]=useState<Toldo[]>([])
  const [sponsors,setSponsors]=useState<Sponsor[]>([])
  const [sponsorItems,setSponsorItems]=useState<SponsorItem[]>([])
  const [publicSponsors,setPublicSponsors]=useState<PublicSponsor[]>([])
  const [teams,setTeams]=useState<SportTeam[]>([])
  const [players,setPlayers]=useState<SportPlayer[]>([])
  const [adminUsers,setAdminUsers]=useState<AdminUser[]>([])
  const [attendees,setAttendees]=useState<Attendee[]>([])
  const [loading,setLoading]=useState(true)

  // Config editable para Dev
  const [devConfig,setDevConfig]=useState({
    supabaseUrl:'https://adkqijensfxzzftylktm.supabase.co',
    supabaseKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka3FpamVuc2Z4enpmdHlsa3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzQ1OTMsImV4cCI6MjA5Mzc1MDU5M30.Yk7hafWIWMsKQtcCZ4f03_hCVtAUgoTt4soxEgEuLrY',
    wompiPublicKey:'pub_prod_c3KnNzhHf9P0aRWwfeTzggSDX7UOl1Sr',
    wompiIntegrityKey:'prod_integrity_gFwVI13EBqz9Khb672Ve042FU41xEvse',
    wompiEventsSecret:'prod_events_SFG13B4vgYJy9kj0RuuYTrjYyFDnvj8y',
    wompiMode:'prod',
    webhookUrl:'https://adkqijensfxzzftylktm.supabase.co/functions/v1/wompi-webhook',
  })
  const [devSaved,setDevSaved]=useState(false)

  // Modals
  const [contractM,setContractM]=useState<{name:string;email:string;recordId:string;table:string;contractToken?:string;contractSignedAt?:string;contractPdfUrl?:string;email1SentAt?:string}|null>(null)
  const [editM,setEditM]=useState<{record:any;table:string;fields:any[];title?:string}|null>(null)
  const [approveM,setApproveM]=useState<{record:any;table:string}|null>(null)
  const [profileM,setProfileM]=useState<{record:any;table:string}|null>(null)
  const [logoEditM,setLogoEditM]=useState<PublicSponsor|null>(null)
  const [teamM,setTeamM]=useState<SportTeam|null>(null)
  const [createM,setCreateM]=useState<{table:string;fields:any[];title:string;defaults?:any}|null>(null)
  const [deleteM,setDeleteM]=useState<{record:any;table:string}|null>(null)
  const [hardDeleteM,setHardDeleteM]=useState<{record:any;table:string}|null>(null)

  const [sponsorTab,setSponsorTab]=useState<'empresarial'|'deportivo'|'espacios'>('empresarial')
  const [comTab,setComTab]=useState<'stand'|'foodtruck'|'toldo'>('stand')
  const [depTab,setDepTab]=useState<'futbol_adultos'|'futbol_ninos'|'padel'|'tenis'>('futbol_adultos')
  const [search,setSearch]=useState('')

  // Logo upload
  const [logoFile,setLogoFile]=useState<File|null>(null)
  const [logoName,setLogoName]=useState('')
  const [logoTier,setLogoTier]=useState('oro')
  const [logoOrder,setLogoOrder]=useState(100)
  const [logoUploading,setLogoUploading]=useState(false)
  const [logoPreview,setLogoPreview]=useState<string|null>(null)
  const [logoMsg,setLogoMsg]=useState<{ok:boolean;text:string}|null>(null)
  const fileRef=useRef<HTMLInputElement>(null)

  // Tema
  const bg=dark?'#0a0a14':'#f0f4f8'
  const card=dark?'#0f0f1a':'#ffffff'
  const tp=dark?'#e2e8f0':'#0f172a'
  const ts=dark?'#6b7280':'#64748b'
  const br=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.10)'
  const inputBg=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'

  const fetchAll=useCallback(async()=>{
    setLoading(true)
    const [a,b,c,d,e,f,g,h,i,j,k]=await Promise.all([
      supabase.from('registrations_5k').select('*').is('deleted_at',null).order('created_at',{ascending:false}),
      supabase.from('registration_pets').select('*').is('deleted_at',null).order('created_at',{ascending:false}),
      supabase.from('expositor_reservations').select('*').is('deleted_at',null).order('created_at',{ascending:false}),
      supabase.from('toldos_reservations').select('*').is('deleted_at',null).order('created_at',{ascending:false}),
      supabase.from('sponsor_inquiries').select('*').is('deleted_at',null).order('created_at',{ascending:false}),
      supabase.from('sponsor_order_items').select('*'),
      supabase.from('public_sponsors').select('*').order('display_order'),
      supabase.from('sports_team_registrations').select('*').is('deleted_at',null).order('created_at',{ascending:false}),
      supabase.from('sports_team_players').select('*').is('deleted_at',null).order('player_index'),
      supabase.from('admin_users').select('*').order('created_at',{ascending:false}),
      supabase.from('registration_attendees').select('*').order('attendee_index'),
    ])
    if(a.data)setRegs5k(a.data);if(b.data)setPets(b.data);if(c.data)setExpositores(c.data)
    if(d.data)setToldos(d.data);if(e.data)setSponsors(e.data);if(f.data)setSponsorItems(f.data)
    if(g.data)setPublicSponsors(g.data);if(h.data)setTeams(h.data);if(i.data)setPlayers(i.data)
    if(j.data)setAdminUsers(j.data);if(k.data)setAttendees(k.data)
    setLoading(false)
  },[])

  useEffect(()=>{if(authUser)fetchAll()},[authUser,fetchAll])

  async function uploadLogo() {
    if(!logoFile||!logoName.trim()){setLogoMsg({ok:false,text:'Completa el nombre y selecciona imagen'});return}
    setLogoUploading(true);setLogoMsg(null)
    try{
      const ext=logoFile.name.split('.').pop()?.toLowerCase()||'png'
      const safe=logoName.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      const filename=`${safe}-${Date.now()}.${ext}`
      const {error:upErr}=await supabase.storage.from('sponsor-logos').upload(filename,logoFile,{cacheControl:'3600',upsert:false})
      if(upErr){setLogoMsg({ok:false,text:`Storage: ${upErr.message}`});setLogoUploading(false);return}
      const {data:{publicUrl}}=supabase.storage.from('sponsor-logos').getPublicUrl(filename)
      const {error:dbErr}=await supabase.from('public_sponsors').insert({name:logoName.trim(),logo_url:publicUrl,tier:logoTier,display_order:logoOrder,is_active:true})
      if(dbErr){setLogoMsg({ok:false,text:`DB: ${dbErr.message}`});setLogoUploading(false);return}
      setLogoMsg({ok:true,text:`✓ "${logoName}" publicado`})
      setLogoName('');setLogoFile(null);setLogoPreview(null);setLogoOrder(100)
      fetchAll()
    }catch(e:any){setLogoMsg({ok:false,text:e.message||'Error'})}
    setLogoUploading(false)
  }

  const allR=[...regs5k,...expositores,...toldos,...sponsors,...teams]
  const totalApproved=allR.filter(r=>isOk(r.status)).length
  const totalPending=allR.filter(r=>r.status==='pending_payment').length
  const recaudado=allR.filter(r=>isOk(r.status)).reduce((s,r)=>s+((r as any).amount_cents||0),0)

  const allPersons=[
    ...regs5k.map(r=>({...r,_cat:'🐾 Caminata',_name:r.full_name,_table:'registrations_5k'})),
    ...expositores.map(e=>({...e,_cat:'🏪 Expositor',_name:e.responsible_name||e.brand_name,_table:'expositor_reservations'})),
    ...toldos.map(t=>({...t,_cat:'⛺ Toldo',_name:t.responsible_name||t.brand_name,_table:'toldos_reservations'})),
    ...sponsors.map(s=>({...s,_cat:'⭐ Patrocinio',_name:s.contact_name,_table:'sponsor_inquiries'})),
    ...teams.map(st=>({...st,_cat:'⚽ Deporte',_name:st.captain_name,_table:'sports_team_registrations'})),
  ]
  const searchResults=search.length>1?allPersons.filter(p=>
    p._name?.toLowerCase().includes(search.toLowerCase())||
    (p as any).email?.toLowerCase().includes(search.toLowerCase())||
    (p as any).captain_email?.toLowerCase().includes(search.toLowerCase())||
    (p as any).document_id?.includes(search)
  ):[]

  const navItems=[
    {id:'home',icon:'⌂',label:'Inicio'},
    {id:'5k',icon:'🐾',label:'Caminata 5K',count:regs5k.length + attendees.length},
    {id:'mascotas',icon:'🐶',label:'Mascotas',count:pets.length},
    {id:'comercial',icon:'🏪',label:'Comercial',count:expositores.length+toldos.length},
    {id:'deportes',icon:'⚽',label:'Deportes',count:teams.length},
    {id:'patrocinadores',icon:'⭐',label:'Patrocinadores',count:sponsors.length},
    {id:'marcas',icon:'🖼',label:'Marcas & Logos',count:publicSponsors.length},
    {id:'pagos',icon:'💳',label:'Pagos'},
    {id:'emails',icon:'📧',label:'Emails'},
    {id:'staff',icon:'📱',label:'Validador QR'},
    null,
    {id:'admin',icon:'👥',label:'Administración'},
    {id:'dev',icon:'⚙️',label:'Desarrolladores'},
    null,
    {id:'papelera',icon:'🗑️',label:'Papelera'},
  ]

  const orbitR=210
  const orbNodes=[
    {emoji:'🐾',label:'Caminata',count:regs5k.length,page:'5k',angle:-90},
    {emoji:'🐶',label:'Mascotas',count:pets.length,page:'mascotas',angle:-45},
    {emoji:'🏪',label:'Stands',count:expositores.length,page:'comercial',angle:0},
    {emoji:'⛺',label:'Toldos',count:toldos.length,page:'comercial',angle:45},
    {emoji:'⚽',label:'Deportes',count:teams.length,page:'deportes',angle:90},
    {emoji:'🏢',label:'Empresa',count:sponsors.filter(s=>s.plan_type==='empresarial').length,page:'patrocinadores',angle:135},
    {emoji:'🏆',label:'Pat.Dep',count:sponsors.filter(s=>s.plan_type==='deportivo').length,page:'patrocinadores',angle:180},
    {emoji:'📦',label:'Espacios',count:sponsors.filter(s=>s.plan_type==='espacios').length,page:'patrocinadores',angle:-135},
  ]

  const depTeams=teams.filter(t=>
    depTab==='futbol_adultos'?t.sport==='futbol'&&t.category==='adultos':
    depTab==='futbol_ninos'?t.sport==='futbol'&&t.category==='ninos':
    depTab==='tenis'?t.sport==='tenis':
    t.sport==='padel'
  )
  const efPago=[{key:'status',label:'Estado',options:['paid','pending_payment','declined','voided']},{key:'payment_method',label:'Forma de pago',options:PM},{key:'wompi_transaction_id',label:'ID TX Wompi'}]

  if(!authUser) return <LoginScreen onLogin={u=>setAuthUser(u)}/>

  // Staff role — solo ve el validador QR
  if(authUser.role==='staff') return (
    <div className="min-h-screen" style={{background:bg,fontFamily:"'DM Sans',sans-serif",color:tp}}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={{background:'#0d0d1f',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} className="h-7" alt=""/>
          <span className="text-xs font-bold" style={{color:ts}}>Staff · {authUser.name}</span>
        </div>
        <button onClick={()=>setAuthUser(null)} className="text-xs px-3 py-1 rounded-lg border" style={{color:ts,borderColor:br}}>Salir</button>
      </div>
      <StaffPage user={authUser} dark={dark} br={br} tp={tp} ts={ts} card={card}/>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{background:bg,fontFamily:"'DM Sans',sans-serif",color:tp}}>

      {/* SIDEBAR */}
      <div className="w-56 flex-shrink-0 flex flex-col sticky top-0 h-screen" style={{background:'#0d0d1f'}}>
        <div className="p-5" style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#059669,#047857)'}}>
              <img src="/Logo_latido_y_huella_ICONO_blanco.png" className="w-7 h-7 object-contain" alt="" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
            </div>
            <div><div className="text-sm font-bold text-white">Latido & Huella</div><div className="text-xs" style={{color:'#10b981'}}>Admin Panel</div></div>
          </div>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">
          {navItems.map((n,idx)=>
            n===null
              ?<div key={idx} className="my-2" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}/>
              :(
              <motion.button key={n.id} onClick={()=>setPage(n.id as Page)}
                whileHover={{x:4}} whileTap={{scale:0.97}}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 text-left transition-all"
                style={page===n.id
                  ?{background:'linear-gradient(135deg,rgba(5,150,105,0.35),rgba(4,120,87,0.2))',color:'#10b981',border:'1px solid rgba(16,185,129,0.35)',boxShadow:'0 2px 12px rgba(16,185,129,0.15)'}
                  :{color:'rgba(255,255,255,0.55)'}}>
                <div className="flex items-center gap-3"><span className="text-base">{n.icon}</span><span>{n.label}</span></div>
                {n.count!==undefined&&<span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{background:page===n.id?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.1)',color:page===n.id?'#10b981':'rgba(255,255,255,0.4)'}}>
                  {n.count}
                </span>}
              </motion.button>
            )
          )}
        </nav>
        <div className="p-4" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">{authUser.name.charAt(0)}</div>
            <div><div className="text-xs font-bold text-white">{authUser.name}</div><div className="text-xs" style={{color:'#10b981'}}>{authUser.role}</div></div>
          </div>
          <button onClick={()=>{localStorage.removeItem('lh_admin');setAuthUser(null)}}
            className="w-full text-xs py-1.5 rounded-lg text-center" style={{color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.08)'}}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 px-6 py-3 flex items-center gap-3"
          style={{background:dark?'rgba(10,10,20,0.88)':'rgba(240,244,248,0.88)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${br}`}}>
          <div className="flex-1 relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{color:ts}}>🔍</span>
            <input className="w-full pl-8 pr-4 py-2 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              style={{background:inputBg,border:`1px solid ${br}`,color:tp}}
              placeholder="Buscar nombre, cédula o email..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search.length>1&&searchResults.length>0&&(
              <div className="absolute top-full left-0 right-0 rounded-xl shadow-2xl mt-1 z-50 overflow-hidden max-h-72 overflow-y-auto"
                style={{background:dark?'#1a1a2e':'#fff',border:`1px solid ${br}`}}>
                {searchResults.slice(0,8).map((p,i)=>(
                  <button key={i} onClick={()=>{setProfileM({record:p,table:p._table});setSearch('')}}
                    className="w-full px-4 py-3 hover:bg-emerald-500/10 text-left transition-colors" style={{borderBottom:`1px solid ${br}`}}>
                    <div className="flex items-center justify-between">
                      <div><div className="text-sm font-semibold" style={{color:tp}}>{p._name}</div><div className="text-xs" style={{color:ts}}>{(p as any).email||(p as any).captain_email} · {p._cat}</div></div>
                      <Badge status={p.status}/>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={()=>setDark(!dark)} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{background:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)',border:`1px solid ${br}`}}>
            {dark?'☀️':'🌙'}
          </button>
          <motion.button onClick={fetchAll} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            className="px-3 py-2 text-sm rounded-xl" style={{color:ts,border:`1px solid ${br}`}}>🔄</motion.button>
        </div>

        <div className="p-6">
          {loading?(
            <div className="flex items-center justify-center h-64">
              <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:'linear'}} className="text-4xl">🐾</motion.div>
            </div>
          ):(
            <AnimatePresence mode="wait">
              <motion.div key={page} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.2}}>

                {/* HOME */}
                {page==='home'&&(
                  <div>
                    <div className="mb-6">
                      <h1 className="text-3xl font-black" style={{color:tp}}>Bienvenido, {authUser.name} 👋</h1>
                      <p className="text-sm mt-1" style={{color:ts}}>Panel de administración · Latido & Huella</p>
                    </div>
                    <OrbitalMenu dark={dark} br={br} tp={tp} ts={ts} orbNodes={orbNodes} onNavigate={p=>setPage(p as Page)}/>
                    <div className="grid grid-cols-5 gap-4 mb-0">
                      {[
                        {label:'Total inscritos',value:allR.length,icon:'👥',color:tp},
                        {label:'Aprobados',value:totalApproved,icon:'✅',color:'#10b981',sub:`${Math.round(totalApproved/(allR.length||1)*100)}%`},
                        {label:'Pendientes',value:totalPending,icon:'⏳',color:'#f59e0b'},
                        {label:'Equipos',value:teams.length,icon:'⚽',color:'#60a5fa'},
                        {label:'Recaudado',value:fmtCOP(recaudado),icon:'💰',color:'#10b981'},
                      ].map((m,i)=>(
                        <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                          className="rounded-2xl p-4" style={{background:card,border:`1px solid ${br}`}}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl">{m.icon}</span>
                            {m.sub&&<span className="text-xs font-black px-2 py-0.5 rounded-full" style={{background:'rgba(16,185,129,0.2)',color:'#10b981'}}>{m.sub}</span>}
                          </div>
                          <div className="text-2xl font-black" style={{color:m.color}}>{m.value}</div>
                          <div className="text-xs mt-1" style={{color:ts}}>{m.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CAMINATA 5K */}
                {page==='5k'&&(
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div><h1 className="text-2xl font-black" style={{color:tp}}>🐾 Caminata 5K</h1><p className="text-sm mt-0.5" style={{color:ts}}>{regs5k.length} registros · {regs5k.length + attendees.length} personas</p></div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>{regs5k.filter(r=>isOk(r.status)).length} ✅</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>{regs5k.filter(r=>r.status==='pending_payment').length} ⏳</span>
                        <AddBtn label="Nuevo inscrito" onClick={()=>setCreateM({table:'registrations_5k',fields:[{key:'full_name',label:'Nombre completo',required:true},{key:'document_id',label:'Cédula'},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'ticket_type',label:'Ticket',options:['pet_lover','1p_1m','familiar']},{key:'payment_method',label:'Pago',options:PM}],title:'Nuevo inscrito Caminata 5K',defaults:{status:'pending_payment'}})}/>
                      </div>
                    </div>
                    <DTable headers={['Persona','Grupo','Email','Ticket','Estado','Monto','Contrato','Fecha','']} empty={!regs5k.length}>
                      {regs5k.flatMap(r=>{
                        const grpAttendees=attendees.filter(a=>a.registration_id===r.id)
                        const adults=grpAttendees.filter(a=>!a.is_minor)
                        const minors=grpAttendees.filter(a=>a.is_minor)
                        const grpPets=pets.filter(p=>p.registration_id===r.id)
                        const grpId=r.id.slice(-4).toUpperCase()
                        const rows:React.ReactNode[]=[]

                        // Fila del titular
                        rows.push(
                          <TR key={r.id}>
                            <TD><div className="flex items-center gap-2"><span>👑</span><div><div className="font-bold">{r.full_name}</div><div className="text-xs" style={{color:ts}}>{r.document_id}</div></div></div></TD>
                            <TD>
                              <div className="flex gap-1 flex-wrap">
                                {adults.length>0&&<span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:'rgba(96,165,250,0.15)',color:'#60a5fa'}}>👤{adults.length}</span>}
                                {minors.length>0&&<span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:'rgba(251,191,36,0.15)',color:'#fbbf24'}}>👶{minors.length}</span>}
                                {grpPets.length>0&&<span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>🐾{grpPets.length}</span>}
                                {grpAttendees.length===0&&grpPets.length===0&&<span className="text-xs" style={{color:ts}}>Solo titular</span>}
                              </div>
                            </TD>
                            <TD cls="text-xs" style={{color:ts}}>{r.email}</TD>
                            <TD cls="text-xs capitalize">{r.ticket_type}</TD>
                            <TD>
                              <div className="flex items-center gap-1 flex-wrap">
                                <Badge status={r.status}/>
                                {!isOk(r.status)&&<Btn icon="✅" color="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" onClick={()=>setApproveM({record:r,table:'registrations_5k'})}/>}
                              </div>
                            </TD>
                            <TD cls="text-xs font-bold text-emerald-400">{r.amount_cents?fmtCOP(r.amount_cents):r.total_amount?fmtCOP(r.total_amount):'—'}</TD>
                            <TD>{r.contract_signed_at?<span className="text-xs font-bold text-emerald-400">✓ Firmado</span>:<span className="text-xs font-bold text-amber-400">⏳</span>}<Btn icon="📝" color="bg-blue-500/15 text-blue-400" onClick={()=>setContractM({name:r.full_name,email:r.email,recordId:r.id,table:'registrations_5k',contractToken:r.contract_token,contractSignedAt:r.contract_signed_at,contractPdfUrl:r.contract_pdf_url,email1SentAt:r.email1_sent_at})}/></TD>
                            <TD cls="text-xs" style={{color:ts}}>{fmtDate(r.created_at)}</TD>
                            <TD><div className="flex gap-1">
                              <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:r,table:'registrations_5k'})}/>
                              <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:r,table:'registrations_5k',fields:[{key:'full_name',label:'Nombre'},{key:'document_id',label:'Cédula'},{key:'email',label:'Email'},{key:'phone',label:'Teléfono'},{key:'payment_method',label:'Pago',options:PM},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'photo_url',label:'Foto de perfil'}]})}/>
                              <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:r,table:'registrations_5k'})}/>
                            </div></TD>
                          </TR>
                        )

                        // Filas de adultos acompañantes (no titular)
                        adults.filter(a=>!a.is_primary).forEach(a=>{
                          rows.push(
                            <tr key={a.id} style={{borderTop:'1px solid rgba(255,255,255,0.04)',background:'rgba(255,255,255,0.015)'}}>
                              <td className="px-4 py-2"><div className="flex items-center gap-2 pl-4"><span>👤</span><div><div className="text-sm text-gray-300">{a.full_name}</div><div className="text-xs" style={{color:ts}}>{a.document_id||'Sin cédula'}</div></div></div></td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>↳ GRP-{grpId}</td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>{a.email||'—'}</td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>Adulto</td>
                              <td className="px-4 py-2"><Badge status={r.status}/></td>
                              <td className="px-4 py-2 text-xs font-bold text-emerald-400">{fmtCOP(a.amount_cents)}</td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"><div className="flex gap-1">
                                <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:a,table:'registration_attendees'})}/>
                                <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:a,table:'registration_attendees',fields:[{key:'full_name',label:'Nombre'},{key:'document_id',label:'Cédula'},{key:'email',label:'Email'},{key:'phone',label:'Teléfono'}],title:'Editar acompañante'})}/>
                                <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:a,table:'registration_attendees'})}/>
                              </div></td>
                            </tr>
                          )
                        })

                        // Filas de niños
                        minors.forEach(a=>{
                          rows.push(
                            <tr key={a.id} style={{borderTop:'1px solid rgba(255,255,255,0.04)',background:'rgba(255,255,255,0.015)'}}>
                              <td className="px-4 py-2"><div className="flex items-center gap-2 pl-4"><span>👶</span><div><div className="text-sm font-medium" style={{color:'#fbbf24'}}>{a.full_name}</div><div className="text-xs" style={{color:ts}}>{a.birthdate?`Nac: ${fmtDate(a.birthdate)}`:'Sin fecha nac.'}</div></div></div></td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>↳ GRP-{grpId}</td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>Resp: {r.full_name}</td>
                              <td className="px-4 py-2 text-xs" style={{color:'#fbbf24'}}>Niño</td>
                              <td className="px-4 py-2"><Badge status={r.status}/></td>
                              <td className="px-4 py-2 text-xs font-bold" style={{color:'#fbbf24'}}>{fmtCOP(a.amount_cents)}</td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"><div className="flex gap-1">
                                <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:a,table:'registration_attendees'})}/>
                                <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:a,table:'registration_attendees',fields:[{key:'full_name',label:'Nombre'},{key:'birthdate',label:'Fecha nacimiento',type:'date'}],title:'Editar niño'})}/>
                                <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:a,table:'registration_attendees'})}/>
                              </div></td>
                            </tr>
                          )
                        })

                        // Filas de mascotas
                        grpPets.forEach(p=>{
                          rows.push(
                            <tr key={p.id} style={{borderTop:'1px solid rgba(255,255,255,0.04)',background:'rgba(255,255,255,0.015)'}}>
                              <td className="px-4 py-2"><div className="flex items-center gap-2 pl-4">
                                {p.photo_url?<img src={p.photo_url} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt={p.name}/>:<span>🐾</span>}
                                <div><div className="text-sm text-gray-300">{p.name}</div><div className="text-xs" style={{color:ts}}>{p.breed} · {p.size}</div></div>
                              </div></td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>↳ GRP-{grpId}</td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>Resp: {r.full_name}</td>
                              <td className="px-4 py-2 text-xs" style={{color:'#10b981'}}>Mascota</td>
                              <td className="px-4 py-2"><Badge status={r.status}/></td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>—</td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"><div className="flex gap-1">
                                <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:p,table:'registration_pets'})}/>
                                <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:p,table:'registration_pets',fields:[{key:'name',label:'Nombre'},{key:'breed',label:'Raza'},{key:'age',label:'Edad'},{key:'size',label:'Tamaño'},{key:'bio',label:'Bio'},{key:'photo_url',label:'Foto'}],title:`Editar ${p.name}`})}/>
                                <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:p,table:'registration_pets'})}/>
                              </div></td>
                            </tr>
                          )
                        })

                        return rows
                      })}
                    </DTable>
                  </div>
                )}

                {/* MASCOTAS */}
                {page==='mascotas'&&(
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div><h1 className="text-2xl font-black" style={{color:tp}}>🐶 Mascotas</h1><p className="text-sm mt-0.5" style={{color:ts}}>{pets.length} mascotas · Muro de Huellas</p></div>
                      <AddBtn label="Nueva mascota" onClick={()=>setCreateM({table:'registration_pets',fields:[{key:'name',label:'Nombre mascota',required:true},{key:'breed',label:'Raza'},{key:'size',label:'Tamaño',options:['Pequeño','Mediano','Grande']},{key:'age',label:'Edad'},{key:'bio',label:'Bio'}],title:'Nueva mascota',defaults:{is_primary:false,amount_cents:0,approved_for_wall:false}})}/>
                    </div>
                    <DTable headers={['Foto','Nombre','Raza','Tamaño','Dueño','Email','Bio','']} empty={!pets.length}>
                      {pets.map(p=>{
                        const owner=regs5k.find(r=>r.id===p.registration_id)
                        return (
                          <TR key={p.id}>
                            <TD>{p.photo_url?<img src={p.photo_url} className="w-10 h-10 rounded-lg object-cover" alt={p.name}/>:<div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{background:'rgba(255,255,255,0.05)'}}>🐶</div>}</TD>
                            <TD cls="font-bold">{p.name}{p.is_primary&&<span className="ml-1 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Principal</span>}</TD>
                            <TD>{p.breed}</TD><TD cls="capitalize">{p.size}</TD>
                            <TD cls="font-semibold">{owner?.full_name||'—'}</TD>
                            <TD cls="text-xs" style={{color:ts}}>{owner?.email||'—'}</TD>
                            <TD cls="text-xs max-w-[120px] truncate" style={{color:ts}}>{p.bio||'—'}</TD>
                            <TD><div className="flex gap-1">
                              {owner&&<Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:owner,table:'registrations_5k'})}/>}
                              <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:p,table:'registration_pets',fields:[{key:'name',label:'Nombre'},{key:'breed',label:'Raza'},{key:'age',label:'Edad'},{key:'size',label:'Tamaño'},{key:'bio',label:'Bio'},{key:'photo_url',label:'Foto de la mascota'}],title:`Editar ${p.name}`})}/>
                              <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:p,table:'registration_pets'})}/>
                            </div></TD>
                          </TR>
                        )
                      })}
                    </DTable>
                  </div>
                )}

                {/* COMERCIAL */}
                {page==='comercial'&&(()=>{
                  const stands=expositores.filter(e=>e.category==='comercial'||(!e.category&&e.stand_type!=='food_truck'))
                  const foodtrucks=expositores.filter(e=>e.category==='foodtruck'||e.stand_type==='food_truck')
                  const STANDS_DISPONIBLES=['AA01','A02','A03','A04','A05','AA06','AA07','A08','A09','A10','A11','AA12','AAA13','AA14','AA15','AA16','AA17','AA18','AA19','AA20','AA21','AA22','AA23','AAA24','AA25','A26','A27','A28','A29','AA30','AA31','A32','A33','A34','A35','AA36']
                  const FT_DISPONIBLES=['FT1','FT2','FT3','FT4','FT5','FT6','FT7','FT8']
                  const STAND_INFO:Record<string,{precio:string;frentes:string}> = {
                    'AA01':{precio:'$600.000',frentes:'Dos frentes'},'A02':{precio:'$500.000',frentes:'Un frente'},'A03':{precio:'$500.000',frentes:'Un frente'},'A04':{precio:'$500.000',frentes:'Un frente'},'A05':{precio:'$500.000',frentes:'Un frente'},'AA06':{precio:'$600.000',frentes:'Dos frentes'},'AA07':{precio:'$600.000',frentes:'Dos frentes'},'A08':{precio:'$500.000',frentes:'Un frente'},'A09':{precio:'$500.000',frentes:'Un frente'},'A10':{precio:'$500.000',frentes:'Un frente'},'A11':{precio:'$500.000',frentes:'Un frente'},'AA12':{precio:'$600.000',frentes:'Dos frentes'},'AAA13':{precio:'$800.000',frentes:'Tres frentes'},'AA14':{precio:'$600.000',frentes:'Dos frentes'},'AA15':{precio:'$600.000',frentes:'Dos frentes'},'AA16':{precio:'$600.000',frentes:'Dos frentes'},'AA17':{precio:'$600.000',frentes:'Dos frentes'},'AA18':{precio:'$600.000',frentes:'Dos frentes'},'AA19':{precio:'$600.000',frentes:'Dos frentes'},'AA20':{precio:'$600.000',frentes:'Dos frentes'},'AA21':{precio:'$600.000',frentes:'Dos frentes'},'AA22':{precio:'$600.000',frentes:'Dos frentes'},'AA23':{precio:'$600.000',frentes:'Dos frentes'},'AAA24':{precio:'$800.000',frentes:'Tres frentes'},'AA25':{precio:'$600.000',frentes:'Dos frentes'},'A26':{precio:'$500.000',frentes:'Un frente'},'A27':{precio:'$500.000',frentes:'Un frente'},'A28':{precio:'$500.000',frentes:'Un frente'},'A29':{precio:'$500.000',frentes:'Un frente'},'AA30':{precio:'$600.000',frentes:'Dos frentes'},'AA31':{precio:'$600.000',frentes:'Dos frentes'},'A32':{precio:'$500.000',frentes:'Un frente'},'A33':{precio:'$500.000',frentes:'Un frente'},'A34':{precio:'$500.000',frentes:'Un frente'},'A35':{precio:'$500.000',frentes:'Un frente'},'AA36':{precio:'$600.000',frentes:'Dos frentes'}
                  }
                  const standsOcupados=stands.map(e=>e.stand_id).filter(Boolean)
                  const ftOcupados=foodtrucks.map(e=>e.stand_id).filter(Boolean)
                  const standsLibres=STANDS_DISPONIBLES.filter(s=>!standsOcupados.includes(s))
                  const ftLibres=FT_DISPONIBLES.filter(s=>!ftOcupados.includes(s))
                  return (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div><h1 className="text-2xl font-black" style={{color:tp}}>🏪 Comercial</h1><p className="text-sm" style={{color:ts}}>Stands · Food Trucks · Toldos</p></div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>{[...expositores,...toldos].filter(r=>isOk(r.status)).length} ✅</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>{[...expositores,...toldos].filter(r=>r.status==='pending_payment').length} ⏳</span>
                        <AddBtn label={comTab==='toldo'?'Nuevo toldo':comTab==='foodtruck'?'Nuevo FT':'Nuevo stand'} onClick={()=>setCreateM(
                          comTab==='toldo'
                            ?{table:'toldos_reservations',fields:[{key:'brand_name',label:'Marca',required:true},{key:'responsible_name',label:'Responsable',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'quantity',label:'Cantidad',type:'number'},{key:'product_type',label:'Tipo producto'},{key:'payment_method',label:'Pago',options:PM}],title:'Nuevo toldo gastronómico',defaults:{status:'pending_payment',quantity:1}}
                            :comTab==='foodtruck'
                            ?{table:'expositor_reservations',fields:[{key:'brand_name',label:'Marca',required:true},{key:'responsible_name',label:'Responsable',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'stand_id',label:'Spot FT',options:ftLibres.length?ftLibres:FT_DISPONIBLES},{key:'vehicle_width_m',label:'Ancho vehículo (m)',type:'number'},{key:'vehicle_length_m',label:'Largo vehículo (m)',type:'number'},{key:'product_type',label:'Producto'},{key:'payment_method',label:'Pago',options:PM}],title:'Nuevo Food Truck',defaults:{status:'pending_payment',category:'foodtruck'}}
                            :{table:'expositor_reservations',fields:[{key:'brand_name',label:'Marca',required:true},{key:'responsible_name',label:'Responsable',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'stand_id',label:'Stand',options:standsLibres.length?standsLibres:STANDS_DISPONIBLES},{key:'stand_type',label:'Tipo',options:['AAA','AA','A']},{key:'description',label:'Descripción productos'},{key:'payment_method',label:'Pago',options:PM}],title:'Nuevo stand comercial',defaults:{status:'pending_payment',category:'comercial'}}
                        )}/>
                      </div>
                    </div>

                    {/* Resumen disponibilidad */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="rounded-xl p-3" style={{background:card,border:`1px solid ${br}`}}>
                        <div className="text-xs mb-1" style={{color:ts}}>🏪 Stands comerciales</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-emerald-400">{standsLibres.length}</span>
                          <span className="text-xs" style={{color:ts}}>libres de {STANDS_DISPONIBLES.length}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {STANDS_DISPONIBLES.map(s=>{
                            const existingRec=stands.find(e=>e.stand_id===s)
                            const isVendido=existingRec&&isOk(existingRec.status)
                            const isReservado=existingRec&&existingRec.status==='pending_payment'
                            const isLibre=!existingRec||existingRec.status==='available'
                            return (
                              <span key={s}
                                title={STAND_INFO[s]?`${STAND_INFO[s].precio} · ${STAND_INFO[s].frentes}${isReservado?' · Click para liberar':isLibre?' · Click para reservar temporalmente':''}` : ''}
                                onClick={async()=>{
                                  if(isVendido) return // no tocar vendidos
                                  if(isReservado&&existingRec&&(existingRec.brand_name==='RESERVADO'||existingRec.source_tag==='reserva-temporal')){
                                    // Liberar reserva temporal
                                    await supabase.from('expositor_reservations').delete().eq('id',existingRec.id)
                                    fetchAll()
                                  } else if(isLibre){
                                    // Crear reserva temporal
                                    await supabase.from('expositor_reservations').insert({stand_id:s,stand_type:s.startsWith('AAA')?'AAA':s.startsWith('AA')?'AA':'A',category:'comercial',brand_name:'RESERVADO',responsible_name:'Reserva temporal',email:'reserva@admin.com',phone:'0000000000',status:'pending_payment',amount_cents:0,source_tag:'reserva-temporal'})
                                    fetchAll()
                                  }
                                }}
                                className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${isVendido?'cursor-not-allowed':isLibre||isReservado?'cursor-pointer hover:opacity-80':''}`}
                                style={{
                                  background:isVendido?'rgba(239,68,68,0.15)':isReservado?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',
                                  color:isVendido?'#f87171':isReservado?'#f59e0b':'#10b981'
                                }}>
                                {s}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="rounded-xl p-3" style={{background:card,border:`1px solid ${br}`}}>
                        <div className="text-xs mb-1" style={{color:ts}}>🚚 Food Trucks</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-emerald-400">{ftLibres.length}</span>
                          <span className="text-xs" style={{color:ts}}>libres de {FT_DISPONIBLES.length}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {FT_DISPONIBLES.map(s=>{
                            const existingRec=foodtrucks.find(e=>e.stand_id===s)
                            const isVendido=existingRec&&isOk(existingRec.status)
                            const isReservado=existingRec&&existingRec.status==='pending_payment'
                            const isLibre=!existingRec||existingRec.status==='available'
                            return (
                              <span key={s}
                                onClick={async()=>{
                                  if(isVendido) return
                                  if(isReservado&&existingRec&&(existingRec.brand_name==='RESERVADO'||existingRec.source_tag==='reserva-temporal')){
                                    await supabase.from('expositor_reservations').delete().eq('id',existingRec.id)
                                    fetchAll()
                                  } else if(isLibre){
                                    await supabase.from('expositor_reservations').insert({stand_id:s,category:'foodtruck',brand_name:'RESERVADO',responsible_name:'Reserva temporal',email:'reserva@admin.com',phone:'0000000000',status:'pending_payment',amount_cents:0,source_tag:'reserva-temporal'})
                                    fetchAll()
                                  }
                                }}
                                className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${isVendido?'cursor-not-allowed':'cursor-pointer hover:opacity-80'}`}
                                style={{
                                  background:isVendido?'rgba(239,68,68,0.15)':isReservado?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',
                                  color:isVendido?'#f87171':isReservado?'#f59e0b':'#10b981'
                                }}>
                                {s}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="rounded-xl p-3" style={{background:card,border:`1px solid ${br}`}}>
                        <div className="text-xs mb-1" style={{color:ts}}>⛺ Toldos</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black" style={{color:tp}}>{toldos.length}</span>
                          <span className="text-xs" style={{color:ts}}>registrados</span>
                        </div>
                        <div className="text-xs mt-1" style={{color:ts}}>{toldos.filter(t=>isOk(t.status)).length} aprobados · {toldos.filter(t=>t.status==='pending_payment').length} pendientes</div>
                      </div>
                    </div>

                    <Tabs value={comTab} onChange={v=>setComTab(v as any)} options={[
                      {id:'stand',label:'🏪 Stands',count:stands.length},
                      {id:'foodtruck',label:'🚚 Food Trucks',count:foodtrucks.length},
                      {id:'toldo',label:'⛺ Toldos',count:toldos.length}
                    ]}/>

                    {comTab==='stand'&&(
                      <DTable headers={['Stand','Marca','Responsable','Tipo','Estado','Monto','Docs','Contrato','']} empty={!stands.length}>
                        {stands.map(e=>(
                          <TR key={e.id}>
                            <TD><span className="font-mono font-black text-sm px-2 py-1 rounded-lg" style={{background:'rgba(0,188,212,0.15)',color:'#00BCD4'}}>{e.stand_id||'—'}</span></TD>
                            <TD cls="font-bold">{e.brand_name}</TD>
                            <TD><div className="font-medium">{e.responsible_name||e.contact_name}</div><div className="text-xs" style={{color:ts}}>{e.email}</div></TD>
                            <TD cls="text-xs uppercase font-bold" style={{color:ts}}>{e.stand_type||'—'}</TD>
                            <TD><StandStatusBtn record={e} table="expositor_reservations" onSaved={fetchAll}/></TD>
                            <TD cls="text-xs font-bold text-emerald-400">{e.amount_cents?fmtCOP(e.amount_cents):e.total_amount?fmtCOP(e.total_amount):'—'}</TD>
                            <TD><div className="flex gap-1"><DocBadge ok={!!e.cedula_url} label="CC" url={e.cedula_url}/><DocBadge ok={!!e.rut_url} label="RUT" url={e.rut_url}/></div></TD>
                            <TD><div className="flex items-center gap-1">{e.contract_signed_at?<span className="text-xs font-bold text-emerald-400">✓</span>:<span className="text-xs font-bold text-amber-400">⏳</span>}{<Btn icon="📝" color="bg-blue-500/15 text-blue-400" onClick={()=>setContractM({name:e.responsible_name||e.contact_name||'',email:e.email,recordId:e.id,table:'expositor_reservations',contractToken:e.contract_token,contractSignedAt:e.contract_signed_at,contractPdfUrl:e.contract_pdf_url})}/>}</div></TD>
                            <TD><div className="flex gap-1">
                              <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:e,table:'expositor_reservations'})}/>
                              <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:e,table:'expositor_reservations',fields:[{key:'stand_id',label:'Stand',options:STANDS_DISPONIBLES},{key:'brand_name',label:'Marca'},{key:'responsible_name',label:'Responsable'},{key:'contact_name',label:'Contacto empresa'},{key:'email',label:'Email'},{key:'phone',label:'Teléfono'},{key:'stand_type',label:'Tipo',options:['AAA','AA','A']},{key:'description',label:'Descripción'},{key:'payment_method',label:'Pago',options:PM},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'cedula_url',label:'Cédula (CC)'},{key:'rut_url',label:'RUT'},{key:'camara_comercio_url',label:'Cámara de Comercio'}]})}/>
                              <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:e,table:'expositor_reservations'})}/>
                            </div></TD>
                          </TR>
                        ))}
                      </DTable>
                    )}

                    {comTab==='foodtruck'&&(
                      <DTable headers={['Spot','Marca','Responsable','Dimensiones','Estado','Monto','Docs','Contrato','']} empty={!foodtrucks.length}>
                        {foodtrucks.map(e=>(
                          <TR key={e.id}>
                            <TD><span className="font-mono font-black text-sm px-2 py-1 rounded-lg" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>{e.stand_id||'—'}</span></TD>
                            <TD cls="font-bold">{e.brand_name}</TD>
                            <TD><div className="font-medium">{e.responsible_name||e.contact_name}</div><div className="text-xs" style={{color:ts}}>{e.email}</div></TD>
                            <TD cls="text-xs" style={{color:ts}}>{(e as any).ft_width_m&&(e as any).ft_length_m?`${(e as any).ft_width_m}×${(e as any).ft_length_m}m`:'—'}</TD>
                            <TD><StandStatusBtn record={e} table="expositor_reservations" onSaved={fetchAll}/></TD>
                            <TD cls="text-xs font-bold text-emerald-400">{e.amount_cents?fmtCOP(e.amount_cents):e.total_amount?fmtCOP(e.total_amount):'—'}</TD>
                            <TD><div className="flex gap-1"><DocBadge ok={!!e.cedula_url} label="CC" url={e.cedula_url}/><DocBadge ok={!!e.rut_url} label="RUT" url={e.rut_url}/></div></TD>
                            <TD><div className="flex items-center gap-1">{e.contract_signed_at?<span className="text-xs font-bold text-emerald-400">✓</span>:<span className="text-xs font-bold text-amber-400">⏳</span>}{<Btn icon="📝" color="bg-blue-500/15 text-blue-400" onClick={()=>setContractM({name:e.responsible_name||e.contact_name||'',email:e.email,recordId:e.id,table:'expositor_reservations',contractToken:e.contract_token,contractSignedAt:e.contract_signed_at,contractPdfUrl:e.contract_pdf_url})}/>}</div></TD>
                            <TD><div className="flex gap-1">
                              <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:e,table:'expositor_reservations'})}/>
                              <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:e,table:'expositor_reservations',fields:[{key:'stand_id',label:'Spot FT',options:FT_DISPONIBLES},{key:'brand_name',label:'Marca'},{key:'responsible_name',label:'Responsable'},{key:'email',label:'Email'},{key:'phone',label:'Teléfono'},{key:'product_type',label:'Producto'},{key:'ft_width_m',label:'Ancho (m)'},{key:'ft_length_m',label:'Largo (m)'},{key:'payment_method',label:'Pago',options:PM},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'cedula_url',label:'Cédula (CC)'},{key:'rut_url',label:'RUT'}]})}/>
                              <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:e,table:'expositor_reservations'})}/>
                            </div></TD>
                          </TR>
                        ))}
                      </DTable>
                    )}

                    {comTab==='toldo'&&(
                      <DTable headers={['Marca','Responsable','Cant','Estado','Monto','Docs','Contrato','']} empty={!toldos.length}>
                        {toldos.map(t=>(
                          <TR key={t.id}>
                            <TD cls="font-bold">{t.brand_name}</TD>
                            <TD><div className="font-medium">{t.responsible_name}</div><div className="text-xs" style={{color:ts}}>{t.email}</div></TD>
                            <TD>{t.quantity}</TD>
                            <TD><StandStatusBtn record={t} table="toldos_reservations" onSaved={fetchAll}/></TD>
                            <TD cls="text-xs font-bold text-emerald-400">{t.amount_cents?fmtCOP(t.amount_cents):'—'}</TD>
                            <TD><div className="flex gap-1"><DocBadge ok={!!t.cedula_url} label="CC" url={t.cedula_url}/><DocBadge ok={!!t.rut_url} label="RUT" url={t.rut_url}/></div></TD>
                            <TD><div className="flex items-center gap-1">{t.contract_signed_at?<span className="text-xs font-bold text-emerald-400">✓</span>:<span className="text-xs font-bold text-amber-400">⏳</span>}{<Btn icon="📝" color="bg-blue-500/15 text-blue-400" onClick={()=>setContractM({name:t.responsible_name,email:t.email,recordId:t.id,table:'toldos_reservations',contractToken:t.contract_token,contractSignedAt:t.contract_signed_at,contractPdfUrl:t.contract_pdf_url})}/>}</div></TD>
                            <TD><div className="flex gap-1">
                              <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:t,table:'toldos_reservations'})}/>
                              <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:t,table:'toldos_reservations',fields:[{key:'brand_name',label:'Marca'},{key:'responsible_name',label:'Responsable'},{key:'email',label:'Email'},{key:'payment_method',label:'Pago',options:PM},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'cedula_url',label:'Cédula (CC)'},{key:'rut_url',label:'RUT'},{key:'camara_comercio_url',label:'Cámara de Comercio'}]})}/>
                              <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:t,table:'toldos_reservations'})}/>
                            </div></TD>
                          </TR>
                        ))}
                      </DTable>
                    )}
                  </div>
                  )
                })()}

                {/* DEPORTES */}
                {page==='deportes'&&(
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div><h1 className="text-2xl font-black" style={{color:tp}}>⚽ Deportes</h1><p className="text-sm mt-0.5" style={{color:ts}}>{teams.length} equipos · {players.length} jugadores</p></div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>{teams.filter(t=>isOk(t.status)).length} ✅</span>
                        <AddBtn label="Nuevo equipo" onClick={()=>setCreateM({table:'sports_team_registrations',fields:[{key:'captain_name',label:'Capitán',required:true},{key:'captain_email',label:'Email capitán',type:'email',required:true},{key:'captain_phone',label:'Teléfono'},{key:'captain_cedula',label:'Cédula capitán'},{key:'team_name',label:'Nombre equipo'},{key:'sport',label:'Deporte',options:['futbol','padel','tenis']},{key:'category',label:'Categoría',options:['adultos','ninos']},{key:'player_count',label:'# jugadores',type:'number'},{key:'payment_method',label:'Pago',options:PM}],title:'Nuevo equipo deportivo',defaults:{status:'pending_payment',amount_cents:0,source_tag:'deporte-manual'}})}/>
                      </div>
                    </div>
                    <Tabs value={depTab} onChange={v=>setDepTab(v as any)} options={[
                      {id:'futbol_adultos',label:'⚽ Adultos',count:teams.filter(t=>t.sport==='futbol'&&t.category==='adultos').length},
                      {id:'futbol_ninos',label:'👦 Niños',count:teams.filter(t=>t.sport==='futbol'&&t.category==='ninos').length},
                      {id:'padel',label:'🎾 Pádel',count:teams.filter(t=>t.sport==='padel').length},
                      {id:'tenis',label:'🎾 Tenis',count:teams.filter(t=>t.sport==='tenis').length},
                    ]}/>
                    <DTable headers={['Jugador','Equipo','Email/Tel','Rol','Estado','Monto','Fecha','']} empty={!depTeams.length}>
                      {depTeams.flatMap(team=>{
                        const teamPlayers=players.filter(p=>p.team_id===team.id)
                        const eqpId=team.id.slice(-4).toUpperCase()
                        const rows:React.ReactNode[]=[]

                        // Fila del capitán/equipo
                        rows.push(
                          <TR key={team.id}>
                            <TD>
                              <div className="flex items-center gap-2">
                                <span>👑</span>
                                <div>
                                  <div className="font-bold">{team.team_name||team.captain_name}</div>
                                  <div className="text-xs" style={{color:ts}}>Cap: {team.captain_name} · {team.captain_cedula||'Sin cédula'}</div>
                                </div>
                              </div>
                            </TD>
                            <TD>
                              <div className="flex gap-1 flex-wrap">
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:'rgba(96,165,250,0.15)',color:'#60a5fa'}}>
                                  👤 {teamPlayers.length}/{team.player_count}
                                </span>
                                {(team as any).team_slot&&<span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:'rgba(168,85,247,0.15)',color:'#c084fc'}}>Slot {(team as any).team_slot}</span>}
                              </div>
                            </TD>
                            <TD cls="text-xs" style={{color:ts}}>{team.captain_email}</TD>
                            <TD cls="text-xs capitalize" style={{color:ts}}>{team.sport} {team.category||''}</TD>
                            <TD><div className="flex items-center gap-1"><Badge status={team.status}/>{!isOk(team.status)&&<Btn icon="✅" color="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" onClick={()=>setApproveM({record:team,table:'sports_team_registrations'})}/>}</div></TD>
                            <TD cls="text-xs font-bold text-emerald-400">{fmtCOP(team.amount_cents)}</TD>
                            <TD cls="text-xs" style={{color:ts}}>{fmtDate(team.created_at)}</TD>
                            <TD><div className="flex gap-1">
                              <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:team,table:'sports_team_registrations'})}/>
                              <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:team,table:'sports_team_registrations',fields:[{key:'captain_name',label:'Capitán'},{key:'captain_email',label:'Email'},{key:'captain_phone',label:'Teléfono'},{key:'team_name',label:'Nombre equipo'},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'payment_method',label:'Pago',options:PM}],title:'Editar equipo'})}/>
                              <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:team,table:'sports_team_registrations'})}/>
                            </div></TD>
                          </TR>
                        )

                        // Filas de jugadores
                        teamPlayers.forEach(p=>{
                          rows.push(
                            <tr key={p.id} style={{borderTop:'1px solid rgba(255,255,255,0.04)',background:'rgba(255,255,255,0.015)'}}>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2 pl-4">
                                  <span>{p.is_captain?'⚽':'👤'}</span>
                                  <div>
                                    <div className="text-sm text-gray-300">{p.name}</div>
                                    <div className="text-xs" style={{color:ts}}>{p.cedula||p.ti||'Sin documento'}{p.age?` · ${p.age}a`:''}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>↳ EQP-{eqpId}</td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>{p.email||p.phone||p.responsable_name||'—'}</td>
                              <td className="px-4 py-2 text-xs" style={{color:p.is_captain?'#fbbf24':ts}}>{p.is_captain?'Capitán':'Jugador'}</td>
                              <td className="px-4 py-2"><Badge status={team.status}/></td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>—</td>
                              <td className="px-4 py-2 text-xs" style={{color:ts}}>{fmtDate(p.created_at)}</td>
                              <td className="px-4 py-2"><div className="flex gap-1">
                                <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:p,table:'sports_team_players'})}/>
                                <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:p,table:'sports_team_players',fields:[{key:'name',label:'Nombre'},{key:'cedula',label:'Cédula'},{key:'ti',label:'TI (menores)'},{key:'age',label:'Edad',type:'number'},{key:'email',label:'Email'},{key:'phone',label:'Teléfono'},{key:'responsable_name',label:'Responsable'},{key:'responsable_phone',label:'Tel. responsable'}],title:'Editar jugador'})}/>
                                <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:p,table:'sports_team_players'})}/>
                              </div></td>
                            </tr>
                          )
                        })

                        return rows
                      })}
                    </DTable>
                  </div>
                )}

                {/* PATROCINADORES */}
                {page==='patrocinadores'&&(
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div><h1 className="text-2xl font-black" style={{color:tp}}>⭐ Patrocinadores</h1><p className="text-sm mt-0.5" style={{color:ts}}>{sponsors.length} solicitudes</p></div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>{sponsors.filter(s=>isOk(s.status)).length} ✅</span>
                        <AddBtn label="Nuevo patrocinio" onClick={()=>setCreateM({table:'sponsor_inquiries',fields:[{key:'company_name',label:'Empresa',required:true},{key:'contact_name',label:'Contacto',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'phone',label:'Teléfono'},{key:'cedula',label:'Cédula'},{key:'plan_type',label:'Tipo plan',options:['empresarial','deportivo','espacios']},{key:'plan_name',label:'Nombre del plan'},{key:'payment_method',label:'Pago',options:PM}],title:'Nuevo patrocinador',defaults:{status:'pending_payment'}})}/>
                      </div>
                    </div>
                    <Tabs value={sponsorTab} onChange={v=>setSponsorTab(v as any)} options={[
                      {id:'empresarial',label:'🏢 Empresarial',count:sponsors.filter(s=>s.plan_type==='empresarial').length},
                      {id:'deportivo',label:'🏆 Deportivo',count:sponsors.filter(s=>s.plan_type==='deportivo').length},
                      {id:'espacios',label:'📦 Espacios',count:sponsors.filter(s=>s.plan_type==='espacios').length},
                    ]}/>
                    {sponsorTab==='espacios'&&sponsorItems.length>0&&(
                      <div className="mb-5 rounded-2xl p-4" style={{background:card,border:`1px solid ${br}`}}>
                        <h3 className="text-sm font-bold mb-3" style={{color:tp}}>📦 Productos pedidos</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(sponsorItems.reduce((acc,item)=>{const k=item.product_name+(item.variant_label?` · ${item.variant_label}`:'');acc[k]=(acc[k]||0)+item.quantity;return acc},{}as Record<string,number>)).map(([prod,qty])=>(
                            <div key={prod} className="flex items-center justify-between rounded-xl px-3 py-2" style={{background:'rgba(255,255,255,0.05)'}}>
                              <span className="text-sm" style={{color:tp}}>{prod}</span>
                              <span className="text-sm font-bold text-emerald-400">{qty} u.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <DTable headers={['Empresa','Contacto','Plan','Estado','Monto','Docs','Contrato','']} empty={!sponsors.filter(s=>s.plan_type===sponsorTab).length}>
                      {sponsors.filter(s=>s.plan_type===sponsorTab).map(s=>(
                        <TR key={s.id}>
                          <TD cls="font-bold">{s.company_name}</TD>
                          <TD><div className="font-medium">{s.contact_name}</div><div className="text-xs" style={{color:ts}}>{s.email}</div></TD>
                          <TD><span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>{s.plan_name}</span></TD>
                          <TD><div className="flex items-center gap-1 flex-wrap"><Badge status={s.status}/>{!isOk(s.status)&&<Btn icon="✅" color="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" onClick={()=>setApproveM({record:s,table:'sponsor_inquiries'})}/>}</div></TD>
                          <TD cls="text-xs font-bold text-emerald-400">{s.amount_cents?fmtCOP(s.amount_cents):'—'}</TD>
                          <TD><div className="flex gap-1 flex-wrap"><DocBadge ok={!!s.cedula_url} label="CC" url={s.cedula_url}/><DocBadge ok={!!s.rut_url} label="RUT" url={s.rut_url}/><DocBadge ok={!!s.camara_comercio_url} label="CAM" url={s.camara_comercio_url}/></div></TD>
                          <TD>{s.contract_signed_at?<span className="text-xs font-bold text-emerald-400">✓ Firmado</span>:<span className="text-xs font-bold text-amber-400">⏳</span>}<Btn icon="📝" color="bg-blue-500/15 text-blue-400" onClick={()=>setContractM({name:s.contact_name,email:s.email,recordId:s.id,table:'sponsor_inquiries',contractToken:s.contract_token,contractSignedAt:s.contract_signed_at,contractPdfUrl:s.contract_pdf_url})}/></TD>
                          <TD><div className="flex gap-1">
                            <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:s,table:'sponsor_inquiries'})}/>
                            <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:s,table:'sponsor_inquiries',fields:[{key:'company_name',label:'Empresa'},{key:'contact_name',label:'Contacto'},{key:'email',label:'Email'},{key:'plan_name',label:'Plan'},{key:'payment_method',label:'Pago',options:PM},{key:'status',label:'Estado',options:['paid','pending_payment','declined']},{key:'comments',label:'Comentarios'},{key:'cedula_url',label:'Cédula (CC)'},{key:'rut_url',label:'RUT'},{key:'camara_comercio_url',label:'Cámara de Comercio'}]})}/>
                            <Btn icon="🗑️" color="bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={()=>setDeleteM({record:s,table:'sponsor_inquiries'})}/>
                          </div></TD>
                        </TR>
                      ))}
                    </DTable>
                  </div>
                )}

                {/* MARCAS */}
                {page==='marcas'&&(
                  <div>
                    <h1 className="text-2xl font-black mb-1" style={{color:tp}}>🖼️ Marcas & Logos</h1>
                    <p className="text-sm mb-5" style={{color:ts}}>Logos publicados en la web del evento</p>
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <div className="rounded-2xl p-5" style={{background:card,border:`1px solid ${br}`}}>
                        <h2 className="text-sm font-bold mb-4" style={{color:tp}}>⬆️ Subir nueva marca</h2>
                        <div className="space-y-3 mb-4">
                          <div><label className="text-xs mb-1 block" style={{color:ts}}>Nombre *</label>
                            <input className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{background:inputBg,border:`1px solid ${br}`,color:tp}}
                              placeholder="Ej: VetCare Colombia" value={logoName} onChange={e=>setLogoName(e.target.value)}/></div>
                          <div><label className="text-xs mb-1 block" style={{color:ts}}>Categoría</label>
                            <select className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{background:dark?'#12122a':'#fff',border:`1px solid ${br}`,color:tp}}
                              value={logoTier} onChange={e=>setLogoTier(e.target.value)}>
                              {TIERS.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                          <div><label className="text-xs mb-1 block" style={{color:ts}}>Orden en banner</label>
                            <input type="number" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{background:inputBg,border:`1px solid ${br}`,color:tp}}
                              value={logoOrder} onChange={e=>setLogoOrder(Number(e.target.value))}/></div>
                        </div>
                        <div className="rounded-xl p-3 mb-3 text-xs" style={{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.15)',color:'#93c5fd'}}>
                          ✅ SVG · PNG · WebP · JPG &nbsp;·&nbsp; Fondo transparente recomendado &nbsp;·&nbsp; 512×512px ideal &nbsp;·&nbsp; Máx 500KB
                        </div>
                        <div className="rounded-xl p-5 text-center cursor-pointer mb-3 hover:border-emerald-500/40 transition-colors"
                          style={{border:'2px dashed rgba(255,255,255,0.12)'}} onClick={()=>fileRef.current?.click()}>
                          <input ref={fileRef} type="file" accept=".svg,.png,.webp,.jpg,.jpeg" className="hidden"
                            onChange={e=>{const f=e.target.files?.[0];if(f){setLogoFile(f);setLogoPreview(URL.createObjectURL(f));setLogoMsg(null)}}}/>
                          {logoPreview
                            ?<div className="flex items-center justify-center gap-3">
                              <img src={logoPreview} className="w-14 h-14 object-contain bg-white/5 rounded-xl p-2" alt="preview"/>
                              <div className="text-left"><div className="text-xs font-bold" style={{color:tp}}>{logoFile?.name}</div><div className="text-xs text-emerald-400 mt-0.5">✓ {logoFile?(logoFile.size/1024).toFixed(0):0}KB</div></div>
                            </div>
                            :<><div className="text-3xl mb-2">🖼️</div><div className="text-sm" style={{color:ts}}>Click para subir imagen</div></>}
                        </div>
                        {logoMsg&&<div className={`text-xs rounded-xl px-3 py-2.5 mb-3 font-medium ${logoMsg.ok?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{logoMsg.text}</div>}
                        <motion.button onClick={uploadLogo} disabled={!logoFile||!logoName.trim()||logoUploading}
                          whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                          className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-30"
                          style={{background:'linear-gradient(135deg,#059669,#047857)'}}>
                          {logoUploading?'⏳ Subiendo...':'🚀 Publicar en la web'}
                        </motion.button>
                      </div>
                      <div className="rounded-2xl p-5" style={{background:card,border:`1px solid ${br}`}}>
                        <h2 className="text-sm font-bold mb-4" style={{color:tp}}>👁️ Preview del banner</h2>
                        <div className="rounded-xl p-3 overflow-x-auto mb-3" style={{background:'rgba(255,255,255,0.03)'}}>
                          <div className="flex gap-3 pb-1">
                            {publicSponsors.filter(s=>s.is_active).sort((a,b)=>a.display_order-b.display_order).map(s=>(
                              <div key={s.id} className="flex-shrink-0 flex flex-col items-center gap-1">
                                <div className="w-12 h-12 rounded-xl bg-white p-1.5"><img src={s.logo_url} alt={s.name} className="w-full h-full object-contain"/></div>
                                <div className="text-xs w-12 truncate text-center" style={{color:ts}}>{s.name}</div>
                              </div>
                            ))}
                            {!publicSponsors.filter(s=>s.is_active).length&&<div className="text-xs py-8 text-center w-full" style={{color:ts}}>Sin logos activos</div>}
                          </div>
                        </div>
                        <div className="text-xs mb-3" style={{color:ts}}>{publicSponsors.filter(s=>s.is_active).length} activos · {publicSponsors.filter(s=>!s.is_active).length} ocultos</div>
                        <div className="space-y-1.5">
                          {TIERS.map(tier=>{const cnt=publicSponsors.filter(s=>s.tier===tier).length;if(!cnt)return null;return(
                            <div key={tier} className="flex items-center justify-between rounded-lg px-3 py-2" style={{background:'rgba(255,255,255,0.04)'}}>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${TC[tier]}`}>{tier}</span>
                              <span className="text-xs" style={{color:ts}}>{cnt} marca{cnt>1?'s':''}</span>
                            </div>
                          )})}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl p-5" style={{background:card,border:`1px solid ${br}`}}>
                      <h2 className="text-sm font-bold mb-4" style={{color:tp}}>Todas las marcas ({publicSponsors.length})</h2>
                      {!publicSponsors.length
                        ?<div className="text-center py-10 text-sm" style={{color:ts}}>Aún no hay logos</div>
                        :<div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))'}}>
                          {publicSponsors.map(s=>(
                            <motion.div key={s.id} whileHover={{y:-2}} className="rounded-xl p-3 text-center"
                              style={{background:s.is_active?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)',border:`1px solid ${br}`,opacity:s.is_active?1:0.5}}>
                              <div className="w-12 h-12 rounded-xl bg-white mx-auto mb-2 p-1.5"><img src={s.logo_url} alt={s.name} className="w-full h-full object-contain"/></div>
                              <div className="text-xs font-bold truncate mb-1" style={{color:tp}}>{s.name}</div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${TC[s.tier]||''}`}>{s.tier}</span>
                              <div className="flex gap-1 mt-2 justify-center flex-wrap">
                                <button onClick={()=>setLogoEditM(s)} className="text-xs px-2 py-1 rounded-lg font-bold" style={{background:'rgba(59,130,246,0.15)',color:'#60a5fa'}}>✏️</button>
                                <button onClick={()=>supabase.from('public_sponsors').update({is_active:!s.is_active}).eq('id',s.id).then(fetchAll)}
                                  className="text-xs px-2 py-1 rounded-lg font-bold"
                                  style={s.is_active?{background:'rgba(255,255,255,0.08)',color:ts}:{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>
                                  {s.is_active?'Ocultar':'Activar'}
                                </button>
                                <button onClick={()=>{if(confirm(`¿Eliminar "${s.name}"?`))supabase.from('public_sponsors').delete().eq('id',s.id).then(fetchAll)}}
                                  className="text-xs px-2 py-1 rounded-lg" style={{background:'rgba(239,68,68,0.15)',color:'#f87171'}}>🗑️</button>
                              </div>
                            </motion.div>
                          ))}
                        </div>}
                    </div>
                  </div>
                )}

                {/* PAGOS */}
                {page==='pagos'&&(
                  <div>
                    <h1 className="text-2xl font-black mb-1" style={{color:tp}}>💳 Pagos</h1>
                    <p className="text-sm mb-5" style={{color:ts}}>Historial completo</p>
                    <div className="grid grid-cols-4 gap-4 mb-5">
                      {[{label:'Aprobados',value:totalApproved,color:'#10b981'},{label:'Pendientes',value:totalPending,color:'#f59e0b'},{label:'Rechazados',value:allR.filter(r=>r.status==='declined').length,color:'#ef4444'},{label:'Recaudado',value:fmtCOP(recaudado),color:'#10b981'}].map((m,i)=>(
                        <div key={i} className="rounded-2xl p-4" style={{background:card,border:`1px solid ${br}`}}>
                          <div className="text-2xl font-black" style={{color:m.color}}>{m.value}</div>
                          <div className="text-xs mt-1" style={{color:ts}}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <DTable headers={['Nombre','Cat','Tipo','Pago','Estado','Monto','TX','Fecha','']}>
                      {[
                        ...regs5k.map(r=>({name:r.full_name,cat:'🐾',tipo:r.ticket_type,method:r.payment_method||r.payment_provider,status:r.status,amount:r.amount_cents||r.total_amount,tx:r.wompi_transaction_id,date:r.created_at,rec:r,tbl:'registrations_5k'})),
                        ...expositores.map(e=>({name:e.brand_name,cat:'🏪',tipo:e.stand_type||e.category,method:e.payment_method,status:e.status,amount:e.amount_cents,tx:e.wompi_transaction_id,date:e.created_at,rec:e,tbl:'expositor_reservations'})),
                        ...toldos.map(t=>({name:t.brand_name,cat:'⛺',tipo:`${t.quantity}x toldo`,method:t.payment_method,status:t.status,amount:t.amount_cents,tx:t.wompi_transaction_id,date:t.created_at,rec:t,tbl:'toldos_reservations'})),
                        ...sponsors.map(s=>({name:s.contact_name,cat:'⭐',tipo:s.plan_name,method:s.payment_method,status:s.status,amount:s.amount_cents,tx:s.wompi_transaction_id,date:s.created_at,rec:s,tbl:'sponsor_inquiries'})),
                        ...teams.map(st=>({name:st.captain_name,cat:'⚽',tipo:`${st.sport} ${st.category||''}`,method:st.payment_method,status:st.status,amount:st.amount_cents,tx:st.wompi_transaction_id,date:st.created_at,rec:st,tbl:'sports_team_registrations'})),
                      ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map((r,i)=>(
                        <TR key={i}>
                          <TD cls="font-semibold">{r.name}</TD><TD>{r.cat}</TD>
                          <TD cls="text-xs capitalize" style={{color:ts}}>{r.tipo||'—'}</TD>
                          <TD cls="text-xs" style={{color:ts}}>{PL[r.method||'']||r.method||'—'}</TD>
                          <TD><Badge status={r.status}/></TD>
                          <TD cls="text-xs font-bold text-emerald-400">{r.amount?fmtCOP(r.amount):'—'}</TD>
                          <TD cls="text-xs font-mono" style={{color:ts}}>{r.tx?r.tx.slice(0,10)+'...':'—'}</TD>
                          <TD cls="text-xs" style={{color:ts}}>{fmtDate(r.date)}</TD>
                          <TD><div className="flex gap-1">
                            <Btn icon="👤" color="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" onClick={()=>setProfileM({record:r.rec,table:r.tbl})}/>
                            <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:r.rec,table:r.tbl,fields:efPago,title:'Editar pago'})}/>
                          </div></TD>
                        </TR>
                      ))}
                    </DTable>
                  </div>
                )}

                {/* ADMINISTRACIÓN */}
                {page==='admin'&&(
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-black" style={{color:tp}}>👥 Administración</h1>
                      <AddBtn label="Nuevo usuario" onClick={()=>setCreateM({table:'admin_users',fields:[{key:'full_name',label:'Nombre completo',required:true},{key:'email',label:'Email',type:'email',required:true},{key:'password_hash',label:'Contraseña',required:true},{key:'role',label:'Rol',options:['super_admin','admin','viewer','staff']}],title:'Nuevo usuario del panel',defaults:{is_active:true}})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="rounded-2xl overflow-hidden" style={{background:card,border:`1px solid ${br}`}}>
                        <div className="px-5 py-4" style={{borderBottom:`1px solid ${br}`}}>
                          <h3 className="text-sm font-bold" style={{color:tp}}>Usuarios del panel ({adminUsers.length})</h3>
                        </div>
                        <div className="divide-y" style={{borderColor:br}}>
                          {adminUsers.map(u=>(
                            <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm">{u.full_name.charAt(0)}</div>
                                <div>
                                  <div className="text-sm font-semibold" style={{color:tp}}>{u.full_name}</div>
                                  <div className="text-xs" style={{color:ts}}>{u.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                  style={{background:u.role==='super_admin'?'rgba(168,85,247,0.2)':'rgba(59,130,246,0.2)',color:u.role==='super_admin'?'#c084fc':'#60a5fa'}}>
                                  {u.role}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${u.is_active?'bg-emerald-500':'bg-red-500'}`}/>
                                <Btn icon="✏️" color="bg-white/5 text-gray-400 hover:bg-white/10" onClick={()=>setEditM({record:u,table:'admin_users',fields:[{key:'full_name',label:'Nombre'},{key:'email',label:'Email'},{key:'password_hash',label:'Contraseña'},{key:'role',label:'Rol',options:['super_admin','admin','viewer','staff']},{key:'is_active',label:'Activo',options:['true','false']}],title:'Editar usuario'})}/>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl p-5" style={{background:card,border:`1px solid ${br}`}}>
                        <h3 className="text-sm font-bold mb-4" style={{color:tp}}>📊 Resumen del sistema</h3>
                        <div className="space-y-2">
                          {[{l:'Registros 5K',v:regs5k.length},{l:'Mascotas',v:pets.length},{l:'Expositores',v:expositores.length},{l:'Toldos',v:toldos.length},{l:'Patrocinadores',v:sponsors.length},{l:'Equipos deportivos',v:teams.length},{l:'Jugadores',v:players.length},{l:'Logos publicados',v:publicSponsors.filter(s=>s.is_active).length},{l:'Usuarios panel',v:adminUsers.length}].map((item,i)=>(
                            <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2" style={{background:'rgba(255,255,255,0.04)'}}>
                              <span className="text-sm" style={{color:ts}}>{item.l}</span>
                              <span className="text-sm font-bold text-emerald-400">{item.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DESARROLLADORES */}
                {page==='dev'&&(
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-2xl font-black" style={{color:tp}}>⚙️ Desarrolladores</h1>
                        <p className="text-sm mt-0.5" style={{color:ts}}>Configuración técnica — edita aquí para cambiar a producción</p>
                      </div>
                      <motion.button onClick={()=>{localStorage.setItem('lh_dev_config',JSON.stringify(devConfig));setDevSaved(true);setTimeout(()=>setDevSaved(false),2000)}}
                        whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{background:'linear-gradient(135deg,#059669,#047857)'}}>
                        {devSaved?'✓ Guardado':'💾 Guardar config'}
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      {/* Supabase */}
                      <div className="rounded-2xl p-5" style={{background:card,border:`1px solid ${br}`}}>
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{color:tp}}>🗄 Supabase</h3>
                        <div className="space-y-3">
                          {[{l:'URL del proyecto',k:'supabaseUrl'},{l:'Anon Key',k:'supabaseKey'}].map(f=>(
                            <div key={f.k}>
                              <label className="text-xs mb-1 block" style={{color:ts}}>{f.l}</label>
                              <input className="w-full rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                                style={{background:inputBg,border:`1px solid ${br}`,color:tp}}
                                value={(devConfig as any)[f.k]} onChange={e=>setDevConfig({...devConfig,[f.k]:e.target.value})}/>
                            </div>
                          ))}
                          <div className="rounded-xl p-3 text-xs" style={{background:'rgba(255,255,255,0.04)'}}>
                            <div className="text-gray-500 mb-1">Storage bucket</div>
                            <div className="font-mono" style={{color:tp}}>sponsor-logos</div>
                          </div>
                          <div className="rounded-xl p-3 text-xs" style={{background:'rgba(255,255,255,0.04)'}}>
                            <div className="text-gray-500 mb-1">Edge Function</div>
                            <div className="font-mono" style={{color:tp}}>wompi-webhook</div>
                          </div>
                        </div>
                      </div>
                      {/* Wompi */}
                      <div className="rounded-2xl p-5" style={{background:card,border:`1px solid ${br}`}}>
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{color:tp}}>💳 Wompi</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs mb-1 block" style={{color:ts}}>Modo</label>
                            <select className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                              style={{background:dark?'#12122a':'#fff',border:`1px solid ${br}`,color:tp}}
                              value={devConfig.wompiMode} onChange={e=>setDevConfig({...devConfig,wompiMode:e.target.value})}>
                              <option value="test">🔴 TEST</option>
                              <option value="prod">🟢 PRODUCCIÓN</option>
                            </select>
                          </div>
                          {[{l:'Public Key',k:'wompiPublicKey'},{l:'Integrity Secret',k:'wompiIntegrityKey'},{l:'Events Secret',k:'wompiEventsSecret'},{l:'Webhook URL',k:'webhookUrl'}].map(f=>(
                            <div key={f.k}>
                              <label className="text-xs mb-1 block" style={{color:ts}}>{f.l}</label>
                              <input className="w-full rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                                style={{background:inputBg,border:`1px solid ${br}`,color:tp}}
                                value={(devConfig as any)[f.k]} onChange={e=>setDevConfig({...devConfig,[f.k]:e.target.value})}/>
                            </div>
                          ))}
                        </div>
                        {devConfig.wompiMode==='test'&&(
                          <div className="mt-4 rounded-xl p-3 text-xs font-bold" style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',color:'#f59e0b'}}>
                            ⚠️ Modo TEST — cambia a PRODUCCIÓN y actualiza las llaves antes del evento
                          </div>
                        )}
                        {devConfig.wompiMode==='prod'&&(
                          <div className="mt-4 rounded-xl p-3 text-xs font-bold" style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',color:'#10b981'}}>
                            ✅ Modo PRODUCCIÓN activo
                          </div>
                        )}
                      </div>
                      {/* Routing webhook */}
                      <div className="rounded-2xl p-5 col-span-2" style={{background:card,border:`1px solid ${br}`}}>
                        <h3 className="text-sm font-bold mb-4" style={{color:tp}}>🔀 Routing del webhook Wompi — prefijos de referencia</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {[{p:'CAMINATA-',t:'registrations_5k'},{p:'STAND-',t:'expositor_reservations'},{p:'FT-',t:'expositor_reservations'},{p:'TOLDO-',t:'toldos_reservations'},{p:'SPONSOR-',t:'sponsor_inquiries'},{p:'MURO-PETS-',t:'registrations_5k'},{p:'FUTBOL-A-',t:'sports_team_registrations'},{p:'FUTBOL-N-',t:'sports_team_registrations'},{p:'PADEL-',t:'sports_team_registrations'}].map((r,i)=>(
                            <div key={i} className="rounded-xl px-3 py-2.5" style={{background:'rgba(255,255,255,0.04)'}}>
                              <div className="text-xs font-mono font-bold text-emerald-400">{r.p}</div>
                              <div className="text-xs mt-0.5" style={{color:ts}}>{r.t}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {page==='emails'&&<EmailsPage dark={dark} br={br} tp={tp} ts={ts} card={card} regs5k={regs5k} expositores={expositores} toldos={toldos} sponsors={sponsors} teams={teams}/>}
                {page==='staff'&&<StaffPage user={authUser} dark={dark} br={br} tp={tp} ts={ts} card={card}/>}
                {page==='papelera'&&<PapeleraPage dark={dark} br={br} tp={tp} ts={ts} card={card} onHardDelete={(r:any,t:string)=>setHardDeleteM({record:r,table:t})} onRestore={fetchAll}/>}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {contractM&&<ContractModal name={contractM.name} email={contractM.email} recordId={contractM.recordId} table={contractM.table} contractToken={contractM.contractToken} contractSignedAt={contractM.contractSignedAt} contractPdfUrl={contractM.contractPdfUrl} email1SentAt={contractM.email1SentAt} onClose={()=>setContractM(null)}/>}
        {editM&&<EditModal record={editM.record} table={editM.table} fields={editM.fields} title={editM.title} onClose={()=>setEditM(null)} onSaved={fetchAll}/>}
        {approveM&&<ApproveModal record={approveM.record} table={approveM.table} onClose={()=>setApproveM(null)} onSaved={fetchAll}/>}
        {profileM&&(
          <ProfileModal
            record={profileM.record} table={profileM.table}
            allData={{regs5k,expositores,toldos,sponsors,teams,pets,attendees}}
            onClose={()=>setProfileM(null)}
            onSaved={async()=>{
              await fetchAll()
              const {data}=await supabase.from(profileM.table).select('*').eq('id',profileM.record.id).single()
              if(data) setProfileM(prev=>prev?{...prev,record:data}:null)
            }}
            onApprove={()=>{setProfileM(null);setApproveM({record:profileM.record,table:profileM.table})}}
            onContract={()=>{const n=profileM.record.full_name||profileM.record.responsible_name||profileM.record.company_name||profileM.record.captain_name||'';const e=profileM.record.email||profileM.record.captain_email||'';setProfileM(null);setContractM({name:n,email:e,recordId:profileM.record.id,table:profileM.table,contractToken:profileM.record.contract_token,contractSignedAt:profileM.record.contract_signed_at,contractPdfUrl:profileM.record.contract_pdf_url,email1SentAt:profileM.record.email1_sent_at})}}
          />
        )}
        {logoEditM&&<LogoEditModal logo={logoEditM} onClose={()=>setLogoEditM(null)} onSaved={fetchAll}/>}
        {teamM&&<TeamModal team={teamM} players={players.filter(p=>p.team_id===teamM.id)} onClose={()=>setTeamM(null)} onSaved={fetchAll}/>}
        {createM&&<CreateModal table={createM.table} fields={createM.fields} title={createM.title} defaults={createM.defaults} onClose={()=>setCreateM(null)} onSaved={fetchAll}/>}
        {deleteM&&<DeleteModal record={deleteM.record} table={deleteM.table} onClose={()=>setDeleteM(null)} onDeleted={fetchAll}/>}
        {hardDeleteM&&<HardDeleteModal record={hardDeleteM.record} table={hardDeleteM.table} onClose={()=>setHardDeleteM(null)} onDeleted={()=>{fetchAll();setHardDeleteM(null)}}/>}
      </AnimatePresence>
    </div>
  )
}