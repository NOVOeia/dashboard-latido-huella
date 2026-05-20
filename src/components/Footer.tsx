import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const handleNavClick = (
  e: React.MouseEvent<HTMLAnchorElement>,
  hash: string) =>
  {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    } else {
      navigate('/' + hash);
    }
  };
  return (
    <footer className="bg-brand-navy pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-paw-pattern-white opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link to="/" className="inline-block">
            <img
              src="/Logo_latido_y_huella_en_blanco.png"
              alt="Latido & Huella"
              className="h-16 md:h-20 object-contain" />
            
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
          {[
          {
            name: 'Inicio',
            href: '#inicio'
          },
          {
            name: 'El Movimiento',
            href: '#movimiento'
          },
          {
            name: 'Orden del día',
            href: '#agenda'
          },
          {
            name: 'Boletos',
            href: '#tiquetes'
          },
          {
            name: 'Patrocinadores',
            href: '#patrocinadores'
          },
          {
            name: 'Contacto',
            href: '#contacto'
          }].
          map((link) =>
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-white/60 hover:text-brand-cyan text-sm transition-colors cursor-pointer">
            
              {link.name}
            </a>
          )}
        </div>

        {/* Legal & Utility Links */}
        <div className="flex flex-wrap justify-center items-center mb-8 gap-[10px]">
          <Link
            to="/terminos"
            className="text-white/40 hover:text-brand-cyan text-xs transition-colors">
            
            Términos y Condiciones
          </Link>
          <span className="text-white/20 text-xs">•</span>
          <Link
            to="/terminos#datos"
            className="text-white/40 hover:text-brand-cyan text-xs transition-colors">
            
            Habeas Data
          </Link>
          <span className="text-white/20 text-xs">•</span>
          <a
            href="#contacto"
            onClick={(e) => handleNavClick(e, '#contacto')}
            className="text-white/40 hover:text-brand-cyan text-xs transition-colors cursor-pointer">
            
            Comentarios
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-10">
          <a
            href="https://www.instagram.com/latidoyhuella"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/10 hover:bg-brand-cyan rounded-full flex items-center justify-center transition-colors text-white"
            aria-label="Instagram">
            
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/latidoyhuella"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/10 hover:bg-brand-cyan rounded-full flex items-center justify-center transition-colors text-white"
            aria-label="Facebook">
            
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://www.tiktok.com/@latidoyhuella"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/10 hover:bg-brand-cyan rounded-full flex items-center justify-center transition-colors text-white"
            aria-label="TikTok">
            
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 mb-8"></div>

        {/* Partner Logos */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-8">
          <div className="text-white/50 text-xs uppercase tracking-widest">
            Organizado por
          </div>
          <img
            src="/logo-Diverxo.svg"
            alt="Diverxo"
            className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
            window.dispatchEvent(new CustomEvent('open-diverxo-modal'))
            } />
          
          <div className="hidden sm:block w-px h-6 bg-white/20"></div>
          <div className="text-white/50 text-xs uppercase tracking-widest">
            Apoya
          </div>
          <img
            src="/logo_comfama-Photoroom.png"
            alt="COMFAMA"
            className="h-8 object-contain" />
          
          <div className="hidden sm:block w-px h-6 bg-white/20"></div>
          <div className="text-white/50 text-xs uppercase tracking-widest">
            Powered by
          </div>
          <img
            src="/Logo_Novo3d_trans.png"
            alt="NOVOeia"
            className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
            window.dispatchEvent(new CustomEvent('open-novoeia-modal'))
            } />
          
        </div>

        {/* Closing Phrase */}
        <div className="text-center mb-8"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Latido & Huella — Diverxo Eventos
            Corporativos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>);

}