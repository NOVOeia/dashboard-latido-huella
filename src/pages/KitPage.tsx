import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'
const GREEN = '#4CAF50'

const LOCATIONS: Record<string, { label: string; icon: string; address: string; schedule: string }> = {
  medellin: {
    label: 'Medellín',
    icon: '🏙️',
    address: 'Vitrina Chery — Calle 31 # 43-73',
    schedule: 'Viernes 24 Jul: 9:00 AM – 4:00 PM\nSábado 25 Jul: 9:00 AM – 12:00 M',
  },
  llanogrande: {
    label: 'Llanogrande',
    icon: '🌄',
    address: 'La Finca de Rigo — Glorieta El Tablazo, Llanogrande (Rionegro)',
    schedule: 'Viernes 24 Jul: 9:00 AM – 4:00 PM\nSábado 25 Jul: 9:00 AM – 12:00 M',
  },
}

export function KitPage() {
  const { id, location } = useParams<{ id: string; location: string }>()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [state, setState] = useState<'confirming' | 'already' | 'done' | 'changed'>('confirming')
  const [saving, setSaving] = useState(false)

  const loc = LOCATIONS[location || '']
  const otherLoc = location === 'medellin' ? 'llanogrande' : 'medellin'
  const otherLocData = LOCATIONS[otherLoc]

  useEffect(() => {
    const load = async () => {
      if (!id || !loc) { setNotFound(true); setLoading(false); return }
      const { data } = await supabase.from('registrations_5k').select('*').eq('id', id).maybeSingle()
      if (!data) { setNotFound(true); setLoading(false); return }
      setRecord(data)
      if (data.kit_pickup_location && data.kit_pickup_location !== location) {
        setState('already')
      } else if (data.kit_pickup_location === location) {
        setState('done')
      } else {
        await save(data)
      }
      setLoading(false)
    }
    load()
  }, [id, location])

  const save = async (rec?: any) => {
    setSaving(true)
    await supabase.from('registrations_5k').update({
      kit_pickup_location: location,
      kit_pickup_at: new Date().toISOString(),
    }).eq('id', id)
    setRecord({ ...(rec || record), kit_pickup_location: location })
    setState('done')
    setSaving(false)
  }

  const handleChange = async () => {
    await save()
    setState('changed')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center"><div className="text-4xl mb-4">⏳</div><p>Registrando tu selección...</p></div>
    </div>
  )

  if (notFound || !loc) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center p-8">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Link no válido</h2>
        <p className="text-white/60">Este link no existe o ya expiró.</p>
      </div>
    </div>
  )

  const nombre = record?.full_name?.split(' ')[0] || ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: NAVY }}>
      <img src={LOGO_URL} alt="Latido y Huella" className="h-14 mb-8" />

      {/* YA REGISTRADO — mismo lugar */}
      {state === 'done' && (
        <div className="w-full max-w-sm">
          <div className="rounded-2xl p-6 text-center mb-4" style={{ background: 'rgba(76,175,80,0.15)', border: '2px solid #4CAF50' }}>
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-white font-black text-xl mb-1">¡Kit registrado!</h2>
            <p className="text-white/70 text-sm">Tu kit será entregado en <strong className="text-white">{loc.label}</strong></p>
          </div>
          <div className="bg-white/10 rounded-2xl p-5">
            <p className="text-white font-bold text-base mb-1">{loc.icon} {loc.label}</p>
            <p className="text-white/80 text-sm mb-2">📍 {loc.address}</p>
            <p className="text-white/60 text-sm whitespace-pre-line">📅 {loc.schedule}</p>
          </div>
          <p className="text-white/40 text-xs text-center mt-4">Puedes cerrar esta pestaña</p>
        </div>
      )}

      {/* CAMBIADO */}
      {state === 'changed' && (
        <div className="w-full max-w-sm">
          <div className="rounded-2xl p-6 text-center mb-4" style={{ background: 'rgba(76,175,80,0.15)', border: '2px solid #4CAF50' }}>
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-white font-black text-xl mb-1">¡Lugar actualizado!</h2>
            <p className="text-white/70 text-sm">Tu kit ahora será entregado en <strong className="text-white">{loc.label}</strong></p>
          </div>
          <div className="bg-white/10 rounded-2xl p-5">
            <p className="text-white font-bold text-base mb-1">{loc.icon} {loc.label}</p>
            <p className="text-white/80 text-sm mb-2">📍 {loc.address}</p>
            <p className="text-white/60 text-sm whitespace-pre-line">📅 {loc.schedule}</p>
          </div>
          <p className="text-white/40 text-xs text-center mt-4">Puedes cerrar esta pestaña</p>
        </div>
      )}

      {/* YA TENÍA OTRO LUGAR */}
      {state === 'already' && (
        <div className="w-full max-w-sm">
          <div className="rounded-2xl p-5 text-center mb-4" style={{ background: 'rgba(255,179,0,0.15)', border: '2px solid #FFB300' }}>
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-white font-black text-lg mb-1">Ya tienes kit registrado</h2>
            <p className="text-white/70 text-sm">
              Tienes seleccionado el punto de <strong className="text-white">{otherLocData?.label}</strong>
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white/60 text-xs mb-1">Selección actual</p>
            <p className="text-white font-bold">{otherLocData?.icon} {otherLocData?.label}</p>
            <p className="text-white/60 text-xs mt-1">📍 {otherLocData?.address}</p>
          </div>

          <p className="text-white/80 text-sm text-center mb-4">¿Deseas cambiar a <strong className="text-white">{loc.label}</strong>?</p>

          <div className="space-y-3">
            <button onClick={handleChange} disabled={saving}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${CYAN},#0097A7)` }}>
              {saving ? 'Cambiando...' : `✅ Sí, cambiar a ${loc.label}`}
            </button>
            <button onClick={() => window.close()}
              className="w-full py-3 rounded-2xl font-bold text-sm border"
              style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)', background: 'transparent' }}>
              ❌ No, mantener {otherLocData?.label}
            </button>
          </div>
        </div>
      )}

      <p className="text-white/30 text-xs mt-8">Latido y Huella 2026 · eventos@latidoyhuella.co</p>
    </div>
  )
}