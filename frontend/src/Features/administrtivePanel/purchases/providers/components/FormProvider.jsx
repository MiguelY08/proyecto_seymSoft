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

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { validateProviderForm } from '../utils/providerHelpers';

// Opciones disponibles para el campo de categorías
const categoriasOptions = [
  "Útiles escolares",
  "Oficina",
  "Papelería",
  "Arte y manualidades",
  "Tecnología",
  "Industrial",
  "Impresión y copiado",
  "Etiquetas adhesivas"
];

/**
 * Componente: FormProvider
 * 
 * Modal que contiene un formulario para crear o editar un proveedor.
 * Incluye validación en tiempo real y manejo de errores.
 * 
 * Props:
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Object} provider - Objeto del proveedor a editar (null si es nuevo)
 * @param {Function} onSave - Callback que se ejecuta cuando se guarda el formulario
 */
function FormProvider({ isOpen, onClose, provider, onSave }) {

  // Estado inicial del formulario con campos vacíos
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
    tipoCliente: '',
    categorias: [],
    rut: '',
    codigoCIU: '',
  };

  // Estado que almacena los datos del formulario
  const [formData, setFormData] = useState(initialState);
  
  // Estado que almacena los errores de validación por campo
  const [errors, setErrors] = useState({});
  
  // Estado que rastrea qué campos han sido tocados por el usuario (para mostrar errores)
  const [touched, setTouched] = useState({});
  
  // Estado que controla si el dropdown de categorías está abierto
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  
  // Referencia al contenedor del dropdown para detectar clics fuera
  const categoriasRef = useRef(null);
  
  // Hook para mostrar alertas personalizadas
  const { showError, showSuccess } = useAlert();

  // Determinar si estamos editando un proveedor existente
  const isEditing = !!provider;

  // Este useEffect se ejecuta cuando el modal abre o cuando cambia el proveedor a editar
  // Inicializa el formulario con los datos existentes o lo limpia si es nuevo
  useEffect(() => {
    if (provider) {
      // Convertir string de categorías a array si viene como string
      const categoriasArray = provider.categorias 
        ? (Array.isArray(provider.categorias) 
            ? provider.categorias 
            : provider.categorias.split(', '))
        : [];

      setFormData({
        tipoPersona: provider.tipoPersona || '',
        tipo: provider.tipo || 'CC',
        numero: provider.numero || '',
        nombres: provider.nombres || '',
        apellidos: provider.apellidos || '',
        telefono: provider.telefono || '',
        correo: provider.correo || '',
        nombreContacto: provider.pContacto || provider.nombreContacto || '',
        numeroContacto: provider.nuContacto || provider.numeroContacto || '',
        direccion: provider.direccion || '',
        tipoCliente: provider.tipoCliente || '',
        categorias: categoriasArray,
        rut: provider.rut || '',
        codigoCIU: provider.codigoCIU || '',
      });
      
      // Marca todos los campos como tocados para mostrar errores si existen
      setTouched(
        Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
    } else {
      // Nuevo proveedor: reinicia el formulario
      setFormData(initialState);
      setTouched({});
    }

    setErrors({});
  }, [provider, isOpen]);

  // Este useEffect maneja el cierre del dropdown de categorías cuando se hace clic fuera
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

  // ======== FUNCIONALIDAD: Limpiar Formulario ========
  /**
   * Reinicia el formulario a su estado inicial, limpiando todos los campos,
   * errores, campos tocados y cierra el dropdown de categorías.
   */
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setCategoriasOpen(false);
  };

  // ======== FUNCIONALIDAD: Cerrar Formulario ========
  /**
   * Limpia el formulario y cierra el modal.
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ======== FUNCIONALIDAD: Cambiar Campo de Entrada ========
  /**
   * Maneja los cambios en los campos de entrada (text, select, etc).
   * Actualiza el estado del formulario y valida el campo si ha sido tocado.
   * @param {Event} e - Evento del input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Lógica para RUT y código CIU
    let newFormData = { ...formData, [name]: value };
    
    if (name === 'rut') {
      if (value === 'si') {
        // Si RUT es "Sí", el código CIU debe ser obligatorio, lo dejamos vacío para que el usuario lo llene
        newFormData.codigoCIU = newFormData.codigoCIU || '';
      } else if (value === 'no') {
        // Si RUT es "No", el código CIU se genera automáticamente
        newFormData.codigoCIU = 'No aplica';
      }
    }
    
    setFormData(newFormData);

    // Valida el campo en tiempo real si el usuario ya lo ha tocado
    if (touched[name]) {
      const validationErrors = validateProviderForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name] || '',
      }));
    }
  };

  // ======== FUNCIONALIDAD: Cambiar Selección de Categoría ========
  /**
   * Agrega o quita una categoría del array de categorías seleccionadas.
   * @param {string} categoria - Nombre de la categoría a agregar/quitar
   */
  const handleCategoriaChange = (categoria) => {
    const isSelected = formData.categorias.includes(categoria);
    let updatedCategorias;

    if (isSelected) {
      // Si ya está seleccionada, la quita
      updatedCategorias = formData.categorias.filter((cat) => cat !== categoria);
    } else {
      // Si no está seleccionada, la agrega
      updatedCategorias = [...formData.categorias, categoria];
    }

    setFormData((prev) => ({
      ...prev,
      categorias: updatedCategorias,
    }));

    // Valida el campo categorías si ya ha sido tocado
    if (touched.categorias) {
      const validationErrors = validateProviderForm({ ...formData, categorias: updatedCategorias });
      setErrors((prev) => ({
        ...prev,
        categorias: validationErrors.categorias || '',
      }));
    }
  };

  // ======== FUNCIONALIDAD: Marcar Campo como Tocado ========
  /**
   * Cuando el usuario pierde el foco (blur) en un campo, lo marca como tocado
   * y valida su contenido.
   * @param {Event} e - Evento del blur
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const validationErrors = validateProviderForm(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name] || '',
    }));
  };

  // ======== FUNCIONALIDAD: Marcar Categorías como Tocadas ========
  /**
   * Marca el campo de categorías como tocado al perder el foco.
   */
  const handleCategoriasBlur = () => {
    setTouched((prev) => ({
      ...prev,
      categorias: true,
    }));

    const validationErrors = validateProviderForm(formData);
    setErrors((prev) => ({
      ...prev,
      categorias: validationErrors.categorias || '',
    }));
  };

  // ======== FUNCIONALIDAD: Enviar Formulario ========
  /**
   * Valida todo el formulario. Si no hay errores, guarda los datos.
   * Convierte el array de categorías a string antes de guardar.
   * @param {Event} e - Evento del submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación específica: si RUT es "Sí", código CIU es obligatorio
    if (formData.rut === 'si' && !formData.codigoCIU?.trim()) {
      setErrors(prev => ({ ...prev, codigoCIU: 'El código CIU es obligatorio cuando RUT es Sí' }));
      setTouched(prev => ({ ...prev, codigoCIU: true }));
      showError('Errores en el formulario', 'El código CIU es obligatorio cuando RUT es Sí');
      return;
    }

    const validationErrors = validateProviderForm(formData);
    setErrors(validationErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    // Si hay errores, muestra alerta y no continúa
    if (Object.keys(validationErrors).length > 0) {
      showError('Errores en el formulario', 'Por favor corrija los errores antes de continuar');
      return;
    }

    // Convertir array de categorías a string para guardar
    const dataToSave = {
      ...formData,
      categorias: formData.categorias.join(', ')
    };

    onSave?.(dataToSave);
    resetForm();
    onClose();
    // Muestra mensaje de éxito según si es creación o actualización
    showSuccess(isEditing ? 'Proveedor actualizado' : 'Proveedor creado', 
                isEditing ? 'Los datos se actualizaron correctamente' : 'El proveedor se creó exitosamente');
  };

  // No renderiza nada si el modal no está abierto
  if (!isOpen) return null;

  // ======== FUNCIONALIDAD: Generar Clases de Estilo para Inputs ========
  /**
   * Genera las clases CSS dinámicas para un input basado en si tiene errores y
   * si ha sido tocado por el usuario. Cambia el color del borde según el estado.
   * @param {string} field - Nombre del campo
   * @returns {string} String con las clases Tailwind CSS
   */
  const inputClass = (field) =>
    `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  // Clase para inputs deshabilitados (edición)
  const disabledInputClass = (field) =>
    `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-gray-300'
    }`;

  // Clase para selects deshabilitados (edición)
  const disabledSelectClass = (field) =>
    `appearance-none w-full px-3 pr-8 py-1.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-gray-300'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full px-3 pr-8 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  // ======== FUNCIONALIDAD: Renderizar Error de Validación ========
  /**
   * Muestra el mensaje de error de un campo solo si el campo tiene error y
   * ha sido tocado por el usuario.
   * @param {string} field - Nombre del campo
   * @returns {JSX|null} Elemento con el mensaje de error o null
   */
  const renderError = (field) =>
    errors[field] && touched[field] && (
      <p className="mt-0.5 text-xs text-red-600 flex items-start gap-1">
        <span>{errors[field]}</span>
      </p>
    );

  // ======== RENDERIZADO: Modal del Formulario ========
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Backdrop: área oscura para cerrar al hacer clic */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal principal con el formulario - Estilo igual a FormClient */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Encabezado del modal */}
        <div className="bg-[#004D77] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Formulario con campos - Estilo de grid 2 columnas como FormClient */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-6xl mx-auto">

              {/* ── Columna izquierda: Datos personales ────────────────────── */}
              <div className="flex flex-col gap-2.5">
                
                {/* Separador de sección */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                {/* Tipo de persona - SIEMPRE EDITABLE como en clientes */}
                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    Tipo de persona<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="tipoPersona"
                      value={formData.tipoPersona}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={selectClass('tipoPersona')}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  </div>
                  {renderError('tipoPersona')}
                </div>

                {/* Tipo + Documento - DESHABILITADOS EN EDICIÓN */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Tipo<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={isEditing ? disabledSelectClass('tipo') : `${selectClass('tipo')} w-20`}
                        disabled={isEditing}
                      >
                        <option value="CC">CC</option>
                        <option value="CE">CE</option>
                        <option value="NIT">NIT</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Número<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 123456789"
                      autoComplete="off"
                      className={isEditing ? disabledInputClass('numero') : inputClass('numero')}
                      disabled={isEditing}
                    />
                    {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                    {renderError('numero')}
                  </div>
                </div>

                              {/* Nombres */}
              <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-gray-600">
                  Nombres<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Juan Carlos"
                  autoComplete="off"
                  className={isEditing ? disabledInputClass('nombres') : inputClass('nombres')}
                  disabled={isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    No se puede modificar en edición
                  </p>
                )}
                {renderError('nombres')}
              </div>

              {/* Apellidos */}
              <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-gray-600">
                  Apellidos<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Pérez Gómez"
                  autoComplete="off"
                  className={isEditing ? disabledInputClass('apellidos') : inputClass('apellidos')}
                  disabled={isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    No se puede modificar en edición
                  </p>
                )}
                {renderError('apellidos')}
              </div>

                {/* Dirección */}
                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    Dirección<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Calle 10 # 15-25"
                    autoComplete="off"
                    className={inputClass('direccion')}
                  />
                  {renderError('direccion')}
                </div>

                {/* Teléfono + Correo */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Teléfono<span className="text-red-500">*</span>
                    </label>
                    <input
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
                    <label className="block text-xs font-semibold text-gray-600">
                      Correo<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="proveedor@email.com"
                      autoComplete="off"
                      className={inputClass('correo')}
                    />
                    {renderError('correo')}
                  </div>
                </div>

              </div>

              {/* ── Columna derecha: Información adicional ──────────────────── */}
              <div className="flex flex-col gap-2.5">

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Información adicional</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                {/* Persona contacto + Tel. contacto */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Persona contacto
                    </label>
                    <input
                      type="text"
                      name="nombreContacto"
                      value={formData.nombreContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: María López"
                      autoComplete="off"
                      className={inputClass('nombreContacto')}
                    />
                    {renderError('nombreContacto')}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Tel. contacto
                    </label>
                    <input
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

                {/* Tipo cliente */}
                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    Tipo de cliente<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="tipoCliente"
                      value={formData.tipoCliente}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={selectClass('tipoCliente')}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="mayorista">Mayorista</option>
                      <option value="minorista">Minorista</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  </div>
                  {renderError('tipoCliente')}
                </div>

                {/* Categorías - Dropdown con checkboxes */}
                <div ref={categoriasRef} className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    Categorías<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoriasOpen(!categoriasOpen)}
                      onBlur={handleCategoriasBlur}
                      className={`${inputClass('categorias')} flex items-center justify-between cursor-pointer text-left`}
                    >
                      <span className={formData.categorias.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                        {formData.categorias.length === 0 
                          ? 'Selecciona categorías' 
                          : `${formData.categorias.length} seleccionada${formData.categorias.length > 1 ? 's' : ''}`}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${categoriasOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {categoriasOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {categoriasOptions.map((categoria) => (
                          <label
                            key={categoria}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.categorias.includes(categoria)}
                              onChange={() => handleCategoriaChange(categoria)}
                              className="w-4 h-4 text-[#004D77] focus:ring-[#004D77] rounded"
                            />
                            <span>{categoria}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {renderError('categorias')}
                </div>

                {/* RUT + Código CIU */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      RUT<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={selectClass('rut')}
                      >
                        <option value="">Seleccione</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>
                    {renderError('rut')}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Código CIU {formData.rut === 'si' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="codigoCIU"
                      value={formData.codigoCIU}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.rut === 'si' ? "Obligatorio" : "Se genera automáticamente"}
                      autoComplete="off"
                      className={formData.rut === 'si' ? inputClass('codigoCIU') : disabledInputClass('codigoCIU')}
                      disabled={formData.rut === 'no'}
                      readOnly={formData.rut === 'no'}
                    />
                    {formData.rut === 'no' && (
                      <p className="text-xs text-gray-400 mt-0.5">Automático: No aplica</p>
                    )}
                    {formData.rut === 'si' && (
                      <p className="text-xs text-gray-400 mt-0.5">Ingrese el código CIU</p>
                    )}
                    {renderError('codigoCIU')}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Pie del formulario: botones de acción */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FormProvider;