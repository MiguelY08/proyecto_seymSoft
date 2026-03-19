import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown, IdCard, User, Users, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAlert }           from '../../../shared/alerts/useAlert';
import { useModalAnimation }  from '../../../shared/useModalAnimation';
import { UsersDB }            from '../services/usersDB';
import { getRoles }           from '../../configuration/roles/services/rolesServices';
import { splitName }          from '../helpers/usersHelpers';
import {
  PHONE_MIN,
  PHONE_MAX,
  DOC_MIN_LENGTH,
  TIPOS_DOCUMENTO,
  validateField,
  checkDuplicates,
  validateUserForm,
} from '../validators/usersValidators';

function FormUser() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { showWarning, showSuccess, showConfirm } = useAlert();

  const userToEdit = location.state?.user   ?? null;
  const isEditing  = userToEdit !== null;
  const returnTo   = location.state?.returnTo ?? '/admin/users';
  const origin     = location.state?.origin   ?? null;

  const { visible, handleClose: animatedClose } = useModalAnimation(returnTo);

  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  const { nombres: nombresInit, apellidos: apellidosInit } = splitName(userToEdit?.name);

  const [form, setForm] = useState({
    tipo:      userToEdit?.documentType ?? 'CC',
    documento: userToEdit?.document     ?? '',
    nombres:   nombresInit,
    apellidos: apellidosInit,
    correo:    userToEdit?.email        ?? '',
    telefono:  userToEdit?.phone        ?? '',
    rol:       userToEdit?.role         ?? 'Nulo',
  });

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const context       = { isEditing, userToEdit };
  const existingUsers = useMemo(() => UsersDB.list(), []);

  const roles = [
    'Nulo',
    ...getRoles()
      .filter((r) => r.active)
      .map((r) => r.name),
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    let filtered = value;
    if (name === 'documento' || name === 'telefono') {
      filtered = value.replace(/\D/g, '');
    } else if (name === 'nombres' || name === 'apellidos') {
      filtered = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }

    const updatedForm = { ...form, [name]: filtered };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    const formatError = validateField(name, filtered, updatedForm, context);
    const dupes       = checkDuplicates(updatedForm, existingUsers, context);

    setErrors((prev) => {
      const next = { ...prev, [name]: formatError || dupes[name] || '' };
      if (name === 'nombres' || name === 'apellidos') {
        const otro = name === 'nombres' ? 'apellidos' : 'nombres';
        if (prev[otro] === 'Ya existe un usuario con este nombre completo.') {
          next[otro] = dupes[otro] || '';
        }
      }
      return next;
    });
  };

  const handleTipoChange = (e) => {
    const updatedForm = { ...form, tipo: e.target.value };
    setForm(updatedForm);
    if (touched.documento) {
      const formatError = validateField('documento', form.documento, updatedForm, context);
      const dupes       = checkDuplicates(updatedForm, existingUsers, context);
      setErrors((prev) => ({
        ...prev,
        documento: formatError || dupes.documento || '',
      }));
    }
  };

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const newErrors = validateUserForm(form, existingUsers, context);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Formulario incompleto', 'Por favor revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    const name = `${form.nombres.trim()} ${form.apellidos.trim()}`.trim();
    const role = form.rol === 'Nulo' ? null : form.rol;

    if (isEditing) {
      UsersDB.update(userToEdit.id, {
        documentType: form.tipo,
        document:     form.documento,
        name,
        email:        form.correo,
        phone:        form.telefono,
        role,
      });
      showSuccess('Usuario actualizado', 'Los datos del usuario han sido actualizados.');
      navigate(returnTo, {
        state: returnTo !== '/admin/users' ? { newUserId: String(userToEdit.id) } : undefined,
      });
    } else {
      const newUser = UsersDB.create({
        documentType: form.tipo,
        document:     form.documento,
        name,
        email:        form.correo,
        phone:        form.telefono,
        role,
      });
      showSuccess('Usuario creado', 'El nuevo usuario ha sido registrado exitosamente.');
      navigate(returnTo, {
        state: returnTo !== '/admin/users' ? { newUserId: String(newUser.id) } : undefined,
      });
    }
  };

  // ─── Detectar cambios sin guardar ─────────────────────────────────────────
  const isDirty = (() => {
    if (isEditing) {
      const { nombres: nombresOrig, apellidos: apellidosOrig } = splitName(userToEdit.name);
      return (
        form.tipo      !== (userToEdit.documentType ?? 'CC')   ||
        form.documento !== (userToEdit.document     ?? '')     ||
        form.nombres   !== nombresOrig                         ||
        form.apellidos !== apellidosOrig                       ||
        form.correo    !== (userToEdit.email        ?? '')     ||
        form.telefono  !== (userToEdit.phone        ?? '')     ||
        form.rol       !== (userToEdit.role         ?? 'Nulo')
      );
    }
    return (
      form.documento.trim() !== '' || form.nombres.trim()   !== '' ||
      form.apellidos.trim() !== '' || form.correo.trim()    !== '' ||
      form.telefono.trim()  !== ''
    );
  })();

  const handleCancel = async () => {
    if (!isDirty) { animatedClose(); return; }
    const confirmed = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      'Tienes cambios sin guardar. Si sales ahora perderás todo lo que has ingresado.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Seguir editando' }
    );
    if (confirmed?.isConfirmed) animatedClose();
  };

  // ─── Helpers de UI ────────────────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full px-10 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 py-2.5 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const ErrorMsg = ({ field }) =>
    touched[field] && errors[field]
      ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
      : null;

  // ─── Render ───────────────────────────────────────────────────────────────
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
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">

          {/* Tipo y Documento */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Tipo<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleTipoChange}
                  className="appearance-none w-24 px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
                >
                  {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Documento<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                <input
                  type="text"
                  name="documento"
                  value={form.documento}
                  onChange={handleChange}
                  placeholder={`Mín. ${DOC_MIN_LENGTH[form.tipo] ?? 8} dígitos`}
                  maxLength={12}
                  autoComplete="off"
                  className={inputClass('documento')}
                />
              </div>
              <ErrorMsg field="documento" />
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Nombres<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Mín. 3 letras"
                  autoComplete="off"
                  className={inputClass('nombres')}
                />
              </div>
              <ErrorMsg field="nombres" />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Apellidos
                {!(isEditing && (userToEdit?.name ?? '').trim().split(/\s+/).filter(Boolean).length <= 2) && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Mín. 3 letras"
                  autoComplete="off"
                  className={inputClass('apellidos')}
                />
              </div>
              <ErrorMsg field="apellidos" />
            </div>
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
              >
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            </div>
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
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
          >
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormUser;