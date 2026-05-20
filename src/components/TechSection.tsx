import React from 'react';
import { motion } from 'framer-motion';
import { User, QrCode, Award, Trophy, MessageCircle, Mail } from 'lucide-react';
export function TechSection() {
  const features = [{
    title: 'Perfil Digital Único',
    desc: 'Al registrarte, tu mascota recibe una identidad digital con foto, nombre, raza, historia y código QR único.',
    icon: User
  }, {
    title: 'Check-in con QR',
    desc: 'El día del evento tu QR es tu llave de entrada. Sin filas, sin papeles, 100% ecológico.',
    icon: QrCode
  }, {
    title: 'Certificado Automático',
    desc: 'Al cruzar la meta de la Caminata recibes instantáneamente tu certificado personalizado con tiempo y ranking.',
    icon: Award
  }, {
    title: 'Rankings en Tiempo Real',
    desc: 'Sigue el concurso Mascota Influencer y los torneos deportivos en vivo desde la plataforma.',
    icon: Trophy
  }, {
    title: 'Chatbot Inteligente 24/7',
    desc: 'Atención automatizada en web y WhatsApp. Resuelve dudas sobre horarios, parqueaderos y más.',
    icon: MessageCircle
  }, {
    title: 'Automatización CRM',
    desc: 'Confirmaciones por email/WhatsApp, recordatorios previos y seguimiento post-evento con galería.',
    icon: Mail
  }];
  return <section id="tecnologia" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative tech lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
      backgroundImage: 'linear-gradient(#0D1B6E 1px, transparent 1px), linear-gradient(90deg, #0D1B6E 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-brand-navy mb-4">
            {['Una', 'experiencia', 'digital', 'sin', 'precedentes'].map((word, i) => <motion.span key={i} initial={{
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
          delay: 0.2
        }} className="text-xl text-brand-cyan font-bold">
            Powered by NOVOeia, ecosistema tecnológico para comunidades con
            propósito
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl mx-auto">
          {features.map((feat, idx) => <motion.div key={idx} initial={{
          opacity: 0,
          x: idx % 2 === 0 ? -30 : 30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: idx * 0.1
        }} className="flex gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-brand-navy flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors duration-300 shadow-lg">
                <feat.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2 group-hover:text-brand-cyan transition-colors">
                  {feat.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
}