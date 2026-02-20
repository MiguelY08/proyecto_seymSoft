import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import GraphClient from './GraphClient';

function FormClient({ isOpen, onClose, client, onSave }) {
  const [showGraph, setShowGraph] = useState(false);

  const initialState = {
    tipoPersona: '',
    tipo: 'CC',
    numero: '',
    nombres: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    correo: '',
    nombreContacto: '',
    numeroContacto: '',
    tipoCliente: '',
    rut: '',
    codigoCIU: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        tipoPersona: client.tipoPersona || '',
        tipo: client.tipo || 'CC',
        numero: client.numero || '',
        nombres: client.nombres || '',
        apellidos: client.apellidos || '',
        direccion: client.direccion || '',
        telefono: client.telefono || '',
        correo: client.correo || '',
        nombreContacto: client.nombreContacto || '',
        numeroContacto: client.numeroContacto || '',
        tipoCliente: client.tipoCliente || '',
        rut: client.rut || '',
        codigoCIU: client.codigoCIU || '',
      });
    } else {
      setFormData(initialState);
    }

    setErrors({});
  }, [client, isOpen]);

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setShowGraph(false);
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

    if (!formData.direccion.trim())
      newErrors.direccion = 'La dirección es obligatoria';

    if (!formData.telefono.trim())
      newErrors.telefono = 'El teléfono es obligatorio';
    else if (!/^[0-9]+$/.test(formData.telefono))
      newErrors.telefono = 'Solo números permitidos';

    if (!formData.correo.trim())
      newErrors.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo))
      newErrors.correo = 'Correo inválido';

    if (formData.nombreContacto && formData.nombreContacto.trim().length < 3)
      newErrors.nombreContacto = 'Debe tener mínimo 3 caracteres';

    if (formData.numeroContacto && !/^[0-9]+$/.test(formData.numeroContacto))
      newErrors.numeroContacto = 'Solo números permitidos';

    if (!formData.tipoCliente.trim())
      newErrors.tipoCliente = 'Seleccione el tipo de cliente';

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

    if (client) {
      alert('Cliente actualizado correctamente');
    } else {
      alert('Cliente creado correctamente');
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
        onClick={() => {
          resetForm();
          onClose();
        }}
      />

      {/* Modal Container */}
      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden flex transition-all h-[95vh] ${
        showGraph ? 'w-[95vw] max-w-[1600px]' : 'w-full max-w-5xl'
      }`}>

        {/* Form Section */}
        <div className={`flex flex-col ${showGraph ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>

          {/* Header */}
          <div className="bg-[#004D77] text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold">
              {client ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-6xl mx-auto">

                {/* Tipo persona */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">
                    Tipo de persona *
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
                  <label className="block text-sm font-medium mb-1.5">
                    Tipo *
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

                {/* Numero */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Número *
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
                  <label className="block text-sm font-medium mb-1.5">
                    Nombres *
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
                  <label className="block text-sm font-medium mb-1.5">
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

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">
                    Dirección *
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

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Teléfono *
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
                  <label className="block text-sm font-medium mb-1.5">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="Ej: cliente@email.com"
                    className={inputClass('correo')}
                  />
                  {renderError('correo')}
                </div>

                {/* Nombre persona contacto */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
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
                  {renderError('nombreContacto')}
                </div>

                {/* Número persona contacto */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
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

                {/* Tipo Cliente */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Tipo de cliente *
                  </label>
                  <select
                    name="tipoCliente"
                    value={formData.tipoCliente}
                    onChange={handleChange}
                    className={inputClass('tipoCliente')}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="detal">Detal</option>
                    <option value="mayorista">Mayorista</option>
                  </select>
                  {renderError('tipoCliente')}
                </div>

                {/* RUT */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    RUT *
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

                {/* Codigo CIU */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">
                    Código CIU
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

            <div className="border-t px-6 py-4 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg"
              >
                {client ? 'Actualizar' : 'Crear'}
              </button>
            </div>

          </form>

        </div>

        {/* Graph Section (expandable) - Solo si está editando */}
        {showGraph && client && (
          <div className="w-1/2 flex flex-col">
            <GraphClient clientStartDate={client.clienteSince || '07/05/2023'} />
          </div>
        )}

        {/* Toggle Graph Button - Solo aparece cuando está editando */}
        {client && (
          <button
            onClick={() => setShowGraph(!showGraph)}
            className={`absolute top-1/2 -translate-y-1/2 bg-[#004D77] text-white p-2 rounded-full shadow-lg hover:bg-[#003a5c] transition-all z-10 ${
              showGraph ? 'left-1/2 -translate-x-1/2' : 'right-4'
            }`}
            title={showGraph ? 'Ocultar gráfica' : 'Ver gráfica'}
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${showGraph ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </button>
        )}

      </div>
    </div>
  );
}

export default FormClient;