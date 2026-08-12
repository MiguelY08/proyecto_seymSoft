/**
 * Archivo: FormProvider.jsx
 * 
 * Este archivo contiene un modal con un formulario para crear o editar proveedores.
 * 
 * Responsabilidades:
 * - Renderizar un formulario completo para capturar datos del proveedor
 * - Validar los datos ingresados en tiempo real (mientras el usuario escribe)
 * - Mostrar errores de validación para campos específicos
 * - Manejar múltiples campos de entrada (texto, select, dropdown de categorías)
 * - Guardar los datos al hacer submit si validateProviderForm los datos son válidos
 * - Distinguir entre crear nuevo proveedor y editar existente
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  CalendarClock,
  FileText,
  Hash,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Tags,
  UserCheck,
  UserCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import {
  getDocumentValidationError,
  getEmailValidationError,
  normalizeDocumentKey,
  validateProviderForm,
} from '../utils/providerHelpers';
import { categoriesService } from '../data/categoriesService';
import { providersService } from '../data/providersService';
import FormSelect from '../../../../shared/FormSelect';

let categoriesCache = null;

const EMAIL_MAX_LENGTH = 100;
const ADDRESS_MAX_LENGTH = 120;
const CIU_CODE_LENGTH = 4;
const PROVIDER_NAME_MAX_LENGTH = 100;

const onlyDigits = (value, maxLength = 10) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

const onlyLetters = (value, maxLength = 80) =>
  String(value ?? '')
    .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLength);

const cleanCompanyName = (value, maxLength = PROVIDER_NAME_MAX_LENGTH) =>
  String(value ?? '')
    .replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s&.,#'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLength);

const cleanDocument = (value, documentType) => {
  const maxLength = documentType === 'NIT' ? 20 : 15;
  if (documentType === 'NIT') {
    return String(value ?? '').replace(/[^0-9-]/g, '').slice(0, maxLength);
  }
  if (['CC', 'CE', 'NIT'].includes(documentType)) {
    return onlyDigits(value, maxLength);
  }
  return String(value ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, maxLength);
};

const cleanCiuCode = (value) =>
  onlyDigits(value, CIU_CODE_LENGTH);

const cleanEmail = (value) =>
  String(value ?? '').trim().toLowerCase().slice(0, EMAIL_MAX_LENGTH);

const cleanAddress = (value) =>
  String(value ?? '')
    .replace(/^\s+/, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, ADDRESS_MAX_LENGTH);

const getCategoryIds = (categories) => {
  if (!Array.isArray(categories)) return [];

  return categories
    .map((category) => (typeof category === 'object' && category !== null ? category.id : category))
    .filter((categoryId) => categoryId !== undefined && categoryId !== null);
};

function FormProvider({ isOpen, onClose, provider, onSave }) {

  const initialState = {
    tipoPersona: '',
    tipo: 'CC',
    numero: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: '',
    nombreContacto: '',
    numeroContacto: '',
    direccion: '',
    plazoDevoluciones: '',
    categoryIds: [],
    rut: '',
    codigoCIU: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingDocument, setCheckingDocument] = useState(false);
  const categoriasRef = useRef(null);
  const { showError, showConfirm } = useAlert();
  const isEditing = !!provider;
  const [isDocumentTypeDisabled, setIsDocumentTypeDisabled] = useState(false);

  const findProviderByEmail = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return null;

    const result = await providersService.getAll({
      page: 1,
      limit: 10000,
      search: '',
    });

    return result.data.find((item) => {
      const sameEmail = String(item.correo || '').trim().toLowerCase() === normalizedEmail;
      const sameProvider = provider?.id && Number(item.id) === Number(provider.id);
      return sameEmail && !sameProvider;
    }) || null;
  };

  const getDuplicateEmailError = async (email) => {
    const localError = getEmailValidationError(email);
    if (localError) return '';

    const currentEmail = String(provider?.correo || '').trim().toLowerCase();
    const nextEmail = String(email || '').trim().toLowerCase();
    if (currentEmail && currentEmail === nextEmail) return '';

    const duplicate = await findProviderByEmail(email);
    return duplicate ? 'Este correo ya está registrado' : '';
  };

  const findProviderByDocument = async (document, documentType) => {
    const normalizedDocument = normalizeDocumentKey(document);
    const normalizedType = String(documentType || '').trim().toUpperCase();
    if (!normalizedDocument || !normalizedType) return null;

    const result = await providersService.getAll({
      page: 1,
      limit: 10000,
      search: '',
    });

    return (result.data || []).find((item) => {
      const sameProvider = provider?.id && Number(item.id) === Number(provider.id);
      const sameType = String(item.tipo || '').trim().toUpperCase() === normalizedType;
      const sameDocument = normalizeDocumentKey(item.numero) === normalizedDocument;
      return sameType && sameDocument && !sameProvider;
    }) || null;
  };

  const getDuplicateDocumentError = async (document, documentType) => {
    const localError = getDocumentValidationError(document, documentType);
    if (localError) return '';

    const currentType = String(provider?.tipo || '').trim().toUpperCase();
    const currentDocument = normalizeDocumentKey(provider?.numero);
    const nextType = String(documentType || '').trim().toUpperCase();
    const nextDocument = normalizeDocumentKey(document);
    if (currentType === nextType && currentDocument && currentDocument === nextDocument) return '';

    const duplicateDocument = await findProviderByDocument(document, documentType);
    return duplicateDocument ? 'Este documento ya está registrado' : '';
  };

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      if (!isOpen) return;
      if (categoriesCache) {
        setCategoriesList(categoriesCache);
        return;
      }

      setLoadingCategories(true);
      try {
        const result = await categoriesService.getAll();
        categoriesCache = result.data || [];
        setCategoriesList(categoriesCache);
      } catch {
        showError('Error', 'No se pudieron cargar las categorías');
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [isOpen, showError]);

  // Este useEffect se ejecuta cuando el modal abre o cuando cambia el proveedor a editar
  useEffect(() => {
    if (provider) {
      // Extraer IDs de categorías del proveedor
      const categoryIds = getCategoryIds(provider.categorias);
      
      setFormData({
        tipoPersona: provider.tipoPersona || '',
        tipo: provider.tipo || 'CC',
        numero: provider.numero || '',
        nombres: provider.nombres || '',
        apellidos: provider.apellidos || '',
        telefono: provider.telefono || '',
        correo: provider.correo || '',
        nombreContacto: provider.nombreContacto || '',
        numeroContacto: provider.numeroContacto || '',
        direccion: provider.direccion || '',
        plazoDevoluciones: provider.plazoDevoluciones || '',
        categoryIds: categoryIds,
        rut: provider.rut || '',
        codigoCIU: provider.codigoCIU || '',
      });
      
      if (provider.tipoPersona === 'juridica') {
        setIsDocumentTypeDisabled(true);
      } else {
        setIsDocumentTypeDisabled(false);
      }
      
      setTouched(
        Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
    } else {
      setFormData(initialState);
      setTouched({});
      setIsDocumentTypeDisabled(false);
    }

    setErrors({});
    setCheckingEmail(false);
    setCheckingDocument(false);
  }, [provider, isOpen]);

  useEffect(() => {
    if (!isOpen || !touched.correo) return undefined;

    const email = String(formData.correo || '').trim();
    const localError = getEmailValidationError(formData.correo);

    if (localError) {
      setCheckingEmail(false);
      return undefined;
    }

    const currentEmail = String(provider?.correo || '').trim().toLowerCase();
    if (currentEmail && currentEmail === email.toLowerCase()) {
      setCheckingEmail(false);
      setErrors((prev) => ({
        ...prev,
        correo: prev.correo === 'Este correo ya está registrado' ? '' : prev.correo,
      }));
      return undefined;
    }

    let cancelled = false;
    setCheckingEmail(true);

    const timer = window.setTimeout(async () => {
      try {
        const duplicateError = await getDuplicateEmailError(email);
        if (cancelled) return;

        setErrors((prev) => {
          const currentLocalError = getEmailValidationError(formData.correo);
          if (currentLocalError) return { ...prev, correo: currentLocalError };
          return { ...prev, correo: duplicateError };
        });
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({
            ...prev,
            correo: prev.correo === 'Este correo ya está registrado' ? '' : prev.correo,
          }));
        }
      } finally {
        if (!cancelled) setCheckingEmail(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formData.correo, isOpen, provider?.correo, provider?.id, touched.correo]);

  useEffect(() => {
    if (!isOpen || isEditing || !touched.numero) return undefined;

    const documentValue = String(formData.numero || '').trim();
    const localError = getDocumentValidationError(formData.numero, formData.tipo);

    if (localError) {
      setCheckingDocument(false);
      setErrors((prev) => ({ ...prev, numero: localError }));
      return undefined;
    }

    let cancelled = false;
    setCheckingDocument(true);

    const timer = window.setTimeout(async () => {
      try {
        const duplicateError = await getDuplicateDocumentError(documentValue, formData.tipo);
        if (cancelled) return;

        setErrors((prev) => {
          const currentLocalError = getDocumentValidationError(formData.numero, formData.tipo);
          if (currentLocalError) return { ...prev, numero: currentLocalError };
          return { ...prev, numero: duplicateError };
        });
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({
            ...prev,
            numero: prev.numero === 'Este documento ya está registrado' ? '' : prev.numero,
          }));
        }
      } finally {
        if (!cancelled) setCheckingDocument(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formData.numero, formData.tipo, isEditing, isOpen, touched.numero]);

  // Cierre del dropdown de categorías
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriasRef.current && !categoriasRef.current.contains(event.target)) {
        setCategoriasOpen(false);
      }
    };

    if (categoriasOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoriasOpen]);

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setCategoriasOpen(false);
    setIsDocumentTypeDisabled(false);
    setCheckingEmail(false);
    setCheckingDocument(false);
  };

  const handleClose = () => {
    if (saving) return;
    if (isDirty) {
      handleCancel();
      return;
    }

    resetForm();
    onClose();
  };

  const handleCancel = async () => {
    const confirmed = await showConfirm(
      'warning',
      'Salir sin guardar?',
      'Los cambios no guardados se perderan.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Continuar editando' }
    );

    if (confirmed?.isConfirmed) {
      resetForm();
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let nextValue = value;
    if (name === 'telefono' || name === 'numeroContacto') {
      nextValue = onlyDigits(value, 10);
    }
    if (name === 'nombres' && formData.tipoPersona === 'juridica') {
      nextValue = cleanCompanyName(value);
    } else if (name === 'nombres' || name === 'apellidos' || name === 'nombreContacto') {
      nextValue = onlyLetters(value, name === 'nombreContacto' ? 100 : 80);
    }
    if (name === 'numero') {
      nextValue = cleanDocument(value, formData.tipo);
    }
    if (name === 'correo') {
      nextValue = cleanEmail(value);
    }
    if (name === 'direccion') {
      nextValue = cleanAddress(value);
    }
    if (name === 'codigoCIU') {
      nextValue = cleanCiuCode(value);
    }
    if (name === 'plazoDevoluciones') {
      nextValue = onlyDigits(value, 3);
    }

    let newFormData = { ...formData, [name]: nextValue };
    
    if (name === 'tipoPersona') {
      if (value === 'juridica') {
        newFormData.tipo = 'NIT';
        newFormData.apellidos = '';
        setIsDocumentTypeDisabled(true);
      } else if (value === 'natural') {
        newFormData.tipo = 'CC';
        setIsDocumentTypeDisabled(false);
      }
    }
    
    // ============================================
    // MANEJO ESPECIAL PARA RUT Y CÓDIGO CIU
    // ============================================
    if (name === 'rut') {
      if (value === 'si') {
        // Cuando selecciona "Sí", limpiar el campo CIU para que el usuario pueda ingresar
        newFormData.codigoCIU = '';
      } else if (value === 'no') {
        // Cuando selecciona "No", poner un valor predeterminado
        newFormData.codigoCIU = 'No aplica';
      }
    }
    
    setFormData(newFormData);
    setTouched((prev) => {
      const next = { ...prev, [name]: true };
      if (name === 'tipoPersona') next.tipo = true;
      if (name === 'rut') next.codigoCIU = true;
      return next;
    });

    const validationErrors = validateForm(newFormData);
    const fieldsToRefresh = [name];
    if (name === 'tipoPersona') fieldsToRefresh.push('tipo');
    if (name === 'rut') fieldsToRefresh.push('codigoCIU');

    setErrors((prev) => {
      const next = { ...prev };
      fieldsToRefresh.forEach((field) => {
        next[field] = validationErrors[field] || '';
      });
      if (name === 'numero') {
        next.numero = getDocumentValidationError(nextValue, newFormData.tipo);
      }
      if (name === 'tipo') {
        next.numero = getDocumentValidationError(newFormData.numero, newFormData.tipo);
      }
      return next;
    });
  };

  const handleSelectChange = (name, value) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    handleChange({ target: { name, value } });
  };

  const handleCategoriaChange = (categoryId) => {
    const isSelected = formData.categoryIds.includes(categoryId);
    let updatedCategoryIds;

    if (isSelected) {
      updatedCategoryIds = formData.categoryIds.filter((id) => id !== categoryId);
    } else {
      updatedCategoryIds = [...formData.categoryIds, categoryId];
    }

    setFormData((prev) => ({
      ...prev,
      categoryIds: updatedCategoryIds,
    }));

    setTouched((prev) => ({ ...prev, categoryIds: true }));
    const validationErrors = validateForm({
      ...formData,
      categoryIds: updatedCategoryIds,
    });
    setErrors((prev) => ({
      ...prev,
      categoryIds: validationErrors.categoryIds || '',
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const validationErrors = validateForm(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: name === 'numero'
        ? getDocumentValidationError(formData.numero, formData.tipo)
        : validationErrors[name] || '',
    }));
  };

  const handleCategoriasBlur = () => {
    setTouched((prev) => ({
      ...prev,
      categoryIds: true,
    }));

    if (formData.categoryIds.length === 0) {
      setErrors((prev) => ({
        ...prev,
        categoryIds: 'Seleccione al menos una categoría',
      }));
    }
  };

  const validateForm = (data) => {
    const dataToValidate = data.tipoPersona === 'juridica'
      ? { ...data, apellidos: data.apellidos || 'Empresa' }
      : data;

    const validationErrors = validateProviderForm(dataToValidate);
    const documentError = getDocumentValidationError(data.numero, data.tipo);
    if (documentError) {
      validationErrors.numero = documentError;
    } else {
      delete validationErrors.numero;
    }

    if (data.tipoPersona === 'juridica') {
      delete validationErrors.apellidos;

      if (!data.nombres?.trim()) {
        validationErrors.nombres = 'El nombre de la empresa es obligatorio';
      } else if (data.nombres.trim().length < 2) {
        validationErrors.nombres = 'Debe tener al menos 2 caracteres';
      } else if (data.nombres.trim().length > PROVIDER_NAME_MAX_LENGTH) {
        validationErrors.nombres = `No puede superar ${PROVIDER_NAME_MAX_LENGTH} caracteres`;
      } else {
        delete validationErrors.nombres;
      }
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Validación: Persona jurídica debe usar NIT
    if (formData.tipoPersona === 'juridica' && formData.tipo !== 'NIT') {
      showError('Error de validación', 'La persona jurídica debe usar tipo de documento NIT');
      return;
    }

    // Validación: Persona natural no puede usar NIT
    if (formData.tipoPersona === 'natural' && formData.tipo === 'NIT') {
      showError('Error de validación', 'La persona natural no puede usar tipo de documento NIT');
      return;
    }

    // Validación específica: si RUT es "Sí", código CIU es obligatorio
    if (formData.rut === 'si' && !/^\d{4}$/.test(String(formData.codigoCIU || '').trim())) {
      const ciuError = 'El codigo CIU debe tener exactamente 4 numeros';
      setErrors(prev => ({ ...prev, codigoCIU: ciuError }));
      setTouched(prev => ({ ...prev, codigoCIU: true }));
      showError('Errores en el formulario', ciuError);
      return;
    }

    // Validación: al menos una categoría seleccionada
    if (formData.categoryIds.length === 0) {
      setErrors(prev => ({ ...prev, categoryIds: 'Seleccione al menos una categoría' }));
      setTouched(prev => ({ ...prev, categoryIds: true }));
      showError('Errores en el formulario', 'Debe seleccionar al menos una categoría');
      return;
    }

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (Object.keys(validationErrors).length > 0) {
      showError('Errores en el formulario', 'Por favor corrija los errores antes de continuar');
      return;
    }

    const duplicateEmailError = await getDuplicateEmailError(formData.correo);
    if (duplicateEmailError) {
      setErrors((prev) => ({ ...prev, correo: duplicateEmailError }));
      setTouched((prev) => ({ ...prev, correo: true }));
      showError('Errores en el formulario', duplicateEmailError);
      return;
    }

    const duplicateDocumentError = await getDuplicateDocumentError(formData.numero, formData.tipo);
    if (duplicateDocumentError) {
      setErrors((prev) => ({ ...prev, numero: duplicateDocumentError }));
      setTouched((prev) => ({ ...prev, numero: true }));
      showError('Errores en el formulario', duplicateDocumentError);
      return;
    }

    // Preparar datos para enviar
    const dataToSave = {
      personType: formData.tipoPersona,
      documentType: formData.tipo,
      documentNumber: formData.numero,
      nameProvider: formData.nombres,
      lastname: formData.tipoPersona === 'juridica' ? 'Empresa' : formData.apellidos,
      email: formData.correo,
      phone: formData.telefono,
      address: formData.direccion,
      contactPersonName: formData.nombreContacto,
      contactPersonNumber: formData.numeroContacto ? Number(formData.numeroContacto) : null,
      rut: formData.rut === 'si',
      ciuCode: formData.rut === 'si' ? cleanCiuCode(formData.codigoCIU) : null,
      maxReturnPeriod: formData.plazoDevoluciones ? parseInt(formData.plazoDevoluciones) : null,
      categoryIds: formData.categoryIds,
      idStatus: 1
    };

    try {
      setSaving(true);
      // ESPERAR a que onSave complete antes de cerrar
      await onSave?.(dataToSave);
      //  El éxito ya se muestra en ProvidersPage, no aquí
      resetForm();
      onClose();
    } catch {
      // No hacer nada, el error ya se muestra en ProvidersPage
    } finally {
      setSaving(false);
    }
};

  const liveValidationErrors = validateForm(formData);
  const hasLiveErrors = Object.keys(liveValidationErrors).length > 0;

  const inputClass = (field) =>
    `h-10 w-full rounded-lg border px-3 py-0 text-sm outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-slate-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/10'
    }`;

  const disabledInputClass = (field) =>
    `h-10 w-full rounded-lg border px-3 py-0 text-sm outline-none bg-slate-100 text-slate-500 cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-slate-200'
    }`;

  const protectedInputClass = (field) =>
    `h-10 w-full rounded-lg border px-3 py-0 text-sm outline-none bg-sky-50 text-[#004D77] cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-sky-200'
    }`;

  const protectedSelectClass = 'h-10 rounded-lg py-0 pr-10 bg-sky-50 text-[#004D77] border-sky-200 hover:border-sky-200';

  const renderError = (field) =>
    errors[field] && touched[field] && (
      <p className="mt-0.5 text-xs text-red-500">
        <span>{errors[field]}</span>
      </p>
    );

  const labelClass = 'flex min-h-8 items-end text-xs font-semibold leading-tight text-gray-600';

  const IconInput = ({ icon: Icon, className, ...props }) => (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
      )}
      <input {...props} className={Icon ? `${className} pl-9` : className} />
    </div>
  );

  const getSelectedCategoryNames = () => {
    const selectedCategories = categoriesList.filter(cat => formData.categoryIds.includes(cat.id));
    return selectedCategories.map(cat => cat.name).join(', ');
  };

  const isDirty = useMemo(() => {
    const baseData = provider
      ? {
          tipoPersona: provider.tipoPersona || '',
          tipo: provider.tipo || 'CC',
          numero: provider.numero || '',
          nombres: provider.nombres || '',
          apellidos: provider.apellidos || '',
          telefono: provider.telefono || '',
          correo: provider.correo || '',
          nombreContacto: provider.nombreContacto || '',
          numeroContacto: provider.numeroContacto || '',
          direccion: provider.direccion || '',
          plazoDevoluciones: provider.plazoDevoluciones || '',
          categoryIds: getCategoryIds(provider.categorias),
          rut: provider.rut || '',
          codigoCIU: provider.codigoCIU || '',
        }
      : initialState;

    return Object.keys(initialState).some((key) => {
      if (key === 'categoryIds') {
        const current = [...(formData.categoryIds || [])].sort().join(',');
        const base = [...(baseData.categoryIds || [])].sort().join(',');
        return current !== base;
      }

      return String(formData[key] ?? '') !== String(baseData[key] ?? '');
    });
  }, [formData, provider]);

  if (!isOpen) return null;

  const isLegalPerson = formData.tipoPersona === 'juridica';
  const selectResponsiveProps = {
    dropdownClassName: 'max-sm:w-full',
    maxDropdownWidth: 340,
    placement: 'bottom',
  };

  const personTypeOptions = [
    { value: '', label: 'Selecciona una opción' },
    { value: 'natural', label: 'Persona Natural' },
    { value: 'juridica', label: 'Persona Jurídica' },
  ];
  const documentTypeOptions = formData.tipoPersona === 'juridica'
    ? [{ value: 'NIT', label: 'NIT' }]
    : [
        { value: 'CC', label: 'CC' },
        { value: 'CE', label: 'CE' },
      ];
  const rutOptions = [
    { value: '', label: 'Seleccione' },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4">
      
      <div
        className="absolute inset-0 hidden bg-black/40 backdrop-blur-sm sm:block"
        onClick={handleClose}
      />

      <div className="relative flex h-dvh w-full min-h-0 flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:max-w-2xl sm:rounded-lg">
          <div className="bg-[#004D77] text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shrink-0">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
            {isEditing && (
              <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800">
                Modo edición: puedes actualizar contacto, plazo de devolución, categorías, RUT y CIU. La identificación queda protegida.
              </div>
            )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-6xl mx-auto">

              {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
              <div className="flex flex-col gap-1.5">
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Tipo de persona<span className="text-red-500">*</span></label>
                  <FormSelect
                    value={formData.tipoPersona}
                    options={personTypeOptions}
                    onChange={(value) => handleSelectChange('tipoPersona', value)}
                    icon={UserCircle}
                    disabled={isEditing}
                    error={errors.tipoPersona && touched.tipoPersona}
              placeholder="Selecciona una opción"
              ariaLabel="Tipo de persona"
              className={isEditing ? protectedSelectClass : 'h-10 rounded-lg py-0 pr-10'}
              {...selectResponsiveProps}
            />
                  {renderError('tipoPersona')}
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Tipo<span className="text-red-500">*</span></label>
                    <FormSelect
                      value={formData.tipo}
                      options={documentTypeOptions}
                      onChange={(value) => handleSelectChange('tipo', value)}
                      icon={IdCard}
                      disabled={isEditing || isDocumentTypeDisabled}
                      error={errors.tipo && touched.tipo}
                placeholder="Tipo"
                ariaLabel="Tipo de documento"
                className={isEditing ? protectedSelectClass : 'h-10 rounded-lg py-0 pr-10'}
                {...selectResponsiveProps}
              />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>Número<span className="text-red-500">*</span></label>
                    <IconInput
                      icon={IdCard}
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="123456789"
                      autoComplete="off"
                      className={isEditing ? protectedInputClass('numero') : inputClass('numero')}
                      disabled={isEditing}
                    />
                    {checkingDocument && touched.numero && !errors.numero && (
                      <p className="mt-0.5 text-xs text-[#004D77]">Verificando si el documento ya está registrado...</p>
                    )}
                    {renderError('numero')}
                  </div>
                </div>

                <div className={`grid grid-cols-1 gap-2 ${isLegalPerson ? '' : 'sm:grid-cols-2'}`}>
                <div className="flex min-w-0 flex-col gap-1">
                  <label className={labelClass}>{isLegalPerson ? 'Nombre empresa' : 'Nombres'}<span className="text-red-500">*</span></label>
                  <IconInput
                    icon={isLegalPerson ? Building2 : UserCircle}
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={isLegalPerson ? 'Empresa SAS' : 'Juan'}
                    autoComplete="off"
                    maxLength={PROVIDER_NAME_MAX_LENGTH}
                    className={isEditing ? protectedInputClass('nombres') : inputClass('nombres')}
                    disabled={isEditing}
                  />
                  {renderError('nombres')}
                </div>

                {!isLegalPerson && (
                <div className="flex min-w-0 flex-col gap-1">
                  <label className={labelClass}>Apellidos<span className="text-red-500">*</span></label>
                  <IconInput
                    icon={UserCircle}
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Pérez"
                    autoComplete="off"
                    maxLength={PROVIDER_NAME_MAX_LENGTH}
                    className={isEditing ? protectedInputClass('apellidos') : inputClass('apellidos')}
                    disabled={isEditing}
                  />
                  {renderError('apellidos')}
                </div>
                )}
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>Teléfono<span className="text-red-500">*</span></label>
                    <IconInput
                      icon={Phone}
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="3001234567"
                      autoComplete="off"
                      className={inputClass('telefono')}
                    />
                    {renderError('telefono')}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>Dirección<span className="text-red-500">*</span></label>
                    <IconInput
                      icon={MapPin}
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Calle 10 # 15-25"
                      autoComplete="off"
                      maxLength={ADDRESS_MAX_LENGTH}
                      className={inputClass('direccion')}
                    />
                    {renderError('direccion')}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Correo<span className="text-red-500">*</span></label>
                  <IconInput
                    icon={Mail}
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="email@gmail.com"
                    autoComplete="off"
                    maxLength={EMAIL_MAX_LENGTH}
              className={inputClass('correo')}
            />
            {checkingEmail && touched.correo && !errors.correo && (
              <p className="mt-0.5 text-xs text-[#004D77]">Verificando si el correo ya está registrado...</p>
            )}
            {renderError('correo')}
          </div>

              </div>

              {/* COLUMNA DERECHA: INFORMACIÓN ADICIONAL */}
              <div className="flex flex-col gap-1.5">

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Información adicional</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>{isLegalPerson ? 'Persona encargada' : 'Persona contacto'}</label>
                    <IconInput
                      icon={UserCheck}
                      type="text"
                      name="nombreContacto"
                      value={formData.nombreContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="María"
                      autoComplete="off"
                      className={inputClass('nombreContacto')}
                    />
                    {renderError('nombreContacto')}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>{isLegalPerson ? 'Número persona encargada' : 'Tel. contacto'}</label>
                    <IconInput
                      icon={Phone}
                      type="tel"
                      name="numeroContacto"
                      value={formData.numeroContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="3009876543"
                      autoComplete="off"
                      className={inputClass('numeroContacto')}
                    />
                    {renderError('numeroContacto')}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Plazo devoluciones</label>
                  <IconInput
                    icon={CalendarClock}
                    type="text"
                    name="plazoDevoluciones"
                    value={formData.plazoDevoluciones}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="30"
                    autoComplete="off"
                    className={inputClass('plazoDevoluciones')}
                  />
                  {renderError('plazoDevoluciones')}
                  <p className="text-[10px] text-gray-400 mt-0.5"></p>
                </div>

                <div ref={categoriasRef} className="flex flex-col gap-1">
                  <label className={labelClass}>Categorías<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoriasOpen(!categoriasOpen)}
                      onBlur={handleCategoriasBlur}
                      className={`${inputClass('categoryIds')} flex min-w-0 items-center justify-between gap-2 overflow-hidden cursor-pointer text-left`}
                    >
                      <Tags className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={1.8} />
                      <span className={`block min-w-0 flex-1 truncate ${formData.categoryIds.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                        {formData.categoryIds.length === 0 
                          ? 'Selecciona categorías' 
                          : loadingCategories 
                            ? 'Cargando...' 
                            : getSelectedCategoryNames()}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${categoriasOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {categoriasOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {loadingCategories ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Cargando categorías...</div>
                        ) : (
                          categoriesList.map((categoria) => (
                            <label
                              key={categoria.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={formData.categoryIds.includes(categoria.id)}
                                onChange={() => handleCategoriaChange(categoria.id)}
                                className="w-4 h-4 text-[#004D77] focus:ring-[#004D77] rounded"
                              />
                              <span>{categoria.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {renderError('categoryIds')}
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>RUT<span className="text-red-500">*</span></label>
                    <FormSelect
                      value={formData.rut}
                      options={rutOptions}
                      onChange={(value) => handleSelectChange('rut', value)}
                      icon={FileText}
                      error={errors.rut && touched.rut}
                placeholder="Seleccione"
                ariaLabel="RUT"
                className="h-10 rounded-lg py-0 pr-10"
                {...selectResponsiveProps}
              />
                    {renderError('rut')}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className={labelClass}>Código CIU {formData.rut === 'si' && <span className="text-red-500">*</span>}</label>
                    <IconInput
                      icon={Hash}
                      type="text"
                      name="codigoCIU"
                      value={formData.codigoCIU}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.rut === 'si' ? '4711' : 'No aplica'}
                      autoComplete="off"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={CIU_CODE_LENGTH}
                      className={formData.rut === 'si' ? inputClass('codigoCIU') : protectedInputClass('codigoCIU')}
                      disabled={formData.rut === 'no'}
                      readOnly={formData.rut === 'no'}
                    />
                    {renderError('codigoCIU')}
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-3 sm:px-5 sm:py-4 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="w-full rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || checkingEmail || checkingDocument || hasLiveErrors}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FormProvider;

