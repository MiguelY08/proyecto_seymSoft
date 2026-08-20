import { useState, useEffect, useMemo } from 'react';
import {
  X, ChevronDown, ChevronRight,
  UserCircle, Users, IdCard, MapPin, Phone,
  Mail, UserCheck, CreditCard, ShoppingCart,
  Building2, FileText, Hash, BarChart2, TrendingUp, Loader2,
} from 'lucide-react';
import GraphClient from '../components/GraphClient';
import {
  getDocumentValidationError,
  getEmailValidationError,
  normalizeDocumentKey,
  validateClientForm,
} from '../helpers/clientHelpers';
import FormSelect from '../../../../shared/FormSelect';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { clientsService } from '../services/clientsService';
import { checkEmailAvailability } from '../../../../access/services/authService';

const EMAIL_MAX_LENGTH = 100;
const ADDRESS_MAX_LENGTH = 120;
const CIU_CODE_LENGTH = 4;
const DOCUMENT_MAX_LENGTH = 15;
const NIT_MAX_LENGTH = 20;
const PERSON_NAME_MAX_LENGTH = 80;
const BUSINESS_NAME_MAX_LENGTH = 120;
const CONTACT_NAME_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 10;

const onlyDigits = (value, maxLength = 10) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

const normalizeNameInput = (value) =>
  String(value ?? '')
    .replace(/^\s+/, '')
    .replace(/\s{2,}/g, ' ');

const toTitleCaseName = (value) =>
  normalizeNameInput(value)
    .trim()
    .toLowerCase()
    .replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1));

const normalizeEmailInput = (value) =>
  String(value ?? '').trim().toLowerCase().slice(0, EMAIL_MAX_LENGTH);

const ONLY_LETTERS = (value, maxLength = 80) =>
  String(value ?? '')
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLength);

