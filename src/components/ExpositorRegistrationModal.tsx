import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Smartphone,
  Search } from
'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { redirectToWompi } from '../utils/wompi';
import {
  isValidEmail,
  isValidColombianPhone,
  isValidFullName,
  isValidBrandName,
  isValidCedula,
  firstError } from
'../utils/validators';
import { formatCOP, priceBreakdown } from '../utils/format';
const TERMS_VERSION = '2026-05-01';
interface Stand {
  id: string;
  price: number;
  standType?: 'AAA' | 'AA' | 'A';
}
interface ExpositorRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  type: 'comercial' | 'foodtruck' | 'toldo';
  selectedStand?: Stand | null;
  price: number;
  quantity?: number;
  ftDimensions?: {
    width: number;
    length: number;
    totalM2: number;
  };
}
export function ExpositorRegistrationModal({
  open,
  onClose,
  type,
  selectedStand,
  price,
  quantity = 1,
  ftDimensions
}: ExpositorRegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form state
  const [brandName, setBrandName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cedula, setCedula] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  // Legal acceptance (timestamps)
  const [acceptedTermsAt, setAcceptedTermsAt] = useState<string | null>(null);
  const [acceptedAgreementAt, setAcceptedAgreementAt] = useState<string | null>(
    null
  );
  const [acceptedHabeasDataAt, setAcceptedHabeasDataAt] = useState<
    string | null>(
    null);
  // IP Address
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  // Lookup state
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupCedula, setLookupCedula] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  // File upload state
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [rutFile, setRutFile] = useState<File | null>(null);
  const [camaraFile, setCamaraFile] = useState<File | null>(null);
  // QR Code state
  const [showQR, setShowQR] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [cedulaUrlFromMobile, setCedulaUrlFromMobile] = useState<string | null>(
    null
  );
  // Fetch IP on open
  useEffect(() => {
    if (open) {
      fetch('https://api.ipify.org?format=json').
      then((res) => res.json()).
      then((data) => setIpAddress(data.ip)).
      catch(() => setIpAddress(null));
    }
  }, [open]);
  const handleLookup = async () => {
    if (!lookupEmail || !lookupCedula) {
      toast.error('Ingresa email y cédula para verificar tu identidad');
      return;
    }
    if (!isValidEmail(lookupEmail).ok) {
      toast.error('Ingresa un email válido');
      return;
    }
    setIsLookingUp(true);
    try {
      const { data, error } = await supabase.
      from('v_persona_por_email').
      select(
        'nombre, telefono, cedula, tabla_origen, source_tag, created_at'
      ).
      ilike('email', lookupEmail).
      eq('cedula', lookupCedula).
      order('created_at', {
        ascending: false
      }).
      limit(1).
      maybeSingle();
      if (error) throw error;
      if (data) {
        setResponsibleName(data.nombre || '');
        setPhone(data.telefono || '');
        setCedula(data.cedula || '');
        setEmail(lookupEmail);
        toast.success(
          `Encontramos tus datos de ${data.source_tag || data.tabla_origen}`
        );
      } else {
        toast.info(
          'No encontramos un registro con esos datos. Continúa llenando el formulario.'
        );
      }
    } catch (err) {
      console.error('Lookup error:', err);
      toast.error('Error al buscar datos');
    } finally {
      setIsLookingUp(false);
    }
  };
  const handleShowQR = () => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
    setShowQR(true);
  };
  useEffect(() => {
    if (!showQR || !sessionId || cedulaUrlFromMobile) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase.storage.
      from('expositor-documents').
      list(`mobile/${sessionId}`);
      if (data && data.length > 0) {
        const cedulaFile = data.find((f) => f.name.startsWith('cedula_'));
        if (cedulaFile) {
          const {
            data: { publicUrl }
          } = supabase.storage.
          from('expositor-documents').
          getPublicUrl(`mobile/${sessionId}/${cedulaFile.name}`);
          setCedulaUrlFromMobile(publicUrl);
          setShowQR(false);
          toast.success('Cédula subida exitosamente desde el celular');
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showQR, sessionId, cedulaUrlFromMobile]);
  const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (file: File | null) => void) =>
  {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size === 0) {
      toast.error(
        `"${file.name}" parece estar vacío. Intenta seleccionarlo de nuevo.`
      );
      return;
    }
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(
        `Tu archivo pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. El máximo es ${MAX_MB}MB. Toma la foto en menor resolución o usa un PDF más liviano.`
      );
      return;
    }
    // Permissive type check: accept ANY image/* + PDF, with extension fallback
    // for HEIC/iPhone files or browsers that don't set MIME type.
    const mime = (file.type || '').toLowerCase();
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const validExts = [
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'heic',
    'heif',
    'webp',
    'gif',
    'bmp',
    'tiff',
    'tif'];

    const isImage = mime.startsWith('image/');
    const isPdf = mime === 'application/pdf';
    const isValidExt = validExts.includes(ext);
    if (!isImage && !isPdf && !isValidExt) {
      toast.error(
        `Formato no reconocido (${mime || ext || 'desconocido'}). Toma una foto nueva o selecciona un PDF.`
      );
      return;
    }
    toast.success(`✓ ${file.name} listo para subir`);
    setter(file);
  };
  const uploadFile = async (
  file: File,
  prefix: string)
  : Promise<string | null> => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const rawExt = (file.name.split('.').pop() || '').toLowerCase();
    const extension = rawExt.replace(/[^a-z0-9]/g, '') || 'bin';
    const fileName = `${prefix}_${timestamp}_${randomStr}.${extension}`;
    const contentType = file.type || 'application/octet-stream';
    const { data, error } = await supabase.storage.
    from('expositor-documents').
    upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType
    });
    if (error) {
      console.error('Upload error:', error);
      const detail = (error as any)?.message || 'error desconocido';
      toast.error(`No se pudo subir el ${prefix}: ${detail}.`);
      return null;
    }
    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('expositor-documents').getPublicUrl(fileName);
    return publicUrl;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    const check = firstError(
      isValidBrandName(brandName),
      isValidFullName(responsibleName),
      isValidEmail(email),
      isValidColombianPhone(phone),
      isValidCedula(cedula)
    );
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    if (!productType.trim()) {
      toast.error('Especifica el tipo de producto/servicio');
      return;
    }
    if (!acceptedTermsAt || !acceptedAgreementAt || !acceptedHabeasDataAt) {
      toast.error('Debes aceptar todos los términos legales para continuar');
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload files
      let cedulaUrl = cedulaUrlFromMobile;
      if (cedulaFile) {
        cedulaUrl = await uploadFile(cedulaFile, 'cedula');
        if (!cedulaUrl) {
          setIsSubmitting(false);
          return;
        }
      }
      const rutUrl = rutFile ? await uploadFile(rutFile, 'rut') : null;
      const camaraUrl = camaraFile ?
      await uploadFile(camaraFile, 'camara') :
      null;
      // Calculate net amount (pre-tax) based on type
      let netAmount: number;
      if (type === 'foodtruck') {
        // Food trucks: price per m² × total m²
        netAmount = price * (ftDimensions?.totalM2 || 0);
      } else if (type === 'toldo') {
        // Toldos: price per unit × quantity
        netAmount = price * quantity;
      } else {
        // Comercial: fixed price for the stand
        netAmount = price;
      }
      // Add 19% IVA to the amount sent to Wompi (and stored in DB)
      const { total: totalWithIVA } = priceBreakdown(netAmount);
      const amountInCents = totalWithIVA * 100;
      // Source tag per table
      const sourceTag =
      type === 'toldo' ? 'expositor-toldo' : 'expositor-reserva';
      // Prepare data for Supabase
      const baseData = {
        brand_name: brandName,
        responsible_name: responsibleName,
        email,
        phone,
        cedula,
        product_type: productType,
        description: description.trim() || null,
        cedula_url: cedulaUrl,
        rut_url: rutUrl,
        camara_comercio_url: camaraUrl,
        status: 'pending_payment',
        amount_cents: amountInCents,
        payment_method: 'wompi',
        source_tag: sourceTag,
        accepted_terms_at: acceptedTermsAt,
        accepted_agreement_at: acceptedAgreementAt,
        accepted_habeas_data_at: acceptedHabeasDataAt,
        terms_version: TERMS_VERSION,
        ip_address: ipAddress
      };
      let insertResult;
      if (type === 'toldo') {
        // Insert into toldos_reservations
        insertResult = await supabase.
        from('toldos_reservations').
        insert({
          ...baseData,
          quantity
        }).
        select().
        single();
      } else {
        // Insert into expositor_reservations (comercial or foodtruck)
        const category = type === 'comercial' ? 'comercial' : 'foodtruck';
        const standId = selectedStand?.id || null;
        const standType = selectedStand?.standType || null;
        insertResult = await supabase.
        from('expositor_reservations').
        insert({
          ...baseData,
          category,
          stand_id: standId,
          stand_type: standType,
          special_requirements:
          type === 'foodtruck' ? specialRequirements.trim() || null : null,
          ft_width_m: ftDimensions?.width || null,
          ft_length_m: ftDimensions?.length || null,
          ft_total_m2: ftDimensions?.totalM2 || null
        }).
        select().
        single();
      }
      if (insertResult.error) {
        console.error('Supabase insert error:', insertResult.error);
        const err = insertResult.error as any;
        const detail =
        err?.message || err?.details || err?.hint || 'error desconocido';
        toast.error(`No se pudo guardar la reserva: ${detail}`, {
          duration: 8000
        });
        setIsSubmitting(false);
        return;
      }
      const reservationId = insertResult.data.id;
      // Build Wompi reference
      const reference =
      type === 'toldo' ?
      `TOLDO-${reservationId}` :
      type === 'foodtruck' ?
      `FT-${reservationId}` :
      `STAND-${reservationId}`;
      // Redirect to Wompi
      await redirectToWompi({
        reference,
        amountInCents,
        customer: {
          email,
          fullName: responsibleName,
          phone,
          legalIdType: 'CC',
          legalId: cedula
        },
        redirectUrl: `${window.location.origin}/gracias`
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Ocurrió un error. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };
  const getTitle = () => {
    if (type === 'toldo') return 'Reservar Toldos Gastronómicos';
    if (type === 'foodtruck')
    return `Reservar Food Truck ${selectedStand?.id || ''}`;
    return `Reservar Stand ${selectedStand?.id || ''}`;
  };
  // Net (pre-tax) amount based on type
  const getNetAmount = () => {
    if (type === 'foodtruck') return price * (ftDimensions?.totalM2 || 0);
    if (type === 'toldo') return price * quantity;
    return price;
  };
  const netAmount = getNetAmount();
  const breakdown = priceBreakdown(netAmount);
  const getSubtitle = () => {
    if (type === 'toldo')
    return `${quantity} toldo${quantity > 1 ? 's' : ''} × ${formatCOP(price)} · Total ${formatCOP(breakdown.total)} (IVA incluido)`;
    if (type === 'foodtruck' && ftDimensions)
    return `${ftDimensions.totalM2.toFixed(2)} m² × ${formatCOP(price)}/m² · Total ${formatCOP(breakdown.total)} (IVA incluido)`;
    return `Stand ${selectedStand?.standType || ''} · ${formatCOP(price)} + IVA · Total ${formatCOP(breakdown.total)}`;
  };
  return (
    <>
      <Toaster position="top-center" richColors />
      <AnimatePresence>
        {open &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-navy/90 backdrop-blur-sm" />
          

            {/* Modal */}
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-cyan to-brand-navy p-6 text-white">
                <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-1">{getTitle()}</h2>
                <p className="text-white/80 text-sm">{getSubtitle()}</p>
              </div>

              {/* Form */}
              <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5">
              
                {/* Lookup Block */}
                <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-brand-navy mb-1">
                    ¿Ya te registraste? Verifica tu identidad
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Por seguridad, valida con tu email y cédula para recuperar
                    tus datos.
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                      type="email"
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="Tu email"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" />
                    
                      <input
                      type="text"
                      value={lookupCedula}
                      onChange={(e) => setLookupCedula(e.target.value)}
                      placeholder="Tu cédula"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" />
                    
                    </div>
                    <button
                    type="button"
                    onClick={handleLookup}
                    disabled={isLookingUp || !lookupEmail || !lookupCedula}
                    className="w-full sm:w-auto bg-brand-cyan hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                    
                      {isLookingUp ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :

                    <Search className="w-4 h-4" />
                    }
                      Buscar mis datos
                    </button>
                  </div>
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la marca / empresa *
                  </label>
                  <input
                  required
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                  placeholder="Ej: Café del Parque" />
                
                </div>

                {/* Responsible Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del responsable *
                  </label>
                  <input
                  required
                  type="text"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                  placeholder="Nombre y apellido" />
                
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                    placeholder="tu@email.com" />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp *
                    </label>
                    <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                    placeholder="3001234567" />
                  
                  </div>
                </div>

                {/* Cedula */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cédula del responsable *
                  </label>
                  <input
                  required
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                  placeholder="1234567890" />
                
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de producto/servicio *
                  </label>
                  <input
                  required
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                  placeholder={
                  type === 'foodtruck' || type === 'toldo' ?
                  'Ej: Hamburguesas artesanales' :
                  'Ej: Accesorios para mascotas'
                  } />
                
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none resize-none"
                  placeholder="Describe brevemente tu oferta..." />
                
                </div>

                {/* Special Requirements (Food Trucks only) */}
                {type === 'foodtruck' &&
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Requerimientos especiales (opcional)
                    </label>
                    <textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none resize-none"
                  placeholder="Ej: Necesito punto de agua, generador adicional..." />
                
                  </div>
              }

                {/* File Uploads */}
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-bold text-brand-navy mb-4 uppercase tracking-wider">
                    Documentos
                  </h3>

                  {/* Cedula Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cédula
                    </label>
                    <div className="relative">
                      <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setCedulaFile)}
                      className="hidden"
                      id="cedula-upload" />
                    
                      <label
                      htmlFor="cedula-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${cedulaFile || cedulaUrlFromMobile ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-gray-300 hover:border-brand-cyan hover:bg-brand-cyan/5'}`}>
                      
                        {cedulaFile ?
                      <>
                            <Check className="w-5 h-5" />
                            <span className="font-medium text-sm">
                              {cedulaFile.name}
                            </span>
                          </> :
                      cedulaUrlFromMobile ?
                      <>
                            <Check className="w-5 h-5" />
                            <span className="font-medium text-sm">
                              Subido desde celular ✓
                            </span>
                          </> :

                      <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              Subir cédula (PDF, JPG, PNG - máx 5MB)
                            </span>
                          </>
                      }
                      </label>
                    </div>

                    {/* QR Code Button */}
                    {!cedulaFile && !cedulaUrlFromMobile &&
                  <div className="mt-2 hidden md:flex flex-col items-start">
                        <button
                      type="button"
                      onClick={handleShowQR}
                      className="text-brand-cyan hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors">
                      
                          <Smartphone className="w-4 h-4" />
                          Subir desde mi celular →
                        </button>

                        {/* QR Popover */}
                        <AnimatePresence>
                          {showQR &&
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0
                        }}
                        animate={{
                          opacity: 1,
                          height: 'auto'
                        }}
                        exit={{
                          opacity: 0,
                          height: 0
                        }}
                        className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 w-full flex flex-col items-center overflow-hidden">
                        
                              <p className="text-sm text-gray-600 mb-3 text-center">
                                Escanea con tu celular para subir desde allí
                              </p>
                              <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${window.location.origin}/subir-documento?session=${sessionId}&doc=cedula`)}`}
                          alt="QR Code"
                          className="w-40 h-40 mb-3 rounded-lg shadow-sm" />
                        
                              <div className="flex items-center gap-2 text-brand-cyan text-sm font-medium mb-3">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Esperando subida...
                              </div>
                              <button
                          type="button"
                          onClick={() => setShowQR(false)}
                          className="text-gray-500 hover:text-gray-700 text-xs font-semibold">
                          
                                Cancelar
                              </button>
                            </motion.div>
                      }
                        </AnimatePresence>
                      </div>
                  }
                  </div>

                  {/* RUT Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      RUT
                    </label>
                    <div className="relative">
                      <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setRutFile)}
                      className="hidden"
                      id="rut-upload" />
                    
                      <label
                      htmlFor="rut-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${rutFile ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-gray-300 hover:border-brand-cyan hover:bg-brand-cyan/5'}`}>
                      
                        {rutFile ?
                      <>
                            <Check className="w-5 h-5" />
                            <span className="font-medium text-sm">
                              {rutFile.name}
                            </span>
                          </> :

                      <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              Subir RUT (PDF, JPG, PNG - máx 5MB)
                            </span>
                          </>
                      }
                      </label>
                    </div>
                  </div>

                  {/* Camara de Comercio Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cámara de Comercio
                    </label>
                    <div className="relative">
                      <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setCamaraFile)}
                      className="hidden"
                      id="camara-upload" />
                    
                      <label
                      htmlFor="camara-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${camaraFile ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-gray-300 hover:border-brand-cyan hover:bg-brand-cyan/5'}`}>
                      
                        {camaraFile ?
                      <>
                            <Check className="w-5 h-5" />
                            <span className="font-medium text-sm">
                              {camaraFile.name}
                            </span>
                          </> :

                      <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              Subir Cámara de Comercio (PDF, JPG, PNG - máx 5MB)
                            </span>
                          </>
                      }
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      <strong>Nota:</strong> Si no tienes los documentos a la
                      mano ahora, puedes pagar y enviárnoslos después por correo
                      electrónico.
                    </p>
                  </div>
                </div>

                {/* Legal Checkboxes */}
                <div className="border-t border-gray-200 pt-5 space-y-3">
                  <h3 className="text-sm font-bold text-brand-navy mb-3 uppercase tracking-wider">
                    Aceptación legal
                  </h3>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                    type="checkbox"
                    checked={!!acceptedTermsAt}
                    onChange={(e) =>
                    setAcceptedTermsAt(
                      e.target.checked ? new Date().toISOString() : null
                    )
                    }
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                  
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Acepto los{' '}
                      <a
                      href="/terminos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                        Términos y Condiciones
                      </a>{' '}
                      del evento Latido & Huella.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                    type="checkbox"
                    checked={!!acceptedAgreementAt}
                    onChange={(e) =>
                    setAcceptedAgreementAt(
                      e.target.checked ? new Date().toISOString() : null
                    )
                    }
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                  
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Acepto el{' '}
                      <a
                      href="/terminos#expositores"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                        Contrato de Participación Comercial
                      </a>{' '}
                      como expositor.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                    type="checkbox"
                    checked={!!acceptedHabeasDataAt}
                    onChange={(e) =>
                    setAcceptedHabeasDataAt(
                      e.target.checked ? new Date().toISOString() : null
                    )
                    }
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                  
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Acepto la{' '}
                      <a
                      href="/terminos#habeas-data"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                        Política de Tratamiento de Datos (Habeas Data)
                      </a>
                      .
                    </span>
                  </label>
                </div>
              </form>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Price breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatCOP(breakdown.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>IVA (19%)</span>
                    <span className="font-medium">
                      {formatCOP(breakdown.iva)}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-navy pt-2 border-t border-gray-100 mt-2">
                    <span className="font-bold">Total a pagar</span>
                    <span className="font-black text-lg">
                      {formatCOP(breakdown.total)}
                    </span>
                  </div>
                </div>
                <button
                type="submit"
                onClick={handleSubmit}
                disabled={
                isSubmitting ||
                !acceptedTermsAt ||
                !acceptedAgreementAt ||
                !acceptedHabeasDataAt
                }
                className="w-full bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                
                  {isSubmitting ?
                <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </> :

                <>Pagar {formatCOP(breakdown.total)} con Wompi →</>
                }
                </button>
                {(!acceptedTermsAt ||
              !acceptedAgreementAt ||
              !acceptedHabeasDataAt) &&
              <p className="text-center text-amber-600 text-xs mt-2 font-medium">
                    Debes aceptar todos los términos legales para continuar
                  </p>
              }
                <p className="text-center text-gray-500 text-xs mt-3">
                  Serás redirigido a Wompi para completar el pago de forma
                  segura
                </p>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </>);

}