import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, HeartHandshake, Send, Loader2, CheckCircle2, Heart } from 'lucide-react'
import { supabase } from '../../utils/supabase'

const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

const fadeUp = { hidden:{opacity:0,y:30}, show:{opacity:1,y:0,transition:{duration:0.6}} }
const stagger = { hidden:{}, show:{transition:{staggerChildren:0.05}} }

export function AliasPage() {
  const [sponsors, setSponsors] = useState<any[]>([])
  const [form, setForm] = useState({ company:'', contact:'', email:'', phone:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.from('public_sponsors')
      .select('id, name, logo_url, display_order')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setSponsors(data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.email) return
    setSending(true)
    try {
      await supabase.from('brand_alliance_inquiries').insert({
        company_name: form.company, contact_name: form.contact,
        email: form.email, phone: form.phone, message: form.message, status: 'pending'
      })
    } catch(_) {}
    setSent(true)
    setSending(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>

      {/* HERO */}
      <section style={{ background: NAVY, padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,188,212,0.15)', filter: 'blur(60px)' }}/>
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,188,212,0.1)', filter: 'blur(60px)' }}/>
        <motion.div initial="hidden" animate="show" variants={stagger} style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <motion.div variants={fadeUp}>
            <Heart size={48} style={{ color: CYAN, marginBottom: 16 }}/>
          </motion.div>
          <motion.p variants={fadeUp} style={{ color: CYAN, fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Gracias por creer en este movimiento
          </motion.p>
          <motion.h1 variants={fadeUp} style={{ color: 'white', fontSize: 42, fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1 }}>
            Las marcas que hicieron<br/><span style={{ color: CYAN }}>posible esta huella</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            44 empresas y emprendimientos creyeron en Latido y Huella 2026. Gracias a ellos, miles de familias y mascotas vivieron una experiencia unica llena de proposito, conexion y amor por los animales.
          </motion.p>
        </motion.div>
      </section>

      {/* BRANDS GRID */}
      <section style={{ padding: '64px 24px', background: '#f7fbff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.h2 initial="hidden" whileInView="show" viewport={{once:true}} variants={fadeUp}
            style={{ textAlign: 'center', color: NAVY, fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>
            Nuestros aliados 2026
          </motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{once:true}} variants={fadeUp}
            style={{ textAlign: 'center', color: '#666', fontSize: 14, margin: '0 0 40px' }}>
            Empresas, emprendimientos y marcas que dejaron su huella
          </motion.p>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {sponsors.map((s) => (
              <motion.div key={s.id} variants={fadeUp}
                style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 4px 16px rgba(13,27,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 90 }}>
                <img src={s.logo_url} alt={s.name} style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} onError={e => (e.currentTarget.style.display='none')}/>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '48px 24px', background: NAVY }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[['44+','Marcas aliadas'],['2000+','Asistentes'],['80+','Stands'],['1 dia','De experiencia']].map(([val,label]) => (
            <div key={label}>
              <div style={{ color: CYAN, fontSize: 40, fontWeight: 900 }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA NUEVOS ALIADOS */}
      <section style={{ padding: '64px 24px', background: '#f7fbff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 initial="hidden" whileInView="show" viewport={{once:true}} variants={fadeUp}
            style={{ color: NAVY, fontSize: 32, fontWeight: 800, margin: '0 0 12px' }}>
            Tu marca tambien puede dejar huella
          </motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{once:true}} variants={fadeUp}
            style={{ color: '#555', fontSize: 15, lineHeight: 1.8, margin: '0 0 32px' }}>
            Conectamos empresas y emprendimientos con una comunidad apasionada. Diseñamos juntos la mejor forma de participar en la proxima edicion.
          </motion.p>

          {sent ? (
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              style={{ background: 'white', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 8px 32px rgba(13,27,110,0.1)' }}>
              <CheckCircle2 size={52} style={{ color: CYAN, marginBottom: 12 }}/>
              <h3 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Recibido!</h3>
              <p style={{ color: '#555', fontSize: 14 }}>Te contactaremos pronto para diseñar juntos la mejor forma de participar.</p>
            </motion.div>
          ) : (
            <motion.form initial="hidden" whileInView="show" viewport={{once:true}} variants={fadeUp}
              onSubmit={handleSubmit}
              style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 8px 32px rgba(13,27,110,0.08)', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  {key:'company', label:'Empresa *', ph:'Nombre de tu marca'},
                  {key:'contact', label:'Contacto', ph:'Tu nombre'},
                  {key:'email', label:'Email *', ph:'correo@empresa.com', type:'email'},
                  {key:'phone', label:'Telefono', ph:'300 000 0000'},
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type||'text'} placeholder={f.ph}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Mensaje</label>
                <textarea rows={3} placeholder="Cuentanos sobre tu marca..."
                  value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}/>
              </div>
              <button type="submit" disabled={sending}
                style={{ width: '100%', padding: 14, borderRadius: 50, background: NAVY, color: 'white', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {sending ? <><Loader2 size={18} className="animate-spin"/> Enviando...</> : <><Send size={18}/> Quiero ser aliado</>}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  )
}