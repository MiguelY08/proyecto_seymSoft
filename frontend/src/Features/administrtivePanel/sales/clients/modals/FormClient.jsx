import { useState, useEffect, useMemo } from 'react';
import {
  X, ChevronDown, ChevronRight,
  UserCircle, Users, IdCard, MapPin, Phone,
  Mail, UserCheck, CreditCard, ShoppingCart,
  FileText, Hash, BarChart2, TrendingUp, Loader2,
} from 'lucide-react';
import GraphClient from '../components/GraphClient';
import { validateClientForm } from '../helpers/clientHelpers';
import FormSelect from '../../../../shared/FormSelect';
import { useAlert } from '../../../../shared/alerts/useAlert';
import LoadingOverlay from '../../../../shared/LoadingOverlay';

const onlyDigits = (value, maxLength = 10) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

const onlyLetters = (value, maxLength = 80) =>
  String(value ?? '')
    .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLength);

const cleanDocument = (value, documentType) => {
  const maxLength = documentType === 'NIT' ? 20 : 15;
  if (['CC', 'CE', 'NIT'].includes(documentType)) {
    return onlyDigits(value, maxLength);
  }
  return String(value ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, maxLength);
};

const cleanCiuCode = (value) =>
  String(value ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 25);

// Componente Mini Gráfica para el formulario (solo edición) - CON DATOS REALES
function MiniFormGraph({ clientId, onExpand }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [purchasesCache, setPurchasesCache] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadPurchases();
    }
  }, [clientId]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const { clientsService } = await import('../services/clientsService');
      const purchasesData = await clientsService.getClientPurchases(clientId);
      setPurchasesCache(purchasesData);
      
      if (purchasesData && purchasesData.byMonth) {
        const years = [...new Set(purchasesData.byMonth.map(item => item.year))];
        setAvailableYears(years.sort((a, b) => b - a));
        
        const defaultYear = years.length > 0 ? years[0] : new Date().getFullYear();
        setSelectedYear(defaultYear);
        
        const filtered = purchasesData.byMonth.filter(item => item.year === defaultYear);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const completeData = monthNames.map(month => {
          const existing = filtered.find(item => item.month === month);
          return {
            month,
            value: existing ? existing.total : 0,
            year: defaultYear
          };
        });
        
        setData(completeData);
        setTotalValue(purchasesData.total || 0);
      } else {
        setData([]);
        setTotalValue(0);
      }
    } catch (error) {
      console.error('Error al cargar compras del cliente:', error);
      setData([]);
      setTotalValue(0);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (purchasesCache && purchasesCache.byMonth) {
      const filtered = purchasesCache.byMonth.filter(item => item.year === year);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const completeData = monthNames.map(month => {
        const existing = filtered.find(item => item.month === month);
        return {
          month,
          value: existing ? existing.total : 0,
          year
        };
      });
      setData(completeData);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 h-24 flex items-center justify-center mt-1">
        <Loader2 className="w-5 h-5 text-[#004D77] animate-spin" />
        <span className="ml-2 text-xs text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 cursor-pointer hover:shadow-md transition-shadow mt-1" onClick={onExpand}>
        <div className="flex items-center justify-center h-12">
          <p className="text-xs text-gray-400">Sin compras registradas</p>
        </div>
        <p className="text-[9px] text-gray-400 text-center mt-1">
          Haz clic para ver gráfica completa
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 cursor-pointer hover:shadow-md transition-shadow mt-1" onClick={onExpand}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Compras {selectedYear}</p>
          <p className="text-xs font-bold text-[#004D77]">
            ${(totalValue / 1000000).toFixed(0)}M
          </p>
        </div>
        <div className="flex items-center gap-2">
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="text-[9px] px-1 py-0.5 border border-gray-300 rounded bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          <div className="text-gray-400">
            <BarChart2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* Mini gráfica menos larga - h-20 en lugar de h-28 */}
      <div className="flex items-end gap-0.5 h-12">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 bg-[#004D77]/30 hover:bg-[#004D77] transition-all rounded-t cursor-pointer"
            style={{ height: `${(d.value / maxValue) * 44}px` }}
            title={`${d.month}: $${(d.value / 1000000).toFixed(1)}M`}
          />
        ))}
      </div>

      <div className="flex justify-between mt-1 px-0.5">
        {data.map((d, i) => (
          <span key={i} className="text-[7px] text-gray-400">{d.month}</span>
        ))}
      </div>

      <p className="text-[9px] text-gray-400 text-center mt-1">
        Haz clic para ver gráfica completa
      </p>
    </div>
  );
}

