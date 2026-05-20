import React, { useCallback, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Goal, Dribbble, PawPrint, HeartPulse, Music, Store, Utensils, Baby, ChevronLeft, ChevronRight } from 'lucide-react';
const activities = [{
  title: 'Caminata Canina',
  desc: 'Pasos que hacen latir tu corazón y dejan una huella.\n\nRompe la rutina y regálale a tus mascotas una mañana inolvidable. Vive 6,5 kilómetros de pura naturaleza y conexión, un espacio diseñado especialmente para disfrutar en familia y celebrar ese vínculo único que te une a ellos.\n\nEs el momento perfecto para compartir, respirar aire puro y crear recuerdos que llegan al corazón. Al participar, recibirás un certificado digital para conmemorar su esfuerzo.\n\n¡Inscríbete ahora y prepárate para la aventura!',
  icon: PawPrint,
  image: "/caminata5kimagen.png",
  link: '/caminata-5k',
  linkLabel: 'Inscríbete ahora',
  isExternal: true
}, {
  title: 'Feria Bazar',
  desc: 'En Latido y Huella fusionamos dos mundos en un mismo lugar:\n\nLa Feria: El corazón comercial y gastronómico. Recorre stands con marcas inspiradoras, accesorios, productos para toda la familia y para mascotas, además de una variada oferta gastronómica para que no tengas que salir del parque.\n\nEl Bazar: El alma del entretenimiento. Un espacio vibrante con actividades deportivas, expresiones artísticas, talleres culturales y zonas de juego diseñadas para niños y mascotas.\n\n¡Prepárate para un día de mucha diversión en familia! Te esperamos de 8:00 a.m. a 5:00 p.m. para vivir una jornada donde el bienestar y la alegría son los protagonistas.',
  icon: Store,
  image: "/ChatGPT_Image_5_may_2026,_16_12_14.png",
  link: '#recinto',
  linkLabel: 'Conocer más',
  isExternal: false
}, {
  title: 'Tarima Principal',
  subtitle: '🎟️ Entrada gratuita al parque',
  desc: '¡Aquí vibra el evento!\n\nNuestra tarima principal es el punto de encuentro donde todo sucede: la emocionante salida y llegada de nuestra Caminata, música en vivo para animar tu jornada, premiaciones y sorpresas diseñadas para todos los asistentes.\n\nPrepárate para vivir momentos inolvidables en el escenario donde celebramos la vida y la familia.',
  icon: Music,
  image: "/Tarima_Principal.png",
  link: '#agenda',
  linkLabel: 'Ver agenda',
  isExternal: false
}, {
  title: 'Zona Fútbol',
  desc: 'El campo de juego te espera.\n\nDemuestra tu talento en nuestras canchas profesionales.\n\nTendremos torneos diseñados para adultos y niños, con árbitros certificados y toda la logística para que te sientas como un profesional.\n\nArma tu equipo, inscríbete y ven a luchar por el título de campeón.\n\n¡Es momento de darlo todo en la cancha, inscribe a tu equipo hoy!',
  icon: Goal,
  image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&auto=format&fit=crop',
  link: '/deportes',
  linkLabel: 'Inscríbete',
  isExternal: true
}, {
  title: 'Pádel',
  desc: 'Vive la emoción del pádel en un espacio diseñado para todos los niveles.\n\nDisfruta de canchas disponibles para jugar, competir y compartir una experiencia deportiva diferente. Tendremos torneos programados, jugadores por categorías y toda la logística necesaria para que puedas reservar tu cupo y demostrar tu talento.\n\nArma tu pareja, inscríbete y ven a disfrutar de una jornada llena de energía, competencia y diversión.\n\n¡Reserva tu cupo y demuestra tu talento en la cancha!',
  icon: Dribbble,
  image: "/Foto-3-La-Morelia-se-transformo-en-el-Parque-del-Bienestar-1-1024x683.jpg",
  link: '/deportes',
  linkLabel: 'Reserva tu cupo',
  isExternal: true
}, {
  title: 'Zona de Mascotas',
  desc: 'Un lugar pensado para verlos felices.\n\nVen a compartir una jornada llena de dinámicas, juegos y sorpresas donde tus mascotas podrán socializar y disfrutar de un ambiente diseñado especialmente para su bienestar.\n\n¡Prepárate para verlos mover la cola de felicidad en cada actividad!',
  icon: PawPrint,
  image: "/Informe_2024-Nuestros_logros-Parque_del_Bienestar-Cabecera.webp",
  link: '#muro',
  linkLabel: 'Muro de Huellas',
  isExternal: false
}, {
  title: 'Zona Infantil',
  desc: '¡Jugar, crear y saltar!\n\nInflables, arte y mucha diversión esperan a los más pequeños.\n\nUn espacio con actividades diseñadas para entretener y potenciar la creatividad de los niños mientras compartimos en familia.\n\n¡Ven a vivir un día donde la alegría no tiene límites!',
  icon: Baby,
  image: "/Zona_Infantil.png",
  link: '#actividades',
  linkLabel: 'Explorar',
  isExternal: false
}, {
  title: 'Charlas y Bienestar',
  desc: '¡Aprende, practica y crece en familia!\n\nEn Latido y Huella no solo nos movemos, también nos formamos. Hemos diseñado dos ambientes exclusivos para que disfrutes de contenidos de valor para todos:\n\nSalón de Charlas: Encuentros informativos sobre temas tendencia en deporte, nutrición, vida en familia y cuidado consciente. Un espacio para inspirarte con expertos de diversas áreas.\n\nSalón de Talleres Prácticos: Actividades dinámicas y constructivas donde podrás poner en práctica lo aprendido, desde técnicas deportivas hasta talleres creativos y de bienestar para ti y tus mascotas.',
  icon: HeartPulse,
  image: "/full-shot-friends-sitting-outdoors.jpg",
  link: '#agenda',
  linkLabel: 'Ver agenda',
  isExternal: false
}, {
  title: 'Muestras Comerciales',
  desc: '¡Impulsa tu marca en nuestra Zona Comercial!\n\nSé parte de la vitrina más importante para familias y mascotas.\n\nContamos con stands de 2x2 ideales para emprendedores de accesorios, moda, repostería y servicios.\n\nÚnete a una oferta comercial única y conecta con clientes que buscan lo mejor para ellos y sus peludos.\n\n¡Asegura tu lugar hoy mismo!',
  icon: Store,
  image: "/full-shot-people-garage-sale.jpg",
  link: '/expositores',
  linkLabel: 'Quiero mi stand',
  isExternal: true
}, {
  title: 'Gastronomía',
  desc: 'Sabores que dejan huella.\n\n¿Tu marca es experta en deleitar paladares? Únete a nuestro ecosistema de sabor con toldos artesanales y zonas para food trucks.\n\nBuscamos propuestas de cocina o alimentos gourmet, bebidas, repostería, sabores locales y snacks saludables tanto para humanos como para mascotas.\n\nEs el escenario perfecto para conectar tu propuesta con familias en un ambiente único. Asegura tu espacio ahora, postula tu marca y prepárate para ser el sabor favorito del evento.',
  icon: Utensils,
  image: "/close-up-hands-holding-cup-with-food.jpg",
  link: '/expositores',
  linkLabel: 'Quiero mi espacio',
  isExternal: true
}];
export function ActivitiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [isHovering, setIsHovering] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const total = activities.length;
  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setShowOverlay(false);
  }, [total]);
  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setShowOverlay(false);
  }, [total]);
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);
  // Calculate styles based on circular distance
  const getCardStyles = (index: number) => {
    let diff = index - currentIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    // Center card
    if (diff === 0) {
      return {
        x: '0%',
        scale: 1,
        opacity: 1,
        zIndex: 30,
        filter: 'blur(0px)'
      };
    }
    // Immediate neighbors
    if (diff === 1 || diff === -1) {
      return {
        x: diff === 1 ? '100%' : '-100%',
        scale: 0.85,
        opacity: 0.4,
        zIndex: 20,
        filter: 'blur(4px)'
      };
    }
    // Second neighbors
    if (diff === 2 || diff === -2) {
      return {
        x: diff === 2 ? '160%' : '-160%',
        scale: 0.7,
        opacity: 0.15,
        zIndex: 10,
        filter: 'blur(8px)'
      };
    }
    // Hidden cards
    return {
      x: diff > 0 ? '200%' : '-200%',
      scale: 0.5,
      opacity: 0,
      zIndex: 0,
      filter: 'blur(10px)'
    };
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({
      x,
      y
    });
  };
  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowOverlay(false);
    setMousePosition({
      x: 0,
      y: 0
    });
  };
  return <section id="actividades" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with enhanced title animation */}
        <div className="text-center mb-16">
          <div className="text-4xl md:text-5xl mb-4 font-bold">
            {['CONOCE', 'TODO', 'EL', 'EVENTO'].map((word, i) => <motion.span key={i} initial={{
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
          </div>
          <motion.div initial={{
          opacity: 0,
          width: 0
        }} whileInView={{
          opacity: 1,
          width: '100px'
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.6
        }} className="h-1 bg-brand-cyan mx-auto rounded-full" />
        </div>

        {/* Carousel Container */}
        <div className="relative w-full h-[580px] md:h-[650px] flex items-center justify-center mb-12">
          {/* Navigation Arrows */}
          <button onClick={prev} className="absolute left-4 md:left-10 z-40 w-12 h-12 md:w-16 md:h-16 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-navy shadow-lg hover:bg-brand-cyan hover:text-white transition-all hover:scale-110" aria-label="Anterior">
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <button onClick={next} className="absolute right-4 md:right-10 z-40 w-12 h-12 md:w-16 md:h-16 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-navy shadow-lg hover:bg-brand-cyan hover:text-white transition-all hover:scale-110" aria-label="Siguiente">
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* Cards */}
          <div className="relative w-full max-w-[280px] md:max-w-[320px] h-full flex items-center justify-center perspective-1000">
            <AnimatePresence initial={false}>
              {activities.map((act, idx) => {
              const styles = getCardStyles(idx);
              const isCenter = idx === currentIndex;
              const rotateX = isCenter && isHovering ? -(mousePosition.y / 30) : 0;
              const rotateY = isCenter && isHovering ? mousePosition.x / 30 : 0;
              return <motion.div key={idx} className="absolute w-full aspect-[9/16] bg-white rounded-[2rem] border border-gray-100 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing group" initial={false} animate={{
                x: styles.x,
                scale: isCenter && isHovering ? 1.03 : styles.scale,
                opacity: styles.opacity,
                zIndex: styles.zIndex,
                filter: styles.filter,
                rotateX,
                rotateY,
                boxShadow: isCenter && isHovering ? '0 25px 50px -12px rgba(0, 188, 212, 0.4), 0 0 30px rgba(0, 188, 212, 0.2)' : isCenter ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }} transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 1
              }} style={{
                transformStyle: 'preserve-3d',
                perspective: 1000
              }} drag="x" dragConstraints={{
                left: 0,
                right: 0
              }} dragElastic={0.2} onDragEnd={(e, {
                offset,
                velocity
              }) => {
                const swipe = offset.x;
                if (swipe < -50 || velocity.x < -500) {
                  next();
                } else if (swipe > 50 || velocity.x > 500) {
                  prev();
                }
              }} onMouseMove={isCenter ? handleMouseMove : undefined} onMouseEnter={isCenter ? () => {
                setIsHovering(true);
                setShowOverlay(true);
              } : undefined} onMouseLeave={isCenter ? handleMouseLeave : undefined} onClick={() => {
                if (!isCenter) {
                  let diff = idx - currentIndex;
                  if (diff > total / 2) diff -= total;
                  if (diff < -total / 2) diff += total;
                  if (diff > 0) next();
                  if (diff < 0) prev();
                } else {
                  setShowOverlay((prev) => !prev);
                }
              }}>
                    {/* Base Image Area */}
                    <div className="relative h-[45%] w-full flex-shrink-0">
                      <img src={act.image} alt={act.title} className="w-full h-full object-cover" draggable="false" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Hexagonal Icon */}
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-cyan flex items-center justify-center shadow-xl" style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }}>
                        <act.icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Base Content Area */}
                    <div className="h-[55%] w-full p-5 pt-12 md:pt-14 flex flex-col items-center text-center bg-white overflow-hidden">
                      <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2 flex-shrink-0">
                        {act.title}
                      </h3>
                      {act.subtitle && <span className="inline-block bg-brand-cyan/10 text-brand-cyan text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-cyan/20 mb-2">
                          {act.subtitle}
                        </span>}
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed flex-grow min-h-0 overflow-hidden line-clamp-4">
                        {act.desc}
                      </p>
                      <div className="w-full mt-3 flex-shrink-0">
                        {act.isExternal ? <Link to={act.link} className="block w-full py-3 px-6 bg-brand-cyan hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors shadow-md" onClick={(e) => {
                      e.stopPropagation();
                      if (!isCenter) e.preventDefault();
                    }}>
                            {act.linkLabel}
                          </Link> : <a href={act.link} className="block w-full py-3 px-6 bg-brand-cyan hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors shadow-md" onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!isCenter) return;
                      const element = document.querySelector(act.link);
                      if (element) {
                        element.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }
                    }}>
                            {act.linkLabel}
                          </a>}
                      </div>
                    </div>

                    {/* Hover/Tap Overlay - slides up from bottom */}
                    <AnimatePresence>
                      {isCenter && showOverlay && <motion.div initial={{
                    opacity: 0,
                    y: '100%'
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    y: '100%'
                  }} transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1]
                  }} className="absolute inset-0 z-20 bg-brand-navy/90 backdrop-blur-sm flex flex-col p-6 pt-8 text-center rounded-[2rem] overflow-hidden">
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 flex-shrink-0">
                            {act.title}
                          </h3>

                          {act.subtitle && <div className="mb-3 flex-shrink-0">
                              <span className="inline-block bg-brand-cyan/20 text-brand-cyan text-xs font-bold px-3 py-1 rounded-full border border-brand-cyan/30">
                                {act.subtitle}
                              </span>
                            </div>}

                          <div className="flex-grow overflow-y-auto text-white/90 text-sm leading-relaxed whitespace-pre-line text-left px-1 mb-4 scrollbar-thin">
                            {act.desc}
                          </div>

                          <div className="w-full flex-shrink-0 mt-auto">
                            {act.isExternal ? <Link to={act.link} className="block w-full py-3 px-6 bg-brand-cyan hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors shadow-md" onClick={(e) => e.stopPropagation()}>
                                {act.linkLabel}
                              </Link> : <a href={act.link} className="block w-full py-3 px-6 bg-brand-cyan hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors shadow-md" onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const element = document.querySelector(act.link);
                        if (element) {
                          element.scrollIntoView({
                            behavior: 'smooth'
                          });
                        }
                      }}>
                                {act.linkLabel}
                              </a>}
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </motion.div>;
            })}
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mb-20">
          {activities.map((_, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 h-2.5 bg-brand-cyan' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`} aria-label={`Ir a diapositiva ${idx + 1}`} />)}
        </div>
      </div>
    </section>;
}