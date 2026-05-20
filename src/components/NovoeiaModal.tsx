import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
export function NovoeiaModal() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-novoeia-modal', handleOpen);
    return () => window.removeEventListener('open-novoeia-modal', handleOpen);
  }, []);
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100]" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }} className="bg-white w-full max-w-2xl rounded-3xl p-8 md:p-12 shadow-2xl relative pointer-events-auto overflow-hidden">
              {/* Decorative Background Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-brand-navy transition-colors z-10">
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center relative z-10">
                {/* Logo */}
                <img src="/Logo_Novo3d_trans.png" alt="NOVOeia Logo" className="h-24 md:h-32 object-contain mb-6 drop-shadow-xl" />

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
                  Ecosistema digital del evento
                </h2>

                {/* Copy */}
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
                  NOVOeia diseñó y construyó todo el ecosistema digital de
                  Latido & Huella: desde la plataforma de inscripciones hasta la
                  gamificación del Muro de las Huellas, pasando por la gestión
                  de patrocinadores y pasarela de pagos. Tecnología hecha para
                  crear experiencias con inteligencia digital.
                </p>

                {/* Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {['Plataforma Web con IA', 'Pasarela de Pagos', 'Experiencias Interactivas', 'Inteligencia de Datos'].map((chip, index) => <span key={index} className="bg-brand-navy/5 text-brand-navy px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-brand-navy/10">
                      {chip}
                    </span>)}
                </div>

                {/* CTA */}
                <a href="https://novoeia.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-1">
                  Conoce más sobre NOVOeia
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>;
}