function FormClient({ isOpen, onClose, client, onSave }) {
  const [showGraph, setShowGraph] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showConfirm } = useAlert();

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
    saldoFavor:   '',
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
        saldoFavor:   client.saldoFavor   || '', // Ya no tiene '0' por defecto
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

  const isDirty = useMemo(() => {
    const baseData = client
      ? {
          personType: client.personType || '',
          documentType: client.documentType || 'CC',
          document: client.document || '',
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          address: client.address || '',
          phone: client.phone || '',
          email: client.email || '',
          contactName: client.contactName || '',
          contactPhone: client.contactPhone || '',
          clientCredit: client.clientCredit || '',
          saldoFavor: client.saldoFavor || '',
          clientType: client.clientType || '',
          rut: client.rut || '',
          ciuCode: client.ciuCode || '',
        }
      : initialState;

    return Object.keys(initialState).some(
      (key) => String(formData[key] ?? '') !== String(baseData[key] ?? '')
    );
  }, [client, formData]);

  const handleClose = async () => {
    if (saving) return;

    if (!isDirty) {
      resetForm();
      onClose();
      return;
    }

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
    if (name === 'phone' || name === 'contactPhone') {
      nextValue = onlyDigits(value, 10);
    }
    if (name === 'firstName' || name === 'lastName' || name === 'contactName') {
      nextValue = onlyLetters(value, name === 'contactName' ? 100 : 80);
    }
    if (name === 'document') {
      nextValue = cleanDocument(value, formData.documentType);
    }
    if (name === 'ciuCode') {
      nextValue = cleanCiuCode(value);
    }

    let newFormData = { ...formData, [name]: nextValue };

    // ============================================
    // VALIDACIÓN PARA clientCredit y saldoFavor
    // ============================================
    if (name === 'clientCredit' || name === 'saldoFavor') {
      const formattedValue = formatNumericValue(nextValue);
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
    setTouched((prev) => {
      const next = { ...prev, [name]: true };
      if (name === 'personType') next.documentType = true;
      if (name === 'rut') next.ciuCode = true;
      return next;
    });

    const validationErrors = validateClientForm(newFormData);
    const fieldsToRefresh = [name];
    if (name === 'personType') fieldsToRefresh.push('documentType');
    if (name === 'rut') fieldsToRefresh.push('ciuCode');

    setErrors((prev) => {
      const next = { ...prev };
      fieldsToRefresh.forEach((field) => {
        next[field] = validationErrors[field] || '';
      });
      if (name === 'clientCredit' || name === 'saldoFavor') {
        next[name] = validateNumeric10_2(
          newFormData[name],
          name === 'clientCredit' ? 'Crédito cliente' : 'Saldo a favor'
        );
      }
      if (name === 'ciuCode') {
        next.ciuCode = validateCiuCode(newFormData.ciuCode, newFormData.rut);
      }
      return next;
    });
  };

  const handleSelectChange = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    handleChange({ target: { name, value } });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'clientCredit' || name === 'saldoFavor') {
      const numericError = validateNumeric10_2(formData[name], name === 'clientCredit' ? 'Crédito cliente' : 'Saldo a favor');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos numéricos
    const creditError = validateNumeric10_2(formData.clientCredit, 'Crédito cliente');
    const saldoError = validateNumeric10_2(formData.saldoFavor, 'Saldo a favor');

    if (creditError || saldoError) {
      setErrors({
        ...errors,
        clientCredit: creditError || '',
        saldoFavor: saldoError || ''
      });
      setTouched(prev => ({ ...prev, clientCredit: true, saldoFavor: true }));
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
      saldoFavor: formData.saldoFavor || '',
      rut: formData.rut,
      ciuCode: formData.rut === 'no' ? '' : (formData.ciuCode || '')
    };

    try {
      setSaving(true);
      await onSave?.(submitData);
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const liveValidationErrors = validateClientForm(formData);
  const hasLiveErrors =
    Object.keys(liveValidationErrors).length > 0 ||
    Boolean(validateNumeric10_2(formData.clientCredit, 'Crédito cliente')) ||
    Boolean(validateNumeric10_2(formData.saldoFavor, 'Saldo a favor')) ||
    Boolean(validateCiuCode(formData.ciuCode, formData.rut));

  if (!isOpen) return null;

  const inputClass = (field) =>
    `h-9 w-full px-3 py-0 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const disabledInputClass = (field) =>
    `h-9 w-full px-3 py-0 text-sm border rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed ${
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
  const personTypeOptions = [
    { value: '', label: 'Selecciona una opción' },
    { value: 'natural', label: 'Persona Natural' },
    { value: 'juridica', label: 'Persona Jurídica' },
  ];
  const documentTypeOptions = formData.personType === 'juridica'
    ? [{ value: 'NIT', label: 'NIT' }]
    : [
        { value: 'CC', label: 'CC' },
        { value: 'CE', label: 'CE' },
        { value: 'NIT', label: 'NIT' },
      ];
  const clientTypeOptions = [
    { value: '', label: 'Selecciona una opción' },
    { value: 'Detal', label: 'Detal' },
    { value: 'Mayorista', label: 'Mayorista' },
    { value: 'Colegas', label: 'Colegas' },
    { value: 'Por paca', label: 'Por paca' },
  ];
  const rutOptions = [
    { value: '', label: 'Seleccione' },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden flex transition-all duration-500 ease-in-out ${
        showGraph ? 'w-[95vw] max-w-325' : 'w-full max-w-2xl'
      }`}>
        <LoadingOverlay show={saving} message={isEditing ? 'Actualizando cliente...' : 'Creando cliente...'} />

        {/* Panel izquierdo - sin borde derecho blanco */}
        <div
          className="flex flex-col min-w-0 border-r-0"
          style={{ width: showGraph ? '50%' : '100%', transition: 'width 500ms ease-in-out' }}
        >
          {/* CABECERA - sin línea blanca */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#004D77] shrink-0">
            <h2 className="text-white font-semibold text-lg">
              {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
              disabled={saving}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {isEditing && (
              <div className="mx-5 mt-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800">
                Modo edición: puedes actualizar contacto, crédito, tipo de cliente, RUT y CIU. La identificación queda protegida.
              </div>
            )}
            <div className="px-5 py-1.5 grid grid-cols-2 gap-x-4 gap-y-0">

              {/* COLUMNA IZQUIERDA */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="flex flex-col gap-1">
                  <Label required>Tipo de persona</Label>
                  <FormSelect
                    value={formData.personType}
                    options={personTypeOptions}
                    onChange={(value) => handleSelectChange('personType', value)}
                    disabled={isEditing}
                    error={errors.personType && touched.personType}
                    placeholder="Selecciona una opción"
                    ariaLabel="Tipo de persona"
                    className="h-9 py-0"
                  />
                  <ErrorMsg field="personType" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <Label>Tipo<span className="text-red-500">*</span></Label>
                    <FormSelect
                      value={formData.documentType}
                      options={documentTypeOptions}
                      onChange={(value) => handleSelectChange('documentType', value)}
                      disabled={isEditing || formData.personType === 'juridica'}
                      error={errors.documentType && touched.documentType}
                      placeholder="Tipo"
                      ariaLabel="Tipo de documento"
                      className="h-9 py-0"
                    />
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
              <div className="flex flex-col gap-1.5">
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
                  <FormSelect
                    value={formData.clientType}
                    options={clientTypeOptions}
                    onChange={(value) => handleSelectChange('clientType', value)}
                    error={errors.clientType && touched.clientType}
                    placeholder="Selecciona una opción"
                    ariaLabel="Tipo de cliente"
                    className="h-9 py-0"
                  />
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

                <div className="flex flex-col gap-1">
                  <Label>Saldo a favor</Label>
                  <input
                    type="text"
                    name="saldoFavor"
                    value={formData.saldoFavor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0"
                    autoComplete="off"
                    className={inputClass('saldoFavor')}
                  />
                  <ErrorMsg field="saldoFavor" />
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label required>RUT</Label>
                    <FormSelect
                      value={formData.rut}
                      options={rutOptions}
                      onChange={(value) => handleSelectChange('rut', value)}
                      error={errors.rut && touched.rut}
                      placeholder="Seleccione"
                      ariaLabel="RUT"
                      className="h-9 py-0"
                    />
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
                    <ErrorMsg field="ciuCode" />
                  </div>
                </div>

                {/* MINI GRÁFICA - SOLO EN MODO EDICIÓN (toggle) CON DATOS REALES */}
                {isEditing && (
                  <MiniFormGraph clientId={client?.id} onExpand={() => setShowGraph(!showGraph)} />
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between shrink-0">
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
                  onClick={handleClose}
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || hasLiveErrors}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Panel derecho - Gráfica grande con datos reales */}
        <div
          className="overflow-hidden shrink-0 transition-all duration-500 ease-in-out"
          style={{ width: showGraph ? '50%' : '0%', opacity: showGraph ? 1 : 0 }}
        >
          <div className="w-full h-full flex flex-col" style={{ minWidth: '360px' }}>
            {isEditing && <GraphClient clientId={client?.id} clientStartDate={client?.clientSince || '07/05/2023'} />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FormClient;
