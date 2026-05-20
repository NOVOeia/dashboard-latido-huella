import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Clock, MapPin, Plus, Minus, Baby, User, Crown } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { GHL_WEBHOOKS, sendToGHL } from '../utils/webhooks';
import { formatCOP, priceBreakdown } from '../utils/format';
type Sport = 'futbol' | 'padel';
type FutbolCategory = 'adultos' | 'ninos';
interface Captain {
  name: string;
  email: string;
  phone: string;
  cedula: string;
}
interface AdultoPlayer {
  name: string;
  cedula: string;
  age: string;
}
interface NinoPlayer {
  name: string;
  ti: string;
  age: string;
  responsableName: string;
  responsablePhone: string;
}
interface PadelPlayer {
  name: string;
  email: string;
  phone: string;
  cedula: string;
}
const emptyCaptain = (): Captain => ({
  name: '',
  email: '',
  phone: '',
  cedula: ''
});
const emptyAdulto = (): AdultoPlayer => ({
  name: '',
  cedula: '',
  age: ''
});
const emptyNino = (): NinoPlayer => ({
  name: '',
  ti: '',
  age: '',
  responsableName: '',
  responsablePhone: ''
});
const emptyPadel = (): PadelPlayer => ({
  name: '',
  email: '',
  phone: '',
  cedula: ''
});
const ADULTO_PRICE = 65000;
const NINO_PRICE = 45000; // Placeholder — confirmar con cliente
const PADEL_PRICE = 60000;
export function DeportesPage() {
  const [activeSport, setActiveSport] = useState<Sport>('futbol');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [futbolCategory, setFutbolCategory] = useState<FutbolCategory>('adultos');
  // Adultos team
  const [teamNameAdultos, setTeamNameAdultos] = useState('');
  const [captainAdultos, setCaptainAdultos] = useState<Captain>(emptyCaptain());
  const [adultos, setAdultos] = useState<AdultoPlayer[]>([emptyAdulto(), emptyAdulto(), emptyAdulto(), emptyAdulto(), emptyAdulto()]);
  // Niños team
  const [teamNameNinos, setTeamNameNinos] = useState('');
  const [captainNinos, setCaptainNinos] = useState<Captain>(emptyCaptain());
  const [ninos, setNinos] = useState<NinoPlayer[]>([emptyNino(), emptyNino(), emptyNino(), emptyNino(), emptyNino()]);
  // Pádel — solo 2 o 4 jugadores
  const [padelPlayers, setPadelPlayers] = useState<PadelPlayer[]>([emptyPadel(), emptyPadel()]);
  // Adulto helpers
  const addAdulto = () => {
    if (adultos.length < 20) setAdultos([...adultos, emptyAdulto()]);
  };
  const removeAdulto = (index: number) => {
    if (adultos.length > 1) setAdultos(adultos.filter((_, i) => i !== index));
  };
  const updateAdulto = (index: number, field: keyof AdultoPlayer, value: string) => {
    const updated = [...adultos];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setAdultos(updated);
  };
  // Niño helpers
  const addNino = () => {
    if (ninos.length < 20) setNinos([...ninos, emptyNino()]);
  };
  const removeNino = (index: number) => {
    if (ninos.length > 1) setNinos(ninos.filter((_, i) => i !== index));
  };
  const updateNino = (index: number, field: keyof NinoPlayer, value: string) => {
    const updated = [...ninos];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setNinos(updated);
  };
  // Pádel helpers — solo 2 o 4 jugadores (parejas)
  const addPadelPlayer = () => {
    if (padelPlayers.length === 2) setPadelPlayers([...padelPlayers, emptyPadel(), emptyPadel()]);
  };
  const removePadelPlayer = () => {
    if (padelPlayers.length === 4) setPadelPlayers(padelPlayers.slice(0, 2));
  };
  const padelTotal = padelPlayers.length * PADEL_PRICE;
  const updatePadelPlayer = (index: number, field: keyof PadelPlayer, value: string) => {
    const updated = [...padelPlayers];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setPadelPlayers(updated);
  };
  const adultosTotal = adultos.length * ADULTO_PRICE;
  const ninosTotal = ninos.length * NINO_PRICE;
  const handleAdultosRegistration = async () => {
    if (!teamNameAdultos.trim()) {
      toast.error('Ingresa el nombre del equipo');
      return;
    }
    if (!captainAdultos.name.trim() || !captainAdultos.phone.trim()) {
      toast.error('Completa los datos del capitán');
      return;
    }
    const filled = adultos.filter((p) => p.name.trim());
    if (filled.length === 0) {
      toast.error('Registra al menos 1 jugador');
      return;
    }
    setIsSubmitting(true);
    // TODO: migrate to Supabase
    console.log('📋 Inscripción Fútbol Adultos:', {
      teamName: teamNameAdultos,
      captain: captainAdultos,
      players: adultos,
      total: adultosTotal
    });
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('¡Equipo registrado! Redirigiendo al pago...');
    }, 600);
  };
  const handleNinosRegistration = async () => {
    if (!teamNameNinos.trim()) {
      toast.error('Ingresa el nombre del equipo');
      return;
    }
    if (!captainNinos.name.trim() || !captainNinos.phone.trim()) {
      toast.error('Completa los datos del capitán / adulto a cargo');
      return;
    }
    const filled = ninos.filter((p) => p.name.trim());
    if (filled.length === 0) {
      toast.error('Registra al menos 1 niño');
      return;
    }
    setIsSubmitting(true);
    // TODO: migrate to Supabase
    console.log('📋 Inscripción Fútbol Niños:', {
      teamName: teamNameNinos,
      captain: captainNinos,
      players: ninos,
      total: ninosTotal
    });
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('¡Equipo registrado! Redirigiendo al pago...');
    }, 600);
  };
  const handlePadelRegistration = async () => {
    setIsSubmitting(true);
    const filledPlayers = padelPlayers.filter((p) => p.name.trim());
    // NOTE: cuando conectemos a Supabase, el ID del equipo será autogenerado
    // como "Padel-team001", "Padel-team002", etc. (incremental por registro).
    // El Jugador 1 (capitán) identifica al equipo. Todos los jugadores
    // quedarán vinculados a ese mismo team_id en la tabla padel_players.
    const result = await sendToGHL(GHL_WEBHOOKS.DEPORTES, {
      form_type: 'inscripcion_padel',
      etiqueta: 'Pádel - Latido y Huella',
      deporte: 'Pádel',
      cantidad_jugadores: filledPlayers.length,
      capitan: filledPlayers[0] ? {
        nombre: filledPlayers[0].name,
        cedula: filledPlayers[0].cedula
      } : null,
      jugadores: filledPlayers.map((p, i) => ({
        numero: i + 1,
        es_capitan: i === 0,
        nombre: p.name,
        email: p.email,
        celular: p.phone,
        cedula: p.cedula
      }))
    });
    setIsSubmitting(false);
    if (result.success) {
      toast.success('¡Pareja registrada! Redirigiendo al pago...');
    } else {
      toast.success('¡Pareja registrada! Redirigiendo al pago...');
      console.log('📋 Datos pádel (backup):', {
        padelPlayers
      });
    }
  };
  const updateCaptainAdultos = (field: keyof Captain, value: string) => {
    setCaptainAdultos({
      ...captainAdultos,
      [field]: value
    });
  };
  const updateCaptainNinos = (field: keyof Captain, value: string) => {
    setCaptainNinos({
      ...captainNinos,
      [field]: value
    });
  };
  return <div className="pt-20 bg-brand-navy">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <section className="relative py-24 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-brand-navy/70"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-cyan hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-5xl md:text-7xl text-white mb-4 font-bold">
            Zona <span className="text-brand-yellow">Deportiva</span>
          </motion.h1>
          <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.2
        }} className="text-xl text-white/80 max-w-2xl mx-auto">
            Fútbol y pádel. Compite, diviértete y lleva a tu equipo a la gloria.
          </motion.p>
        </div>
      </section>

      {/* Sport Tabs */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
              {['ELIGE', 'TU', 'DEPORTE'].map((word, i) => <motion.span key={i} initial={{
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
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Selecciona la disciplina en la que quieres competir y registra tu
              equipo.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <motion.div initial={{
            opacity: 0,
            y: -20,
            scale: 0.85
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} transition={{
            type: 'spring',
            stiffness: 260,
            damping: 18,
            delay: 0.4
          }} className="relative">
              <div className="relative bg-gray-100 p-1.5 rounded-full flex gap-2">
                {(['futbol', 'padel'] as Sport[]).map((sport) => {
                const isActive = activeSport === sport;
                return <button key={sport} onClick={() => setActiveSport(sport)} className={`relative px-8 py-3 rounded-full font-bold text-lg transition-colors z-10 ${isActive ? 'text-white' : 'text-gray-500 hover:text-brand-navy'}`}>
                      {isActive && <motion.span layoutId="sport-tab-indicator" className="absolute inset-0 bg-brand-navy rounded-full shadow-lg" transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 32
                  }} />}
                      <span className="relative z-10">
                        {sport === 'futbol' ? '⚽ Fútbol' : '🎾 Pádel'}
                      </span>
                    </button>;
              })}
              </div>
            </motion.div>
          </div>

          {/* Fútbol Section */}
          {activeSport === 'futbol' && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} key="futbol">
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <Trophy className="w-10 h-10 text-brand-yellow mx-auto mb-3" />
                  <h3 className="font-bold text-brand-navy mb-1">3 Canchas</h3>
                  <p className="text-gray-500 text-sm">
                    Canchas sintéticas profesionales
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <Users className="w-10 h-10 text-brand-cyan mx-auto mb-3" />
                  <h3 className="font-bold text-brand-navy mb-1">
                    Equipos Adultos y Niños
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Inscripción por equipo con capitán
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <Clock className="w-10 h-10 text-brand-green mx-auto mb-3" />
                  <h3 className="font-bold text-brand-navy mb-1">
                    8:00 AM - 4:00 PM
                  </h3>
                  <p className="text-gray-500 text-sm">Bracket automático</p>
                </div>
              </div>

              {/* Category sub-tabs */}
              <div className="flex justify-center mb-8">
                <div className="relative bg-gray-100 p-1.5 rounded-full flex gap-2">
                  {([{
                id: 'adultos',
                label: 'Adultos',
                icon: User,
                price: ADULTO_PRICE
              }, {
                id: 'ninos',
                label: 'Niños',
                icon: Baby,
                price: NINO_PRICE
              }] as {
                id: FutbolCategory;
                label: string;
                icon: any;
                price: number;
              }[]).map((cat) => {
                const isActive = futbolCategory === cat.id;
                const Icon = cat.icon;
                return <button key={cat.id} onClick={() => setFutbolCategory(cat.id)} className={`relative px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-colors z-10 flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-500 hover:text-brand-navy'}`}>
                        {isActive && <motion.span layoutId="futbol-cat-indicator" className="absolute inset-0 bg-brand-cyan rounded-full shadow-md" transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 32
                  }} />}
                        <span className="relative z-10 flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {cat.label}
                          <span className="text-xs font-semibold opacity-80">
                            ${cat.price.toLocaleString('es-CO')}
                          </span>
                        </span>
                      </button>;
              })}
                </div>
              </div>

              {/* Adultos Form */}
              {futbolCategory === 'adultos' && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} key="adultos" className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-brand-navy mb-2">
                      Inscripción Equipo · Adultos
                    </h2>
                    <p className="text-gray-500">
                      ${ADULTO_PRICE.toLocaleString('es-CO')} por jugador ·
                      Mínimo 5 jugadores recomendado
                    </p>
                  </div>

                  {/* Team name */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del equipo *
                    </label>
                    <input type="text" value={teamNameAdultos} onChange={(e) => setTeamNameAdultos(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none" placeholder="Ej. Los Tigres FC" />
                  </div>

                  {/* Captain */}
                  <div className="mb-8 bg-brand-navy/5 rounded-2xl p-5 border border-brand-navy/10">
                    <p className="text-xs uppercase tracking-wider font-bold text-brand-navy mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-brand-yellow" /> Capitán
                      del equipo
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" value={captainAdultos.name} onChange={(e) => updateCaptainAdultos('name', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Nombre completo" />
                      <input type="email" value={captainAdultos.email} onChange={(e) => updateCaptainAdultos('email', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Correo electrónico" />
                      <input type="tel" value={captainAdultos.phone} onChange={(e) => updateCaptainAdultos('phone', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Celular / WhatsApp" />
                      <input type="text" value={captainAdultos.cedula} onChange={(e) => updateCaptainAdultos('cedula', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Nro. de cédula" />
                    </div>
                  </div>

                  {/* Players */}
                  <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
                    Jugadores
                  </p>
                  <div className="space-y-3">
                    {adultos.map((player, i) => <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm font-semibold text-brand-navy">
                              Jugador {i + 1}
                            </span>
                          </div>
                          {adultos.length > 1 && <button onClick={() => removeAdulto(i)} className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-1">
                              <Minus className="w-4 h-4" /> Quitar
                            </button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input type="text" value={player.name} onChange={(e) => updateAdulto(i, 'name', e.target.value)} className="md:col-span-2 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Nombre completo" />
                          <input type="number" min="18" max="99" value={player.age} onChange={(e) => updateAdulto(i, 'age', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Edad" />
                          <input type="text" value={player.cedula} onChange={(e) => updateAdulto(i, 'cedula', e.target.value)} className="md:col-span-3 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Nro. de cédula" />
                        </div>
                      </div>)}
                  </div>

                  <button onClick={addAdulto} disabled={adultos.length >= 20} className="mt-4 w-full py-3 border-2 border-dashed border-brand-cyan/40 rounded-2xl text-brand-cyan font-bold text-sm hover:bg-brand-cyan/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-30">
                    <Plus className="w-4 h-4" /> Agregar otro jugador
                  </button>

                  {/* Total */}
                  <div className="mt-8 bg-brand-navy/5 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm text-gray-500">
                        {adultos.length} jugador
                        {adultos.length !== 1 ? 'es' : ''} ×{' '}
                        {formatCOP(ADULTO_PRICE)}
                      </p>
                      <Trophy className="w-12 h-12 text-brand-yellow" />
                    </div>
                    <div className="space-y-1.5 text-sm border-t border-brand-navy/10 pt-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          {formatCOP(adultosTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>IVA (19%)</span>
                        <span className="font-medium">
                          {formatCOP(priceBreakdown(adultosTotal).iva)}
                        </span>
                      </div>
                      <div className="flex justify-between text-brand-navy pt-2 border-t border-brand-navy/10 mt-1">
                        <span className="font-bold">Total a pagar</span>
                        <span className="font-black text-xl">
                          {formatCOP(priceBreakdown(adultosTotal).total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleAdultosRegistration} disabled={isSubmitting} className="mt-6 w-full bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-all shadow-xl disabled:opacity-70">
                    {isSubmitting ? 'Registrando...' : `Registrar equipo · Pagar ${formatCOP(priceBreakdown(adultosTotal).total)}`}
                  </button>
                  <p className="text-center text-gray-400 text-xs mt-3">
                    Tu equipo se registra y serás redirigido al pago.
                  </p>
                </motion.div>}

              {/* Niños Form */}
              {futbolCategory === 'ninos' && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} key="ninos" className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-brand-navy mb-2">
                      Inscripción Equipo · Niños
                    </h2>
                    <p className="text-gray-500">
                      ${NINO_PRICE.toLocaleString('es-CO')} por niño · Cada niño
                      debe tener un adulto responsable
                    </p>
                  </div>

                  {/* Team name */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del equipo *
                    </label>
                    <input type="text" value={teamNameNinos} onChange={(e) => setTeamNameNinos(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none" placeholder="Ej. Los Cachorros FC" />
                  </div>

                  {/* Captain (adulto a cargo del equipo) */}
                  <div className="mb-8 bg-brand-navy/5 rounded-2xl p-5 border border-brand-navy/10">
                    <p className="text-xs uppercase tracking-wider font-bold text-brand-navy mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-brand-yellow" /> Capitán /
                      Adulto a cargo del equipo
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" value={captainNinos.name} onChange={(e) => updateCaptainNinos('name', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Nombre completo" />
                      <input type="email" value={captainNinos.email} onChange={(e) => updateCaptainNinos('email', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Correo electrónico" />
                      <input type="tel" value={captainNinos.phone} onChange={(e) => updateCaptainNinos('phone', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Celular / WhatsApp" />
                      <input type="text" value={captainNinos.cedula} onChange={(e) => updateCaptainNinos('cedula', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white" placeholder="Nro. de cédula" />
                    </div>
                  </div>

                  {/* Players */}
                  <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
                    Jugadores (niños)
                  </p>
                  <div className="space-y-4">
                    {ninos.map((player, i) => <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-brand-yellow text-brand-navy flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm font-semibold text-brand-navy">
                              Niño {i + 1}
                            </span>
                          </div>
                          {ninos.length > 1 && <button onClick={() => removeNino(i)} className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-1">
                              <Minus className="w-4 h-4" /> Quitar
                            </button>}
                        </div>

                        {/* Datos del niño */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <input type="text" value={player.name} onChange={(e) => updateNino(i, 'name', e.target.value)} className="md:col-span-2 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Nombre completo del niño" />
                          <input type="number" min="5" max="17" value={player.age} onChange={(e) => updateNino(i, 'age', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Edad" />
                          <input type="text" value={player.ti} onChange={(e) => updateNino(i, 'ti', e.target.value)} className="md:col-span-3 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Nro. de Tarjeta de Identidad (T.I.)" />
                        </div>

                        {/* Adulto responsable */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wider font-bold text-amber-800 mb-2 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Adulto responsable
                            de este niño
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" value={player.responsableName} onChange={(e) => updateNino(i, 'responsableName', e.target.value)} className="px-4 py-2.5 rounded-xl border border-amber-200 bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm" placeholder="Nombre del responsable" />
                            <input type="tel" value={player.responsablePhone} onChange={(e) => updateNino(i, 'responsablePhone', e.target.value)} className="px-4 py-2.5 rounded-xl border border-amber-200 bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm" placeholder="Teléfono del responsable" />
                          </div>
                        </div>
                      </div>)}
                  </div>

                  <button onClick={addNino} disabled={ninos.length >= 20} className="mt-4 w-full py-3 border-2 border-dashed border-brand-cyan/40 rounded-2xl text-brand-cyan font-bold text-sm hover:bg-brand-cyan/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-30">
                    <Plus className="w-4 h-4" /> Agregar otro niño
                  </button>

                  {/* Total */}
                  <div className="mt-8 bg-brand-navy/5 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm text-gray-500">
                        {ninos.length} niño{ninos.length !== 1 ? 's' : ''} ×{' '}
                        {formatCOP(NINO_PRICE)}
                      </p>
                      <Baby className="w-12 h-12 text-brand-yellow" />
                    </div>
                    <div className="space-y-1.5 text-sm border-t border-brand-navy/10 pt-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          {formatCOP(ninosTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>IVA (19%)</span>
                        <span className="font-medium">
                          {formatCOP(priceBreakdown(ninosTotal).iva)}
                        </span>
                      </div>
                      <div className="flex justify-between text-brand-navy pt-2 border-t border-brand-navy/10 mt-1">
                        <span className="font-bold">Total a pagar</span>
                        <span className="font-black text-xl">
                          {formatCOP(priceBreakdown(ninosTotal).total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleNinosRegistration} disabled={isSubmitting} className="mt-6 w-full bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-all shadow-xl disabled:opacity-70">
                    {isSubmitting ? 'Registrando...' : `Registrar equipo · Pagar ${formatCOP(priceBreakdown(ninosTotal).total)}`}
                  </button>
                  <p className="text-center text-gray-400 text-xs mt-3">
                    Tu equipo se registra y serás redirigido al pago.
                  </p>
                </motion.div>}
            </motion.div>}

          {/* Pádel Section */}
          {activeSport === 'padel' && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} key="padel">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <MapPin className="w-10 h-10 text-brand-cyan mx-auto mb-3" />
                  <h3 className="font-bold text-brand-navy mb-1">
                    2 Canchas de Pádel
                  </h3>
                  <p className="text-gray-500 text-sm">+ 1 cancha de tenis</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <Users className="w-10 h-10 text-brand-yellow mx-auto mb-3" />
                  <h3 className="font-bold text-brand-navy mb-1">Parejas</h3>
                  <p className="text-gray-500 text-sm">
                    Torneo por parejas (2 jugadores)
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <Trophy className="w-10 h-10 text-brand-green mx-auto mb-3" />
                  <h3 className="font-bold text-brand-navy mb-1">
                    Jueces Profesionales
                  </h3>
                  <p className="text-gray-500 text-sm">Arbitraje certificado</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-brand-navy mb-2 text-center">
                  Registra tu Pareja
                </h2>
                <p className="text-gray-500 text-center mb-8">
                  Inscripción por parejas · 2 o 4 jugadores · $
                  {PADEL_PRICE.toLocaleString('es-CO')} por jugador
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-semibold text-gray-700">
                        Jugadores ({padelPlayers.length})
                      </label>
                    </div>
                    <div className="space-y-4">
                      {padelPlayers.map((player, i) => <div key={i} className={`rounded-2xl p-5 border ${i === 0 ? 'bg-brand-yellow/10 border-brand-yellow/40' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-brand-yellow text-brand-navy' : 'bg-brand-navy text-white'}`}>
                              {i === 0 ? <Crown className="w-3.5 h-3.5" /> : i + 1}
                            </span>
                            <span className="text-sm font-semibold text-brand-navy">
                              {i === 0 ? 'Jugador 1 · Capitán' : `Jugador ${i + 1}`}
                            </span>
                            {i === 0 && <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-brand-yellow bg-brand-yellow/20 px-2 py-0.5 rounded-full">
                                Identifica al equipo
                              </span>}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" value={player.name} onChange={(e) => updatePadelPlayer(i, 'name', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Nombre completo" />
                            <input type="email" value={player.email} onChange={(e) => updatePadelPlayer(i, 'email', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Correo electrónico" />
                            <input type="tel" value={player.phone} onChange={(e) => updatePadelPlayer(i, 'phone', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Número de celular" />
                            <input type="text" value={player.cedula} onChange={(e) => updatePadelPlayer(i, 'cedula', e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Nro. de cédula" />
                          </div>
                        </div>)}
                    </div>

                    {/* Add / remove pareja button */}
                    {padelPlayers.length === 2 ? <button onClick={addPadelPlayer} className="mt-4 w-full py-3 border-2 border-dashed border-brand-cyan/40 rounded-2xl text-brand-cyan font-bold text-sm hover:bg-brand-cyan/5 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Agregar jugadores (+2)
                      </button> : <button onClick={removePadelPlayer} className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Minus className="w-4 h-4" /> Quitar jugadores (volver a
                        2)
                      </button>}
                  </div>
                </div>

                {/* Total */}
                <div className="mt-8 bg-brand-navy/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-gray-500">
                      {padelPlayers.length} jugadores × {formatCOP(PADEL_PRICE)}
                    </p>
                    <Trophy className="w-12 h-12 text-brand-yellow" />
                  </div>
                  <div className="space-y-1.5 text-sm border-t border-brand-navy/10 pt-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        {formatCOP(padelTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>IVA (19%)</span>
                      <span className="font-medium">
                        {formatCOP(priceBreakdown(padelTotal).iva)}
                      </span>
                    </div>
                    <div className="flex justify-between text-brand-navy pt-2 border-t border-brand-navy/10 mt-1">
                      <span className="font-bold">Total a pagar</span>
                      <span className="font-black text-xl">
                        {formatCOP(priceBreakdown(padelTotal).total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={handlePadelRegistration} disabled={isSubmitting} className="mt-6 w-full block text-center bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-all shadow-xl disabled:opacity-70">
                  {isSubmitting ? 'Registrando...' : `Registrar · Pagar ${formatCOP(priceBreakdown(padelTotal).total)}`}
                </button>
                <p className="text-center text-gray-400 text-xs mt-3">
                  Tu inscripción se registra y serás redirigido al pago.
                </p>
              </div>
            </motion.div>}
        </div>
      </section>
    </div>;
}