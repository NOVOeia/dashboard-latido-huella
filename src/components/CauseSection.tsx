import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
export function CauseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px'
  });
  const [counts, setCounts] = useState({
    families: 0,
    pets: 0
  });
  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepTime = duration / steps;
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setCounts({
          families: Math.floor(2000 / steps * currentStep),
          pets: Math.floor(500 / steps * currentStep)
        });
        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts({
            families: 2000,
            pets: 500
          });
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [isInView]);
  return <section id="causa" className="relative py-32 overflow-hidden bg-white" ref={ref}>
      {/* Background - Light with paw pattern */}
      <div className="absolute inset-0 z-0">
        <img src="/PATRON_HUELLAS_fondo.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        {/* Soft gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-brand-cyan/5"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-brand-navy mb-8 leading-tight">
          {['Por', 'cada', 'huella', 'que', 'dejas,', 'un', 'animal', 'tiene', 'una', 'mejor', 'vida'].map((word, i) => <motion.span key={i} initial={{
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
        }} className="inline-block shimmer-text mr-3">
              {word}
            </motion.span>)}
        </h2>

        <motion.p initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="text-xl text-gray-700 leading-relaxed mb-16 max-w-3xl mx-auto">
          Latido & Huella nació como respuesta al abandono y el maltrato animal
          en Colombia. En esta edición, parte de cada inscripción, cada
          patrocinio y cada actividad del evento se destina directamente a
          fortalecer la labor del{' '}
          <strong className="text-brand-cyan">CEIBA Rionegro</strong>, nuestra
          fundación aliada 2026.
        </motion.p>

        {/* Mobile: 2 stats side-by-side compact + CEIBA below · Desktop: 3 cols */}
        <div className="mb-16">
          {/* Mobile compact layout */}
          <div className="md:hidden grid grid-cols-2 gap-3 mb-3">
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.4
          }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-lg text-center">
              <div className="text-3xl font-bold text-brand-cyan mb-1">
                +{counts.families}
              </div>
              <div className="text-brand-navy font-bold uppercase tracking-wider text-[10px] leading-tight">
                Familias esperadas
              </div>
            </motion.div>
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.5
          }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-lg text-center">
              <div className="text-3xl font-bold text-brand-yellow mb-1">
                +{counts.pets}
              </div>
              <div className="text-brand-navy font-bold uppercase tracking-wider text-[10px] leading-tight">
                Mascotas registradas
              </div>
            </motion.div>
          </div>
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.6
        }} className="md:hidden bg-white rounded-2xl p-4 border border-gray-100 shadow-lg flex flex-col items-center justify-center gap-3 text-center">
            <img src="/LOGO_CEIBA_(1)_(8).png" alt="CEIBA Rionegro" className="w-14 h-14 object-contain" />
            <div className="flex flex-col items-center">
              <div className="text-brand-navy font-bold uppercase tracking-wider text-sm">
                CEIBA Rionegro
              </div>
              <div className="text-xs text-gray-500">Fundación aliada 2026</div>
            </div>
          </motion.div>

          {/* Desktop layout (unchanged) */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.4
          }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
              <div className="text-5xl font-bold text-brand-cyan mb-2">
                +{counts.families}
              </div>
              <div className="text-brand-navy font-bold uppercase tracking-wider text-sm">
                Familias esperadas
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.5
          }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
              <div className="text-5xl font-bold text-brand-yellow mb-2">
                +{counts.pets}
              </div>
              <div className="text-brand-navy font-bold uppercase tracking-wider text-sm">
                Mascotas registradas
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.6
          }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col justify-center items-center">
              <img src="/LOGO_CEIBA_(1)_(8).png" alt="CEIBA Rionegro - Centro Integral de Bienestar Animal" className="w-20 h-20 object-contain mb-3" />
              <div className="text-brand-navy font-bold uppercase tracking-wider text-sm text-center">
                CEIBA Rionegro
                <br />
                <span className="text-xs text-gray-500 normal-case tracking-normal">
                  Fundación aliada 2026
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.8
      }}>
          <span className="text-2xl md:text-3xl text-brand-cyan font-bold italic">
            "No adoptamos causas. Construimos movimientos."
          </span>
        </motion.div>
      </div>
    </section>;
}