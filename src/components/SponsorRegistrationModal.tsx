import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Smartphone,
  CreditCard,
  PhoneCall,
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
import { CartItem } from '../pages/PatrocinadoresPage';
const TERMS_VERSION = '2026-05-01';
interface SponsorRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  planType: 'empresarial' | 'deportivo' | 'espacios';
  planName: string;
  basePrice: number;
  initialExtras?: Record<string, CartItem>;
  accentColor?: string;
}
type SubmitAction = 'wompi' | 'comercial';
export function SponsorRegistrationModal({
  open,
  onClose,
  planType,
  planName,
  basePrice,
  initialExtras = {},
  accentColor
}: SponsorRegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<SubmitAction | null>(null);
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cedula, setCedula] = useState('');
  const [comments, setComments] = useState('');
  const [extras, setExtras] = useState<Record<string, CartItem>>(initialExtras);
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
  // Reset extras and fetch IP when modal opens
  useEffect(() => {
    if (open) {
      setExtras(initialExtras);
      fetch('https://api.ipify.org?format=json').
      then((res) => res.json()).
      then((data) => setIpAddress(data.ip)).
      catch(() => setIpAddress(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const handleShowQR = () => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
    setShowQR(true);
  };
  useEffect(() => {
    if (!showQR || !sessionId || cedulaUrlFromMobile) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.storage.
      from('expositor-documents').
      list(`mobile/${sessionId}`);
      if (data && data.length > 0) {
        const found = data.find((f) => f.name.startsWith('cedula_'));
        if (found) {
          const {
            data: { publicUrl }
          } = supabase.storage.
          from('expositor-documents').
          getPublicUrl(`mobile/${sessionId}/${found.name}`);
          setCedulaUrlFromMobile(publicUrl);
          setShowQR(false);
          toast.success('Cédula subida exitosamente desde el celular');
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showQR, sessionId, cedulaUrlFromMobile]);
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
        setContactName(data.nombre || '');
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
        `Tu archivo pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. El máximo es ${MAX_MB}MB.`
      );
      return;
    }
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
    const { error } = await supabase.storage.
    from('expositor-documents').
    upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType
    });
    if (error) {
      console.error('Upload error:', error);
      const detail = (error as any)?.message || 'error desconocido';
      toast.error(`No se pudo subir el ${prefix}: ${detail}`);
      return null;
    }
    const {
      data: { publicUrl }
    } = supabase.storage.from('expositor-documents').getPublicUrl(fileName);
    return publicUrl;
  };
  const calculateTotal = () => {
    let subtotal = basePrice;
    Object.values(extras).forEach((item) => {
      subtotal += item.totalPrice;
    });
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return {
      subtotal,
      iva,
      total
    };
  };
  const { subtotal, iva, total } = calculateTotal();
  const handleSubmit = async (action: SubmitAction) => {
    const check = firstError(
      isValidBrandName(companyName),
      isValidFullName(contactName),
      isValidEmail(email),
      isValidColombianPhone(phone),
      isValidCedula(cedula)
    );
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    if (!acceptedTermsAt || !acceptedAgreementAt || !acceptedHabeasDataAt) {
      toast.error('Debes aceptar todos los términos legales para continuar');
      return;
    }
    setIsSubmitting(true);
    setSubmitType(action);
    try {
      let cedulaUrl: string | null = cedulaUrlFromMobile;
      if (cedulaFile) {
        cedulaUrl = await uploadFile(cedulaFile, 'cedula');
        if (!cedulaUrl) {
          setIsSubmitting(false);
          setSubmitType(null);
          return;
        }
      }
      const rutUrl = rutFile ? await uploadFile(rutFile, 'rut') : null;
      const camaraUrl = camaraFile ?
      await uploadFile(camaraFile, 'camara') :
      null;
      const amountInCents = Math.round(total * 100);
      const status = action === 'wompi' ? 'pending_payment' : 'pending_review';
      const extrasArray = Object.values(extras).map(
        (e) =>
        `${e.name} ${e.variantLabel ? `(${e.variantLabel})` : ''} x${e.quantity}`
      );
      const sourceTagMap = {
        empresarial: 'patrocinador-empresarial',
        deportivo: 'patrocinador-deportivo',
        espacios: 'patrocinador-espacios'
      };
      const { data, error } = await supabase.
      from('sponsor_inquiries').
      insert({
        company_name: companyName,
        contact_name: contactName,
        email,
        phone,
        cedula,
        plan_type: planType,
        plan_name: planName,
        extra_spaces: extrasArray.length > 0 ? extrasArray : null,
        comments: comments.trim() || null,
        cedula_url: cedulaUrl,
        rut_url: rutUrl,
        camara_comercio_url: camaraUrl,
        status,
        amount_cents: amountInCents,
        payment_method: action,
        source_tag: sourceTagMap[planType],
        accepted_terms_at: acceptedTermsAt,
        accepted_agreement_at: acceptedAgreementAt,
        accepted_habeas_data_at: acceptedHabeasDataAt,
        terms_version: TERMS_VERSION,
        ip_address: ipAddress
      }).
      select().
      single();
      if (error) {
        console.error('Supabase insert error:', error);
        const err = error as any;
        const detail =
        err?.message || err?.details || err?.hint || 'error desconocido';
        toast.error(`No se pudo guardar el registro: ${detail}`, {
          duration: 8000
        });
        setIsSubmitting(false);
        setSubmitType(null);
        return;
      }
      // Insert cart line items for "espacios" plan into sponsor_order_items.
      // This gives N8N / CRM structured data per product (SKU, qty, unit price).
      if (planType === 'espacios' && Object.keys(extras).length > 0) {
        const orderItems = Object.values(extras).map((item) => ({
          sponsor_inquiry_id: data.id,
          product_id: item.productId,
          product_name: item.name,
          variant_id: item.variantId || null,
          variant_label: item.variantLabel || null,
          quantity: item.quantity,
          unit_price_cents: Math.round(item.unitPrice * 100),
          total_price_cents: Math.round(item.totalPrice * 100)
        }));
        const { error: itemsError } = await supabase.
        from('sponsor_order_items').
        insert(orderItems);
        if (itemsError) {
          // Non-blocking: parent inquiry already saved. Log for follow-up.
          console.error('sponsor_order_items insert error:', itemsError);
        }
      }
      if (action === 'wompi') {
        await redirectToWompi({
          reference: `SPONSOR-${data.id}`,
          amountInCents,
          customer: {
            email,
            fullName: contactName,
            phone,
            legalIdType: 'CC',
            legalId: cedula
          },
          redirectUrl: `${window.location.origin}/gracias`
        });
      } else {
        toast.success(
          'Hemos recibido tu solicitud. El equipo comercial se pondrá en contacto contigo pronto.',
          {
            duration: 5000
          }
        );
        setTimeout(() => {
          onClose();
          setIsSubmitting(false);
          setSubmitType(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Ocurrió un error. Por favor intenta de nuevo.');
      setIsSubmitting(false);
      setSubmitType(null);
    }
  };
  const headerStyle = accentColor ?
  {
    background: `linear-gradient(to right, ${accentColor}, #0D1B6E)`
  } :
  undefined;
  const allLegalAccepted = !!(
  acceptedTermsAt &&
  acceptedAgreementAt &&
  acceptedHabeasDataAt);

  return (
    <>
      <Toaster position="top-center" richColors />
      <AnimatePresence>
        {open &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              <div
              className={`p-6 text-white relative ${accentColor ? '' : 'bg-gradient-to-r from-brand-cyan to-brand-navy'}`}
              style={headerStyle}>
              
                <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                
                  <X className="w-6 h-6" />
                </button>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                  {planType === 'empresarial' ?
                'Patrocinio Empresarial' :
                planType === 'deportivo' ?
                'Patrocinador Deportivo' :
                'Espacios Extra'}
                </p>
                <h2 className="text-2xl font-bold mb-1">{planName}</h2>
                <p className="text-white/90 text-sm font-medium">
                  Total con IVA: ${total.toLocaleString('es-CO')}
                </p>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
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

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Empresa / Marca *
                  </label>
                  <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                  placeholder="Nombre de la empresa" />
                
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Persona de contacto *
                  </label>
                  <input
                  required
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
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
                    Cédula del contacto *
                  </label>
                  <input
                  required
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                  placeholder="1234567890" />
                
                </div>

                {/* Extras Summary (only for espacios) */}
                {planType === 'espacios' &&
              Object.values(extras).length > 0 &&
              <div className="border-t border-gray-200 pt-5">
                      <h3 className="text-sm font-bold text-brand-navy mb-3 uppercase tracking-wider">
                        Resumen del Pedido
                      </h3>
                      <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {Object.values(extras).map((item) =>
                  <div
                    key={item.cartId}
                    className="flex justify-between items-start text-sm">
                    
                            <div>
                              <span className="font-bold text-gray-800">
                                {item.name}
                              </span>
                              {item.variantLabel &&
                      <span className="text-gray-500 block text-xs">
                                  {item.variantLabel}
                                </span>
                      }
                              <span className="text-brand-green font-medium text-xs block mt-0.5">
                                Cant: {item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-brand-navy whitespace-nowrap">
                              ${item.totalPrice.toLocaleString('es-CO')}
                            </span>
                          </div>
                  )}
                        <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-CO')}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>IVA (19%)</span>
                            <span>${iva.toLocaleString('es-CO')}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-brand-navy pt-1">
                            <span>Total a pagar</span>
                            <span>${total.toLocaleString('es-CO')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
              }

                {/* Comments */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comentarios (opcional)
                  </label>
                  <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none resize-none"
                  placeholder="Cuéntanos qué buscas con este patrocinio..." />
                
                </div>

                {/* Documents */}
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-bold text-brand-navy mb-4 uppercase tracking-wider">
                    Documentos
                  </h3>

                  {/* Cédula Upload */}
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
                      id="sponsor-cedula-upload" />
                    
                      <label
                      htmlFor="sponsor-cedula-upload"
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
                              Subir cédula (PDF, JPG, PNG - máx 10MB)
                            </span>
                          </>
                      }
                      </label>
                    </div>

                    {!cedulaFile && !cedulaUrlFromMobile &&
                  <div className="mt-2 hidden md:flex flex-col items-start">
                        <button
                      type="button"
                      onClick={handleShowQR}
                      className="text-brand-cyan hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors">
                      
                          <Smartphone className="w-4 h-4" />
                          Subir desde mi celular →
                        </button>

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
                      id="sponsor-rut-upload" />
                    
                      <label
                      htmlFor="sponsor-rut-upload"
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
                              Subir RUT (PDF, JPG, PNG - máx 10MB)
                            </span>
                          </>
                      }
                      </label>
                    </div>
                  </div>

                  {/* Cámara de Comercio */}
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
                      id="sponsor-camara-upload" />
                    
                      <label
                      htmlFor="sponsor-camara-upload"
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
                              Subir Cámara de Comercio (PDF, JPG, PNG - máx
                              10MB)
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
                      mano, puedes enviarlos después por correo electrónico.
                    </p>
                  </div>
                </div>

                {/* Legal Checkboxes */}
                <div className="border-t border-gray-200 pt-5 space-y-3">
                  <h3 className="text-sm font-bold text-brand-navy mb-3 uppercase tracking-wider">
                    Aceptación legal
                  </h3>

                  <label className="flex items-start gap-3 cursor-pointer">
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

                  <label className="flex items-start gap-3 cursor-pointer">
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
                      href="/terminos#patrocinadores"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                        Acuerdo de Patrocinio
                      </a>{' '}
                      con sus condiciones y contraprestaciones.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
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
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <p className="text-center text-gray-600 text-xs mb-4">
                  Elige cómo deseas continuar. Pagando con Wompi aseguras tu
                  cupo de inmediato; con el equipo comercial podemos
                  personalizar tu plan.
                </p>
                {!allLegalAccepted &&
              <p className="text-center text-amber-600 text-xs mb-3 font-medium">
                    Debes aceptar todos los términos legales para continuar
                  </p>
              }
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                  type="button"
                  onClick={() => handleSubmit('wompi')}
                  disabled={isSubmitting || !allLegalAccepted}
                  className="bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  
                    {isSubmitting && submitType === 'wompi' ?
                  <>
                        <Loader2 className="w-5 h-5 animate-spin" />{' '}
                        Procesando...
                      </> :

                  <>
                        <CreditCard className="w-5 h-5" /> Pagar con Wompi
                      </>
                  }
                  </button>
                  <button
                  type="button"
                  onClick={() => handleSubmit('comercial')}
                  disabled={isSubmitting || !allLegalAccepted}
                  className="bg-white border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  
                    {isSubmitting && submitType === 'comercial' ?
                  <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                      </> :

                  <>
                        <PhoneCall className="w-5 h-5" /> Equipo comercial
                      </>
                  }
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </>);

}