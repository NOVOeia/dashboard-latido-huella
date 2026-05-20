import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Activity, LayoutGrid, ArrowLeft } from 'lucide-react';
export function SponsorsSection() {
  const navigate = useNavigate();
  // Detect mobile so we can disable desktop-only effects (diagonal overlap, hover flex expansion)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return <section id="patrocinadores" className="py-24 bg-brand-navy relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-paw-pattern-white opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            {['Tu', 'marca', 'puede', 'ser', 'parte', 'del', 'cambio'].map((word, i) => <motion.span key={i} initial={{
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
          delay: 0.1
        }} className="text-sm md:text-base text-brand-cyan mb-4 font-semibold leading-relaxed">
            Hoy, las personas no solo eligen productos; eligen marcas con
            VALORES que se atreven a ser MÁS HUMANAS. En Latido & Huella,
            ofrecemos a tu empresa la oportunidad de trascender lo comercial
            para convertirse en un actor de cambio real frente a una
            problemática que nos toca a todos: El abandono y el maltrato animal.
          </motion.p>
          <motion.p initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }} className="text-white/70 text-sm md:text-base leading-relaxed">
            Al unirte como patrocinador aliado, tu marca no solo gana
            visibilidad ante una comunidad apasionada que ama a sus mascotas;
            también se convierte en el motor que permite brindar una segunda
            oportunidad a quienes no tienen voz.
          </motion.p>
        </div>

        {/* Hero Split Animado */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-0 h-auto md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
          {[{
          type: 'empresarial' as const,
          number: '01',
          icon: Briefcase,
          color: '#00BCD4',
          colorHex: '#00BCD4',
          title: 'Patrocinio Empresarial',
          tagline: 'Visibilidad máxima Oro · Plata · Bronce',
          longDesc: 'Posiciona tu marca en escenarios, materiales y comunicaciones del evento con paquetes premium.',
          cta: 'Ver planes',
          image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop',
          clipDesktop: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)'
        }, {
          type: 'deportivo' as const,
          number: '02',
          icon: Activity,
          color: '#FFB300',
          colorHex: '#FFB300',
          title: 'Patrocina un Deporte',
          tagline: 'Fútbol · Tenis · Pádel',
          longDesc: 'Apadrina una disciplina y conecta directamente con la comunidad deportiva en cancha.',
          cta: 'Ver deportes',
          image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80&auto=format&fit=crop',
          clipDesktop: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)'
        }, {
          type: 'espacios' as const,
          number: '03',
          icon: LayoutGrid,
          color: '#4CAF50',
          colorHex: '#4CAF50',
          title: 'Espacios Extra',
          tagline: 'Arcos · Botellas · Petos · Tarima',
          longDesc: 'Potencia tu presencia con elementos de alto impacto distribuidos por todo el evento.',
          cta: 'Ver catálogo',
          image: "/espacios_extras.png",
          clipDesktop: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)'
        }].map((panel, i) => {
          const Icon = panel.icon;
          return <motion.button key={panel.type} onClick={() => navigate(`/patrocinadores?tipo=${panel.type}`)} initial={false} whileHover={isDesktop ? 'hover' : undefined} animate="rest" variants={isDesktop ? {
            rest: {
              flex: 1
            },
            hover: {
              flex: 2.2
            }
          } : undefined} transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }} className="relative w-full h-[320px] md:w-auto md:flex-1 md:h-full overflow-hidden text-left group focus:outline-none rounded-2xl md:rounded-none" style={{
            marginLeft: isDesktop && i > 0 ? '-3%' : 0
          }}>
                {/* Clip-path wrapper for diagonal edges (desktop only) */}
                <div className="absolute inset-0 md:[clip-path:var(--clip)]" style={{
              ['--clip' as any]: panel.clipDesktop
            } as React.CSSProperties}>
                  {/* Background image */}
                  <motion.img src={panel.image} alt={panel.title} variants={{
                rest: {
                  scale: 1
                },
                hover: {
                  scale: 1.08
                }
              }} transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
              }} className="absolute inset-0 w-full h-full object-cover" />

                  {/* Color overlay */}
                  <motion.div variants={{
                rest: {
                  opacity: 0.88
                },
                hover: {
                  opacity: 0.7
                }
              }} transition={{
                duration: 0.6
              }} className="absolute inset-0" style={{
                backgroundColor: panel.colorHex
              }} />

                  {/* Dark gradient at bottom for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-10 text-white">
                    {/* Top: number + icon */}
                    <div className="flex items-start justify-between">
                      <span className="text-xs md:text-sm font-bold tracking-[0.3em] text-white/80">
                        {panel.number} / 03
                      </span>
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                    </div>

                    {/* Bottom: title + tagline + CTA */}
                    <div>
                      <h3 className="text-2xl md:text-4xl font-bold mb-2 leading-tight drop-shadow-md">
                        {panel.title}
                      </h3>
                      <p className="text-white/90 text-sm md:text-base font-medium mb-4 drop-shadow">
                        {panel.tagline}
                      </p>

                      {/* Hover-only longer description */}
                      <motion.p variants={{
                    rest: {
                      opacity: 0,
                      height: 0,
                      marginBottom: 0
                    },
                    hover: {
                      opacity: 1,
                      height: 'auto',
                      marginBottom: 16
                    }
                  }} transition={{
                    duration: 0.4,
                    delay: 0.1
                  }} className="text-white/85 text-sm leading-relaxed overflow-hidden hidden md:block">
                        {panel.longDesc}
                      </motion.p>

                      {/* CTA chip */}
                      <motion.span variants={{
                    rest: {
                      x: 0
                    },
                    hover: {
                      x: 4
                    }
                  }} transition={{
                    duration: 0.3
                  }} className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-sm shadow-lg">
                        {panel.cta} <ArrowLeft className="w-4 h-4 rotate-180" />
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.button>;
        })}
        </div>
      </div>
    </section>;
}