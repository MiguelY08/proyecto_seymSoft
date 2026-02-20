// FormProvider.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    categorias: '',
    rut: '',
    codigoCIU: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

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
        categorias: provider.categorias || '',
        rut: provider.rut || '',
        codigoCIU: provider.codigoCIU || '',
      });
    } else {
      setFormData(initialState);
    }

    setErrors({});
  }, [provider, isOpen]);

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.tipoPersona.trim())
      newErrors.tipoPersona = 'Seleccione el tipo de persona';

    if (!formData.tipo.trim())
      newErrors.tipo = 'Seleccione el tipo de documento';

    if (!formData.numero.trim())
      newErrors.numero = 'El número es obligatorio';
    else if (!/^[0-9-]+$/.test(formData.numero))
      newErrors.numero = 'Solo números permitidos';

    if (!formData.nombres.trim())
      newErrors.nombres = 'El nombre es obligatorio';

    if (!formData.telefono.trim())
      newErrors.telefono = 'El teléfono es obligatorio';
    else if (!/^[0-9]+$/.test(formData.telefono))
      newErrors.telefono = 'Solo números permitidos';

    if (!formData.correo.trim())
      newErrors.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo))
      newErrors.correo = 'Correo inválido';

    // Validación opcional contacto
    if (formData.numeroContacto && !/^[0-9]+$/.test(formData.numeroContacto))
      newErrors.numeroContacto = 'Solo números permitidos';

    if (!formData.direccion.trim())
      newErrors.direccion = 'La dirección es obligatoria';

    if (!formData.tipoCliente.trim())
      newErrors.tipoCliente = 'Seleccione tipo de cliente';

    if (!formData.categorias.trim())
      newErrors.categorias = 'Seleccione una categoría';

    if (!formData.rut.trim())
      newErrors.rut = 'Indique si tiene RUT';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSave?.(formData);

    if (provider) {
      alert('Proveedor actualizado correctamente');
    } else {
      alert('Proveedor creado correctamente');
    }

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const renderError = (field) =>
    errors[field] && (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#004D77] text-white px-6 py-4 flex items-center justify-between shrink-0">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-6xl mx-auto">

              {/* Tipo de persona */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de persona<span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoPersona"
                  value={formData.tipoPersona}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo<span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numero<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Ej: 123456789"
                  className={inputClass('numero')}
                />
                {renderError('numero')}
              </div>

              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombres<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  className={inputClass('nombres')}
                />
                {renderError('nombres')}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Pérez Gómez"
                  className={inputClass('apellidos')}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Teléfono - Celular<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  className={inputClass('telefono')}
                />
                {renderError('telefono')}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Ej: proveedor@email.com"
                  className={inputClass('correo')}
                />
                {renderError('correo')}
              </div>

              {/* Nombre persona contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre persona contacto
                </label>
                <input
                  type="text"
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  placeholder="Ej: María López"
                  className={inputClass('nombreContacto')}
                />
              </div>

              {/* Número persona contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Número persona contacto
                </label>
                <input
                  type="tel"
                  name="numeroContacto"
                  value={formData.numeroContacto}
                  onChange={handleChange}
                  placeholder="Ej: 3009876543"
                  className={inputClass('numeroContacto')}
                />
                {renderError('numeroContacto')}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Dirección<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Calle 10 # 15-25"
                  className={inputClass('direccion')}
                />
                {renderError('direccion')}
              </div>

              {/* Tipo cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de cliente<span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoCliente"
                  value={formData.tipoCliente}
                  onChange={handleChange}
                  className={inputClass('tipoCliente')}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="minorista">Minorista</option>
                </select>
                {renderError('tipoCliente')}
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Categorías<span className="text-red-500">*</span>
                </label>
                <select
                  name="categorias"
                  value={formData.categorias}
                  onChange={handleChange}
                  className={inputClass('categorias')}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Útiles escolares">Útiles escolares</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Papelería">Papelería</option>
                  <option value="Arte y manualidades">Arte y manualidades</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Industrial">Industrial</option>
                </select>
                {renderError('categorias')}
              </div>

              {/* RUT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RUT<span className="text-red-500">*</span>
                </label>
                <select
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors"
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