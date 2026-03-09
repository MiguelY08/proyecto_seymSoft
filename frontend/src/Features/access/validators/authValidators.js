import { emailExists, documentExists } from "../services/authService";

// ─── REGEX CENTRALIZADAS ───────────────────────────────────────────
export const patterns = {

  document: /^[0-9]{6,12}$/,

  phone: /^[0-9]{10}$/,

  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  fullName: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/,

  password: /^.{8,}$/ // mínimo 8 caracteres

};


// ─── VALIDACIÓN REGISTER ───────────────────────────────────────────
export const validateRegister = (formData) => {

  let errors = {};

  // tipo documento
  if (!formData.documentType) {
    errors.documentType = "Seleccione tipo de documento";
  }

  // documento formato
  if (!patterns.document.test(formData.document)) {
    errors.document = "Documento inválido (6-12 números)";
  }

  // documento duplicado
  if (
    patterns.document.test(formData.document) &&
    documentExists(formData.document)
  ) {
    errors.document = "Este documento ya está registrado";
  }

  // nombre
  if (!patterns.fullName.test(formData.fullName)) {
    errors.fullName = "Nombre inválido";
  }

  // email formato
  if (!patterns.email.test(formData.email)) {
    errors.email = "Correo inválido";
  }

  // email duplicado
  if (
    patterns.email.test(formData.email) &&
    emailExists(formData.email)
  ) {
    errors.email = "Este correo ya está registrado";
  }

  // teléfono
  if (!patterns.phone.test(formData.phone)) {
    errors.phone = "Teléfono inválido (10 números)";
  }

  // dirección
  if (!formData.address) {
    errors.address = "Dirección obligatoria";
  }

  // contraseña
  if (!patterns.password.test(formData.password)) {
    errors.password = "La contraseña debe tener mínimo 8 caracteres";
  }

  // confirmar contraseña
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  // términos
  if (!formData.terms) {
    errors.terms = "Debe aceptar términos";
  }

  return errors;
};


// ─── VALIDACIÓN LOGIN ──────────────────────────────────────────────
export const validateLogin = (formData) => {

  let errors = {};

  if (!patterns.email.test(formData.email)) {
    errors.email = "Correo inválido";
  }

  if (!patterns.password.test(formData.password)) {
    errors.password = "Contraseña inválida";
  }

  return errors;
};


// ─── SANITIZACIÓN DE INPUTS ────────────────────────────────────────
export const sanitizeInput = (name,value)=>{

  // solo números para documento y teléfono
  if(name === "document" || name === "phone"){
    return value.replace(/\D/g,"");
  }

  return value;

};