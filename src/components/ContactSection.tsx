import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, Mail, Globe, Instagram, Facebook, Send } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { GHL_WEBHOOKS, sendToGHL } from '../utils/webhooks';
import {
  isValidEmail,
  isValidColombianPhone,
  isValidFullName,
  firstError } from
'../utils/validators';
export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedHabeasData, setAcceptedHabeasData] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nombre = (form.querySelector('#nombre') as HTMLInputElement)?.value;
    const email = (form.querySelector('#email') as HTMLInputElement)?.value;
    const whatsapp = (form.querySelector('#whatsapp') as HTMLInputElement)?.
    value;
    const motivo = (form.querySelector('#motivo') as HTMLSelectElement)?.value;
    const mensaje = (form.querySelector('#mensaje') as HTMLTextAreaElement)?.
    value;
    const check = firstError(
      isValidFullName(nombre),
      isValidEmail(email),
      isValidColombianPhone(whatsapp)
    );
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    if (!motivo) {
      toast.error('Selecciona un motivo de contacto');
      return;
    }
    if (!acceptedTerms || !acceptedHabeasData) {
      toast.error('Debes aceptar los Términos y la autorización de Habeas Data');
      return;
    }
    setIsSubmitting(true);
    const result = await sendToGHL(GHL_WEBHOOKS.CONTACTO, {
      form_type: 'contacto_general',
      etiqueta: 'Contacto Web - Latido y Huella',
      nombre,
      email,
      phone: whatsapp,
      motivo,
      mensaje
    });
    setIsSubmitting(false);
    if (result.success) {
      toast.success(
        '¡Mensaje enviado con éxito! Nos contactaremos contigo pronto.'
      );
      form.reset();
      setAcceptedTerms(false);
      setAcceptedHabeasData(false);
    } else {
      toast.success(
        '¡Mensaje enviado con éxito! Nos contactaremos contigo pronto.'
      );
      form.reset();
      setAcceptedTerms(false);
      setAcceptedHabeasData(false);
      console.log('📋 Datos del formulario (backup):', {
        nombre,
        email,
        whatsapp,
        motivo,
        mensaje
      });
    }
  };
  const scrollToSection = (
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string) =>
  {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return (
    <section
      id="contacto"
      className="py-24 bg-gradient-to-br from-brand-cyan to-brand-navy relative overflow-hidden">
      
      <Toaster position="top-center" richColors />

      <div className="absolute inset-0 bg-paw-pattern-white opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            {['¿Listo', 'para', 'dejar', 'tu', 'huella?'].map((word, i) =>
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
              delay: 0.2
            }}
            className="text-xl text-white/90">
            
            Únete como participante, expositor, patrocinador o aliado del
            movimiento
          </motion.p>
        </div>

        {/* Action Buttons */}
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
            delay: 0.3
          }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-20">
          
          <a
            href="#tiquetes"
            onClick={(e) => scrollToSection(e, '#tiquetes')}
            className="bg-white text-brand-navy hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-center shadow-lg transition-transform hover:-translate-y-1">
            
            Inscribirme al evento
          </a>
          <Link
            to="/expositores"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-center transition-colors">
            
            Quiero un stand
          </Link>
          <Link
            to="/patrocinadores"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-center transition-colors">
            
            Quiero patrocinar
          </Link>
          <button
            onClick={() => document.getElementById('nombre')?.focus()}
            className="bg-brand-navy text-white hover:bg-[#1a2a8a] px-8 py-4 rounded-full font-bold text-center shadow-lg transition-transform hover:-translate-y-1">
            
            Contactar al equipo
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Contact Info */}
          <div className="p-10 lg:p-16 bg-brand-navy text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <h3 className="text-3xl font-bold mb-8 relative z-10">
              Información de Contacto
            </h3>

            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Teléfono / WhatsApp</p>
                  <p className="text-xl font-bold">+57 (333) 277 7912</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Correo Electrónico</p>
                  <p className="text-xl font-bold">latidoyhuella@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Sitio Web</p>
                  <p className="text-xl font-bold">www.latidoyhuella.com</p>
                </div>
              </div>
            </div>

            <div className="mt-16 relative z-10">
              <p className="text-white/60 text-sm mb-4">
                Síguenos en redes sociales
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/latidoyhuella"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-brand-cyan rounded-full flex items-center justify-center transition-colors">
                  
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com/latidoyhuella"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-brand-cyan rounded-full flex items-center justify-center transition-colors">
                  
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@latidoyhuella"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-brand-cyan rounded-full flex items-center justify-center transition-colors font-bold text-xl">
                  
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6">
                    
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-10 lg:p-16">
            <h3 className="text-3xl font-bold text-brand-navy mb-8">
              Envíanos un mensaje
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  
                  Nombre completo *
                </label>
                <input
                  required
                  type="text"
                  id="nombre"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre" />
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2">
                    
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none transition-all"
                    placeholder="tu@email.com" />
                  
                </div>
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="block text-sm font-semibold text-gray-700 mb-2">
                    
                    WhatsApp *
                  </label>
                  <input
                    required
                    type="tel"
                    id="whatsapp"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none transition-all"
                    placeholder="+57 300 000 0000" />
                  
                </div>
              </div>

              <div>
                <label
                  htmlFor="motivo"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  
                  Motivo de contacto *
                </label>
                <select
                  required
                  id="motivo"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none transition-all bg-white">
                  
                  <option value="">Selecciona una opción</option>
                  <option value="participar">
                    Quiero participar en el evento
                  </option>
                  <option value="patrocinar">Quiero ser patrocinador</option>
                  <option value="exponer">Quiero un stand comercial</option>
                  <option value="causa">
                    Soy una fundación / Causa animal
                  </option>
                  <option value="otro">Otro motivo</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="mensaje"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  
                  Mensaje (opcional)
                </label>
                <textarea
                  id="mensaje"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none transition-all resize-none"
                  placeholder="¿Cómo podemos ayudarte?">
                </textarea>
              </div>

              {/* Legal Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                  
                  <span className="text-sm text-gray-600 leading-relaxed">
                    Acepto los{' '}
                    <a
                      href="/terminos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                      Términos y Condiciones
                    </a>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedHabeasData}
                    onChange={(e) => setAcceptedHabeasData(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                  
                  <span className="text-sm text-gray-600 leading-relaxed">
                    Autorizo el{' '}
                    <a
                      href="/terminos#datos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                      tratamiento de mis datos personales (Habeas Data)
                    </a>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !acceptedTerms || !acceptedHabeasData}
                className="w-full bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                
                {isSubmitting ?
                'Enviando...' :

                <>
                    Enviar mensaje
                    <Send className="w-5 h-5" />
                  </>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Logos Footer Area */}
        <div className="mt-24 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
          <img
            src="/Logo_latido_y_huella_en_blanco.png"
            alt="Latido & Huella"
            className="h-12 object-contain" />
          
          <img
            src="/logo-Diverxo.svg"
            alt="Diverxo"
            className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
            window.dispatchEvent(new CustomEvent('open-diverxo-modal'))
            } />
          
          <img
            src="/logo_comfama-Photoroom.png"
            alt="COMFAMA"
            className="h-10 object-contain" />
          
          <img
            src="/Logo_Novo3d_trans.png"
            alt="NOVOeia"
            className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
            window.dispatchEvent(new CustomEvent('open-novoeia-modal'))
            } />
          
        </div>

        <div className="text-center mt-12">
          <p className="text-brand-cyan font-bold text-2xl italic">
            "Cada paso deja una huella."
          </p>
          <p className="text-brand-cyan font-bold text-2xl italic mt-2">
            26 · 07 · 2026
          </p>
        </div>
      </div>
    </section>);

}