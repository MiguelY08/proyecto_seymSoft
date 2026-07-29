import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, UserRound, X } from 'lucide-react';
import { clientsService } from '../../../administrtivePanel/sales/clients/services/clientsService';
import { getEmailValidationError } from '../../../administrtivePanel/sales/clients/helpers/clientHelpers';
import FormSelect from '../../../shared/FormSelect';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import { useAlert } from '../../../shared/alerts/useAlert';

const splitName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

const onlyDigits = (value, maxLength = 10) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

const onlyLetters = (value, maxLength = 80) =>
  String(value ?? '')
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLength);

const cleanDocument = (value, documentType) => {
  const maxLength = documentType === 'NIT' ? 20 : 15;
  if (documentType === 'NIT') {
    return String(value ?? '').replace(/[^0-9-]/g, '').slice(0, maxLength);
  }
  return onlyDigits(value, maxLength);
};

const cleanCiuCode = (value) =>
  String(value ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 25);

const validateField = (name, value, form) => {
  const clean = String(value ?? '').trim();

  if (name === 'lastName' && form.personType === 'juridica') return '';

  if (name === 'ciuCode') {
    if (form.rut !== 'si') return '';
    if (!clean) return 'El código CIU es obligatorio cuando tienes RUT';
    if (clean.length < 3) return 'Debe tener al menos 3 caracteres';
    if (clean.length > 25) return 'No puede superar 25 caracteres';
    return '';
  }

  if (['contactName', 'contactPhone'].includes(name) && !clean) {
    const pair = name === 'contactName' ? form.contactPhone : form.contactName;
    return pair ? 'Completa también este campo' : '';
  }

  if (!clean) return 'Este campo es obligatorio';

  if (['firstName', 'lastName', 'contactName'].includes(name)) {
    if (clean.length < 2) return 'Mínimo 2 caracteres';
    if (!/^[\p{L}\s'-]+$/u.test(clean)) return 'Usa solo letras';
  }
  if (name === 'email') {
    return getEmailValidationError(value);
  }
  if (['phone', 'contactPhone'].includes(name) && !/^\d{7,10}$/.test(clean)) {
    return 'El teléfono debe contener entre 7 y 10 dígitos numéricos.';
  }
  if (name === 'document' && !/^[A-Za-z0-9-]{6,20}$/.test(clean)) {
    return 'Debe tener entre 6 y 20 caracteres';
  }
  if (name === 'address' && clean.length < 5) return 'Mínimo 5 caracteres';
  return '';
};

const SELECT_OPTIONS = {
  personType: [
    { value: 'natural', label: 'Natural' },
    { value: 'juridica', label: 'Jurídica' },
  ],
  naturalDocument: [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'NIT', label: 'NIT' },
  ],
  legalDocument: [{ value: 'NIT', label: 'NIT' }],
  rut: [
    { value: 'no', label: 'No' },
    { value: 'si', label: 'Sí' },
  ],
};

function CompleteClientProfile({ isOpen, user, onClose, onCreated }) {
  const { showConfirm } = useAlert();
  const initialForm = useMemo(() => {
    const names = splitName(user?.fullName);
    return {
      personType: 'natural',
      documentType: 'CC',
      document: '',
      firstName: names.firstName,
      lastName: names.lastName,
      phone: user?.phone || '',
      email: user?.email || '',
      address: '',
      rut: 'no',
      ciuCode: '',
      contactName: '',
      contactPhone: '',
    };
  }, [user]);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [serverError, setServerError] = useState('');

  const isLegalPerson = form.personType === 'juridica';
  const documentOptions = isLegalPerson
    ? SELECT_OPTIONS.legalDocument
    : SELECT_OPTIONS.naturalDocument;

  const isDirty = useMemo(
    () => Object.keys(initialForm).some(
      (key) => String(form[key] ?? '') !== String(initialForm[key] ?? '')
    ),
    [form, initialForm]
  );

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialForm);
    setErrors({});
    setTouched({});
    setServerError('');
    setCheckingEmail(false);
  }, [initialForm, isOpen]);

  const findClientByEmail = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return null;

    const result = await clientsService.getAll({
      page: 1,
      limit: 10000,
      search: normalizedEmail,
    });

    return (result.data || []).find(
      (client) => String(client.email || '').trim().toLowerCase() === normalizedEmail
    ) || null;
  };

  const getDuplicateEmailError = async (email) => {
    const localError = getEmailValidationError(email);
    if (localError) return '';

    const duplicate = await findClientByEmail(email);
    return duplicate ? 'Este correo ya está registrado' : '';
  };

  useEffect(() => {
    if (!isOpen || !touched.email) return undefined;

    const email = String(form.email || '').trim();
    const localError = getEmailValidationError(form.email);

    if (localError) {
      setCheckingEmail(false);
      return undefined;
    }

    let cancelled = false;
    setCheckingEmail(true);

    const timer = window.setTimeout(async () => {
      try {
        const duplicateError = await getDuplicateEmailError(email);
        if (cancelled) return;

        setErrors((current) => {
          const currentLocalError = getEmailValidationError(form.email);
          if (currentLocalError) return { ...current, email: currentLocalError };
          return { ...current, email: duplicateError };
        });
      } catch {
        if (!cancelled) {
          setErrors((current) => ({
            ...current,
            email: current.email === 'Este correo ya está registrado' ? '' : current.email,
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
  }, [form.email, isOpen, touched.email]);

  if (!isOpen) return null;

  const handleClose = async () => {
    if (submitting) return;
    if (!isDirty) {
      onClose();
      return;
    }

    const confirmed = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      'Los datos que ya escribiste se perderán.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Continuar editando' }
    );

    if (confirmed?.isConfirmed) onClose();
  };

  const updateField = (name, value) => {
    let nextValue = value;
    if (name === 'phone' || name === 'contactPhone') {
      if (/\D/.test(String(value))) {
        setTouched((current) => ({ ...current, [name]: true }));
        setErrors((current) => ({ ...current, [name]: 'El teléfono solo debe contener números' }));
        return;
      }
      nextValue = onlyDigits(value, 10);
    }
    if (name === 'firstName' || name === 'lastName' || name === 'contactName') {
      nextValue = onlyLetters(value, name === 'contactName' ? 100 : 80);
    }
    if (name === 'document') {
      nextValue = cleanDocument(value, form.documentType);
    }
    if (name === 'ciuCode') {
      nextValue = cleanCiuCode(value);
    }

    let nextForm = { ...form, [name]: nextValue };
    if (name === 'personType') {
      nextForm = {
        ...nextForm,
        documentType: nextValue === 'juridica' ? 'NIT' : 'CC',
        lastName: nextValue === 'juridica' ? '' : form.lastName,
      };
    }
    if (name === 'rut' && nextValue === 'no') {
      nextForm.ciuCode = '';
    }

    setForm(nextForm);
    setTouched((current) => ({
      ...current,
      [name]: true,
      ...(name === 'personType' ? { documentType: true, lastName: true } : {}),
      ...(name === 'rut' ? { ciuCode: true } : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: validateField(name, nextValue, nextForm),
      ...(name === 'personType'
        ? {
            documentType: validateField('documentType', nextForm.documentType, nextForm),
            lastName: validateField('lastName', nextForm.lastName, nextForm),
          }
        : {}),
      ...(name === 'rut'
        ? { ciuCode: validateField('ciuCode', nextForm.ciuCode, nextForm) }
        : {}),
      ...(name === 'contactName'
        ? { contactPhone: validateField('contactPhone', nextForm.contactPhone, nextForm) }
        : {}),
      ...(name === 'contactPhone'
        ? { contactName: validateField('contactName', nextForm.contactName, nextForm) }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fieldNames = Object.keys(form);
    const nextErrors = Object.fromEntries(
      fieldNames.map((name) => [name, validateField(name, form[name], form)]),
    );
    setTouched(Object.fromEntries(fieldNames.map((name) => [name, true])));
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const duplicateEmailError = await getDuplicateEmailError(form.email);
    if (duplicateEmailError) {
      setTouched((current) => ({ ...current, email: true }));
      setErrors((current) => ({ ...current, email: duplicateEmailError }));
      return;
    }

    try {
      setSubmitting(true);
      setServerError('');
      const client = await clientsService.createOwnProfile({
        ...form,
        document: form.document.trim(),
        firstName: form.firstName.trim(),
        lastName: isLegalPerson ? '' : form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, ''),
        contactPhone: form.contactPhone.replace(/\D/g, ''),
        ciuCode: form.rut === 'si' ? form.ciuCode.trim() : '',
      });
      onCreated(client);
    } catch (error) {
      setServerError(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          'No fue posible crear tu perfil de cliente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (name) =>
    `h-10 w-full rounded-xl border px-3 py-0 text-sm outline-none transition ${
      touched[name] && errors[name]
        ? 'border-red-400 bg-red-50'
        : 'border-slate-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/10'
    }`;

  const errorMessage = (name) =>
    touched[name] && errors[name] ? (
      <span className="mt-1 block text-[11px] text-red-500">{errors[name]}</span>
    ) : null;

  const renderInput = (name, label, options = {}) => (
    <label className={`flex min-w-0 flex-col gap-1 ${options.full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-xs font-bold text-slate-600">
        {label} {!options.optional && <span className="text-red-500">*</span>}
      </span>
      <input
        type={options.type || 'text'}
        value={options.disabled ? 'No aplica' : form[name]}
        maxLength={options.maxLength}
        disabled={options.disabled}
        onChange={(event) => updateField(name, event.target.value)}
        onBlur={() => updateField(name, form[name])}
        inputMode={['phone', 'contactPhone'].includes(name) ? 'numeric' : undefined}
        pattern={['phone', 'contactPhone'].includes(name) ? '[0-9]*' : undefined}
        className={`${inputClass(name)} ${options.disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
        placeholder={options.placeholder}
      />
      {name === 'email' && checkingEmail && touched.email && !errors.email && (
        <span className="mt-1 block text-[11px] text-[#004D77]">
          Verificando si el correo ya está registrado...
        </span>
      )}
      {errorMessage(name)}
    </label>
  );

  const renderSelect = (name, label, options, fieldOptions = {}) => (
    <label className={`flex min-w-0 flex-col gap-1 ${fieldOptions.full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-xs font-bold text-slate-600">
        {label} <span className="text-red-500">*</span>
      </span>
      <FormSelect
        value={form[name]}
        options={options}
        onChange={(value) => updateField(name, value)}
        error={Boolean(touched[name] && errors[name])}
        ariaLabel={label}
        className="h-10 rounded-xl py-0 pr-10"
        placement="bottom"
      />
      {errorMessage(name)}
    </label>
  );

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm sm:p-3">
      <div className="relative flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-3xl">
        <LoadingOverlay show={submitting} message="Guardando tus datos..." />
        <header className="flex shrink-0 items-center justify-between bg-[#004D77] px-4 py-4 text-white sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl bg-white/15 p-2"><UserRound size={19} /></span>
            <div className="min-w-0">
              <h2 className="truncate font-serif text-xl font-bold">Completa tus datos</h2>
              <p className="text-xs text-white/75">Los necesitamos para registrar tu compra.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full bg-white/15 p-2 transition duration-200 hover:scale-105 hover:bg-white/30 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              Tu perfil se creará automáticamente como cliente <strong>Detal</strong>, sin crédito ni saldo a favor inicial.
            </div>

            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#004D77]">Datos personales</span>
                <div className="h-px flex-1 bg-[#004D77]/15" />
              </div>

              {renderSelect('personType', 'Tipo de persona', SELECT_OPTIONS.personType, { full: true })}

              <div className="grid grid-cols-1 gap-2 sm:col-span-2 min-[360px]:grid-cols-[8rem_1fr]">
                {renderSelect('documentType', 'Tipo', documentOptions)}
                {renderInput('document', 'Documento', { maxLength: 20 })}
              </div>

              {renderInput('firstName', isLegalPerson ? 'Nombre empresa' : 'Nombres', {
                full: isLegalPerson,
                maxLength: 80,
                placeholder: isLegalPerson ? 'Ej: Papelería Magic SAS' : 'Ej: Juan Carlos',
              })}
              {!isLegalPerson && renderInput('lastName', 'Apellidos', {
                maxLength: 80,
                placeholder: 'Ej: Pérez Gómez',
              })}
              {renderInput('phone', 'Teléfono', { type: 'tel', maxLength: 10, placeholder: 'Ej: 3001234567' })}
              {renderInput('address', 'Dirección', { maxLength: 255, placeholder: 'Ej: Calle 10 # 15-25' })}
              {renderInput('email', 'Correo', { full: true, type: 'email', maxLength: 255, placeholder: 'Ej: cliente@email.com' })}

              <div className="mt-1 flex items-center gap-2 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#004D77]">Información adicional</span>
                <div className="h-px flex-1 bg-[#004D77]/15" />
              </div>

              {renderSelect('rut', 'RUT', SELECT_OPTIONS.rut)}
              {renderInput('ciuCode', 'Código CIU', {
                optional: form.rut !== 'si',
                maxLength: 25,
                placeholder: form.rut === 'si' ? 'Ej: 4711' : 'No aplica',
                disabled: form.rut !== 'si',
              })}
              {renderInput('contactName', isLegalPerson ? 'Persona encargada' : 'Persona de contacto', { optional: true, maxLength: 100 })}
              {renderInput('contactPhone', isLegalPerson ? 'Número persona encargada' : 'Teléfono de contacto', {
                optional: true,
                type: 'tel',
                maxLength: 10,
              })}
            </div>

            {serverError && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{serverError}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:border-[#004D77] hover:bg-sky-50 hover:text-[#004D77] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-full bg-[#004D77] px-5 py-2.5 text-xs font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#003d61] hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
            >
              {submitting && <LoaderCircle size={15} className="animate-spin" />}
              {submitting ? 'Guardando...' : 'Guardar y continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteClientProfile;
