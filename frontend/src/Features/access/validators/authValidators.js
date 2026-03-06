// REGEX CENTRALIZADAS
export const patterns = {

  document: /^[0-9]{6,12}$/,

  phone: /^[0-9]{10}$/,

  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  fullName: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,50}$/,

  password: /^.{8,}$/ // mínimo 8 caracteres

};


// VALIDACIÓN REGISTER
export const validateRegister = (formData) => {

  let errors = {};

  if (!formData.documentType)
    errors.documentType = "Seleccione tipo de documento";

  if (!patterns.document.test(formData.document))
    errors.document = "Documento inválido (solo números)";

  if (!patterns.fullName.test(formData.fullName))
    errors.fullName = "Nombre inválido";

  if (!patterns.email.test(formData.email))
    errors.email = "Correo inválido";

  if (!patterns.phone.test(formData.phone))
    errors.phone = "Teléfono inválido (10 números)";

  if (!formData.address)
    errors.address = "Dirección obligatoria";

  if (!patterns.password.test(formData.password))
    errors.password = "La contraseña debe tener mínimo 8 caracteres";

  if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Las contraseñas no coinciden";

  if (!formData.terms)
    errors.terms = "Debe aceptar términos";

  return errors;
};


// VALIDACIÓN LOGIN
export const validateLogin = (formData) => {

  let errors = {};

  if (!patterns.email.test(formData.email))
    errors.email = "Correo inválido";

  if (!patterns.password.test(formData.password))
    errors.password = "Contraseña inválida";

  return errors;
};


// SANITIZACIÓN DE INPUTS
export const sanitizeInput = (name,value)=>{

  if(name === "document" || name === "phone"){
    return value.replace(/\D/g,"");
  }

  return value;

};