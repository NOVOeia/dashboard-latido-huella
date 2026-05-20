import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Clock,
  Target,
  Check,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  MessageSquare,
  Mail,
  Award,
  Trophy,
  Briefcase,
  Activity,
  LayoutGrid,
  Store,
  Mic,
  Smartphone,
  Gift,
  Trash2,
  Maximize2,
  X } from
'lucide-react';
import { SponsorRegistrationModal } from '../components/SponsorRegistrationModal';
export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  sublabel?: string;
}
export interface Product {
  id: string;
  name: string;
  category: 'branding' | 'kits' | 'equipo' | 'impreso';
  shortDesc: string;
  longDesc: string;
  image: string;
  selectorType: 'size' | 'quantity-min' | 'bundle' | 'type-toggle' | 'fixed';
  variants?: ProductVariant[];
  unitPrice?: number;
  minQuantity?: number;
  unitLabel?: string;
  fixedPrice?: number;
  fixedDesc?: string;
}
export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
const PRODUCTS: Product[] = [
{
  id: 'arcos',
  name: 'Arcos Inflables',
  category: 'branding',
  shortDesc: 'Decoración full color en ingreso y zonas del bazar',
  longDesc:
  'Impresión digital full color (sublimación) para decoración y logos. Incluye motor 110V, maleta para empaque, cordeles. Material lona camperink Lafayette impermeable, 100% protección UV, recubrimiento lafgard. Ubicación: Ingreso al Parque y zonas puntuales del Bazar.',
  image: "/Arcos_inflables.png",

  selectorType: 'size',
  variants: [
  {
    id: '3x2',
    label: '3 × 2 mts',
    price: 3650000
  },
  {
    id: '4x2',
    label: '4 × 2 mts',
    price: 3450000
  },
  {
    id: '5x2',
    label: '5 × 2 mts',
    price: 4000000
  },
  {
    id: '6x2',
    label: '6 × 2 mts',
    price: 4650000
  },
  {
    id: '7x2',
    label: '7 × 2 mts',
    price: 4850000
  }]

},
{
  id: 'banderas',
  name: 'Banderas Doble Cara',
  category: 'branding',
  shortDesc: 'Tipo gota o pluma, base agua, ubicación estratégica',
  longDesc:
  'Bandera publicitaria tipo gota o pluma, impresión sublimación doble cara, base tanque para exteriores. Marca única para ti. Ubicación en distintas partes del parque.',
  image: "/Banderas_doble_cara.png",

  selectorType: 'size',
  variants: [
  {
    id: 's',
    label: 'Talla S',
    sublabel: '75 × 170 cm',
    price: 675000
  },
  {
    id: 'm',
    label: 'Talla M',
    sublabel: '95 × 205 cm',
    price: 775000
  },
  {
    id: 'l',
    label: 'Talla L',
    sublabel: '110 × 265 cm',
    price: 897000
  },
  {
    id: 'xl',
    label: 'Talla XL',
    sublabel: '70 × 350 cm',
    price: 1050000
  }]

},
{
  id: 'frontal-tarima',
  name: 'Frontal de Tarima',
  category: 'branding',
  shortDesc: 'Tarima Pet Lovers · cancha actividades mascotas',
  longDesc:
  'Frontal de las tarimas en zona Pet Lovers y cancha de actividades. Máxima visibilidad durante shows y activaciones.',
  image: "/Frontal_de_las_tarimas.png",

  selectorType: 'type-toggle',
  variants: [
  {
    id: 'exclusivo',
    label: 'Marca Única',
    sublabel: 'Exclusivo',
    price: 5000000
  },
  {
    id: 'compartido',
    label: 'Marcas Compartidas',
    sublabel: 'Hasta 3 marcas',
    price: 3000000
  }]

},
{
  id: 'botellas',
  name: 'Botellas de Agua Personalizadas',
  category: 'kits',
  shortDesc: '250ml ecológicas con tu marca, entregadas a participantes',
  longDesc:
  'Botellas de agua de 250ml desechables ecológicas con tu marca única. Se entregan a los participantes de la caminata.',
  image: "/Botellas_de_agua_personalizadas.png",

  selectorType: 'quantity-min',
  unitPrice: 2400,
  minQuantity: 200,
  unitLabel: 'unidades'
},
{
  id: 'termos',
  name: 'Termos Kit Caminata',
  category: 'kits',
  shortDesc: 'Tu logo en cada termo del kit · publicidad móvil',
  longDesc:
  'Termos personalizados con tu logo, entregados en cada KIT de bienvenida. Publicidad móvil que viaja con cada participante.',
  image: "/Termos.png",

  selectorType: 'quantity-min',
  unitPrice: 14000,
  minQuantity: 500,
  unitLabel: 'unidades'
},
{
  id: 'petos',
  name: 'Petos Deportivos',
  category: 'kits',
  shortDesc: 'Logo pecho/espalda en 80 petos · Fútbol, Tenis, Pádel',
  longDesc:
  'Tu logo en cada equipo de los torneos (Fútbol, Tenis y Pádel). 80 petos en total. Publicidad móvil durante todo el evento deportivo.',
  image: "/Petos_deportivos.png",

  selectorType: 'fixed',
  fixedPrice: 2500000,
  fixedDesc: '80 petos incluidos'
},
{
  id: 'camisetas',
  name: 'Camisetas Staff',
  category: 'equipo',
  shortDesc: 'Polo Staff o Camiseta Personal · bordado/estampado',
  longDesc:
  'Tu logo en cada camisa del staff (bordado o estampado). Publicidad móvil durante el evento. Mínimo 50 unidades.',
  image: "/Camisetas_Staff.png",

  selectorType: 'type-toggle',
  variants: [
  {
    id: 'polo',
    label: 'Camisa Polo (Staff)',
    sublabel: 'Mínimo 50 · $45.000 c/u',
    price: 45000
  },
  {
    id: 'camiseta',
    label: 'Camiseta (Personal)',
    sublabel: 'Mínimo 50 · $25.000 c/u',
    price: 25000
  }],

  minQuantity: 50
},
{
  id: 'volantes',
  name: 'Volantes',
  category: 'impreso',
  shortDesc: '12×21 media carta 4×4 · tu logo en nuestra publicidad',
  longDesc:
  'Volantes impresos 12×21 (media carta) full color (4×4). Tu logo en nuestra publicidad. Ideal para activaciones cruzadas.',
  image: "/Volantes.png",

  selectorType: 'bundle',
  variants: [
  {
    id: '1000',
    label: '1.000 unidades',
    price: 350000
  },
  {
    id: '2000',
    label: '2.000 unidades',
    price: 550000
  },
  {
    id: '3000',
    label: '3.000 unidades',
    price: 1200000
  }]

}];

