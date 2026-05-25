import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown, User, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAlert } from '../../../shared/alerts/useAlert';
import { useModalAnimation } from '../../../shared/useModalAnimation';
import { UserService } from '../services/userService';
import { getRoles } from '../../configuration/roles/services/rolesServices';
import {
  PHONE_MIN,
  PHONE_MAX,
  validateField as baseValidateField,
  validateUserForm as baseValidateUserForm,
} from '../validators/usersValidators';

// Funciones de validación (sin cambios)
const validateField = (name, value, form, context) => {
  if (name === 'nombreCompleto') {
    if (!value.trim()) return 'El nombre completo es obligatorio.';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres.';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Solo letras y espacios.';
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
  return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v));
};

function FormUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showWarning, showSuccess, showConfirm } = useAlert();

  const userToEdit = location.state?.user ?? null;
  const isEditing = userToEdit !== null;
  const returnTo = location.state?.returnTo ?? '/admin/users';
  const origin = location.state?.origin ?? null;

  const { visible, handleClose: animatedClose } = useModalAnimation(returnTo);
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : 'center center';

  const [form, setForm] = useState({
    nombreCompleto: userToEdit?.name ?? '',
    correo: userToEdit?.email ?? '',
    telefono: userToEdit?.phone ?? '',
    rol: userToEdit?.role ?? 'Nulo',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = useMemo(() => {
    const allRoles = ['Nulo'];
    try {
      const activeRoles = getRoles().filter((r) => r.active).map((r) => r.name);
      return [...allRoles, ...activeRoles];
    } catch {
      return allRoles;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === 'telefono') {
      filtered = value.replace(/\D/g, '');
    } else if (name === 'nombreCompleto') {
      filtered = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }
    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, filtered, updatedForm, {});
    setErrors((prev) => ({ ...prev, [name]: errorMsg || '' }));
  };

  const handleSubmit = async () => {
    // Evitar múltiples envíos
    if (isSubmitting) return;

    // Validar campos
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const newErrors = validateUserForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      return;
    }

    // Preparar datos
    const userData = {
      name: form.nombreCompleto.trim(),
      email: form.correo.trim(),
      phone: form.telefono ? Number(form.telefono) : null,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await UserService.update(userToEdit.id, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
        showSuccess('Usuario actualizado', 'Los datos han sido guardados.');
      } else {
        await UserService.create(userData);
        showSuccess('Usuario creado', 'El usuario ha sido registrado. Se ha enviado una contraseña temporal al correo.');
      }
      navigate(returnTo, {
        state: returnTo !== '/admin/users' ? { newUserId: isEditing ? String(userToEdit.id) : undefined } : undefined,
      });
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Ocurrió un error. Intenta de nuevo.';
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
        form.rol !== (userToEdit?.role ?? 'Nulo')
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
      '¿Salir sin guardar?',
      'Tienes cambios sin guardar. Si sales ahora perderás todo lo que has ingresado.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Seguir editando' }
    );
    if (confirmed?.isConfirmed) animatedClose();
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const ErrorMsg = ({ field }) =>
    touched[field] && errors[field] ? <p className="mt-0.5 text-xs text-red-500">{errors[field]}</p> : null;

  return (
    <div
      onClick={handleCancel}
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin,
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden flex flex-col
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
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
        <div className="px-6 py-3 flex flex-col gap-3 overflow-y-auto">
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

          {/* Rol (solo visual, no se envía) */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Rol
              <span className="ml-1.5 text-xs text-gray-400 font-normal">
                (opcional — se asignará desde el módulo de Roles)
              </span>
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.8} />
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className={selectClass('rol')}
                disabled
              >
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">El rol se gestiona en el módulo de Roles.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
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