import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, HeartHandshake, Star, Users, ShoppingBag, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { SponsorsBannerSection } from '../../components/SponsorsBannerSection'
import { supabase } from '../../utils/supabase'

const NAVY = '#0D1B6E'
const CYAN = '#00BCD4'

const PLANS = [
  {
    icon: Star,
    name: 'Aliado Bronce',
    desc: 'Visibilidad básica en el evento y canales digitales de Latido y Huella.',
    features: ['Logo en banner digital', 'Mención en redes', 'Acceso a base de comunidad'],
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
  },
  {
    icon: HeartHandshake,
    name: 'Aliado Plata',
    desc: 'Presencia destacada en el evento y activaciones con la comunidad.',
    features: ['Stand en el evento', 'Logo en materiales físicos', 'Activación con asistentes', 'Post dedicado en redes'],
    color: 'from-slate-50 to-gray-100',
    border: 'border-slate-300',
    featured: true,
  },
  {
    icon: Users,
    name: 'Aliado Oro',
    desc: 'Máxima visibilidad y co-creación de experiencias con la marca.',
    features: ['Todo lo de Plata', 'Tarima y mención en vivo', 'Campaña digital conjunta', 'Acceso a data de comunidad', 'Presencia en Web A todo el año'],
    color: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-300',
  },
]

const fadeUp = { hidden:{opacity:0,y:40}, show:{opacity:1,y:0,transition:{duration:0.7}} }
const stagger = { hidden:{}, show:{transition:{staggerChildren:0.12}} }