const CLEAN_COMPANY_NAME = (value, maxLength = 120) =>
  String(value ?? '')
    .replace(/[^\p{L}0-9\s&.,#'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLength);

const CLEAN_DOCUMENT = (value, documentType) => {
  const maxLength = documentType === 'NIT' ? 20 : 15;
  if (documentType === 'NIT') {
    return String(value ?? '').replace(/[^0-9-]/g, '').slice(0, maxLength);
  }
  if (['CC', 'CE', 'NIT'].includes(documentType)) {
    return onlyDigits(value, maxLength);
  }
  return String(value ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, maxLength);
};

const cleanCiuCode = (value) =>
  onlyDigits(value, CIU_CODE_LENGTH);

const cleanAddress = (value) =>
  String(value ?? '')
    .replace(/^\s+/, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, ADDRESS_MAX_LENGTH);

const cleanPersonName = (value, maxLength = 80) =>
  normalizeNameInput(String(value ?? '').replace(/[^\p{L}\s'-]/gu, ''))
    .slice(0, maxLength);

const cleanBusinessName = (value, maxLength = 120) =>
  normalizeNameInput(String(value ?? '').replace(/[^\p{L}0-9\s&.,#'-]/gu, ''))
    .slice(0, maxLength);

const cleanNumericDocument = (value, documentType) =>
  onlyDigits(value, documentType === 'NIT' ? 20 : 15);

const buildSanitizedInputValue = (target, input, sanitizer) => {
  const value = String(target.value ?? '');
  const start = target.selectionStart ?? value.length;
  const end = target.selectionEnd ?? value.length;
  return sanitizer(`${value.slice(0, start)}${input}${value.slice(end)}`);
};

const IconInput = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
    )}
    <input {...props} className={Icon ? `${className} pl-9` : className} />
  </div>
);

const FieldCounter = ({ value, maxLength, hidden = false }) => {
  if (hidden || !maxLength) return null;
  return (
    <span className="mt-0.5 block text-right text-[10px] font-medium leading-none text-slate-400">
      {String(value ?? '').length}/{maxLength}
    </span>
  );
};

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
    } catch {
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
      <div className="mt-1 flex h-24 w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-2">
        <Loader2 className="w-5 h-5 text-[#004D77] animate-spin" />
        <span className="ml-2 text-xs text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="mt-1 w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-2 transition-shadow hover:shadow-md" onClick={onExpand}>
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
    <div className="mt-1 w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-2 transition-shadow hover:shadow-md" onClick={onExpand}>
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
              className="min-w-[58px] cursor-pointer text-[9px] font-semibold px-2 py-0.5 border border-[#004D77]/30 rounded bg-white text-[#004D77] outline-none transition-colors hover:border-[#004D77] focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
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

function FormClient({ isOpen, onClose, client, onSave, initialData = null, linkedUser = null }) {
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

  const getCreateInitialState = () => ({
    ...initialState,
    ...(initialData || {}),
  });

  const [formData, setFormData] = useState(initialState);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingDocument, setCheckingDocument] = useState(false);
  const isEditing = !!client;
  const isLinkedUserFlow = !isEditing && Boolean(linkedUser?.id);
  const isUserOwnedFieldLocked = isLinkedUserFlow && !isEditing;
  const associatedUserSummary = isLinkedUserFlow
    ? {
        fullName: String(linkedUser?.name || '').trim() || 'No registrado',
        email: String(linkedUser?.email || '').trim() || 'No registrado',
        phone: linkedUser?.phone ? String(linkedUser.phone) : 'No registrado',
      }
    : null;
  const linkedUserEmail = normalizeEmailInput(linkedUser?.email);
  const isLinkedUserEmail = (email) => (
    isLinkedUserFlow &&
    linkedUserEmail &&
    normalizeEmailInput(email) === linkedUserEmail
  );

  const getFormValidationErrors = (nextFormData) => {
    const validationErrors = validateClientForm(nextFormData);

    if (isUserOwnedFieldLocked) {
      delete validationErrors.firstName;
      delete validationErrors.lastName;
      delete validationErrors.phone;
      delete validationErrors.email;
    } else if (
      isLinkedUserFlow &&
      nextFormData.personType === 'natural' &&
      !String(nextFormData.lastName || '').trim()
    ) {
      delete validationErrors.lastName;
    }

    return validationErrors;
  };

  const getDuplicateEmailError = async (email) => {
    if (isUserOwnedFieldLocked) return '';

    const localError = getEmailValidationError(email);
    if (localError) return '';

    const currentEmail = String(client?.email || '').trim().toLowerCase();
    const nextEmail = String(email || '').trim().toLowerCase();
    if (currentEmail && currentEmail === nextEmail) return '';
    if (isLinkedUserEmail(nextEmail)) return '';

    const data = await checkEmailAvailability(nextEmail);
    return data?.exists ? 'El correo ya está registrado' : '';
  };

  const findClientByDocument = async (document, documentType) => {
    const normalizedDocument = normalizeDocumentKey(document);
    const normalizedType = String(documentType || '').trim().toUpperCase();
    if (!normalizedDocument || !normalizedType) return null;

    const result = await clientsService.getAll({
      page: 1,
      limit: 10000,
      search: '',
    });

    return (result.data || []).find((item) => {
      const sameClient = client?.id && Number(item.id) === Number(client.id);
      const sameType = String(item.documentType || '').trim().toUpperCase() === normalizedType;
      const sameDocument = normalizeDocumentKey(item.document) === normalizedDocument;
      return sameType && sameDocument && !sameClient;
    }) || null;
  };

  const getDuplicateDocumentError = async (document, documentType) => {
    const localError = getDocumentValidationError(document, documentType);
    if (localError) return '';

    const currentType = String(client?.documentType || '').trim().toUpperCase();
    const currentDocument = normalizeDocumentKey(client?.document);
    const nextType = String(documentType || '').trim().toUpperCase();
    const nextDocument = normalizeDocumentKey(document);
    if (currentType === nextType && currentDocument && currentDocument === nextDocument) return '';

    const duplicate = await findClientByDocument(document, documentType);
    return duplicate ? 'Este documento ya está registrado' : '';
  };

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
      if (!/^\d{4}$/.test(String(value).trim())) {
        return 'El código CIU debe tener exactamente 4 números';
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
        saldoFavor:   client.saldoFavor ?? client.credit_balance ?? '',
        clientType:   client.clientType   || '',
        rut:          client.rut          || '',
        ciuCode:      client.ciuCode      || '',
      });
      setTouched(Object.keys(initialState).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    } else {
      setFormData(getCreateInitialState());
      setTouched({});
    }
    setErrors({});
    setCheckingEmail(false);
    setCheckingDocument(false);
    setShowGraph(false);
  }, [client, isOpen, initialData]);

  useEffect(() => {
    if (isUserOwnedFieldLocked) {
      setCheckingEmail(false);
      setErrors((prev) => ({
        ...prev,
        email: '',
        phone: prev.phone,
      }));
      return undefined;
    }

    if (!isOpen || !touched.email) return undefined;

    const email = String(formData.email || '').trim();
    const localError = getEmailValidationError(formData.email);

    if (localError) {
      setCheckingEmail(false);
      return undefined;
    }

    const currentEmail = String(client?.email || '').trim().toLowerCase();
    if (
      (currentEmail && currentEmail === email.toLowerCase()) ||
      isLinkedUserEmail(email)
    ) {
      setCheckingEmail(false);
      setErrors((prev) => ({
        ...prev,
        email: prev.email === 'Este correo ya está registrado' ? '' : prev.email,
      }));
      return undefined;
    }

    let cancelled = false;
    setCheckingEmail(true);

    const timer = window.setTimeout(async () => {
      try {
        const duplicateError = await getDuplicateEmailError(email);
        if (cancelled) return;

        setErrors((prev) => {
          const currentLocalError = getEmailValidationError(formData.email);
          if (currentLocalError) return { ...prev, email: currentLocalError };
          return { ...prev, email: duplicateError };
        });
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({
            ...prev,
            email: prev.email === 'Este correo ya está registrado' ? '' : prev.email,
          }));
        }
      } finally {
        if (!cancelled) setCheckingEmail(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [client?.email, client?.id, formData.email, isOpen, isUserOwnedFieldLocked, touched.email]);

  useEffect(() => {
    if (!isOpen || isEditing || !touched.document) return undefined;

    const documentValue = String(formData.document || '').trim();
    const localError = getDocumentValidationError(formData.document, formData.documentType);

    if (localError) {
      setCheckingDocument(false);
      setErrors((prev) => ({ ...prev, document: localError }));
      return undefined;
    }

    let cancelled = false;
    setCheckingDocument(true);

    const timer = window.setTimeout(async () => {
      try {
        const duplicateError = await getDuplicateDocumentError(documentValue, formData.documentType);
        if (cancelled) return;

        setErrors((prev) => {
          const currentLocalError = getDocumentValidationError(formData.document, formData.documentType);
          if (currentLocalError) return { ...prev, document: currentLocalError };
          return { ...prev, document: duplicateError };
        });
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({
            ...prev,
            document: prev.document === 'Este documento ya está registrado' ? '' : prev.document,
          }));
        }
      } finally {
        if (!cancelled) setCheckingDocument(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formData.document, formData.documentType, isEditing, isOpen, touched.document]);

  const resetForm = () => {
    setFormData(getCreateInitialState());
    setErrors({});
    setTouched({});
    setCheckingEmail(false);
    setCheckingDocument(false);
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
          saldoFavor: client.saldoFavor ?? client.credit_balance ?? '',
          clientType: client.clientType || '',
          rut: client.rut || '',
          ciuCode: client.ciuCode || '',
        }
      : getCreateInitialState();

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
    let forcedError = '';
    if (isUserOwnedFieldLocked && ['firstName', 'lastName', 'phone', 'email'].includes(name)) {
      return;
    }
    if (name === 'phone' || name === 'contactPhone') {
      if (/\D/.test(String(value))) {
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: 'El teléfono solo debe contener números' }));
        return;
      }
      nextValue = onlyDigits(value, 10);
    }
    if (name === 'firstName' && formData.personType === 'juridica') {
      nextValue = cleanBusinessName(value);
      if (/[^\p{L}0-9\s&.,#'-]/u.test(String(value))) {
        forcedError = 'Solo se permiten letras, números y caracteres básicos.';
      }
    } else if (name === 'firstName' || name === 'lastName' || name === 'contactName') {
      nextValue = cleanPersonName(value, name === 'contactName' ? 100 : 80);
      if (/[^\p{L}\s'-]/u.test(String(value))) {
        forcedError = 'Solo se permiten letras y espacios.';
      }
    }
    if (name === 'document') {
      nextValue = CLEAN_DOCUMENT(value, formData.documentType);
      forcedError = getDocumentValidationError(nextValue, formData.documentType);
    }
    if (name === 'email') {
      nextValue = normalizeEmailInput(value);
    }
    if (name === 'address') {
      nextValue = cleanAddress(value);
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
      newFormData.lastName = '';
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

    const validationErrors = getFormValidationErrors(newFormData);
    const fieldsToRefresh = [name];
    if (name === 'personType') fieldsToRefresh.push('documentType');
    if (name === 'rut') fieldsToRefresh.push('ciuCode');

    setErrors((prev) => {
      const next = { ...prev };
      fieldsToRefresh.forEach((field) => {
        next[field] = validationErrors[field] || '';
      });
      if (forcedError) {
        next[name] = forcedError;
      }
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

  const setRealtimeFieldError = (field, message) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleNumericBeforeInput = (e) => {
    if (isUserOwnedFieldLocked && e.currentTarget.name === 'phone') return;
    if (!e.data || /^\d+$/.test(e.data)) return;
    if (e.currentTarget.name === 'document' && formData.documentType === 'NIT' && e.data === '-') return;
    e.preventDefault();
    setRealtimeFieldError(
      e.currentTarget.name,
      e.currentTarget.name === 'document'
        ? 'El documento solo debe contener números'
        : e.currentTarget.name === 'ciuCode'
          ? 'El código CIU solo debe contener números'
        : 'El teléfono solo debe contener números',
    );
  };

  const handleNumericPaste = (e) => {
    if (isUserOwnedFieldLocked && e.currentTarget.name === 'phone') return;
    e.preventDefault();
    const { name } = e.currentTarget;
    const pastedValue = e.clipboardData.getData('text');

    if ((name === 'phone' || name === 'contactPhone' || name === 'ciuCode') && /\D/.test(pastedValue)) {
      setRealtimeFieldError(
        name,
        name === 'ciuCode' ? 'El código CIU solo debe contener números' : 'El teléfono solo debe contener números',
      );
      return;
    }

    const sanitizer = name === 'document'
      ? (value) => CLEAN_DOCUMENT(value, formData.documentType)
      : name === 'ciuCode'
        ? cleanCiuCode
        : (value) => onlyDigits(value, 10);
    const nextValue = buildSanitizedInputValue(
      e.currentTarget,
      pastedValue,
      sanitizer,
    );
    const newFormData = { ...formData, [name]: nextValue };
    const validationErrors = getFormValidationErrors(newFormData);

    setFormData(newFormData);
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: name === 'document'
        ? getDocumentValidationError(nextValue, formData.documentType)
        : validationErrors[name] || '',
    }));
  };

  const handleEmailBeforeInput = (e) => {
    if (isUserOwnedFieldLocked) return;
    if (!e.data || !/\s/.test(e.data)) return;
    e.preventDefault();
    setRealtimeFieldError(e.currentTarget.name, 'El correo no debe contener espacios.');
  };

  const handleEmailPaste = (e) => {
    if (isUserOwnedFieldLocked) return;
    e.preventDefault();
    const nextValue = buildSanitizedInputValue(
      e.currentTarget,
      e.clipboardData.getData('text'),
      normalizeEmailInput,
    );
    const newFormData = { ...formData, email: nextValue };
    const validationErrors = getFormValidationErrors(newFormData);

    setFormData(newFormData);
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validationErrors.email || '' }));
  };

  const handleSelectChange = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    handleChange({ target: { name, value } });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (isUserOwnedFieldLocked && ['firstName', 'lastName', 'phone', 'email'].includes(name)) {
      return;
    }
    setTouched(prev => ({ ...prev, [name]: true }));

    let blurredFormData = formData;
    if (name === 'firstName' && formData.personType === 'juridica') {
      blurredFormData = { ...formData, firstName: normalizeNameInput(formData.firstName).trim() };
    } else if (name === 'firstName' || name === 'lastName' || name === 'contactName') {
      blurredFormData = { ...formData, [name]: toTitleCaseName(formData[name]) };
    } else if (name === 'email') {
      blurredFormData = { ...formData, email: normalizeEmailInput(formData.email) };
    } else if (name === 'address') {
      blurredFormData = { ...formData, address: cleanAddress(formData.address).trim() };
    } else if (name === 'document') {
      blurredFormData = { ...formData, document: CLEAN_DOCUMENT(formData.document, formData.documentType) };
    } else if (name === 'phone' || name === 'contactPhone') {
      blurredFormData = { ...formData, [name]: onlyDigits(formData[name], 10) };
    }

    if (blurredFormData !== formData) {
      setFormData(blurredFormData);
    }

    if (name === 'clientCredit' || name === 'saldoFavor') {
      const numericError = validateNumeric10_2(blurredFormData[name], name === 'clientCredit' ? 'Crédito cliente' : 'Saldo a favor');
      setErrors(prev => ({ ...prev, [name]: numericError }));
      if (numericError) return;
    }

    if (name === 'ciuCode') {
      const ciuError = validateCiuCode(blurredFormData.ciuCode, blurredFormData.rut);
      setErrors(prev => ({ ...prev, ciuCode: ciuError }));
      if (ciuError) return;
    }

    const validationErrors = getFormValidationErrors(blurredFormData);
    setErrors(prev => ({
      ...prev,
      [name]: name === 'document'
        ? getDocumentValidationError(blurredFormData.document, blurredFormData.documentType)
        : validationErrors[name] || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedFormData = {
      ...formData,
      document: CLEAN_DOCUMENT(formData.document, formData.documentType),
      firstName: isUserOwnedFieldLocked
        ? String(formData.firstName || '').trim()
        : formData.personType === 'juridica'
        ? normalizeNameInput(cleanBusinessName(formData.firstName)).trim()
        : toTitleCaseName(cleanPersonName(formData.firstName)),
      lastName: isUserOwnedFieldLocked
        ? String(formData.lastName || '').trim()
        : formData.personType === 'juridica'
        ? formData.lastName
        : toTitleCaseName(cleanPersonName(formData.lastName)),
      phone: isUserOwnedFieldLocked
        ? String(formData.phone || '').trim()
        : onlyDigits(formData.phone, 10),
      address: cleanAddress(formData.address).trim(),
      email: isUserOwnedFieldLocked
        ? String(formData.email || '').trim()
        : normalizeEmailInput(formData.email),
      contactName: formData.contactName ? toTitleCaseName(cleanPersonName(formData.contactName, 100)) : '',
      contactPhone: onlyDigits(formData.contactPhone, 10),
      ciuCode: formData.rut === 'no' ? '' : cleanCiuCode(formData.ciuCode),
    };

    setFormData(normalizedFormData);

    // Validar campos numéricos
    const creditError = validateNumeric10_2(normalizedFormData.clientCredit, 'Crédito cliente');

    if (creditError) {
      setErrors({
        ...errors,
        clientCredit: creditError || '',
      });
      setTouched(prev => ({ ...prev, clientCredit: true }));
      return;
    }

    const ciuError = validateCiuCode(normalizedFormData.ciuCode, normalizedFormData.rut);
    if (ciuError) {
      setErrors(prev => ({ ...prev, ciuCode: ciuError }));
      setTouched(prev => ({ ...prev, ciuCode: true }));
      return;
    }

    const validationErrors = getFormValidationErrors(normalizedFormData);
    const documentError = getDocumentValidationError(normalizedFormData.document, normalizedFormData.documentType);
    if (documentError) {
      validationErrors.document = documentError;
    } else {
      delete validationErrors.document;
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(Object.keys(normalizedFormData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      return;
    }

    const duplicateEmailError = await getDuplicateEmailError(normalizedFormData.email);
    if (duplicateEmailError) {
      setErrors((prev) => ({ ...prev, email: duplicateEmailError }));
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    const duplicateDocumentError = await getDuplicateDocumentError(
      normalizedFormData.document,
      normalizedFormData.documentType,
    );
    if (documentError || duplicateDocumentError) {
      setErrors((prev) => ({ ...prev, document: documentError || duplicateDocumentError }));
      setTouched((prev) => ({ ...prev, document: true }));
      return;
    }

    const clientOnlyData = {
      personType: normalizedFormData.personType,
      documentType: normalizedFormData.documentType,
      document: normalizedFormData.document,
      address: normalizedFormData.address,
      contactName: normalizedFormData.contactName,
      contactPhone: normalizedFormData.contactPhone,
      clientType: normalizedFormData.clientType,
      clientCredit: normalizedFormData.clientCredit || '0',
      rut: normalizedFormData.rut,
      ciuCode: normalizedFormData.rut === 'no' ? '' : cleanCiuCode(normalizedFormData.ciuCode || ''),
    };
    const submitData = isUserOwnedFieldLocked
      ? clientOnlyData
      : {
          ...clientOnlyData,
          firstName: normalizedFormData.firstName,
          lastName: normalizedFormData.personType === 'juridica' ? 'Empresa' : normalizedFormData.lastName,
          phone: normalizedFormData.phone,
          email: normalizedFormData.email,
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


  if (!isOpen) return null;

  const inputClass = (field) =>
    `h-10 w-full rounded-lg border px-3 py-0 text-sm outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      errors[field] && touched[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-slate-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/10'
    }`;

  const disabledInputClass = (field) =>
    `h-10 w-full rounded-lg border px-3 py-0 text-sm outline-none bg-sky-50 text-[#004D77] cursor-not-allowed ${
      errors[field] && touched[field]
        ? 'border-red-500'
        : 'border-sky-200'
    }`;

  const disabledSelectClass =
    'bg-sky-50 text-[#004D77] border-sky-200 hover:border-sky-200';

  const ErrorMsg = ({ field }) =>
    errors[field] && touched[field]
      ? <p className="mt-0.5 text-xs text-red-500">{errors[field]}</p>
      : null;

  const Label = ({ children, required }) => (
    <label className="flex min-h-8 items-end text-xs font-semibold leading-tight text-gray-600">
      {children}{required && <span className="text-red-500">*</span>}
    </label>
  );

  const hasBlockingErrors = isUserOwnedFieldLocked
    ? Boolean(errors.document)
    : Boolean(errors.email || errors.phone || errors.document);

  const isLegalPerson = formData.personType === 'juridica';
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

  const selectResponsiveProps = {
    dropdownClassName: 'max-sm:w-full',
    maxDropdownWidth: 340,
    placement: 'bottom',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 hidden bg-black/40 backdrop-blur-sm sm:block"
        onClick={handleClose}
      />

      <div className={`relative flex h-dvh w-full min-h-0 overflow-hidden bg-white shadow-2xl transition-all duration-500 ease-in-out sm:h-auto sm:max-h-[94vh] sm:rounded-lg lg:flex-row ${
        showGraph ? 'sm:w-[95vw] sm:max-w-[90rem] max-lg:flex-col' : 'sm:max-w-2xl'
      }`}>
        {/* Panel izquierdo - sin borde derecho blanco */}
        <div
          className={`flex min-h-0 min-w-0 flex-col border-r-0 transition-all duration-500 ease-in-out ${
            showGraph ? 'w-full lg:w-1/2' : 'w-full'
          }`}
        >
          {/* CABECERA - sin línea blanca */}
          <div className="flex shrink-0 items-center justify-between gap-3 bg-[#004D77] px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="min-w-0 text-lg font-semibold leading-tight text-white">
              {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button
              onClick={handleClose}
              className="cursor-pointer rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
              disabled={saving}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {isEditing && (
              <div className="mx-4 mt-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium leading-relaxed text-sky-800 sm:mx-5 sm:py-1.5">
                Modo edición: puedes actualizar contacto, crédito, tipo de cliente, RUT y CIU. La identificación queda protegida.
              </div>
            )}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-4 gap-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 md:grid-cols-2 md:gap-y-3">

              {/* COLUMNA IZQUIERDA */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Datos personales</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>
                {isUserOwnedFieldLocked && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                    Los datos Nombres, Apellidos, Teléfono y Correo pertenecen al usuario asociado y solo pueden editarse desde el módulo de usuarios.
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <Label required>Tipo de persona</Label>
                  <FormSelect
                    value={formData.personType}
                    options={personTypeOptions}
                    onChange={(value) => handleSelectChange('personType', value)}
                    icon={UserCircle}
                    disabled={isEditing}
                    error={errors.personType && touched.personType}
                    placeholder="Selecciona una opción"
                    ariaLabel="Tipo de persona"
                    className={`h-10 rounded-lg py-0 pr-10 ${isEditing ? disabledSelectClass : ''}`}
                    {...selectResponsiveProps}
                  />
                  <ErrorMsg field="personType" />
                </div>

                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-[7rem_1fr]">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label>Tipo<span className="text-red-500">*</span></Label>
                    <FormSelect
                      value={formData.documentType}
                      options={documentTypeOptions}
                      onChange={(value) => handleSelectChange('documentType', value)}
                      icon={IdCard}
                      disabled={isEditing || formData.personType === 'juridica'}
                      error={errors.documentType && touched.documentType}
                      placeholder="Tipo"
                      ariaLabel="Tipo de documento"
                      className={`h-10 rounded-lg py-0 pr-10 ${isEditing || formData.personType === 'juridica' ? disabledSelectClass : ''}`}
                      {...selectResponsiveProps}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label required>Documento</Label>
                    <IconInput
                      icon={IdCard}
                      type="text"
                      name="document"
                      value={formData.document}
                      onChange={handleChange}
                      onBeforeInput={handleNumericBeforeInput}
                      onPaste={handleNumericPaste}
                      onBlur={handleBlur}
                      placeholder="123456789"
                      autoComplete="off"
                      inputMode={formData.documentType === 'NIT' ? 'text' : 'numeric'}
                      pattern={formData.documentType === 'NIT' ? undefined : '[0-9]*'}
                      maxLength={formData.documentType === 'NIT' ? NIT_MAX_LENGTH : DOCUMENT_MAX_LENGTH}
                      className={isEditing ? disabledInputClass('document') : inputClass('document')}
                      disabled={isEditing}
                    />
                    <FieldCounter value={formData.document} maxLength={formData.documentType === 'NIT' ? NIT_MAX_LENGTH : DOCUMENT_MAX_LENGTH} />
                    {checkingDocument && touched.document && !errors.document && (
                      <p className="mt-0.5 text-xs text-[#004D77]">Verificando si el documento ya está registrado...</p>
                    )}
                    <ErrorMsg field="document" />
                  </div>
                </div>

                <div className={`grid grid-cols-1 gap-2 ${isLegalPerson ? '' : 'sm:grid-cols-2'}`}>
                <div className="flex min-w-0 flex-col gap-1">
                  <Label required>{isLegalPerson ? 'Nombre empresa' : 'Nombres'}</Label>
                    <IconInput
                    icon={isLegalPerson ? Building2 : UserCircle}
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={isLegalPerson ? 'Empresa SAS' : 'Juan'}
                    autoComplete="off"
                    maxLength={isLegalPerson ? BUSINESS_NAME_MAX_LENGTH : PERSON_NAME_MAX_LENGTH}
                    className={isEditing || isUserOwnedFieldLocked ? disabledInputClass('firstName') : inputClass('firstName')}
                    disabled={isEditing || isUserOwnedFieldLocked}
                    readOnly={isUserOwnedFieldLocked}
                  />
                  <FieldCounter value={formData.firstName} maxLength={isLegalPerson ? BUSINESS_NAME_MAX_LENGTH : PERSON_NAME_MAX_LENGTH} />
                  <ErrorMsg field="firstName" />
                </div>

                  {!isLegalPerson && (
                <div className="flex min-w-0 flex-col gap-1">
                  <Label required>Apellidos</Label>
                  <IconInput
                    icon={UserCircle}
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Pérez"
                    autoComplete="off"
                    maxLength={PERSON_NAME_MAX_LENGTH}
                    className={isEditing || isUserOwnedFieldLocked ? disabledInputClass('lastName') : inputClass('lastName')}
                    disabled={isEditing || isUserOwnedFieldLocked}
                    readOnly={isUserOwnedFieldLocked}
                  />
                  <FieldCounter value={formData.lastName} maxLength={PERSON_NAME_MAX_LENGTH} />
                  <ErrorMsg field="lastName" />
                </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label required>Teléfono</Label>
                    <IconInput
                      icon={Phone}
                      type="tel"
                      name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBeforeInput={handleNumericBeforeInput}
                    onPaste={handleNumericPaste}
                    onBlur={handleBlur}
                      placeholder="3001234567"
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={PHONE_MAX_LENGTH}
                    className={isUserOwnedFieldLocked ? disabledInputClass('phone') : inputClass('phone')}
                    disabled={isUserOwnedFieldLocked}
                    readOnly={isUserOwnedFieldLocked}
                  />
                  <FieldCounter value={formData.phone} maxLength={PHONE_MAX_LENGTH} />
                  <ErrorMsg field="phone" />
                </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label required>Dirección</Label>
                    <IconInput
                      icon={MapPin}
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Calle 10 # 15-25"
                      autoComplete="off"
                      maxLength={ADDRESS_MAX_LENGTH}
                      className={inputClass('address')}
                    />
                    <FieldCounter value={formData.address} maxLength={ADDRESS_MAX_LENGTH} />
                    <ErrorMsg field="address" />
                  </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <Label required>Correo</Label>
                  <IconInput
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBeforeInput={handleEmailBeforeInput}
                    onPaste={handleEmailPaste}
                    onBlur={handleBlur}
                    placeholder="email@gmail.com"
                    autoComplete="off"
                    maxLength={EMAIL_MAX_LENGTH}
                  className={isUserOwnedFieldLocked ? disabledInputClass('email') : inputClass('email')}
                  disabled={isUserOwnedFieldLocked}
                  readOnly={isUserOwnedFieldLocked}
                />
                <FieldCounter value={formData.email} maxLength={EMAIL_MAX_LENGTH} />
                {checkingEmail && touched.email && !errors.email && (
                  <p className="mt-0.5 text-xs text-[#004D77]">Verificando si el correo ya está registrado...</p>
                )}
                <ErrorMsg field="email" />
              </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-widest">Información adicional</span>
                  <div className="flex-1 h-px bg-[#004D77]/15" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label>{isLegalPerson ? 'Persona encargada' : 'Persona contacto'}</Label>
                    <IconInput
                      icon={UserCheck}
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="María"
                      autoComplete="off"
                      maxLength={CONTACT_NAME_MAX_LENGTH}
                      className={inputClass('contactName')}
                    />
                    <FieldCounter value={formData.contactName} maxLength={CONTACT_NAME_MAX_LENGTH} />
                    <ErrorMsg field="contactName" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label>{isLegalPerson ? 'Numero persona encargada' : 'Tel. contacto'}</Label>
                    <IconInput
                      icon={Phone}
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      onBeforeInput={handleNumericBeforeInput}
                      onPaste={handleNumericPaste}
                      onBlur={handleBlur}
                      placeholder="3009876543"
                      autoComplete="off"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={PHONE_MAX_LENGTH}
                      className={inputClass('contactPhone')}
                    />
                    <FieldCounter value={formData.contactPhone} maxLength={PHONE_MAX_LENGTH} />
                    <ErrorMsg field="contactPhone" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label required>Tipo de cliente</Label>
                  <FormSelect
                    value={formData.clientType}
                    options={clientTypeOptions}
                    onChange={(value) => handleSelectChange('clientType', value)}
                    icon={Users}
                    error={errors.clientType && touched.clientType}
                    placeholder="Selecciona una opción"
                    ariaLabel="Tipo de cliente"
                    className="h-10 rounded-lg py-0 pr-10"
                    {...selectResponsiveProps}
                  />
                  <ErrorMsg field="clientType" />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Crédito cliente</Label>
                  <IconInput
                    icon={CreditCard}
                    type="text"
                    name="clientCredit"
                    value={formData.clientCredit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="100000"
                    autoComplete="off"
                    className={inputClass('clientCredit')}
                  />
                  <ErrorMsg field="clientCredit" />
                </div>

                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <Label>Saldo a favor</Label>
                    <IconInput
                      icon={CreditCard}
                      type="text"
                      name="saldoFavor"
                      value={formData.saldoFavor || '0'}
                      disabled
                      readOnly
                      autoComplete="off"
                      className={disabledInputClass('saldoFavor')}
                    />
                    <p className="text-[11px] text-gray-400">
                      Este valor se actualiza solo con devoluciones de ventas.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label required>RUT</Label>
                    <FormSelect
                      value={formData.rut}
                      options={rutOptions}
                      onChange={(value) => handleSelectChange('rut', value)}
                      icon={FileText}
                      error={errors.rut && touched.rut}
                      placeholder="Seleccione"
                      ariaLabel="RUT"
                      className="h-10 rounded-lg py-0 pr-10"
                      {...selectResponsiveProps}
                    />
                    <ErrorMsg field="rut" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label>Código CIU {formData.rut === 'si' && <span className="text-red-500">*</span>}</Label>
                    <IconInput
                      icon={Hash}
                      type="text"
                      name="ciuCode"
                      value={formData.ciuCode}
                      onChange={handleChange}
                      onBeforeInput={handleNumericBeforeInput}
                      onPaste={handleNumericPaste}
                      onBlur={handleBlur}
                      placeholder={formData.rut === 'si' ? "4711" : "No aplica"}
                      autoComplete="off"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={CIU_CODE_LENGTH}
                      className={formData.rut === 'si' ? inputClass('ciuCode') : disabledInputClass('ciuCode')}
                      disabled={formData.rut === 'no'}
                      readOnly={formData.rut === 'no'}
                    />
                    <FieldCounter value={formData.ciuCode} maxLength={CIU_CODE_LENGTH} hidden={formData.rut === 'no'} />
                    <ErrorMsg field="ciuCode" />
                  </div>
                </div>

              </div>
              {isEditing && (
                <div className="md:col-span-2">
                  <MiniFormGraph clientId={client?.id} onExpand={() => setShowGraph(!showGraph)} />
                </div>
              )}
              {isEditing && showGraph && (
                <div className="md:col-span-2 lg:hidden">
                  <GraphClient clientId={client?.id} clientStartDate={client?.clientSince || '07/05/2023'} />
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setShowGraph(v => !v)}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#004D77]/30 px-3 py-2 text-xs font-semibold text-[#004D77] transition-all hover:border-[#004D77] hover:bg-[#004D77]/5 md:w-auto md:py-1.5"
                >
                  <BarChart2 className="w-3.5 h-3.5" strokeWidth={2} />
                  {showGraph ? 'Ocultar gráfica' : 'Ver gráfica'}
                </button>
              ) : (
                <span className="hidden md:block" />
              )}

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || checkingEmail || checkingDocument || hasBlockingErrors}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#004D77] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
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
          className={`min-h-0 shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
            showGraph
              ? 'hidden border-t border-slate-100 opacity-100 lg:block lg:w-1/2 lg:border-l lg:border-t-0'
              : 'hidden w-0 opacity-0 lg:block'
          }`}
        >
          <div className="flex h-full w-full min-w-0 flex-col">
            {isEditing && <GraphClient clientId={client?.id} clientStartDate={client?.clientSince || '07/05/2023'} />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FormClient;
