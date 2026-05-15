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
import { categoriesService } from '../data/categoriesService';

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
  const categoriasRef = useRef(null);
  const { showError, showSuccess } = useAlert();
  const isEditing = !!provider;
  const [isDocumentTypeDisabled, setIsDocumentTypeDisabled] = useState(false);

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      if (!isOpen) return;
      setLoadingCategories(true);
      try {
        const result = await categoriesService.getAll();
        setCategoriesList(result.data || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
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
      const categoryIds = provider.categorias?.map(cat => cat.id) || [];
      
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
  }, [provider, isOpen]);

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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newFormData = { ...formData, [name]: value };
    
    if (name === 'tipoPersona') {
      if (value === 'juridica') {
        newFormData.tipo = 'NIT';
        setIsDocumentTypeDisabled(true);
      } else if (value === 'natural') {
        newFormData.tipo = 'CC';
        setIsDocumentTypeDisabled(false);
      }
    }
    
    if (name === 'rut') {
      if (value === 'si') {
        newFormData.codigoCIU = newFormData.codigoCIU || '';
      } else if (value === 'no') {
        newFormData.codigoCIU = 'No aplica';
      }
    }
    
    setFormData(newFormData);

    if (touched[name]) {
      const validationErrors = validateProviderForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name] || '',
      }));
    }
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

    if (touched.categoryIds) {
      if (updatedCategoryIds.length === 0) {
        setErrors((prev) => ({
          ...prev,
          categoryIds: 'Seleccione al menos una categoría',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          categoryIds: '',
        }));
      }
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    if (formData.rut === 'si' && !formData.codigoCIU?.trim()) {
      setErrors(prev => ({ ...prev, codigoCIU: 'El código CIU es obligatorio cuando RUT es Sí' }));
      setTouched(prev => ({ ...prev, codigoCIU: true }));
      showError('Errores en el formulario', 'El código CIU es obligatorio cuando RUT es Sí');
      return;
    }

    // Validación: al menos una categoría seleccionada
    if (formData.categoryIds.length === 0) {
      setErrors(prev => ({ ...prev, categoryIds: 'Seleccione al menos una categoría' }));
      setTouched(prev => ({ ...prev, categoryIds: true }));
      showError('Errores en el formulario', 'Debe seleccionar al menos una categoría');
      return;
    }

    const validationErrors = validateProviderForm(formData);
    setErrors(validationErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (Object.keys(validationErrors).length > 0) {
      showError('Errores en el formulario', 'Por favor corrija los errores antes de continuar');
      return;
    }

    // Preparar datos para enviar
    const dataToSave = {
      personType: formData.tipoPersona,
      documentType: formData.tipo,
      documentNumber: formData.numero,
      nameProvider: formData.nombres,
      lastname: formData.apellidos,
      email: formData.correo,
      phone: formData.telefono,
      address: formData.direccion,
      contactPersonName: formData.nombreContacto,
      contactPersonNumber: formData.numeroContacto ? Number(formData.numeroContacto) : null,
      rut: formData.rut === 'si',
      ciuCode: formData.codigoCIU || null,
      maxReturnPeriod: formData.plazoDevoluciones ? parseInt(formData.plazoDevoluciones) : null,
      categoryIds: formData.categoryIds,
      idStatus: 1
    };

    try {
      // ESPERAR a que onSave complete antes de cerrar
      await onSave?.(dataToSave);
      //  El éxito ya se muestra en ProvidersPage, no aquí
      resetForm();
      onClose();
    } catch (error) {
      // No hacer nada, el error ya se muestra en ProvidersPage
    }
};

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const disabledInputClass = (field) =>
    `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-gray-300'
    }`;

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

  const renderError = (field) =>
    errors[field] && touched[field] && (
      <p className="mt-0.5 text-xs text-red-600 flex items-start gap-1">
        <span>{errors[field]}</span>
      </p>
    );

  const getSelectedCategoryNames = () => {
    const selectedCategories = categoriesList.filter(cat => formData.categoryIds.includes(cat.id));
    return selectedCategories.map(cat => cat.name).join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-6xl mx-auto">

              {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
              <div className="flex flex-col gap-2.5">
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">Tipo de persona<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="tipoPersona"
                      value={formData.tipoPersona}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isEditing ? disabledSelectClass('tipoPersona') : selectClass('tipoPersona')}
                      disabled={isEditing}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  </div>
                  {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                  {renderError('tipoPersona')}
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="block text-xs font-semibold text-gray-600">Tipo<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={isEditing ? disabledSelectClass('tipo') : selectClass('tipo')}
                        disabled={isEditing || isDocumentTypeDisabled}
                      >
                        {formData.tipoPersona === 'juridica' ? (
                          <option value="NIT">NIT</option>
                        ) : (
                          <>
                            <option value="CC">CC</option>
                            <option value="CE">CE</option>
                            <option value="PP">PP</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">Número<span className="text-red-500">*</span></label>
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

                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">Nombres<span className="text-red-500">*</span></label>
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
                  {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                  {renderError('nombres')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">Apellidos<span className="text-red-500">*</span></label>
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
                  {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                  {renderError('apellidos')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">Dirección<span className="text-red-500">*</span></label>
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

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">Teléfono<span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-semibold text-gray-600">Correo<span className="text-red-500">*</span></label>
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

              {/* COLUMNA DERECHA: INFORMACIÓN ADICIONAL */}
              <div className="flex flex-col gap-2.5">

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Información adicional</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="block text-xs font-semibold text-gray-600">Persona contacto</label>
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
                    <label className="block text-xs font-semibold text-gray-600">Tel. contacto</label>
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

                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">Plazo devoluciones</label>
                  <input
                    type="text"
                    name="plazoDevoluciones"
                    value={formData.plazoDevoluciones}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 30 días"
                    autoComplete="off"
                    className={inputClass('plazoDevoluciones')}
                  />
                  {renderError('plazoDevoluciones')}
                  <p className="text-[10px] text-gray-400 mt-0.5">Días para realizar devoluciones</p>
                </div>

                <div ref={categoriasRef} className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold text-gray-600">Categorías<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoriasOpen(!categoriasOpen)}
                      onBlur={handleCategoriasBlur}
                      className={`${inputClass('categoryIds')} flex items-center justify-between cursor-pointer text-left`}
                    >
                      <span className={formData.categoryIds.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
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
                    <label className="block text-xs font-semibold text-gray-600">RUT<span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-semibold text-gray-600">Código CIU {formData.rut === 'si' && <span className="text-red-500">*</span>}</label>
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