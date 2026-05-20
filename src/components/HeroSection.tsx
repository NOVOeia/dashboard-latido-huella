import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
const ROTATING_PHRASES = [
'las mascotas y el deporte',
'la protección animal',
'caminar con una causa de amor',
'vivir el bienestar en familia'];

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [phraseIndex, setPhraseIndex] = useState(0);
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3500);
    return () => clearInterval(phraseInterval);
  }, []);
  useEffect(() => {
    // Target date: July 26, 2026 00:00:00
    const targetDate = new Date('2026-07-26T00:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            difference % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)
          ),
          minutes: Math.floor(difference % (1000 * 60 * 60) / (1000 * 60)),
          seconds: Math.floor(difference % (1000 * 60) / 1000)
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const scrollToSection = (
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string) =>
  {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden bg-brand-navy">
      
      {/* Background Photo Collage (People and Pets) */}
      <div className="absolute inset-0 z-0">
        {/* Main large background image */}
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80&auto=format&fit=crop"
          alt="Person walking dogs"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true" />
        

        {/* Mosaic overlay images for depth */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=70&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true" />
          
          <img
            src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&q=70&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true" />
          
          <img
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=70&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true" />
          
          <img
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=70&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true" />
          
          <img
            src="https://images.unsplash.com/photo-1494947665470-20322015e3a8?w=800&q=70&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true" />
          
          <img
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=70&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true" />
          
        </div>
      </div>

      {/* Navy overlay at 70% for text readability */}
      <div className="absolute inset-0 bg-brand-navy/70 z-[1]"></div>

      {/* Subtle paw pattern over the overlay */}
      <div className="absolute inset-0 bg-paw-pattern-white opacity-10 z-[2] pointer-events-none"></div>

      {/* Decorative gradient blob */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl z-[2]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl z-[2]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center mt-10 mb-40 sm:mb-32 md:mb-24">
        <motion.img
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6
          }}
          src="/Logo_latido_y_huella_en_blanco.png"
          alt="Latido & Huella"
          className="h-28 sm:h-36 md:h-56 lg:h-72 object-contain mb-6 md:mb-8 drop-shadow-2xl" />
        

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6,
            delay: 0.2
          }}
          className="mb-4">
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-white leading-tight font-bold">
            Para los amantes de
          </h1>
          <div className="h-[110px] sm:h-[120px] md:h-[120px] lg:h-[170px] relative overflow-hidden mt-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={phraseIndex}
                initial={{
                  y: 50,
                  opacity: 0,
                  filter: 'blur(8px)'
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  filter: 'blur(0px)'
                }}
                exit={{
                  y: -50,
                  opacity: 0,
                  filter: 'blur(8px)'
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="absolute text-4xl md:text-5xl lg:text-7xl font-bold text-brand-cyan leading-tight">
                
                {ROTATING_PHRASES[phraseIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.h2
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6,
            delay: 0.3
          }}
          className="text-xl md:text-2xl text-brand-cyan font-bold mb-4 tracking-wide">
          
          Bienestar animal · Deporte · Comunidad · Propósito
        </motion.h2>

        <motion.p
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            duration: 0.6,
            delay: 0.4
          }}
          className="text-lg md:text-xl text-white/90 italic mb-10">
          
          "En cada paso late un corazón dejando una huella"
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 0.6,
            delay: 0.5
          }}
          className="w-full max-w-4xl mb-12">
          
          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: '0 0 35px rgba(0,188,212,0.25)'
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            className="relative overflow-hidden bg-brand-navy/60 backdrop-blur-md rounded-2xl py-5 px-6 md:px-10 border border-brand-cyan/20 shadow-[0_0_20px_rgba(0,188,212,0.1)] flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 text-center cursor-default">
            
            {/* Paw pattern background */}
            <img
              src="/PATRON_HUELLAS_fondo.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none" />
            
            <div className="flex flex-col items-center md:px-6">
              <span className="text-brand-cyan text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-0.5">
                Fecha
              </span>
              <span className="text-white text-base md:text-lg font-semibold">
                26 · 07 · 2026
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center md:px-6">
              <span className="text-brand-cyan text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-0.5">
                Lugar
              </span>
              <span className="text-white text-base md:text-lg font-semibold">
                Parque del Bienestar COMFAMA
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center md:px-6">
              <span className="text-brand-cyan text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-0.5">
                Ubicación
              </span>
              <span className="text-white text-base md:text-lg font-semibold">
                Llanogrande
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center md:px-6">
              <span className="text-brand-cyan text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-0.5">
                Evento
              </span>
              <span className="text-white text-base md:text-lg font-semibold">
                Caminata Canina + Feria
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6,
            delay: 0.6
          }}
          className="flex gap-3 md:gap-6 mb-12">
          
          {[
          {
            label: 'Días',
            value: timeLeft.days
          },
          {
            label: 'Horas',
            value: timeLeft.hours
          },
          {
            label: 'Minutos',
            value: timeLeft.minutes
          },
          {
            label: 'Segundos',
            value: timeLeft.seconds
          }].
          map((item, index) =>
          <div key={index} className="flex flex-col items-center">
              <div className="bg-brand-cyan/20 backdrop-blur-md border border-brand-cyan/30 w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,188,212,0.2)]">
                <span className="text-2xl md:text-4xl font-bold text-white">
                  {item.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs md:text-sm text-brand-cyan font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          )}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6,
            delay: 0.7
          }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          
          <Link
            to="/caminata-5k"
            className="w-full sm:w-auto bg-brand-cyan hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-1 text-center">
            
            Inscríbete Caminata Canina
          </Link>
          <a
            href="#patrocinadores"
            onClick={(e) => scrollToSection(e, '#patrocinadores')}
            className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-navy px-8 py-4 rounded-full font-bold text-lg transition-all text-center">
            
            Quiero patrocinar
          </a>
          <Link
            to="/expositores"
            className="w-full sm:w-auto bg-white text-brand-navy hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1 text-center">
            
            Quiero ser expositor
          </Link>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-brand-navy/80 backdrop-blur-md border-t border-white/10 py-4 z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-12 text-xs sm:text-sm text-white/70 font-medium">
          <div className="flex items-center gap-2">
            <span>Organizado por</span>
            <img
              src="/logo-Diverxo.svg"
              alt="Diverxo"
              className="h-5 sm:h-6 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
              window.dispatchEvent(new CustomEvent('open-diverxo-modal'))
              } />
            
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-2">
            <span>Apoya</span>
            <img
              src="/logo_comfama-Photoroom.png"
              alt="COMFAMA"
              className="h-5 sm:h-6 object-contain" />
            
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <img
              src="/Logo_Novo3d_trans.png"
              alt="NOVOeia"
              className="h-6 sm:h-7 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
              window.dispatchEvent(new CustomEvent('open-novoeia-modal'))
              } />
            
          </div>
        </div>
      </div>
    </section>);

}