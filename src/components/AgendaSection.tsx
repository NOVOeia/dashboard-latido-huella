import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Activity } from 'lucide-react';
export function AgendaSection() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section id="agenda" className="py-24 bg-gray-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-4">
            {['¿Qué', 'vas', 'a', 'vivir', 'el', '26', 'de', 'julio?'].map((word, i) => <motion.span key={i} initial={{
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
          <motion.div initial={{
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
        }} className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 text-base md:text-xl text-brand-cyan font-bold px-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span>26 de julio de 2026</span>
            </div>
            <span className="hidden md:inline text-gray-300 mx-2">|</span>
            <div className="flex items-center gap-2 text-center">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span>Parque del Bienestar COMFAMA Llanogrande</span>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:-translate-x-1/2 rounded-full"></div>

          {/* Timeline Item 1: Pre-event */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-50px'
        }} transition={{
          duration: 0.6
        }} className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-20">
            <div className="md:w-5/12 order-2 md:order-1 pl-12 md:pl-0 md:text-right mt-4 md:mt-0">
              <h3 className="text-2xl font-bold text-brand-navy mb-2">
                PRE-EVENTO
              </h3>
              <p className="text-brand-cyan font-semibold mb-3">
                Sábado 25 de julio
              </p>
              <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 inline-block text-left md:text-right w-full">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center md:justify-end gap-2">
                  <Ticket className="w-5 h-5 text-brand-yellow" />
                  Entrega de Kits
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  MEDELLIN: Sabado 12:00 m - 8:00 pm
                </p>
                <p className="text-sm text-gray-600">
                  LLANOGRANDE: Sábado 8:00 am - 5:00 pm
                </p>
              </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-brand-yellow rounded-full border-4 border-white shadow-md transform -translate-x-1/2 flex items-center justify-center z-10 order-1 md:order-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            <div className="md:w-5/12 order-3 hidden md:block"></div>
          </motion.div>

          {/* Timeline Item 2: 5K Walk */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-50px'
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-20">
            <div className="md:w-5/12 order-2 md:order-3 pl-12 md:pl-0 mt-4 md:mt-0">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-brand-cyan" />
                <h3 className="text-2xl font-bold text-brand-navy">7:00 AM</h3>
              </div>
              <p className="text-brand-cyan font-semibold mb-3 text-xl">
                Caminata Canina Pet Lovers
              </p>
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-brand-cyan w-full">
                <p className="text-gray-600 mb-4">
                  Salida desde el Parque del Bienestar de COMFAMA Llanogrande,
                  por la Vereda 3 Puertas, vía Linares y Vereda Villachiquaga
                  hasta regresar al parque y disfrutar de muchas actividades
                  para toda la familia y mascotas.
                </p>
                <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm font-medium text-gray-700">
                      1 Persona + 1 Mascota
                    </span>
                    <span className="font-bold text-brand-navy">$140.000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 pt-2">
                    <span className="text-sm font-medium text-gray-700">
                      1 Persona (Sin mascota)
                    </span>
                    <span className="font-bold text-brand-navy">$100.000</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Mascota adicional
                    </span>
                    <span className="font-bold text-brand-navy">$40.000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-4 md:left-1/2 w-10 h-10 bg-brand-cyan rounded-full border-4 border-white shadow-md transform -translate-x-1/2 flex items-center justify-center z-10 order-1 md:order-2">
              <Activity className="w-4 h-4 text-white" />
            </div>

            <div className="md:w-5/12 order-3 md:order-1 hidden md:block"></div>
          </motion.div>

          {/* Timeline Item 3: Sports Fair */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-50px'
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div className="md:w-5/12 order-2 md:order-1 pl-12 md:pl-0 md:text-right mt-4 md:mt-0">
              <div className="flex items-center md:justify-end gap-2 mb-2">
                <h3 className="text-2xl font-bold text-brand-navy">
                  8:00 AM - 5:00 PM
                </h3>
                <Clock className="w-6 h-6 text-brand-green hidden md:block" />
              </div>
              <p className="text-brand-green font-semibold mb-3 text-xl md:text-2xl">
                Feria Bazar
              </p>
              <div className="bg-white p-6 rounded-2xl shadow-lg border-r-4 border-brand-green w-full text-left md:text-right">
                <div className="inline-block bg-brand-green px-3 py-1 rounded-full mb-4 uppercase tracking-wide text-xs md:text-base font-bold text-[#FFFFFF]">
                  Entrada Gratuita
                </div>
                <p className="text-gray-600 mb-4">
                  Para todas las edades. Un día entero de diversión, deporte y
                  conexión.
                </p>
                <ul className="text-sm text-gray-700 space-y-2 inline-block text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>{' '}
                    Fútbol, Tenis y Pádel
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>{' '}
                    Charlas informativas y practicas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>{' '}
                    Zona de entretenimiento para mascotas y niños
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>{' '}
                    Música en vivo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>{' '}
                    Gastronomía y comercio
                  </li>
                </ul>
              </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-4 md:left-1/2 w-10 h-10 bg-brand-green rounded-full border-4 border-white shadow-md transform -translate-x-1/2 flex items-center justify-center z-10 order-1 md:order-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>

            <div className="md:w-5/12 order-3 hidden md:block"></div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        delay: 0.6
      }} className="text-center mt-16">
          <a href="#tiquetes" onClick={(e) => scrollToSection(e, '#tiquetes')} className="inline-flex items-center justify-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-10 py-5 rounded-full font-bold text-xl transition-all shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-1">
            Conoce mas detalles
          </a>
        </motion.div>
      </div>
    </section>;
}