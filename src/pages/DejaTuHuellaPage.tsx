import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, Heart, Loader2, PawPrint, Send, Trash2, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { supabase } from '../utils/supabase';

type PhotoItem = { id: string; file: File; preview: string };
const MAX_PHOTOS = 3;
const MAX_SIZE = 10 * 1024 * 1024;

export function DejaTuHuellaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [name, setName] = useState('');
  const [petName, setPetName] = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [publishConsent, setPublishConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const available = MAX_PHOTOS - photos.length;
    const next: PhotoItem[] = [];
    Array.from(files).slice(0, available).forEach((file) => {
      if (!file.type.startsWith('image/')) return toast.error(`${file.name} no es una imagen.`);
      if (file.size > MAX_SIZE) return toast.error(`${file.name} supera 10 MB.`);
      next.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    });
    setPhotos((current) => [...current, ...next]);
    if (files.length > available) toast.error('Puedes subir máximo 3 fotos.');
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const item = current.find((photo) => photo.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((photo) => photo.id !== id);
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return toast.error('Escribe tu nombre.');
    if (!photos.length) return toast.error('Sube al menos una foto.');
    if (comment.trim().length < 5) return toast.error('Déjanos un comentario sobre tu experiencia.');
    if (!publishConsent || !privacyConsent) return toast.error('Debes aceptar las autorizaciones.');

    setSending(true);
    const submissionId = crypto.randomUUID();
    try {
      const paths: string[] = [];
      for (let index = 0; index < photos.length; index += 1) {
        const file = photos[index].file;
        const extension = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
        const path = `${submissionId}/foto-${index + 1}-${Date.now()}.${extension}`;
        const { error } = await supabase.storage.from('community-event-photos').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });
        if (error) throw error;
        paths.push(path);
      }

      const { error } = await supabase.from('community_event_submissions').insert({
        id: submissionId,
        full_name: name.trim(),
        pet_name: petName.trim() || null,
        contact: contact.trim() || null,
        comment: comment.trim(),
        photo_paths: paths,
        status: 'pending',
        source: 'event-qr',
        publication_consent: true,
        privacy_consent: true,
        consented_at: new Date().toISOString(),
      });
      if (error) throw error;
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      toast.error('No pudimos enviar las fotos. Revisa la conexión e inténtalo nuevamente.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0D1B6E] px-5 py-12 text-white">
        <Toaster richColors position="top-center" />
        <div className="absolute inset-0 bg-[url('/PATRON_HUELLAS_fondo.png')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-lg items-center">
          <div className="w-full rounded-[32px] bg-white p-8 text-center text-[#0D1B6E] shadow-2xl">
            <CheckCircle2 className="mx-auto h-20 w-20 text-[#00BCD4]" />
            <p className="mt-5 text-sm font-bold uppercase tracking-[.2em] text-[#00BCD4]">Tu historia llegó</p>
            <h1 className="mt-3 text-4xl font-extrabold">Gracias por dejar tu huella</h1>
            <p className="mt-4 leading-relaxed text-gray-600">Tus fotos y tu comentario quedaron pendientes de revisión antes de aparecer en la web.</p>
            <Link to="/muro" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0D1B6E] px-6 py-4 font-bold text-white">
              <PawPrint className="h-5 w-5" /> Ver el Muro de Huellas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2FBFD] text-[#0D1B6E]">
      <Toaster richColors position="top-center" />
      <header className="relative overflow-hidden bg-[#0D1B6E]"><img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a62b3e923b7828d3562f13f.png" alt="Latido y Huella" style={{display:'block',width:'100%',objectFit:'cover'}} /></header>

      <main className="relative z-10 mx-auto -mt-7 max-w-2xl px-4 pb-16">
        <form onSubmit={submit} className="rounded-[30px] bg-white p-5 shadow-[0_25px_80px_rgba(13,27,110,.15)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-[#00BCD4]"><Camera /></div>
            <div><h2 className="text-xl font-extrabold">Tus mejores momentos</h2><p className="text-sm text-gray-500">De 1 a 3 fotos · máximo 10 MB cada una.</p></div>
          </div>

          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => addPhotos(event.target.files)} />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                <img src={photo.preview} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removePhoto(photo.id)} className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-white text-red-500 shadow"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" onClick={() => inputRef.current?.click()} className={`${photos.length ? 'aspect-square' : 'col-span-3 min-h-36'} flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#00BCD4]/50 bg-cyan-50 p-3`}>
                <UploadCloud className="h-9 w-9 text-[#00BCD4]" /><span className="mt-2 font-bold">Seleccionar fotos</span>
              </button>
            )}
          </div>

          <div className="my-8 h-px bg-gray-100" />
          <div className="space-y-5">
            <Field label="Tu nombre *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamas?" className="field" /></Field>
            <Field label="Nombre de tu mascota (opcional)"><input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Ej. Luna" className="field" /></Field>
            <Field label={`Cuéntanos tu experiencia * · ${comment.length}/500`}><textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 500))} rows={5} placeholder="¿Qué fue lo más bonito de este momento?" className="field resize-none" /></Field>
            <Field label="Correo o celular (opcional)"><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Para contactarte si destacamos tu historia" className="field" /></Field>
          </div>

          <div className="my-8 h-px bg-gray-100" />
          <Consent checked={publishConsent} onChange={setPublishConsent}>Autorizo a Latido y Huella a revisar y publicar estas fotos y mi comentario en sus canales digitales. *</Consent>
          <Consent checked={privacyConsent} onChange={setPrivacyConsent}>Acepto el tratamiento de mis datos para gestionar este contenido. *</Consent>

          <button disabled={sending} className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0D1B6E] px-6 py-4 font-extrabold text-white disabled:opacity-60">
            {sending ? <><Loader2 className="animate-spin" /> Subiendo...</> : <><Send /> Enviar y dejar mi huella</>}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-gray-400"><Heart className="h-4 w-4 text-orange-400" /> Nada se publica sin revisión.</p>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-extrabold">{label}<div className="mt-2">{children}</div></label>;
}

function Consent({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-600"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 accent-[#00BCD4]" />{children}</label>;
}



