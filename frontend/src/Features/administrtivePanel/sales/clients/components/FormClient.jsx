import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import GraphClient from './GraphClient';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { clientsService } from '../data/clientsService';
import { validateClientForm } from '../utils/clientHelpers';

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
    creditoCliente: '',  // Se guardará como '0' si está vacío
    tipoCliente: '',
    rut: '',
    codigoCIU: '',
  };  

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { showSuccess } = useAlert();

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
        creditoCliente: client.creditoCliente || '',
        tipoCliente: client.tipoCliente || '',
        rut: client.rut || '',
        codigoCIU: client.codigoCIU || '',
      });
      
      setTouched(
        Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
    } else {
      setFormData(initialState);
      setTouched({});
    }

    setErrors({});
  }, [client, isOpen]);

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setShowGraph(false);
  };  

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // validate in real time if the field has been touched
    if (touched[name]) {
      const validationErrors = validateClientForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name] || '',
      }));
    } else if (errors[name]) {
      // clear previous error if user modifies before touch
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const validationErrors = validateClientForm(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name] || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateClientForm(formData);
    setErrors(validationErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (Object.keys(validationErrors).length > 0) return;

    // El crédito se enviará como está, y en el service se convertirá a '0' si está vacío
    onSave?.(formData);

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
      <p className="mt-0.5 text-xs text-red-600">{errors[field]}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-6xl mx-auto">

                {/* Tipo persona */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de persona <span className="text-red-500">*</span>
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
                    Tipo <span className="text-red-500">*</span>
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

                {/* Numero */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Número <span className="text-red-500">*</span>
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
                    Nombres <span className="text-red-500">*</span>
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

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
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

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
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
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: cliente@email.com"
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

                {/* Crédito cliente - AHORA OPCIONAL */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Crédito cliente
                  </label>
                  <input
                    type="text"
                    name="creditoCliente"
                    value={formData.creditoCliente}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0"  // Placeholder cambiado a "0"
                    className={inputClass('creditoCliente')}
                  />
                  {renderError('creditoCliente')}
                </div>

                {/* Tipo Cliente */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoCliente"
                    value={formData.tipoCliente}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('tipoCliente')}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="detal">Detal</option>
                    <option value="mayorista">Mayorista</option>
                    <option value="colegas">Colegas</option>
                    <option value="pacas">Pacas</option>
                  </select>
                  {renderError('tipoCliente')}
                </div>

                {/* RUT */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    RUT <span className="text-red-500">*</span>
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

                {/* Codigo CIU junto a RUT */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Código CIU
                  </label>
                  <input
                    type="text"
                    name="codigoCIU"
                    value={formData.codigoCIU}
                    onChange={handleChange}
                    onBlur={handleBlur}
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