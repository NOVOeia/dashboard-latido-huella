import React, { Component } from 'react';
import { PawPrint } from 'lucide-react';
export function WhatsAppButton() {
  const message = encodeURIComponent('¡Hola! Quiero más información sobre el evento Latido & Huella.');
  return <a href={`https://wa.me/573166918858?text=${message}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 group" aria-label="Contactar por WhatsApp">
      {/* Outer pulse ring */}
      <div className="absolute inset-[-6px] rounded-full bg-brand-cyan/30 animate-ping"></div>

      {/* Second subtle pulse */}
      <div className="absolute inset-[-3px] rounded-full bg-brand-cyan/20 animate-pulse"></div>

      {/* Main button */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-brand-cyan to-brand-navy rounded-full shadow-[0_4px_20px_rgba(0,188,212,0.5)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_30px_rgba(0,188,212,0.7)] border-2 border-white/20">
        {/* Paw print icon */}
        <PawPrint className="w-7 h-7 text-white drop-shadow-md" strokeWidth={2.5} />

        {/* Small WhatsApp badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 0 1-4.11-1.14l-.29-.174-3.01.79.8-2.93-.19-.3A7.96 7.96 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-brand-navy px-5 py-3 rounded-2xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-gray-100">
        <div className="flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-brand-cyan" />
          <span>¿Tienes dudas? ¡Escríbenos!</span>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-3 h-3 bg-white border-r border-t border-gray-100"></div>
      </div>
    </a>;
}