import { X, User, Mail, Phone, ShieldCheck, Loader2, UserPlus, BadgeCheck } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAlert } from '../../../shared/alerts/useAlert';
import { useAuth } from '../../../access/context/AuthContext';
import { checkEmailAvailability } from '../../../access/services/authService';
import FormSelect from '../../../shared/FormSelect';
import {
  UserService,
  getApiFieldErrors,
  getUserActionErrorMessage,
} from '../services/userService';
import { listRoles } from '../services/listRoles.service';
import { isSelfUser } from '../helpers/selfUser';
import {
  PHONE_MIN,
  PHONE_MAX,
  USER_NAME_MAX,
  USER_EMAIL_MAX,
  normalizeDigits,
  normalizeEmailInput,
  normalizeFullNameInput,
  toTitleCaseName,
} from '../validators/usersValidators';

const validateField = (name, value) => {
  if (name === 'nombreCompleto') {
    if (!value.trim()) return 'El nombre completo es obligatorio.';
    if (value.trim().length < 3) return 'Minimo 3 caracteres.';
    if (value.trim().length > USER_NAME_MAX) return `Maximo ${USER_NAME_MAX} caracteres.`;
    if (!/^[\p{L}\s]+$/u.test(value)) return 'Solo letras y espacios.';
    return null;
  }
  if (name === 'correo') {
    if (!value.trim()) return 'El correo es obligatorio.';
    if (value.trim().length > USER_EMAIL_MAX) return `Maximo ${USER_EMAIL_MAX} caracteres.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo invalido.';
    return null;
  }
  if (name === 'telefono') {
    const digits = String(value ?? '').replace(/\D/g, '');
    if (!digits) return 'El telefono es obligatorio.';
    if (digits.length < PHONE_MIN || digits.length > PHONE_MAX) {
      return `Minimo ${PHONE_MIN} digitos, maximo ${PHONE_MAX}.`;
    }
    return null;
  }
  if (name === 'rol') return null;
  return null;
};

const validateUserForm = (form) => {
  const errors = {};
  errors.nombreCompleto = validateField('nombreCompleto', form.nombreCompleto);
  errors.correo = validateField('correo', form.correo);
  errors.telefono = validateField('telefono', form.telefono);
  return Object.fromEntries(Object.entries(errors).filter((entry) => entry[1]));
};

const getMissingUserFieldsLabel = (validationErrors) => {
  const fields = [];

  if (validationErrors.nombreCompleto) fields.push('nombre');
  if (validationErrors.correo) fields.push('correo');
  if (validationErrors.telefono) fields.push('telefono');

  if (fields.length === 0) return '';
  if (fields.length === 1) return fields[0];
  if (fields.length === 2) return `${fields[0]} y ${fields[1]}`;

  return `${fields.slice(0, -1).join(', ')} y ${fields.at(-1)}`;
};

const buildSanitizedInputValue = (target, input, sanitizer) => {
  const value = String(target.value ?? '');
  const start = target.selectionStart ?? value.length;
  const end = target.selectionEnd ?? value.length;
  return sanitizer(`${value.slice(0, start)}${input}${value.slice(end)}`);
};

const getInitialForm = (userToEdit = null) => ({
  nombreCompleto: userToEdit?.name ?? '',
  correo: userToEdit?.email ?? '',
  telefono: userToEdit?.phone ?? '',
  rol: String(userToEdit?.role?.idRole ?? userToEdit?.role?.id ?? ''),
});

const EMAIL_AVAILABILITY = {
  IDLE: 'idle',
  CHECKING: 'checking',
  AVAILABLE: 'available',
  DUPLICATED: 'duplicated',
  ERROR: 'error',
};

function FormUser({
  userToEdit = null,
  isOpen = false,
  origin = null,
  onClose,
  onSaved,
  onMakeClient,
}) {
  const { showWarning, showSuccess, showConfirm } = useAlert();
  const { user: authUser } = useAuth();

  const isEditing = userToEdit !== null;
  const isSelfEdit = isEditing && isSelfUser(userToEdit, authUser);
  const isClientUser = isEditing && userToEdit?.isClient === true;

  const [visible, setVisible] = useState(false);
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : 'center center';

  const [form, setForm] = useState(() => getInitialForm(userToEdit));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingUnique, setCheckingUnique] = useState({
    correo: false,
  });
  const [emailAvailability, setEmailAvailability] = useState(EMAIL_AVAILABILITY.IDLE);
  const [emailCheckRetry, setEmailCheckRetry] = useState(0);

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const roleOptions = useMemo(() => [
    { value: '', label: 'Cliente' },
    ...roles.map((role) => ({
      value: String(role.idRole ?? role.id),
      label: role.nameRole ?? role.name,
    })),
  ], [roles]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return undefined;
    }

    setForm(getInitialForm(userToEdit));
    setErrors({});
    setTouched({});
    setCheckingUnique({ correo: false });
    setEmailAvailability(EMAIL_AVAILABILITY.IDLE);
    setEmailCheckRetry(0);

    const animationId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(animationId);
  }, [isOpen, userToEdit]);

  const animatedClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  const isOriginalEmailUnchanged = useCallback((value) => (
    isEditing &&
    normalizeEmailInput(userToEdit?.email) === normalizeEmailInput(value)
  ), [isEditing, userToEdit?.email]);

  const getEmailAvailabilityError = useCallback(async (value) => {
    const localError = validateField('correo', value);
    if (localError) return '';

    const nextEmail = normalizeEmailInput(value);
    if (isOriginalEmailUnchanged(nextEmail)) return '';

    const data = await checkEmailAvailability(nextEmail);
    return data?.exists ? 'El correo ya esta registrado' : '';
  }, [isOriginalEmailUnchanged]);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);

      try {
        const rolesFromApi = await listRoles();
        setRoles(rolesFromApi);
      } catch (error) {
        console.error('Error cargando roles:', error);
        showWarning('Error', 'No se pudieron cargar los roles.');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [showWarning]);

  const loadUsersForDuplicateCheck = async () => {
    const firstPage = await UserService.list(1, 100, '');
    const totalPages = Number(firstPage.pagination?.totalPages || 1);
    if (totalPages <= 1) return firstPage.users;

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => (
        UserService.list(index + 2, 100, '')
      )),
    );

    return [
      ...firstPage.users,
      ...remainingPages.flatMap((result) => result.users),
    ];
  };

  const findDuplicateUser = async (field, value) => {
    const normalizedValue = field === 'correo'
      ? normalizeEmailInput(value)
      : normalizeDigits(value, PHONE_MAX);
    if (!normalizedValue) return null;

    const users = await loadUsersForDuplicateCheck();
    return users.find((user) => {
      const sameUser = isEditing && Number(user.id) === Number(userToEdit?.id);
      if (sameUser) return false;

      if (field === 'correo') {
        return normalizeEmailInput(user.email) === normalizedValue;
      }

      return normalizeDigits(user.phone, PHONE_MAX) === normalizedValue;
    }) || null;
  };

  const GET_DUPLICATE_USER_ERROR = async (field, value) => {
    const localError = validateField(field, value);
    if (localError) return '';

    const duplicate = await findDuplicateUser(field, value);
    if (!duplicate) return '';

    return field === 'correo'
      ? 'Este correo ya esta registrado.'
      : 'Este telefono ya esta registrado.';
  };

  void GET_DUPLICATE_USER_ERROR;

  useEffect(() => {
    if (!isOpen || !touched.correo) {
      setEmailAvailability(EMAIL_AVAILABILITY.IDLE);
      return undefined;
    }

    const localError = validateField('correo', form.correo);
    if (localError) {
      setCheckingUnique((prev) => ({ ...prev, correo: false }));
      setEmailAvailability(EMAIL_AVAILABILITY.IDLE);
      return undefined;
    }

    if (isOriginalEmailUnchanged(form.correo)) {
      setCheckingUnique((prev) => ({ ...prev, correo: false }));
      setEmailAvailability(EMAIL_AVAILABILITY.IDLE);
      setErrors((prev) => ({ ...prev, correo: '' }));
      return undefined;
    }

    let cancelled = false;
    setCheckingUnique((prev) => ({ ...prev, correo: true }));
    setEmailAvailability(EMAIL_AVAILABILITY.CHECKING);

    const timer = window.setTimeout(async () => {
      try {
        const duplicateError = await getEmailAvailabilityError(form.correo);
        if (cancelled) return;

        setEmailAvailability(
          duplicateError
            ? EMAIL_AVAILABILITY.DUPLICATED
            : EMAIL_AVAILABILITY.AVAILABLE,
        );
        setErrors((prev) => ({
          ...prev,
          correo: validateField('correo', form.correo) || duplicateError || '',
        }));
      } catch (error) {
        if (cancelled) return;

        console.error('Error verificando correo:', error);
        setEmailAvailability(EMAIL_AVAILABILITY.ERROR);
      } finally {
        if (!cancelled) {
          setCheckingUnique((prev) => ({ ...prev, correo: false }));
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [emailCheckRetry, form.correo, getEmailAvailabilityError, isOpen, isOriginalEmailUnchanged, touched.correo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    let forcedError = '';

    if (name === 'telefono') {
      filtered = normalizeDigits(value, PHONE_MAX);
      if (/\D/.test(String(value))) forcedError = 'Solo se permiten numeros.';
    } else if (name === 'nombreCompleto') {
      const lettersOnly = value.replace(/[^\p{L}\s]/gu, '');
      filtered = normalizeFullNameInput(lettersOnly).slice(0, USER_NAME_MAX);
      if (value !== lettersOnly) forcedError = 'Solo letras y espacios.';
    } else if (name === 'correo') {
      filtered = normalizeEmailInput(value).slice(0, USER_EMAIL_MAX);
    }

    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = forcedError || validateField(name, filtered);
    setErrors((prev) => ({ ...prev, [name]: errorMsg || '' }));
  };

  const handleNumericBeforeInput = (e) => {
    if (!e.data || /^\d+$/.test(e.data)) return;
    e.preventDefault();
    const fieldName = e.currentTarget?.name || e.target?.name;
    if (!fieldName) return;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => ({ ...prev, [fieldName]: 'Solo se permiten numeros.' }));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const filtered = buildSanitizedInputValue(
      e.currentTarget,
      e.clipboardData.getData('text'),
      (value) => normalizeDigits(value, PHONE_MAX),
    );
    const errorMsg = validateField('telefono', filtered);

    setForm((prev) => ({ ...prev, telefono: filtered }));
    setTouched((prev) => ({ ...prev, telefono: true }));
    setErrors((prev) => ({ ...prev, telefono: errorMsg || '' }));
  };

  const handleEmailBeforeInput = (e) => {
    if (!e.data || !/\s/.test(e.data)) return;
    e.preventDefault();
    setTouched((prev) => ({ ...prev, [e.currentTarget.name]: true }));
    setErrors((prev) => ({ ...prev, [e.currentTarget.name]: 'El correo no debe contener espacios.' }));
  };

  const handleEmailPaste = (e) => {
    e.preventDefault();
    const filtered = buildSanitizedInputValue(
      e.currentTarget,
      e.clipboardData.getData('text'),
      (value) => normalizeEmailInput(value).slice(0, USER_EMAIL_MAX),
    );
    const errorMsg = validateField('correo', filtered);

    setForm((prev) => ({ ...prev, correo: filtered }));
    setTouched((prev) => ({ ...prev, correo: true }));
    setErrors((prev) => ({ ...prev, correo: errorMsg || '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name !== 'nombreCompleto') return;

    const formattedName = toTitleCaseName(form.nombreCompleto).slice(0, USER_NAME_MAX);
    const updatedForm = { ...form, nombreCompleto: formattedName };

    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, nombreCompleto: true }));
    setErrors((prev) => ({
      ...prev,
      nombreCompleto: validateField('nombreCompleto', formattedName) || '',
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (isSelfEdit) {
      showWarning(
        'Accion no permitida',
        'No puedes editar tu propio usuario desde este modulo. Usa la seccion de perfil.',
      );
      return;
    }

    const normalizedForm = {
      ...form,
      nombreCompleto: toTitleCaseName(form.nombreCompleto).slice(0, USER_NAME_MAX),
      correo: normalizeEmailInput(form.correo).slice(0, USER_EMAIL_MAX),
      telefono: normalizeDigits(form.telefono, PHONE_MAX),
    };
    setForm(normalizedForm);

    const allTouched = Object.keys(normalizedForm).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const newErrors = validateUserForm(normalizedForm);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      return;
    }

    const duplicateEmailError = await getEmailAvailabilityError(normalizedForm.correo);
    if (duplicateEmailError) {
      setErrors((prev) => ({ ...prev, correo: duplicateEmailError }));
      setTouched((prev) => ({ ...prev, correo: true }));
      showWarning('Datos ya registrados', 'Revisa los campos marcados en rojo.');
      return;
    }

    const userData = {
      name: normalizedForm.nombreCompleto,
      email: normalizedForm.correo,
      phone: normalizedForm.telefono ? Number(normalizedForm.telefono) : null,
      roleId: normalizedForm.rol ? Number(normalizedForm.rol) : null,
    };

    setIsSubmitting(true);
    try {
      let savedUser;

      if (isEditing) {
        savedUser = await UserService.update(userToEdit.id, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          roleId: userData.roleId,
        });
        showSuccess('Usuario actualizado', 'Los datos han sido guardados.');
      } else {
        const createdUser = await UserService.create(userData);
        savedUser = createdUser;

        if (createdUser.warningCode === 'EMAIL_SEND_ERROR') {
          showWarning(
            'Usuario creado',
            createdUser.warning || 'El usuario fue registrado, pero no se pudo enviar la contrasena temporal al correo.',
          );
        } else {
          showSuccess(
            'Usuario creado',
            'El usuario ha sido registrado. Se ha enviado una contrasena temporal al correo.',
          );
        }
      }
      await onSaved?.(savedUser);
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);

      if (fieldErrors.email) {
        setTouched((prev) => ({ ...prev, correo: true }));
        setErrors((prev) => ({
          ...prev,
          correo: fieldErrors.email,
        }));
      }

      const mensaje = getUserActionErrorMessage(error);
      showWarning('Error', mensaje);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeClient = () => {
    if (!isEditing || isClientUser) return;

    const normalizedForm = {
      ...form,
      nombreCompleto: toTitleCaseName(form.nombreCompleto).slice(0, USER_NAME_MAX),
      correo: normalizeEmailInput(form.correo).slice(0, USER_EMAIL_MAX),
      telefono: normalizeDigits(form.telefono, PHONE_MAX),
    };
    const validationErrors = validateUserForm(normalizedForm);
    const hasRequiredUserData = !validationErrors.nombreCompleto
      && !validationErrors.correo
      && !validationErrors.telefono;

    if (!hasRequiredUserData) {
      setForm(normalizedForm);
      setTouched((prev) => ({
        ...prev,
        nombreCompleto: true,
        correo: true,
        telefono: true,
      }));
      setErrors((prev) => ({
        ...prev,
        ...validationErrors,
      }));
      const missingFieldsLabel = getMissingUserFieldsLabel(validationErrors);
      showWarning(
        'Completa el usuario primero',
        `Antes de crear el cliente, debes completar y guardar ${missingFieldsLabel} en el usuario.`,
      );
      return;
    }

    if (isDirty) {
      showWarning(
        'Guarda los cambios primero',
        'Para continuar con la creacion del cliente, primero guarda los cambios realizados en el usuario.',
      );
      return;
    }

    onMakeClient?.(userToEdit);
  };

  const isDirty = useMemo(() => {
    if (isEditing) {
      return (
        form.nombreCompleto !== (userToEdit?.name ?? '') ||
        normalizeEmailInput(form.correo) !== normalizeEmailInput(userToEdit?.email) ||
        form.telefono !== (userToEdit?.phone ?? '') ||
        form.rol !== String(userToEdit?.role?.idRole ?? userToEdit?.role?.id ?? '')
      );
    }
    return (
      form.nombreCompleto.trim() !== '' ||
      form.correo.trim() !== '' ||
      form.telefono.trim() !== ''
    );
  }, [form, isEditing, userToEdit]);

  const handleCancel = async () => {
    if (!isDirty) {
      animatedClose();
      return;
    }
    const confirmed = await showConfirm(
      'warning',
      'Salir sin guardar?',
      'Los cambios no guardados se perderan.',
      { confirmButtonText: 'Si, salir', cancelButtonText: 'Continuar editando' },
    );
    if (confirmed?.isConfirmed) animatedClose();
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const ErrorMsg = ({ field }) =>
    touched[field] && errors[field] ? <p className="mt-0.5 text-xs text-red-500">{errors[field]}</p> : null;

  const EmailAvailabilityMsg = () => {
    if (!touched.correo) return null;

    if (errors.correo) {
      return <p className="mt-0.5 text-xs text-red-500">{errors.correo}</p>;
    }

    if (emailAvailability === EMAIL_AVAILABILITY.CHECKING) {
      return <p className="mt-0.5 text-xs text-[#004D77]">Verificando disponibilidad del correo...</p>;
    }

    if (emailAvailability === EMAIL_AVAILABILITY.AVAILABLE) {
      return <p className="mt-0.5 text-xs text-green-600">Correo disponible.</p>;
    }

    if (emailAvailability === EMAIL_AVAILABILITY.ERROR) {
      return (
        <div className="mt-0.5 flex items-center gap-2 text-xs text-amber-600">
          <span>No se pudo verificar el correo.</span>
          <button
            type="button"
            onClick={() => setEmailCheckRetry((current) => current + 1)}
            className="font-semibold underline underline-offset-2 hover:text-amber-700 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return null;
  };

  const hasBlockingErrors = Boolean(errors.correo || errors.telefono || errors.nombreCompleto);
  const isEmailAvailabilityBlocking = [
    EMAIL_AVAILABILITY.CHECKING,
    EMAIL_AVAILABILITY.DUPLICATED,
    EMAIL_AVAILABILITY.ERROR,
  ].includes(emailAvailability);
  const isSubmitDisabled = isSubmitting || checkingUnique.correo || hasBlockingErrors || isEmailAvailabilityBlocking;

  if (!isOpen) return null;

  return (
    <div
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-stretch justify-center bg-white sm:items-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin,
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-md sm:rounded-lg md:max-w-lg
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        <div className="flex items-center justify-between bg-[#004D77] px-4 py-4 shrink-0 sm:px-6">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="text"
                name="nombreCompleto"
                value={form.nombreCompleto}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Min. 3 letras"
                autoComplete="off"
                maxLength={USER_NAME_MAX}
                className={inputClass('nombreCompleto')}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Maximo {form.nombreCompleto.length}/{USER_NAME_MAX} caracteres.
            </p>
            <ErrorMsg field="nombreCompleto" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Correo electronico<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                onBeforeInput={handleEmailBeforeInput}
                onPaste={handleEmailPaste}
                placeholder="usuario@dominio.com"
                autoComplete="off"
                maxLength={USER_EMAIL_MAX}
                className={inputClass('correo')}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Maximo {form.correo.length}/{USER_EMAIL_MAX} caracteres.
            </p>
            <EmailAvailabilityMsg />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Telefono / Celular<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onBeforeInput={handleNumericBeforeInput}
                onPaste={handlePhonePaste}
                onChange={handleChange}
                placeholder={`Entre ${PHONE_MIN} y ${PHONE_MAX} digitos`}
                maxLength={PHONE_MAX}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                className={inputClass('telefono')}
              />
            </div>
            <ErrorMsg field="telefono" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <FormSelect
              value={form.rol}
              options={roleOptions}
              onChange={(value) => handleChange({ target: { name: 'rol', value } })}
              icon={ShieldCheck}
              disabled={loadingRoles}
              error={touched.rol && errors.rol}
              placeholder={loadingRoles ? 'Cargando roles...' : 'Seleccionar rol'}
              ariaLabel="Rol"
            />
          </div>

          {isEditing && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              isClientUser
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-[#004D77]/20 bg-[#004D77]/5 text-gray-700'
            }`}>
              {isClientUser ? (
                <div className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" strokeWidth={1.8} />
                  <div>
                    <p className="font-semibold">Este usuario ya es cliente.</p>
                    <p className="mt-0.5 text-xs text-green-700/80">
                      Ya existe un perfil de cliente asociado a este usuario.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#004D77]">Este usuario aun no es cliente.</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Puedes iniciar el registro de cliente con sus datos actuales.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMakeClient}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c] sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4" strokeWidth={1.8} />
                    Hacer cliente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            onClick={handleCancel}
            className="w-full rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer sm:w-auto"
          >
            Cerrar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer sm:w-auto ${
              isSubmitDisabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#003a5c]'
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? (isSubmitting ? 'Guardando...' : 'Guardar cambios') : (isSubmitting ? 'Creando...' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormUser;
