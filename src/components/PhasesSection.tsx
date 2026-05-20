import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Star, Leaf } from 'lucide-react';
export function PhasesSection() {
  const phases = [{
    title: 'FASE 1',
    subtitle: 'PRE-EVENTO',
    time: '8 semanas antes',
    icon: Rocket,
    color: 'bg-brand-cyan',
    textColor: 'text-brand-cyan',
    borderColor: 'border-brand-cyan',
    items: ['Apertura de la plataforma digital', 'Registro y creación de perfiles mascota-humano', 'Retos semanales de gamificación', 'Concurso Mascota Influencer (votación abierta)', 'Activación de comunidad en redes sociales', 'Entrega de kits - 25 de julio']
  }, {
    title: 'FASE 2',
    subtitle: 'DÍA DEL EVENTO',
    time: '26 de julio de 2026',
    icon: Star,
    color: 'bg-brand-yellow',
    textColor: 'text-brand-yellow',
    borderColor: 'border-brand-yellow',
    items: ['Check-in con QR único por participante (Persona+Mascota)', 'Caminata Canina con mascotas', 'Actividades deportivas (Fútbol, Pádel)', 'Charlas informativas y practicas, musica', 'Gran final: Premiaciones']
  }, {
    title: 'FASE 3',
    subtitle: 'POST-EVENTO',
    time: '4 semanas después',
    icon: Leaf,
    color: 'bg-brand-green',
    textColor: 'text-brand-green',
    borderColor: 'border-brand-green',
    items: ['Publicación del after movie oficial', 'Galería fotográfica inteligente', 'Entrega de certificados digitales personalizados', 'Reactivación de comunidad para próximas ediciones', 'Reporte de impacto social a marcas patrocinadoras']
  }];
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };
  return <section className="py-24 bg-brand-navy relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-paw-pattern-white opacity-5 pointer-events-none"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-yellow/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            {['Un', 'movimiento', 'que', 'no', 'se', 'detiene'].map((word, i) => <motion.span key={i} initial={{
            opacity: 0,
            y: 30,
            filter: 'blur(10px)'
          }} whileInView={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)'
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: i * 0.15,
            ease: [0.22, 1, 0.36, 1]
          }} className="inline-block shimmer-text-white mr-3">
                  {word}
                </motion.span>)}
          </h2>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-xl md:text-2xl text-brand-cyan font-bold tracking-widest uppercase">
            Antes · Durante · Después
          </motion.p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
        once: true,
        margin: '-50px'
      }} className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 md:mx-0 px-4 md:px-0 pb-4 md:pb-0 scrollbar-hide">
          {phases.map((phase, index) => <motion.div key={index} variants={cardVariants} className="flex-shrink-0 md:flex-shrink-0 w-[85%] md:w-auto snap-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-300 relative overflow-hidden group">
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 w-full h-2 ${phase.color}`}></div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl ${phase.color} bg-opacity-20 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                <phase.icon className={`w-8 h-8 ${phase.textColor}`} />
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {phase.title}
                </h3>
                <h4 className={`text-xl md:text-2xl font-semibold ${phase.textColor} mb-3`}>
                  {phase.subtitle}
                </h4>
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 font-semibold text-xs md:text-base">
                  {phase.time}
                </div>
              </div>

              <ul className="space-y-4">
                {phase.items.map((item, i) => <li key={i} className="flex items-start">
                    <div className={`mt-1.5 mr-3 w-2 h-2 rounded-full ${phase.color} flex-shrink-0`}></div>
                    <span className="text-white/80 leading-relaxed">
                      {item}
                    </span>
                  </li>)}
              </ul>
            </motion.div>)}
        </motion.div>
      </div>
    </section>;
}