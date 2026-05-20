import React, { useState, Children } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Ticket } from 'lucide-react';
export function TicketsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = ['Pet Lover', 'Deportista', 'Mascota Extra'];
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };
  return (
    <section
      id="tiquetes"
      className="py-24 bg-gradient-to-b from-brand-navy to-[#0A155A] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-paw-pattern-white opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            {['CAMINATA', '-', 'ELIJE', 'COMO', 'PARTICIPAR'].map((word, i) =>
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
              className="inline-block shimmer-text-white mr-3">
              
                {word}
              </motion.span>
            )}
          </h2>
          <motion.div
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
              duration: 0.6,
              delay: 0.2
            }}
            className="inline-block bg-brand-green/20 border border-brand-green/50 text-brand-green px-6 py-2 rounded-full font-bold text-sm md:text-base">
            
            La Feria Bazar Deportiva tiene entrada GRATUITA para todas las
            edades
          </motion.div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden mb-6 max-w-md mx-auto">
          {/* Hint */}
          <motion.p
            initial={{
              opacity: 0,
              y: -5
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="text-center text-brand-cyan text-xs font-semibold mb-2 flex items-center justify-center gap-1.5">
            
            <span className="inline-block animate-bounce">👇</span>
            Toca para ver cada opción
          </motion.p>
          {/* Tab container with pulsing glow */}
          <motion.div
            animate={{
              boxShadow: [
              '0 0 0 0 rgba(0, 188, 212, 0)',
              '0 0 24px 4px rgba(0, 188, 212, 0.35)',
              '0 0 0 0 rgba(0, 188, 212, 0)']

            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-brand-cyan/40">
            
            {tabLabels.map((label, i) =>
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={`relative flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all overflow-hidden ${activeTab === i ? 'bg-brand-cyan text-white shadow-lg' : 'text-white/80'}`}>
              
                <span className="relative z-10">{label}</span>
                {activeTab === i &&
              <motion.span
                initial={{
                  x: '-120%'
                }}
                animate={{
                  x: '120%'
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatDelay: 2.2,
                  ease: 'easeInOut'
                }}
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none" />

              }
              </button>
            )}
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: '-50px'
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Pack Pet Lover */}
          <motion.div
            variants={cardVariants}
            className={`bg-white rounded-3xl p-8 shadow-2xl border-2 border-brand-cyan relative overflow-hidden flex-col h-full ${activeTab !== 0 ? 'hidden md:flex' : 'flex'}`}>
            
            <div className="absolute top-0 right-0 bg-brand-cyan text-white px-6 py-2 rounded-bl-3xl font-bold text-sm">
              MÁS POPULAR
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy">
                  Pack Pet Lover
                </h3>
                <p className="text-gray-500 font-semibold">
                  1 persona + 1 mascota
                </p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl md:text-5xl font-bold text-brand-navy">
                $140.000
              </span>
              <span className="text-gray-500 font-semibold"> COP</span>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {[
              'Kit de bienvenida personalizado',
              'Número de participante oficial',
              'Perfil digital mascota-humano con QR',
              'Certificado digital al finalizar',
              'Acceso completo a la feria',
              'Participación en concurso Mascota Influencer'].
              map((item, i) =>
              <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-brand-cyan/20 p-1 rounded-full text-brand-cyan flex-shrink-0">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-semibold">{item}</span>
                </li>
              )}
            </ul>

            <Link
              to="/caminata-5k"
              className="w-full block text-center bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-1">
              
              Comprar tiquete Pet Lover
            </Link>
          </motion.div>

          {/* Pack Deportista */}
          <motion.div
            variants={cardVariants}
            className={`bg-white rounded-3xl p-8 shadow-xl border border-gray-200 relative overflow-hidden flex-col h-full ${activeTab !== 1 ? 'hidden md:flex' : 'flex'}`}>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy">
                  Pack Deportista
                </h3>
                <p className="text-gray-500 font-semibold">
                  1 persona sin mascota
                </p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl md:text-5xl font-bold text-brand-navy">
                $100.000
              </span>
              <span className="text-gray-500 font-semibold"> COP</span>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {[
              'Kit de bienvenida',
              'Número de participante oficial',
              'Perfil digital con QR',
              'Certificado digital al finalizar',
              'Acceso completo a la feria'].
              map((item, i) =>
              <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-gray-200 p-1 rounded-full text-gray-600 flex-shrink-0">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-semibold">{item}</span>
                </li>
              )}
            </ul>

            <Link
              to="/caminata-5k"
              className="w-full block text-center bg-brand-navy hover:bg-[#1a2a8a] text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1">
              
              Comprar tiquete Deportista
            </Link>
          </motion.div>

          {/* Pack Mascota Extra */}
          <motion.div
            variants={cardVariants}
            className={`bg-white rounded-3xl p-8 shadow-xl border border-gray-200 relative overflow-hidden flex-col h-full ${activeTab !== 2 ? 'hidden md:flex' : 'flex'}`}>
            
            <div className="absolute top-0 right-0 bg-brand-yellow text-brand-navy px-6 py-2 rounded-bl-3xl font-bold text-sm">
              ADICIONAL
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-brand-yellow">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy">
                  Pack Mascota Extra
                </h3>
                <p className="text-gray-500 font-semibold">
                  Para 1 mascota extra
                </p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl md:text-5xl font-bold text-brand-navy">
                $40.000
              </span>
              <span className="text-gray-500 font-semibold"> COP</span>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {[
              'Kit de bienvenida',
              'Número de participante oficial',
              'Perfil digital con QR',
              'Certificado digital al finalizar',
              'Acceso completo a la feria'].
              map((item, i) =>
              <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-brand-yellow/20 p-1 rounded-full text-brand-yellow flex-shrink-0">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-semibold">{item}</span>
                </li>
              )}
            </ul>

            <Link
              to="/caminata-5k"
              className="w-full block text-center bg-brand-yellow hover:bg-amber-500 text-brand-navy py-4 rounded-full font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1">
              
              Compra tiquete mascota individual
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{
            opacity: 0
          }}
          whileInView={{
            opacity: 1
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.6,
            delay: 0.6
          }}
          className="text-center text-white/60 mt-8 max-w-2xl mx-auto text-sm md:text-base px-4">
          
          Serás redirigido a nuestra plataforma segura de pagos para completar
          tu registro.
        </motion.p>
      </div>
    </section>);

}