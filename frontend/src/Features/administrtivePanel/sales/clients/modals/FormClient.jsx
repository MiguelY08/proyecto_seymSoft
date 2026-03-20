import { useState, useEffect } from 'react';
import {
  X, ChevronDown, ChevronRight,
  UserCircle, Users, IdCard, MapPin, Phone,
  Mail, UserCheck, CreditCard, ShoppingCart,
  FileText, Hash, BarChart2,
} from 'lucide-react';
import GraphClient        from '../components/GraphClient';
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
    setShowGraph(false);
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

  // ─── Helpers de UI — mismos tamaños que FormUser ──────────────────────────
  const inputClass = (field) =>
    `w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full pl-9 pr-8 py-2 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  // Icono izquierdo del campo — mismo patrón que FormUser
  const FIcon = ({ icon: Icon }) => (
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
  );

  const ErrorMsg = ({ field }) =>
    errors[field] && touched[field]
      ? <p className="mt-0.5 text-xs text-red-500">{errors[field]}</p>
      : null;

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-600">
      {children}{required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { resetForm(); onClose(); }}
      />

      {/* Modal — se expande con la gráfica */}
      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden flex transition-all duration-500 ease-in-out ${
        showGraph ? 'w-[95vw] max-w-325' : 'w-full max-w-2xl'
      }`}>

        {/* ── Sección del formulario ────────────────────────────────────────── */}
        <div
          className="flex flex-col min-w-0"
          style={{ width: showGraph ? '50%' : '100%', transition: 'width 500ms ease-in-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
            <h2 className="text-white font-semibold text-lg">
              {client ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Cuerpo */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 py-2 grid grid-cols-2 gap-x-4 gap-y-0">

              {/* ── Columna izquierda: Datos personales ────────────────────── */}
              <div className="flex flex-col gap-2.5">

                {/* Separador de sección */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                {/* Tipo de persona */}
                <div className="flex flex-col gap-1">
                  <Label required>Tipo de persona</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                    <select name="personType" value={formData.personType} onChange={handleChange} onBlur={handleBlur} className={selectClass('personType')}>
                      <option value="">Selecciona una opción</option>
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  </div>
                  <ErrorMsg field="personType" />
                </div>

                {/* Tipo + Documento */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <Label>Tipo<span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <select name="documentType" value={formData.documentType} onChange={handleChange} onBlur={handleBlur}
                        className="appearance-none w-20 px-4 py-2 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20">
                        <option value="CC">CC</option>
                        <option value="CE">CE</option>
                        <option value="NIT">NIT</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>Documento</Label>
                    <div className="relative">
                      <FIcon icon={IdCard} />
                      <input type="text" name="document" value={formData.document} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: 123456789" autoComplete="off" className={inputClass('document')} />
                    </div>
                    <ErrorMsg field="document" />
                  </div>
                </div>

                {/* Nombres */}
                <div className="flex flex-col gap-1">
                  <Label required>Nombres</Label>
                  <div className="relative">
                    <FIcon icon={UserCheck} />
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Juan Carlos" autoComplete="off" className={inputClass('firstName')} />
                  </div>
                  <ErrorMsg field="firstName" />
                </div>

                {/* Apellidos */}
                <div className="flex flex-col gap-1">
                  <Label required>Apellidos</Label>
                  <div className="relative">
                    <FIcon icon={Users} />
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Pérez Gómez" autoComplete="off" className={inputClass('lastName')} />
                  </div>
                  <ErrorMsg field="lastName" />
                </div>

                {/* Dirección */}
                <div className="flex flex-col gap-1">
                  <Label required>Dirección</Label>
                  <div className="relative">
                    <FIcon icon={MapPin} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Calle 10 # 15-25" autoComplete="off" className={inputClass('address')} />
                  </div>
                  <ErrorMsg field="address" />
                </div>

                {/* Teléfono + Correo */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>Teléfono</Label>
                    <div className="relative">
                      <FIcon icon={Phone} />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} placeholder="3001234567" autoComplete="off" className={inputClass('phone')} />
                    </div>
                    <ErrorMsg field="phone" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>Correo</Label>
                    <div className="relative">
                      <FIcon icon={Mail} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="cliente@email.com" autoComplete="off" className={inputClass('email')} />
                    </div>
                    <ErrorMsg field="email" />
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
                    <Label>Persona contacto</Label>
                    <div className="relative">
                      <FIcon icon={UserCheck} />
                      <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: María López" autoComplete="off" className={inputClass('contactName')} />
                    </div>
                    <ErrorMsg field="contactName" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label>Tel. contacto</Label>
                    <div className="relative">
                      <FIcon icon={Phone} />
                      <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} onBlur={handleBlur} placeholder="3009876543" autoComplete="off" className={inputClass('contactPhone')} />
                    </div>
                    <ErrorMsg field="contactPhone" />
                  </div>
                </div>

                {/* Tipo cliente */}
                <div className="flex flex-col gap-1">
                  <Label required>Tipo de cliente</Label>
                  <div className="relative">
                    <FIcon icon={ShoppingCart} />
                    <select name="clientType" value={formData.clientType} onChange={handleChange} onBlur={handleBlur} className={selectClass('clientType')}>
                      <option value="">Selecciona una opción</option>
                      <option value="Detal">Detal</option>
                      <option value="Mayorista">Mayorista</option>
                      <option value="Colegas">Colegas</option>
                      <option value="Por paca">Por paca</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  </div>
                  <ErrorMsg field="clientType" />
                </div>

                {/* Crédito cliente */}
                <div className="flex flex-col gap-1">
                  <Label>Crédito cliente</Label>
                  <div className="relative">
                    <FIcon icon={CreditCard} />
                    <input type="text" name="clientCredit" value={formData.clientCredit} onChange={handleChange} onBlur={handleBlur} placeholder="0" autoComplete="off" className={inputClass('clientCredit')} />
                  </div>
                  <ErrorMsg field="clientCredit" />
                </div>

                {/* RUT + Código CIU */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>RUT</Label>
                    <div className="relative">
                      <FIcon icon={FileText} />
                      <select name="rut" value={formData.rut} onChange={handleChange} onBlur={handleBlur} className={selectClass('rut')}>
                        <option value="">Seleccione</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>
                    <ErrorMsg field="rut" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label>Código CIU</Label>
                    <div className="relative">
                      <FIcon icon={Hash} />
                      <input type="text" name="ciuCode" value={formData.ciuCode} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: 4669" autoComplete="off" className={inputClass('ciuCode')} />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
              {/* Botón gráfica — solo en modo editar, mismo estilo que InfoClient */}
              {client ? (
                <button
                  type="button"
                  onClick={() => setShowGraph(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#004D77] border border-[#004D77]/30 rounded-lg hover:bg-[#004D77]/5 hover:border-[#004D77] transition-all cursor-pointer"
                >
                  <BarChart2 className="w-3.5 h-3.5" strokeWidth={2} />
                  {showGraph ? 'Ocultar gráfica' : 'Ver gráfica'}
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { resetForm(); onClose(); }}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
                >
                  {client ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Panel gráfica — animado igual que InfoClient ──────────────────── */}
        <div
          className="overflow-hidden shrink-0 transition-all duration-500 ease-in-out border-l border-gray-100"
          style={{ width: showGraph ? '50%' : '0%', opacity: showGraph ? 1 : 0 }}
        >
          <div className="w-full h-full flex flex-col" style={{ minWidth: '360px' }}>
            {client && <GraphClient clientStartDate={client.clientSince || '07/05/2023'} />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FormClient;