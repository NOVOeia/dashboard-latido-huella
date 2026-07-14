import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

interface StaffMember {
  full_name: string
  cedula: string
  cedula_url: string
  phone: string
  eps_name: string
  arl_name: string
  arl_eps_url: string
}

const emptyMember = (): StaffMember => ({
  full_name: '', cedula: '', cedula_url: '', phone: '', eps_name: '', arl_name: '', arl_eps_url: ''
})

export function StaffRegisterPage() {
  const { id } = useParams<{ id: string }>()
  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [members, setMembers] = useState<StaffMember[]>([emptyMember()])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploadingIdx, setUploadingIdx] = useState<{idx:number;field:string}|null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) { setNotFound(true); setLoading(false); return }
      // Buscar en expositores
      const { data: exp } = await supabase.from('expositor_reservations').select('id, brand_name, responsible_name, email, category, status, stand_id').eq('id', id).maybeSingle()
      if (exp) { setEmpresa({ ...exp, tipo: 'expositor' }); setLoading(false); return }
      // Buscar en patrocinadores
      const { data: spon } = await supabase.from('sponsor_inquiries').select('id, company_name, contact_name, email, status').eq('id', id).maybeSingle()
      if (spon) { setEmpresa({ ...spon, brand_name: spon.company_name, responsible_name: spon.contact_name, tipo: 'patrocinador' }); setLoading(false); return }
      setNotFound(true); setLoading(false)
    }
    load()
  }, [id])

  const uploadFile = async (file: File, idx: number, field: 'cedula_url' | 'arl_eps_url') => {
    setUploadingIdx({ idx, field })
    const ext = file.name.split('.').pop()
    const path = `staff-docs/${id}_${Date.now()}_${field}.${ext}`
    const { error: upErr } = await supabase.storage.from('expositor-documents').upload(path, file, { upsert: true })
    if (upErr) { setError('Error al subir archivo'); setUploadingIdx(null); return }
    const { data: urlData } = supabase.storage.from('expositor-documents').getPublicUrl(path)
    updateMember(idx, field, urlData.publicUrl)
    setUploadingIdx(null)
  }

  const updateMember = (idx: number, field: keyof StaffMember, value: string) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const addMember = () => setMembers(prev => [...prev, emptyMember()])
  const removeMember = (idx: number) => setMembers(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    setError('')
    // Validar campos obligatorios
    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      if (!m.full_name || !m.cedula || !m.phone) {
        setError(`Empleado ${i + 1}: nombre, cédula y teléfono son obligatorios`)
        return
      }
    }
    setSaving(true)
    const inserts = members.map(m => ({
      expositor_id: empresa.tipo === 'expositor' ? id : null,
      sponsor_id: empresa.tipo === 'patrocinador' ? id : null,
      full_name: m.full_name,
      cedula: m.cedula,
      cedula_url: m.cedula_url,
      phone: m.phone,
      eps_name: m.eps_name,
      arl_name: m.arl_name,
      arl_eps_url: m.arl_eps_url,
      arl_eps: `${m.eps_name} / ${m.arl_name}`,
    }))
    const { error: insErr } = await supabase.from('stand_staff').insert(inserts)
    if (insErr) { setError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }
    setSaved(true); setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div><p>Cargando...</p></div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ color: 'white', textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 12 }}>❌</div><h2 style={{ fontSize: 22, fontWeight: 900 }}>Link no válido</h2><p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Este link no existe o ha expirado.</p></div>
    </div>
  )

  if (saved) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <img src={LOGO_URL} style={{ height: 60, marginBottom: 32 }} alt="Latido y Huella" />
      <div style={{ background: 'rgba(76,175,80,0.15)', border: '2px solid #4CAF50', borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>¡Registro exitoso!</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 16px' }}>
          {members.length} empleado{members.length > 1 ? 's' : ''} registrado{members.length > 1 ? 's' : ''} para <strong style={{ color: 'white' }}>{empresa.brand_name}</strong>
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Latido y Huella 2026 · 26 Jul · Llanogrande</p>
      </div>
      <button onClick={() => { setSaved(false); setMembers([emptyMember()]) }}
        style={{ marginTop: 20, padding: '12px 28px', borderRadius: 12, background: CYAN, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
        + Agregar más empleados
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e2a', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '32px 24px', textAlign: 'center' }}>
        <img src={LOGO_URL} style={{ height: 55, marginBottom: 16 }} alt="Latido y Huella" />
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>Registro de Personal de Stand</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>Latido y Huella 2026 · Fecha límite: 20 de julio</p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
        {/* Info empresa */}
        <div style={{ background: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <div style={{ color: CYAN, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{empresa.tipo === 'expositor' ? '🏪 EXPOSITOR' : '⭐ PATROCINADOR'}</div>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 900 }}>{empresa.brand_name}</div>
          {empresa.stand_id && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>Stand: {empresa.stand_id}</div>}
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{empresa.responsible_name}</div>
        </div>

        {/* Formulario empleados */}
        {members.map((m, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>👤 Empleado {idx + 1}</span>
              {members.length > 1 && <button onClick={() => removeMember(idx)}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                Eliminar
              </button>}
            </div>

            {/* Nombre */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre completo *</label>
              <input value={m.full_name} onChange={e => updateMember(idx, 'full_name', e.target.value)}
                placeholder="Nombre y apellidos"
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Cédula */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>Número de cédula *</label>
              <input value={m.cedula} onChange={e => updateMember(idx, 'cedula', e.target.value)}
                placeholder="Número de documento"
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Foto cédula */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>Foto de la cédula</label>
              {m.cedula_url
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#4ade80', fontSize: 12 }}>✅ Subida</span>
                    <a href={m.cedula_url} target="_blank" rel="noopener noreferrer" style={{ color: CYAN, fontSize: 12 }}>Ver</a>
                    <button onClick={() => updateMember(idx, 'cedula_url', '')} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Cambiar</button>
                  </div>
                : <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{uploadingIdx?.idx === idx && uploadingIdx?.field === 'cedula_url' ? '⏳ Subiendo...' : '📷 Subir foto de cédula'}</span>
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], idx, 'cedula_url')} />
                  </label>
              }
            </div>

            {/* Teléfono */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>Teléfono *</label>
              <input value={m.phone} onChange={e => updateMember(idx, 'phone', e.target.value)}
                placeholder="300 000 0000"
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* EPS y ARL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>EPS</label>
                <input value={m.eps_name} onChange={e => updateMember(idx, 'eps_name', e.target.value)}
                  placeholder="Nombre EPS"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>ARL</label>
                <input value={m.arl_name} onChange={e => updateMember(idx, 'arl_name', e.target.value)}
                  placeholder="Nombre ARL"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Foto ARL/EPS */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 4 }}>Documento ARL/EPS</label>
              {m.arl_eps_url
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#4ade80', fontSize: 12 }}>✅ Subido</span>
                    <a href={m.arl_eps_url} target="_blank" rel="noopener noreferrer" style={{ color: CYAN, fontSize: 12 }}>Ver</a>
                    <button onClick={() => updateMember(idx, 'arl_eps_url', '')} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Cambiar</button>
                  </div>
                : <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{uploadingIdx?.idx === idx && uploadingIdx?.field === 'arl_eps_url' ? '⏳ Subiendo...' : '📄 Subir documento ARL/EPS'}</span>
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], idx, 'arl_eps_url')} />
                  </label>
              }
            </div>
          </div>
        ))}

        {/* Botón agregar */}
        <button onClick={addMember}
          style={{ width: '100%', padding: 14, borderRadius: 12, background: 'transparent', border: `1px dashed ${CYAN}`, color: CYAN, cursor: 'pointer', fontWeight: 700, fontSize: 14, marginBottom: 20 }}>
          + Agregar otro empleado
        </button>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{error}</div>}

        {/* Botón guardar */}
        <button onClick={handleSubmit} disabled={saving}
          style={{ width: '100%', padding: 18, borderRadius: 14, background: `linear-gradient(135deg,${CYAN},#0097A7)`, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 16, opacity: saving ? 0.7 : 1 }}>
          {saving ? '⏳ Guardando...' : `✅ Registrar ${members.length} empleado${members.length > 1 ? 's' : ''}`}
        </button>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          Latido y Huella 2026 · eventos@latidoyhuella.co
        </p>
      </div>
    </div>
  )
}