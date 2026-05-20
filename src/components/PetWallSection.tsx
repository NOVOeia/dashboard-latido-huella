import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Dog,
  Camera,
  Heart,
  Trophy,
  PawPrint,
  ClipboardEdit,
  Info } from
'lucide-react';
import { PetRegistrationModal } from './PetRegistrationModal';
export function PetWallSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const topCtaRef = useRef<HTMLDivElement | null>(null);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [isTopCtaInView, setIsTopCtaInView] = useState(false);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting);
      },
      {
        threshold: 0.05
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = topCtaRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTopCtaInView(entry.isIntersecting);
      },
      {
        threshold: 0.4
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // Sticky bottom CTA only shows on mobile when section is visible but the
  // top inline CTA is already out of view — avoids dual-button conflict.
  const showStickyBottomCta = isSectionInView && !isTopCtaInView;
  // Mock data for the pet wall
  const [pets, setPets] = useState([
  {
    id: 1,
    name: 'Max',
    breed: 'Shih Tzu',
    huellas: 1245,
    image: 'bg-gradient-to-br from-amber-200 to-orange-300',
    imageUrl: "/mascota1.png"

  },
  {
    id: 2,
    name: 'Luna',
    breed: 'Husky Siberiano',
    huellas: 982,
    image: 'bg-gradient-to-br from-gray-200 to-gray-400',
    imageUrl: "/mascota3.png"

  },
  {
    id: 3,
    name: 'Rocky',
    breed: 'Bulldog Inglés',
    huellas: 856,
    image: 'bg-gradient-to-br from-stone-300 to-stone-500',
    imageUrl: "/mascota2.png"

  },
  {
    id: 4,
    name: 'Bella',
    breed: 'Gato Siamés',
    huellas: 743,
    image: 'bg-gradient-to-br from-yellow-100 to-amber-200',
    imageUrl: "/mascota4.png"

  },
  {
    id: 5,
    name: 'Thor',
    breed: 'Teckel',
    huellas: 690,
    image: 'bg-gradient-to-br from-orange-800 to-stone-800',
    imageUrl: "/mascota5.png"

  },
  {
    id: 6,
    name: 'Kira',
    breed: 'Beagle',
    huellas: 512,
    image: 'bg-gradient-to-br from-orange-300 to-amber-600',
    imageUrl:
    'https://images.unsplash.com/photo-1537151608804-ea6f11cc678e?w=800&q=80&auto=format&fit=crop'
  }]
  );
  const handleDarHuella = (id: number) => {
    setPets(
      pets.map((pet) =>
      pet.id === id ?
      {
        ...pet,
        huellas: pet.huellas + 1
      } :
      pet
      )
    );
  };
  const topPets = [...pets].sort((a, b) => b.huellas - a.huellas).slice(0, 5);
  return (
    <section
      ref={sectionRef}
      id="muro"
      className="py-24 relative overflow-hidden">
      
      <PetRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)} />
      
      {/* Paw prints background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/PATRON_HUELLAS_fondo.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover" />
        
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-6">
            {['El', 'Muro', 'de', 'las', 'Huellas'].map((word, i) =>
            <motion.span
              key={i}
              initial={{
                opacity: 0,
                y: 30,
                filter: 'blur(10px)'
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)'
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="inline-block shimmer-text mr-3">
              
                {word}
              </motion.span>
            )}
          </h2>
          <motion.p
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6,
              delay: 0.1
            }}
            className="text-lg text-gray-600 mb-10">
            
            Sube la foto de tu mascota, acumula Huellas y compite por ser la{' '}
            <strong>Mascota Influencer 2026</strong>.
          </motion.p>

          {/* 3 Steps */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6,
              delay: 0.2
            }}
            className="flex flex-row justify-center items-start gap-2 md:gap-10">
            
            <div className="flex flex-col items-center flex-1 md:flex-initial">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy mb-2 md:mb-3">
                <Dog className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-semibold text-brand-navy text-[11px] md:text-base text-center leading-tight">
                1. Regístralo
              </span>
            </div>
            <div className="hidden md:block w-12 h-0.5 bg-gray-200 mt-7"></div>
            <div className="flex flex-col items-center flex-1 md:flex-initial">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mb-2 md:mb-3">
                <Camera className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-semibold text-brand-navy text-[11px] md:text-base text-center leading-tight">
                2. Súbelo
              </span>
            </div>
            <div className="hidden md:block w-12 h-0.5 bg-gray-200 mt-7"></div>
            <div className="flex flex-col items-center flex-1 md:flex-initial">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mb-2 md:mb-3">
                <PawPrint className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-semibold text-brand-navy text-[11px] md:text-base text-center leading-tight">
                3. Huellas
              </span>
              <span className="hidden md:block text-xs text-gray-500 mt-1">
                1 Like = 1 Huella
              </span>
            </div>
            <div className="hidden md:block w-12 h-0.5 bg-gray-200 mt-7"></div>
            <div className="flex flex-col items-center flex-1 md:flex-initial">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-2 md:mb-3">
                <Trophy className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-semibold text-brand-navy text-[11px] md:text-base text-center leading-tight">
                4. ¡Gana!
              </span>
              <span className="hidden md:block text-xs text-gray-500 mt-1">
                Mascota Influencer
              </span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            ref={topCtaRef}
            initial={{
              opacity: 0,
              y: 15
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5,
              delay: 0.4
            }}
            className="mt-10">
            
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-3 bg-brand-cyan hover:bg-blue-700 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-1">
              
              <ClipboardEdit className="w-5 h-5 md:w-6 md:h-6" />
              Registra a tu mascota
            </button>
          </motion.div>
        </div>

        {/* NEW: Info banner */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.5
          }}
          className="mb-10 mx-auto max-w-3xl bg-brand-green/10 border border-brand-green/30 rounded-2xl p-5 flex items-start gap-3">
          
          <Info className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            <strong className="text-brand-green">
              ¿Ya te inscribiste a la Caminata Canina?
            </strong>{' '}
            Tus mascotas aparecen aquí automáticamente 🎉. Si aún no lo has
            hecho,{' '}
            <Link
              to="/caminata-5k"
              className="text-brand-green font-bold underline hover:text-brand-navy transition-colors">
              
              inscríbete a la Caminata
            </Link>{' '}
            para sumar a tu peludo al Muro.
          </p>
        </motion.div>

        {/* Mobile-only podium Top 5 */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.5
          }}
          className="lg:hidden mb-6 bg-brand-navy rounded-2xl p-4 shadow-xl">
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-brand-yellow" />
            <h3 className="text-base font-bold text-white">
              Top 5 Influencers
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {topPets.map((pet, index) =>
            <div
              key={pet.id}
              className="flex-shrink-0 flex flex-col items-center w-16">
              
                <div className="relative">
                  <div
                  className={`w-14 h-14 rounded-full ${pet.imageUrl ? 'bg-gray-100' : pet.image} border-2 ${index === 0 ? 'border-brand-yellow' : 'border-white/20'} overflow-hidden`}>
                  
                    {pet.imageUrl &&
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover" />

                  }
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-yellow text-brand-navy text-[10px] font-bold flex items-center justify-center shadow">
                    {index + 1}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-white mt-1.5 truncate w-full text-center">
                  {pet.name}
                </span>
                <span className="text-[10px] text-brand-cyan font-bold">
                  {pet.huellas}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Grid (Instagram style) */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {pets.map((pet, index) =>
              <motion.div
                key={pet.id}
                initial={{
                  opacity: 0,
                  scale: 0.9
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-200 group hover:shadow-xl transition-all duration-300">
                
                  {/* Image Placeholder */}
                  <div
                  className={`w-full aspect-square ${pet.imageUrl ? 'bg-gray-100' : pet.image} relative overflow-hidden flex items-center justify-center`}>
                  
                    {pet.imageUrl ?
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover" /> :


                  <Camera className="w-12 h-12 text-white/50" />
                  }

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-brand-navy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center p-6 text-center">
                      <p className="text-white text-sm">
                        ¡Hola! Soy {pet.name} y me encanta correr por el parque.
                        ¡Dame una huella para ganar!
                      </p>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 md:p-4">
                    <div className="mb-2 md:mb-3">
                      <h3 className="font-bold text-brand-navy text-sm md:text-lg leading-tight truncate">
                        {pet.name}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-500 truncate">
                        {pet.breed}
                      </p>
                    </div>
                    <button
                    onClick={() => handleDarHuella(pet.id)}
                    className="w-full py-1.5 md:py-2 rounded-lg border-2 border-brand-cyan text-brand-cyan font-bold text-xs md:text-sm hover:bg-brand-cyan hover:text-white transition-colors flex items-center justify-center gap-1.5">
                    
                      <PawPrint className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                      <span>{pet.huellas}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar Ranking (desktop only) */}
          <motion.div
            initial={{
              opacity: 0,
              x: 30
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6
            }}
            className="w-full lg:w-1/3 hidden lg:block">
            
            <div className="bg-brand-navy rounded-3xl p-6 shadow-xl sticky top-28">
              <div className="flex gap-3 mb-6 border-b border-white/10 pb-4 items-center justify-center">
                <Trophy className="w-8 h-8 text-brand-yellow" />
                <h3 className="text-2xl font-bold text-white">
                  Top 5 Influencers
                </h3>
              </div>

              <div className="space-y-4 mb-8">
                {topPets.map((pet, index) =>
                <div
                  key={pet.id}
                  className="flex items-center gap-4 bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
                  
                    <div className="w-8 text-center font-bold text-brand-yellow text-xl">
                      #{index + 1}
                    </div>
                    <div
                    className={`w-12 h-12 rounded-full ${pet.imageUrl ? 'bg-gray-100' : pet.image} border-2 border-white/20 flex-shrink-0 overflow-hidden`}>
                    
                      {pet.imageUrl &&
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover" />

                    }
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-white text-sm">
                        {pet.name}
                      </h4>
                      <p className="text-xs text-white/60">{pet.breed}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-brand-cyan text-sm">
                        {pet.huellas}
                      </span>
                      <p className="text-[10px] text-white/50 uppercase">
                        Huellas
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="w-full block text-center bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
                
                Registra a tu mascota
              </button>
            </div>
          </motion.div>
        </div>

        {/* Green Banner */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.6,
            delay: 0.4
          }}
          className="mt-16 bg-brand-green/10 border border-brand-green/20 rounded-2xl p-6 text-center max-w-3xl mx-auto">
          
          <p className="text-brand-green flex items-center justify-center gap-2 text-base md:text-2xl font-bold leading-snug">
            <Heart className="w-5 h-5 md:w-6 md:h-6 fill-brand-green flex-shrink-0" />
            <span>
              Parte de cada inscripción apoya al CEIBA Rionegro, nuestra
              fundación aliada 2026.
            </span>
          </p>
        </motion.div>
      </div>

      {/* Floating pill CTA (mobile only, when section is in view AND top CTA is out of view).
             Anchored bottom-left with right-side padding to leave room for the WhatsApp FAB. */}
      <AnimatePresence>
        {showStickyBottomCta &&
        <motion.div
          initial={{
            y: 80,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          exit={{
            y: 80,
            opacity: 0
          }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="md:hidden fixed bottom-6 left-4 right-24 z-40 pointer-events-none">
          
            <button
            onClick={() => setModalOpen(true)}
            className="pointer-events-auto w-full inline-flex items-center justify-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-5 py-3.5 rounded-full font-bold text-sm transition-all shadow-[0_8px_24px_rgba(0,188,212,0.45)]">
            
              <ClipboardEdit className="w-5 h-5" />
              Registra a tu mascota
            </button>
          </motion.div>
        }
      </AnimatePresence>
    </section>);

}