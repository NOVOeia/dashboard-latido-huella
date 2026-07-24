import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

const ENTRY_TYPES = [
  { value: 'visitante', label: '🎪 Visitante a la feria', desc: 'Ingreso general al evento' },
  { value: 'caminata', label: '🐾 Caminata 5K', desc: 'Ya registrado previamente' },
  { value: 'expositor', label: '🏪 Expositor / Stand', desc: 'Empresa participante' },
  { value: 'deportes', label: '⚽ Deportes', desc: 'Participante deportivo' },
]

export function TaquillaPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', entry_type: 'visitante' })
  const [terms, setTerms] = useState(false)
  const [habeas, setHabeas] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<any>(null)

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError('Ingresa un email válido'); return }
    if (!form.phone.trim()) { setError('El teléfono es obligatorio'); return }
    if (!terms || !habeas) { setError('Debes aceptar los términos y la autorización de datos'); return }

    setSaving(true)
    const { data, error: err } = await supabase
      .from('taquilla_registrations')
      .insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        entry_type: form.entry_type,
        accepted_terms: true,
        accepted_habeas_data: true,
      })
      .select()
      .single()

    if (err || !data) { setError('Error al registrar. Intenta de nuevo.'); setSaving(false); return }

    // Enviar email con QR
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://admin-latidoyhuella.netlify.app/taquilla-checkin/${data.qr_token}`)}`
      const entryLabel = ENTRY_TYPES.find(e => e.value === data.entry_type)?.label || 'Visitante'
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5">
          <div style="background:#0D1B6E;padding:32px;text-align:center;border-radius:16px 16px 0 0">
            <img src="${LOGO}" style="height:55px"/>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 16px 16px;text-align:center">
            <h2 style="color:#0D1B6E;margin:0 0 8px">¡Bienvenido a Latido y Huella 2026! 🐾</h2>
            <p style="color:#555;font-size:15px;margin:0 0 6px">Hola <strong>${data.full_name}</strong></p>
            <p style="color:#555;font-size:14px;margin:0 0 24px">Tu registro está confirmado. Presenta este QR en la entrada.</p>
            <div style="background:#f0f4ff;border-radius:16px;padding:24px;display:inline-block;margin:0 0 24px">
              <img src="${qrUrl}" style="width:200px;height:200px;display:block"/>
              <p style="color:#0D1B6E;font-weight:700;margin:12px 0 4px;font-size:13px">${entryLabel}</p>
              <p style="color:#888;font-size:11px;margin:0">${data.id.slice(-8).toUpperCase()}</p>
            </div>
            <div style="background:#fff3e0;border-left:4px solid #FFB300;padding:14px 16px;border-radius:0 10px 10px 0;text-align:left;margin:0 0 24px">
              <p style="color:#e65100;font-weight:700;margin:0 0 4px;font-size:14px">📅 26 de julio de 2026</p>
              <p style="color:#666;font-size:13px;margin:0">Parque COMFAMA Llanogrande · Llanogrande, Antioquia</p>
            </div>
            <p style="color:#888;font-size:12px;margin:0">eventos@latidoyhuella.co · WhatsApp +57 333 277 7912</p>
          </div>
        </div>`

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: `🐾 Tu boleta de ingreso — Latido y Huella 2026`,
          html,
          from: 'eventos@latidoyhuella.co',
          type: 'taquilla'
        })
      })
    } catch(_e) {}

    setDone(data)
    setSaving(false)
  }

  const reset = () => {
    setDone(null)
    setForm({ full_name: '', email: '', phone: '', entry_type: 'visitante' })
    setTerms(false)
    setHabeas(false)
    setError('')
  }

  if (done) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://admin-latidoyhuella.netlify.app/taquilla-checkin/${done.qr_token}`)}`
    return (
      <div style={{minHeight:'100vh',background:NAVY,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:'white',borderRadius:24,padding:32,maxWidth:440,width:'100%',textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <h2 style={{color:NAVY,fontSize:22,fontWeight:800,margin:'0 0 8px'}}>¡Registro exitoso!</h2>
          <p style={{color:'#555',fontSize:14,margin:'0 0 24px'}}>Le enviamos la boleta a <strong>{done.email}</strong></p>
          <div style={{background:'#f0f4ff',borderRadius:16,padding:20,marginBottom:24}}>
            <img src={qrUrl} style={{width:180,height:180,display:'block',margin:'0 auto 12px'}} alt="QR"/>
            <p style={{color:NAVY,fontWeight:700,margin:'0 0 4px',fontSize:14}}>{done.full_name}</p>
            <p style={{color:'#888',fontSize:12,margin:0}}>{ENTRY_TYPES.find(e=>e.value===done.entry_type)?.label}</p>
          </div>
          <button onClick={reset}
            style={{width:'100%',padding:'14px',borderRadius:12,background:CYAN,color:'white',border:'none',cursor:'pointer',fontWeight:800,fontSize:16}}>
            ➕ Registrar siguiente persona
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:NAVY,padding:'20px 16px'}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:24}}>
        <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a62b35ff7d31b0eb4534474.png" style={{width:'100%',maxWidth:480,borderRadius:16,marginBottom:16,display:'block',margin:'0 auto 16px'}} alt="Latido y Huella"/>
        <h1 style={{color:'white',fontSize:22,fontWeight:800,margin:'0 0 4px'}}>Registro de Ingreso</h1>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,margin:0}}>Taquilla · Latido y Huella 2026</p>
      </div>

      <div style={{maxWidth:480,margin:'0 auto',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:24}}>

        {/* Tipo de ingreso */}
        <div style={{marginBottom:20}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:700,marginBottom:10,textTransform:'uppercase',letterSpacing:1}}>Tipo de ingreso</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {ENTRY_TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({...f, entry_type: t.value}))}
                style={{padding:'10px 12px',borderRadius:12,border:`2px solid ${form.entry_type===t.value?CYAN:'rgba(255,255,255,0.15)'}`,background:form.entry_type===t.value?'rgba(0,188,212,0.15)':'rgba(255,255,255,0.04)',color:'white',cursor:'pointer',textAlign:'left'}}>
                <div style={{fontSize:13,fontWeight:700}}>{t.label}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Campos */}
        {[
          {key:'full_name', label:'Nombre completo *', placeholder:'Nombre y apellidos'},
          {key:'email', label:'Email *', placeholder:'correo@ejemplo.com', type:'email'},
          {key:'phone', label:'Teléfono *', placeholder:'300 000 0000', type:'tel'},
        ].map(f => (
          <div key={f.key} style={{marginBottom:14}}>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:700,marginBottom:6}}>{f.label}</div>
            <input
              type={f.type||'text'}
              placeholder={f.placeholder}
              value={(form as any)[f.key]}
              onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
              style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:15,outline:'none',boxSizing:'border-box'}}
            />
          </div>
        ))}

        {/* Checkboxes */}
        <div style={{marginTop:20,marginBottom:20}}>
          {[
            {checked:terms, set:setTerms, label:'Acepto los términos y condiciones del evento Latido y Huella 2026.'},
            {checked:habeas, set:setHabeas, label:'Autorizo el tratamiento de mis datos personales conforme a la ley 1581 de 2012.'},
          ].map((c,i) => (
            <label key={i} onClick={() => c.set(!c.checked)}
              style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:12,cursor:'pointer',padding:'12px 14px',background:'rgba(255,255,255,0.04)',border:`1px solid ${c.checked?CYAN:'rgba(255,255,255,0.1)'}`,borderRadius:10}}>
              <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${c.checked?CYAN:'rgba(255,255,255,0.3)'}`,background:c.checked?CYAN:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                {c.checked&&<span style={{color:'white',fontSize:12,fontWeight:800}}>✓</span>}
              </div>
              <span style={{color:'rgba(255,255,255,0.7)',fontSize:12,lineHeight:1.5}}>{c.label}</span>
            </label>
          ))}
        </div>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:16}}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          style={{width:'100%',padding:16,borderRadius:12,background:`linear-gradient(135deg,${CYAN},#0097A7)`,color:'white',border:'none',cursor:saving?'not-allowed':'pointer',fontWeight:800,fontSize:17,opacity:saving?0.7:1}}>
          {saving ? '⏳ Registrando...' : '✅ Registrar y enviar boleta'}
        </button>

        <p style={{color:'rgba(255,255,255,0.25)',fontSize:11,textAlign:'center',marginTop:16}}>
          Latido y Huella 2026 · 26 de julio · Llanogrande
        </p>
      </div>
    </div>
  )
}