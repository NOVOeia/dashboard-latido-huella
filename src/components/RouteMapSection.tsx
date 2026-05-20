import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Droplets, Flag, Gift, ShieldCheck, Award } from 'lucide-react';
const MAP_IMAGE_URL = "/Mapa_Recorrido.png";

export function RouteMapSection() {
  return (
    <section id="recorrido" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-4">
            {['EL', 'RECORRIDO'].map((word, i) =>
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
            className="inline-flex items-center gap-3 bg-brand-navy/5 px-6 py-3 rounded-full">
            
            <span className="text-lg md:text-xl font-bold text-brand-navy uppercase tracking-wide">
              Caminata Canina
            </span>
            <span className="w-px h-5 bg-brand-navy/20"></span>
            <span className="text-2xl font-bold text-brand-navy">6,5</span>
            <span className="text-lg font-bold text-brand-cyan">
              KILÓMETROS
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar */}
          <motion.div
            initial={{
              opacity: 0,
              x: -30
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
            className="lg:col-span-1 space-y-6">
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-brand-navy mb-4 text-lg">
                Puntos Clave
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">
                    Salida (Parque COMFAMA)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">
                    Puntos de Hidratación
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow">
                    <Flag className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">
                    Meta (Parque COMFAMA)
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-brand-navy rounded-2xl p-6 text-center">
              <p className="text-white font-bold text-lg mb-2">
                Caminata Latido y Huella: Tu ruta de conexión.
              </p>
              <p className="text-white/70 text-sm mb-5">
                Prepárate para un recorrido diseñado para disfrutar paso a paso.
                No es una carrera, es una caminata pensada para que rompas la
                rutina y conectes con la naturaleza en compañía de tus mascotas
                y familia.
              </p>
              <Link
                to="/caminata-5k"
                className="inline-block w-full py-3.5 px-6 bg-brand-cyan hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5">
                
                Inscríbete a la Caminata →
              </Link>
            </div>
          </motion.div>

          {/* Map area — image shown COMPLETE, no overlay */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97
            }}
            whileInView={{
              opacity: 1,
              scale: 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.8
            }}
            className="lg:col-span-3 relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50">
            
            <img
              src={MAP_IMAGE_URL}
              alt="Mapa del recorrido 5K Latido & Huella en Llanogrande"
              className="block w-full h-auto select-none"
              draggable={false} />
            
          </motion.div>
        </div>

        {/* Benefits Card */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.7,
            delay: 0.3
          }}
          className="mt-12 bg-brand-navy rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute inset-0 bg-paw-pattern-white opacity-5 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              Durante el recorrido y con tu inscripción contarás con:
            </h3>
            <div className="w-16 h-1 bg-brand-cyan mx-auto rounded-full mb-10"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
              {
                icon: Gift,
                title: 'Kit de Participante',
                description: 'Obsequios especiales para humanos y mascotas.',
                color: 'bg-brand-yellow',
                textColor: 'text-brand-yellow'
              },
              {
                icon: Droplets,
                title: 'Zonas de Hidratación',
                description:
                'Puntos estratégicos para refrescarte a ti y a tus peludos.',
                color: 'bg-brand-cyan',
                textColor: 'text-brand-cyan'
              },
              {
                icon: ShieldCheck,
                title: 'Seguridad y Cuidado',
                description:
                'Acompañamiento médico y veterinario durante todo el trayecto.',
                color: 'bg-brand-green',
                textColor: 'text-brand-green'
              },
              {
                icon: Award,
                title: 'Certificado de Participación',
                description:
                'Reconocimiento digital por ser parte del movimiento.',
                color: 'bg-white',
                textColor: 'text-white'
              }].
              map((item, index) =>
              <motion.div
                key={index}
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
                  duration: 0.45,
                  delay: 0.4 + index * 0.08
                }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group">
                
                  <div
                  className={`w-12 h-12 ${item.color} bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  
                    <item.icon className={`w-6 h-6 ${item.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-base leading-tight mb-0.5">
                      {item.title}
                    </h4>
                    <p className="text-white/70 text-xs md:text-sm leading-snug">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/caminata-5k"
                className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-1">
                
                ¡Inscríbete y disfruta del Camino! →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}