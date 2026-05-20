import React from 'react';
import { motion } from 'framer-motion';
import { Dog, Trophy, Users, Leaf, BookOpen, HeartPulse, ShoppingBag } from 'lucide-react';
export function AboutSection() {
  const icons = [{
    icon: Dog,
    label: 'Mascotas'
  }, {
    icon: Trophy,
    label: 'Deportes'
  }, {
    icon: Users,
    label: 'Familias'
  }, {
    icon: Leaf,
    label: 'Naturaleza'
  }, {
    icon: BookOpen,
    label: 'Educación'
  }, {
    icon: HeartPulse,
    label: 'Bienestar'
  }, {
    icon: ShoppingBag,
    label: 'Comercio'
  }, {
    icon: null,
    label: 'Causa Animal',
    image: "/Logo_latido_y_huella_ICONO_blanco.png"
  }];
  return <section id="movimiento" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle paw print background */}
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={{
      backgroundImage: "url('https://cdn.magicpatterns.com/uploads/n65G7S8JBYf9QcBTeinaQ6/PATRON_HUELLAS_fondo.png')",
      backgroundRepeat: 'repeat',
      backgroundSize: '600px auto'
    }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Image Placeholder */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true,
          margin: '-100px'
        }} transition={{
          duration: 0.8
        }} className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
            {/* Placeholder for client image */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium text-sm border-2 border-dashed border-gray-300 m-4 rounded-2xl">
              [Espacio para fotografía del cliente: Pareja joven con mascota]
            </div>

            {/* Dark logo overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/Gemini_Generated_Image_xkogx9xkogx9xkog.png" alt="Perro y gato con logo Latido & Huella" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true,
          margin: '-100px'
        }} transition={{
          duration: 0.8
        }} className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl text-brand-navy mb-8 leading-tight">
              {['Más', 'que', 'un', 'evento.', 'Un', 'movimiento.'].map((word, i) => <motion.span key={i} initial={{
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
            }} className={`inline-block shimmer-text mr-3 ${i >= 4 ? 'text-brand-cyan' : ''}`}>
                    {word}
                    {i === 3 && <br />}
                  </motion.span>)}
            </h2>

            <div className="space-y-5 text-gray-600 text-base md:text-lg leading-relaxed mb-10">
              <p>
                En Colombia, el abandono es una realidad que nos toca el
                corazón.{' '}
                <strong className="text-brand-navy">Latido & Huella</strong>{' '}
                nace como respuesta para transformar esa realidad en esperanza.
                En esta edición, caminamos y nos unimos por los valientes del{' '}
                <strong className="text-brand-cyan">CEIBA Rionegro</strong>.
              </p>

              <p className="font-semibold text-brand-navy text-lg md:text-xl">
                Tu participación trasciende la meta:
              </p>

              <div className="space-y-4 pl-1">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-brand-cyan flex-shrink-0"></div>
                  <p>
                    <strong className="text-brand-navy">
                      Donación con Impacto:
                    </strong>{' '}
                    Una parte de los recursos recaudados se destinará a la
                    donación de insumos físicos para fortalecer la labor de la
                    fundación.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-brand-cyan flex-shrink-0"></div>
                  <p>
                    <strong className="text-brand-navy">
                      Zona de Adopción:
                    </strong>{' '}
                    Encuentra al nuevo integrante de tu familia en nuestro
                    espacio dedicado a la adopción responsable, donde el equipo
                    del CEIBA nos acompañará durante todo el evento.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-brand-cyan flex-shrink-0"></div>
                  <p>
                    <strong className="text-brand-navy">
                      Compromiso Real:
                    </strong>{' '}
                    Al inscribirte, te sumas a un movimiento que cree en las
                    segundas oportunidades y en el bienestar de quienes más nos
                    necesitan.
                  </p>
                </div>
              </div>

              <p className="font-semibold text-brand-navy text-lg md:text-xl pt-2">
                Este no es solo un evento al que asistes; es un movimiento al
                que perteneces.
              </p>
            </div>

            <blockquote className="border-l-4 border-brand-cyan pl-6 py-2">
              <p className="text-3xl md:text-4xl text-brand-cyan font-bold italic">
                "En cada paso late un corazón dejando una huella"
              </p>
            </blockquote>
          </motion.div>
        </div>

        {/* Hexagonal Icons Row */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="mt-16">
          {/* Mobile: horizontal scroll · Desktop: grid */}
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-5 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0 pb-2 scrollbar-hide">
            {icons.map((item, index) => <div key={index} className="flex flex-col items-center group flex-shrink-0 md:flex-shrink snap-center w-24 md:w-auto">
                {/* Hexagon Shape using CSS clip-path */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-navy flex items-center justify-center mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-cyan shadow-lg" style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}>
                  {item.image ? <img src={item.image} alt={item.label} className="w-10 h-10 md:w-12 md:h-12 object-contain" /> : <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />}
                </div>
                <span className="text-sm md:text-base font-semibold text-brand-navy text-center group-hover:text-brand-cyan transition-colors whitespace-nowrap">
                  {item.label}
                </span>
              </div>)}
          </div>
          {/* Mobile hint */}
          <p className="md:hidden text-xs text-gray-400 text-center mt-3 italic">
            ← Desliza para ver más →
          </p>
        </motion.div>
      </div>
    </section>;
}