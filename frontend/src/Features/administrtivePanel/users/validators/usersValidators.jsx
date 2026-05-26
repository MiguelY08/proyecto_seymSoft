// ─── Archivo de validadores para el módulo de usuarios (API REST) ─────────────
// Reglas de validación para los campos del formulario de usuarios:
// - Nombre completo
// - Correo electrónico
// - Teléfono
// Las validaciones de unicidad (email duplicado, etc.) son responsabilidad del backend.

// ─── Constantes de validación ─────────────────────────────────────────────────
export const PHONE_MIN = 7;
export const PHONE_MAX = 10;

// ─── Validación de campo individual ──────────────────────────────────────────
/**
 * Valida un campo específico del formulario de usuario.
 * @param {string} name - Nombre del campo ('nombreCompleto', 'correo', 'telefono').
 * @param {string} value - Valor del campo.
 * @returns {string} Mensaje de error o cadena vacía si es válido.
 */
export const validateField = (name, value) => {
  const v = (value ?? '').trim();

  switch (name) {
    case 'nombreCompleto':
      if (!v) return 'El nombre completo es obligatorio.';
      if (v.length < 3) return 'Mínimo 3 caracteres.';
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v)) return 'Solo se permiten letras y espacios.';
      return '';

    case 'correo':
      if (!v) return 'El correo electrónico es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingrese un correo válido. Ej: usuario@dominio.com';
      return '';

    case 'telefono':
      if (!v) return 'El teléfono es obligatorio.';
      if (!/^\d+$/.test(v)) return 'Solo se permiten números.';
      if (v.length < PHONE_MIN) return `Mínimo ${PHONE_MIN} dígitos.`;
      if (v.length > PHONE_MAX) return `Máximo ${PHONE_MAX} dígitos.`;
      return '';

    default:
      return '';
  }
};

// ─── Validación completa del formulario (solo formato, sin duplicados) ────────
/**
 * Realiza la validación de formato de todos los campos del formulario.
 * @param {object} form - Objeto con los campos: nombreCompleto, correo, telefono.
 * @returns {object} Objeto con los errores encontrados.
 */
export const validateUserForm = (form) => {
  const errors = {};
  const fields = ['nombreCompleto', 'correo', 'telefono'];

  fields.forEach((field) => {
    const error = validateField(field, form[field]);
    if (error) errors[field] = error;
  });

  return errors;
};