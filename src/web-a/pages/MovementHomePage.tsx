import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Camera, HeartHandshake, PawPrint, ShoppingBag, Sparkles, Users, Star, Building2, Trophy, ClipboardEdit, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { SponsorsBannerSection } from '../../components/SponsorsBannerSection'
import { SectionHeading } from '../components/SectionHeading'
import { CommunityGallery } from '../components/CommunityGallery'
import { activities, eventPhotos } from '../data'
import { supabase } from '../../utils/supabase'
import { PetRegistrationModal } from '../../components/PetRegistrationModal'

const ROTATING_PHRASES = ['el amor por las mascotas','la protección animal','experiencias en familia','comunidad con propósito']
const fadeUp = { hidden:{opacity:0,y:40}, show:{opacity:1,y:0,transition:{duration:0.7,ease:'easeOut'}} }
const stagger = { hidden:{}, show:{transition:{staggerChildren:0.12}} }
const STATS = [{value:'2,000+',label:'Asistentes'},{value:'300+',label:'Mascotas'},{value:'80+',label:'Stands'},{value:'6.5km',label:'Caminata'}]

// ── WEB A PET WALL ─────────────────────────────────────────
function WebAPetWall() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [voted, setVoted] = useState<Set<string>>(new Set())

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('registration_pets')
        .select('id, pet_name, breed, photo_url, registration_id')
        .limit(12)
        .order('created_at', { ascending: false })
      if (data && data.length > 0) {
        const ids = data.map((p: any) => p.id)
        const { data: huellas } = await supabase
          .from('pet_huellas')
          .select('pet_id')
          .in('pet_id', ids)
        const counts: Record<string, number> = {}
        huellas?.forEach((h: any) => { counts[h.pet_id] = (counts[h.pet_id] || 0) + 1 })
        setPets(data.map((p: any) => ({ ...p, huellas: counts[p.id] || 0 })))
      } else {
        setPets([])
      }
      setLoading(false)
    })()
  }, [])

  const darHuella = async (petId: string) => {
    if (voted.has(petId)) return
    const voterKey = `voter_${Math.random().toString(36).slice(2)}_${Date.now()}`
    await supabase.from('pet_huellas').insert({ pet_id: petId, voter_key: voterKey })
    setPets(prev => prev.map(p => p.id === petId ? { ...p, huellas: p.huellas + 1 } : p))
    setVoted(prev => new Set([...prev, petId]))
  }

  const sorted = [...pets].sort((a, b) => b.huellas - a.huellas)

  if (loading) return (
    <div className="text-center py-12 text-white/60">Cargando mascotas... 🐾</div>
  )

  if (pets.length === 0) return (
    <div className="text-center py-12">
      <p className="text-white/60 mb-4">Aún no hay mascotas registradas en el muro.</p>
      <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-bold text-[#08155f]">
        <ClipboardEdit size={18}/> Registra tu mascota
      </button>
      <PetRegistrationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )

  return (
    <>
      <PetRegistrationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((pet, i) => (
          <motion.div key={pet.id}
            initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
            transition={{duration:0.5,delay:i*0.06}}
            className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10 group hover:bg-white/15 transition">
            <div className="aspect-square overflow-hidden bg-white/5">
              {pet.photo_url
                ? <img src={pet.photo_url} alt={pet.pet_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
              }
            </div>
            <div className="p-3">
              <h4 className="font-bold text-white text-sm truncate">{pet.pet_name}</h4>
              {pet.breed && <p className="text-white/40 text-xs truncate">{pet.breed}</p>}
              <button onClick={() => darHuella(pet.id)} disabled={voted.has(pet.id)}
                className={`mt-2 w-full py-1.5 rounded-lg border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition
                  ${voted.has(pet.id) ? 'border-cyan-300/30 text-cyan-300/50 cursor-default' : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-[#08155f]'}`}>
                <PawPrint size={13} className="fill-current"/> {pet.huellas} {voted.has(pet.id) ? '✓' : 'Huella'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link to="/muro" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-bold text-[#08155f] hover:-translate-y-1 transition shadow-lg">
          Ver el Muro de Huellas completo <ArrowRight size={19}/>
        </Link>
      </div>
    </>
  )
}

// ── CONOCE EL MOVIMIENTO (cards interactivas) ──────────────
const MOVEMENT_CARDS = [
  { title:'La Caminata Canina', badge:'5K · 26 Julio 2026', desc:'6.5 km de naturaleza, conexión y amor por las mascotas. Una experiencia diseñada para familias y sus peludos compañeros.', image:'/caminata5kimagen.png', color:'from-cyan-500 to-blue-600', link:'/caminata-canina', cta:'Conoce la caminata' },
  { title:'Feria & Bazar', badge:'Stands · Gastronomía · Arte', desc:'80+ marcas, emprendimientos y experiencias gastronómicas reunidas en un solo lugar. El espacio donde el comercio se fusiona con el propósito.', image:'/ChatGPT_Image_5_may_2026,_16_12_14.png', color:'from-purple-500 to-pink-600', link:'/evento', cta:'Ver expositores' },
  { title:'Deportes con Causa', badge:'Fútbol · Pádel · Más', desc:'Torneos y competencias para todos los niveles. El deporte como vehículo de comunidad y conexión.', image:'/Foto-3-La-Morelia-se-transformo-en-el-Parque-del-Bienestar-1-1024x683.jpg', color:'from-green-500 to-emerald-600', link:'/deportes', cta:'Ver deportes' },
  { title:'Muro de Huellas', badge:'Comunidad · Votaciones', desc:'El espacio donde las mascotas son las protagonistas. Vota por tu favorita y ayúdala a convertirse en la Mascota Influencer 2026.', image:'/mascota1.png', color:'from-orange-500 to-amber-600', link:'/muro', cta:'Ir al muro' },
  { title:'El Movimiento Continúa', badge:'Comunidad · Todo el año', desc:'Latido y Huella no es solo un evento. Es un movimiento activo de personas que transforman el amor por los animales en acción.', image:'/full-shot-friends-sitting-outdoors.jpg', color:'from-[#0D1B6E] to-[#08155f]', link:'/deja-tu-huella', cta:'Deja tu huella' },
  { title:'Vincula tu Marca', badge:'Alianzas · B2B', desc:'Conecta tu empresa con una comunidad apasionada. Diseñamos juntos la forma perfecta de participar y generar impacto real.', image:'/full-shot-people-garage-sale.jpg', color:'from-slate-700 to-slate-900', link:'/movimiento/aliados', cta:'Ser aliado' },
]

function MovementCards() {
  const [active, setActive] = useState<typeof MOVEMENT_CARDS[0]|null>(null)
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MOVEMENT_CARDS.map((card, i) => (
          <motion.button key={card.title} onClick={() => setActive(card)}
            initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{duration:0.5,delay:i*0.08}}
            className="group relative overflow-hidden rounded-[1.5rem] aspect-[4/3] text-left cursor-pointer">
            <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"/>
            <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-80 group-hover:opacity-90 transition`}/>
            <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">{card.badge}</span>
              <h3 className="font-extrabold text-base leading-tight">{card.title}</h3>
              <span className="mt-2 text-xs text-white/70 group-hover:text-white transition flex items-center gap-1">Ver más <ArrowRight size={12}/></span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setActive(null)}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] overflow-hidden max-w-lg w-full shadow-2xl">
              <div className="relative h-48 overflow-hidden">
                <img src={active.image} alt={active.title} className="w-full h-full object-cover"/>
                <div className={`absolute inset-0 bg-gradient-to-t ${active.color} opacity-70`}/>
                <button onClick={() => setActive(null)} className="absolute top-4 right-4 bg-white/20 backdrop-blur rounded-full p-2 text-white hover:bg-white/30 transition">
                  <X size={20}/>
                </button>
                <div className="absolute bottom-4 left-5 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">{active.badge}</span>
                  <h3 className="text-2xl font-extrabold">{active.title}</h3>
                </div>
              </div>
              <div className="p-7">
                <p className="text-slate-600 leading-7">{active.desc}</p>
                <Link to={active.link} onClick={() => setActive(null)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D1B6E] px-6 py-3 font-bold text-white hover:-translate-y-1 transition">
                  {active.cta} <ArrowRight size={17}/>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function MovementHomePage() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPhraseIndex(i => (i+1) % ROTATING_PHRASES.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#08155f] pt-20">
        <div className="absolute inset-0">
          <img src="/full-shot-friends-sitting-outdoors.jpg" className="h-full w-full object-cover opacity-50" alt=""/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08155f] via-[#08155f]/80 to-[#08155f]/20"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#08155f] via-transparent to-transparent"/>
        </div>
        <motion.div animate={{scale:[1,1.15,1],opacity:[0.3,0.5,0.3]}} transition={{duration:5,repeat:Infinity}}
          className="absolute top-32 right-20 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"/>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 w-full">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur text-white">
              <Sparkles size={17} className="text-cyan-300"/> Un movimiento que sigue dejando huella
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-7 text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
              Donde
              <span className="mx-3 text-cyan-300 inline-block">
                <AnimatePresence mode="wait">
                  <motion.span key={phraseIndex} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.5}} className="inline-block">
                    {ROTATING_PHRASES[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br/>se convierte en acción.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
              Latido y Huella conecta personas, mascotas y marcas para crear comunidad, impulsar iniciativas con propósito y apoyar la protección animal.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
              <Link to="/movimiento/lo-que-vivimos" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-4 font-extrabold text-[#08155f] shadow-xl hover:-translate-y-1 transition">
                Conoce lo que vivimos <ArrowRight size={19}/>
              </Link>
              <Link to="/deja-tu-huella" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-4 font-bold backdrop-blur text-white hover:-translate-y-1 transition">
                Deja tu huella <PawPrint size={19}/>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.8}}
          className="relative z-10 w-full border-t border-white/10 bg-white/5 backdrop-blur mt-auto">
          <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-cyan-300">{s.value}</div>
                <div className="text-sm text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CONOCE EL MOVIMIENTO (cards con modal) ──────────── */}
      <section className="bg-[#f7fbff] px-6 py-24">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Todo lo que somos" title="Conoce el movimiento"
              text="Más que un evento — una comunidad que vive, crece y transforma el amor por los animales en experiencias con propósito."/>
          </motion.div>
          <motion.div variants={fadeUp} className="mx-auto mt-14 max-w-7xl">
            <MovementCards/>
          </motion.div>
        </motion.div>
      </section>

      {/* ── LO QUE VIVIMOS ──────────────────────────────────── */}
      <section className="bg-white px-6 py-24">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="El evento está vivo en nuestra memoria" title="Una experiencia que dejó huella"
              text="Familias, mascotas, emprendimientos y marcas compartieron una jornada creada para celebrar el bienestar."/>
          </motion.div>
          <motion.div variants={fadeUp} className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-12">
            <div className="relative overflow-hidden rounded-[2rem] md:col-span-7 md:row-span-2 group">
              <img src={eventPhotos[0]} className="h-full min-h-[430px] w-full object-cover transition duration-700 group-hover:scale-105" alt="Lo que vivimos"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#07104a]/90 via-transparent to-transparent"/>
              <div className="absolute bottom-0 p-7 text-white">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Latido y Huella 2026</p>
                <h3 className="mt-2 text-3xl font-extrabold">Una jornada para recordar</h3>
              </div>
            </div>
            {eventPhotos.slice(1,3).map((p) => (
              <div key={p} className="overflow-hidden rounded-[2rem] md:col-span-5">
                <img src={p} className="h-[205px] w-full object-cover transition duration-500 hover:scale-105" alt="Momento del evento"/>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 text-center">
            <Link to="/movimiento/lo-que-vivimos" className="inline-flex items-center gap-2 rounded-full bg-[#0D1B6E] px-7 py-4 font-bold text-white hover:-translate-y-1 transition shadow-lg">
              Revive Latido y Huella <ArrowRight size={19}/>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SPONSOR RIBBON ──────────────────────────────────── */}
      <div className="bg-white pt-4 pb-16 px-6">
        <p className="text-center text-sm font-bold uppercase tracking-[.2em] text-[#0D1B6E]/40 mb-8">Las marcas que hicieron posible esta huella</p>
        <SponsorsBannerSection />
      </div>

      {/* ── GALERÍA VIVA ─────────────────────────────────────── */}
      <section className="bg-[#08155f] px-6 py-24">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionHeading light eyebrow="La comunidad también cuenta la historia" title="Galería viva"
              text="Fotografías y momentos compartidos por las personas que hicieron parte de esta experiencia."/>
          </motion.div>
          <motion.div variants={fadeUp} className="mx-auto mt-14 max-w-7xl">
            <CommunityGallery limit={8}/>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/movimiento/galeria" className="rounded-full bg-cyan-400 px-7 py-4 font-bold text-[#08155f] hover:-translate-y-1 transition">
              Ver toda la galería
            </Link>
            <Link to="/deja-tu-huella" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 font-bold text-white hover:-translate-y-1 transition">
              <Camera size={19}/> Subir mis fotos
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── MURO DE HUELLAS ──────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-24 bg-[#f7fbff]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <img src="/PATRON_HUELLAS_fondo.png" className="w-full h-full object-cover" alt=""/>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger} className="relative z-10">
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Compite por ser la más popular" title="El Muro de las Huellas"
              text="Vota por tu mascota favorita y ayúdala a convertirse en la Mascota Influencer 2026. ¡1 like = 1 huella!"/>
          </motion.div>
          <motion.div variants={fadeUp} className="mx-auto mt-14 max-w-7xl">
            <WebAPetWall/>
          </motion.div>
        </motion.div>
      </section>

      {/* ── VINCULA TU MARCA ─────────────────────────────────── */}
      <section id="aliados" className="relative overflow-hidden bg-[#0D1B6E] px-6 py-24 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"/>
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"/>
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}
          className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-cyan-300">Marcas con propósito</p>
            <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">Tu marca también puede dejar huella</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Conectamos empresas y emprendimientos con una comunidad apasionada por los animales, el bienestar y las experiencias con propósito.
            </p>
            <Link to="/movimiento/aliados"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-extrabold text-[#08155f] hover:-translate-y-1 transition shadow-xl">
              Quiero vincular mi marca <ArrowRight size={19}/>
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
            {[[HeartHandshake,'Alianzas','Campañas, patrocinios y activaciones.'],[ShoppingBag,'Marketplace','Productos y marcas con propósito.'],[Users,'Comunidad','Base activa de amantes de mascotas.'],[Star,'Visibilidad','Presencia en eventos, digital y redes.']].map(([Icon,title,desc]:any) => (
              <div key={title} className="rounded-[2rem] bg-white/10 p-6 backdrop-blur hover:bg-white/15 transition">
                <Icon className="text-cyan-300" size={34}/><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARKETPLACE ──────────────────────────────────────── */}
      <section id="marketplace" className="px-6 py-24 bg-white">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-50 to-blue-50 p-8 sm:p-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-cyan-700">Próximamente</span>
              <h2 className="mt-6 text-4xl font-extrabold text-[#0D1B6E]">Comprar también podrá dejar huella</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Un espacio para descubrir productos de marcas aliadas y generar recursos para mantener vivo el movimiento.</p>
              <Link to="/movimiento/aliados" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0D1B6E] px-6 py-3 font-bold text-white hover:-translate-y-1 transition">
                <Building2 size={18}/> Ver marcas aliadas
              </Link>
            </div>
            <img src="/Termos.png" className="mx-auto max-h-80 object-contain drop-shadow-2xl" alt="Productos"/>
          </div>
        </div>
      </section>
    </>
  )
}