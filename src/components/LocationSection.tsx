import React, { lazy } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Car, Calendar, ExternalLink } from 'lucide-react';
export function LocationSection() {
  return <section id="ubicacion" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-4">
            {['¿Cómo', 'llegar?'].map((word, i) => <motion.span key={i} initial={{
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map Column */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[400px] lg:h-[500px] relative group">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.862340321262!2d-75.43188868466548!3d6.086100095593175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4698888888888b%3A0x8888888888888888!2sComfama%20Parque%20Recreativo%20Llanogrande!5e0!3m2!1ses!2sco!4v1620000000000!5m2!1ses!2sco" width="100%" height="100%" style={{
            border: 0
          }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="grayscale-[20%] contrast-125"></iframe>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-max">
              <a href="https://maps.google.com/?q=6.0861,-75.4297" target="_blank" rel="noopener noreferrer" className="bg-brand-navy text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-brand-cyan transition-colors">
                <ExternalLink className="w-4 h-4" />
                Abrir en Google Maps
              </a>
            </div>
          </motion.div>

          {/* Info Column */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-brand-cyan/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-6 h-6 text-brand-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">
                  Dirección
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Parque del Bienestar COMFAMA
                  <br />
                  Milla de Oro, Llanogrande, Km 8.5
                  <br />
                  Diagonal al Mall Llanogrande
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-brand-cyan/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Car className="w-6 h-6 text-brand-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">
                  Parqueaderos
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-green mt-2"></div>
                    <p className="text-gray-600">
                      <strong className="text-gray-800 font-semibold">
                        Parque COMFAMA:
                      </strong>{' '}
                      170 cupos gratuitos (limitados, llega temprano)
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-yellow mt-2"></div>
                    <p className="text-gray-600">
                      <strong className="text-gray-800 font-semibold">
                        Parqueadero La Jacinta:
                      </strong>{' '}
                      150 cupos, tarifa $20.000 por día
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-brand-cyan/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar className="w-6 h-6 text-brand-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">
                  Entrega de Kits
                </h3>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-gray-800 font-semibold mb-1">
                    Sábado 25 de julio
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    Medellín: 12:00 m - 8:00 pm
                    <br />
                    Llanogrande: 8:00 am - 5:00 pm
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-brand-green/10 rounded-2xl border border-brand-green/20 flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10" />
              <div>
                <p className="text-brand-navy font-semibold mb-1">
                  ¿Tienes dudas sobre cómo llegar?
                </p>
                <a href="https://wa.me/573166918858" target="_blank" rel="noopener noreferrer" className="text-brand-green font-bold hover:underline">
                  Pregúntale a nuestro asistente 24/7 →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}