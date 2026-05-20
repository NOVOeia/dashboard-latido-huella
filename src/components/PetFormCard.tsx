import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, Loader2, Smartphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
export interface PetEntry {
  id: string;
  name: string;
  breed: string;
  age: string;
  size: string;
  bio: string;
  photoFile: File | null;
  photoUrlFromMobile: string | null;
  photoSessionId: string;
  showQR: boolean;
}
export const newPet = (): PetEntry => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  breed: '',
  age: '',
  size: '',
  bio: '',
  photoFile: null,
  photoUrlFromMobile: null,
  photoSessionId: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  showQR: false
});
export const validatePhotoFile = (file: File): boolean => {
  if (file.size === 0) {
    toast.error(`"${file.name}" parece estar vacío.`);
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error(`Tu foto pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo 10MB.`);
    return false;
  }
  const mime = (file.type || '').toLowerCase();
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const validExts = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif', 'bmp', 'tiff', 'tif'];
  const isImage = mime.startsWith('image/');
  if (!isImage && !validExts.includes(ext)) {
    toast.error(`Formato no reconocido. Usa una foto JPG, PNG, HEIC, WEBP...`);
    return false;
  }
  return true;
};
interface PetFormCardProps {
  pet: PetEntry;
  index: number;
  canRemove: boolean;
  /** Optional label override (e.g. "Mascota Principal" / "Mascota Extra #1") */
  title?: string;
  /** Optional badge shown next to title (e.g. "+$40.000") */
  badge?: React.ReactNode;
  onUpdate: (fn: (p: PetEntry) => PetEntry) => void;
  onRemove: () => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export function PetFormCard({
  pet,
  index,
  canRemove,
  title,
  badge,
  onUpdate,
  onRemove,
  onPhotoChange
}: PetFormCardProps) {
  const fileInputId = `pet-photo-${pet.id}`;
  const photoUrl = pet.photoFile ? URL.createObjectURL(pet.photoFile) : pet.photoUrlFromMobile;
  const hasPhoto = !!(pet.photoFile || pet.photoUrlFromMobile);
  const heading = title || `Mascota ${index + 1}`;
  return <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-brand-navy flex items-center gap-2">
          {heading}
          {badge}
        </h4>
        {canRemove && <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Eliminar mascota">
            <Trash2 className="w-4 h-4" />
          </button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-5">
        {/* Photo */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Foto *
          </label>
          <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" id={fileInputId} />
          <label htmlFor={fileInputId} className={`relative block w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors ${hasPhoto ? 'border-brand-green' : 'border-gray-300 hover:border-brand-cyan'}`}>
            {photoUrl ? <>
                <img src={photoUrl} alt={pet.name || `Mascota ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-1 right-1 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center shadow">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </> : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-2">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs text-center font-medium">
                  Subir foto
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  JPG, PNG, HEIC...
                </span>
              </div>}
          </label>
          {!hasPhoto && <button type="button" onClick={() => onUpdate((p) => ({
          ...p,
          showQR: !p.showQR
        }))} className="mt-2 text-brand-cyan hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Subir desde celular
            </button>}

          <AnimatePresence>
            {pet.showQR && !hasPhoto && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3 overflow-hidden">
                <p className="text-xs text-gray-600 mb-2 text-center">
                  Escanea con tu celular
                </p>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/subir-documento?session=${pet.photoSessionId}&doc=pet_photo`)}`} alt="QR Code" className="w-full max-w-[140px] mx-auto rounded-lg shadow-sm" />
                <div className="flex items-center justify-center gap-1 text-brand-cyan text-xs font-medium mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Esperando...
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nombre *
              </label>
              <input type="text" value={pet.name} onChange={(e) => onUpdate((p) => ({
              ...p,
              name: e.target.value
            }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Ej: Rocky" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Raza *
              </label>
              <input type="text" value={pet.breed} onChange={(e) => onUpdate((p) => ({
              ...p,
              breed: e.target.value
            }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="Ej: Golden" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Edad
              </label>
              <input type="text" value={pet.age} onChange={(e) => onUpdate((p) => ({
              ...p,
              age: e.target.value
            }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="3 años" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tamaño *
              </label>
              <select value={pet.size} onChange={(e) => onUpdate((p) => ({
              ...p,
              size: e.target.value
            }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm bg-white">
                <option value="">Selecciona...</option>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bio (opcional, máx 80 caracteres)
            </label>
            <input type="text" maxLength={80} value={pet.bio} onChange={(e) => onUpdate((p) => ({
            ...p,
            bio: e.target.value
          }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-cyan focus:border-transparent outline-none text-sm" placeholder="¡Hola! Soy ... y me encanta ..." />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {pet.bio.length}/80
            </p>
          </div>
        </div>
      </div>
    </div>;
}