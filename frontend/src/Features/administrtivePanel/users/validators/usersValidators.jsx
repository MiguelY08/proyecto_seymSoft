// Archivo de validadores para el modulo de usuarios (API REST)
// Reglas de validacion para los campos del formulario de usuarios:
// - Nombre completo
// - Correo electronico
// - Telefono
// Las validaciones de unicidad (email duplicado, etc.) son responsabilidad del backend.

export const PHONE_MIN = 7;
export const PHONE_MAX = 10;
export const USER_NAME_MAX = 80;
export const USER_EMAIL_MAX = 80;

export const normalizeFullNameInput = (value) =>
  String(value ?? '')
    .replace(/^\s+/, '')
    .replace(/\s{2,}/g, ' ');

export const toTitleCaseName = (value) =>
  normalizeFullNameInput(value)
    .trim()
    .toLowerCase()
    .replace(/\p{L}+/gu, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1),
    );

export const normalizeEmailInput = (value) =>
  String(value ?? '').trim().toLowerCase();

export const normalizeDigits = (value, maxLength = PHONE_MAX) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

/**
 * Valida un campo especifico del formulario de usuario.
 * @param {string} name - Nombre del campo ('nombreCompleto', 'correo', 'telefono').
 * @param {string} value - Valor del campo.
 * @returns {string} Mensaje de error o cadena vacia si es valido.
 */
export const validateField = (name, value) => {
  const v = (value ?? '').trim();

  switch (name) {
    case 'nombreCompleto':
      if (!v) return 'El nombre completo es obligatorio.';
      if (v.length < 3) return 'Minimo 3 caracteres.';
      if (v.length > USER_NAME_MAX) return `Maximo ${USER_NAME_MAX} caracteres.`;
      if (!/^[\p{L}\s.]+$/u.test(v)) return 'Solo se permiten letras, puntos y espacios.';
      return '';

    case 'correo':
      if (!v) return 'El correo electronico es obligatorio.';
      if (v.length > USER_EMAIL_MAX) return `Maximo ${USER_EMAIL_MAX} caracteres.`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingrese un correo valido. Ej: usuario@dominio.com';
      return '';

    case 'telefono':
      if (!v) return 'El telefono es obligatorio.';
      if (!/^\d+$/.test(v)) return 'Solo se permiten numeros.';
      if (v.length < PHONE_MIN) return `Minimo ${PHONE_MIN} digitos.`;
      if (v.length > PHONE_MAX) return `Maximo ${PHONE_MAX} digitos.`;
      return '';

    default:
      return '';
  }
};

/**
 * Realiza la validacion de formato de todos los campos del formulario.
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
