import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Loader2, Smartphone, FileText } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from '../utils/supabase';
export function SubirDocumentoPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const docType = searchParams.get('doc') || 'documento';
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    if (!sessionId) {
      toast.error('Enlace inválido o expirado. Por favor escanea el código QR nuevamente.');
    }
  }, [sessionId]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;
    // Empty file
    if (selectedFile.size === 0) {
      toast.error(`"${selectedFile.name}" parece estar vacío. Intenta seleccionarlo de nuevo o toma una foto nueva.`);
      return;
    }
    // Size: bump to 10MB to accommodate modern phone photos
    const MAX_MB = 10;
    if (selectedFile.size > MAX_MB * 1024 * 1024) {
      toast.error(`Tu archivo pesa ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB. El máximo es ${MAX_MB}MB. Intenta tomar la foto con menor resolución.`);
      return;
    }
    // Permissive type check: accept ANY image/* + pdf, with extension fallback
    // when MIME type is missing (happens on some browsers / HEIC files).
    const mime = (selectedFile.type || '').toLowerCase();
    const ext = (selectedFile.name.split('.').pop() || '').toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif', 'bmp', 'tiff', 'tif'];
    const isImage = mime.startsWith('image/');
    const isPdf = mime === 'application/pdf';
    const isValidExt = validExts.includes(ext);
    if (!isImage && !isPdf && !isValidExt) {
      toast.error(`Formato no reconocido (${mime || ext || 'desconocido'}). Toma una foto nueva o selecciona un PDF/JPG/PNG.`);
      return;
    }
    setFile(selectedFile);
  };
  const handleUpload = async () => {
    if (!file || !sessionId) return;
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      // Sanitize extension; default to bin if missing
      const rawExt = (file.name.split('.').pop() || '').toLowerCase();
      const extension = rawExt.replace(/[^a-z0-9]/g, '') || 'bin';
      const fileName = `mobile/${sessionId}/${docType}_${timestamp}.${extension}`;
      // Pass explicit contentType so HEIC/missing-mime files still upload
      const contentType = file.type || 'application/octet-stream';
      const {
        error
      } = await supabase.storage.from('expositor-documents').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType
      });
      if (error) throw error;
      setIsSuccess(true);
      toast.success('Documento subido exitosamente');
    } catch (error: any) {
      console.error('Upload error:', error);
      const detail = error?.message || error?.error || 'Error desconocido';
      toast.error(`No se pudo subir: ${detail}. Intenta de nuevo.`);
    } finally {
      setIsUploading(false);
    }
  };
  const getDocName = () => {
    switch (docType) {
      case 'cedula':
        return 'Cédula';
      case 'rut':
        return 'RUT';
      case 'camara':
        return 'Cámara de Comercio';
      case 'pet_photo':
        return 'Foto de tu mascota';
      default:
        return 'Documento';
    }
  };
  if (!sessionId) {
    return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Enlace inválido
        </h1>
        <p className="text-gray-600">
          Por favor escanea el código QR desde la pantalla de tu computador
          nuevamente.
        </p>
      </div>;
  }
  if (isSuccess) {
    return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          type: 'spring'
        }}>
            <CheckCircle2 className="w-20 h-20 text-brand-green mx-auto mb-6" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ¡Subida exitosa!
          </h1>
          <p className="text-gray-600 mb-6">
            El documento ha sido enviado a tu computador.
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium">
            Ya puedes cerrar esta pestaña y continuar el proceso en tu
            computador.
          </div>
        </motion.div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-brand-navy p-6 text-white text-center">
          <Smartphone className="w-10 h-10 mx-auto mb-3 text-brand-cyan" />
          <h1 className="text-xl font-bold">Subir Documento</h1>
          <p className="text-white/80 text-sm mt-1">Desde tu celular</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Sube tu {getDocName()}
            </h2>
            <p className="text-sm text-gray-500">
              Toma una foto o selecciona un archivo (imagen o PDF, máx 10MB)
            </p>
          </div>

          {!file ? <div className="relative">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="mobile-upload" />
              <label htmlFor="mobile-upload" className="flex flex-col items-center justify-center w-full h-48 px-4 py-6 rounded-2xl border-2 border-dashed border-brand-cyan/50 bg-brand-cyan/5 hover:bg-brand-cyan/10 cursor-pointer transition-colors">
                <Upload className="w-10 h-10 text-brand-cyan mb-3" />
                <span className="text-brand-navy font-semibold text-center">
                  Tocar para seleccionar archivo
                </span>
                <span className="text-gray-500 text-xs mt-2 text-center">
                  Puedes usar la cámara de tu celular
                </span>
              </label>
            </div> : <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-brand-cyan/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-brand-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button onClick={() => setFile(null)} disabled={isUploading} className="text-sm text-red-500 font-medium hover:text-red-700 disabled:opacity-50">
                  Cambiar
                </button>
              </div>

              <button onClick={handleUpload} disabled={isUploading} className="w-full bg-brand-cyan hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                {isUploading ? <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Subiendo...
                  </> : <>
                    <Upload className="w-5 h-5" />
                    Subir documento
                  </>}
              </button>
            </div>}
        </div>
      </div>
    </div>;
}