import React, { useEffect, useState, useRef, Fragment, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Check,
  Loader2,
  Smartphone,
  Plus,
  Trash2,
  Mail,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  PawPrint,
  Sparkles,
  PhoneCall } from
'lucide-react';
import { Toaster, toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { redirectToWompi } from '../utils/wompi';
import { GHL_WEBHOOKS, sendToGHL } from '../utils/webhooks';
import {
  isValidEmail,
  isValidPetName,
  isValidPetBreed,
  firstError } from
'../utils/validators';
import { formatCOP, priceBreakdown } from '../utils/format';
import { PetFormCard, PetEntry, newPet, validatePhotoFile } from './PetFormCard';
const PET_PRICE = 40000; // COP per additional pet
const TERMS_VERSION = '2026-05-01';
const SOURCE_TAG = 'caminata-5k';
interface ValidatedRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  document_id: string | null;
  status: string;
}
interface ExistingPet {
  name: string;
  breed: string;
}
type Step = 'pets' | 'email' | 'pending_payment' | 'otp' | 'summary';
interface PetRegistrationModalProps {
  open: boolean;
  onClose: () => void;
}
export function PetRegistrationModal({
  open,
  onClose
}: PetRegistrationModalProps) {
  const [step, setStep] = useState<Step>('pets');
  const [pets, setPets] = useState<PetEntry[]>([newPet()]);
  const [acceptedTermsAt, setAcceptedTermsAt] = useState<string | null>(null);
  const [acceptedHabeasDataAt, setAcceptedHabeasDataAt] = useState<
    string | null>(
    null);
  const [email, setEmail] = useState('');
  const [cedulaInput, setCedulaInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validatedReg, setValidatedReg] =
  useState<ValidatedRegistration | null>(null);
  const [existingPets, setExistingPets] = useState<ExistingPet[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportSending, setSupportSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  // Fetch IP on open
  useEffect(() => {
    if (open) {
      fetch('https://api.ipify.org?format=json').
      then((res) => res.json()).
      then((data) => setIpAddress(data.ip)).
      catch(() => setIpAddress(null));
    }
  }, [open]);
  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('pets');
        setPets([newPet()]);
        setAcceptedTermsAt(null);
        setAcceptedHabeasDataAt(null);
        setEmail('');
        setCedulaInput('');
        setValidatedReg(null);
        setExistingPets([]);
        setOtpCode('');
        setSupportSent(false);
      }, 300);
    }
  }, [open]);
  // Poll mobile uploads for each pet that has QR open
  useEffect(() => {
    if (!open) return;
    const activePets = pets.filter((p) => p.showQR && !p.photoUrlFromMobile);
    if (activePets.length === 0) return;
    const interval = setInterval(async () => {
      for (const pet of activePets) {
        const { data } = await supabase.storage.
        from('expositor-documents').
        list(`mobile/${pet.photoSessionId}`);
        if (data && data.length > 0) {
          const file = data.find((f) => f.name.startsWith('pet_photo_'));
          if (file) {
            const {
              data: { publicUrl }
            } = supabase.storage.
            from('expositor-documents').
            getPublicUrl(`mobile/${pet.photoSessionId}/${file.name}`);
            updatePet(pet.id, (p) => ({
              ...p,
              photoUrlFromMobile: publicUrl,
              showQR: false
            }));
            toast.success('Foto subida desde celular ✓');
          }
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [open, pets]);
  const updatePet = (id: string, fn: (p: PetEntry) => PetEntry) => {
    setPets((prev) => prev.map((p) => p.id === id ? fn(p) : p));
  };
  const addPet = () => {
    if (pets.length >= 5) {
      toast.error('Máximo 5 mascotas por registro');
      return;
    }
    setPets((prev) => [...prev, newPet()]);
  };
  const removePet = (id: string) => {
    if (pets.length <= 1) return;
    setPets((prev) => prev.filter((p) => p.id !== id));
  };
  const handlePhotoChange = (
  petId: string,
  e: React.ChangeEvent<HTMLInputElement>) =>
  {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size === 0) {
      toast.error(`"${file.name}" parece estar vacío.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        `Tu foto pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo 10MB.`
      );
      return;
    }
    const mime = (file.type || '').toLowerCase();
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const validExts = [
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
    if (!isImage && !validExts.includes(ext)) {
      toast.error(`Formato no reconocido. Usa una foto JPG, PNG, HEIC, WEBP...`);
      return;
    }
    updatePet(petId, (p) => ({
      ...p,
      photoFile: file,
      photoUrlFromMobile: null
    }));
    toast.success('✓ Foto seleccionada');
  };
  const uploadPhoto = async (file: File): Promise<string | null> => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext =
    (file.name.split('.').pop() || 'jpg').
    toLowerCase().
    replace(/[^a-z0-9]/g, '') || 'jpg';
    const fileName = `pet_photo_${timestamp}_${randomStr}.${ext}`;
    const { error } = await supabase.storage.
    from('expositor-documents').
    upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });
    if (error) {
      console.error('Photo upload error:', error);
      toast.error(`No se pudo subir la foto: ${error.message}`);
      return null;
    }
    const {
      data: { publicUrl }
    } = supabase.storage.from('expositor-documents').getPublicUrl(fileName);
    return publicUrl;
  };
  // ─── STEP HANDLERS ──────────────────────────────
  const handleContinueFromPets = () => {
    for (let i = 0; i < pets.length; i++) {
      const p = pets[i];
      if (!p.photoFile && !p.photoUrlFromMobile) {
        toast.error(`Mascota ${i + 1}: la foto es obligatoria`);
        return;
      }
      const check = firstError(isValidPetName(p.name), isValidPetBreed(p.breed));
      if (!check.ok) {
        toast.error(`Mascota ${i + 1}: ${check.message}`);
        return;
      }
      if (!p.size) {
        toast.error(`Mascota ${i + 1}: selecciona el tamaño`);
        return;
      }
      if (p.bio.length > 80) {
        toast.error(`Mascota ${i + 1}: la bio debe tener máximo 80 caracteres`);
        return;
      }
    }
    if (!acceptedTermsAt || !acceptedHabeasDataAt) {
      toast.error('Debes aceptar los Términos y el tratamiento de datos');
      return;
    }
    setStep('email');
  };
  const handleVerifyEmail = async () => {
    const check = isValidEmail(email);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    const cedulaTrim = cedulaInput.trim();
    if (!cedulaTrim) {
      toast.error('Ingresa la cédula con la que te inscribiste');
      return;
    }
    setIsValidating(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      const { data, error } = await supabase.
      from('registrations_5k').
      select('id, full_name, email, phone, document_id, status').
      ilike('email', emailNorm).
      eq('document_id', cedulaTrim).
      order('created_at', {
        ascending: false
      }).
      limit(1).
      maybeSingle();
      if (error) {
        console.error(error);
        toast.error('Error consultando inscripción. Intenta de nuevo.');
        setIsValidating(false);
        return;
      }
      if (!data) {
        // Neutral message — does not reveal whether email or cedula exists
        toast.error(
          'No encontramos una inscripción con esos datos. Verifica email y cédula.'
        );
        setIsValidating(false);
        return;
      }
      setValidatedReg(data as ValidatedRegistration);
      if (data.status !== 'paid') {
        setStep('pending_payment');
        setIsValidating(false);
        return;
      }
      // Send OTP
      await sendOtp(emailNorm);
      setIsValidating(false);
    } catch (err) {
      console.error(err);
      toast.error('Error validando inscripción');
      setIsValidating(false);
    }
  };
  const sendOtp = async (toEmail: string) => {
    setOtpSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: toEmail,
        options: {
          shouldCreateUser: true
        }
      });
      if (error) {
        console.error(error);
        toast.error(
          'No pudimos enviar el código. Verifica que el email OTP esté habilitado en Supabase.'
        );
        setOtpSending(false);
        return;
      }
      // Fetch existing pets while waiting
      if (validatedReg) {
        const { data: petsData } = await supabase.
        from('registration_pets').
        select('name, breed').
        eq('registration_id', validatedReg.id);
        setExistingPets(petsData as ExistingPet[] || []);
      }
      setStep('otp');
      toast.success(`Código enviado a ${toEmail}`);
      setOtpSending(false);
    } catch (err) {
      console.error(err);
      toast.error('Error enviando código');
      setOtpSending(false);
    }
  };
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error('El código debe tener 6 dígitos');
      return;
    }
    setOtpVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode,
        type: 'email'
      });
      if (error) {
        console.error(error);
        toast.error('Código incorrecto o expirado');
        setOtpVerifying(false);
        return;
      }
      // Refetch existing pets after verification (in case state was lost)
      if (validatedReg && existingPets.length === 0) {
        const { data: petsData } = await supabase.
        from('registration_pets').
        select('name, breed').
        eq('registration_id', validatedReg.id);
        setExistingPets(petsData as ExistingPet[] || []);
      }
      setStep('summary');
      setOtpVerifying(false);
    } catch (err) {
      console.error(err);
      toast.error('Error verificando código');
      setOtpVerifying(false);
    }
  };
  const handleSupportRequest = async () => {
    if (!validatedReg) return;
    setSupportSending(true);
    const result = await sendToGHL(GHL_WEBHOOKS.SOPORTE_PAGOS, {
      form_type: 'soporte_pago_pendiente',
      etiqueta: 'Soporte Pagos - Muro de Huellas',
      registration_id: validatedReg.id,
      nombre: validatedReg.full_name,
      email: validatedReg.email,
      phone: validatedReg.phone || '',
      cedula: validatedReg.document_id || '',
      mensaje:
      'Usuario indica que ya realizó el pago pero su inscripción aún figura como pendiente. Solicita revisión.'
    });
    setSupportSending(false);
    if (result.success) {
      setSupportSent(true);
      toast.success(
        'Solicitud enviada. Te responderemos en máx 24h por WhatsApp.'
      );
    } else {
      // Show success anyway — we have console logs as backup
      setSupportSent(true);
      toast.success('Solicitud enviada. Te responderemos pronto por WhatsApp.');
      console.log('📋 Soporte (backup):', validatedReg);
    }
  };
  const handlePay = async () => {
    if (!validatedReg) return;
    setIsSubmitting(true);
    try {
      // Upload photos first
      const petsWithUrls: {
        pet: PetEntry;
        photoUrl: string;
      }[] = [];
      for (const pet of pets) {
        let photoUrl = pet.photoUrlFromMobile;
        if (pet.photoFile) {
          photoUrl = await uploadPhoto(pet.photoFile);
        }
        if (!photoUrl) {
          toast.error(`No se pudo subir la foto de ${pet.name}`);
          setIsSubmitting(false);
          return;
        }
        petsWithUrls.push({
          pet,
          photoUrl
        });
      }
      const netAmount = PET_PRICE * pets.length;
      const breakdown = priceBreakdown(netAmount);
      const amountInCents = breakdown.total * 100;
      // Create a new "extra_pet" registration linked to original
      const { data: newReg, error: regError } = await supabase.
      from('registrations_5k').
      insert({
        full_name: validatedReg.full_name,
        email: validatedReg.email,
        phone: validatedReg.phone,
        document_id: validatedReg.document_id,
        ticket_type: 'extra_pet',
        linked_registration_id: validatedReg.id,
        total_amount: amountInCents,
        status: 'pending_payment',
        payment_provider: 'wompi',
        terms_accepted: true,
        terms_accepted_at: acceptedTermsAt,
        source_tag: SOURCE_TAG,
        amount_cents: amountInCents,
        payment_method: 'wompi',
        accepted_terms_at: acceptedTermsAt,
        accepted_habeas_data_at: acceptedHabeasDataAt,
        terms_version: TERMS_VERSION,
        ip_address: ipAddress
      }).
      select('id').
      single();
      if (regError || !newReg) {
        console.error(regError);
        toast.error('No se pudo crear el registro. Intenta de nuevo.');
        setIsSubmitting(false);
        return;
      }
      // Insert pets — note: photo_url and bio columns must exist in registration_pets
      const petsToInsert = petsWithUrls.map(({ pet, photoUrl }) => ({
        registration_id: newReg.id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        size: pet.size,
        is_primary: false,
        amount_cents: PET_PRICE * 100,
        photo_url: photoUrl,
        bio: pet.bio || null
      }));
      const { error: petsError } = await supabase.
      from('registration_pets').
      insert(petsToInsert);
      if (petsError) {
        console.error(petsError);
        toast.error(
          'No se pudieron guardar las mascotas. Verifica que existan las columnas photo_url y bio en registration_pets.'
        );
        setIsSubmitting(false);
        return;
      }
      toast.success('¡Listo! Redirigiendo al pago…');
      await redirectToWompi({
        reference: `MURO-PETS-${newReg.id}`,
        amountInCents,
        customer: {
          email: validatedReg.email,
          fullName: validatedReg.full_name,
          phone: validatedReg.phone || '',
          legalIdType: 'CC',
          legalId: validatedReg.document_id || undefined
        },
        redirectUrl: `${window.location.origin}/gracias?id=${newReg.id}`
      });
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };
  const totalNet = PET_PRICE * pets.length;
  const totalBreakdown = priceBreakdown(totalNet);
  if (!open) return null;
  return (
    <>
      <Toaster position="top-center" richColors />
      <AnimatePresence>
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
            className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-cyan to-brand-navy p-6 text-white relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <PawPrint className="w-7 h-7" />
                <h2 className="text-2xl font-bold">
                  Registra tu mascota en el Muro
                </h2>
              </div>
              <p className="text-white/85 text-sm">
                Sube tu foto, suma huellas y compite por Mascota Influencer 2026
                🏆
              </p>
              {/* Stepper */}
              <div className="flex items-center gap-2 mt-4 text-xs">
                {[
                {
                  id: 'pets',
                  label: '1. Mascota'
                },
                {
                  id: 'email',
                  label: '2. Verificar'
                },
                {
                  id: 'summary',
                  label: '3. Pagar'
                }].
                map((s, i) => {
                  const isActive =
                  s.id === 'pets' && step === 'pets' ||
                  s.id === 'email' &&
                  ['email', 'otp', 'pending_payment'].includes(step) ||
                  s.id === 'summary' && step === 'summary';
                  const isPast =
                  s.id === 'pets' && step !== 'pets' ||
                  s.id === 'email' && step === 'summary';
                  return (
                    <Fragment key={s.id}>
                      <div
                        className={`px-3 py-1 rounded-full font-semibold transition-all ${isActive ? 'bg-white text-brand-navy' : isPast ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'}`}>
                        
                        {s.label}
                      </div>
                      {i < 2 && <div className="w-3 h-px bg-white/30" />}
                    </Fragment>);

                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 'pets' &&
              <PetsStep
                pets={pets}
                onUpdate={updatePet}
                onAdd={addPet}
                onRemove={removePet}
                onPhotoChange={handlePhotoChange}
                acceptedTermsAt={acceptedTermsAt}
                setAcceptedTermsAt={setAcceptedTermsAt}
                acceptedHabeasDataAt={acceptedHabeasDataAt}
                setAcceptedHabeasDataAt={setAcceptedHabeasDataAt} />

              }

              {step === 'email' &&
              <EmailStep
                email={email}
                setEmail={setEmail}
                isValidating={isValidating}
                otpSending={otpSending} />

              }

              {step === 'pending_payment' && validatedReg &&
              <PendingPaymentStep
                reg={validatedReg}
                supportSent={supportSent}
                supportSending={supportSending}
                onSupportRequest={handleSupportRequest} />

              }

              {step === 'otp' &&
              <OtpStep
                email={email}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                otpVerifying={otpVerifying}
                onResend={() => sendOtp(email.trim().toLowerCase())}
                otpSending={otpSending} />

              }

              {step === 'summary' && validatedReg &&
              <SummaryStep
                reg={validatedReg}
                existingPets={existingPets}
                newPets={pets}
                breakdown={totalBreakdown} />

              }
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-5 bg-gray-50 flex-shrink-0">
              {step === 'pets' &&
              <div className="flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="text-gray-500">
                      Total ({pets.length} mascota{pets.length !== 1 ? 's' : ''}
                      ):
                    </span>{' '}
                    <span className="font-bold text-brand-navy text-lg">
                      {formatCOP(totalBreakdown.total)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      IVA incl.
                    </span>
                  </div>
                  <button
                  onClick={handleContinueFromPets}
                  className="bg-brand-cyan hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                  
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              }

              {step === 'email' &&
              <div className="flex items-center justify-between gap-3">
                  <button
                  onClick={() => setStep('pets')}
                  className="text-gray-600 hover:text-brand-navy text-sm font-semibold flex items-center gap-1">
                  
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <button
                  onClick={handleVerifyEmail}
                  disabled={isValidating || otpSending}
                  className="bg-brand-cyan hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                  
                    {isValidating || otpSending ?
                  <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </> :

                  <>
                        Verificar email
                        <ArrowRight className="w-4 h-4" />
                      </>
                  }
                  </button>
                </div>
              }

              {step === 'pending_payment' &&
              <button
                onClick={() => setStep('email')}
                className="text-gray-600 hover:text-brand-navy text-sm font-semibold flex items-center gap-1">
                
                  <ArrowLeft className="w-4 h-4" /> Usar otro email
                </button>
              }

              {step === 'otp' &&
              <div className="flex items-center justify-between gap-3">
                  <button
                  onClick={() => setStep('email')}
                  className="text-gray-600 hover:text-brand-navy text-sm font-semibold flex items-center gap-1">
                  
                    <ArrowLeft className="w-4 h-4" /> Cambiar email
                  </button>
                  <button
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || otpCode.length !== 6}
                  className="bg-brand-cyan hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                  
                    {otpVerifying ?
                  <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </> :

                  <>
                        Confirmar código
                        <ArrowRight className="w-4 h-4" />
                      </>
                  }
                  </button>
                </div>
              }

              {step === 'summary' &&
              <div className="flex items-center justify-between gap-3">
                  <button
                  onClick={() => setStep('otp')}
                  className="text-gray-600 hover:text-brand-navy text-sm font-semibold flex items-center gap-1">
                  
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <button
                  onClick={handlePay}
                  disabled={isSubmitting}
                  className="bg-brand-cyan hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                  
                    {isSubmitting ?
                  <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </> :

                  <>
                        <CreditCard className="w-4 h-4" />
                        Pagar {formatCOP(totalBreakdown.total)}
                      </>
                  }
                  </button>
                </div>
              }
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>);

}
// ─────────────────────────────────────────────────
// STEP COMPONENTS
// ─────────────────────────────────────────────────
function PetsStep({
  pets,
  onUpdate,
  onAdd,
  onRemove,
  onPhotoChange,
  acceptedTermsAt,
  setAcceptedTermsAt,
  acceptedHabeasDataAt,
  setAcceptedHabeasDataAt










}: {pets: PetEntry[];onUpdate: (id: string, fn: (p: PetEntry) => PetEntry) => void;onAdd: () => void;onRemove: (id: string) => void;onPhotoChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;acceptedTermsAt: string | null;setAcceptedTermsAt: (v: string | null) => void;acceptedHabeasDataAt: string | null;setAcceptedHabeasDataAt: (v: string | null) => void;}) {
  return (
    <div className="space-y-5">
      <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          <strong className="text-brand-navy">
            Suma mascotas a tu inscripción.
          </strong>{' '}
          Las que ya registraste en la Caminata aparecen automáticamente en el
          Muro. Aquí puedes agregar mascotas extra al mismo perfil.
        </p>
      </div>

      {pets.map((pet, idx) =>
      <PetFormCard
        key={pet.id}
        pet={pet}
        index={idx}
        canRemove={pets.length > 1}
        onUpdate={(fn) => onUpdate(pet.id, fn)}
        onRemove={() => onRemove(pet.id)}
        onPhotoChange={(e) => onPhotoChange(pet.id, e)} />

      )}

      {pets.length < 5 &&
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-cyan hover:text-brand-cyan transition-colors font-semibold text-sm">
        
          <Plus className="w-4 h-4" />
          Agregar otra mascota
        </button>
      }

      {/* Legal */}
      <div className="border-t border-gray-200 pt-5 space-y-3">
        <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
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
              href="/terminos#mascotas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan font-semibold hover:underline">
              
              Términos y Condiciones
            </a>{' '}
            (sección Mascotas) del evento Latido & Huella.
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
            Autorizo el{' '}
            <a
              href="/terminos#datos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan font-semibold hover:underline">
              
              tratamiento de mis datos personales (Habeas Data)
            </a>
            .
          </span>
        </label>
      </div>
    </div>);

}
function EmailStep({
  email,
  setEmail,
  cedulaInput,
  setCedulaInput,
  isValidating,
  otpSending







}: {email: string;setEmail: (v: string) => void;cedulaInput: string;setCedulaInput: (v: string) => void;isValidating: boolean;otpSending: boolean;}) {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand-cyan" />
        </div>
        <h3 className="text-xl font-bold text-brand-navy mb-2">
          Verifica tu identidad
        </h3>
        <p className="text-gray-600 text-sm">
          Para agregar mascotas al Muro necesitas estar inscrito a la Caminata
          Canina. Confirma con tu email y cédula.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email de tu inscripción
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isValidating || otpSending}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none disabled:opacity-50"
            placeholder="tu@email.com"
            autoFocus />
          
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cédula del titular
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cedulaInput}
            onChange={(e) => setCedulaInput(e.target.value.replace(/\D/g, ''))}
            disabled={isValidating || otpSending}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none disabled:opacity-50"
            placeholder="1234567890" />
          
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          ¿Aún no te inscribes?{' '}
          <Link
            to="/caminata-5k"
            className="text-brand-cyan font-semibold hover:underline">
            
            Inscríbete a la caminata →
          </Link>
        </p>
      </div>
    </div>);

}
function PendingPaymentStep({
  reg,
  supportSent,
  supportSending,
  onSupportRequest





}: {reg: ValidatedRegistration;supportSent: boolean;supportSending: boolean;onSupportRequest: () => void;}) {
  if (supportSent) {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-brand-green" />
        </div>
        <h3 className="text-xl font-bold text-brand-navy mb-2">
          Solicitud enviada
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Nuestro equipo revisará tu pago y te responderá por WhatsApp en máximo
          24 horas.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1 mb-4">
          <p>
            <span className="text-gray-500">Nombre:</span>{' '}
            <strong>{reg.full_name}</strong>
          </p>
          <p>
            <span className="text-gray-500">Email:</span>{' '}
            <strong>{reg.email}</strong>
          </p>
          {reg.phone &&
          <p>
              <span className="text-gray-500">WhatsApp:</span>{' '}
              <strong>{reg.phone}</strong>
            </p>
          }
        </div>
      </div>);

  }
  return (
    <div className="max-w-md mx-auto py-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-brand-navy mb-2">
          Pago pendiente
        </h3>
        <p className="text-gray-600 text-sm">
          Encontramos tu inscripción pero el pago aún no figura confirmado.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1 text-sm">
        <p>
          <span className="text-gray-500">Nombre:</span>{' '}
          <strong className="text-brand-navy">{reg.full_name}</strong>
        </p>
        <p>
          <span className="text-gray-500">Email:</span>{' '}
          <strong className="text-brand-navy">{reg.email}</strong>
        </p>
        {reg.phone &&
        <p>
            <span className="text-gray-500">WhatsApp:</span>{' '}
            <strong className="text-brand-navy">{reg.phone}</strong>
          </p>
        }
      </div>

      <div className="space-y-3">
        <Link
          to="/caminata-5k"
          className="block w-full bg-brand-cyan hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-center transition-colors shadow-md">
          
          Hacer el pago ahora
        </Link>
        <button
          onClick={onSupportRequest}
          disabled={supportSending}
          className="w-full border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          
          {supportSending ?
          <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </> :

          <>
              <PhoneCall className="w-4 h-4" />
              Ya pagué, solicitar revisión
            </>
          }
        </button>
      </div>
    </div>);

}
function OtpStep({
  email,
  otpCode,
  setOtpCode,
  otpVerifying,
  onResend,
  otpSending







}: {email: string;otpCode: string;setOtpCode: (v: string) => void;otpVerifying: boolean;onResend: () => void;otpSending: boolean;}) {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand-cyan" />
        </div>
        <h3 className="text-xl font-bold text-brand-navy mb-2">
          Ingresa el código
        </h3>
        <p className="text-gray-600 text-sm">
          Te enviamos un código de 6 dígitos a{' '}
          <strong className="text-brand-navy">{email}</strong>
        </p>
      </div>
      <div>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
          disabled={otpVerifying}
          className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none disabled:opacity-50 text-center text-2xl font-bold tracking-[0.5em] font-mono"
          placeholder="000000"
          autoFocus />
        
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={onResend}
          disabled={otpSending}
          className="text-brand-cyan text-sm font-semibold hover:underline disabled:opacity-50">
          
          {otpSending ? 'Enviando...' : 'Reenviar código'}
        </button>
      </div>
    </div>);

}
function SummaryStep({
  reg,
  existingPets,
  newPets,
  breakdown





}: {reg: ValidatedRegistration;existingPets: ExistingPet[];newPets: PetEntry[];breakdown: ReturnType<typeof priceBreakdown>;}) {
  const firstName = reg.full_name.split(' ')[0];
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-2xl mb-2">👋</div>
        <h3 className="text-xl font-bold text-brand-navy mb-1">
          ¡Hola {firstName}!
        </h3>
        {existingPets.length > 0 ?
        <p className="text-gray-600 text-sm">
            Ya tienes en el Muro:{' '}
            {existingPets.map((p, i) =>
          <span key={i} className="font-semibold text-brand-navy">
                🐾 {p.name}
                {i < existingPets.length - 1 ? ', ' : ''}
              </span>
          )}
          </p> :

        <p className="text-gray-600 text-sm">
            Vas a agregar tus primeras mascotas al Muro.
          </p>
        }
      </div>

      <div className="bg-gray-50 rounded-2xl p-5">
        <h4 className="font-bold text-brand-navy mb-3 text-sm uppercase tracking-wider">
          Vas a agregar
        </h4>
        <div className="space-y-3">
          {newPets.map((p, i) => {
            const photoUrl = p.photoFile ?
            URL.createObjectURL(p.photoFile) :
            p.photoUrlFromMobile;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white rounded-xl p-3">
                
                {photoUrl &&
                <img
                  src={photoUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />

                }
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-navy text-sm truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{p.breed}</p>
                </div>
                <span className="text-brand-navy font-bold text-sm whitespace-nowrap">
                  {formatCOP(PET_PRICE)}
                </span>
              </div>);

          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>
            Subtotal ({newPets.length} mascota{newPets.length !== 1 ? 's' : ''})
          </span>
          <span className="font-medium">{formatCOP(breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>IVA (19%)</span>
          <span className="font-medium">{formatCOP(breakdown.iva)}</span>
        </div>
        <div className="flex justify-between text-brand-navy pt-2 border-t border-gray-100 mt-2">
          <span className="font-bold">Total a pagar</span>
          <span className="font-black text-lg">
            {formatCOP(breakdown.total)}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500">
        Serás redirigido a Wompi para completar el pago de forma segura.
      </p>
    </div>);

}