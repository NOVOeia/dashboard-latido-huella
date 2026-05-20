import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Map, X, Store, Coffee, Music, Users, Dog, Car, CheckCircle2 } from 'lucide-react';
// Helper: parses **text** inside a string and renders the wrapped parts with extra-bold weight
function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold">
          {part.slice(2, -2)}
        </strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
function FiveKIcon({
  className


}: {className?: string;}) {
  return <img src="/Logo_latido_y_huella_ICONO_blanco.png" alt="Latido y Huella" className={className} />;
}
function SoccerIcon({
  className


}: {className?: string;}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      {/* Pentagon pattern for soccer ball */}
      <polygon points="12,7 14.5,9 13.5,12 10.5,12 9.5,9" fill="currentColor" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="9.5" y1="9" x2="4.5" y2="6.5" />
      <line x1="14.5" y1="9" x2="19.5" y2="6.5" />
      <line x1="13.5" y1="12" x2="17" y2="16" />
      <line x1="10.5" y1="12" x2="7" y2="16" />
      <line x1="7" y1="16" x2="9" y2="21" />
      <line x1="17" y1="16" x2="15" y2="21" />
    </svg>;
}
function RacketIcon({
  className


}: {className?: string;}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="13" cy="8" r="6" />
      <path d="M13 2v2" />
      <path d="M7 8h12" />
      <path d="M13 8v6" />
      <path d="M9.5 14.5 4 20" />
      <path d="M3 21l1-1" />
    </svg>;
}
type Zone = {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  tagline?: string;
  description: string;
  image?: string;
  details: string[];
  x: number;
  y: number;
  cta?: {
    label: string;
    href: string;
    isRoute?: boolean;
  };
};
export function VenueMapSection() {
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const zones: Zone[] = [{
    id: 'ingreso',
    name: 'Ingreso · Salida Caminata',
    icon: FiveKIcon,
    color: '#0D1B6E',
    tagline: '¡Aquí **empieza todo**!',
    description: 'Tu entrada al universo Latido y Huella. **Aquí inicia y culmina** la Caminata Canina. Llega temprano, recibe tu kit, conecta con la energía del evento y prepárate para vivir **6,5 km** de pura conexión con tu mascota.',
    image: "/caminata5kimagen.png",
    details: ['**Check-in** con QR único Persona + Mascota', '**Salida y llegada** de la Caminata Canina', '**Hidratación** lista al partir', '**Calentamiento** dirigido antes del recorrido'],
    x: 54,
    y: 33,
    cta: {
      label: 'Inscríbete a la Caminata',
      href: '/caminata-5k',
      isRoute: true
    }
  }, {
    id: 'parking-interno',
    name: 'Parqueadero Interno',
    icon: Car,
    color: '#9CA3AF',
    tagline: '🅿️ **170 cupos** · Gratis',
    description: '**Estaciónate dentro del parque** sin pagar nada y entra directo al evento. ¡Pero ojo!, el cupo es **limitado**: llega antes de las **9:00 a.m.** para asegurar tu lugar.',
    details: ['**170 cupos** gratuitos', '**Acceso directo** al recinto', '**Sin costo** para asistentes', '**Llega temprano** — cupo limitado'],
    x: 55,
    y: 73,
    cta: {
      label: 'Cómo llegar al parque',
      href: '#ubicacion'
    }
  }, {
    id: 'parking-jacinta',
    name: 'Parqueadero La Jacinta',
    icon: Car,
    color: '#9CA3AF',
    tagline: '🅿️ **150 cupos** · Pago',
    description: '**Parqueadero exterior** a pocos pasos del parque. Ideal si llegas tarde o el interno está lleno. Tarifas claras: **día completo** o **por hora**.',
    details: ['**150 cupos** disponibles', '**Día completo:** $25.000 COP', '**Por hora o fracción:** $5.000 COP', '**A pocos pasos** del parque'],
    x: 78,
    y: 30,
    cta: {
      label: 'Cómo llegar al parque',
      href: '#ubicacion'
    }
  }, {
    id: 'futbol',
    name: 'Zona Fútbol',
    icon: SoccerIcon,
    color: '#0D1B6E',
    tagline: '⚽ **¡El campo es tuyo!**',
    description: '**Saca a la cancha el orgullo** de tu equipo. Tres canchas sintéticas profesionales, árbitros certificados y torneos para **adultos y niños**. Arma el equipo, inscríbete y **lucha por el título**.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&auto=format&fit=crop',
    details: ['**3 canchas sintéticas** profesionales', '**Árbitros certificados** todo el día', '**Graderías** para tu hinchada', '**Primeros auxilios** en zona'],
    x: 45,
    y: 38,
    cta: {
      label: 'Inscribe tu equipo',
      href: '/deportes',
      isRoute: true
    }
  }, {
    id: 'raqueta',
    name: 'Tenis & Pádel',
    icon: RacketIcon,
    color: '#0D1B6E',
    tagline: '🎾 **Tu turno en la cancha**',
    description: '**Vive la emoción** del pádel y el tenis en un espacio para todos los niveles. Canchas para jugar, **competir y compartir**. Reserva tu cupo, arma tu pareja y **demuestra tu talento**.',
    image: "/Foto-3-La-Morelia-se-transformo-en-el-Parque-del-Bienestar-1-1024x683.jpg",
    details: ['**1 cancha de tenis**', '**2 canchas de pádel**', '**Categorías** para todos los niveles', '**Zona de descanso** para jugadores'],
    x: 23,
    y: 47,
    cta: {
      label: 'Reserva tu cupo',
      href: '/deportes',
      isRoute: true
    }
  }, {
    id: 'recreativa',
    name: 'Zona Recreativa',
    icon: Dog,
    color: '#00BCD4',
    tagline: '🐾 **Diversión sin límites**',
    description: '**Un lugar para verlos felices.** Inflables, juegos y arte para los niños. **Piscina de pelotas**, circuito agility y veterinario de turno para los peludos. Aquí **toda la familia ríe** al mismo tiempo.',
    image: "/Informe_2024-Nuestros_logros-Parque_del_Bienestar-Cabecera.webp",
    details: ['**Actividades dirigidas** para niños', '**Parque de juegos** para mascotas', '**Piscina de pelotas** y agility', '**Veterinario** de turno todo el día'],
    x: 27,
    y: 72,
    cta: {
      label: 'Conoce las actividades',
      href: '#actividades'
    }
  }, {
    id: 'educativa',
    name: 'Salones de Charlas',
    icon: Users,
    color: '#FFB300',
    tagline: '💡 **Aprende, practica, crece**',
    description: '**Dos ambientes** diseñados para crecer en familia. **Charlas inspiradoras** con expertos en deporte, nutrición y bienestar. **Talleres prácticos** donde pones manos a la obra junto a tus mascotas.',
    image: "/full-shot-friends-sitting-outdoors.jpg",
    details: ['**Salón Grande (100 personas)** — Charlas informativas', '**Salón Pequeño (30 personas)** — Talleres prácticos', '**Expertos** de diversas áreas', '**Aire acondicionado** y confort total'],
    x: 41,
    y: 81,
    cta: {
      label: 'Ver agenda completa',
      href: '#agenda'
    }
  }, {
    id: 'comercial',
    name: 'Carpa Comercial',
    icon: Store,
    color: '#00BCD4',
    tagline: '🛍️ **La vitrina del evento**',
    description: '**¡Impulsa tu marca!** Sé parte de la vitrina más importante para familias y mascotas. Stands de **2×2 m** ideales para emprendedores de accesorios, moda, repostería y servicios. **Conecta con clientes** que buscan lo mejor.',
    image: "/full-shot-people-garage-sale.jpg",
    details: ['**Stands 2×2 m** comerciales', '**Patrocinadores** Oro, Plata y Bronce', '**Muestras gratis** y novedades', '**Conexión directa** con familias'],
    x: 45,
    y: 58,
    cta: {
      label: 'Quiero mi stand',
      href: '/expositores',
      isRoute: true
    }
  }, {
    id: 'gastronomia',
    name: 'Zona Gastronómica',
    icon: Coffee,
    color: '#FFB300',
    tagline: '🍽️ **Sabores que dejan huella**',
    description: '**Comida gourmet, snacks y delicias** para los dos. ¿Tu marca conquista paladares? Únete con toldos artesanales y food trucks. Repostería, **opciones vegetarianas**, sabores locales y snacks para mascotas. **¡No tendrás que salir del parque!**',
    image: "/close-up-hands-holding-cup-with-food.jpg",
    details: ['**Stands de comida** y food trucks', '**Opciones vegetarianas** y gourmet', '**Snacks saludables** para mascotas', '**Mesas de picnic** para compartir'],
    x: 55,
    y: 62,
    cta: {
      label: 'Quiero mi espacio',
      href: '/expositores',
      isRoute: true
    }
  }, {
    id: 'tarima',
    name: 'Tarima Principal',
    icon: Music,
    color: '#0D1B6E',
    tagline: '🎵 **¡Aquí vibra el evento!**',
    description: '**El corazón del evento.** Salida y llegada de la Caminata, **música en vivo**, premiaciones, sorpresas y la **coronación del Mascota Influencer**. Pantalla LED gigante y DJ todo el día para que vibres al ritmo del evento.',
    image: "/Tarima_Principal.png",
    details: ['**Pantalla LED gigante**', '**DJ en vivo** toda la jornada', '**Premiación Mascota Influencer**', '**Sorpresas y momentos** inolvidables'],
    x: 38,
    y: 70,
    cta: {
      label: 'Ver agenda completa',
      href: '#agenda'
    }
  }];
  return <section id="recinto" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-4">
            {['Conoce', 'el', 'recinto'].map((word, i) => <motion.span key={i} initial={{
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
        }} className="text-xl text-brand-cyan font-bold">
            Parque del Bienestar COMFAMA · Llanogrande
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Interactive Map Area */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="w-full lg:w-2/3 bg-gray-50 rounded-3xl p-0 border border-gray-200 shadow-inner relative aspect-[8/9] sm:aspect-[4/5] lg:aspect-[8/9] overflow-hidden">
            {/* Satellite Map Background — vertical format optimized for mobile */}
            <img src="/Sin_titulo_(1920_x_2160_px).png" alt="Mapa satelital del Parque COMFAMA - Llanogrande" className="absolute inset-0 w-full h-full object-contain bg-gray-100" />
            {/* Subtle dark overlay for better icon contrast */}
            <div className="absolute inset-0 bg-brand-navy/20 pointer-events-none"></div>

            {/* Interactive Zones */}
            {zones.map((zone) => <button key={zone.id} onClick={() => setActiveZone(zone)} className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${activeZone?.id === zone.id ? 'scale-150 z-30' : 'z-10 hover:scale-150 hover:z-20'}`} style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`
          }}>
                <div className="relative">
                  {/* Pulse effect for active */}
                  {activeZone?.id === zone.id && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{
                backgroundColor: zone.color
              }}></div>}

                  {/* Marker Pin with glow — smaller default, grows on hover */}
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white relative z-10 transition-all duration-300 group-hover:shadow-[0_0_18px_4px_rgba(0,188,212,0.45)]" style={{
                backgroundColor: zone.color,
                boxShadow: activeZone?.id === zone.id ? `0 0 20px 6px ${zone.color}80` : undefined
              }}>
                    <zone.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>

                  {/* Label (hidden on mobile unless active, visible on desktop hover) */}
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-sm font-bold text-brand-navy border border-gray-100 transition-opacity duration-200 ${activeZone?.id === zone.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hidden md:block'}`}>
                    {zone.name}
                  </div>
                </div>
              </button>)}

            {/* Static instruction at bottom center */}
            {!activeZone && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 pointer-events-none">
                <p className="text-brand-navy font-semibold text-xs">
                  Toca un ícono para ver detalles
                </p>
              </div>}
          </motion.div>

          {/* Info Panel Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col">
            <AnimatePresence mode="wait">
              {activeZone ? <motion.div key={activeZone.id} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }} className="bg-white rounded-3xl border border-gray-100 shadow-xl h-full relative overflow-hidden flex flex-col">
                  {/* Hero image header (if available) */}
                  {activeZone.image ? <div className="relative w-full h-64 flex-shrink-0">
                      <img src={activeZone.image} alt={activeZone.name} className="w-full h-full object-cover" />
                      {/* Top: subtle dark gradient for close button readability */}
                      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                      {/* Bottom: fade INTO white so photo blends with content */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />

                      {/* Close button */}
                      <button onClick={() => setActiveZone(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-brand-navy transition-colors flex items-center justify-center shadow-md z-20" aria-label="Cerrar">
                        <X className="w-5 h-5" />
                      </button>

                      {/* Floating icon — 50/50 over image edge, brought to front */}
                      <div className="absolute -bottom-9 left-6 rounded-2xl flex items-center justify-center z-30" style={{
                  backgroundColor: activeZone.color,
                  width: '4.5rem',
                  height: '4.5rem',
                  boxShadow: `0 0 32px 10px ${activeZone.color}55, 0 12px 24px rgba(0,0,0,0.22)`
                }}>
                        <activeZone.icon className="w-9 h-9 text-white" />
                      </div>
                    </div> /* No-image header (parking zones, etc.) */ : <div className="relative w-full h-44 flex-shrink-0 flex items-center justify-center" style={{
                backgroundColor: `${activeZone.color}15`
              }}>
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{
                  backgroundColor: activeZone.color,
                  boxShadow: `0 0 32px 10px ${activeZone.color}55, 0 10px 22px rgba(0,0,0,0.2)`
                }}>
                        <activeZone.icon className="w-10 h-10 text-white" />
                      </div>
                      <button onClick={() => setActiveZone(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-brand-navy transition-colors flex items-center justify-center shadow-md" aria-label="Cerrar">
                        <X className="w-5 h-5" />
                      </button>
                    </div>}

                  {/* Content area — compact, text pushed below floating icon */}
                  <div className={`flex-1 overflow-y-auto px-5 pb-5 ${activeZone.image ? 'pt-12' : 'pt-4'}`}>
                    {/* Title */}
                    <h3 className="text-lg font-bold text-brand-navy mb-1.5 leading-tight">
                      {activeZone.name}
                    </h3>

                    {/* Tagline pill with mixed bold */}
                    {activeZone.tagline && <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium mb-3 border" style={{
                  backgroundColor: `${activeZone.color}15`,
                  color: activeZone.color,
                  borderColor: `${activeZone.color}40`
                }}>
                        {renderBold(activeZone.tagline)}
                      </div>}

                    {/* Description with bold accents */}
                    <p className="text-gray-600 mb-4 leading-relaxed text-xs">
                      {renderBold(activeZone.description)}
                    </p>

                    {/* Details bullets with CheckCircle icons */}
                    <h4 className="font-extrabold text-xs text-brand-navy uppercase tracking-wider mb-3">
                      ¿Qué encontrarás aquí?
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {activeZone.details.map((detail, idx) => <li key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{
                      color: activeZone.color
                    }} strokeWidth={2.5} />
                          <span className="text-gray-700 leading-snug">
                            {renderBold(detail)}
                          </span>
                        </li>)}
                    </ul>
                  </div>

                  {/* Sticky CTA at bottom */}
                  {activeZone.cta && <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-white flex-shrink-0">
                      {activeZone.cta.isRoute ? <Link to={activeZone.cta.href} className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full font-bold text-white text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" style={{
                  backgroundColor: activeZone.color
                }}>
                          {activeZone.cta.label} →
                        </Link> : <a href={activeZone.cta.href} onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector(activeZone.cta!.href);
                  if (el) {
                    el.scrollIntoView({
                      behavior: 'smooth'
                    });
                  }
                }} className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full font-bold text-white text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" style={{
                  backgroundColor: activeZone.color
                }}>
                          {activeZone.cta.label} →
                        </a>}
                    </div>}
                </motion.div> : <motion.div key="empty" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl h-full flex flex-col">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center mb-4">
                      <Map className="w-7 h-7 text-brand-cyan" />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-navy mb-2">
                      Parque del Bienestar
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      12 puntos clave organizados en 7 zonas temáticas para que
                      disfrutes del deporte, la cultura y la diversión en
                      familia con tus mascotas.
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <span className="text-2xl font-bold text-brand-navy">
                        7
                      </span>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                        Zonas
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <span className="text-2xl font-bold text-brand-cyan">
                        6
                      </span>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                        Canchas
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <span className="text-2xl font-bold text-brand-yellow">
                        320
                      </span>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                        Parking
                      </p>
                    </div>
                  </div>

                  {/* Guía del Recinto — numbered legend */}
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">
                    Guía del recinto
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {[{
                  nums: ['1'],
                  title: 'Ingreso al Parque',
                  color: '#0D1B6E'
                }, {
                  nums: ['2', '3'],
                  title: 'Parqueaderos',
                  subtitle: '170 gratis · 150 pagos (La Jacinta)',
                  color: '#9CA3AF'
                }, {
                  nums: ['4', '5', '6'],
                  title: 'Zonas Deportivas',
                  subtitle: 'Fútbol ×3 · Tenis ×1 · Pádel ×2',
                  color: '#0D1B6E'
                }, {
                  nums: ['7'],
                  title: 'Zona Recreativa',
                  subtitle: 'Niños & Mascotas',
                  color: '#00BCD4'
                }, {
                  nums: ['8', '9'],
                  title: 'Zona Educativa',
                  subtitle: 'Salón ×100 · Salón ×30',
                  color: '#FFB300'
                }, {
                  nums: ['10', '11'],
                  title: 'Zona Compras',
                  subtitle: 'Comercial & Gastronómica',
                  color: '#00BCD4'
                }, {
                  nums: ['12'],
                  title: 'Zona Cultural',
                  subtitle: 'Tarima · Salida/Llegada Caminata',
                  color: '#4CAF50'
                }].map((group, idx) => <li key={idx} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-b-0">
                        <div className="flex gap-1 flex-shrink-0 pt-0.5">
                          {group.nums.map((n) => <span key={n} className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white" style={{
                      backgroundColor: group.color
                    }}>
                              {n}
                            </span>)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-navy text-sm leading-tight">
                            {group.title}
                          </p>
                          {group.subtitle && <p className="text-gray-500 text-[11px] leading-snug mt-0.5">
                              {group.subtitle}
                            </p>}
                        </div>
                      </li>)}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-gray-400 text-xs text-center mb-3">
                      Haz clic en un ícono del mapa para ver el detalle
                    </p>
                    <Link to="/caminata-5k" className="block w-full py-3 px-6 bg-brand-cyan hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-md text-center">
                      Inscríbete a la Caminata Canina →
                    </Link>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>

        {/* Sponsor Legend */}
        
      </div>
    </section>;
}