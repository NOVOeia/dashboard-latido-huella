import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, ArrowLeft, Home } from 'lucide-react';
import { supabase } from '../utils/supabase';
type PaymentStatus = 'loading' | 'paid' | 'pending' | 'failed' | 'not_found';
// Mapeo de las tablas que tienen pagos a sus nombres "human-friendly"
const TABLES_WITH_PAYMENTS = [{
  table: 'registrations_5k',
  label: 'Caminata 5K'
}, {
  table: 'expositor_reservations',
  label: 'Reserva de stand'
}, {
  table: 'toldos_reservations',
  label: 'Reserva de toldo'
}, {
  table: 'sports_teams',
  label: 'Inscripción deportiva'
}] as const;
export function GraciasPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('id') || searchParams.get('ref');
  const wompiTxStatus = searchParams.get('env') ? searchParams.get('env') : null;
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [registration, setRegistration] = useState<any>(null);
  const [registrationType, setRegistrationType] = useState<string>('');
  useEffect(() => {
    if (!reference) {
      setStatus('not_found');
      return;
    }
    let cancelled = false;
    let pollCount = 0;
    const MAX_POLLS = 20; // 20 × 3s = 60s
    async function checkStatus() {
      // Buscar el registro en cada tabla con pagos
      for (const {
        table,
        label
      } of TABLES_WITH_PAYMENTS) {
        const {
          data
        } = await supabase.from(table).select('*').eq('id', reference).maybeSingle();
        if (data) {
          if (cancelled) return;
          setRegistration(data);
          setRegistrationType(label);
          if (data.status === 'paid') {
            setStatus('paid');
            return;
          }
          if (data.status === 'expired' || data.status === 'refunded') {
            setStatus('failed');
            return;
          }
          // pending_payment → seguir polling
          setStatus('pending');
          return;
        }
      }
      if (cancelled) return;
      setStatus('not_found');
    }
    checkStatus();
    // Si está pending, hacer polling cada 3 segundos hasta que cambie o pasen 60s
    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > MAX_POLLS) {
        clearInterval(interval);
        return;
      }
      if (status === 'pending') {
        await checkStatus();
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);
  return <div className="pt-20 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-cyan hover:text-brand-navy transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-gray-100 text-center">
          {status === 'loading' && <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-brand-navy mb-3">
                Verificando tu pago…
              </h1>
              <p className="text-gray-500">Un momento por favor.</p>
            </>}

          {status === 'pending' && <>
              <motion.div animate={{
            scale: [1, 1.05, 1]
          }} transition={{
            duration: 1.5,
            repeat: Infinity
          }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-brand-navy mb-3">
                Procesando tu pago…
              </h1>
              <p className="text-gray-600 mb-2">
                Estamos confirmando tu transacción con la pasarela.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Esta página se actualizará automáticamente. No cierres la
                ventana.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 max-w-sm mx-auto">
                <p className="font-semibold text-brand-navy mb-1">Referencia</p>
                <p className="font-mono text-xs break-all">{reference}</p>
              </div>
            </>}

          {status === 'paid' && <>
              <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-green/15 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-brand-green" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
                ¡Pago confirmado! 🎉
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Tu {registrationType.toLowerCase()} fue registrada exitosamente.
              </p>

              {registration && <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-6 text-left mb-8">
                  <h3 className="font-bold text-brand-navy mb-3">
                    Detalles de tu inscripción
                  </h3>
                  <div className="space-y-2 text-sm">
                    {registration.full_name && <div className="flex justify-between">
                        <span className="text-gray-500">Nombre</span>
                        <strong>{registration.full_name}</strong>
                      </div>}
                    {registration.team_name && <div className="flex justify-between">
                        <span className="text-gray-500">Equipo</span>
                        <strong>{registration.team_name}</strong>
                      </div>}
                    {registration.contact_name && <div className="flex justify-between">
                        <span className="text-gray-500">Contacto</span>
                        <strong>{registration.contact_name}</strong>
                      </div>}
                    {registration.email && <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <strong>{registration.email}</strong>
                      </div>}
                    {registration.captain_email && <div className="flex justify-between">
                        <span className="text-gray-500">Email capitán</span>
                        <strong>{registration.captain_email}</strong>
                      </div>}
                    {registration.total_amount && <div className="flex justify-between pt-2 border-t border-brand-cyan/20">
                        <span className="text-gray-500">Total pagado</span>
                        <strong className="text-brand-navy">
                          $
                          {(registration.total_amount / 100).toLocaleString('es-CO')}
                        </strong>
                      </div>}
                  </div>
                </div>}

              <p className="text-gray-500 text-sm mb-8">
                Te enviamos un correo con todos los detalles. Revisa tu bandeja
                de entrada y spam.
              </p>

              <Link to="/" className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">
                <Home className="w-4 h-4" /> Volver al inicio
              </Link>
            </>}

          {status === 'failed' && <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-brand-navy mb-3">
                Tu pago no se pudo procesar
              </h1>
              <p className="text-gray-600 mb-8">
                La transacción fue rechazada o expiró. Puedes intentarlo de
                nuevo.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">
                <Home className="w-4 h-4" /> Volver al inicio
              </Link>
            </>}

          {status === 'not_found' && <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-brand-navy mb-3">
                No encontramos esta inscripción
              </h1>
              <p className="text-gray-600 mb-8">
                La referencia no existe o ya expiró. Si crees que es un error,
                contáctanos.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">
                <Home className="w-4 h-4" /> Volver al inicio
              </Link>
            </>}
        </motion.div>
      </div>
    </div>;
}