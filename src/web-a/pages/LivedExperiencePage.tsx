import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Quote, ArrowRight, Camera } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { SponsorRibbon } from '../components/SponsorRibbon'
import { eventPhotos } from '../data'

const fadeUp = { hidden:{opacity:0,y:40}, show:{opacity:1,y:0,transition:{duration:0.7,ease:'easeOut'}} }
const stagger = { hidden:{}, show:{transition:{staggerChildren:0.12}} }

export function LivedExperiencePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#08155f] px-6 pt-32 pb-20 text-white">
        <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"/>
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"/>
        <motion.div initial="hidden" animate="show" variants={stagger} className="relative mx-auto max-w-4xl text-center">
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[.25em] text-cyan-300">26 de julio de 2026</motion.p>
          <motion.h1 variants={fadeUp} className="mt-4 text-5xl font-extrabold sm:text-6xl">
            Una experiencia que <span className="text-cyan-300">dejo huella</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-xl leading-8 text-white/75 max-w-2xl mx-auto">
            Mas de 2.000 personas, 300 mascotas y 80 marcas se unieron en el Parque del Bienestar COMFAMA Llanogrande para vivir algo unico.
          </motion.p>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="bg-[#08155f] px-6 pb-16">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[['2.000+','Asistentes'],['300+','Mascotas'],['80+','Stands'],['6.5km','Caminata']].map(([val,label]) => (
            <motion.div key={label} variants={fadeUp} className="rounded-2xl bg-white/10 p-6 text-center">
              <p className="text-3xl font-black text-cyan-300">{val}</p>
              <p className="mt-1 text-sm text-white/60">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FOTOS DESTACADAS */}
      <section className="px-6 py-24 bg-white">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Momentos del evento" title="Lo que vivimos juntos"
              text="Imagenes que capturan la energia, el amor y el proposito de Latido y Huella 2026."/>
          </motion.div>
          <motion.div variants={fadeUp} className="mx-auto mt-14 grid max-w-7xl gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[2rem] lg:col-span-2 group">
              <img src={eventPhotos[0]} className="h-[400px] w-full object-cover transition duration-700 group-hover:scale-105" alt="Lo que vivimos"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#07104a]/90 via-transparent to-transparent"/>
              <div className="absolute bottom-0 p-7 text-white">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Latido y Huella 2026</p>
                <h3 className="mt-2 text-3xl font-extrabold">Una jornada para recordar</h3>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {eventPhotos.slice(1,3).map((p) => (
                <div key={p} className="overflow-hidden rounded-[2rem] flex-1">
                  <img src={p} className="h-[190px] w-full object-cover transition duration-500 hover:scale-105" alt="Momento del evento"/>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 text-center">
            <Link to="/movimiento/galeria" className="inline-flex items-center gap-2 rounded-full bg-[#0D1B6E] px-7 py-4 font-bold text-white hover:-translate-y-1 transition">
              Ver toda la galeria <ArrowRight size={18}/>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* SPONSOR RIBBON */}
      <SponsorRibbon />

      {/* TESTIMONIOS */}
      <section className="px-6 py-24 bg-[#f7fbff]">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Voces de la comunidad" title="Testimonios que tambien dejaron huella"/>
          </motion.div>
          <motion.div variants={stagger} className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              ['Fue un dia para compartir en familia y sentir que todos podiamos aportar a una causa hermosa.','Una familia asistente'],
              ['Ver tantas mascotas, marcas y personas conectadas en un mismo lugar fue realmente especial.','Marca participante'],
              ['Nos llevamos recuerdos, fotografias y muchas ganas de seguir siendo parte del movimiento.','Miembro de la comunidad']
            ].map(([q,n]) => (
              <motion.article key={q} variants={fadeUp} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/50">
                <Quote className="text-cyan-500" size={28}/>
                <p className="mt-5 leading-8 text-slate-700">"{q}"</p>
                <p className="mt-4 text-sm font-bold text-[#0D1B6E]">— {n}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-[#08155f] px-6 py-24 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-white">
            Tu huella tambien cuenta
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-white/65 max-w-xl mx-auto">
            Sube tus fotos del evento y haz parte de la galeria comunitaria de Latido y Huella 2026.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/deja-tu-huella" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-extrabold text-[#08155f] hover:-translate-y-1 transition shadow-xl">
              <Camera size={19}/> Subir mis fotos
            </Link>
            <Link to="/movimiento/galeria" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 font-bold text-white hover:-translate-y-1 transition">
              Ver galeria completa <ArrowRight size={18}/>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}