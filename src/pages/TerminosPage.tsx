import React, { useEffect, useState, memo, Component } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Camera, Baby, Dog, UtensilsCrossed, AlertTriangle, CloudRain, CreditCard, Ban, Building2, Phone, MapPin, Footprints, Trophy, Store, Star, Scale, Menu, X } from 'lucide-react';
type AcceptanceType = 'Obligatorio' | 'Recomendado' | 'Condicional' | 'Solo Plan Oro' | 'Compromiso org.';
interface ClauseRow {
  point: string;
  description: string;
  type: AcceptanceType;
}
const BADGE_STYLES: Record<AcceptanceType, string> = {
  Obligatorio: 'bg-red-100 text-red-700 border-red-200',
  Recomendado: 'bg-amber-100 text-amber-700 border-amber-200',
  Condicional: 'bg-blue-100 text-blue-700 border-blue-200',
  'Solo Plan Oro': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Compromiso org.': 'bg-green-100 text-green-700 border-green-200'
};
// ─────────────────────────────────────────────────────────
// SECTION DATA
// ─────────────────────────────────────────────────────────
const CAMINATA_ROWS: ClauseRow[] = [{
  point: 'Edad mínima',
  description: 'Podrán participar personas mayores de 16 años. Los menores de edad deberán contar con autorización y acompañamiento de un adulto responsable.',
  type: 'Obligatorio'
}, {
  point: 'Estado de salud del participante',
  description: 'El participante declara que se encuentra en condiciones físicas aptas para realizar la caminata. Se recomienda contar con afiliación activa a EPS, ARL, póliza de salud o cobertura médica vigente.',
  type: 'Obligatorio'
}, {
  point: 'Responsabilidad sobre la mascota',
  description: 'El dueño, tenedor o acompañante de la mascota será completamente responsable por el comportamiento, control, cuidado, hidratación, seguridad y bienestar del animal durante todo el evento.',
  type: 'Obligatorio'
}, {
  point: 'Bienestar animal',
  description: 'Los animales son reconocidos en Colombia como seres sintientes y deben ser protegidos contra el sufrimiento, el maltrato, el dolor, el miedo, el estrés y la negligencia. Cada responsable deberá garantizar condiciones adecuadas de hidratación, descanso, trato digno, control y seguridad para su mascota.',
  type: 'Obligatorio'
}, {
  point: 'Requisitos de la mascota',
  description: 'La mascota deberá contar con vacunas al día, estar en buen estado de salud, portar correa en todo momento, usar collar o arnés seguro, y el responsable deberá llevar bolsas para recoger desechos. Las mascotas de manejo especial, gran tamaño, comportamiento reactivo o características que lo requieran deberán usar bozal.',
  type: 'Obligatorio'
}, {
  point: 'Mascotas no aptas para participar',
  description: 'No deberán participar mascotas enfermas, recién operadas, en estado avanzado de gestación, con lesiones, signos de agotamiento, problemas respiratorios graves, alto nivel de estrés, agresividad no controlada o cualquier condición que ponga en riesgo su bienestar o el de otros asistentes.',
  type: 'Obligatorio'
}, {
  point: 'Control y convivencia',
  description: 'El responsable deberá mantener el control físico de su mascota en todo momento. No se permitirá dejar mascotas sueltas, abandonadas, amarradas sin supervisión o bajo el cuidado de menores sin acompañamiento adulto.',
  type: 'Obligatorio'
}, {
  point: 'Recolección de desechos',
  description: 'Cada responsable deberá recoger y disponer adecuadamente los desechos de su mascota en los puntos habilitados.',
  type: 'Obligatorio'
}, {
  point: 'Hidratación y descanso',
  description: 'El responsable deberá garantizar pausas, hidratación y bienestar de su mascota durante la caminata. La organización podrá recomendar o exigir el retiro de una mascota si evidencia signos de fatiga, estrés, lesión o riesgo.',
  type: 'Obligatorio'
}, {
  point: 'Accidentes o incidentes',
  description: 'El dueño o tenedor de la mascota responderá por daños, lesiones, mordeduras, accidentes, perjuicios o afectaciones causadas por su animal a personas, mascotas, bienes, infraestructura o terceros.',
  type: 'Obligatorio'
}, {
  point: 'Política de reembolso',
  description: 'No habrá devolución de dinero por inasistencia, retiro voluntario, condiciones climáticas, cambios operativos o decisión personal del participante. Se permitirá cambio de titular hasta 72 horas antes del evento, previa validación de la organización.',
  type: 'Obligatorio'
}, {
  point: 'Entrega de kit',
  description: 'El kit deberá recogerse en las fechas, horarios y lugares establecidos por la organización. No se realizarán envíos a domicilio, salvo que la organización comunique expresamente una opción diferente.',
  type: 'Obligatorio'
}, {
  point: 'Certificado digital',
  description: 'La entrega del certificado digital estará sujeta a la participación efectiva en la actividad y a los procesos definidos por la organización.',
  type: 'Condicional'
}];
const DEPORTES_ROWS: ClauseRow[] = [{
  point: 'Edad mínima',
  description: 'Podrán participar mayores de 16 años. Las categorías infantiles, cuando existan, podrán incluir participantes entre 8 y 15 años con autorización expresa de sus padres o acudientes.',
  type: 'Obligatorio'
}, {
  point: 'Estado físico',
  description: 'Cada participante declara estar en condiciones físicas, médicas y psicológicas aptas para participar en actividades deportivas. La participación es voluntaria y bajo responsabilidad personal.',
  type: 'Obligatorio'
}, {
  point: 'Riesgo deportivo',
  description: 'El participante reconoce que toda actividad deportiva implica riesgos de caídas, golpes, lesiones, fatiga, contacto físico, accidentes o afectaciones derivadas de la práctica deportiva.',
  type: 'Obligatorio'
}, {
  point: 'Afiliación o seguro médico',
  description: 'Se recomienda que cada participante cuente con EPS activa, seguro médico, póliza deportiva o cobertura de salud. El evento podrá contar con personal paramédico o atención inicial, pero esto no reemplaza la cobertura médica personal.',
  type: 'Recomendado'
}, {
  point: 'Reglamento deportivo',
  description: 'Las actividades se desarrollarán bajo reglas deportivas adaptadas según la categoría, tipo de torneo, edad de participantes, espacio disponible y lineamientos de la organización.',
  type: 'Obligatorio'
}, {
  point: 'Fútbol',
  description: 'La inscripción en fútbol podrá realizarse por clubes, equipos o grupos previamente definidos por la organización. Cada equipo deberá cumplir con los requisitos de inscripción, número de jugadores, horarios, categorías y reglas del torneo.',
  type: 'Obligatorio'
}, {
  point: 'Pádel',
  description: 'La participación en pádel estará sujeta a disponibilidad de cupos, categorías, horarios, parejas inscritas, reglamento interno y condiciones del espacio deportivo.',
  type: 'Obligatorio'
}, {
  point: 'Tenis',
  description: 'Las actividades de tenis estarán sujetas a confirmación de disponibilidad, permisos, programación y condiciones técnicas definidas por la organización.',
  type: 'Condicional'
}, {
  point: 'Arbitraje',
  description: 'Los partidos o competencias podrán contar con árbitros, jueces o personal designado por la organización. Sus decisiones serán respetadas y tendrán carácter definitivo dentro del desarrollo de la actividad.',
  type: 'Obligatorio'
}, {
  point: 'Conducta deportiva',
  description: 'No se permitirá violencia, agresiones, lenguaje ofensivo, amenazas, discriminación, consumo de sustancias prohibidas, juego antideportivo o comportamientos que afecten la seguridad y convivencia.',
  type: 'Obligatorio'
}, {
  point: 'Alcohol en actividades deportivas',
  description: 'En actividades deportivas, la organización podrá restringir el ingreso, consumo o porte de bebidas alcohólicas, especialmente cuando afecten la seguridad, convivencia o desarrollo de la competencia. En Colombia existen normas específicas orientadas a prevenir violencia y riesgos en eventos deportivos.',
  type: 'Obligatorio'
}, {
  point: 'Política de reembolso',
  description: 'No habrá devolución de dinero por inasistencia, retiro, lesión, eliminación del torneo o decisión voluntaria del participante. Se permitirá cambio de jugador hasta 72 horas antes del evento, previa aprobación de la organización.',
  type: 'Obligatorio'
}];
const MASCOTAS_ROWS: ClauseRow[] = [{
  point: 'Tenencia responsable',
  description: 'Cada asistente será responsable de su mascota durante todo el evento. La tenencia responsable implica garantizar alimentación, hidratación, movilidad, bienestar, atención veterinaria cuando sea necesario y prevención de riesgos para otros animales o personas.',
  type: 'Obligatorio'
}, {
  point: 'Mascotas bajo control',
  description: 'Las mascotas deberán permanecer con correa, collar, arnés u otro elemento de control seguro. No se permitirá el tránsito de mascotas sin supervisión.',
  type: 'Obligatorio'
}, {
  point: 'Bozal',
  description: 'Las mascotas de manejo especial, razas fuertes, gran tamaño, animales reactivos o aquellos que puedan representar riesgo deberán utilizar bozal adecuado.',
  type: 'Obligatorio'
}, {
  point: 'Salud animal',
  description: 'No se permitirá la participación de mascotas con signos evidentes de enfermedad contagiosa, heridas abiertas, agresividad no controlada, agotamiento severo o condiciones que afecten su bienestar.',
  type: 'Obligatorio'
}, {
  point: 'Actividades para mascotas',
  description: 'La participación en juegos, pasarelas, circuitos, concursos o dinámicas estará sujeta a disponibilidad, cupos, seguridad, comportamiento del animal y criterios del equipo organizador.',
  type: 'Condicional'
}, {
  point: 'Retiro de mascotas',
  description: 'La organización podrá solicitar el retiro de una mascota si representa riesgo, muestra signos de estrés, agresividad, enfermedad, agotamiento o afecta el bienestar de otros asistentes.',
  type: 'Obligatorio'
}];
const EXPOSITORES_ROWS: ClauseRow[] = [{
  point: 'Pago y reserva',
  description: 'La reserva del stand se realizará con el pago del 50% del valor total. El 50% restante deberá pagarse máximo 15 días antes del evento, salvo acuerdo escrito diferente con la organización.',
  type: 'Obligatorio'
}, {
  point: 'Confirmación del espacio',
  description: 'El espacio solo se considerará confirmado cuando exista comprobante de pago, validación de la organización y aceptación de los presentes términos.',
  type: 'Obligatorio'
}, {
  point: 'Montaje y desmontaje',
  description: 'El montaje se realizará el 25 de julio de 2026 entre 2:00 p.m. y 8:00 p.m. El desmontaje deberá realizarse el 26 de julio de 2026 en el horario definido por la organización, sin afectar la operación ni la seguridad del evento.',
  type: 'Obligatorio'
}, {
  point: 'Uso del espacio',
  description: 'El expositor no podrá exceder las dimensiones asignadas, invadir zonas comunes, modificar estructuras, bloquear rutas de evacuación ni instalar elementos no autorizados.',
  type: 'Obligatorio'
}, {
  point: 'Productos prohibidos',
  description: 'No se permitirá la venta, exhibición o promoción de armas, pólvora, tabaco, vapeadores, sustancias ilegales, productos falsificados, medicamentos sin autorización, productos peligrosos, material ofensivo o cualquier producto prohibido por la ley colombiana o por la organización.',
  type: 'Obligatorio'
}, {
  point: 'Bebidas alcohólicas',
  description: 'La venta o distribución de bebidas alcohólicas solo podrá realizarse si cuenta con autorización expresa de la organización y cumplimiento de los permisos legales correspondientes. La organización podrá prohibir o limitar su venta y consumo según instrucciones de las autoridades.',
  type: 'Condicional'
}, {
  point: 'Permisos sanitarios',
  description: 'Los expositores gastronómicos o de productos de consumo deberán contar con los permisos, registros, prácticas higiénicas y condiciones sanitarias exigidas por la normativa colombiana y por las autoridades competentes.',
  type: 'Obligatorio'
}, {
  point: 'Responsabilidad por productos',
  description: 'Cada expositor será responsable por la calidad, origen, seguridad, empaque, manipulación, promoción, garantía, información y venta de sus productos o servicios.',
  type: 'Obligatorio'
}, {
  point: 'Seguridad del stand',
  description: 'El expositor será responsable de sus productos, dinero, equipos, mobiliario, inventario y pertenencias. La organización no responderá por pérdidas, hurtos, daños o deterioros, salvo que exista responsabilidad comprobada de la organización.',
  type: 'Obligatorio'
}, {
  point: 'Personal del expositor',
  description: 'El expositor será responsable del comportamiento, presentación, puntualidad, permisos, afiliaciones, alimentación, seguridad y cumplimiento de normas por parte de su equipo de trabajo.',
  type: 'Obligatorio'
}, {
  point: 'Cancelación por parte del expositor',
  description: 'Si el expositor cancela con más de 30 días de anticipación, podrá recibir hasta el 70% de reembolso. Si cancela con menos de 30 días de anticipación, no habrá devolución.',
  type: 'Obligatorio'
}, {
  point: 'Cesión del stand',
  description: 'La cesión o transferencia del stand a otra marca solo será permitida con autorización previa y escrita de la organización.',
  type: 'Condicional'
}, {
  point: 'Uso de marca del evento',
  description: 'El expositor no podrá utilizar el nombre, logo, imagen o marca Latido & Huella en piezas comerciales no autorizadas previamente por la organización.',
  type: 'Obligatorio'
}];
const GASTRONOMIA_ROWS: ClauseRow[] = [{
  point: 'Permisos y manipulación de alimentos',
  description: 'Todo expositor gastronómico deberá cumplir con normas de higiene, manipulación, conservación, preparación y venta de alimentos aplicables en Colombia.',
  type: 'Obligatorio'
}, {
  point: 'Responsabilidad sanitaria',
  description: 'El expositor será responsable por cualquier afectación, reclamo, intoxicación, alergia, contaminación, mala manipulación o incumplimiento sanitario relacionado con sus productos.',
  type: 'Obligatorio'
}, {
  point: 'Información al consumidor',
  description: 'Los productos deberán informar de manera clara precios, ingredientes relevantes, posibles alérgenos y condiciones especiales cuando aplique.',
  type: 'Obligatorio'
}, {
  point: 'Mascotas y alimentos',
  description: 'Los productos alimenticios para mascotas deberán diferenciarse claramente de los productos para consumo humano y cumplir condiciones adecuadas de empaque, manipulación y comunicación.',
  type: 'Obligatorio'
}, {
  point: 'Residuos',
  description: 'Cada expositor deberá mantener limpio su espacio y disponer adecuadamente de residuos, empaques, aceites, líquidos o materiales generados durante su operación.',
  type: 'Obligatorio'
}];
const PATROCINADORES_ROWS: ClauseRow[] = [{
  point: 'Contrato formal',
  description: 'Todo patrocinio deberá formalizarse mediante acuerdo, propuesta aprobada, orden de servicio, contrato o documento comercial que detalle beneficios, obligaciones, tiempos y contraprestaciones.',
  type: 'Obligatorio'
}, {
  point: 'Pago',
  description: 'El patrocinador deberá pagar el 50% al momento de la firma o confirmación del patrocinio y el 50% restante máximo 30 días antes del evento, salvo acuerdo escrito diferente.',
  type: 'Obligatorio'
}, {
  point: 'Material gráfico',
  description: 'El patrocinador deberá entregar logos, manual de marca, piezas, artes, materiales y archivos en alta calidad dentro de los tiempos establecidos por la organización.',
  type: 'Obligatorio'
}, {
  point: 'Uso de marca del patrocinador',
  description: 'El patrocinador autoriza a la organización a usar su nombre, logo, imagen comercial y material gráfico únicamente para fines relacionados con la promoción, ejecución y memoria del evento.',
  type: 'Obligatorio'
}, {
  point: 'Exclusividad categorial',
  description: 'La exclusividad por categoría solo aplicará cuando esté expresamente pactada en el plan de patrocinio correspondiente, especialmente en planes Oro o superiores.',
  type: 'Solo Plan Oro'
}, {
  point: 'Activaciones de marca',
  description: 'Toda activación, entrega de muestras, instalación, dinámica comercial, concurso, material publicitario o intervención en el evento deberá ser aprobada previamente por la organización.',
  type: 'Obligatorio'
}, {
  point: 'Cancelación',
  description: 'Si el patrocinador cancela con más de 60 días de anticipación, podrá recibir hasta el 50% de reembolso. Si cancela con menos de 60 días de anticipación, no habrá devolución.',
  type: 'Obligatorio'
}, {
  point: 'Reporte post-evento',
  description: 'La organización podrá entregar un reporte de impacto, registro fotográfico, indicadores generales o memoria del evento dentro de los 30 días posteriores, según el plan contratado.',
  type: 'Compromiso org.'
}];
const PROHIBICIONES: string[] = ['Ingresar armas, pólvora, sustancias ilegales o elementos peligrosos.', 'Maltratar, abandonar, golpear, forzar o poner en riesgo a cualquier animal.', 'Ingresar mascotas enfermas, agresivas sin control o sin elementos de seguridad.', 'Vender productos no autorizados.', 'Realizar publicidad, activaciones o ventas sin permiso de la organización.', 'Consumir o distribuir alcohol sin autorización.', 'Afectar la convivencia, seguridad o tranquilidad de otros asistentes.', 'Dañar infraestructura, zonas verdes, mobiliario, stands o elementos del evento.', 'Bloquear salidas de emergencia, rutas de evacuación o zonas operativas.', 'Usar indebidamente la marca Latido & Huella.', 'Incumplir instrucciones del personal logístico o autoridades.'];
// ─────────────────────────────────────────────────────────
// NAVIGATION INDEX
// ─────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{
    className?: string;
  }>;
  group: 'general' | 'contractual' | 'operativo';
}
const NAV_ITEMS: NavItem[] = [{
  id: 'introduccion',
  label: '1. Introducción',
  icon: FileText,
  group: 'general'
}, {
  id: 'naturaleza',
  label: '2. Naturaleza del evento',
  icon: Star,
  group: 'general'
}, {
  id: 'normativa',
  label: '3. Cumplimiento normativo',
  icon: Scale,
  group: 'general'
}, {
  id: 'datos',
  label: '4. Protección de datos',
  icon: Shield,
  group: 'general'
}, {
  id: 'imagen',
  label: '5. Uso de imagen',
  icon: Camera,
  group: 'general'
}, {
  id: 'ingreso',
  label: '6. Condiciones de ingreso',
  icon: Building2,
  group: 'general'
}, {
  id: 'menores',
  label: '7. Menores de edad',
  icon: Baby,
  group: 'general'
}, {
  id: 'caminata',
  label: 'Caminata Canina',
  icon: Footprints,
  group: 'contractual'
}, {
  id: 'deportes',
  label: 'Deportes',
  icon: Trophy,
  group: 'contractual'
}, {
  id: 'mascotas',
  label: 'Zona de mascotas',
  icon: Dog,
  group: 'contractual'
}, {
  id: 'expositores',
  label: 'Expositores',
  icon: Store,
  group: 'contractual'
}, {
  id: 'gastronomia',
  label: 'Gastronomía',
  icon: UtensilsCrossed,
  group: 'contractual'
}, {
  id: 'patrocinadores',
  label: 'Patrocinadores',
  icon: Star,
  group: 'contractual'
}, {
  id: 'seguridad',
  label: 'Seguridad y emergencias',
  icon: AlertTriangle,
  group: 'operativo'
}, {
  id: 'clima',
  label: 'Clima y fuerza mayor',
  icon: CloudRain,
  group: 'operativo'
}, {
  id: 'pagos',
  label: 'Pagos y reembolsos',
  icon: CreditCard,
  group: 'operativo'
}, {
  id: 'prohibiciones',
  label: 'Prohibiciones generales',
  icon: Ban,
  group: 'operativo'
}, {
  id: 'responsabilidad',
  label: 'Responsabilidad',
  icon: Shield,
  group: 'operativo'
}, {
  id: 'contacto',
  label: 'Contacto',
  icon: Phone,
  group: 'operativo'
}];
// ─────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────
function Badge({
  type


}: {type: AcceptanceType;}) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${BADGE_STYLES[type]}`}>
      {type}
    </span>;
}
function ClauseTable({
  rows


}: {rows: ClauseRow[];}) {
  return <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-brand-navy uppercase tracking-wider w-1/4">
                Punto
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-brand-navy uppercase tracking-wider">
                Descripción
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-brand-navy uppercase tracking-wider w-44">
                Aceptación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5 align-top">
                  <span className="font-bold text-brand-navy text-sm">
                    {row.point}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {row.description}
                  </p>
                </td>
                <td className="px-6 py-5 align-top">
                  <Badge type={row.type} />
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {rows.map((row, i) => <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="font-bold text-brand-navy text-sm leading-snug">
                {row.point}
              </h4>
              <Badge type={row.type} />
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {row.description}
            </p>
          </div>)}
      </div>
    </>;
}
function SectionHeader({
  id,
  icon: Icon,
  title,
  subtitle







}: {id: string;icon: ComponentType<{className?: string;}>;title: string;subtitle?: string;}) {
  return <div id={id} className="scroll-mt-28 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-brand-cyan" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-gray-500 text-sm md:text-base ml-13 pl-1">
          {subtitle}
        </p>}
    </div>;
}
function Prose({
  children


}: {children: React.ReactNode;}) {
  return <div className="prose-custom space-y-4 text-gray-700 text-[15px] leading-relaxed">
      {children}
    </div>;
}
// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────
export function TerminosPage() {
  const [activeId, setActiveId] = useState<string>('introduccion');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const offsets = NAV_ITEMS.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return {
          id: item.id,
          top: Infinity
        };
        const rect = el.getBoundingClientRect();
        return {
          id: item.id,
          top: rect.top
        };
      });
      const current = offsets.filter((o) => o.top <= 140).sort((a, b) => b.top - a.top)[0];
      if (current) setActiveId(current.id);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setMobileNavOpen(false);
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="bg-gradient-to-br from-brand-navy via-brand-navy to-[#0a1450] text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-paw-pattern-white opacity-[0.04] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full mb-5">
              <Scale className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
                Documento legal
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Términos y Condiciones
              <span className="block text-brand-cyan mt-1">
                Latido & Huella
              </span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-3xl flex items-center gap-2 flex-wrap">
              <MapPin className="w-4 h-4 inline" /> Rionegro, Antioquia,
              Colombia
              <span className="text-white/40 mx-1">·</span>
              26 de julio de 2026
            </p>
            <p className="text-white/60 text-sm mt-3">
              Última actualización: Mayo 2026
            </p>
          </motion.div>
        </div>
      </header>

      {/* Mobile nav toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand-navy">
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            Índice de contenido
          </span>
          <span className="text-xs text-gray-500">
            {NAV_ITEMS.find((i) => i.id === activeId)?.label}
          </span>
        </button>
        {mobileNavOpen && <div className="border-t border-gray-100 max-h-[60vh] overflow-y-auto bg-white">
            <nav className="px-2 py-2 space-y-0.5">
              {NAV_ITEMS.map((item) => <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${activeId === item.id ? 'bg-brand-cyan/10 text-brand-cyan font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>)}
            </nav>
          </div>}
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">
                Información general
              </p>
              <nav className="space-y-0.5 mb-6">
                {NAV_ITEMS.filter((i) => i.group === 'general').map((item) => <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${activeId === item.id ? 'bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-navy border-l-2 border-transparent'}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>)}
              </nav>

              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">
                Por actividad
              </p>
              <nav className="space-y-0.5 mb-6">
                {NAV_ITEMS.filter((i) => i.group === 'contractual').map((item) => <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${activeId === item.id ? 'bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-navy border-l-2 border-transparent'}`}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>)}
              </nav>

              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">
                Condiciones operativas
              </p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.filter((i) => i.group === 'operativo').map((item) => <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${activeId === item.id ? 'bg-brand-cyan/10 text-brand-cyan font-semibold border-l-2 border-brand-cyan' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-navy border-l-2 border-transparent'}`}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>)}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="space-y-16 lg:space-y-20 min-w-0">
            {/* 1. Introducción */}
            <section>
              <SectionHeader id="introduccion" icon={FileText} title="1. Introducción general" />
              <Prose>
                <p>
                  Bienvenido a <strong>Latido & Huella</strong>, un evento
                  familiar, deportivo, cultural, comercial y pet friendly que se
                  realizará en Rionegro, Antioquia, Colombia.
                </p>
                <p>
                  Al inscribirse, asistir, participar como deportista,
                  caminante, expositor, patrocinador, proveedor, acompañante o
                  visitante, la persona declara haber leído, entendido y
                  aceptado los presentes Términos y Condiciones.
                </p>
                <p>
                  Estos términos tienen como finalidad establecer reglas claras
                  para garantizar una experiencia segura, organizada y
                  responsable para todos los asistentes, sus familias, sus
                  mascotas, los expositores, las marcas participantes, el equipo
                  organizador y las autoridades competentes.
                </p>
                <p>
                  El evento se desarrollará bajo las normas aplicables en
                  Colombia, las disposiciones del municipio de Rionegro, las
                  políticas internas de la organización y las instrucciones
                  emitidas por autoridades de policía, tránsito, salud, gestión
                  del riesgo, protección animal y demás entidades que
                  intervengan en la autorización o supervisión del evento.
                </p>
              </Prose>
            </section>

            {/* 2. Naturaleza */}
            <section>
              <SectionHeader id="naturaleza" icon={Star} title="2. Naturaleza del evento" />
              <Prose>
                <p>
                  Latido & Huella es un evento integral que combina actividades
                  familiares, deportivas, recreativas, comerciales,
                  gastronómicas, educativas y de bienestar. El evento podrá
                  incluir caminata canina, zonas deportivas, actividades
                  infantiles, zona de mascotas, tarima principal, charlas,
                  talleres, muestras comerciales, gastronomía, activaciones de
                  marca y espacios para patrocinadores.
                </p>
                <p>
                  La organización se reserva el derecho de modificar la
                  programación, horarios, espacios, actividades, recorridos,
                  invitados, marcas participantes o condiciones logísticas
                  cuando existan razones de seguridad, clima, fuerza mayor,
                  permisos, recomendaciones de autoridades o necesidades
                  operativas del evento.
                </p>
              </Prose>
            </section>

            {/* 3. Normativa */}
            <section>
              <SectionHeader id="normativa" icon={Scale} title="3. Cumplimiento normativo en Colombia y Rionegro" />
              <Prose>
                <p>
                  El evento se realizará en Rionegro, Antioquia, Colombia, y
                  estará sujeto a las normas nacionales, departamentales y
                  municipales aplicables. La organización gestionará los
                  permisos y autorizaciones requeridos ante las autoridades
                  competentes, según la naturaleza, aforo, ubicación,
                  actividades y características del evento.
                </p>
                <p>
                  Cuando aplique, la organización tendrá en cuenta los
                  lineamientos relacionados con eventos de aglomeración de
                  público, gestión del riesgo, seguridad, movilidad, convivencia
                  ciudadana, protección animal, salubridad, permisos sanitarios,
                  protección de datos personales, uso de imagen y demás
                  requisitos exigidos por la normativa colombiana y municipal.
                  La normativa colombiana sobre eventos masivos contempla planes
                  de emergencia y contingencia para eventos de afluencia masiva
                  de público, y la Alcaldía de Rionegro señala la obligatoriedad
                  del trámite de autorización para eventos con gran asistencia.
                </p>
                <p>
                  Los asistentes, participantes, expositores y patrocinadores
                  deberán cumplir las instrucciones del personal logístico,
                  autoridades, organismos de socorro, seguridad privada, Policía
                  Nacional, tránsito, personal médico y representantes de la
                  organización.
                </p>
              </Prose>
            </section>

            {/* 4. Datos personales */}
            <section>
              <SectionHeader id="datos" icon={Shield} title="4. Protección de datos personales" subtitle="Habeas Data — Ley 1581 de 2012" />
              <Prose>
                <p>
                  Al registrarse o participar en el evento, el usuario autoriza
                  a la organización de Latido & Huella a recolectar, almacenar,
                  usar, procesar y tratar sus datos personales para fines
                  relacionados con la gestión del evento, confirmación de
                  inscripción, envío de información, coordinación logística,
                  entrega de kits, comunicaciones comerciales, certificados,
                  encuestas, contacto posterior, gestión de pagos, seguridad y
                  cumplimiento de obligaciones legales.
                </p>
                <p>
                  El tratamiento de datos personales se realizará conforme a la{' '}
                  <strong>Ley 1581 de 2012</strong> y demás normas aplicables en
                  Colombia sobre protección de datos personales. Esta ley aplica
                  al tratamiento de datos personales realizado en territorio
                  colombiano y exige que el tratamiento se realice bajo
                  principios de autorización, finalidad, libertad, veracidad,
                  transparencia, seguridad y confidencialidad.
                </p>
                <p>
                  El titular de los datos podrá solicitar información,
                  actualización, corrección o eliminación de sus datos, de
                  acuerdo con los canales oficiales establecidos por la
                  organización.
                </p>
                <p>
                  En caso de menores de edad, el suministro de datos deberá ser
                  realizado o autorizado por sus padres, acudientes o
                  representantes legales.
                </p>
              </Prose>
            </section>

            {/* 5. Imagen */}
            <section>
              <SectionHeader id="imagen" icon={Camera} title="5. Autorización de uso de imagen" />
              <Prose>
                <p>
                  Al asistir o participar en Latido & Huella, el participante
                  autoriza a la organización, aliados, patrocinadores y equipo
                  de comunicación del evento a captar, grabar, fotografiar y
                  utilizar su imagen, voz, nombre, testimonio, participación y
                  aparición en material audiovisual relacionado con el evento.
                </p>
                <p>
                  Esta autorización incluye el uso de fotografías, videos,
                  transmisiones, piezas gráficas, contenido digital, redes
                  sociales, página web, publicidad, memorias del evento,
                  presentaciones comerciales, notas de prensa y materiales
                  promocionales relacionados con Latido & Huella.
                </p>
                <p>
                  El uso de imagen se realizará con fines informativos,
                  promocionales, comerciales, institucionales y de memoria del
                  evento, sin que esto genere derecho a compensación económica
                  adicional para el participante.
                </p>
                <p>
                  En el caso de menores de edad, el uso de imagen deberá contar
                  con autorización de sus padres, acudientes o representantes
                  legales.
                </p>
              </Prose>
            </section>

            {/* 6. Ingreso */}
            <section>
              <SectionHeader id="ingreso" icon={Building2} title="6. Condiciones generales de ingreso" />
              <Prose>
                <p>
                  El ingreso al evento estará sujeto al cumplimiento de las
                  reglas establecidas por la organización y las autoridades
                  competentes.
                </p>
                <p>
                  La organización podrá negar el ingreso o retirar del evento a
                  cualquier persona que incumpla las normas de convivencia,
                  ponga en riesgo la seguridad de otros asistentes, maltrate
                  animales, altere el orden, presente comportamientos agresivos,
                  ingrese elementos prohibidos, incumpla instrucciones del
                  personal logístico o afecte el desarrollo normal del evento.
                </p>
                <p>
                  No se permitirá el ingreso de armas, sustancias ilegales,
                  pólvora, elementos cortopunzantes, objetos peligrosos, bebidas
                  alcohólicas no autorizadas, sustancias psicoactivas, productos
                  no autorizados para venta, animales en condiciones de riesgo o
                  cualquier elemento que pueda comprometer la seguridad del
                  evento.
                </p>
                <p>
                  El Código Nacional de Seguridad y Convivencia Ciudadana,{' '}
                  <strong>Ley 1801 de 2016</strong>, regula comportamientos
                  orientados a preservar la convivencia, seguridad y
                  tranquilidad ciudadana.
                </p>
              </Prose>
            </section>

            {/* 7. Menores */}
            <section>
              <SectionHeader id="menores" icon={Baby} title="7. Menores de edad" />
              <Prose>
                <p>
                  Los menores de edad deberán asistir acompañados por un adulto
                  responsable, padre, madre, acudiente o representante legal.
                </p>
                <p>
                  Para participar en actividades deportivas, caminatas,
                  competencias, talleres o actividades que impliquen esfuerzo
                  físico, el menor deberá contar con autorización expresa de su
                  acudiente.
                </p>
                <p>
                  El adulto responsable declara que el menor se encuentra en
                  condiciones físicas, psicológicas y médicas adecuadas para
                  participar en las actividades correspondientes. En actividades
                  deportivas y recreativas en Colombia, es recomendable que el
                  acudiente certifique que el menor se encuentra afiliado y
                  activo al sistema de salud y en condiciones aptas para la
                  actividad.
                </p>
                <p>
                  La organización no reemplaza la responsabilidad de cuidado,
                  vigilancia y acompañamiento que corresponde a los padres o
                  acudientes durante el evento.
                </p>
              </Prose>
            </section>

            {/* CONTRACTUAL */}

            {/* Caminata */}
            <section>
              <SectionHeader id="caminata" icon={Footprints} title="Caminata Canina" subtitle="Términos para participantes de la caminata" />
              <ClauseTable rows={CAMINATA_ROWS} />
            </section>

            {/* Deportes */}
            <section>
              <SectionHeader id="deportes" icon={Trophy} title="Deportes" subtitle="Fútbol, tenis, pádel y otras actividades deportivas" />
              <ClauseTable rows={DEPORTES_ROWS} />
            </section>

            {/* Mascotas */}
            <section>
              <SectionHeader id="mascotas" icon={Dog} title="Zona de mascotas" subtitle="Actividades, juegos y espacios pet friendly" />
              <ClauseTable rows={MASCOTAS_ROWS} />
            </section>

            {/* Expositores */}
            <section>
              <SectionHeader id="expositores" icon={Store} title="Expositores y muestras comerciales" subtitle="Marcas, emprendimientos y stands" />
              <ClauseTable rows={EXPOSITORES_ROWS} />
            </section>

            {/* Gastronomía */}
            <section>
              <SectionHeader id="gastronomia" icon={UtensilsCrossed} title="Gastronomía" subtitle="Zona gastronómica y food trucks" />
              <ClauseTable rows={GASTRONOMIA_ROWS} />
            </section>

            {/* Patrocinadores */}
            <section>
              <SectionHeader id="patrocinadores" icon={Star} title="Patrocinadores" subtitle="Marcas patrocinadoras del evento" />
              <ClauseTable rows={PATROCINADORES_ROWS} />
            </section>

            {/* OPERATIVO */}

            {/* Seguridad */}
            <section>
              <SectionHeader id="seguridad" icon={AlertTriangle} title="Seguridad, emergencias y gestión del riesgo" />
              <Prose>
                <p>
                  La organización podrá implementar medidas de seguridad,
                  control de ingreso, rutas de evacuación, puntos de atención,
                  señalización, brigadas, personal logístico, apoyo médico,
                  protocolos de emergencia y coordinación con autoridades
                  competentes.
                </p>
                <p>
                  Los asistentes deberán atender las instrucciones impartidas
                  por el personal autorizado. En caso de emergencia, evacuación,
                  condiciones climáticas adversas, riesgo para personas o
                  animales, alteraciones de orden público o instrucciones de
                  autoridades, la organización podrá suspender, modificar,
                  aplazar o cancelar parcial o totalmente actividades del
                  evento.
                </p>
                <p>
                  En Colombia, los eventos de afluencia masiva están
                  relacionados con planes de emergencia y contingencia,
                  definidos para coordinar la prevención y atención de riesgos
                  antes, durante y después del evento.
                </p>
              </Prose>
            </section>

            {/* Clima */}
            <section>
              <SectionHeader id="clima" icon={CloudRain} title="Clima, fuerza mayor y cambios operativos" />
              <Prose>
                <p>
                  Latido & Huella es un evento sujeto a condiciones climáticas,
                  logísticas, permisos, disponibilidad de espacios y decisiones
                  de autoridades.
                </p>
                <p>
                  La organización podrá modificar horarios, recorridos,
                  programación, ubicación de zonas, actividades, invitados,
                  competencias o beneficios cuando existan razones de seguridad,
                  clima, fuerza mayor, caso fortuito, orden público,
                  restricciones municipales, recomendaciones de autoridades,
                  emergencias sanitarias o situaciones externas no atribuibles a
                  la organización.
                </p>
                <p>
                  Estas modificaciones no generarán automáticamente derecho a
                  devolución de dinero, salvo que la organización comunique una
                  política específica diferente.
                </p>
              </Prose>
            </section>

            {/* Pagos */}
            <section>
              <SectionHeader id="pagos" icon={CreditCard} title="Política de pagos, cambios y reembolsos" />
              <Prose>
                <p>
                  Las inscripciones, reservas, stands, patrocinios o cupos
                  adquiridos para el evento estarán sujetos a la política de
                  pagos, cambios y reembolsos definida para cada categoría.
                </p>
                <p>
                  Como regla general,{' '}
                  <strong>no se realizarán devoluciones de dinero</strong> por
                  inasistencia, decisión personal, llegada tarde, retiro
                  voluntario, incumplimiento de requisitos, condiciones
                  climáticas, cambios de programación o causas externas no
                  atribuibles directamente a la organización.
                </p>
                <p>
                  La organización podrá permitir cambios de titular, jugador,
                  equipo, expositor o representante hasta 72 horas antes del
                  evento, siempre que se solicite por escrito y sea aprobado por
                  la organización.
                </p>
              </Prose>
            </section>

            {/* Prohibiciones */}
            <section>
              <SectionHeader id="prohibiciones" icon={Ban} title="Prohibiciones generales" />
              <p className="text-gray-700 text-[15px] leading-relaxed mb-4">
                Durante el evento está prohibido:
              </p>
              <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
                <ul className="space-y-3">
                  {PROHIBICIONES.map((item, i) => <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-gray-800 text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>)}
                </ul>
              </div>
            </section>

            {/* Responsabilidad */}
            <section>
              <SectionHeader id="responsabilidad" icon={Shield} title="Responsabilidad de la organización" />
              <Prose>
                <p>
                  La organización realizará sus mejores esfuerzos para ofrecer
                  un evento seguro, organizado y de calidad. Sin embargo, no
                  será responsable por hechos atribuibles a terceros, fuerza
                  mayor, caso fortuito, condiciones climáticas, decisiones de
                  autoridades, pérdidas de objetos personales, daños causados
                  por mascotas, lesiones derivadas de la práctica deportiva,
                  incumplimientos de expositores, productos vendidos por
                  terceros o situaciones que estén fuera de su control
                  razonable.
                </p>
                <p>
                  La participación en actividades deportivas, recreativas,
                  caminatas, concursos o dinámicas será voluntaria y bajo
                  responsabilidad del participante o de su acudiente, cuando
                  aplique.
                </p>
              </Prose>
            </section>

            {/* Contacto */}
            <section>
              <SectionHeader id="contacto" icon={Phone} title="Contacto" subtitle="Estamos aquí para resolver tus dudas" />
              <div className="bg-gradient-to-br from-brand-cyan to-brand-navy rounded-3xl p-8 md:p-10 text-white shadow-xl">
                <p className="text-white/90 text-base leading-relaxed mb-6">
                  Si tienes dudas sobre estos términos, condiciones de
                  participación, inscripciones, expositores, patrocinios o
                  requisitos del evento, puedes contactarnos por WhatsApp:
                </p>
                <a href="https://wa.me/573332777912" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white text-brand-navy hover:bg-gray-100 px-6 py-4 rounded-full font-bold transition-all shadow-lg hover:-translate-y-0.5">
                  <Phone className="w-5 h-5" />
                  +57 333 277 7912
                </a>
                <p className="text-white/60 text-xs mt-6">
                  Última actualización: Mayo 2026
                </p>
              </div>
            </section>

            {/* Back to top / home */}
            <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <p className="text-gray-500 text-sm">
                Este documento puede ser actualizado. Te recomendamos revisarlo
                periódicamente.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 bg-brand-navy hover:bg-[#0a1450] text-white px-6 py-3 rounded-full font-bold transition-all shadow-md">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>;
}