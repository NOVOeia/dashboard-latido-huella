import React from 'react';
/**
 * Blue bar with event organizers: Diverxo · COMFAMA · NOVOeia.
 * Shared between the Hero (bottom) and the start of "Conoce todo el evento"
 * (top of ActivitiesSection). Single source of truth — edit logos / labels here.
 */
export function OrganizersBar() {
  return (
    <div className="bg-brand-navy/80 backdrop-blur-md border-t border-white/10 py-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-12 text-xs sm:text-sm text-white/70 font-medium">
        <div className="flex items-center gap-2">
          <span>Organizado por</span>
          <img
            src="/logo-Diverxo.svg"
            alt="Diverxo"
            className="h-5 sm:h-6 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
            window.dispatchEvent(new CustomEvent('open-diverxo-modal'))
            } />
          
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30"></div>
        <div className="flex items-center gap-2">
          <span>Apoya</span>
          <img
            src="/logo_comfama-Photoroom.png"
            alt="COMFAMA"
            className="h-5 sm:h-6 object-contain" />
          
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30"></div>
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <img
            src="/Logo_Novo3d_trans.png"
            alt="NOVOeia"
            className="h-6 sm:h-7 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
            window.dispatchEvent(new CustomEvent('open-novoeia-modal'))
            } />
          
        </div>
      </div>
    </div>);

}