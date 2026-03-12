import { normalizar } from '../helpers/usersHelpers';


// ─── Constantes de validación ─────────────────────────────────────────────────
export const PHONE_MIN = 7;
export const PHONE_MAX = 10;

export const DOC_MIN_LENGTH = { CC: 8, CE: 6, NIT: 9, TI: 10, PP: 5 };

export const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'TI', 'PP'];


// ─── Validar campo individual ─────────────────────────────────────────────────
// currentForm : objeto completo del formulario (necesario para validar 'documento' según 'tipo')
// context     : { isEditing, userToEdit } — necesario para la regla de apellidos opcionales
export const validateField = (name, value, currentForm = {}, context = {}) => {
  const v = (value ?? '').trim();
  const { isEditing = false, userToEdit = null } = context;

  switch (name) {

    case 'documento': {
      const tipo = currentForm.tipo ?? 'CC';
      const min  = DOC_MIN_LENGTH[tipo] ?? 8;
      if (!v)               return 'El documento es obligatorio.';
      if (!/^\d+$/.test(v)) return 'Solo se permiten números.';
      if (v.length < min)   return `Mínimo ${min} dígitos para ${tipo}.`;
      return '';
    }

    case 'nombres':
      if (!v)                               return 'Los nombres son obligatorios.';
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v))     return 'Solo se permiten letras y espacios.';
      if (v.replace(/\s+/g, '').length < 3) return 'El nombre debe tener al menos 3 letras.';
      return '';

    case 'apellidos': {
      const palabrasOriginales = (userToEdit?.name ?? '').trim().split(/\s+/).filter(Boolean).length;
      const esOpcional         = isEditing && palabrasOriginales <= 2;
      if (!v && esOpcional)                 return '';
      if (!v)                               return 'Los apellidos son obligatorios.';
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v))     return 'Solo se permiten letras y espacios.';
      if (v.replace(/\s+/g, '').length < 3) return 'El apellido debe tener al menos 3 letras.';
      return '';
    }

    case 'correo':
      if (!v)                                        return 'El correo electrónico es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingrese un correo válido. Ej: usuario@dominio.com';
      if (v.length < 10)                             return 'El correo parece muy corto. Verifícalo.';
      return '';

    case 'telefono':
      if (!v)                   return 'El teléfono es obligatorio.';
      if (!/^\d+$/.test(v))     return 'Solo se permiten números.';
      if (v.length < PHONE_MIN) return `Mínimo ${PHONE_MIN} dígitos.`;
      if (v.length > PHONE_MAX) return `Máximo ${PHONE_MAX} dígitos.`;
      return '';

    default:
      return '';
  }
};


// ─── Validar duplicados contra usuarios existentes ───────────────────────────
// context: { isEditing, userToEdit }
export const checkDuplicates = (currentForm = {}, existingUsers = [], context = {}) => {
  const { isEditing = false, userToEdit = null } = context;
  const dupes        = {};
  const nombreCompleto = `${(currentForm.nombres ?? '').trim()} ${(currentForm.apellidos ?? '').trim()}`.trim();

  existingUsers.forEach((u) => {
    if (isEditing && u.id === userToEdit?.id) return;

    if (
      (currentForm.documento ?? '').trim() &&
      normalizar(u.document     ?? '') === normalizar(currentForm.documento ?? '') &&
      normalizar(u.documentType ?? '') === normalizar(currentForm.tipo      ?? '')
    ) {
      dupes.documento = 'Este número de documento ya está registrado.';
    }

    if (
      (currentForm.correo ?? '').trim() &&
      normalizar(u.email ?? '') === normalizar(currentForm.correo ?? '')
    ) {
      dupes.correo = 'Este correo electrónico ya está registrado.';
    }

    if (
      nombreCompleto.length >= 6 &&
      normalizar(u.name ?? '') === normalizar(nombreCompleto)
    ) {
      dupes.nombres   = 'Ya existe un usuario con este nombre completo.';
      dupes.apellidos = 'Ya existe un usuario con este nombre completo.';
    }
  });

  return dupes;
};


// ─── Validación completa del formulario ──────────────────────────────────────
// Combina validación de formato + duplicados y devuelve todos los errores.
export const validateUserForm = (form, existingUsers = [], context = {}) => {
  const errs   = {};
  const fields = ['documento', 'nombres', 'apellidos', 'correo', 'telefono'];

  fields.forEach((field) => {
    const e = validateField(field, form[field] ?? '', form, context);
    if (e) errs[field] = e;
  });

  const dupes = checkDuplicates(form, existingUsers, context);
  Object.entries(dupes).forEach(([field, msg]) => {
    if (!errs[field]) errs[field] = msg;
  });

  return errs;
};