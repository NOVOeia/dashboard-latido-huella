import React, { useEffect, useMemo, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  User,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock,
  Heart,
  Droplets,
  Award,
  ArrowLeft,
  Ticket,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Gift,
  ShieldCheck } from
'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { redirectToWompi } from '../utils/wompi';
import {
  isValidEmail,
  isValidColombianPhone,
  isValidCedula,
  isValidFullName,
  isValidPetName,
  isValidPetBreed,
  firstError } from
'../utils/validators';
import { formatCOP, priceBreakdown } from '../utils/format';
import {
  PetFormCard,
  PetEntry,
  newPet,
  validatePhotoFile } from
'../components/PetFormCard';
type RegistrationStep = 1 | 1.5 | 2 | 3 | 4;
type TicketType = 'pet_lover' | 'deportista' | 'extra_pet';
export function Caminata5KPage() {
  const [step, setStep] = useState<RegistrationStep>(1);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedReglamento, setAcceptedReglamento] = useState(false);
  const [acceptedPetTerms, setAcceptedPetTerms] = useState(false);
  const [acceptedPetHabeas, setAcceptedPetHabeas] = useState(false);
  const [pets, setPets] = useState<PetEntry[]>([newPet()]);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: ''
  });
  const [extraValidation, setExtraValidation] = useState({
    email: '',
    isValidating: false,
    validatedRegistration: null as any
  });
  // Computed price
  const price = useMemo(() => {
    if (ticketType === 'pet_lover') {
      const extraCount = Math.max(0, pets.length - 1);
      return 140000 + extraCount * 40000;
    }
    if (ticketType === 'deportista') {
      return 100000;
    }
    if (ticketType === 'extra_pet') {
      return pets.length * 40000;
    }
    return 0;
  }, [ticketType, pets.length]);
  // Poll mobile uploads for each pet that has QR open
  useEffect(() => {
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
            setPets((prev) =>
            prev.map((p) =>
            p.id === pet.id ?
            {
              ...p,
              photoUrlFromMobile: publicUrl,
              showQR: false
            } :
            p
            )
            );
            toast.success('Foto subida desde celular ✓');
          }
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pets]);
  const addPet = () => {
    if (pets.length >= 5) {
      toast.error('Máximo 5 mascotas por registro');
      return;
    }
    setPets([...pets, newPet()]);
  };
  const removePet = (id: string) => {
    if (pets.length <= 1) return;
    setPets(pets.filter((p) => p.id !== id));
  };
  const updatePet = (id: string, fn: (p: PetEntry) => PetEntry) => {
    setPets((prev) => prev.map((p) => p.id === id ? fn(p) : p));
  };
  const handlePetPhotoChange = (
  petId: string,
  e: React.ChangeEvent<HTMLInputElement>) =>
  {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!validatePhotoFile(file)) return;
    updatePet(petId, (p) => ({
      ...p,
      photoFile: file,
      photoUrlFromMobile: null
    }));
    toast.success('✓ Foto seleccionada');
  };
  const uploadPetPhoto = async (file: File): Promise<string | null> => {
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
  const validateExtraPet = async () => {
    const emailCheck = isValidEmail(extraValidation.email);
    if (!emailCheck.ok) {
      toast.error(emailCheck.message);
      return;
    }
    setExtraValidation((prev) => ({
      ...prev,
      isValidating: true
    }));
    try {
      const emailNormalized = extraValidation.email.trim().toLowerCase();
      const { data, error } = await supabase.
      from('registrations_5k').
      select('id, full_name, email, phone, document_id').
      ilike('email', emailNormalized).
      eq('status', 'paid').
      order('created_at', {
        ascending: false
      }).
      limit(1).
      maybeSingle();
      if (error) {
        console.error('Supabase validation error:', error);
        toast.error('Error consultando inscripción. Intenta de nuevo.');
        setExtraValidation((prev) => ({
          ...prev,
          isValidating: false
        }));
        return;
      }
      if (!data) {
        toast.error(
          'No encontramos una inscripción pagada con este email. Asegúrate de haber comprado tu pack primero.'
        );
        setExtraValidation((prev) => ({
          ...prev,
          isValidating: false
        }));
        return;
      }
      setExtraValidation((prev) => ({
        ...prev,
        isValidating: false,
        validatedRegistration: data
      }));
      setUserData({
        name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        idNumber: data.document_id || ''
      });
      setStep(2);
      toast.success(
        `¡Hola ${data.full_name.split(' ')[0]}! Puedes agregar tus mascotas extra.`
      );
    } catch (err) {
      console.error(err);
      toast.error('Error validando inscripción');
      setExtraValidation((prev) => ({
        ...prev,
        isValidating: false
      }));
    }
  };
  const handleRegistration = async () => {
    // Human data validation
    if (ticketType !== 'extra_pet') {
      const humanCheck = firstError(
        isValidFullName(userData.name),
        isValidEmail(userData.email),
        isValidColombianPhone(userData.phone),
        isValidCedula(userData.idNumber)
      );
      if (!humanCheck.ok) {
        toast.error(humanCheck.message);
        return;
      }
    }
    // Pet data validation
    if (ticketType === 'pet_lover' || ticketType === 'extra_pet') {
      for (let i = 0; i < pets.length; i++) {
        const p = pets[i];
        if (!p.photoFile && !p.photoUrlFromMobile) {
          toast.error(`Mascota ${i + 1}: la foto es obligatoria`);
          return;
        }
        const petCheck = firstError(
          isValidPetName(p.name),
          isValidPetBreed(p.breed)
        );
        if (!petCheck.ok) {
          toast.error(`Mascota ${i + 1}: ${petCheck.message}`);
          return;
        }
        if (!p.size) {
          toast.error(`Mascota ${i + 1}: selecciona el tamaño`);
          return;
        }
        if (p.bio.length > 80) {
          toast.error(
            `Mascota ${i + 1}: la bio debe tener máximo 80 caracteres`
          );
          return;
        }
      }
    }
    const needsReglamento = ticketType !== 'deportista';
    if (!acceptedTerms || needsReglamento && !acceptedReglamento) {
      toast.error(
        needsReglamento ?
        'Debes aceptar los Términos y el Reglamento del evento' :
        'Debes aceptar los Términos y Condiciones'
      );
      return;
    }
    setIsSubmitting(true);
    const breakdown = priceBreakdown(price);
    const amountInCents = breakdown.total * 100;
    try {
      // Upload photos first (if any pets)
      const petsWithUrls: {
        pet: PetEntry;
        photoUrl: string | null;
      }[] = [];
      if (ticketType === 'pet_lover' || ticketType === 'extra_pet') {
        for (const pet of pets) {
          let photoUrl = pet.photoUrlFromMobile;
          if (pet.photoFile) {
            photoUrl = await uploadPetPhoto(pet.photoFile);
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
      }
      // Verificar capacidad maxima 190 personas
      const { data: countData } = await supabase.rpc('count_all', {}).single().catch(() => ({ data: null }))
      const { count: titulares } = await supabase.from('registrations_5k').select('*', { count: 'exact', head: true }).eq('status', 'paid')
      const { count: acompanantes } = await supabase.from('registration_attendees').select('registration_id', { count: 'exact', head: true }).eq('is_primary', false)
      const totalHumanos = (titulares || 0) + (acompanantes || 0)
      const nuevosHumanos = 1 + attendees.filter(a => !a.isPet).length
      if (totalHumanos + nuevosHumanos > 190) {
        toast.error('Lo sentimos, hemos alcanzado el cupo maximo de participantes.')
        setIsSubmitting(false)
        return
      }

      let registrationId = '';
      if (ticketType === 'extra_pet') {
        const { data, error } = await supabase.
        from('registrations_5k').
        insert({
          full_name: userData.name,
          email: userData.email,
          phone: userData.phone,
          document_id: userData.idNumber,
          ticket_type: 'extra_pet',
          linked_registration_id: extraValidation.validatedRegistration.id,
          total_amount: amountInCents,
          status: 'pending_payment',
          payment_provider: 'wompi',
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString()
        }).
        select('id').
        single();
        if (error || !data) throw error;
        registrationId = data.id;
        const petsToInsert = petsWithUrls.map(({ pet, photoUrl }) => ({
          registration_id: registrationId,
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          size: pet.size,
          is_primary: false,
          amount_cents: 4000000,
          photo_url: photoUrl,
          bio: pet.bio || null
        }));
        const { error: petsError } = await supabase.
        from('registration_pets').
        insert(petsToInsert);
        if (petsError) throw petsError;
      } else {
        const primaryPet = ticketType === 'pet_lover' ? pets[0] : null;
        const { data, error } = await supabase.
        from('registrations_5k').
        insert({
          full_name: userData.name,
          email: userData.email,
          phone: userData.phone,
          document_id: userData.idNumber,
          ticket_type: ticketType,
          pet_name: primaryPet?.name || null,
          pet_breed: primaryPet?.breed || null,
          total_amount: amountInCents,
          status: 'pending_payment',
          payment_provider: 'wompi',
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString()
        }).
        select('id').
        single();
        if (error || !data) throw error;
        registrationId = data.id;
        if (ticketType === 'pet_lover') {
          const petsToInsert = petsWithUrls.map(({ pet, photoUrl }, index) => ({
            registration_id: registrationId,
            name: pet.name,
            breed: pet.breed,
            age: pet.age,
            size: pet.size,
            is_primary: index === 0,
            amount_cents: index === 0 ? 0 : 4000000,
            photo_url: photoUrl,
            bio: pet.bio || null
          }));
          const { error: petsError } = await supabase.
          from('registration_pets').
          insert(petsToInsert);
          if (petsError) throw petsError;
        }
      }
      toast.success('¡Inscripción registrada! Redirigiendo al pago…');
      // Enviar email inmediatamente sin esperar confirmacion de pago
      try {
        const contractToken = crypto.randomUUID()
        await supabase.from('registrations_5k').update({ contract_token: contractToken }).eq('id', registrationId)
        const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0D1B6E;padding:32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style="height:60px" alt="Latido y Huella"/><p style="color:rgba(255,255,255,0.7);font-size:13px;margin:12px 0 0">26 de julio de 2026 - Parque COMFAMA Llanogrande</p></div><div style="background:white;padding:32px;border-radius:0 0 16px 16px"><h1 style="color:#0D1B6E;font-size:24px;margin:0 0 8px">Hola ${userData.name}!</h1><p style="color:#444;font-size:15px;line-height:1.7">Tu registro para la <strong>Caminata Canina 6.5K Pet Lovers - Latido y Huella 2026</strong> esta siendo procesado.</p><div style="background:#f0f4ff;border-radius:14px;padding:20px;margin:16px 0"><p style="margin:0 0 8px;color:#333"><strong>Fecha:</strong> Domingo 26 de julio de 2026</p><p style="margin:0 0 8px;color:#333"><strong>Hora:</strong> 7:00 AM</p><p style="margin:0;color:#333"><strong>Lugar:</strong> Parque del Bienestar COMFAMA Llanogrande</p></div><div style="background:#fff8e1;border-left:4px solid #FFB300;padding:16px;margin:16px 0"><p style="color:#e65100;font-weight:700;margin:0 0 8px">Firma tu consentimiento</p><div style="text-align:center"><a href="https://admin-latidoyhuella.netlify.app/contrato/${contractToken}" style="background:#00BCD4;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block">Firmar consentimiento</a></div></div><p style="color:#888;font-size:12px;text-align:center;margin:16px 0 0">eventos@latidoyhuella.co - WhatsApp +57 333 277 7912</p></div></div>`
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: userData.email, subject: 'Tu registro en Latido y Huella 2026', html: emailHtml, type: '5k' })
        })
        await supabase.from('registrations_5k').update({ email1_sent_at: new Date().toISOString() }).eq('id', registrationId)
      } catch(emailErr) { console.error('Email error:', emailErr) }
      await redirectToWompi({
        reference: registrationId,
        amountInCents,
        customer: {
          email: userData.email,
          fullName: userData.name,
          phone: userData.phone,
          legalIdType: 'CC',
          legalId: userData.idNumber || undefined
        },
        redirectUrl: `${window.location.origin}/gracias?id=${registrationId}`
      });
    } catch (err) {
      console.error('Error registrando inscripción:', err);
      toast.error(
        'No pudimos procesar tu inscripción. Intenta de nuevo o contáctanos.'
      );
      setIsSubmitting(false);
    }
  };
  // Helper to determine active visual step (1 to 4)
  const visualStep = step === 1.5 ? 1 : step;
  return (
    <div className="pt-20 bg-brand-navy">
      <Toaster position="top-center" richColors />

      {/* Hero Banner */}
      <section className="relative py-24 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1920&q=80&auto=format&fit=crop"
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
            className="text-5xl md:text-7xl text-white mb-4">
            
            Caminata Canina <br />
            <span className="text-brand-cyan">Pet Lovers</span>
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
            
            6,5 km de conexión, amor y deporte junto a tu mejor amigo de cuatro
            patas.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5 text-brand-cyan" /> 7:00 AM
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <MapPin className="w-5 h-5 text-brand-green" /> Parque del
              Bienestar COMFAMA
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <PawPrint className="w-5 h-5 text-brand-yellow" /> Todas las razas
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-brand-navy text-center mb-4">
            {['Inscríbete', 'Ahora'].map((word, i) =>
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
              className="inline-block shimmer-text mr-3">
              
                {word}
              </motion.span>
            )}
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Completa tu registro en simples pasos
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3, 4].map((s) =>
            <Fragment key={s}>
                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${visualStep >= s ? 'bg-brand-cyan text-white' : 'bg-gray-200 text-gray-500'}`}>
                
                  {visualStep > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 &&
              <div
                className={`w-12 md:w-20 h-1 mx-1 rounded-full transition-all ${visualStep > s ? 'bg-brand-cyan' : 'bg-gray-200'}`} />

              }
              </Fragment>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border border-gray-100">
            {/* Step 1: Choose type */}
            {step === 1 &&
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}>
              
                <h3 className="text-2xl font-bold text-brand-navy mb-2 text-center">
                  ¿Cómo vas a participar?
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  Elige tu modalidad de inscripción
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pack Pet Lover */}
                  <button
                  onClick={() => {
                    setTicketType('pet_lover');
                    setPets([newPet()]);
                    setStep(2);
                  }}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left hover:shadow-lg flex flex-col h-full ${ticketType === 'pet_lover' ? 'border-brand-cyan bg-brand-cyan/5' : 'border-brand-cyan/30 hover:border-brand-cyan'}`}>
                  
                    <div className="absolute top-0 right-0 bg-brand-cyan text-white px-3 py-1 rounded-bl-xl rounded-tr-xl font-bold text-[10px]">
                      MÁS POPULAR
                    </div>
                    <div className="w-12 h-12 bg-brand-cyan/10 rounded-xl flex items-center justify-center text-brand-cyan mb-4">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-brand-navy mb-1">
                      Pack Pet Lover
                    </h4>
                    <p className="text-gray-500 text-xs mb-4 flex-grow">
                      1 persona + 1 mascota
                    </p>
                    <p className="text-2xl font-bold text-brand-navy">
                      $140.000{' '}
                      <span className="text-xs font-normal text-gray-400">
                        COP
                      </span>
                    </p>
                  </button>

                  {/* Pack Deportista */}
                  <button
                  onClick={() => {
                    setTicketType('deportista');
                    setPets([]);
                    setStep(3);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:shadow-lg flex flex-col h-full ${ticketType === 'deportista' ? 'border-brand-navy bg-brand-navy/5' : 'border-gray-200 hover:border-brand-navy'}`}>
                  
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 mb-4">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-brand-navy mb-1">
                      Pack Deportista
                    </h4>
                    <p className="text-gray-500 text-xs mb-4 flex-grow">
                      1 persona sin mascota
                    </p>
                    <p className="text-2xl font-bold text-brand-navy">
                      $100.000{' '}
                      <span className="text-xs font-normal text-gray-400">
                        COP
                      </span>
                    </p>
                  </button>

                  {/* Pack Mascota Extra */}
                  <button
                  onClick={() => {
                    setTicketType('extra_pet');
                    setPets([newPet()]);
                    setStep(1.5);
                  }}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left hover:shadow-lg flex flex-col h-full ${ticketType === 'extra_pet' ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-200 hover:border-brand-yellow'}`}>
                  
                    <div className="absolute top-0 right-0 bg-brand-yellow text-brand-navy px-3 py-1 rounded-bl-xl rounded-tr-xl font-bold text-[10px]">
                      ADICIONAL
                    </div>
                    <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow mb-4">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-brand-navy mb-1">
                      Mascota Extra
                    </h4>
                    <p className="text-gray-500 text-xs mb-4 flex-grow">
                      Para 1 mascota extra
                    </p>
                    <p className="text-2xl font-bold text-brand-navy">
                      $40.000{' '}
                      <span className="text-xs font-normal text-gray-400">
                        COP
                      </span>
                    </p>
                  </button>
                </div>
              </motion.div>
            }

            {/* Step 1.5: Validate Extra Pet */}
            {step === 1.5 &&
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}>
              
                <h3 className="text-2xl font-bold text-brand-navy mb-2 text-center">
                  Verifica tu inscripción
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  Para agregar una mascota extra, debes tener una inscripción
                  activa.
                </p>

                <div className="max-w-md mx-auto space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email de registro *
                    </label>
                    <input
                    type="email"
                    value={extraValidation.email}
                    onChange={(e) =>
                    setExtraValidation({
                      ...extraValidation,
                      email: e.target.value
                    })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                    placeholder="El email que usaste al comprar" />
                  
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    
                      <ChevronLeft className="w-5 h-5" /> Volver
                    </button>
                    <button
                    onClick={validateExtraPet}
                    disabled={extraValidation.isValidating}
                    className="flex-1 py-3 rounded-xl bg-brand-yellow text-brand-navy font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-lg disabled:opacity-70">
                    
                      {extraValidation.isValidating ? 'Buscando...' : 'Validar'}{' '}
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            }

            {/* Step 2: Pet Registration */}
            {step === 2 &&
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}>
              
                <h3 className="text-2xl font-bold text-brand-navy mb-2 text-center">
                  Registra a {pets.length > 1 ? 'tus mascotas' : 'tu mascota'}
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  {ticketType === 'extra_pet' ?
                'Agrega las mascotas adicionales' :
                'Tu peludo es el protagonista 🐾'}
                </p>

                <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-4 flex items-start gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    {ticketType === 'pet_lover' ?
                  <>
                        <strong className="text-brand-navy">
                          Tu mascota principal está incluida.
                        </strong>{' '}
                        Puedes agregar hasta 4 mascotas adicionales por $40.000
                        c/u.
                      </> :

                  <>
                        <strong className="text-brand-navy">
                          $40.000 por mascota adicional.
                        </strong>{' '}
                        Las mascotas se sumarán al Muro de las Huellas 🐾
                      </>
                  }
                  </p>
                </div>

                <div className="space-y-5">
                  <AnimatePresence>
                    {pets.map((pet, index) => {
                    const isPrincipal =
                    index === 0 && ticketType === 'pet_lover';
                    const title = isPrincipal ?
                    'Mascota Principal' :
                    `Mascota Extra #${ticketType === 'extra_pet' ? index + 1 : index}`;
                    const badge = !isPrincipal ?
                    <span className="bg-brand-yellow/20 text-brand-yellow text-xs px-2 py-0.5 rounded-full ml-2">
                          {ticketType === 'extra_pet' ? '$40.000' : '+$40.000'}
                        </span> :
                    null;
                    return (
                      <motion.div
                        key={pet.id}
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
                        }}>
                        
                          <PetFormCard
                          pet={pet}
                          index={index}
                          canRemove={pets.length > 1}
                          title={title}
                          badge={badge}
                          onUpdate={(fn) => updatePet(pet.id, fn)}
                          onRemove={() => removePet(pet.id)}
                          onPhotoChange={(e) =>
                          handlePetPhotoChange(pet.id, e)
                          } />
                        
                        </motion.div>);

                  })}
                  </AnimatePresence>

                  {pets.length < 5 &&
                <button
                  onClick={addPet}
                  className="w-full py-4 border-2 border-dashed border-brand-cyan/50 rounded-2xl text-brand-cyan font-bold flex items-center justify-center gap-2 hover:bg-brand-cyan/5 transition-colors">
                  
                      <Plus className="w-5 h-5" /> Agregar otra mascota
                      (+$40.000)
                    </button>
                }
                </div>

                {/* Pet-specific legal acceptance */}
                <div className="mt-8 bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-3">
                  <h4 className="font-bold text-brand-navy mb-2 text-sm uppercase tracking-wider">
                    Aceptación para mascotas
                  </h4>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                    type="checkbox"
                    checked={acceptedPetTerms}
                    onChange={(e) => setAcceptedPetTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                  
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Acepto los{' '}
                      <a
                      href="/terminos#mascotas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan font-semibold hover:underline">
                      
                        Términos y Condiciones (sección Mascotas)
                      </a>{' '}
                      del evento Latido & Huella.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                    type="checkbox"
                    checked={acceptedPetHabeas}
                    onChange={(e) => setAcceptedPetHabeas(e.target.checked)}
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

                <div className="flex gap-4 mt-10">
                  <button
                  onClick={() =>
                  setStep(ticketType === 'extra_pet' ? 1.5 : 1)
                  }
                  className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  
                    <ChevronLeft className="w-5 h-5" /> Atrás
                  </button>
                  <button
                  onClick={() => setStep(ticketType === 'extra_pet' ? 4 : 3)}
                  disabled={!acceptedPetTerms || !acceptedPetHabeas}
                  className="flex-1 py-4 rounded-xl bg-brand-cyan text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  
                    {ticketType === 'extra_pet' ? 'Revisar' : 'Continuar'}{' '}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                {(!acceptedPetTerms || !acceptedPetHabeas) &&
              <p className="text-center text-amber-600 text-xs mt-3 font-medium">
                    Debes aceptar los Términos de mascotas y el Habeas Data para
                    continuar
                  </p>
              }
              </motion.div>
            }

            {/* Step 3: Human Registration */}
            {step === 3 &&
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}>
              
                <h3 className="text-2xl font-bold text-brand-navy mb-2 text-center">
                  Tus datos
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  Información del participante humano
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                    type="text"
                    value={userData.name}
                    onChange={(e) =>
                    setUserData({
                      ...userData,
                      name: e.target.value
                    })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                    placeholder="Tu nombre completo" />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cédula / Documento *
                    </label>
                    <input
                    type="text"
                    value={userData.idNumber}
                    onChange={(e) =>
                    setUserData({
                      ...userData,
                      idNumber: e.target.value
                    })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                    placeholder="Número de documento" />
                  
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                      setUserData({
                        ...userData,
                        email: e.target.value
                      })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                      placeholder="tu@email.com" />
                    
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        WhatsApp *
                      </label>
                      <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) =>
                      setUserData({
                        ...userData,
                        phone: e.target.value
                      })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none"
                      placeholder="+57 300 000 0000" />
                    
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                  onClick={() => setStep(ticketType === 'pet_lover' ? 2 : 1)}
                  className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  
                    <ChevronLeft className="w-5 h-5" /> Atrás
                  </button>
                  <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 rounded-xl bg-brand-cyan text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg">
                  
                    Revisar <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            }

            {/* Step 4: Summary */}
            {step === 4 &&
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}>
              
                <h3 className="text-2xl font-bold text-brand-navy mb-2 text-center">
                  Resumen de tu inscripción
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  Verifica tus datos antes de continuar al pago
                </p>

                <div className="space-y-6">
                  {/* Pack info */}
                  <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-brand-navy text-lg">
                          {ticketType === 'pet_lover' && 'Pack Pet Lover'}
                          {ticketType === 'deportista' && 'Pack Deportista'}
                          {ticketType === 'extra_pet' && 'Mascotas Extra'}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {ticketType === 'pet_lover' &&
                        '1 persona + 1 mascota'}
                          {ticketType === 'deportista' &&
                        '1 persona sin mascota'}
                          {ticketType === 'extra_pet' &&
                        'Adicional a inscripción existente'}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="border-t border-brand-cyan/10 pt-3 space-y-1.5 text-sm">
                      {ticketType === 'pet_lover' &&
                    <div className="flex justify-between text-gray-600">
                          <span>Inscripción base</span>
                          <span className="font-medium">
                            {formatCOP(140000)}
                          </span>
                        </div>
                    }
                      {ticketType === 'deportista' &&
                    <div className="flex justify-between text-gray-600">
                          <span>Inscripción base</span>
                          <span className="font-medium">
                            {formatCOP(100000)}
                          </span>
                        </div>
                    }
                      {ticketType === 'pet_lover' && pets.length > 1 &&
                    <div className="flex justify-between text-gray-600">
                          <span>{pets.length - 1} Mascota(s) extra</span>
                          <span className="font-medium">
                            {formatCOP((pets.length - 1) * 40000)}
                          </span>
                        </div>
                    }
                      {ticketType === 'extra_pet' &&
                    <div className="flex justify-between text-gray-600">
                          <span>{pets.length} Mascota(s) extra</span>
                          <span className="font-medium">
                            {formatCOP(pets.length * 40000)}
                          </span>
                        </div>
                    }
                      <div className="flex justify-between text-gray-600 pt-2 border-t border-brand-cyan/10 mt-2">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatCOP(price)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>IVA (19%)</span>
                        <span className="font-medium">
                          {formatCOP(priceBreakdown(price).iva)}
                        </span>
                      </div>
                      <div className="flex justify-between text-brand-navy pt-2 border-t border-brand-cyan/20 mt-1">
                        <span className="font-bold">Total a pagar</span>
                        <span className="font-black text-2xl">
                          {formatCOP(priceBreakdown(price).total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pets summary */}
                  {(ticketType === 'pet_lover' || ticketType === 'extra_pet') &&
                pets.length > 0 &&
                pets[0].name &&
                <div className="bg-gray-50 rounded-2xl p-6">
                        <h4 className="font-bold text-brand-navy mb-4 flex items-center gap-2">
                          <PawPrint className="w-5 h-5 text-brand-cyan" />{' '}
                          Mascotas ({pets.length})
                        </h4>
                        <div className="space-y-4">
                          {pets.map((pet, idx) =>
                    <div
                      key={pet.id}
                      className={
                      idx > 0 ? 'pt-4 border-t border-gray-200' : ''
                      }>
                      
                              <div className="flex items-center gap-3 mb-2">
                                {(pet.photoFile || pet.photoUrlFromMobile) &&
                        <img
                          src={
                          pet.photoFile ?
                          URL.createObjectURL(pet.photoFile) :
                          pet.photoUrlFromMobile!
                          }
                          alt={pet.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />

                        }
                                <p className="font-semibold text-brand-navy text-sm">
                                  {idx === 0 && ticketType === 'pet_lover' ?
                          'Principal: ' :
                          'Extra: '}
                                  {pet.name}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500 block text-xs">
                                    Raza
                                  </span>{' '}
                                  <strong>{pet.breed}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-xs">
                                    Edad
                                  </span>{' '}
                                  <strong>{pet.age || '—'}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-xs">
                                    Tamaño
                                  </span>{' '}
                                  <strong>{pet.size}</strong>
                                </div>
                              </div>
                            </div>
                    )}
                        </div>
                      </div>
                }

                  {/* Human summary */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-bold text-brand-navy mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-brand-cyan" /> Participante{' '}
                      {ticketType === 'extra_pet' && '(Validado)'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Nombre:</span>{' '}
                        <strong>{userData.name}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Documento:</span>{' '}
                        <strong>{userData.idNumber}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>{' '}
                        <strong>{userData.email}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">WhatsApp:</span>{' '}
                        <strong>{userData.phone}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Includes */}
                  {ticketType !== 'extra_pet' &&
                <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-bold text-brand-navy mb-3">
                        Tu inscripción incluye:
                      </h4>
                      <ul className="space-y-2">
                        {[
                    'Kit de bienvenida personalizado',
                    'Número de participante oficial',
                    'Perfil digital con QR único',
                    'Certificado digital al finalizar',
                    'Acceso completo a la feria',
                    ...(ticketType === 'pet_lover' ?
                    ['Participación en concurso Mascota Influencer'] :
                    [])].
                    map((item, i) =>
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-700">
                      
                            <Check className="w-4 h-4 text-brand-green" />{' '}
                            {item}
                          </li>
                    )}
                      </ul>
                    </div>
                }

                  {/* Legal Checkboxes */}
                  <div className="mt-8 bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-3">
                    <h4 className="font-bold text-brand-navy mb-2 text-sm uppercase tracking-wider">
                      Aceptación legal
                    </h4>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
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
                    {ticketType !== 'deportista' &&
                  <label className="flex items-start gap-3 cursor-pointer">
                        <input
                      type="checkbox"
                      checked={acceptedReglamento}
                      onChange={(e) =>
                      setAcceptedReglamento(e.target.checked)
                      }
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan flex-shrink-0 cursor-pointer" />
                    
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Acepto el{' '}
                          <a
                        href="/terminos#caminata"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-cyan font-semibold hover:underline">
                        
                            Reglamento y Consentimiento Informado
                          </a>{' '}
                          de la caminata canina (responsabilidad sobre mi
                          mascota, vacunación al día y comportamiento durante el
                          recorrido).
                        </span>
                      </label>
                  }
                  </div>

                  <div className="flex gap-4 mt-10">
                    <button
                    onClick={() =>
                    setStep(ticketType === 'extra_pet' ? 2 : 3)
                    }
                    className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    
                      <ChevronLeft className="w-5 h-5" /> Editar
                    </button>
                    <button
                    onClick={handleRegistration}
                    disabled={
                    isSubmitting ||
                    !acceptedTerms ||
                    ticketType !== 'deportista' && !acceptedReglamento
                    }
                    className="flex-1 py-4 rounded-xl bg-brand-cyan text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-xl text-center disabled:opacity-50 disabled:cursor-not-allowed">
                    
                      {isSubmitting ?
                    'Registrando...' :
                    `Ir al pago · ${formatCOP(priceBreakdown(price).total)}`}
                    </button>
                  </div>
                  {(!acceptedTerms ||
                ticketType !== 'deportista' && !acceptedReglamento) &&
                <p className="text-center text-amber-600 text-xs mt-3 font-medium">
                      {ticketType === 'deportista' ?
                  'Debes aceptar los Términos para continuar al pago' :
                  'Debes aceptar los Términos y el Reglamento para continuar al pago'}
                    </p>
                }
                  <p className="text-center text-gray-400 text-xs mt-4">
                    Tu inscripción se registra en nuestro sistema y serás
                    redirigido al pago seguro con Wompi.
                  </p>
                </div>
              </motion.div>
            }
          </div>

          {/* Social cause banner */}
          <div className="mt-12 bg-brand-green/10 border border-brand-green/20 rounded-2xl p-6 text-center">
            <p className="text-brand-green font-bold flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 fill-brand-green" />
              Parte de tu inscripción apoya al CEIBA Rionegro, nuestra fundación
              aliada 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.7
            }}
            className="mb-16 bg-brand-navy rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            
            <div className="absolute inset-0 bg-paw-pattern-white opacity-5 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
                Durante el recorrido y con tu inscripción contarás con:
              </h3>
              <div className="w-16 h-1 bg-brand-cyan mx-auto rounded-full mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {[
                {
                  icon: Gift,
                  title: 'Kit de Participante',
                  description:
                  'Obsequios especiales para humanos y mascotas.',
                  color: 'bg-brand-yellow',
                  textColor: 'text-brand-yellow'
                },
                {
                  icon: Droplets,
                  title: 'Zonas de Hidratación',
                  description:
                  'Puntos estratégicos para refrescarte a ti y a tus peludos.',
                  color: 'bg-brand-cyan',
                  textColor: 'text-brand-cyan'
                },
                {
                  icon: ShieldCheck,
                  title: 'Seguridad y Cuidado',
                  description:
                  'Acompañamiento médico y veterinario durante todo el trayecto.',
                  color: 'bg-brand-green',
                  textColor: 'text-brand-green'
                },
                {
                  icon: Award,
                  title: 'Certificado de Participación',
                  description:
                  'Reconocimiento digital por ser parte del movimiento.',
                  color: 'bg-white',
                  textColor: 'text-white'
                }].
                map((item, index) =>
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 15
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}
                  viewport={{
                    once: true
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2 + index * 0.08
                  }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group">
                  
                    <div
                    className={`w-12 h-12 ${item.color} bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    
                      <item.icon className={`w-6 h-6 ${item.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-base leading-tight mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-white/70 text-xs md:text-sm leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
              <p className="text-white/50 text-xs text-center mt-6 italic max-w-2xl mx-auto leading-relaxed">
                * La personalización del kit con el nombre de tu mascota solo
                está garantizada para inscripciones realizadas antes del 20 de
                junio.
              </p>
            </div>
          </motion.div>

          {/* Route Info */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-6 text-center">
              {['El', 'Recorrido'].map((word, i) =>
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
                className="inline-block shimmer-text mr-3">
                
                  {word}
                </motion.span>
              )}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {[
              'Parque del Bienestar COMFAMA',
              'Vereda 3 Puertas',
              'Vía Linares',
              'Vereda Villachiquaga',
              'Meta Parque del Bienestar COMFAMA.'].
              map((point, i) =>
              <div key={i} className="flex flex-col items-center">
                  <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2 ${i === 0 ? 'bg-brand-green' : i === 4 ? 'bg-brand-yellow' : 'bg-brand-cyan'}`}>
                  
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {point}
                  </span>
                  {i < 4 &&
                <ChevronRight className="w-5 h-5 text-gray-300 mt-2 hidden md:block" />
                }
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>);

}