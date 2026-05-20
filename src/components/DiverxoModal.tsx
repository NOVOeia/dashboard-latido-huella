import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
export function DiverxoModal() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-diverxo-modal', handleOpen);
    return () => window.removeEventListener('open-diverxo-modal', handleOpen);
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
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop */}
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100]" />
        

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="bg-brand-navy w-full max-w-2xl rounded-3xl p-8 md:p-12 shadow-2xl relative pointer-events-auto overflow-hidden">
            
              {/* Decorative Background Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10">
              
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center relative z-10">
                {/* Logo */}
                <img
                src="/logo-Diverxo.svg"
                alt="Diverxo Logo"
                className="h-20 md:h-24 object-contain mb-6 drop-shadow-xl" />
              

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Organizador oficial del evento
                </h2>

                {/* Copy */}
                <p className="text-sm md:text-base text-white/70 leading-relaxed mb-8 max-w-lg mx-auto">
                  Diverxo Eventos Corporativos es la empresa organizadora detrás
                  de Latido & Huella. Con años de experiencia produciendo
                  experiencias que conectan marcas, comunidades y causas,
                  Diverxo lidera la operación integral del evento: desde la
                  curaduría de patrocinadores y expositores hasta la logística
                  del día D.
                </p>

                {/* Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {[
                'Producción de eventos',
                'Activaciones de marca',
                'Experiencias corporativas',
                'Gestión integral'].
                map((chip, index) =>
                <span
                  key={index}
                  className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/15">
                  
                      {chip}
                    </span>
                )}
                </div>

                {/* CTA */}
                <a
                href="https://diverxo.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-1">
                
                  Visitar sitio web de Diverxo
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

}