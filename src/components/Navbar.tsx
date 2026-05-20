import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Heart,
  Calendar,
  Footprints,
  Trophy,
  Store,
  Star,
  Mail,
  PawPrint,
  Route } from
'lucide-react';
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Scroll to top when navigating to a new page
  useEffect(() => {
    if (!isHome) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [location.pathname]);
  // When landing on home with a hash (e.g. /#recorrido), scroll to that section
  useEffect(() => {
    if (isHome && location.hash) {
      // Wait for sections to mount before scrolling
      const id = location.hash.slice(1);
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth'
          });
        }
      };
      // Small delay to allow page render
      const timeout = setTimeout(tryScroll, 100);
      return () => clearTimeout(timeout);
    }
  }, [isHome, location.hash, location.pathname]);
  const navLinks = [
  {
    name: 'Inicio',
    href: '#inicio',
    type: 'scroll' as const,
    icon: Home
  },
  {
    name: 'El Movimiento',
    href: '#movimiento',
    type: 'scroll' as const,
    icon: Heart
  },
  {
    name: 'Agenda',
    href: '#agenda',
    type: 'scroll' as const,
    icon: Calendar
  },
  {
    name: 'El Recorrido',
    href: '#recorrido',
    type: 'scroll' as const,
    icon: Route
  },
  {
    name: 'Muro de Huellas',
    href: '#muro',
    type: 'scroll' as const,
    icon: PawPrint
  },
  {
    name: 'Registro Mascotas / Caminata',
    href: '/caminata-5k',
    type: 'route' as const,
    icon: Footprints
  },
  {
    name: 'Deportes',
    href: '/deportes',
    type: 'route' as const,
    icon: Trophy
  },
  {
    name: 'Expositores',
    href: '/expositores',
    type: 'route' as const,
    icon: Store
  },
  {
    name: 'Patrocinadores',
    href: '/patrocinadores',
    type: 'route' as const,
    icon: Star
  },
  {
    name: 'Contacto',
    href: '#contacto',
    type: 'scroll' as const,
    icon: Mail
  }];

  const handleNavClick = (
  e: React.MouseEvent<HTMLAnchorElement>,
  link: (typeof navLinks)[0]) =>
  {
    setIsMobileMenuOpen(false);
    if (link.type === 'scroll') {
      e.preventDefault();
      if (isHome) {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth'
          });
        }
      } else {
        navigate('/' + link.href);
      }
    }
    // For 'route' type, let the Link component handle it naturally
  };
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHome ? 'bg-brand-navy py-3 shadow-[0_4px_12px_rgba(0,0,0,0.25)]' : 'bg-transparent py-5'}`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                const hero = document.getElementById('inicio');
                if (hero) {
                  hero.scrollIntoView({
                    behavior: 'smooth'
                  });
                } else {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }
              setIsMobileMenuOpen(false);
            }}
            className="flex-shrink-0 z-50 cursor-pointer">
            
            <img
              src="/Logo_latido_y_huella_en_blanco.png"
              alt="Latido & Huella — Ir al inicio"
              className="h-10 md:h-12 object-contain" />
            
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <ul className="flex space-x-4">
              {navLinks.map((link) => {
                const isActive =
                link.type === 'route' && location.pathname === link.href;
                const Icon = link.icon;
                return (
                  <li key={link.name} className="relative group">
                    {link.type === 'route' ?
                    <Link
                      to={link.href}
                      className={`p-2.5 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-brand-cyan text-white' : 'text-white/80 hover:bg-white/10 hover:text-brand-cyan'}`}>
                      
                        <Icon size={24} strokeWidth={2.2} />
                      </Link> :

                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      className="p-2.5 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-brand-cyan transition-all duration-300">
                      
                        <Icon size={24} strokeWidth={2.2} />
                      </a>
                    }
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-white text-brand-navy text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg whitespace-nowrap pointer-events-none">
                      {link.name}
                      {/* Tooltip arrow */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                    </div>
                  </li>);

              })}
            </ul>
            <Link
              to="/caminata-5k"
              className="bg-brand-cyan hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition-colors shadow-md ml-2">
              
              Inscríbete
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-brand-cyan transition-colors focus:outline-none">
              
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 bg-brand-navy z-40 flex flex-col justify-center items-center transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}>
        
        <ul className="flex flex-col items-center space-y-6 w-full px-6">
          {navLinks.map((link) =>
          <li key={link.name} className="w-full text-center">
              {link.type === 'route' ?
            <Link
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-xl font-semibold transition-colors ${location.pathname === link.href ? 'text-brand-cyan' : 'text-white hover:text-brand-cyan'}`}>
              
                  {link.name}
                </Link> :

            <a
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="block text-white text-xl font-semibold hover:text-brand-cyan transition-colors">
              
                  {link.name}
                </a>
            }
            </li>
          )}
          <li className="w-full pt-6">
            <Link
              to="/caminata-5k"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center bg-brand-cyan hover:bg-blue-700 text-white px-6 py-4 rounded-full font-bold text-lg transition-colors shadow-md">
              
              Inscríbete
            </Link>
          </li>
        </ul>
      </div>
    </nav>);

}