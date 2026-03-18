// ─── Archivo de validadores para el módulo de usuarios ──────────────────────────
/**
 * Este archivo contiene reglas de validación para formularios de usuarios:
 * - Constantes para límites de campos
 * - Validación individual de campos
 * - Verificación de duplicados
 * - Validación completa del formulario
 */

import { normalizar } from '../helpers/usersHelpers';

// ─── Constantes de validación ─────────────────────────────────────────────────
/**
 * Límites para números de teléfono.
 */
export const PHONE_MIN = 7;
export const PHONE_MAX = 10;

/**
 * Longitudes mínimas para cada tipo de documento.
 */
export const DOC_MIN_LENGTH = { CC: 8, CE: 6, NIT: 9, TI: 10, PP: 5 };

/**
 * Tipos de documento válidos.
 */
export const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'TI', 'PP'];

// ─── Validar campo individual ─────────────────────────────────────────────────
/**
 * Valida un campo específico del formulario de usuario.
 * @param {string} name - Nombre del campo (documento, nombres, apellidos, correo, telefono).
 * @param {string} value - Valor del campo.
 * @param {object} currentForm - Objeto completo del formulario (necesario para validar documento según tipo).
 * @param {object} context - Contexto de validación { isEditing, userToEdit }.
 * @returns {string} Mensaje de error o cadena vacía si es válido.
 */
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
/**
 * Verifica si los datos del formulario duplican información de usuarios existentes.
 * @param {object} currentForm - Datos del formulario actual.
 * @param {Array} existingUsers - Lista de usuarios existentes.
 * @param {object} context - Contexto { isEditing, userToEdit }.
 * @returns {object} Objeto con errores de duplicados por campo.
 */
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
/**
 * Realiza validación completa del formulario: formato de campos + duplicados.
 * @param {object} form - Datos del formulario.
 * @param {Array} existingUsers - Lista de usuarios existentes.
 * @param {object} context - Contexto de validación.
 * @returns {object} Objeto con todos los errores encontrados.
 */
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