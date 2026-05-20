import React, { useMemo, useState, Component } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Store, Users, TrendingUp, Coffee, Map, Check, Info, MessageSquare, Mail, Calendar, MapPin, ShoppingBag, ChevronRight, Truck, Maximize2, X } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ExpositorRegistrationModal } from '../components/ExpositorRegistrationModal';
import { formatCOP, priceBreakdown } from '../utils/format';
type StandStatus = 'available' | 'reserved' | 'sold';
type PavilionType = 'comercial' | 'foodtrucks';
interface Stand {
  id: string;
  status: StandStatus;
  size: string;
  price: number;
  isCorner?: boolean;
  isLarge?: boolean;
  type: PavilionType;
  standType?: 'AAA' | 'AA' | 'A';
  frentes?: string;
  row?: number;
  col?: number;
}
// Stand type definitions for commercial pavilion (36 total)
const AAA_STANDS = [13, 24];
const AA_STANDS = [1, 6, 7, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 30, 31, 36];
// Toldos availability (will be connected to backend later)
const TOLDOS_TOTAL = 20;
const TOLDOS_SOLD = 0; // Update this manually as toldos are sold, will connect to backend later
// Cute food truck icon — proper truck with awning, serving window, and wheels
function FoodTruckIcon({
  className


}: {className?: string;}) {
  return <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      {/* Striped awning */}
      <path d="M10 14 L54 14 L50 8 L14 8 Z" fill="currentColor" opacity="0.85" />
      <path d="M18 8 L18 14 M26 8 L26 14 M34 8 L34 14 M42 8 L42 14 M50 8 L50 14" stroke="white" strokeWidth="0.8" opacity="0.4" />

      {/* Truck body */}
      <rect x="6" y="14" width="44" height="22" rx="2" fill="currentColor" />

      {/* Cab on the right */}
      <path d="M50 18 L58 22 L58 36 L50 36 Z" fill="currentColor" opacity="0.75" />

      {/* Cab window */}
      <path d="M51 21 L56.5 23.5 L56.5 28 L51 28 Z" fill="white" opacity="0.45" />

      {/* Serving window */}
      <rect x="12" y="18" width="22" height="12" rx="1" fill="white" opacity="0.85" />

      {/* Counter */}
      <rect x="10" y="30" width="26" height="2" fill="white" opacity="0.55" />

      {/* Wheels */}
      <circle cx="18" cy="38" r="4" fill="#1a1a1a" />
      <circle cx="18" cy="38" r="1.6" fill="white" opacity="0.8" />
      <circle cx="48" cy="38" r="4" fill="#1a1a1a" />
      <circle cx="48" cy="38" r="1.6" fill="white" opacity="0.8" />
    </svg>;
}
export function ExpositoresPage() {
  const [activeTab, setActiveTab] = useState<PavilionType>('comercial');
  const [ftSubTab, setFtSubTab] = useState<'foodtrucks' | 'toldos'>('foodtrucks');
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationType, setRegistrationType] = useState<'comercial' | 'foodtruck' | 'toldo'>('comercial');
  const [ftWidthStr, setFtWidthStr] = useState('5');
  const [ftLengthStr, setFtLengthStr] = useState('3');
  const [toldosQuantity, setToldosQuantity] = useState(0);
  const ftPricePerM2 = 150000; // Updated from 57000
  const ftWidth = parseFloat(ftWidthStr) || 0;
  const ftLength = parseFloat(ftLengthStr) || 0;
  const ftTotalM2 = ftWidth * ftLength;
  const ftTotalPrice = ftTotalM2 * ftPricePerM2;
  // Calculate available toldos with fake urgency logic
  const toldosAvailable = TOLDOS_SOLD < 10 ? Math.max(TOLDOS_TOTAL - TOLDOS_SOLD - 8, 11) // Fake number for urgency (shows ~12 available initially)
  : TOLDOS_TOTAL - TOLDOS_SOLD; // Real number after 50% sold
  const toldosPrice = 300000;
  const toldosTotalPrice = toldosPrice * toldosQuantity;
  const {
    commercialStands,
    foodTruckStands
  } = useMemo(() => {
    const comm: Stand[] = [];
    // Create 36 commercial stands (01-36)
    for (let i = 1; i <= 36; i++) {
      const rand = Math.random();
      const status: StandStatus = rand > 0.4 ? 'available' : rand > 0.2 ? 'reserved' : 'sold';
      let standType: 'AAA' | 'AA' | 'A';
      let price: number;
      let frentes: string;
      let isLarge: boolean;
      if (AAA_STANDS.includes(i)) {
        standType = 'AAA';
        price = 800000;
        frentes = 'Tres frentes';
        isLarge = true;
      } else if (AA_STANDS.includes(i)) {
        standType = 'AA';
        price = 600000;
        frentes = 'Dos frentes';
        isLarge = true;
      } else {
        standType = 'A';
        price = 500000;
        frentes = 'Un frente';
        isLarge = false;
      }
      const paddedNum = i.toString().padStart(2, '0');
      const row = i <= 12 ? 1 : i <= 24 ? 2 : 3;
      comm.push({
        id: `${standType}${paddedNum}`,
        status,
        size: '2x2m',
        price,
        type: 'comercial',
        standType,
        frentes,
        isLarge,
        row,
        col: i
      });
    }
    const foodTrucks: Stand[] = [];
    for (let i = 1; i <= 8; i++) {
      const rand = Math.random();
      const status: StandStatus = rand > 0.3 ? 'available' : rand > 0.1 ? 'reserved' : 'sold';
      foodTrucks.push({
        id: `FT${i}`,
        status,
        size: 'Variable',
        price: ftPricePerM2,
        type: 'foodtrucks',
        row: i <= 4 ? 1 : 2,
        col: i <= 4 ? i : i - 4
      });
    }
    return {
      commercialStands: comm,
      foodTruckStands: foodTrucks
    };
  }, [ftPricePerM2]);
  const currentStands = activeTab === 'comercial' ? commercialStands : foodTruckStands;
  const handleStandClick = (stand: Stand) => {
    if (stand.status === 'available') {
      setSelectedStand(stand);
      setIsModalOpen(false); // Close modal when stand selected to show detail panel
    }
  };
  const getCommercialStandClasses = (stand: Stand) => {
    const isSelected = selectedStand?.id === stand.id;
    // AAA stands (super premium) - gold styling
    if (stand.standType === 'AAA') {
      if (stand.status === 'sold') {
        return `rounded-lg border-[3px] flex flex-col items-center justify-center transition-all font-bold relative bg-red-100 border-red-400 text-red-700 cursor-not-allowed opacity-60`;
      }
      if (stand.status === 'reserved') {
        return `rounded-lg border-[3px] flex flex-col items-center justify-center transition-all font-bold relative bg-amber-100 border-amber-400 text-amber-700 cursor-not-allowed opacity-75`;
      }
      return `rounded-lg border-[4px] flex flex-col items-center justify-center transition-all font-bold relative bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-500 text-yellow-900 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-600 hover:shadow-xl hover:shadow-yellow-400/40 cursor-pointer
        ${isSelected ? 'ring-4 ring-yellow-500 ring-offset-2 scale-110 z-10 shadow-2xl' : ''}`;
    }
    // AA stands (premium) - amber styling
    if (stand.standType === 'AA') {
      if (stand.status === 'sold') {
        return `rounded-lg border-[3px] flex flex-col items-center justify-center transition-all font-bold relative bg-red-100 border-red-400 text-red-700 cursor-not-allowed opacity-60`;
      }
      if (stand.status === 'reserved') {
        return `rounded-lg border-[3px] flex flex-col items-center justify-center transition-all font-bold relative bg-amber-100 border-amber-400 text-amber-700 cursor-not-allowed opacity-75`;
      }
      return `rounded-lg border-[3px] flex flex-col items-center justify-center transition-all font-bold relative bg-white border-amber-400 text-amber-800 hover:bg-amber-50 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-400/30 cursor-pointer
        ${isSelected ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 z-10 shadow-xl' : ''}`;
    }
    // A stands (standard) - gray styling
    if (stand.status === 'sold') {
      return `aspect-square rounded border-2 flex items-center justify-center transition-all text-[9px] font-bold bg-red-100 border-red-400 text-red-700 cursor-not-allowed opacity-60`;
    }
    if (stand.status === 'reserved') {
      return `aspect-square rounded border-2 flex items-center justify-center transition-all text-[9px] font-bold bg-amber-100 border-amber-400 text-amber-700 cursor-not-allowed opacity-75`;
    }
    return `aspect-square rounded border-2 flex items-center justify-center transition-all text-[9px] font-bold bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400 cursor-pointer
      ${isSelected ? 'ring-4 ring-brand-cyan ring-offset-2 scale-105' : ''}`;
  };
  const getFoodTruckStandClasses = (stand: Stand) => {
    const isSelected = selectedStand?.id === stand.id;
    const base = 'flex flex-col items-center justify-center transition-all py-3 px-2 rounded-xl';
    if (stand.status === 'sold') {
      return `${base} bg-red-500/20 border-2 border-red-500/40 text-red-300 cursor-not-allowed`;
    }
    if (stand.status === 'reserved') {
      return `${base} bg-red-500/15 border-2 border-red-500/30 text-red-200/80 cursor-not-allowed`;
    }
    return `${base} text-white hover:scale-110 hover:-translate-y-1 cursor-pointer
      ${isSelected ? 'scale-110 -translate-y-1 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]' : ''}`;
  };
  return <div className="pt-20 bg-brand-navy">
      {/* Hero Banner */}
      <section className="relative py-24 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80&auto=format&fit=crop" alt="Feria Bazar" className="w-full h-full object-cover opacity-30" />
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
            Feria Bazar <span className="text-brand-cyan">Deportiva</span>
          </motion.h1>
          <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.2
        }} className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            El espacio perfecto para conectar tu marca con más de 2,000 amantes
            del deporte, el bienestar y las mascotas.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-brand-cyan" /> 26 Julio 2026
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-brand-green" /> Parque COMFAMA
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Store className="w-5 h-5 text-brand-yellow" /> 36 Stands
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Stand Selector */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              {['Selecciona', 'tu', 'Stand'].map((word, i) => <motion.span key={i} initial={{
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
            <p className="text-gray-600">
              Elige la ubicación perfecta para tu marca en nuestro mapa
              interactivo.
            </p>
          </div>

          {/* Tabs - ONLY 2 NOW */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1.5 rounded-full flex gap-2 max-w-xl w-full">
              <button onClick={() => {
              setActiveTab('comercial');
              setSelectedStand(null);
            }} className={`flex-1 py-3 rounded-full font-bold text-sm md:text-base transition-all ${activeTab === 'comercial' ? 'bg-brand-navy text-white shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                Comercial
              </button>
              <button onClick={() => {
              setActiveTab('foodtrucks');
              setSelectedStand(null);
            }} className={`flex-1 py-3 rounded-full font-bold text-sm md:text-base transition-all ${activeTab === 'foodtrucks' ? 'bg-brand-navy text-white shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                Food Trucks - Toldos
              </button>
            </div>
          </div>

          {/* Legend - UPDATED */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {!(activeTab === 'foodtrucks' && ftSubTab === 'toldos') && <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
                  <span className="text-sm text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-amber-400 bg-amber-100"></div>
                  <span className="text-sm text-gray-600">Reservado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-red-400 bg-red-100"></div>
                  <span className="text-sm text-gray-600">Vendido</span>
                </div>
              </>}
            {activeTab === 'comercial' && <>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border-[3px] border-yellow-500"></div>
                  <span className="text-sm text-gray-600 font-semibold">
                    AAA — Premium 3 frentes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-white border-[3px] border-amber-400"></div>
                  <span className="text-sm text-gray-600 font-semibold">
                    AA — Premium 2 frentes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white border-2 border-gray-300"></div>
                  <span className="text-sm text-gray-600">
                    A — Estándar 1 frente
                  </span>
                </div>
              </>}
            {activeTab === 'foodtrucks' && ftSubTab === 'foodtrucks' && <>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-orange-500/30 border-2 border-orange-500/50"></div>
                  <span className="text-sm text-gray-600 font-semibold">
                    Food Truck
                  </span>
                </div>
              </>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Grid Map */}
            {(() => {
            const PavilionContent = () => <>
                  {activeTab === 'comercial' ? <div className="min-w-[640px]">
                      {/* Title */}
                      <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-[#5fc9d4] tracking-wider">
                          PABELLÓN COMERCIAL
                        </h3>
                        <p className="text-white/60 text-sm mt-2">
                          36 Stands Disponibles
                        </p>
                      </div>

                      {/* Floor Plan Container */}
                      <div className="relative bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="flex gap-4">
                          {/* Left SALIDA labels */}
                          <div className="flex flex-col items-center justify-around">
                            <div className="text-white/70 text-xs font-bold" style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)'
                      }}>
                              SALIDA
                            </div>
                            <div className="text-white/70 text-xs font-bold" style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)'
                      }}>
                              SALIDA
                            </div>
                          </div>

                          <div className="flex-1">
                            {/* Row 1: 01-06 | SALIDA | 07-12 */}
                            <div className="flex gap-1 mb-4 items-center">
                              <div className="grid gap-1 flex-1" style={{
                          gridTemplateColumns: 'repeat(6, 1fr)'
                        }}>
                                {commercialStands.filter((s) => s.row === 1 && (s.col ?? 0) <= 6).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getCommercialStandClasses(stand)} style={stand.standType === 'AAA' || stand.standType === 'AA' ? {
                            aspectRatio: '1',
                            minHeight: '100%'
                          } : {
                            aspectRatio: '1'
                          }}>
                                      <span className={stand.standType === 'AAA' || stand.standType === 'AA' ? 'text-[8px] leading-tight text-center' : 'text-[9px]'}>
                                        {stand.id}
                                      </span>
                                      {stand.standType === 'AAA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 text-yellow-500 text-xs">
                                            ★★★
                                          </span>}
                                      {stand.standType === 'AA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-600 shadow-sm"></span>}
                                    </button>)}
                              </div>
                              <div className="px-1 text-white/70 text-[8px] font-bold text-center leading-tight" style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)'
                        }}>
                                SALIDA
                              </div>
                              <div className="grid gap-1 flex-1" style={{
                          gridTemplateColumns: 'repeat(6, 1fr)'
                        }}>
                                {commercialStands.filter((s) => s.row === 1 && (s.col ?? 0) > 6).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getCommercialStandClasses(stand)} style={stand.standType === 'AAA' || stand.standType === 'AA' ? {
                            aspectRatio: '1',
                            minHeight: '100%'
                          } : {
                            aspectRatio: '1'
                          }}>
                                      <span className={stand.standType === 'AAA' || stand.standType === 'AA' ? 'text-[8px] leading-tight text-center' : 'text-[9px]'}>
                                        {stand.id}
                                      </span>
                                      {stand.standType === 'AAA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 text-yellow-500 text-xs">
                                            ★★★
                                          </span>}
                                      {stand.standType === 'AA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-600 shadow-sm"></span>}
                                    </button>)}
                              </div>
                            </div>

                            {/* PASO PEATONAL 1 */}
                            <div className="mb-4 py-3 bg-white/10 rounded-lg border border-white/20">
                              <div className="text-center">
                                <div className="text-white font-bold text-sm">
                                  PASO PEATONAL
                                </div>
                              </div>
                            </div>

                            {/* Row 2: 13-24 (central, no SALIDA) */}
                            <div className="grid gap-1 mb-4" style={{
                        gridTemplateColumns: 'repeat(12, 1fr)'
                      }}>
                              {commercialStands.filter((s) => s.row === 2).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getCommercialStandClasses(stand)} style={stand.standType === 'AAA' || stand.standType === 'AA' ? {
                          aspectRatio: '1',
                          minHeight: '100%'
                        } : {
                          aspectRatio: '1'
                        }}>
                                    <span className={stand.standType === 'AAA' || stand.standType === 'AA' ? 'text-[8px] leading-tight text-center' : 'text-[9px]'}>
                                      {stand.id}
                                    </span>
                                    {stand.standType === 'AAA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 text-yellow-500 text-xs">
                                          ★★★
                                        </span>}
                                    {stand.standType === 'AA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-600 shadow-sm"></span>}
                                  </button>)}
                            </div>

                            {/* PASO PEATONAL 2 */}
                            <div className="mb-4 py-3 bg-white/10 rounded-lg border border-white/20">
                              <div className="text-center">
                                <div className="text-white font-bold text-sm">
                                  PASO PEATONAL
                                </div>
                              </div>
                            </div>

                            {/* Row 3: 25-30 | SALIDA | 31-36 */}
                            <div className="flex gap-1 items-center">
                              <div className="grid gap-1 flex-1" style={{
                          gridTemplateColumns: 'repeat(6, 1fr)'
                        }}>
                                {commercialStands.filter((s) => s.row === 3 && (s.col ?? 0) <= 30).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getCommercialStandClasses(stand)} style={stand.standType === 'AAA' || stand.standType === 'AA' ? {
                            aspectRatio: '1',
                            minHeight: '100%'
                          } : {
                            aspectRatio: '1'
                          }}>
                                      <span className={stand.standType === 'AAA' || stand.standType === 'AA' ? 'text-[8px] leading-tight text-center' : 'text-[9px]'}>
                                        {stand.id}
                                      </span>
                                      {stand.standType === 'AAA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 text-yellow-500 text-xs">
                                            ★★★
                                          </span>}
                                      {stand.standType === 'AA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-600 shadow-sm"></span>}
                                    </button>)}
                              </div>
                              <div className="px-1 text-white/70 text-[8px] font-bold text-center leading-tight" style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)'
                        }}>
                                SALIDA
                              </div>
                              <div className="grid gap-1 flex-1" style={{
                          gridTemplateColumns: 'repeat(6, 1fr)'
                        }}>
                                {commercialStands.filter((s) => s.row === 3 && (s.col ?? 0) > 30).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getCommercialStandClasses(stand)} style={stand.standType === 'AAA' || stand.standType === 'AA' ? {
                            aspectRatio: '1',
                            minHeight: '100%'
                          } : {
                            aspectRatio: '1'
                          }}>
                                      <span className={stand.standType === 'AAA' || stand.standType === 'AA' ? 'text-[8px] leading-tight text-center' : 'text-[9px]'}>
                                        {stand.id}
                                      </span>
                                      {stand.standType === 'AAA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 text-yellow-500 text-xs">
                                            ★★★
                                          </span>}
                                      {stand.standType === 'AA' && stand.status === 'available' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-600 shadow-sm"></span>}
                                    </button>)}
                              </div>
                            </div>
                          </div>

                          {/* Right SALIDA */}
                          <div className="flex flex-col justify-center">
                            <div className="text-white/70 text-xs font-bold" style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)'
                      }}>
                              SALIDA
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> :
              // Food Trucks & Toldos
              <div className="min-w-[480px]">
                      {/* Sub-tabs */}
                      <div className="flex justify-center mb-8">
                        <div className="bg-white/20 p-1 rounded-full flex gap-1 w-full max-w-sm border border-white/20">
                          <button onClick={() => setFtSubTab('foodtrucks')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${ftSubTab === 'foodtrucks' ? 'bg-orange-500 text-white shadow-md' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                            Food Trucks
                          </button>
                          <button onClick={() => setFtSubTab('toldos')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${ftSubTab === 'toldos' ? 'bg-amber-500 text-white shadow-md' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                            Toldos
                          </button>
                        </div>
                      </div>

                      {ftSubTab === 'foodtrucks' ? <div>
                          {/* Food Trucks header */}
                          <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-orange-400 tracking-wider">
                              ZONA FOOD TRUCKS
                            </h3>
                            <p className="text-white/60 text-sm mt-2">
                              8 Espacios Disponibles · $150.000/m²
                            </p>
                          </div>
                          <div className="relative bg-white/5 p-6 rounded-xl border border-white/10">
                            {/* Top Row */}
                            <div className="grid grid-cols-4 gap-6 mb-8">
                              {foodTruckStands.filter((s) => s.row === 1).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getFoodTruckStandClasses(stand)}>
                                    <img src="/foodtruck.png" alt="Food Truck" className={`w-20 h-auto mb-2 ${stand.status === 'available' ? 'brightness-0 invert' : 'brightness-0 invert opacity-40'}`} />
                                    <span className="font-bold text-sm">
                                      {stand.id}
                                    </span>
                                    {stand.status === 'sold' && <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                        Vendido
                                      </span>}
                                    {stand.status === 'reserved' && <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                        Reservado
                                      </span>}
                                  </button>)}
                            </div>
                            {/* Paso peatonal */}
                            <div className="my-6 py-4 bg-white/10 rounded-lg border border-white/20">
                              <div className="text-center">
                                <div className="text-white font-bold text-sm tracking-widest">
                                  ZONA DE CIRCULACIÓN Y MESAS
                                </div>
                              </div>
                            </div>
                            {/* Bottom Row */}
                            <div className="grid grid-cols-4 gap-6 mt-8">
                              {foodTruckStands.filter((s) => s.row === 2).map((stand) => <button key={stand.id} onClick={() => handleStandClick(stand)} disabled={stand.status !== 'available'} className={getFoodTruckStandClasses(stand)}>
                                    <img src="/foodtruck.png" alt="Food Truck" className={`w-20 h-auto mb-2 ${stand.status === 'available' ? 'brightness-0 invert' : 'brightness-0 invert opacity-40'}`} />
                                    <span className="font-bold text-sm">
                                      {stand.id}
                                    </span>
                                    {stand.status === 'sold' && <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                        Vendido
                                      </span>}
                                    {stand.status === 'reserved' && <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                        Reservado
                                      </span>}
                                  </button>)}
                            </div>
                          </div>
                        </div> :
                // Toldos Gastronómicos Section
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-6 sm:p-8 rounded-2xl border-2 border-amber-500/30 shadow-xl relative overflow-hidden">
                          {/* Decorative background elements */}
                          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl shadow-lg">
                                <img src="/toldo.png" alt="Toldo" className="w-8 h-8 brightness-0 invert" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black text-white tracking-wide">
                                  Toldos Gastronómicos
                                </h3>
                                <p className="text-amber-200/80 text-sm font-medium">
                                  Ubicación asignada por zonas según
                                  disponibilidad
                                </p>
                              </div>
                            </div>

                            {/* Urgency counter */}
                            <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 mb-5 border border-white/10">
                              <div className="flex justify-between items-end mb-3">
                                <div>
                                  <span className="text-white/80 text-sm font-medium block mb-1">
                                    Disponibilidad
                                  </span>
                                  <span className="text-amber-400 font-black text-2xl">
                                    {toldosAvailable}{' '}
                                    <span className="text-lg text-white/50 font-medium">
                                      de {TOLDOS_TOTAL}
                                    </span>
                                  </span>
                                </div>
                                {toldosAvailable <= 5 && <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    ¡Últimas unidades!
                                  </div>}
                              </div>
                              <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500 relative" style={{
                          width: `${toldosAvailable / TOLDOS_TOTAL * 100}%`
                        }}>
                                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                              {/* Price */}
                              <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10 flex flex-col justify-center">
                                <p className="text-white/70 text-sm font-medium mb-1">
                                  Inversión por toldo
                                </p>
                                <p className="text-3xl font-black text-white">
                                  $300.000{' '}
                                  <span className="text-sm font-medium text-white/50">
                                    + IVA
                                  </span>
                                </p>
                              </div>

                              {/* Quantity selector */}
                              <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10">
                                <label className="text-white/90 text-sm font-medium mb-3 block">
                                  Cantidad a reservar
                                </label>
                                <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg p-1 border border-white/5">
                                  <button onClick={() => setToldosQuantity(Math.max(0, toldosQuantity - 1))} className="w-10 h-10 rounded-md bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center disabled:opacity-30" disabled={toldosQuantity <= 0}>
                                    −
                                  </button>
                                  <input type="number" min="0" max={toldosAvailable} value={toldosQuantity} onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setToldosQuantity(Math.min(Math.max(0, val), toldosAvailable));
                          }} className="w-16 text-center bg-transparent border-none px-2 py-2 text-white font-black text-xl focus:outline-none" />
                                  <button onClick={() => setToldosQuantity(Math.min(toldosAvailable, toldosQuantity + 1))} className="w-10 h-10 rounded-md bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center disabled:opacity-30" disabled={toldosQuantity >= toldosAvailable}>
                                    +
                                  </button>
                                </div>
                                {toldosQuantity === 0 && <p className="text-amber-300/80 text-xs mt-3 text-center font-medium animate-pulse">
                                    ↑ Elige cuántos toldos reservar
                                  </p>}
                                {toldosQuantity > 0 && <p className="text-white/60 text-xs mt-3 text-center">
                                    Continúa en el panel de la derecha →
                                  </p>}
                              </div>
                            </div>
                          </div>
                        </div>}
                    </div>}
                </>;
            return <>
                  <div className="lg:col-span-2 relative bg-gradient-to-br from-[#0a4a5c] to-[#0d3d4d] p-3 sm:p-6 md:p-10 rounded-3xl border-2 border-[#1a6b7f] overflow-x-auto scroll-smooth shadow-2xl">
                    <p className="sm:hidden text-white/70 text-xs text-center mb-4 animate-pulse">
                      Desliza o toca Ver en grande →
                    </p>
                    <button onClick={() => setIsModalOpen(true)} className="absolute top-4 right-4 z-10 bg-brand-cyan text-white rounded-full px-3 py-2 md:px-4 flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors">
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden md:inline text-sm font-bold">
                        Ver en grande
                      </span>
                    </button>
                    <PavilionContent />
                  </div>

                  {/* Modal */}
                  {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/95 backdrop-blur-sm p-4">
                      <motion.div initial={{
                  opacity: 0,
                  scale: 0.95
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  scale: 0.95
                }} className="w-full h-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#0a4a5c] to-[#0d3d4d] rounded-3xl border-2 border-[#1a6b7f] shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-b border-white/10 gap-4 relative">
                          <h2 className="text-xl sm:text-2xl font-bold text-white pr-10 sm:pr-0">
                            {activeTab === 'comercial' ? 'Pabellón Comercial' : 'Food Trucks - Toldos'}
                          </h2>

                          <div className="flex-1 flex justify-center w-full sm:w-auto">
                            <div className="bg-white/10 p-1 rounded-full flex gap-1 w-full sm:w-auto">
                              <button onClick={() => {
                          setActiveTab('comercial');
                          setSelectedStand(null);
                        }} className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${activeTab === 'comercial' ? 'bg-brand-cyan text-white' : 'text-white/60 hover:text-white'}`}>
                                Comercial
                              </button>
                              <button onClick={() => {
                          setActiveTab('foodtrucks');
                          setSelectedStand(null);
                        }} className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${activeTab === 'foodtrucks' ? 'bg-brand-cyan text-white' : 'text-white/60 hover:text-white'}`}>
                                Food Trucks - Toldos
                              </button>
                            </div>
                          </div>

                          <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 bg-white/10 hover:bg-red-500 text-white p-2 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Body with Zoom */}
                        <div className="flex-1 overflow-hidden relative bg-[#083846] cursor-move">
                          <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true} wheel={{
                      step: 0.1
                    }}>
                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center p-8">
                              <div className="bg-gradient-to-br from-[#0a4a5c] to-[#0d3d4d] p-8 rounded-3xl border border-[#1a6b7f] shadow-2xl">
                                <PavilionContent />
                              </div>
                            </TransformComponent>
                          </TransformWrapper>
                        </div>
                      </motion.div>
                    </div>}
                </>;
          })()}

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-28">
                {/* Toldos summary panel: takes priority on toldos sub-tab when quantity > 0 */}
                {activeTab === 'foodtrucks' && ftSubTab === 'toldos' && toldosQuantity > 0 ? <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} key={`toldos-${toldosQuantity}`}>
                    <div className="mb-6">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                        Listo para reservar
                      </span>
                      <h3 className="text-3xl font-bold text-brand-navy">
                        {toldosQuantity} Toldo{toldosQuantity > 1 ? 's' : ''}{' '}
                        Gastronómico{toldosQuantity > 1 ? 's' : ''}
                      </h3>
                      <p className="text-gray-500 font-semibold mt-1">
                        Ubicación asignada por zonas
                      </p>
                    </div>

                    <div className="space-y-2 mb-6 bg-amber-50/60 rounded-xl p-4 border border-amber-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cantidad</span>
                        <span className="font-bold text-brand-navy">
                          {toldosQuantity} ×
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Precio por toldo</span>
                        <span className="font-bold text-brand-navy">
                          {formatCOP(toldosPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-brand-navy">
                          {formatCOP(toldosTotalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">IVA (19%)</span>
                        <span className="font-medium text-brand-navy">
                          {formatCOP(priceBreakdown(toldosTotalPrice).iva)}
                        </span>
                      </div>
                      <div className="border-t border-amber-200 pt-2 flex justify-between items-end">
                        <span className="text-gray-700 font-bold">
                          Total a pagar
                        </span>
                        <span className="font-black text-2xl text-orange-600">
                          {formatCOP(priceBreakdown(toldosTotalPrice).total)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="font-bold text-brand-navy mb-3 text-sm uppercase tracking-wider">
                        Cada toldo incluye:
                      </h4>
                      <ul className="space-y-2">
                        {['1 Toldo de feria + 1 mesa + 1 silla', '1 conexión 110V (TV / PC / celular)', '2 credenciales de expositor', 'Lleva tu propia exhibición'].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                            {item}
                          </li>)}
                      </ul>
                    </div>

                    <button onClick={() => {
                  setRegistrationType('toldo');
                  setIsRegistrationModalOpen(true);
                }} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-500/30">
                      Reservar {toldosQuantity} toldo
                      {toldosQuantity > 1 ? 's' : ''}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div> : selectedStand ? <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} key={selectedStand.id}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                          Disponible
                        </span>
                        {selectedStand.standType === 'AAA' && <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-full text-xs font-bold mb-3 uppercase tracking-wider ml-2">
                            ★★★ SUPER PREMIUM
                          </span>}
                        {selectedStand.standType === 'AA' && <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3 uppercase tracking-wider ml-2">
                            PREMIUM
                          </span>}
                        <h3 className="text-3xl font-bold text-brand-navy">
                          {selectedStand.type === 'foodtrucks' ? 'Food Truck' : 'Stand'}{' '}
                          {selectedStand.id}
                        </h3>
                        <p className="text-gray-500 font-semibold mt-1">
                          {selectedStand.type === 'foodtrucks' ? 'Zona Food Trucks' : 'Pabellón Comercial'}
                        </p>
                      </div>
                    </div>

                    {selectedStand.type === 'foodtrucks' ? <div className="space-y-5 mb-8">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                          <p className="text-sm font-bold text-orange-700 mb-1">
                            Precio por m²
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            $150.000
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-brand-navy mb-3">
                            Ingresa las medidas de tu Food Truck:
                          </p>
                          <div className="flex gap-3 items-center">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">
                                Ancho (m)
                              </label>
                              <input type="number" min={1} max={10} step={0.5} value={ftWidthStr} onChange={(e) => setFtWidthStr(e.target.value)} onBlur={() => {
                          const v = parseFloat(ftWidthStr);
                          if (!v || v < 1) setFtWidthStr('1');else if (v > 10) setFtWidthStr('10');
                        }} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-center font-bold text-brand-navy focus:border-orange-400 focus:outline-none transition-colors" />
                            </div>
                            <span className="text-gray-400 font-bold text-lg mt-5">
                              ×
                            </span>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">
                                Largo (m)
                              </label>
                              <input type="number" min={1} max={10} step={0.5} value={ftLengthStr} onChange={(e) => setFtLengthStr(e.target.value)} onBlur={() => {
                          const v = parseFloat(ftLengthStr);
                          if (!v || v < 1) setFtLengthStr('1');else if (v > 10) setFtLengthStr('10');
                        }} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-center font-bold text-brand-navy focus:border-orange-400 focus:outline-none transition-colors" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-brand-navy/5 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Área total</span>
                            <span className="font-bold text-brand-navy">
                              {ftTotalM2.toFixed(2)} m²
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Precio × m²</span>
                            <span className="font-bold text-brand-navy">
                              {formatCOP(ftPricePerM2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-brand-navy">
                              {formatCOP(ftTotalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">IVA (19%)</span>
                            <span className="font-medium text-brand-navy">
                              {formatCOP(priceBreakdown(ftTotalPrice).iva)}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between">
                            <span className="text-gray-700 font-bold">
                              Total a pagar
                            </span>
                            <span className="font-bold text-xl text-orange-600">
                              {formatCOP(priceBreakdown(ftTotalPrice).total)}
                            </span>
                          </div>
                        </div>
                      </div> : <div className="space-y-4 mb-8">
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-500">Dimensiones</span>
                          <span className="font-bold text-brand-navy">
                            {selectedStand.size}
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-500">Frentes</span>
                          <span className="font-bold text-brand-navy">
                            {selectedStand.frentes}
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-500">Inversión</span>
                          <span className="font-medium text-brand-navy">
                            {formatCOP(selectedStand.price)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-500 text-sm">
                            IVA (19%)
                          </span>
                          <span className="font-medium text-brand-navy text-sm">
                            {formatCOP(priceBreakdown(selectedStand.price).iva)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-200">
                          <span className="text-brand-navy font-bold">
                            Total a pagar
                          </span>
                          <span className="font-black text-xl text-brand-navy">
                            {formatCOP(priceBreakdown(selectedStand.price).total)}
                          </span>
                        </div>
                      </div>}

                    <div className="mb-8">
                      <h4 className="font-bold text-brand-navy mb-3 text-sm uppercase tracking-wider">
                        Incluye:
                      </h4>
                      <ul className="space-y-2">
                        {(selectedStand.type === 'foodtrucks' ? ['Espacio para food truck', 'Energía de planta incluida', '2 credenciales de expositor', 'NO incluye punto de agua'] : ['1 conexión 110V (1 TV / 1 computador / 1 celular)', '2 credenciales de expositor', 'Estructura dentro de la carpa', 'Lleva tu propia exhibición (mesas y sillas adicionales bajo solicitud)', 'Ubicación según disponibilidad']).map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                            {item}
                          </li>)}
                      </ul>
                    </div>

                    <button onClick={() => {
                  setRegistrationType(selectedStand.type === 'foodtrucks' ? 'foodtruck' : 'comercial');
                  setIsRegistrationModalOpen(true);
                }} className="w-full flex items-center justify-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/30">
                      Reservar Espacio
                    </button>
                  </motion.div> : <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-60">
                    <Info className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-brand-navy mb-2">
                      {activeTab === 'foodtrucks' && ftSubTab === 'toldos' ? 'Selecciona la cantidad' : activeTab === 'foodtrucks' ? 'Ningún espacio seleccionado' : 'Ningún stand seleccionado'}
                    </h3>
                    <p className="text-gray-500">
                      {activeTab === 'foodtrucks' && ftSubTab === 'toldos' ? 'Elige cuántos toldos quieres reservar a la izquierda y aquí verás el resumen.' : `Haz clic en un ${activeTab === 'foodtrucks' ? 'espacio' : 'stand'} disponible en el mapa para ver sus detalles y reservarlo.`}
                    </p>
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Exhibit Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              ¿Por qué ser expositor?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Únete a la feria más importante de la región y haz crecer tu
              negocio en un ambiente lleno de energía y propósito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
            icon: Users,
            title: 'Gran Audiencia',
            desc: 'Más de 2,000 visitantes esperados durante todo el día del evento.',
            color: 'text-brand-cyan',
            bg: 'bg-brand-cyan/10'
          }, {
            icon: Store,
            title: 'Visibilidad',
            desc: 'Posicionamiento de marca en un entorno premium y familiar.',
            color: 'text-brand-yellow',
            bg: 'bg-brand-yellow/10'
          }, {
            icon: MessageSquare,
            title: 'Networking',
            desc: 'Conecta con otras marcas líderes del sector bienestar y mascotas.',
            color: 'text-brand-green',
            bg: 'bg-brand-green/10'
          }, {
            icon: TrendingUp,
            title: 'Ventas Directas',
            desc: 'Comercializa tus productos y servicios directamente a tu público objetivo.',
            color: 'text-brand-navy',
            bg: 'bg-brand-navy/10'
          }].map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Pavilion Info Section - UPDATE: REMOVE GASTRONOMICO, KEEP ONLY 2 CARDS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Comercial */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-brand-cyan/10 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-brand-cyan" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-navy">
                    Pabellón Comercial
                  </h3>
                  <p className="text-brand-cyan font-medium">
                    36 Stands Disponibles
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-8">
                Ideal para marcas de ropa deportiva, accesorios para mascotas,
                suplementos, tecnología y servicios de bienestar. Ubicado en la
                zona de mayor tráfico peatonal.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">
                    Stand A (1 frente, 2x2m)
                  </span>
                  <span className="font-bold text-brand-navy">$500.000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">
                    Stand AA (2 frentes, 2x2m)
                  </span>
                  <span className="font-bold text-brand-navy">$600.000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">
                    Stand AAA (3 frentes, 2x2m)
                  </span>
                  <span className="font-bold text-brand-navy">$800.000</span>
                </div>
              </div>
            </motion.div>

            {/* Food Trucks & Toldos */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <Truck className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-navy">
                    Food Trucks & Toldos
                  </h3>
                  <p className="text-orange-500 font-medium">
                    8 Food Trucks + 20 Toldos
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-8">
                Espacios diseñados para food trucks y toldos gastronómicos.
                Excelente ubicación cerca a la tarima principal y zonas de alto
                tráfico.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Food Truck (variable)</span>
                  <span className="font-bold text-brand-navy">$150.000/m²</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Toldo Gastronómico</span>
                  <span className="font-bold text-brand-navy">$300.000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Energía de planta</span>
                  <span className="font-bold text-brand-green">Incluido</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Summary - UPDATE: REMOVE GASTRONOMICO, UPDATE PRICES */}
      <section className="py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-paw-pattern-white opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Resumen de Inversión
            </h2>
            <p className="text-white/70">
              Opciones adaptadas a las necesidades de tu marca
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Stand A */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Stand A</h3>
              <p className="text-gray-300 mb-6">2×2m · 1 frente</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">$500.000</span>
                <span className="text-white/50 text-sm"> + IVA</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-brand-cyan" /> Dentro de carpa
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-brand-cyan" /> 1 Conexión 110V
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-brand-cyan" /> 2 Credenciales
                </li>
              </ul>
            </motion.div>

            {/* Stand AA */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.1
          }} className="bg-amber-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-amber-400">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 px-4 py-1 rounded-bl-xl text-xs font-bold">
                PREMIUM
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Stand AA</h3>
              <p className="text-amber-300 mb-6">2×2m · 2 frentes</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">$600.000</span>
                <span className="text-white/50 text-sm"> + IVA</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="w-4 h-4 text-amber-400" /> Ubicación esquina
                </li>
                <li className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="w-4 h-4 text-amber-400" /> Doble frente
                </li>
                <li className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="w-4 h-4 text-amber-400" /> 2 Credenciales
                </li>
              </ul>
            </motion.div>

            {/* Stand AAA */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.2
          }} className="bg-gradient-to-br from-yellow-500/30 to-amber-500/30 backdrop-blur-sm rounded-3xl p-8 border-2 border-yellow-500 relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-4 py-1 rounded-bl-xl text-xs font-bold">
                ★★★ SUPER PREMIUM
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Stand AAA</h3>
              <p className="text-yellow-300 mb-6">2×2m · 3 frentes</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">$800.000</span>
                <span className="text-white/50 text-sm"> + IVA</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="w-4 h-4 text-yellow-400" /> Ubicación
                  central
                </li>
                <li className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="w-4 h-4 text-yellow-400" /> Triple frente
                </li>
                <li className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="w-4 h-4 text-yellow-400" /> Máxima
                  visibilidad
                </li>
              </ul>
            </motion.div>

            {/* Food Trucks */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.3
          }} className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Food Trucks</h3>
              <p className="text-orange-400 mb-6">Variable</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">$150.000</span>
                <span className="text-white/50 text-sm"> /m² + IVA</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-orange-400" /> Espacio para
                  vehículo
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-orange-400" /> Energía de
                  planta
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-orange-400" /> 2 Credenciales
                </li>
              </ul>
            </motion.div>

            {/* Toldos */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.4
          }} className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Toldos</h3>
              <p className="text-brand-green mb-6">Gastronómico</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">$300.000</span>
                <span className="text-white/50 text-sm"> + IVA</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-brand-green" /> Toldo + mesa +
                  silla
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-brand-green" /> 1 Conexión 110V
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-brand-green" /> 2 Credenciales
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">
            ¿Necesitas un montaje especial?
          </h2>
          <p className="text-gray-600 mb-10">
            Si tu marca requiere un espacio mayor a 16m² o un diseño
            arquitectónico personalizado (Free Design), nuestro equipo comercial
            está listo para asesorarte.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold transition-colors shadow-lg">
              <MessageSquare className="w-5 h-5" /> Contactar por WhatsApp
            </a>
            <a href="mailto:comercial@latidoyhuella.com" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-8 py-4 rounded-full font-bold transition-colors">
              <Mail className="w-5 h-5" /> Enviar Correo
            </a>
          </div>
        </div>
      </section>

      <ExpositorRegistrationModal open={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} type={registrationType} selectedStand={selectedStand} price={registrationType === 'toldo' ? toldosPrice : selectedStand?.type === 'foodtrucks' ? ftPricePerM2 : selectedStand?.price || 0} quantity={toldosQuantity} ftDimensions={{
      width: ftWidth,
      length: ftLength,
      totalM2: ftTotalM2
    }} />
    </div>;
}
// Helper icon for corner stands
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>;
}