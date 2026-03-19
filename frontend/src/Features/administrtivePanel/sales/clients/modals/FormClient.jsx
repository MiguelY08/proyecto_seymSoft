import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import GraphClient    from '../components/GraphClient';
import { validateClientForm } from '../helpers/clientHelpers';

function FormClient({ isOpen, onClose, client, onSave }) {
  const [showGraph, setShowGraph] = useState(false);

  const initialState = {
    personType:   '',
    documentType: 'CC',
    document:     '',
    firstName:    '',
    lastName:     '',
    address:      '',
    phone:        '',
    email:        '',
    contactName:  '',
    contactPhone: '',
    clientCredit: '',
    clientType:   '',
    rut:          '',
    ciuCode:      '',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});

  // Populate or reset form when client or isOpen changes
  useEffect(() => {
    if (client) {
      setFormData({
        personType:   client.personType   || '',
        documentType: client.documentType || 'CC',
        document:     client.document     || '',
        firstName:    client.firstName    || '',
        lastName:     client.lastName     || '',
        address:      client.address      || '',
        phone:        client.phone        || '',
        email:        client.email        || '',
        contactName:  client.contactName  || '',
        contactPhone: client.contactPhone || '',
        clientCredit: client.clientCredit || '',
        clientType:   client.clientType   || '',
        rut:          client.rut          || '',
        ciuCode:      client.ciuCode      || '',
      });
      setTouched(Object.keys(initialState).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
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
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const validationErrors = validateClientForm({ ...formData, [name]: value });
      setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
    } else if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validateClientForm(formData);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateClientForm(formData);
    setErrors(validationErrors);
    setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));

    if (Object.keys(validationErrors).length > 0) return;

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
        onClick={() => { resetForm(); onClose(); }}
      />

      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden flex transition-all h-[95vh] ${
        showGraph ? 'w-[95vw] max-w-1600px' : 'w-full max-w-5xl'
      }`}>

        {/* Form section */}
        <div className={`flex flex-col ${showGraph ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>

          {/* Header */}
          <div className="bg-[#004D77] text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold">
              {client ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-6xl mx-auto">

                {/* Person type */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de persona <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="personType"
                    value={formData.personType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('personType')}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="natural">Persona Natural</option>
                    <option value="juridica">Persona Jurídica</option>
                  </select>
                  {renderError('personType')}
                </div>

                {/* Document type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('documentType')}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                  </select>
                  {renderError('documentType')}
                </div>

                {/* Document number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Número <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 123456789"
                    className={inputClass('document')}
                  />
                  {renderError('document')}
                </div>

                {/* First name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Juan Carlos"
                    className={inputClass('firstName')}
                  />
                  {renderError('firstName')}
                </div>

                {/* Last name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Pérez Gómez"
                    className={inputClass('lastName')}
                  />
                  {renderError('lastName')}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Calle 10 # 15-25"
                    className={inputClass('address')}
                  />
                  {renderError('address')}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 3001234567"
                    className={inputClass('phone')}
                  />
                  {renderError('phone')}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: cliente@email.com"
                    className={inputClass('email')}
                  />
                  {renderError('email')}
                </div>

                {/* Contact name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nombre persona contacto
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: María López"
                    className={inputClass('contactName')}
                  />
                  {renderError('contactName')}
                </div>

                {/* Contact phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Número persona contacto
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 3009876543"
                    className={inputClass('contactPhone')}
                  />
                  {renderError('contactPhone')}
                </div>

                {/* Client credit (optional) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Crédito cliente
                  </label>
                  <input
                    type="text"
                    name="clientCredit"
                    value={formData.clientCredit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0"
                    className={inputClass('clientCredit')}
                  />
                  {renderError('clientCredit')}
                </div>

                {/* Client type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('clientType')}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Detal">Detal</option>
                    <option value="Mayorista">Mayorista</option>
                    <option value="Colegas">Colegas</option>
                    <option value="Por paca">Por paca</option>
                  </select>
                  {renderError('clientType')}
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

                {/* CIU code */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Código CIU
                  </label>
                  <input
                    type="text"
                    name="ciuCode"
                    value={formData.ciuCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 4669"
                    className={inputClass('ciuCode')}
                  />
                </div>

              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { resetForm(); onClose(); }}
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

        {/* Graph section — only when editing */}
        {showGraph && client && (
          <div className="w-1/2 flex flex-col">
            <GraphClient clientStartDate={client.clientSince || '07/05/2023'} />
          </div>
        )}

        {/* Toggle graph button — only when editing */}
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