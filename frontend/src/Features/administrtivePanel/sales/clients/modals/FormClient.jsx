import { useState, useEffect } from 'react';
import {
  X, ChevronDown, ChevronRight,
  UserCircle, Users, IdCard, MapPin, Phone,
  Mail, UserCheck, CreditCard, ShoppingCart,
  FileText, Hash, BarChart2, TrendingUp,
} from 'lucide-react';
import GraphClient from '../components/GraphClient';
import { validateClientForm } from '../helpers/clientHelpers';

// Componente Mini Gráfica para el formulario (solo edición)
function MiniFormGraph({ onExpand }) {
  const [selectedYear, setSelectedYear] = useState(2024);
  
  const generateMockData = (year) => {
    return [
      { month: 'Ene', value: 30000000 },
      { month: 'Feb', value: 18000000 },
      { month: 'Mar', value: 15000000 },
      { month: 'Abr', value: 7000000 },
      { month: 'May', value: 12000000 },
      { month: 'Jun', value: 13000000 },
      { month: 'Jul', value: 17000000 },
      { month: 'Ago', value: 9000000 },
      { month: 'Sep', value: 6000000 },
      { month: 'Oct', value: 20000000 },
      { month: 'Nov', value: 14000000 },
      { month: 'Dic', value: 19000000 },
    ];
  };
  
  const data = generateMockData(selectedYear);
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow mt-2" onClick={onExpand}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Compras {selectedYear}</p>
          <p className="text-xs font-bold text-[#004D77]">
            ${(totalValue / 1000000).toFixed(0)}M
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-[9px] px-1 py-0.5 border border-gray-300 rounded bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
          <div className="text-gray-400">
            <BarChart2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>
        </div>
      </div>
      
      {/* Gráfica más larga - h-28 (112px) para que parezca el campo de correo */}
      <div className="flex items-end gap-0.5 h-28">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 bg-[#004D77]/30 hover:bg-[#004D77] transition-all rounded-t cursor-pointer"
            style={{ height: `${(d.value / maxValue) * 100}px` }}
            title={`${d.month}: $${(d.value / 1000000).toFixed(1)}M`}
          />
        ))}
      </div>
      
      <div className="flex justify-between mt-1 px-0.5">
        {data.map((d, i) => (
          <span key={i} className="text-[7px] text-gray-400">{d.month}</span>
        ))}
      </div>
      
      <p className="text-[9px] text-gray-400 text-center mt-2">
        Haz clic para ver gráfica completa
      </p>
    </div>
  );
}

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

  // ============================================
  // VALIDACIÓN PARA numeric(10,2) DE POSTGRESQL
  // ============================================
  const formatNumericValue = (value) => {
    if (!value && value !== 0) return '';
    
    let strValue = String(value).trim();
    strValue = strValue.replace(/[^0-9.,-]/g, '');
    
    let isNegative = false;
    if (strValue.startsWith('-')) {
      isNegative = true;
      strValue = strValue.substring(1);
    }
    strValue = strValue.replace(/-/g, '');
    strValue = strValue.replace(/,/g, '.');
    
    const parts = strValue.split('.');
    if (parts.length === 2 && parts[1].length > 2) {
      strValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    if (parts[0] && parts[0].length > 8) {
      parts[0] = parts[0].substring(0, 8);
      strValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    }
    
    if (isNegative && strValue !== '') {
      strValue = '-' + strValue;
    }
    
    return strValue;
  };

  const validateNumeric10_2 = (value, fieldName) => {
    if (!value || value === '') return '';
    
    let numValue = parseFloat(String(value).replace(/,/g, '.'));
    
    if (isNaN(numValue)) {
      return `${fieldName} debe ser un número válido`;
    }
    
    numValue = Math.round(numValue * 100) / 100;
    
    const MAX_VALUE = 99999999.99;
    const MIN_VALUE = -99999999.99;
    
    if (numValue > MAX_VALUE) {
      return `${fieldName} no puede exceder 99,999,999.99`;
    }
    
    if (numValue < MIN_VALUE) {
      return `${fieldName} no puede ser menor a -99,999,999.99`;
    }
    
    const integerPart = Math.floor(Math.abs(numValue)).toString();
    if (integerPart.length > 8) {
      return `${fieldName} no puede tener más de 8 dígitos enteros`;
    }
    
    return '';
  };

  // ============================================
  // VALIDACIÓN PARA CÓDIGO CIU
  // ============================================
  const validateCiuCode = (value, rutValue) => {
    if (rutValue === 'si') {
      if (!value || value.trim() === '') {
        return 'El código CIU es obligatorio cuando RUT es Sí';
      }
      if (value === 'No aplica' || value === 'No disponible') {
        return 'Por favor, ingrese un código CIU válido';
      }
      if (value.length < 3) {
        return 'El código CIU debe tener al menos 3 caracteres';
      }
    }
    return '';
  };

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
    
    let newFormData = { ...formData, [name]: value };
    
    if (name === 'clientCredit') {
      const formattedValue = formatNumericValue(value);
      newFormData[name] = formattedValue;
    }
    
    if (name === 'personType' && value === 'juridica') {
      newFormData.documentType = 'NIT';
    }
    if (name === 'personType' && value === 'natural') {
      newFormData.documentType = 'CC';
    }
    
    if (name === 'rut') {
      if (value === 'si') {
        newFormData.ciuCode = '';
      } else if (value === 'no') {
        newFormData.ciuCode = 'No aplica';
      }
    }
    
    setFormData(newFormData);
    
    if (touched[name]) {
      if (name === 'clientCredit') {
        const numericError = validateNumeric10_2(newFormData[name], 'Crédito cliente');
        setErrors(prev => ({ ...prev, [name]: numericError }));
      } else if (name === 'ciuCode') {
        const ciuError = validateCiuCode(newFormData.ciuCode, newFormData.rut);
        setErrors(prev => ({ ...prev, ciuCode: ciuError }));
      } else {
        const validationErrors = validateClientForm({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (name === 'clientCredit') {
      const numericError = validateNumeric10_2(formData[name], 'Crédito cliente');
      setErrors(prev => ({ ...prev, [name]: numericError }));
      if (numericError) return;
    }
    
    if (name === 'ciuCode') {
      const ciuError = validateCiuCode(formData.ciuCode, formData.rut);
      setErrors(prev => ({ ...prev, ciuCode: ciuError }));
      if (ciuError) return;
    }
    
    const validationErrors = validateClientForm(formData);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const creditError = validateNumeric10_2(formData.clientCredit, 'Crédito cliente');
    
    if (creditError) {
      setErrors({
        ...errors,
        clientCredit: creditError || ''
      });
      setTouched(prev => ({ ...prev, clientCredit: true }));
      return;
    }
    
    const ciuError = validateCiuCode(formData.ciuCode, formData.rut);
    if (ciuError) {
      setErrors(prev => ({ ...prev, ciuCode: ciuError }));
      setTouched(prev => ({ ...prev, ciuCode: true }));
      return;
    }
    
    const validationErrors = validateClientForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      return;
    }
    
    const submitData = {
      personType: formData.personType,
      documentType: formData.documentType,
      document: formData.document,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      clientType: formData.clientType,
      clientCredit: formData.clientCredit || '0',
      rut: formData.rut,
      ciuCode: formData.rut === 'no' ? '' : (formData.ciuCode || '')
    };
    
    console.log('📤 submitData:', JSON.stringify(submitData, null, 2));
    
    onSave?.(submitData);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full px-3 pr-8 py-2 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const disabledInputClass = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-gray-300'
    }`;

  const disabledSelectClass = (field) =>
    `appearance-none w-full px-3 pr-8 py-2 text-sm border rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-gray-300'
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] && touched[field]
      ? <p className="mt-0.5 text-xs text-red-500">{errors[field]}</p>
      : null;

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-600">
      {children}{required && <span className="text-red-500">*</span>}
    </label>
  );

  const isEditing = !!client;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { resetForm(); onClose(); }}
      />

      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden flex transition-all duration-500 ease-in-out ${
        showGraph ? 'w-[95vw] max-w-325' : 'w-full max-w-2xl'
      }`}>

        {/* Panel izquierdo - sin borde derecho blanco */}
        <div
          className="flex flex-col min-w-0 border-r-0"
          style={{ width: showGraph ? '50%' : '100%', transition: 'width 500ms ease-in-out' }}
        >
          {/* CABECERA - sin línea blanca */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
            <h2 className="text-white font-semibold text-lg">
              {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 py-2 grid grid-cols-2 gap-x-4 gap-y-0">

              {/* COLUMNA IZQUIERDA */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex flex-col gap-1">
                  <Label required>Tipo de persona</Label>
                  <div className="relative">
                    <select 
                      name="personType" 
                      value={formData.personType} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      className={isEditing ? disabledSelectClass('personType') : selectClass('personType')}
                      disabled={isEditing}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  </div>
                  {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                  <ErrorMsg field="personType" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <Label>Tipo<span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <select 
                        name="documentType" 
                        value={formData.documentType} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className={(isEditing || formData.personType === 'juridica') ? disabledSelectClass('documentType') : selectClass('documentType')}
                        disabled={isEditing || formData.personType === 'juridica'}
                      >
                        {formData.personType === 'juridica' ? (
                          <option value="NIT">NIT</option>
                        ) : (
                          <>
                            <option value="CC">CC</option>
                            <option value="CE">CE</option>
                            <option value="NIT">NIT</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>Documento</Label>
                    <input 
                      type="text" 
                      name="document" 
                      value={formData.document} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      placeholder="Ej: 123456789" 
                      autoComplete="off" 
                      className={isEditing ? disabledInputClass('document') : inputClass('document')}
                      disabled={isEditing}
                    />
                    {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                    <ErrorMsg field="document" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label required>Nombres</Label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    placeholder="Ej: Juan Carlos" 
                    autoComplete="off" 
                    className={isEditing ? disabledInputClass('firstName') : inputClass('firstName')}
                    disabled={isEditing}
                  />
                  {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                  <ErrorMsg field="firstName" />
                </div>

                <div className="flex flex-col gap-1">
                  <Label required>Apellidos</Label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    placeholder="Ej: Pérez Gómez" 
                    autoComplete="off" 
                    className={isEditing ? disabledInputClass('lastName') : inputClass('lastName')}
                    disabled={isEditing}
                  />
                  {isEditing && <p className="text-xs text-gray-400 mt-0.5">No se puede modificar en edición</p>}
                  <ErrorMsg field="lastName" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>Teléfono</Label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      placeholder="Ej: 3001234567" 
                      autoComplete="off" 
                      className={inputClass('phone')} 
                    />
                    <ErrorMsg field="phone" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>Dirección</Label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      placeholder="Ej: Calle 10 # 15-25" 
                      autoComplete="off" 
                      className={inputClass('address')} 
                    />
                    <ErrorMsg field="address" />
                  </div>
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <Label required>Correo</Label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    placeholder="Ej: cliente@email.com" 
                    autoComplete="off" 
                    className={inputClass('email')} 
                  />
                  <ErrorMsg field="email" />
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Información adicional</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label>Persona contacto</Label>
                    <input 
                      type="text" 
                      name="contactName" 
                      value={formData.contactName} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      placeholder="Ej: María López" 
                      autoComplete="off" 
                      className={inputClass('contactName')} 
                    />
                    <ErrorMsg field="contactName" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label>Tel. contacto</Label>
                    <input 
                      type="tel" 
                      name="contactPhone" 
                      value={formData.contactPhone} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      placeholder="Ej: 3009876543" 
                      autoComplete="off" 
                      className={inputClass('contactPhone')} 
                    />
                    <ErrorMsg field="contactPhone" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label required>Tipo de cliente</Label>
                  <div className="relative">
                    <select 
                      name="clientType" 
                      value={formData.clientType} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      className={selectClass('clientType')}
                    >
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

                <div className="flex flex-col gap-1">
                  <Label>Crédito cliente</Label>
                  <input 
                    type="text" 
                    name="clientCredit" 
                    value={formData.clientCredit} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    placeholder="0" 
                    autoComplete="off" 
                    className={inputClass('clientCredit')} 
                  />
                  <ErrorMsg field="clientCredit" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>RUT</Label>
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
                    <ErrorMsg field="rut" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label>Código CIU {formData.rut === 'si' && <span className="text-red-500">*</span>}</Label>
                    <input 
                      type="text" 
                      name="ciuCode" 
                      value={formData.ciuCode} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      placeholder={formData.rut === 'si' ? "Ej: 1212" : "No aplica"}
                      autoComplete="off" 
                      className={formData.rut === 'si' ? inputClass('ciuCode') : disabledInputClass('ciuCode')}
                      disabled={formData.rut === 'no'}
                      readOnly={formData.rut === 'no'}
                    />
                    {formData.rut === 'no' && (
                      <p className="text-xs text-gray-400 mt-0.5">Automático: No aplica</p>
                    )}
                    <ErrorMsg field="ciuCode" />
                  </div>
                </div>

                {/* MINI GRÁFICA - SOLO EN MODO EDICIÓN (toggle) */}
                {isEditing && (
                  <MiniFormGraph onExpand={() => setShowGraph(!showGraph)} />
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
              {isEditing ? (
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
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Panel derecho - Gráfica grande */}
        <div
          className="overflow-hidden shrink-0 transition-all duration-500 ease-in-out"
          style={{ width: showGraph ? '50%' : '0%', opacity: showGraph ? 1 : 0 }}
        >
          <div className="w-full h-full flex flex-col" style={{ minWidth: '360px' }}>
            {isEditing && <GraphClient clientStartDate={client?.clientSince || '07/05/2023'} />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FormClient;