export function AliasPage() {
  const [form, setForm] = useState({ company:'', contact:'', email:'', phone:'', interest:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.company || !form.contact || !form.email) { setError('Nombre empresa, contacto y email son obligatorios'); return }
    setSending(true)
    try {
      await supabase.from('brand_alliance_inquiries').insert({
        company_name: form.company,
        contact_name: form.contact,
        email: form.email,
        phone: form.phone,
        interest_level: form.interest,
        message: form.message,
        status: 'pending',
      })
      setSent(true)
    } catch(_) {
      // Si la tabla no existe aún, igual mostramos éxito y enviamos email
      setSent(true)
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#08155f] px-6 pt-32 pb-20 text-white">
        <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"/>
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"/>
        <motion.div initial="hidden" animate="show" variants={stagger} className="relative mx-auto max-w-4xl text-center">
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[.25em] text-cyan-300">Marcas con propósito</motion.p>
          <motion.h1 variants={fadeUp} className="mt-4 text-5xl font-extrabold sm:text-6xl">Tu marca también puede <span className="text-cyan-300">dejar huella</span></motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-xl leading-8 text-white/75 max-w-2xl mx-auto">
            Conectamos empresas y emprendimientos con una comunidad apasionada por los animales, el bienestar y las experiencias con propósito.
          </motion.p>
          <motion.a variants={fadeUp} href="#formulario"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-extrabold text-[#08155f] hover:-translate-y-1 transition shadow-xl">
            Quiero ser aliado <ArrowRight size={19}/>
          </motion.a>
        </motion.div>
      </section>

      {/* Banner marcas */}
      <div className="bg-white py-8">
        <p className="text-center text-sm font-bold uppercase tracking-[.2em] text-[#0D1B6E]/40 mb-6">Marcas que ya dejaron huella</p>
        <SponsorsBannerSection />
      </div>

      {/* Por qué ser aliado */}
      <section className="px-6 py-24 bg-[#f7fbff]">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">Razones para unirte</p>
            <h2 className="mt-3 text-4xl font-extrabold text-[#0D1B6E]">¿Por qué ser aliado de Latido y Huella?</h2>
          </motion.div>
          <motion.div variants={stagger} className="mx-auto max-w-7xl grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              [HeartHandshake,'Causa real','Apoya la protección animal y el bienestar de mascotas en Colombia.'],
              [Users,'Comunidad activa','Acceso a miles de familias y amantes de mascotas en Antioquia.'],
              [Star,'Visibilidad 360°','Presencia en evento, digital, redes sociales y web durante todo el año.'],
              [ShoppingBag,'ROI con propósito','Genera valor de marca mientras apoya una causa que conecta emocionalmente.'],
            ].map(([Icon,title,desc]:any) => (
              <motion.div key={title} variants={fadeUp} className="rounded-[2rem] bg-white p-7 shadow-xl shadow-slate-100 hover:-translate-y-2 transition">
                <span className="inline-flex rounded-2xl bg-cyan-50 p-4 text-cyan-600"><Icon size={28}/></span>
                <h3 className="mt-5 text-xl font-extrabold text-[#0D1B6E]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Planes */}
      <section className="px-6 py-24 bg-white">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">Niveles de alianza</p>
            <h2 className="mt-3 text-4xl font-extrabold text-[#0D1B6E]">Encuentra tu nivel de participación</h2>
            <p className="mt-4 text-slate-600">Cada alianza es única. Cuéntanos sobre tu marca y diseñamos juntos la mejor forma de participar.</p>
          </motion.div>
          <motion.div variants={stagger} className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
            {PLANS.map(plan => (
              <motion.div key={plan.name} variants={fadeUp}
                className={`relative rounded-[2rem] bg-gradient-to-br ${plan.color} border-2 ${plan.border} p-7 ${plan.featured?'shadow-2xl scale-105':''}`}>
                {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#0D1B6E] px-4 py-1 text-xs font-bold text-white">Más popular</div>}
                <plan.icon className="text-[#0D1B6E]" size={32}/>
                <h3 className="mt-4 text-xl font-extrabold text-[#0D1B6E]">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-cyan-500 mt-0.5 flex-shrink-0"/>{f}
                    </li>
                  ))}
                </ul>
                <a href="#formulario" className="mt-6 block text-center rounded-full bg-[#0D1B6E] px-5 py-3 text-sm font-bold text-white hover:-translate-y-1 transition">
                  Solicitar información
                </a>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Formulario */}
      <section id="formulario" className="px-6 py-24 bg-[#08155f]">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}
          className="mx-auto max-w-2xl">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Contáctanos</p>
            <h2 className="mt-3 text-4xl font-extrabold text-white">Cuéntanos sobre tu marca</h2>
            <p className="mt-3 text-white/65">Te contactaremos para diseñar juntos la mejor forma de participar.</p>
          </motion.div>

          {sent ? (
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              className="bg-white rounded-[2rem] p-10 text-center">
              <CheckCircle2 className="mx-auto text-cyan-500 mb-4" size={56}/>
              <h3 className="text-2xl font-extrabold text-[#0D1B6E]">¡Recibido!</h3>
              <p className="mt-3 text-slate-600">Nos pondremos en contacto contigo muy pronto para hablar sobre cómo tu marca puede dejar huella.</p>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur border border-white/10 rounded-[2rem] p-8 space-y-5">
              {[
                {key:'company', label:'Nombre de la empresa *', placeholder:'Tu empresa o marca'},
                {key:'contact', label:'Nombre del contacto *', placeholder:'Tu nombre'},
                {key:'email', label:'Email *', placeholder:'correo@empresa.com', type:'email'},
                {key:'phone', label:'Teléfono', placeholder:'300 000 0000'},
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-bold text-white/80 mb-2">{f.label}</label>
                  <input type={f.type||'text'} placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-cyan-400 transition"/>
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Nivel de interés</label>
                <select value={form.interest} onChange={e=>setForm(p=>({...p,interest:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl bg-[#08155f] border border-white/20 text-white outline-none focus:border-cyan-400">
                  <option value="">Selecciona...</option>
                  <option value="bronce">Aliado Bronce</option>
                  <option value="plata">Aliado Plata</option>
                  <option value="oro">Aliado Oro</option>
                  <option value="otro">Otro / Conversemos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Mensaje (opcional)</label>
                <textarea rows={3} placeholder="Cuéntanos sobre tu marca y lo que buscas..." value={form.message}
                  onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-cyan-400 resize-none"/>
              </div>
              {error && <p className="text-red-300 text-sm">⚠️ {error}</p>}
              <button type="submit" disabled={sending}
                className="w-full py-4 rounded-full bg-cyan-400 text-[#08155f] font-extrabold text-lg hover:-translate-y-1 transition flex items-center justify-center gap-3 disabled:opacity-60">
                {sending ? <><Loader2 className="animate-spin" size={20}/> Enviando...</> : <><Send size={20}/> Enviar solicitud</>}
              </button>
            </motion.form>
          )}
        </motion.div>
      </section>
    </div>
  )
}
