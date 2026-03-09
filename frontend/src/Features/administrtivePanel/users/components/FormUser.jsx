import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAlert } from '../../../shared/alerts/useAlert';
import { useModalAnimation } from '../../../shared/useModalAnimation';
import { UsersDB } from '../services/usersDB';

// ─── Normalizar: sin tildes, sin mayúsculas, sin espacios extremos ────────────
const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function FormUser() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { showWarning, showSuccess, showConfirm } = useAlert();

  const userToEdit = location.state?.user   ?? null;
  const isEditing  = userToEdit !== null;
  const returnTo   = location.state?.returnTo ?? '/admin/users';
  const origin     = location.state?.origin   ?? null;

  const { visible, handleClose: animatedClose } = useModalAnimation(returnTo);

  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  const [form, setForm] = useState({
    tipo:      userToEdit?.tipo      ?? 'CC',
    documento: userToEdit?.documento ?? '',
    nombres:   userToEdit?.nombre?.split(' ').slice(0, 2).join(' ') ?? '',
    apellidos: userToEdit?.nombre?.split(' ').slice(2).join(' ')    ?? '',
    correo:    userToEdit?.correo    ?? '',
    telefono:  userToEdit?.telefono  ?? '',
    rol:       userToEdit?.rol       ?? 'Nulo',
  });

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const tiposDocumento = ['CC', 'CE', 'NIT', 'TI', 'PP'];
  const roles          = ['Nulo', 'Administrador', 'Empleado', 'Cliente'];

  // tipoCliente es inmutable — siempre se lee del usuario o cae en 'Detal'
  const tipoCliente = userToEdit?.tipoCliente ?? 'Detal';

  const PHONE_MIN = 7;
  const PHONE_MAX = 10;

  const docMinLength = { CC: 8, CE: 6, NIT: 9, TI: 10, PP: 5 };

  const existingUsers = useMemo(() => UsersDB.list(), []);

  // ─── Validar duplicados ────────────────────────────────────────────────────
  const checkDuplicates = (currentForm = form) => {
    const dupes = {};
    const nombreCompleto = `${currentForm.nombres.trim()} ${currentForm.apellidos.trim()}`.trim();

    existingUsers.forEach((u) => {
      if (isEditing && u.id === userToEdit.id) return;

      if (currentForm.documento.trim() &&
          normalizar(u.documento) === normalizar(currentForm.documento) &&
          normalizar(u.tipo)      === normalizar(currentForm.tipo)) {
        dupes.documento = 'Este número de documento ya está registrado.';
      }

      if (currentForm.correo.trim() &&
          normalizar(u.correo) === normalizar(currentForm.correo)) {
        dupes.correo = 'Este correo electrónico ya está registrado.';
      }

      if (nombreCompleto.length >= 6 &&
          normalizar(u.nombre) === normalizar(nombreCompleto)) {
        dupes.nombres   = 'Ya existe un usuario con este nombre completo.';
        dupes.apellidos = 'Ya existe un usuario con este nombre completo.';
      }
    });

    return dupes;
  };

  // ─── Validación de formato ─────────────────────────────────────────────────
  const validateField = (name, value, currentForm = form) => {
    const v = value.trim();
    switch (name) {
      case 'documento': {
        const min = docMinLength[currentForm.tipo] ?? 8;
        if (!v)               return 'El documento es obligatorio.';
        if (!/^\d+$/.test(v)) return 'Solo se permiten números.';
        if (v.length < min)   return `Mínimo ${min} dígitos para ${currentForm.tipo}.`;
        return '';
      }
      case 'nombres':
        if (!v)                               return 'Los nombres son obligatorios.';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v))     return 'Solo se permiten letras y espacios.';
        if (v.replace(/\s+/g, '').length < 3) return 'El nombre debe tener al menos 3 letras.';
        return '';
      case 'apellidos':
        if (!v)                               return 'Los apellidos son obligatorios.';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v))     return 'Solo se permiten letras y espacios.';
        if (v.replace(/\s+/g, '').length < 3) return 'El apellido debe tener al menos 3 letras.';
        return '';
      case 'correo':
        if (!v)                                        return 'El correo electrónico es obligatorio.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingrese un correo válido. Ej: usuario@dominio.com';
        if (v.length < 10)                             return 'El correo parece muy corto. Verifícalo.';
        return '';
      case 'telefono':
        if (!v)                   return 'El teléfono es obligatorio.';
        if (!/^\d+$/.test(v))     return 'Solo se permiten números.';
        if (v.length < PHONE_MIN) return `Mínimo ${PHONE_MIN} dígitos.`;
        if (v.length > PHONE_MAX) return `Máximo ${PHONE_MAX} dígitos.`;
        return '';
      default:
        return '';
    }
  };

  // ─── handleChange ─────────────────────────────────────────────────────────
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

    const formatError = validateField(name, filtered, updatedForm);
    const dupes       = checkDuplicates(updatedForm);

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
      const formatError = validateField('documento', form.documento, updatedForm);
      const dupes       = checkDuplicates(updatedForm);
      setErrors((prev) => ({
        ...prev,
        documento: formatError || dupes.documento || '',
      }));
    }
  };

  // ─── Validación completa al enviar ────────────────────────────────────────
  const validate = () => {
    const errs   = {};
    const fields = ['documento', 'nombres', 'apellidos', 'correo', 'telefono'];
    fields.forEach((field) => {
      const e = validateField(field, form[field]);
      if (e) errs[field] = e;
    });
    const dupes = checkDuplicates();
    Object.entries(dupes).forEach(([field, msg]) => {
      if (!errs[field]) errs[field] = msg;
    });
    return errs;
  };

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Formulario incompleto', 'Por favor revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    const nombre = `${form.nombres.trim()} ${form.apellidos.trim()}`.trim();
    const rol    = form.rol || 'Nulo';

    if (isEditing) {
      UsersDB.update(userToEdit.id, {
        tipo:      form.tipo,
        documento: form.documento,
        nombre,
        correo:    form.correo,
        telefono:  form.telefono,
        rol,
        // tipoCliente no se envía — el servicio lo conserva intacto
      });
      showSuccess('Usuario actualizado', 'Los datos del usuario han sido actualizados.');
      navigate(returnTo, {
        state: returnTo !== '/admin/users' ? { newUserId: String(userToEdit.id) } : undefined,
      });
    } else {
      const newUser = UsersDB.create({
        tipo:      form.tipo,
        documento: form.documento,
        nombre,
        correo:    form.correo,
        telefono:  form.telefono,
        rol,
        // tipoCliente lo asigna create() automáticamente como 'Detal'
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
      const nombreOriginal    = userToEdit.nombre ?? '';
      const nombresOriginal   = nombreOriginal.split(' ').slice(0, 2).join(' ');
      const apellidosOriginal = nombreOriginal.split(' ').slice(2).join(' ');
      return (
        form.tipo      !== (userToEdit.tipo      ?? 'CC')   ||
        form.documento !== (userToEdit.documento  ?? '')     ||
        form.nombres   !== nombresOriginal                   ||
        form.apellidos !== apellidosOriginal                 ||
        form.correo    !== (userToEdit.correo     ?? '')     ||
        form.telefono  !== (userToEdit.telefono   ?? '')     ||
        form.rol       !== (userToEdit.rol        ?? 'Nulo')
      );
    }
    return (
      form.documento.trim() !== '' ||
      form.nombres.trim()   !== '' ||
      form.apellidos.trim() !== '' ||
      form.correo.trim()    !== '' ||
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

  // ─── Helpers de estilo ─────────────────────────────────────────────────────
  const isValid = (field) =>
    touched[field] && !errors[field] && form[field].toString().trim() !== '';

  const inputClass = (field) =>
    `w-full px-4 py-2.5 pr-10 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : isValid(field)
        ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : isValid(field)
        ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const ErrorMsg = ({ field }) =>
    touched[field] && errors[field]
      ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
      : null;

  const FieldCheck = ({ field }) =>
    isValid(field) ? (
      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" strokeWidth={2} />
    ) : null;

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
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button onClick={handleCancel} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">

          {/* Tipo + Documento */}
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
                  {tiposDocumento.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Documento<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="documento"
                  value={form.documento}
                  onChange={handleChange}
                  placeholder={`Mín. ${docMinLength[form.tipo] ?? 8} dígitos`}
                  maxLength={12}
                  autoComplete="off"
                  className={inputClass('documento')}
                />
                <FieldCheck field="documento" />
              </div>
              <ErrorMsg field="documento" />
            </div>
          </div>

          {/* Nombres + Apellidos */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Nombres<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Mín. 3 letras"
                  autoComplete="off"
                  className={inputClass('nombres')}
                />
                <FieldCheck field="nombres" />
              </div>
              <ErrorMsg field="nombres" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Apellidos<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Mín. 3 letras"
                  autoComplete="off"
                  className={inputClass('apellidos')}
                />
                <FieldCheck field="apellidos" />
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
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="usuario@dominio.com"
                autoComplete="off"
                className={inputClass('correo')}
              />
              <FieldCheck field="correo" />
            </div>
            <ErrorMsg field="correo" />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono / Celular<span className="text-red-500">*</span>
            </label>
            <div className="relative">
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
              <FieldCheck field="telefono" />
            </div>
            <ErrorMsg field="telefono" />
          </div>

          {/* Rol — opcional, por defecto Nulo */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Rol
              <span className="ml-1.5 text-xs text-gray-400 font-normal">(opcional — se asignará desde el módulo de Roles)</span>
            </label>
            <div className="relative">
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

          {/* Tipo de cliente — inmutable, gestionado desde el módulo de clientes */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de cliente
              <span className="ml-1.5 text-xs text-gray-400 font-normal">(se gestiona desde el módulo de clientes)</span>
            </label>
            <div className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
              {tipoCliente}
            </div>
          </div>

        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
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