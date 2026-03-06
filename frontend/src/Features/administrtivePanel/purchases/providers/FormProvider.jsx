// FormProvider.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useAlert } from '../../../shared/alerts/useAlert';

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
    tipoCliente: '',
    categorias: [],
    rut: '',
    codigoCIU: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const categoriasRef = useRef(null);
  
  const { showError } = useAlert();

  useEffect(() => {
    if (provider) {
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
        tipoCliente: provider.tipoCliente || '',
        categorias: Array.isArray(provider.categorias) ? provider.categorias : (provider.categorias ? provider.categorias.split(', ') : []),
        rut: provider.rut || '',
        codigoCIU: provider.codigoCIU || '',
      });
    } else {
      setFormData(initialState);
    }

    setErrors({});
    setTouched({});
  }, [provider, isOpen]);

  // Cerrar dropdown al hacer clic fuera
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validación en tiempo real
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'tipoPersona':
        if (!value || !value.trim()) error = 'Seleccione el tipo de persona';
        break;

      case 'tipo':
        if (!value || !value.trim()) error = 'Seleccione el tipo de documento';
        break;

      case 'numero':
        if (!value || !value.trim()) {
          error = 'El número es obligatorio';
        } else if (!/^[0-9-]+$/.test(value)) {
          error = 'Solo se permiten números y guiones';
        } else if (value.length < 6) {
          error = 'Debe tener al menos 6 caracteres';
        }
        break;

      case 'nombres':
        if (!value || !value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo se permiten letras';
        }
        break;

      case 'apellidos':
        if (!value || !value.trim()) {
          error = 'El apellido es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo se permiten letras';
        }
        break;

      case 'telefono':
        if (!value || !value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^[0-9]+$/.test(value)) {
          error = 'Solo se permiten números';
        } else if (value.length < 7 || value.length > 10) {
          error = 'Debe tener entre 7 y 10 dígitos';
        }
        break;

      case 'correo':
        if (!value || !value.trim()) {
          error = 'El correo es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de correo inválido';
        }
        break;

      case 'numeroContacto':
        if (value && value.trim()) {
          if (!/^[0-9]+$/.test(value)) {
            error = 'Solo se permiten números';
          } else if (value.length < 7 || value.length > 10) {
            error = 'Debe tener entre 7 y 10 dígitos';
          }
        }
        break;

      case 'direccion':
        if (!value || !value.trim()) {
          error = 'La dirección es obligatoria';
        } else if (value.trim().length < 5) {
          error = 'Debe tener al menos 5 caracteres';
        }
        break;

      case 'tipoCliente':
        if (!value || !value.trim()) error = 'Seleccione el tipo de cliente';
        break;

      case 'categorias':
        if (!value || value.length === 0) error = 'Seleccione al menos una categoría';
        break;

      case 'rut':
        if (!value || !value.trim()) error = 'Indique si tiene RUT';
        break;

      case 'nombreContacto':
        if (value && value.trim()) {
          if (value.trim().length < 2) {
            error = 'Debe tener al menos 2 caracteres';
          } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            error = 'Solo se permiten letras';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar en tiempo real solo si el campo ya ha sido tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleCategoriaChange = (categoria) => {
    const isSelected = formData.categorias.includes(categoria);
    let updatedCategorias;

    if (isSelected) {
      updatedCategorias = formData.categorias.filter((cat) => cat !== categoria);
    } else {
      updatedCategorias = [...formData.categorias, categoria];
    }

    setFormData((prev) => ({
      ...prev,
      categorias: updatedCategorias,
    }));

    // Validar en tiempo real
    if (touched.categorias) {
      const error = validateField('categorias', updatedCategorias);
      setErrors((prev) => ({
        ...prev,
        categorias: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleCategoriasBlur = () => {
    setTouched((prev) => ({
      ...prev,
      categorias: true,
    }));

    const error = validateField('categorias', formData.categorias);
    setErrors((prev) => ({
      ...prev,
      categorias: error,
    }));
  };

  const validateAll = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateAll();
    setErrors(validationErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

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
  };

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const renderError = (field) =>
    errors[field] && touched[field] && (
      <p className="mt-0.5 text-xs text-red-600 flex items-start gap-1">
        <span className="mt-0.5"></span>
        <span>{errors[field]}</span>
      </p>
    );

  const categoriasOptions = [
    "Útiles escolares",
    "Oficina",
    "Papelería",
    "Arte y manualidades",
    "Tecnología",
    "Industrial"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#004D77] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold">
            {provider ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-6xl mx-auto">

              {/* Tipo de persona */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de persona<span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoPersona"
                  value={formData.tipoPersona}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('tipoPersona')}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="natural">Persona Natural</option>
                  <option value="juridica">Persona Jurídica</option>
                </select>
                {renderError('tipoPersona')}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo<span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('tipo')}
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                </select>
                {renderError('tipo')}
              </div>

              {/* Número */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Numero<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 123456789"
                  className={inputClass('numero')}
                />
                {renderError('numero')}
              </div>

              {/* Nombres */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombres<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Juan Carlos"
                  className={inputClass('nombres')}
                />
                {renderError('nombres')}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Apellidos<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Pérez Gómez"
                  className={inputClass('apellidos')}
                />
                {renderError('apellidos')}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Teléfono - Celular<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 3001234567"
                  className={inputClass('telefono')}
                />
                {renderError('telefono')}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Correo electrónico<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: proveedor@email.com"
                  className={inputClass('correo')}
                />
                {renderError('correo')}
              </div>

              {/* Nombre persona contacto */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre persona contacto
                </label>
                <input
                  type="text"
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: María López"
                  className={inputClass('nombreContacto')}
                />
                {renderError('nombreContacto')}
              </div>

              {/* Número persona contacto */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Número persona contacto
                </label>
                <input
                  type="tel"
                  name="numeroContacto"
                  value={formData.numeroContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 3009876543"
                  className={inputClass('numeroContacto')}
                />
                {renderError('numeroContacto')}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dirección<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Calle 10 # 15-25"
                  className={inputClass('direccion')}
                />
                {renderError('direccion')}
              </div>

              {/* Tipo cliente */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de cliente<span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoCliente"
                  value={formData.tipoCliente}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('tipoCliente')}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="minorista">Minorista</option>
                </select>
                {renderError('tipoCliente')}
              </div>

              {/* Categorías - Dropdown con checkboxes */}
              <div ref={categoriasRef}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Categorías<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoriasOpen(!categoriasOpen)}
                    onBlur={handleCategoriasBlur}
                    className={`${inputClass('categorias')} flex items-center justify-between cursor-pointer`}
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

              {/* RUT */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  RUT<span className="text-red-500">*</span>
                </label>
                <select
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('rut')}
                >
                  <option value="">Seleccione</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
                {renderError('rut')}
              </div>

              {/* Código CIU */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Codigo CIU
                </label>
                <input
                  type="text"
                  name="codigoCIU"
                  value={formData.codigoCIU}
                  onChange={handleChange}
                  placeholder="Ej: 4669"
                  className={inputClass('codigoCIU')}
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors"
            >
              {provider ? 'Actualizar' : 'Crear'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FormProvider;