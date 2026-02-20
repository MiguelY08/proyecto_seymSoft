// src/utils/swal.config.js
import Swal from 'sweetalert2';

const baseConfig = {
  buttonsStyling:  false,
  position:        'top',
  showClass:  { popup: 'animate__animated animate__fadeInDown' },
  hideClass:  { popup: 'animate__animated animate__fadeOutUp'  },
};

// ─── Estilos por tipo ─────────────────────────────────────────────────────────
const variants = {
  error: {
    bg:       'bg-red-50',
    border:   'border-red-300',
    title:    'text-red-800',
    text:     'text-red-600',
    timerBar: 'bg-red-400',
    confirm:  'bg-red-500   hover:bg-red-600   text-white',
    cancel:   'bg-white border border-red-300 text-red-500 hover:bg-red-50',
  },
  warning: {
    bg:       'bg-yellow-50',
    border:   'border-yellow-300',
    title:    'text-yellow-800',
    text:     'text-yellow-700',
    timerBar: 'bg-yellow-400',
    confirm:  'bg-yellow-500 hover:bg-yellow-600 text-white',
    cancel:   'bg-white border border-yellow-300 text-yellow-600 hover:bg-yellow-50',
  },
  success: {
    bg:       'bg-teal-50',
    border:   'border-teal-300',
    title:    'text-teal-800',
    text:     'text-teal-600',
    timerBar: 'bg-teal-500',
    confirm:  'bg-teal-500  hover:bg-teal-600   text-white',
    cancel:   'bg-white border border-teal-300 text-teal-600 hover:bg-teal-50',
  },
  info: {
    bg:       'bg-blue-50',
    border:   'border-blue-300',
    title:    'text-blue-800',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-50',
  },
  question: {
    bg:       'bg-blue-50',
    border:   'border-blue-300',
    title:    'text-blue-800',
    text:     'text-blue-600',
    timerBar: 'bg-blue-400',
    confirm:  'bg-[#004D77] hover:bg-[#003d5e] text-white',
    cancel:   'bg-white border border-blue-300 text-[#004D77] hover:bg-blue-50',
  },
};

// ─── Constructor de customClass ───────────────────────────────────────────────
const buildCustomClass = (v) => ({
  popup:            `!rounded-2xl !border ${v.border} ${v.bg} !shadow-lg !p-0 overflow-hidden`,
  htmlContainer:    `!px-6 !pb-5 !pt-0 !m-0 ${v.text} !text-sm`,
  title:            `!px-6 !pt-5 !pb-1 !text-base !font-bold !uppercase ${v.title}`,
  timerProgressBar: `!h-1 ${v.timerBar}`,
  actions:          '!px-6 !pb-5 !gap-2',
  confirmButton:    `!rounded-lg !px-5 !py-2 !text-sm !font-semibold !transition-all !duration-200 !cursor-pointer ${v.confirm}`,
  cancelButton:     `!rounded-lg !px-5 !py-2 !text-sm !font-semibold !transition-all !duration-200 !cursor-pointer ${v.cancel}`,
});

// ─── Función base interna ─────────────────────────────────────────────────────
const fire = (icon, title, text, extra = {}) => {
  const variant = variants[icon] ?? variants.info;
  return Swal.fire({
    ...baseConfig,
    icon,
    title,
    text,
    customClass: buildCustomClass(variant),
    ...extra,
  });
};

// ─── Alertas simples ──────────────────────────────────────────────────────────
export const swalError   = (title, text, extra = {}) => fire('error',    title, text, extra);
export const swalWarning = (title, text, extra = {}) => fire('warning',  title, text, extra);
export const swalSuccess = (title, text, extra = {}) => fire('success',  title, text, extra);
export const swalInfo    = (title, text, extra = {}) => fire('info',     title, text, extra);

// ─── Alertas de confirmación ──────────────────────────────────────────────────
// Cualquier tipo puede usarse como confirmación pasando el icono deseado.
// Ejemplos:
//   swalConfirm('warning', '¿Eliminar usuario?', 'Esta acción no se puede deshacer', { confirmButtonText: 'Eliminar' })
//   swalConfirm('question', '¿Desea continuar?', '')
export const swalConfirm = (icon, title, text, extra = {}) =>
  fire(icon, title, text, {
    showCancelButton:  true,
    confirmButtonText: 'Confirmar',
    cancelButtonText:  'Cancelar',
    ...extra,
  });

// ─── Alertas con timer (se cierran automáticamente) ───────────────────────────
// Ejemplos:
//   swalTimer('success', 'Descarga iniciada', 'El archivo está listo.', 5000)
//   swalTimer('info', 'Sesión por expirar', '', 10000)
export const swalTimer = (icon, title, text, ms = 5000, extra = {}) =>
  fire(icon, title, text, {
    timer:             ms,
    timerProgressBar:  true,
    showConfirmButton: false,
    ...extra,
  });

// ─── Alertas sin icono ────────────────────────────────────────────────────────
// Útil para mensajes neutrales o informativos simples.
// Ejemplo:
//   swalPlain('Aviso', 'Recuerda completar tu perfil.')
export const swalPlain = (title, text, extra = {}) =>
  Swal.fire({
    ...baseConfig,
    title,
    text,
    customClass: buildCustomClass(variants.info),
    ...extra,
  });