import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const LOGO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png'
const HERO_URL = 'https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45d0dbe569a25de124a8.png'
const CYAN = '#00BCD4'
const NAVY = '#0D1B6E'
const GREEN = '#4CAF50'
const YELLOW = '#FFB300'

function fmtCOP(cents: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format((cents || 0) / 100)
}

export function ECardPage() {
  const { id } = useParams<{ id: string }>()
  const cardRef = useRef<HTMLDivElement>(null)
  const [record, setRecord] = useState<any>(null)
  const [table, setTable] = useState('')
  const [pets, setPets] = useState<any[]>([])
  const [attendees, setAttendees] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const buscar = async () => {
      const tablas = [
        { t: 'registrations_5k', idField: 'id' },
        { t: 'expositor_reservations', idField: 'id' },
        { t: 'toldos_reservations', idField: 'id' },
        { t: 'sports_team_registrations', idField: 'id' },
        { t: 'sponsor_inquiries', idField: 'id' },
      ]
      for (const { t } of tablas) {
        const { data } = await supabase.from(t).select('*').eq('id', id).maybeSingle()
        if (data) {
          setRecord(data)
          setTable(t)
          if (t === 'registrations_5k') {
            const [pRes, aRes] = await Promise.all([
              supabase.from('registration_pets').select('*').eq('registration_id', id),
              supabase.from('registration_attendees').select('*').eq('registration_id', id),
            ])
            setPets(pRes.data || [])
            setAttendees(aRes.data || [])
          }
          if (t === 'sports_team_registrations') {
            const { data: pl } = await supabase.from('sports_team_players').select('*').eq('team_id', id).order('player_index')
            setPlayers(pl || [])
          }
          setLoading(false)
          return
        }
      }
      setNotFound(true)
      setLoading(false)
    }
    if (id) buscar()
  }, [id])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('https://esm.sh/html2canvas@1.4.1' as any)
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: NAVY,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      const link = document.createElement('a')
      link.download = `ticket-latido-huella-${eCardNum}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
      window.print()
    }
    setDownloading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center"><div className="text-4xl mb-4">⏳</div><p>Cargando ticket...</p></div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-white text-center p-8">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Ticket no encontrado</h2>
        <p className="text-white/60">Este link no es válido.</p>
      </div>
    </div>
  )

  const isExpositor = ['expositor_reservations', 'toldos_reservations'].includes(table)
  const isCaminata = table === 'registrations_5k'
  const isDeporte = table === 'sports_team_registrations'
  const isSponsor = table === 'sponsor_inquiries'

  const nombre = record.full_name || record.responsible_name || record.captain_name || record.contact_name || ''
  const email = record.email || record.captain_email || ''
  const telefono = record.phone || record.captain_phone || ''
  const eCardNum = `#LH-${id?.slice(-4).toUpperCase()}`
  const isPaid = record.status === 'paid' || record.status === 'approved'
  const isSigned = !!record.contract_signed_at || !!record.accepted_contract_at
  const petPhoto = pets.find(p => p.photo_url)?.photo_url || null
  // Adulto: hero=foto mascota, avatar=foto adulto
  // Mascota: hero=foto adulto, avatar=foto mascota
  const heroBg = petPhoto || record.photo_url || HERO_URL
  const avatarPhoto = record.photo_url || null

  const ICON_URL = 'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/expositor-documents/assets/icono_blanco_latido.png'
  const qrData = encodeURIComponent(JSON.stringify({
    id: eCardNum,
    nombre,
    tipo: isCaminata ? record.ticket_type : isExpositor ? 'Expositor' : isDeporte ? record.sport : 'Patrocinador',
    evento: 'Latido y Huella 2026',
    registroId: id,
  }))
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=0D1B6E&color=00BCD4&qzone=1&format=png`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0a0f2c' }}>

      {/* Card */}
      <div ref={cardRef} style={{
        width: 380, borderRadius: 28, overflow: 'hidden',
        background: NAVY, border: '1px solid rgba(0,188,212,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        fontFamily: "'DM Sans', Arial, sans-serif",
      }}>

        {/* Hero */}
        <div style={{ position: 'relative', height: 200 }}>
          <img src={heroBg} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} alt="" crossOrigin="anonymous" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,27,110,0.2) 0%, rgba(13,27,110,0.95) 100%)' }} />

          {/* Logo */}
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}>
            <img src={LOGO_URL} style={{ height: 36 }} alt="Latido y Huella" crossOrigin="anonymous" />
          </div>

          {/* Estado */}
          <div style={{ position: 'absolute', top: 14, right: 14, background: isPaid ? 'rgba(76,175,80,0.2)' : 'rgba(245,158,11,0.2)', border: `1px solid ${isPaid ? GREEN : YELLOW}`, borderRadius: 20, padding: '4px 10px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: isPaid ? GREEN : YELLOW }}>{isPaid ? '✓ Aprobado' : '⏳ Pendiente'}</span>
          </div>

          {/* eCard ID */}
          <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(13,27,110,0.6)', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 20, padding: '4px 10px' }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: CYAN }}>{eCardNum}</span>
          </div>

          {/* Avatar */}
          <div style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: `4px solid ${CYAN}`, background: NAVY, overflow: 'hidden', boxShadow: `0 0 0 5px rgba(0,188,212,0.12)` }}>
              {avatarPhoto
                ? <img src={avatarPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={nombre} crossOrigin="anonymous" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, color: CYAN, fontWeight: 700, background: `linear-gradient(135deg,${NAVY},rgba(0,188,212,0.3))` }}>
                    {nombre.charAt(0).toUpperCase()}
                  </div>
              }
            </div>
            {isPaid && <div style={{ position: 'absolute', bottom: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: GREEN, border: `3px solid ${NAVY}` }} />}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '60px 24px 24px', textAlign: 'center' }}>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{nombre}</h2>
          <p style={{ fontSize: 12, color: CYAN, margin: '0 0 16px' }}>
            {isCaminata ? `🐾 ${record.ticket_type === 'pet_lover' ? 'Pet Lover' : record.ticket_type === 'deportista' ? 'Deportista' : 'Familiar'}` : ''}
            {isExpositor ? `🏪 ${record.brand_name || record.company_name || ''}` : ''}
            {isDeporte ? `⚽ ${record.team_name || ''} · ${record.sport || ''}` : ''}
            {isSponsor ? `⭐ ${record.plan_name || 'Patrocinador'}` : ''}
          </p>

          {/* Datos según tipo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, textAlign: 'left' }}>

            {/* Caminata */}
            {isCaminata && <>
              {attendees.filter(a => !a.is_minor).length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>👤 Adultos</div>
                  {attendees.filter(a => !a.is_minor).map((a, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{a.full_name}</div>
                  ))}
                </div>
              )}
              {attendees.filter(a => a.is_minor).length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>👶 Menores</div>
                  {attendees.filter(a => a.is_minor).map((a, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{a.full_name}</div>
                  ))}
                </div>
              )}
              {pets.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>🐾 Mascotas</div>
                  {pets.map((p, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{p.name} · {p.breed || ''}</div>
                  ))}
                </div>
              )}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase' }}>💳 Monto pagado</div>
                <div style={{ fontSize: 14, color: GREEN, fontWeight: 700 }}>{fmtCOP(record.amount_cents || record.total_amount * 100 || 0)}</div>
              </div>
            </>}

            {/* Expositor */}
            {isExpositor && <>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase' }}>🏪 Stand / Espacio</div>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{record.stand_id || `${record.quantity || 1} Toldo(s)`}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase' }}>👤 Responsable</div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{nombre}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase' }}>💳 Valor total</div>
                <div style={{ fontSize: 14, color: GREEN, fontWeight: 700 }}>{fmtCOP(record.amount_cents || 0)}</div>
              </div>
            </>}

            {/* Deportes */}
            {isDeporte && <>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase' }}>⚽ Deporte · Categoría</div>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{record.sport} · {record.category === 'ninos' ? 'Infantil' : 'Adultos'}</div>
              </div>
              {players.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>👥 Jugadores</div>
                  {players.map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#fff' }}>{p.name}{p.is_captain ? ' 👑' : ''}</div>
                  ))}
                </div>
              )}
            </>}

            {/* Estado firma */}
            <div style={{ background: isSigned ? 'rgba(76,175,80,0.1)' : 'rgba(255,179,0,0.1)', border: `1px solid ${isSigned ? GREEN : YELLOW}`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{isSigned ? '✍️' : '⏳'}</span>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Contrato</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: isSigned ? GREEN : YELLOW }}>{isSigned ? 'Firmado' : 'Pendiente de firma'}</div>
              </div>
            </div>
          </div>

          {/* Participación — íconos */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Participación en el evento</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[
                { id: '5k', icon: '🐾', label: '5K', active: isCaminata },
                { id: 'mascota', icon: '🐶', label: 'Mascota', active: isCaminata && pets.length > 0 },
                { id: 'stand', icon: '🏪', label: 'Stand', active: isExpositor && record.category !== 'foodtruck' && table !== 'toldos_reservations' },
                { id: 'toldo', icon: '⛺', label: 'Toldo', active: table === 'toldos_reservations' },
                { id: 'sponsor', icon: '⭐', label: 'Patroc.', active: isSponsor },
                { id: 'deporte', icon: '⚽', label: 'Deporte', active: isDeporte },
              ].map(s => (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: s.active ? 1 : 0.25 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: s.active ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${s.active ? CYAN : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: s.active ? '0 0 16px rgba(0,188,212,0.3)' : 'none',
                  }}>
                    <span style={{ fontSize: 22, filter: s.active ? 'none' : 'grayscale(1)' }}>{s.icon}</span>
                  </div>
                  <span style={{ fontSize: 9, color: s.active ? CYAN : 'rgba(255,255,255,0.4)', fontWeight: s.active ? 600 : 400 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Título eCard */}
          <div style={{ background: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 12, padding: '10px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: CYAN, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>🎫 E-CARD DE INGRESO AL EVENTO</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>Latido y Huella 2026 · Llanogrande</p>
          </div>

          {/* QR con icono en el centro */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, border: '1px solid rgba(0,188,212,0.2)' }}>
              <img src={qrUrl} style={{ width: 160, height: 160, display: 'block', borderRadius: 8 }} alt="QR ticket" crossOrigin="anonymous" />
              {/* Icono en el centro */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 38, height: 38, borderRadius: '50%',
                background: NAVY, border: `2px solid ${CYAN}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4,
              }}>
                <img src={ICON_URL} style={{ width: 26, height: 26, objectFit: 'contain' }} alt="icon" crossOrigin="anonymous" />
              </div>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Presenta este QR en la entrada del evento</p>
          </div>

          {/* Fecha y lugar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>📅 Fecha</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>26 Jul 2026</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>📍 Lugar</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>COMFAMA Llanogrande</div>
            </div>
          </div>

          {/* Footer logo */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', justifyContent: 'center' }}>
            <img src={LOGO_URL} style={{ height: 28 }} alt="Latido y Huella" crossOrigin="anonymous" />
          </div>
        </div>
      </div>

      {/* Botón descargar */}
      <button onClick={handleDownload} disabled={downloading}
        className="mt-6 px-8 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${CYAN}, #0097A7)`, boxShadow: '0 4px 20px rgba(0,188,212,0.3)' }}>
        {downloading ? 'Generando...' : '⬇️ Descargar ticket'}
      </button>

      <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Latido y Huella 2026 · eventos@latidoyhuella.co
      </p>
    </div>
  )
}