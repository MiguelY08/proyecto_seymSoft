// Client Helper Functions

// Format currency to COP
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Format contact phone
export const formatContactPhone = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{7,10}$/;
  return phoneRegex.test(phone);
};

// Validate numbers only (allow hyphen for NIT)
export const isOnlyNumbers = (value) => {
  const numbersRegex = /^[0-9-]+$/;
  return numbersRegex.test(value);
};

// Validate letters and spaces only
export const isOnlyLetters = (value) => {
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return lettersRegex.test(value);
};

// Calculate credit balance
export const calculateBalance = (creditAmount, payments = []) => {
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return Math.max(0, creditAmount - totalPayments);
};

// Calculate interest
export const calculateInterest = (balance, rate, days = 30) => {
  return (balance * (rate / 100) * days) / 360;
};

// Get client status badge class
export const getStatusBadgeClass = (isActive) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

// Get client status text
export const getStatusText = (isActive) => {
  return isActive ? 'Activo' : 'Inactivo';
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
};

// Capitalize first letter
export const capitalizeFirst = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Format person type
export const formatPersonType = (tipoPersona) => {
  if (tipoPersona === 'natural') return 'Natural';
  if (tipoPersona === 'juridica') return 'Jurídica';
  return 'N/A';
};

// Format client type
export const formatClientType = (tipoCliente) => {
  if (tipoCliente === 'detal') return 'Detal';
  if (tipoCliente === 'mayorista') return 'Mayorista';
  if (tipoCliente === 'colegas') return 'Colegas';
  if (tipoCliente === 'pacas') return 'Pacas';
  return 'N/A';
};

// Format RUT
export const formatRut = (rut) => {
  if (rut === 'si') return 'Sí';
  if (rut === 'no') return 'No';
  return 'N/A';
};

// Filter clients by search term
export const filterClients = (clients, searchTerm) => {
  if (!searchTerm) return clients;
  
  const term = searchTerm.toLowerCase();
  return clients.filter(client => 
    client.nombreCompleto?.toLowerCase().includes(term) ||
    client.numero?.toLowerCase().includes(term) ||
    client.tipo?.toLowerCase().includes(term) ||
    client.correo?.toLowerCase().includes(term) ||
    client.tipoCliente?.toLowerCase().includes(term) ||
    client.telefono?.toLowerCase().includes(term)
  );
};

// Paginate data
export const paginateData = (data, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return {
    currentData: data.slice(startIndex, endIndex),
    totalPages: Math.max(1, Math.ceil(data.length / itemsPerPage)),
    startIndex,
    endIndex: Math.min(endIndex, data.length)
  };
};

// Validate client form
export const validateClientForm = (formData) => {
  const errors = {};

  if (!formData.tipoPersona?.trim()) {
    errors.tipoPersona = 'Seleccione el tipo de persona';
  }

  if (!formData.tipo?.trim()) {
    errors.tipo = 'Seleccione el tipo de documento';
  }

  if (!formData.numero?.trim()) {
    errors.numero = 'El número es obligatorio';
  } else if (!isOnlyNumbers(formData.numero)) {
    errors.numero = 'Solo números permitidos';
  }

  if (!formData.nombres?.trim()) {
    errors.nombres = 'El nombre es obligatorio';
  } else if (formData.nombres.trim().length < 2) {
    errors.nombres = 'Debe tener al menos 2 caracteres';
  } else if (!isOnlyLetters(formData.nombres)) {
    errors.nombres = 'Solo se permiten letras';
  }

  if (!formData.apellidos?.trim()) {
    errors.apellidos = 'El apellido es obligatorio';
  } else if (formData.apellidos.trim().length < 2) {
    errors.apellidos = 'Debe tener al menos 2 caracteres';
  } else if (!isOnlyLetters(formData.apellidos)) {
    errors.apellidos = 'Solo se permiten letras';
  }

  if (!formData.direccion?.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  }

  if (!formData.telefono?.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!isValidPhone(formData.telefono)) {
    errors.telefono = 'Teléfono inválido (7-10 dígitos)';
  }

  if (!formData.correo?.trim()) {
    errors.correo = 'El correo es obligatorio';
  } else if (!isValidEmail(formData.correo)) {
    errors.correo = 'Correo inválido';
  }

  if (formData.nombreContacto && formData.nombreContacto.trim().length < 3) {
    errors.nombreContacto = 'Debe tener mínimo 3 caracteres';
  }

  if (formData.numeroContacto && !isOnlyNumbers(formData.numeroContacto)) {
    errors.numeroContacto = 'Solo números permitidos';
  }

  // ✅ CRÉDITO AHORA ES OPCIONAL - Solo validar si tiene contenido
  if (formData.creditoCliente?.trim() && !isOnlyNumbers(formData.creditoCliente)) {
    errors.creditoCliente = 'Solo números permitidos';
  }

  if (!formData.tipoCliente?.trim()) {
    errors.tipoCliente = 'Seleccione el tipo de cliente';
  }

  if (!formData.rut?.trim()) {
    errors.rut = 'Indique si tiene RUT';
  }

  return errors;
};