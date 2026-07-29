import { useNavigate, useLocation } from 'react-router-dom';
import { X, User, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAlert } from '../../../shared/alerts/useAlert';
import { useModalAnimation } from '../../../shared/useModalAnimation';
import { useAuth } from '../../../access/context/AuthContext';
import FormSelect from '../../../shared/FormSelect';
import {
  UserService,
  getUserActionErrorMessage,
} from '../services/userService';
import { listRoles } from '../services/listRoles.service'
import { isSelfUser } from '../helpers/selfUser';
import {
  PHONE_MIN,
  PHONE_MAX,
  normalizeDigits,
  normalizeEmailInput,
  normalizeFullNameInput,
  toTitleCaseName,
} from '../validators/usersValidators';

// Funciones de validación (sin cambios)
const validateField = (name, value) => {
  if (name === 'nombreCompleto') {
    if (!value.trim()) return 'El nombre completo es obligatorio.';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres.';
    if (!/^[\p{L}\s]+$/u.test(value)) return 'Solo letras y espacios.';
    return null;
  }
  if (name === 'correo') {
    if (!value.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo inválido.';
    return null;
  }
  if (name === 'telefono') {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'El teléfono es obligatorio.';
    if (digits.length < PHONE_MIN || digits.length > PHONE_MAX)
      return `Mínimo ${PHONE_MIN} dígitos, máximo ${PHONE_MAX}.`;
    return null;
  }
  if (name === 'rol') return null;
  return null;
};

const validateUserForm = (form) => {
  const errors = {};
  errors.nombreCompleto = validateField('nombreCompleto', form.nombreCompleto, form, {});
  errors.correo = validateField('correo', form.correo, form, {});
  errors.telefono = validateField('telefono', form.telefono, form, {});
  return Object.fromEntries(Object.entries(errors).filter((entry) => entry[1]));
};

function FormUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showWarning, showSuccess, showConfirm } = useAlert();
  const { user: authUser } = useAuth();

  const userToEdit = location.state?.user ?? null;
  const isEditing = userToEdit !== null;
  const isSelfEdit = isEditing && isSelfUser(userToEdit, authUser);
  const returnTo = location.state?.returnTo ?? '/admin/users';
  const origin = location.state?.origin ?? null;

  const { visible, handleClose: animatedClose } = useModalAnimation(returnTo);
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : 'center center';

  const [form, setForm] = useState({
    nombreCompleto: userToEdit?.name ?? '',
    correo: userToEdit?.email ?? '',
    telefono: userToEdit?.phone ?? '',
    rol: String(userToEdit?.role?.idRole ?? userToEdit?.role?.id ?? ''),
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const roleOptions = useMemo(() => [
    { value: '', label: 'Sin rol - Null' },
    ...roles.map((role) => ({
      value: String(role.idRole ?? role.id),
      label: role.nameRole ?? role.name,
    })),
  ], [roles]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    let forcedError = '';
    if (name === 'telefono') {
      filtered = normalizeDigits(value, PHONE_MAX);
      if (/\D/.test(String(value))) forcedError = 'Solo se permiten números.';
    } else if (name === 'nombreCompleto') {
      const lettersOnly = value.replace(/[^\p{L}\s]/gu, '');
      filtered = normalizeFullNameInput(lettersOnly);
      if (value !== lettersOnly) forcedError = 'Solo letras y espacios.';
    } else if (name === 'correo') {
      filtered = normalizeEmailInput(value);
    }
    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = forcedError || validateField(name, filtered);
    setErrors((prev) => ({ ...prev, [name]: errorMsg || '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name !== 'nombreCompleto') return;

    const formattedName = toTitleCaseName(form.nombreCompleto);
    const updatedForm = { ...form, nombreCompleto: formattedName };

    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, nombreCompleto: true }));
    setErrors((prev) => ({
      ...prev,
      nombreCompleto: validateField('nombreCompleto', formattedName) || '',
    }));
  };

  const handleSubmit = async () => {
    // Evitar múltiples envíos
    if (isSubmitting) return;

    if (isSelfEdit) {
      showWarning(
        'Acción no permitida',
        'No puedes editar tu propio usuario desde este módulo. Usa la sección de perfil.'
      );
      return;
    }

    const normalizedForm = {
      ...form,
      nombreCompleto: toTitleCaseName(form.nombreCompleto),
      correo: normalizeEmailInput(form.correo),
      telefono: normalizeDigits(form.telefono, PHONE_MAX),
    };
    setForm(normalizedForm);

    // Validar campos
    const allTouched = Object.keys(normalizedForm).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const newErrors = validateUserForm(normalizedForm);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      return;
    }

    // Preparar datos
    const userData = {
      name: normalizedForm.nombreCompleto,
      email: normalizedForm.correo,
      phone: normalizedForm.telefono ? Number(normalizedForm.telefono) : null,
      roleId: normalizedForm.rol ? Number(normalizedForm.rol) : null,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await UserService.update(userToEdit.id, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          roleId: userData.roleId,
        });
        showSuccess('Usuario actualizado', 'Los datos han sido guardados.');
      } else {
        const createdUser = await UserService.create(userData);

        if (createdUser.errorCode === 'EMAIL_SEND_ERROR') {
          showWarning(
            'Usuario creado',
            'El usuario fue registrado, pero no se pudo enviar la contraseña temporal al correo.'
          );
        } else {
          showSuccess('Usuario creado', 'El usuario ha sido registrado. Se ha enviado una contraseña temporal al correo.');
        }
      }
      navigate(returnTo, {
        state: returnTo !== '/admin/users' ? { newUserId: isEditing ? String(userToEdit.id) : undefined } : undefined,
      });
    } catch (error) {
      const mensaje = getUserActionErrorMessage(error);
      showWarning('Error', mensaje);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = useMemo(() => {
    if (isEditing) {
      return (
        form.nombreCompleto !== (userToEdit?.name ?? '') ||
        form.correo !== (userToEdit?.email ?? '') ||
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
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Continuar editando' }
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
        {/* Header */}
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

        {/* Cuerpo */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-4">
          {/* Nombre completo */}
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
                placeholder="Mín. 3 letras"
                autoComplete="off"
                className={inputClass('nombreCompleto')}
              />
            </div>
            <ErrorMsg field="nombreCompleto" />
          </div>

          {/* Correo */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="usuario@dominio.com"
                autoComplete="off"
                className={inputClass('correo')}
              />
            </div>
            <ErrorMsg field="correo" />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono / Celular<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder={`Entre ${PHONE_MIN} y ${PHONE_MAX} dígitos`}
                maxLength={PHONE_MAX}
                autoComplete="off"
                className={inputClass('telefono')}
              />
            </div>
            <ErrorMsg field="telefono" />
          </div>

          {/* Rol */}
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
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            onClick={handleCancel}
            className="w-full rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer sm:w-auto"
          >
            Cerrar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer sm:w-auto ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#003a5c]'
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
