import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';

const links = [
  ['Inicio', '/movimiento'],
  ['Lo que vivimos', '/movimiento/lo-que-vivimos'],
  ['Galería', '/movimiento/galeria'],
  ['Muro de Huellas', '/muro'],
  ['Aliados', '/movimiento/aliados'],
];

export function WebANavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#09145b]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/movimiento" className="flex items-center gap-3">
          <img src="/Logo_latido_y_huella_en_blanco.png" alt="Latido y Huella" className="h-12 w-auto" />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <NavLink key={label} to={href} className={({isActive}) => `text-sm font-semibold transition ${isActive ? 'text-cyan-300' : 'text-white/85 hover:text-cyan-300'}`}>{label}</NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/80 hover:text-white transition">
            <LayoutDashboard size={15}/> Panel
          </Link>
          <Link to="/deja-tu-huella" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-[#09145b] shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">Deja tu huella</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-xl p-2 text-white lg:hidden" aria-label="Menú">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#09145b] px-4 py-5 lg:hidden">
          <div className="flex flex-col gap-4">
            {links.map(([label, href]) => (
              <NavLink key={label} to={href} onClick={() => setOpen(false)} className="font-semibold text-white">{label}</NavLink>
            ))}
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 font-semibold text-white/70">
              <LayoutDashboard size={15}/> Panel de administración
            </Link>
            <Link to="/deja-tu-huella" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-cyan-400 px-5 py-3 text-center font-bold text-[#09145b]">Deja tu huella</Link>
          </div>
        </div>
      )}
    </header>
  )
}