/**
 * AUTH VALIDATORS - CORREGIDO
 * 
 * Validaciones que coinciden con el backend
 * - Nombre: 3-50 caracteres
 * - Email: formato válido
 * - Teléfono: exactamente 10 números
 * - Contraseña: 6+ caracteres y al menos 1 mayúscula
 */

// ─── REGEX CENTRALIZADAS ───────────────────────────────────────────
export const patterns = {
  phone: /^[0-9]{10}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  fullName: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/,
  password: /^(?=.*[A-Z]).{6,}$/ // 6+ chars + al menos 1 mayúscula
};

export const normalizeNameInput = (value) =>
  String(value ?? "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ");

export const toTitleCaseName = (value) =>
  normalizeNameInput(value)
    .trim()
    .toLowerCase()
    .replace(/\p{L}+/gu, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1),
    );

export const normalizeEmailInput = (value) =>
  String(value ?? "").trim().toLowerCase();

export const normalizeDigits = (value, maxLength) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
};

// ─── VALIDACIÓN REGISTER ───────────────────────────────────────────
export const validateRegister = (formData) => {
  let errors = {};

  // Nombre completo
  if (!formData.fullName || !patterns.fullName.test(formData.fullName)) {
    errors.fullName = "Nombre inválido (3-50 caracteres, solo letras)";
  }

  // Email
  if (!formData.email || !patterns.email.test(formData.email)) {
    errors.email = "Correo inválido";
  }

  // Teléfono
  if (!formData.phone || !patterns.phone.test(formData.phone.toString())) {
    errors.phone = "Teléfono inválido (10 números)";
  }

  // Contraseña - 6+ caracteres y al menos 1 mayúscula
  if (!formData.password || !patterns.password.test(formData.password)) {
    errors.password = "Contraseña debe tener 6+ caracteres y 1 mayúscula";
  }

  // Confirmar contraseña
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Debe confirmar la contraseña";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  // Términos
  // if (!formData.terms) {
  //   errors.terms = "Debe aceptar términos y condiciones";
  // }

  return errors;
};

// ─── VALIDACIÓN LOGIN ──────────────────────────────────────────────
export const validateLogin = (formData) => {
  let errors = {};

  // Email
  if (!formData.email || !patterns.email.test(formData.email)) {
    errors.email = "Correo inválido";
  }

  // Contraseña
  if (!formData.password) {
    errors.password = "La contraseña es requerida";
  }

  return errors;
};

// ─── VALIDACIÓN FORGOT PASSWORD ────────────────────────────────────
export const validateForgotPassword = (email) => {
  if (!email || !patterns.email.test(email)) {
    return "Correo inválido";
  }
  return "";
};

// ─── VALIDACIÓN RESET PASSWORD ─────────────────────────────────────
export const validateResetPassword = (formData) => {
  let errors = {};

  // Código
  if (!formData.code || formData.code.join("").length < 6) {
    errors.code = "Código incompleto (6 dígitos)";
  }

  // Contraseña nueva
  if (!formData.password || !patterns.password.test(formData.password)) {
    errors.password = "Contraseña debe tener 6+ caracteres y 1 mayúscula";
  }

  // Confirmar contraseña
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Debe confirmar la contraseña";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
};

// ─── SANITIZACIÓN DE INPUTS ────────────────────────────────────────
export const sanitizeInput = (name, value) => {
  // Solo números para teléfono
  if (name === "phone") {
    return normalizeDigits(value, 10);
  }

  // Trim y lowercase para email
  if (name === "email") {
    return normalizeEmailInput(value);
  }

  if (name === "fullName") {
    return normalizeNameInput(value);
  }

  return value;
};

// ─── VALIDAR CAMPO INDIVIDUAL ──────────────────────────────────────
export const validateField = (name, value, formData = {}) => {
  switch (name) {
    case "fullName":
      if (!value || !patterns.fullName.test(value)) {
        return "Nombre inválido (3-50 caracteres)";
      }
      return "";

    case "email":
      if (!value || !patterns.email.test(value)) {
        return "Correo inválido";
      }
      return "";

    case "phone":
      if (!value || !patterns.phone.test(value.toString())) {
        return "Teléfono inválido (10 números)";
      }
      return "";

    case "password":
      if (!value || !patterns.password.test(value)) {
        return "Contraseña: 6+ caracteres y 1 mayúscula";
      }
      return "";

    case "confirmPassword":
      if (!value) {
        return "Debe confirmar la contraseña";
      }
      if (value !== formData.password) {
        return "Las contraseñas no coinciden";
      }
      return "";

    case "newPassword":
      if (!value || !patterns.password.test(value)) {
        return "Contraseña: 6+ caracteres y 1 mayúscula";
      }
      return "";

    case "currentPassword":
      if (!value) {
        return "Requiere contraseña actual";
      }
      return "";

    default:
      return "";
  }
};
