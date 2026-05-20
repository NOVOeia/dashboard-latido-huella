// Reusable form validators for Latido & Huella forms.
// Returns { ok: true } or { ok: false, message: string }

export type ValidationResult = {ok: true;} | {ok: false;message: string;};

const DISPOSABLE_DOMAINS = [
'mailinator.com',
'tempmail.com',
'10minutemail.com',
'guerrillamail.com',
'trashmail.com',
'yopmail.com',
'throwawaymail.com',
'fakeinbox.com',
'getairmail.com',
'sharklasers.com'];


export function isValidEmail(email: string): ValidationResult {
  const value = (email || '').trim().toLowerCase();
  if (!value) return { ok: false, message: 'El email es obligatorio' };

  // RFC-ish basic pattern
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(value)) return { ok: false, message: 'Email inválido' };

  const domain = value.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { ok: false, message: 'Por favor usa un email personal real' };
  }
  return { ok: true };
}

export function isValidColombianPhone(phone: string): ValidationResult {
  const raw = (phone || '').replace(/[\s\-()]/g, '');
  if (!raw) return { ok: false, message: 'El WhatsApp es obligatorio' };

  // Accept: 10 digits starting with 3 (mobile) OR +57 prefix + 10 digits starting with 3
  const local = /^3\d{9}$/;
  const international = /^\+57\s?3\d{9}$/;

  if (!local.test(raw) && !international.test(raw)) {
    return {
      ok: false,
      message:
      'Ingresa un celular colombiano válido (10 dígitos, ej: 3001234567)'
    };
  }
  return { ok: true };
}

export function isValidCedula(cedula: string): ValidationResult {
  const value = (cedula || '').trim();
  if (!value) return { ok: false, message: 'La cédula es obligatoria' };

  // 6-10 digits, only numbers
  if (!/^\d{6,10}$/.test(value)) {
    return {
      ok: false,
      message: 'La cédula debe tener entre 6 y 10 dígitos numéricos'
    };
  }
  return { ok: true };
}

export function isValidFullName(name: string): ValidationResult {
  const value = (name || '').trim();
  if (!value) return { ok: false, message: 'El nombre es obligatorio' };
  if (value.length < 4) return { ok: false, message: 'Nombre demasiado corto' };

  // At least 2 words, only letters / spaces / accents / ñ / hyphen / apostrophe
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { ok: false, message: 'Ingresa nombre y apellido' };
  }
  if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/.test(value)) {
    return { ok: false, message: 'El nombre solo puede contener letras' };
  }
  return { ok: true };
}

export function isValidBrandName(name: string): ValidationResult {
  const value = (name || '').trim();
  if (!value)
  return { ok: false, message: 'El nombre de la marca es obligatorio' };
  if (value.length < 2)
  return { ok: false, message: 'Nombre de marca demasiado corto' };
  // Permissive: letters, numbers, spaces, accents, ñ, and common brand punctuation
  if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s'&.,\-\/+()]+$/.test(value)) {
    return {
      ok: false,
      message: 'El nombre de la marca contiene caracteres no permitidos'
    };
  }
  return { ok: true };
}

export function isValidPetName(name: string): ValidationResult {
  const value = (name || '').trim();
  if (!value)
  return { ok: false, message: 'El nombre de la mascota es obligatorio' };
  if (value.length < 2) return { ok: false, message: 'Nombre demasiado corto' };
  if (!/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/.test(value)) {
    return { ok: false, message: 'El nombre debe tener letras' };
  }
  return { ok: true };
}

export function isValidPetBreed(breed: string): ValidationResult {
  const value = (breed || '').trim();
  if (!value) return { ok: false, message: 'La raza es obligatoria' };
  if (value.length < 2) return { ok: false, message: 'Raza demasiado corta' };
  return { ok: true };
}

// Convenience: run several validations and return the first error, or ok.
export function firstError(...results: ValidationResult[]): ValidationResult {
  for (const r of results) {
    if (!r.ok) return r;
  }
  return { ok: true };
}