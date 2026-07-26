import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const PASSWORDS = ['Comfama_Latido2026!', 'Latido2026!_Taquilla']
const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

const ENTRY_LABELS: Record<string, string> = {
  visitante: 'Visitante Feria',
  caminata: 'Caminata 5K',
  expositor: 'Expositor / Stand',
  deportes: 'Deportes',
}

export function TaquillaAdminPage() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')

  const handleLogin = () => {
    if (PASSWORDS.includes(pass)) {
      setAuth(true)
      setError('')
    } else {
      setError('Contrasena incorrecta')
    }
  }

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    Promise.all([
      supabase.from('taquilla_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('registrations_5k').select('full_name, email, phone, status, created_at').eq('status', 'paid').not('email', 'ilike', '%novoeia%'),
      supabase.from('registration_attendees').select('full_name, email, phone, created_at, registration_id').eq('is_primary', false),
      supabase.from('sports_team_registrations').select('captain_name, captain_email, captain_phone, sport, created_at, id').eq('status', 'paid'),
      supabase.from('sports_team_players').select('name, email, phone, created_at, team_id').eq('is_captain', false).is('deleted_at', null),
    ]).then(([taquilla, caminata, acompanantes, deportes, jugadores]) => {
      const all: any[] = []
      for (const r of taquilla.data || []) {
        all.push({ ...r, source: 'taquilla' })
      }
      for (const r of caminata.data || []) {
        all.push({ full_name: r.full_name, email: r.email, phone: r.phone, entry_type: 'caminata', created_at: r.created_at, source: 'caminata' })
      }
      for (const r of acompanantes.data || []) {
        all.push({ full_name: r.full_name, email: r.email, phone: r.phone, entry_type: 'caminata', created_at: r.created_at, source: 'caminata' })
      }
      for (const r of deportes.data || []) {
        all.push({ full_name: r.captain_name, email: r.captain_email, phone: r.captain_phone, entry_type: 'deportes', created_at: r.created_at, source: 'deportes' })
      }
      for (const r of (jugadores.data || [])) {
        all.push({ full_name: r.name, email: r.email, phone: r.phone, entry_type: 'deportes', created_at: r.created_at, source: 'deportes' })
      }
      setRegistros(all)
      setLoading(false)
    })
  }, [auth])

  const filtered = registros.filter(r => {
    const matchSearch = r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search)
    const matchFilter = filter === 'todos' || r.entry_type === filter
    return matchSearch && matchFilter
  })

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style={{ height: 50, marginBottom: 16 }} alt=""/>
          <h2 style={{ color: NAVY, fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Registro Taquilla</h2>
          <p style={{ color: '#666', fontSize: 13, margin: '0 0 20px' }}>Latido y Huella 2026</p>
          <input type="password" placeholder="Contrasena de acceso" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}/>
          {error && <p style={{ color: 'red', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}
          <button onClick={handleLogin}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: CYAN, color: 'white', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  const totals = registros.reduce((acc, r) => {
    acc[r.entry_type] = (acc[r.entry_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7ff' }}>
      <div style={{ background: NAVY, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style={{ height: 36 }} alt=""/>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Registro Taquilla</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Latido y Huella 2026</div>
          </div>
        </div>
        <div style={{ background: CYAN, color: NAVY, borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 18 }}>
          {registros.length} registros
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
          {Object.entries(totals).map(([type, count]) => (
            <div key={type} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{count as number}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{ENTRY_LABELS[type] || type}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input placeholder="Buscar por nombre, email o telefono..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 14, outline: 'none' }}/>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 14, outline: 'none', background: 'white' }}>
            <option value="todos">Todos</option>
            <option value="visitante">Visitante</option>
            <option value="caminata">Caminata</option>
            <option value="expositor">Expositor</option>
            <option value="deportes">Deportes</option>
          </select>
          <button onClick={() => {
            const headers = ['Nombre', 'Email', 'Telefono', 'Tipo', 'Hora']
            const rows = filtered.map(r => [
              r.full_name, r.email, r.phone,
              ENTRY_LABELS[r.entry_type] || r.entry_type,
              new Date(r.created_at).toLocaleString('es-CO')
            ])
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Taquilla-Latido-y-Huella-${new Date().toLocaleDateString('es-CO')}.csv`
            a.click()
            URL.revokeObjectURL(url)
          }} style={{ padding: '10px 18px', borderRadius: 10, background: NAVY, color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Exportar CSV
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Cargando...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    {['#', 'Nombre', 'Email', 'Telefono', 'Tipo', 'Hora'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'white', fontWeight: 700, fontSize: 12, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafbff' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#999' }}>{i + 1}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: 'nowrap' }}>{r.full_name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#555' }}>{r.email}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>{r.phone}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ background: CYAN + '20', color: NAVY, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {ENTRY_LABELS[r.entry_type] || r.entry_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No hay registros</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}