function ProductCard({
  product,
  cart,
  onUpdateCart




}: {product: Product;cart: Record<string, CartItem>;onUpdateCart: (item: CartItem | null, cartId: string) => void;}) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined>(
    product.variants?.[0]?.id);
  const [quantity, setQuantity] = useState<number>(product.minQuantity || 1);
  const variant = product.variants?.find((v) => v.id === selectedVariantId);
  const unitPrice = variant ?
  variant.price :
  product.unitPrice || product.fixedPrice || 0;
  const totalPrice = unitPrice * quantity;
  const totalWithIva = totalPrice * 1.19;
  const cartId = selectedVariantId ?
  `${product.id}-${selectedVariantId}` :
  product.id;
  const inCart = !!cart[cartId];
  const handleAdd = () => {
    onUpdateCart(
      {
        cartId,
        productId: product.id,
        name: product.name,
        variantId: selectedVariantId,
        variantLabel: variant?.label,
        quantity,
        unitPrice,
        totalPrice
      },
      cartId
    );
  };
  const handleRemove = () => {
    onUpdateCart(null, cartId);
  };
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all flex flex-col h-full overflow-hidden">
      <div className="relative aspect-[3/2]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover" />
        
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${product.category === 'branding' ? 'bg-brand-green' : product.category === 'kits' ? 'bg-brand-cyan' : product.category === 'equipo' ? 'bg-brand-navy' : 'bg-brand-yellow text-brand-navy'}`}>
          
          {product.category === 'branding' ?
          'Branding' :
          product.category === 'kits' ?
          'Kits' :
          product.category === 'equipo' ?
          'Equipo' :
          'Impreso'}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-brand-navy mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-6">{product.shortDesc}</p>

        <div className="flex-grow mb-6">
          {product.selectorType === 'size' &&
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.variants?.map((v) =>
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${selectedVariantId === v.id ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-green'}`}>
              
                  <div className="whitespace-nowrap">{v.label}</div>
                  {v.sublabel &&
              <div
                className={`text-[10px] ${selectedVariantId === v.id ? 'text-green-100' : 'text-gray-500'}`}>
                
                      {v.sublabel}
                    </div>
              }
                </button>
            )}
            </div>
          }

          {product.selectorType === 'type-toggle' &&
          <div className="grid grid-cols-2 gap-3">
              {product.variants?.map((v) =>
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`p-3 rounded-xl border text-left transition-all ${selectedVariantId === v.id ? 'ring-2 ring-brand-green bg-brand-green/5 border-transparent' : 'border-gray-200 hover:border-brand-green'}`}>
              
                  <div className="text-sm font-bold text-brand-navy">
                    {v.label}
                  </div>
                  {v.sublabel &&
              <div className="text-xs text-gray-500 mt-1">
                      {v.sublabel}
                    </div>
              }
                </button>
            )}
            </div>
          }

          {product.selectorType === 'bundle' &&
          <div className="flex flex-col gap-2">
              {product.variants?.map((v) =>
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-4 py-3 rounded-xl border flex justify-between items-center transition-all ${selectedVariantId === v.id ? 'ring-2 ring-brand-green bg-brand-green/5 border-transparent' : 'border-gray-200 hover:border-brand-green'}`}>
              
                  <span className="text-sm font-bold text-brand-navy">
                    {v.label}
                  </span>
                  <span className="text-sm font-bold text-brand-green">
                    ${v.price.toLocaleString('es-CO')}
                  </span>
                </button>
            )}
            </div>
          }

          {(product.selectorType === 'quantity-min' ||
          product.selectorType === 'type-toggle' &&
          product.minQuantity) &&
          <div className="mt-4">
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                  onClick={() =>
                  setQuantity(
                    Math.max(
                      product.minQuantity || 1,
                      quantity - (
                      product.id === 'botellas' ?
                      50 :
                      product.id === 'termos' ?
                      100 :
                      10)
                    )
                  )
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-green disabled:opacity-50"
                  disabled={quantity <= (product.minQuantity || 1)}>
                  
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-bold text-brand-navy">
                    {quantity}
                  </span>
                  <button
                  onClick={() =>
                  setQuantity(
                    quantity + (
                    product.id === 'botellas' ?
                    50 :
                    product.id === 'termos' ?
                    100 :
                    10)
                  )
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-green">
                  
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {quantity === product.minQuantity &&
              <span className="text-xs text-amber-600 font-medium">
                    Mínimo {product.minQuantity}{' '}
                    {product.unitLabel || 'unidades'}
                  </span>
              }
              </div>
            </div>
          }

          {product.selectorType === 'fixed' &&
          <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium">
              {product.fixedDesc}
            </div>
          }
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-brand-navy">
                ${totalPrice.toLocaleString('es-CO')}
              </span>
              <span className="text-sm text-gray-500 font-medium">+ IVA</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total con IVA: ${totalWithIva.toLocaleString('es-CO')}
            </div>
          </div>

          {inCart ?
          <div className="flex items-center gap-2">
              <div className="flex-grow bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Ya en el pedido
              </div>
              <button
              onClick={handleRemove}
              className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Quitar">
              
                <Trash2 className="w-5 h-5" />
              </button>
            </div> :

          <button
            onClick={handleAdd}
            className="w-full bg-brand-green hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2">
            
              <ShoppingCart className="w-5 h-5" /> Agregar al pedido
            </button>
          }
        </div>
      </div>
    </div>);

}
const MARKETPLACE_ITEMS: MarketplaceItem[] = [
{
  id: 'arcos',
  name: 'Arcos Inflables Personalizados',
  price: 5000000,
  desc: 'Presencia de marca en los arcos de salida y meta.',
  image:
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80&auto=format&fit=crop',
  available: 2
},
{
  id: 'botellas',
  name: 'Botellas de Agua con tu Marca',
  price: 3500000,
  desc: '5,000 unidades entregadas en puntos de hidratación.',
  image:
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80&auto=format&fit=crop',
  available: 3
},
{
  id: 'termos',
  name: 'Termos en Kit de Bienvenida',
  price: 4000000,
  desc: '2,000 unidades premium para participantes VIP.',
  image:
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80&auto=format&fit=crop',
  available: 1
},
{
  id: 'petos',
  name: 'Petos Deportivos de Participantes',
  price: 6000000,
  desc: 'Logo destacado en el pecho o espalda de los corredores.',
  image:
  'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=800&q=80&auto=format&fit=crop',
  available: 1
},
{
  id: 'camisetas',
  name: 'Camisetas del Staff Logístico',
  price: 4500000,
  desc: '100 unidades con branding completo para el equipo organizador.',
  image:
  'https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=800&q=80&auto=format&fit=crop',
  available: 1
},
{
  id: 'pendones',
  name: 'Pendones y Banderas en Recorrido',
  price: 2500000,
  desc: 'Ubicaciones estratégicas a lo largo de los 5 kilómetros.',
  image:
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80&auto=format&fit=crop',
  available: 5
},
{
  id: 'tarima',
  name: 'Frontal de Tarima Principal',
  price: 8000000,
  desc: 'Espacio exclusivo de máxima visibilidad en el escenario central.',
  image:
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop',
  available: 1
}];

const tiers = [
{
  name: 'ORO',
  price: '$35.000.000',
  bgColor: '#D4AF37',
  textColor: 'text-white',
  headingColor: 'text-white',
  chipBg: 'bg-white/20',
  chipText: 'text-white',
  innerCheck: 'text-[#D4AF37]',
  ctaBg: 'bg-white',
  ctaText: 'text-[#A88720]',
  ctaHover: 'hover:bg-gray-100',
  limit: 'Máximo 5 marcas (Exclusividad categorial)',
  benefits: [
  'Branding de escenario: posicionamiento central, permanente y exclusivo del logo en pantallas digitales (rotativo) y arco del evento',
  'Activación de Marca: Stand 4x4m en ubicación Premium del Bazar (mayor flujo de personas)',
  'Mención Especial: Discurso de apertura por representante de la marca (2 minutos) + mención del CEO de Latido & Huella',
  'Material Exclusivo: Cinta de las medallas de participación, camisetas de los participantes de la caminata y bolsa del KIT de bienvenida',
  'Marketing Digital: 3 publicaciones exclusivas en redes sociales',
  'Presencia permanente en la página de inicio del evento',
  '20 Kits VIP para la caminata (1 persona + 1 mascota c/u)']

},
{
  name: 'PLATA',
  price: '$20.000.000',
  bgColor: '#C0C0C0',
  textColor: 'text-brand-navy',
  headingColor: 'text-brand-navy',
  chipBg: 'bg-brand-navy/15',
  chipText: 'text-brand-navy',
  innerCheck: 'text-gray-600',
  ctaBg: 'bg-brand-navy',
  ctaText: 'text-white',
  ctaHover: 'hover:bg-[#1a2a8a]',
  limit: 'Mínimo 10 marcas',
  benefits: [
  'Branding de escenario: Logo secundario en todas las presentaciones y mención destacada en el back-drop del escenario',
  'Activación de Marca: Stand 2x2m en zona de alto tráfico del parque',
  'Mención Especial: Agradecimiento verbal en apertura y cierre de la caminata y en las premiaciones de actividades deportivas (Fútbol, Tenis y Pádel)',
  'Material Exclusivo: Logo impreso en el KIT de bienvenida (tamaño medio)',
  'Marketing Digital: 2 publicaciones dedicadas en redes sociales',
  'Logo en la sección de patrocinadores del sitio web',
  '5 Kits VIP para la caminata (1 persona + 1 mascota c/u)']

},
{
  name: 'BRONCE',
  price: '$15.000.000',
  bgColor: '#CD7F32',
  textColor: 'text-white',
  headingColor: 'text-white',
  chipBg: 'bg-white/20',
  chipText: 'text-white',
  innerCheck: 'text-[#CD7F32]',
  ctaBg: 'bg-white',
  ctaText: 'text-[#A55F1F]',
  ctaHover: 'hover:bg-gray-100',
  limit: 'Cupos limitados',
  benefits: [
  'Branding del escenario: Logo en la diapositiva final de agradecimientos (compartido) y mención del nombre en la sección de patrocinadores de la presentación',
  'Activación de Marca: Stand 2x2m en zona asignada del Bazar',
  'Mención Especial: Mención verbal general al inicio y cierre del evento + Pitch en escenario de 1 minuto',
  'Material Exclusivo: Muestra de producto incluida en la bolsa del KIT de bienvenida',
  'Marketing Digital: 1 publicación de agradecimiento en redes sociales',
  'Logo en el sitio web del evento',
  '2 Kits VIP para la caminata (1 persona + 1 mascota c/u)']

}];

const sportsSponsors = [
{
  sport: 'FÚTBOL',
  price: '$15.000.000',
  color: '#0D1B6E',
  accent: '#00BCD4',
  icon: '⚽',
  needs: [
  '6 Partidos: 3 adultos · 3 niños · 3 canchas',
  '2 árbitros por partido (total 6 árbitros)',
  '80 camisetas o petos para los equipos participantes',
  'Comunicación del evento en los medios de la marca'],

  includes: [
  'Espacios para publicidad de la marca (definición con el cliente)',
  'Beneficios de patrocinador PLATA'],

  notIncludes:
  '6 premios para cada equipo (1er, 2do y 3er lugar — categoría niños/adultos)',
  tierBadge: 'Beneficios PLATA'
},
{
  sport: 'TENIS',
  price: '$5.000.000',
  color: '#FFB300',
  accent: '#0D1B6E',
  icon: '🎾',
  needs: [
  '3 Partidos (1 por cancha)',
  '1 juez de silla / 1 árbitro por partido',
  '12 camisetas o petos para los equipos participantes',
  'Comunicación del evento en los medios de la marca'],

  includes: [
  'Espacios para publicidad de la marca',
  'Beneficios de patrocinador BRONCE'],

  notIncludes: '6 premios para cada equipo (1er y 2do lugar)',
  tierBadge: 'Beneficios BRONCE'
},
{
  sport: 'PÁDEL',
  price: '$10.000.000',
  color: '#4CAF50',
  accent: '#0D1B6E',
  icon: '🥎',
  needs: [
  '8 Partidos: 2 canchas · 4 partidos por cancha',
  '2 jueces árbitro y 2 jueces de pista (1 + 1 por partido)',
  '8 premios (1er y 2do lugar)',
  '32 camisetas o petos para los equipos participantes',
  'Comunicación del evento en los medios de la marca'],

  includes: [
  'Espacios para publicidad de la marca',
  'Beneficios de patrocinador PLATA'],

  notIncludes: null,
  tierBadge: 'Beneficios PLATA'
}];

const roiMetrics = [
{
  icon: Users,
  value: '5,000+',
  label: 'Asistentes directos',
  color: 'text-brand-cyan',
  bg: 'bg-brand-cyan/10'
},
{
  icon: TrendingUp,
  value: '200,000+',
  label: 'Alcance digital',
  color: 'text-brand-green',
  bg: 'bg-brand-green/10'
},
{
  icon: Clock,
  value: '10+',
  label: 'Horas de exposición',
  color: 'text-brand-yellow',
  bg: 'bg-brand-yellow/10'
},
{
  icon: Target,
  value: '100%',
  label: 'Audiencia cualificada',
  color: 'text-brand-navy',
  bg: 'bg-brand-navy/10'
}];

type SponsorType = 'empresarial' | 'deportivo' | 'espacios' | null;
export function PatrocinadoresPage() {
  const [selectedType, setSelectedType] = useState<SponsorType>(null);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  // Detect desktop so we can disable mobile-breaking effects (diagonal overlap, hover flex expansion)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  // Local state for product selectors
  const [selections, setSelections] = useState<
    Record<
      string,
      {
        variantId?: string;
        quantity: number;
      }>>(

    {});
  // Initialize selections
  useEffect(() => {
    const initialSelections: Record<
      string,
      {
        variantId?: string;
        quantity: number;
      }> =
    {};
    PRODUCTS.forEach((p) => {
      if (
      p.selectorType === 'size' ||
      p.selectorType === 'bundle' ||
      p.selectorType === 'type-toggle')
      {
        initialSelections[p.id] = {
          variantId: p.variants?.[0]?.id,
          quantity: p.minQuantity || 1
        };
      } else if (p.selectorType === 'quantity-min') {
        initialSelections[p.id] = {
          quantity: p.minQuantity || 1
        };
      } else {
        initialSelections[p.id] = {
          quantity: 1
        };
      }
    });
    setSelections(initialSelections);
  }, []);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlanType, setModalPlanType] = useState<
    'empresarial' | 'deportivo' | 'espacios'>(
    'empresarial');
  const [modalPlanName, setModalPlanName] = useState('');
  const [modalBasePrice, setModalBasePrice] = useState(0);
  // Empresarial view toggle
  const [empresarialView, setEmpresarialView] = useState<'cards' | 'compare'>(
    'cards'
  );
  const openModal = (
  type: 'empresarial' | 'deportivo' | 'espacios',
  name: string,
  price: number) =>
  {
    setModalPlanType(type);
    setModalPlanName(name);
    setModalBasePrice(price);
    setIsModalOpen(true);
  };
  const handleAddToCart = (item: CartItem | null, cartId: string) => {
    setCart((prev) => {
      const next = {
        ...prev
      };
      if (item === null) {
        delete next[cartId];
      } else {
        next[cartId] = item;
      }
      return next;
    });
  };
  const handleRemoveFromCart = (cartKey: string) => {
    setCart((prev) => {
      const next = {
        ...prev
      };
      delete next[cartKey];
      return next;
    });
  };
  const { totalItems, subtotal, iva, totalPrice } = useMemo(() => {
    let items = 0;
    let sub = 0;
    Object.values(cart).forEach((item) => {
      items += 1; // Count distinct items, not total units
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (
      product?.selectorType === 'quantity-min' ||
      product?.selectorType === 'type-toggle')
      {
        sub += item.totalPrice;
      } else {
        sub += item.totalPrice; // For size, bundle, fixed, price is already total
      }
    });
    const calcIva = sub * 0.19;
    return {
      totalItems: items,
      subtotal: sub,
      iva: calcIva,
      totalPrice: sub + calcIva
    };
  }, [cart]);
  const getProductPrice = (product: Product) => {
    const selection = selections[product.id];
    if (!selection) return 0;
    if (product.selectorType === 'fixed') return product.fixedPrice || 0;
    if (product.selectorType === 'quantity-min')
    return (product.unitPrice || 0) * selection.quantity;
    if (product.selectorType === 'type-toggle') {
      const variant = product.variants?.find(
        (v) => v.id === selection.variantId
      );
      return (variant?.price || 0) * selection.quantity;
    }
    const variant = product.variants?.find((v) => v.id === selection.variantId);
    return variant?.price || 0;
  };
  const getCategoryColor = () => {
    if (selectedType === 'empresarial')
    return 'text-brand-cyan hover:ring-brand-cyan';
    if (selectedType === 'deportivo')
    return 'text-[#FFB300] hover:ring-[#FFB300]';
    if (selectedType === 'espacios')
    return 'text-[#4CAF50] hover:ring-[#4CAF50]';
    return 'text-gray-500';
  };
  return (
    <div className="pt-20 bg-brand-navy min-h-screen pb-24">
      <SponsorRegistrationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planType={modalPlanType}
        planName={modalPlanName}
        basePrice={modalBasePrice}
        initialExtras={modalPlanType === 'espacios' ? cart : {}} />
      

      {/* Sticky Back Button */}
      <AnimatePresence>
        {selectedType &&
        <motion.button
          initial={{
            opacity: 0,
            x: -20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: -20
          }}
          onClick={() => {
            setSelectedType(null);
            setCart({});
          }}
          className={`fixed top-24 left-6 sm:left-8 z-40 flex items-center gap-2 bg-white/80 backdrop-blur-lg border border-white/40 shadow-lg px-4 py-2 rounded-full font-bold text-sm transition-all hover:ring-2 ${getCategoryColor()}`}>
          
            <ArrowLeft className="w-4 h-4" /> Volver a categorías
          </motion.button>
        }
      </AnimatePresence>

      {/* Hero Banner */}
      <section className="relative py-24 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-30" />
          
          <div className="absolute inset-0 bg-brand-navy/70"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-brand-cyan hover:text-white transition-colors mb-8 text-sm font-medium">
            
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <motion.h1
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="text-5xl md:text-7xl text-white mb-4 font-bold">
            
            Patrocina <span className="text-brand-cyan">Latido y Huella</span>
          </motion.h1>
          <motion.p
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            transition={{
              delay: 0.2
            }}
            className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            
            Conecta tu marca de forma auténtica con una comunidad apasionada por
            el bienestar, el deporte, las mascotas y el impacto social.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Users className="w-5 h-5 text-brand-cyan" /> 5,000+ Asistentes
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Award className="w-5 h-5 text-brand-yellow" /> 50+ Marcas
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Target className="w-5 h-5 text-brand-green" /> Impacto Social
              Real
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 bg-gray-50" id="planes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chooser UI */}
          {!selectedType ?
          <div>
              <div className="text-center mb-12">
                <span className="inline-block bg-brand-cyan/10 text-brand-cyan px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  Patrocinadores
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-brand-navy mb-4">
                  Elige tu forma de patrocinar
                </h2>
                <p className="text-gray-600 text-lg">
                  3 caminos para conectar tu marca con la causa.
                </p>
              </div>

              {/* Hero Split Animado */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-0 h-auto md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                {[
              {
                type: 'empresarial' as const,
                number: '01',
                icon: Briefcase,
                color: '#00BCD4',
                colorHex: '#00BCD4',
                title: 'Patrocinio Empresarial',
                tagline: 'Visibilidad máxima Oro · Plata · Bronce',
                longDesc:
                'Posiciona tu marca en escenarios, materiales y comunicaciones del evento con paquetes premium.',
                cta: 'Ver planes',
                image:
                'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop',
                clipDesktop: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)'
              },
              {
                type: 'deportivo' as const,
                number: '02',
                icon: Activity,
                color: '#FFB300',
                colorHex: '#FFB300',
                title: 'Patrocina un Deporte',
                tagline: 'Fútbol · Tenis · Pádel',
                longDesc:
                'Apadrina una disciplina y conecta directamente con la comunidad deportiva en cancha.',
                cta: 'Ver deportes',
                image:
                'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80&auto=format&fit=crop',
                clipDesktop: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)'
              },
              {
                type: 'espacios' as const,
                number: '03',
                icon: LayoutGrid,
                color: '#4CAF50',
                colorHex: '#4CAF50',
                title: 'Espacios Extra',
                tagline: 'Arcos · Botellas · Petos · Tarima',
                longDesc:
                'Potencia tu presencia con elementos de alto impacto distribuidos por todo el evento.',
                cta: 'Ver catálogo',
                image: "/espacios_extras.png",

                clipDesktop: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)'
              }].
              map((panel, i) => {
                const Icon = panel.icon;
                return (
                  <motion.button
                    key={panel.type}
                    onClick={() => setSelectedType(panel.type)}
                    initial={false}
                    whileHover={isDesktop ? 'hover' : undefined}
                    animate="rest"
                    variants={
                    isDesktop ?
                    {
                      rest: {
                        flex: 1
                      },
                      hover: {
                        flex: 2.2
                      }
                    } :
                    undefined
                    }
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="relative w-full h-[320px] md:w-auto md:flex-1 md:h-full overflow-hidden text-left group focus:outline-none rounded-2xl md:rounded-none"
                    style={{
                      marginLeft: isDesktop && i > 0 ? '-3%' : 0
                    }}>
                    
                      {/* Clip-path wrapper for diagonal edges (desktop only) */}
                      <div
                      className="absolute inset-0 md:[clip-path:var(--clip)]"
                      style={
                      {
                        ['--clip' as any]: panel.clipDesktop
                      } as React.CSSProperties
                      }>
                      
                        {/* Background image */}
                        <motion.img
                        src={panel.image}
                        alt={panel.title}
                        variants={{
                          rest: {
                            scale: 1
                          },
                          hover: {
                            scale: 1.08
                          }
                        }}
                        transition={{
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="absolute inset-0 w-full h-full object-cover" />
                      

                        {/* Color overlay */}
                        <motion.div
                        variants={{
                          rest: {
                            opacity: 0.88
                          },
                          hover: {
                            opacity: 0.7
                          }
                        }}
                        transition={{
                          duration: 0.6
                        }}
                        className="absolute inset-0"
                        style={{
                          backgroundColor: panel.colorHex
                        }} />
                      

                        {/* Dark gradient at bottom for legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-10 text-white">
                          {/* Top: number + icon */}
                          <div className="flex items-start justify-between">
                            <span className="text-xs md:text-sm font-bold tracking-[0.3em] text-white/80">
                              {panel.number} / 03
                            </span>
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                              <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                          </div>

                          {/* Bottom: title + tagline + CTA */}
                          <div>
                            <h3 className="text-2xl md:text-4xl font-bold mb-2 leading-tight drop-shadow-md">
                              {panel.title}
                            </h3>
                            <p className="text-white/90 text-sm md:text-base font-medium mb-4 drop-shadow">
                              {panel.tagline}
                            </p>

                            {/* Hover-only longer description */}
                            <motion.p
                            variants={{
                              rest: {
                                opacity: 0,
                                height: 0,
                                marginBottom: 0
                              },
                              hover: {
                                opacity: 1,
                                height: 'auto',
                                marginBottom: 16
                              }
                            }}
                            transition={{
                              duration: 0.4,
                              delay: 0.1
                            }}
                            className="text-white/85 text-sm leading-relaxed overflow-hidden hidden md:block">
                            
                              {panel.longDesc}
                            </motion.p>

                            {/* CTA chip */}
                            <motion.span
                            variants={{
                              rest: {
                                x: 0
                              },
                              hover: {
                                x: 4
                              }
                            }}
                            transition={{
                              duration: 0.3
                            }}
                            className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-sm shadow-lg">
                            
                              {panel.cta}{' '}
                              <ArrowLeft className="w-4 h-4 rotate-180" />
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </motion.button>);

              })}
              </div>
            </div> :

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="w-full">
            
              {/* Empresarial View */}
              {selectedType === 'empresarial' &&
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {/* Mini-Hero Banner */}
                  <div className="relative w-full h-[280px] md:h-[320px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                    <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80&auto=format&fit=crop"
                  alt="Patrocinio Empresarial"
                  className="absolute inset-0 w-full h-full object-cover" />
                
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/90 to-brand-navy/90 mix-blend-multiply" />
                    <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                    "url('https://cdn.magicpatterns.com/uploads/2FdCqZrQgwhszdsi2M3diC/PATRON_HUELLAS_fondo.png')",
                    backgroundSize: '400px'
                  }} />
                
                    {/* Decorative blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-cyan/40 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">
                      <div className="flex items-center justify-end">
                        {/* Desktop Metrics */}
                        <div className="hidden md:flex items-center gap-3">
                          <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> 5,000+ Asistentes
                          </div>
                          <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> 200K+ Alcance
                          </div>
                          <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> 10+ Horas exp.
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                          Patrocinadores · Empresarial
                        </p>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                          Planes de Patrocinio
                        </h2>
                        <p className="text-white/85 text-lg md:text-xl max-w-2xl font-medium">
                          Elige el nivel de visibilidad que mejor se adapte a tu
                          marca.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="flex justify-center mb-10">
                    <div className="bg-gray-200/70 p-1.5 rounded-full flex gap-1 max-w-sm w-full">
                      <button
                    onClick={() => setEmpresarialView('cards')}
                    className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${empresarialView === 'cards' ? 'bg-white text-brand-navy shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                    
                        <LayoutGrid className="w-4 h-4" /> Tarjetas
                      </button>
                      <button
                    onClick={() => setEmpresarialView('compare')}
                    className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${empresarialView === 'compare' ? 'bg-white text-brand-navy shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                    
                        <TrendingUp className="w-4 h-4" /> Comparar
                      </button>
                    </div>
                  </div>

                  {/* Cards View */}
                  {empresarialView === 'cards' &&
              <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                style={{
                  perspective: '1200px'
                }}>
                
                      {tiers.map((tier, index) => {
                  const isPlata = index === 1;
                  const cupos =
                  index === 0 ?
                  {
                    used: 2,
                    total: 5,
                    text: 'Quedan 3 de 5'
                  } :
                  index === 1 ?
                  {
                    used: 3,
                    total: 10,
                    text: 'Quedan 7 de 10'
                  } :
                  {
                    used: 8,
                    total: 10,
                    text: 'Cupos limitados'
                  };
                  const metrics =
                  index === 0 ?
                  [
                  {
                    icon: Store,
                    label: 'Stand 4x4m'
                  },
                  {
                    icon: Users,
                    label: '20 Kits VIP'
                  }] :

                  index === 1 ?
                  [
                  {
                    icon: Store,
                    label: 'Stand 2x2m'
                  },
                  {
                    icon: Users,
                    label: '5 Kits VIP'
                  }] :

                  [
                  {
                    icon: Store,
                    label: 'Stand 2x2m'
                  },
                  {
                    icon: Users,
                    label: '2 Kits VIP'
                  }];

                  return (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 40
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.15
                      }}
                      whileHover={{
                        rotateX: -2,
                        rotateY: 2,
                        scale: isPlata ? 1.05 : 1.02
                      }}
                      style={{
                        backgroundColor: tier.bgColor
                      }}
                      className={`rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative overflow-hidden ${tier.textColor} ${isPlata ? 'md:scale-[1.03] z-10 ring-4 ring-yellow-400/30 ring-offset-4 ring-offset-gray-50' : ''}`}>
                      
                            {/* ORO Premium Badge */}
                            {index === 0 &&
                      <div className="absolute top-0 right-0 bg-brand-navy text-white px-6 py-2 rounded-bl-2xl font-bold text-xs uppercase tracking-wider z-10">
                                Premium
                              </div>
                      }

                            {/* PLATA Ribbon */}
                            {isPlata &&
                      <div className="absolute top-6 -right-12 bg-brand-yellow text-brand-navy px-12 py-1.5 font-black text-[10px] uppercase tracking-widest rotate-45 shadow-md z-10 flex items-center gap-1 overflow-hidden">
                                <motion.div
                          animate={{
                            x: ['-100%', '200%']
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: 'linear'
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12" />
                        
                                <Star className="w-3 h-3 fill-brand-navy" /> MÁS
                                VENDIDO
                              </div>
                      }

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-5 relative z-10">
                              <div
                          className={`w-14 h-14 rounded-2xl ${tier.chipBg} flex items-center justify-center shadow-inner`}>
                          
                                <Star
                            className={`w-7 h-7 ${tier.chipText}`}
                            fill="currentColor" />
                          
                              </div>
                              <div>
                                <h3
                            className={`text-3xl font-bold ${tier.headingColor}`}>
                            
                                  {tier.name}
                                </h3>
                                <p
                            className={`text-2xl font-bold ${tier.headingColor}`}>
                            
                                  {tier.price}{' '}
                                  <span className="text-sm font-normal opacity-80">
                                    + IVA
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Metrics Row */}
                            <div className="flex gap-2 mb-5 relative z-10">
                              {metrics.map((m, i) =>
                        <div
                          key={i}
                          className={`${tier.chipBg} px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                          
                                  <m.icon
                            className={`w-3.5 h-3.5 ${tier.chipText}`} />
                          
                                  <span
                            className={`${tier.chipText} text-xs font-bold`}>
                            
                                    {m.label}
                                  </span>
                                </div>
                        )}
                            </div>

                            {/* Cupos Progress */}
                            <div className="mb-5 relative z-10">
                              <div className="flex items-center justify-between mb-1.5">
                                <span
                            className={`text-xs font-bold flex items-center gap-1 ${tier.chipText}`}>
                            
                                  <Clock className="w-3 h-3" /> {cupos.text}
                                </span>
                              </div>
                              <div
                          className={`h-1.5 w-full rounded-full ${tier.chipBg} overflow-hidden`}>
                          
                                <div
                            className={`h-full rounded-full ${isPlata ? 'bg-brand-navy' : 'bg-white'}`}
                            style={{
                              width: `${cupos.used / cupos.total * 100}%`
                            }} />
                          
                              </div>
                            </div>

                            {/* Benefits Panel */}
                            <div className="bg-white rounded-2xl p-6 mb-6 flex-grow shadow-inner relative z-10">
                              <ul className="space-y-3.5 mb-6">
                                {tier.benefits.map((benefit, i) =>
                          <li
                            key={i}
                            className="flex items-start gap-3">
                            
                                    <div className="mt-0.5 flex-shrink-0">
                                      <Check
                                className={`w-4 h-4 ${tier.innerCheck}`}
                                strokeWidth={3} />
                              
                                    </div>
                                    <span className="text-gray-700 text-sm leading-snug">
                                      {benefit}
                                    </span>
                                  </li>
                          )}
                              </ul>

                              {/* Icon Summary Row */}
                              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex flex-col items-center gap-1">
                                  <div
                              className={`w-8 h-8 rounded-full ${tier.chipBg} flex items-center justify-center`}>
                              
                                    <Mic
                                className={`w-4 h-4 ${tier.innerCheck}`} />
                              
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                                    Escenario
                                  </span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <div
                              className={`w-8 h-8 rounded-full ${tier.chipBg} flex items-center justify-center`}>
                              
                                    <Store
                                className={`w-4 h-4 ${tier.innerCheck}`} />
                              
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                                    Stand
                                  </span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <div
                              className={`w-8 h-8 rounded-full ${tier.chipBg} flex items-center justify-center`}>
                              
                                    <Smartphone
                                className={`w-4 h-4 ${tier.innerCheck}`} />
                              
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                                    Digital
                                  </span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <div
                              className={`w-8 h-8 rounded-full ${tier.chipBg} flex items-center justify-center`}>
                              
                                    <Gift
                                className={`w-4 h-4 ${tier.innerCheck}`} />
                              
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                                    Kits
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                        onClick={() =>
                        openModal(
                          'empresarial',
                          `Plan ${tier.name}`,
                          parseInt(tier.price.replace(/\D/g, ''))
                        )
                        }
                        className={`w-full block text-center py-4 rounded-full font-bold transition-all ${tier.ctaBg} ${tier.ctaText} ${tier.ctaHover} shadow-lg relative z-10`}>
                        
                              Quiero ser Patrocinador {tier.name}
                            </button>
                          </motion.div>);

                })}
                    </div>
              }

                  {/* Comparison Table View */}
                  {empresarialView === 'compare' &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr>
                              <th className="p-6 bg-gray-50 border-b border-gray-200 w-1/4">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                  Beneficios
                                </span>
                              </th>
                              <th
                          className="p-6 border-b border-gray-200 w-1/4 text-center"
                          style={{
                            backgroundColor: tiers[0].bgColor
                          }}>
                          
                                <span className="text-xl font-black text-white block mb-1">
                                  {tiers[0].name}
                                </span>
                                <span className="text-sm text-white/90 font-medium">
                                  {tiers[0].price}
                                </span>
                              </th>
                              <th
                          className="p-6 border-b border-gray-200 w-1/4 text-center relative"
                          style={{
                            backgroundColor: tiers[1].bgColor
                          }}>
                          
                                <div className="absolute top-0 inset-x-0 h-1 bg-brand-yellow"></div>
                                <span className="text-xl font-black text-brand-navy block mb-1">
                                  {tiers[1].name}
                                </span>
                                <span className="text-sm text-brand-navy/90 font-medium">
                                  {tiers[1].price}
                                </span>
                              </th>
                              <th
                          className="p-6 border-b border-gray-200 w-1/4 text-center"
                          style={{
                            backgroundColor: tiers[2].bgColor
                          }}>
                          
                                <span className="text-xl font-black text-white block mb-1">
                                  {tiers[2].name}
                                </span>
                                <span className="text-sm text-white/90 font-medium">
                                  {tiers[2].price}
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {[
                      {
                        label: 'Branding de escenario',
                        oro: 'Central exclusivo',
                        plata: 'Logo secundario',
                        bronce: 'Diapositiva final'
                      },
                      {
                        label: 'Stand en Bazar',
                        oro: '4x4m Premium',
                        plata: '2x2m Alto tráfico',
                        bronce: '2x2m Asignado'
                      },
                      {
                        label: 'Mención en escenario',
                        oro: 'Discurso 2 min',
                        plata: 'Apertura y cierre',
                        bronce: 'Pitch 1 min'
                      },
                      {
                        label: 'Material en KIT',
                        oro: 'Bolsa + Cinta + Camisetas',
                        plata: 'Logo en KIT',
                        bronce: 'Muestra producto'
                      },
                      {
                        label: 'Redes sociales',
                        oro: '3 posts exclusivos',
                        plata: '2 posts dedicados',
                        bronce: '1 post agradecimiento'
                      },
                      {
                        label: 'Web del evento',
                        oro: 'Página de inicio',
                        plata: 'Sección patrocinadores',
                        bronce: 'Sección patrocinadores'
                      },
                      {
                        label: 'Kits VIP',
                        oro: '20 Kits',
                        plata: '5 Kits',
                        bronce: '2 Kits'
                      }].
                      map((row, i) =>
                      <tr
                        key={i}
                        className={
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }>
                        
                                <td className="p-5 border-b border-gray-100 font-bold text-brand-navy">
                                  {row.label}
                                </td>
                                <td className="p-5 border-b border-gray-100 text-center text-gray-700 font-medium">
                                  {row.oro}
                                </td>
                                <td className="p-5 border-b border-gray-100 text-center text-gray-700 font-medium bg-amber-50/30">
                                  {row.plata}
                                </td>
                                <td className="p-5 border-b border-gray-100 text-center text-gray-700 font-medium">
                                  {row.bronce}
                                </td>
                              </tr>
                      )}
                            <tr>
                              <td className="p-6 bg-gray-50"></td>
                              <td className="p-6 text-center">
                                <button
                            onClick={() =>
                            openModal(
                              'empresarial',
                              `Plan ORO`,
                              35000000
                            )
                            }
                            className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-white py-3 rounded-full font-bold transition-colors shadow-md">
                            
                                  Elegir ORO
                                </button>
                              </td>
                              <td className="p-6 text-center bg-amber-50/30">
                                <button
                            onClick={() =>
                            openModal(
                              'empresarial',
                              `Plan PLATA`,
                              20000000
                            )
                            }
                            className="w-full bg-brand-navy hover:bg-blue-900 text-white py-3 rounded-full font-bold transition-colors shadow-md">
                            
                                  Elegir PLATA
                                </button>
                              </td>
                              <td className="p-6 text-center">
                                <button
                            onClick={() =>
                            openModal(
                              'empresarial',
                              `Plan BRONCE`,
                              15000000
                            )
                            }
                            className="w-full bg-[#CD7F32] hover:bg-[#a66628] text-white py-3 rounded-full font-bold transition-colors shadow-md">
                            
                                  Elegir BRONCE
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
              }
                </div>
            }

              {/* Deportivo View */}
              {selectedType === 'deportivo' &&
            <div>
                  <div className="text-center mb-4">
                    <span className="inline-block bg-brand-yellow/15 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                      Patrocinadores Deportivos
                    </span>
                  </div>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                      Patrocina un Deporte
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      Apadrina una disciplina y obtén visibilidad exclusiva en
                      el deporte que elijas. Ideal para marcas con afinidad
                      deportiva.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sportsSponsors.map((s, index) =>
                <motion.div
                  key={s.sport}
                  initial={{
                    opacity: 0,
                    y: 40
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15
                  }}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden border-2 border-gray-100">
                  
                        <div
                    style={{
                      backgroundColor: s.color
                    }}
                    className="px-6 py-6 text-white relative">
                    
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-4xl block mb-2">
                                {s.icon}
                              </span>
                              <h3 className="text-3xl font-bold tracking-wide">
                                {s.sport}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{s.price}</p>
                              <p className="text-xs opacity-80">+ IVA</p>
                            </div>
                          </div>
                          <div className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {s.tierBadge}
                          </div>
                        </div>

                        <div className="p-6 flex-grow flex flex-col">
                          <div className="mb-5">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">
                              Necesidades a cubrir
                            </h4>
                            <ul className="space-y-2">
                              {s.needs.map((n, i) =>
                        <li key={i} className="flex items-start gap-2">
                                  <div
                            style={{
                              backgroundColor: s.color
                            }}
                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0">
                          </div>
                                  <span className="text-gray-700 text-sm leading-snug">
                                    {n}
                                  </span>
                                </li>
                        )}
                            </ul>
                          </div>

                          <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-4 mb-4">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-brand-green mb-2 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Incluye
                            </h4>
                            <ul className="space-y-1.5">
                              {s.includes.map((inc, i) =>
                        <li
                          key={i}
                          className="text-gray-700 text-sm leading-snug flex items-start gap-2">
                          
                                  <Check
                            className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5"
                            strokeWidth={3} />
                          
                                  <span>{inc}</span>
                                </li>
                        )}
                            </ul>
                          </div>

                          {s.notIncludes &&
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                              <h4 className="text-xs uppercase tracking-wider font-bold text-amber-700 mb-1">
                                No incluye
                              </h4>
                              <p className="text-amber-900 text-xs leading-snug">
                                {s.notIncludes}
                              </p>
                            </div>
                    }

                          <button
                      onClick={() =>
                      openModal(
                        'deportivo',
                        `Patrocinio ${s.sport}`,
                        parseInt(s.price.replace(/\D/g, ''))
                      )
                      }
                      style={{
                        backgroundColor: s.color
                      }}
                      className="mt-auto w-full block text-center py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 shadow-md">
                      
                            Patrocinar {s.sport}
                          </button>
                        </div>
                      </motion.div>
                )}
                  </div>
                </div>
            }

              {/* Espacios Extra View */}
              {selectedType === 'espacios' &&
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {/* Mini-Hero Banner */}
                  <div className="relative w-full h-[280px] md:h-[320px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                    <img
                  src="/espacios_extras.png"
                  alt="Espacios Extra"
                  className="absolute inset-0 w-full h-full object-cover" />
                
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-green/90 to-emerald-700/90 mix-blend-multiply" />
                    <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                    "url('https://cdn.magicpatterns.com/uploads/2FdCqZrQgwhszdsi2M3diC/PATRON_HUELLAS_fondo.png')",
                    backgroundSize: '400px'
                  }} />
                
                    {/* Decorative blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-green/40 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">
                      <div className="flex items-center justify-end">
                        {/* Desktop Metrics */}
                        <div className="hidden md:flex items-center gap-3">
                          <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <LayoutGrid className="w-3.5 h-3.5" /> 8 productos
                          </div>
                          <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Múltiples
                            tamaños
                          </div>
                          <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" /> IVA incluido en
                            cotización
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                          Patrocinadores · Espacios Extra
                        </p>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                          Espacios Extra
                        </h2>
                        <p className="text-white/85 text-lg md:text-xl max-w-2xl font-medium">
                          Potencia tu marca con elementos de alto impacto
                          distribuidos por todo el evento.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products grouped: Branding row · Kits row · Mixed + Cart row */}
                  <div className="space-y-12">
                    {/* Row 1 — Branding físico en sitio (3 productos) */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-brand-green">
                        Branding físico en sitio
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PRODUCTS.filter((p) => p.category === 'branding').map(
                      (product) =>
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        onUpdateCart={handleAddToCart} />


                    )}
                      </div>
                    </div>

                    {/* Row 2 — Kits para participantes (3 productos) */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-brand-cyan">
                        Kits para participantes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PRODUCTS.filter((p) => p.category === 'kits').map(
                      (product) =>
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        onUpdateCart={handleAddToCart} />


                    )}
                      </div>
                    </div>

                    {/* Row 3 — Equipo humano + Material impreso + Resumen del pedido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      {/* Col 1 — Camisetas (Equipo humano) */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-brand-navy">
                          Equipo humano
                        </h3>
                        {PRODUCTS.filter((p) => p.category === 'equipo').map(
                      (product) =>
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        onUpdateCart={handleAddToCart} />


                    )}
                      </div>

                      {/* Col 2 — Volantes (Material impreso) */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-brand-yellow">
                          Material impreso
                        </h3>
                        {PRODUCTS.filter((p) => p.category === 'impreso').map(
                      (product) =>
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        onUpdateCart={handleAddToCart} />


                    )}
                      </div>

                      {/* Col 3 — Sticky Cart Summary checklist */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-brand-green">
                          Resumen del pedido
                        </h3>
                        <div className="sticky top-32 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-gray-100">
                          {/* Header */}
                          <div className="bg-brand-green text-white px-5 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
                              <ShoppingCart className="w-5 h-5" />
                              {totalItems > 0 &&
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-yellow text-brand-navy rounded-full flex items-center justify-center text-[10px] font-black">
                                  {totalItems}
                                </span>
                          }
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm leading-tight">
                                Tu pedido
                              </p>
                              <p className="text-xs text-white/80">
                                {totalItems === 0 ?
                            'Sin productos' :
                            `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} seleccionado${totalItems === 1 ? '' : 's'}`}
                              </p>
                            </div>
                          </div>

                          {/* Checklist body */}
                          <div className="p-5 max-h-[380px] overflow-y-auto">
                            {totalItems === 0 ?
                        <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                  <ShoppingCart className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">
                                  Aún no has agregado productos
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Selecciona del catálogo
                                </p>
                              </div> :

                        <ul className="space-y-3">
                                {Object.values(cart).map((item) =>
                          <li
                            key={item.cartId}
                            className="flex items-start gap-3 group">
                            
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-green/15 flex items-center justify-center flex-shrink-0">
                                      <Check
                                className="w-3 h-3 text-brand-green"
                                strokeWidth={3} />
                              
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-brand-navy leading-tight">
                                        {item.name}
                                      </p>
                                      {(item.variantLabel ||
                              item.quantity > 1) &&
                              <p className="text-xs text-gray-500 mt-0.5">
                                          {item.variantLabel}
                                          {item.variantLabel &&
                                item.quantity > 1 ?
                                ' · ' :
                                ''}
                                          {item.quantity > 1 ?
                                `${item.quantity} u.` :
                                ''}
                                        </p>
                              }
                                      <p className="text-xs font-bold text-brand-green mt-1">
                                        $
                                        {item.totalPrice.toLocaleString(
                                  'es-CO'
                                )}
                                      </p>
                                    </div>
                                    <button
                              onClick={() =>
                              handleRemoveFromCart(item.cartId)
                              }
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity flex-shrink-0"
                              title="Quitar">
                              
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </li>
                          )}
                              </ul>
                        }
                          </div>

                          {/* Footer with totals + CTA */}
                          {totalItems > 0 &&
                      <div className="border-t border-gray-100 p-5 bg-gray-50">
                              <div className="space-y-1.5 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal</span>
                                  <span className="font-medium">
                                    ${subtotal.toLocaleString('es-CO')}
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>IVA (19%)</span>
                                  <span className="font-medium">
                                    ${iva.toLocaleString('es-CO')}
                                  </span>
                                </div>
                                <div className="flex justify-between text-brand-navy pt-2 border-t border-gray-200 mt-2">
                                  <span className="font-bold">Total</span>
                                  <span className="font-black text-lg">
                                    ${totalPrice.toLocaleString('es-CO')}
                                  </span>
                                </div>
                              </div>
                              <button
                          onClick={() =>
                          openModal(
                            'espacios',
                            'Espacios Extra',
                            subtotal
                          )
                          }
                          className="w-full bg-brand-green hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2">
                          
                                Continuar{' '}
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                              </button>
                            </div>
                      }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating cart summary bar — mobile only (desktop uses sticky panel above) */}
                  <AnimatePresence>
                    {totalItems > 0 &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 40
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: 40
                  }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-brand-navy text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 max-w-2xl w-[calc(100%-2rem)] border border-white/10 md:hidden">
                  
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center relative">
                            <ShoppingCart className="w-6 h-6 text-brand-green" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-[10px] font-bold">
                              {totalItems}
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-0.5">
                              Subtotal: ${subtotal.toLocaleString('es-CO')}
                            </p>
                            <p className="text-xs text-white/60 uppercase tracking-wider font-bold">
                              IVA (19%): ${iva.toLocaleString('es-CO')}
                            </p>
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-brand-green uppercase tracking-widest font-bold mb-0.5">
                              Total a pagar
                            </p>
                            <p className="text-xl font-black leading-none">
                              ${totalPrice.toLocaleString('es-CO')}
                            </p>
                          </div>
                          <button
                      onClick={() =>
                      openModal('espacios', 'Espacios Extra', subtotal)
                      }
                      className="bg-brand-green hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap shadow-lg">
                      
                            Continuar →
                          </button>
                        </div>
                      </motion.div>
                }
                  </AnimatePresence>
                </div>
            }
            </motion.div>
          }
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-brand-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {['Hablemos', 'de', 'tu', 'marca'].map((word, i) =>
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
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            ¿Necesitas un plan personalizado? Nuestro equipo comercial está
            listo para crear una propuesta a la medida de tu marca.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto mb-10">
            <a
              href="https://wa.me/573000000000?text=Hola%2C%20quiero%20información%20sobre%20patrocinio%20en%20Latido%20%26%20Huella"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-brand-green hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-bold transition-colors">
              
              <MessageSquare className="w-5 h-5" /> WhatsApp
            </a>
            <a
              href="mailto:patrocinios@latidoyhuella.com"
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-2xl font-bold transition-colors border border-white/20">
              
              <Mail className="w-5 h-5" /> Email
            </a>
          </div>

          <Link
            to="/#contacto"
            className="inline-flex items-center gap-2 text-brand-cyan hover:text-white transition-colors text-sm font-medium">
            
            Ver más opciones de contacto{' '}
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </section>
    </div>);

}