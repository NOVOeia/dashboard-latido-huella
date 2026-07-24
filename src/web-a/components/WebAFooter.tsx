import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Heart } from 'lucide-react';

export function WebAFooter() {
  return <footer className="bg-[#07104a] text-white">
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
      <div><img src="/Logo_latido_y_huella_en_blanco.png" className="h-16 w-auto" alt="Latido y Huella"/><p className="mt-4 max-w-sm text-sm leading-7 text-white/70">Una comunidad que conecta personas, mascotas y marcas para convertir el amor en acción.</p></div>
      <div><h3 className="text-lg">Explora</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/70"><Link to="/movimiento/lo-que-vivimos">Lo que vivimos</Link><Link to="/movimiento/galeria">Galería</Link><Link to="/muro">Muro de Huellas</Link><Link to="/deja-tu-huella">Sube tus fotos</Link></div></div>
      <div><h3 className="text-lg">Conecta</h3><div className="mt-4 flex gap-3"><a className="rounded-full bg-white/10 p-3" href="#"><Instagram size={20}/></a><a className="rounded-full bg-white/10 p-3" href="mailto:info@latidoyhuella.co"><Mail size={20}/></a></div><p className="mt-5 flex items-center gap-2 text-sm text-white/60"><Heart size={16}/> El movimiento continúa.</p></div>
    </div>
    <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/50">© 2026 Latido y Huella. Todos los derechos reservados.</div>
  </footer>
}
