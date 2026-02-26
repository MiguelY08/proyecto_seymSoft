import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '../../../shared/alerts/useAlert';

const STORAGE_KEY = 'pm_users';

function FormUser() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { showWarning, showSuccess } = useAlert();
  const userToEdit      = location.state?.user ?? null;
  const isEditing       = userToEdit !== null;

  const [form, setForm] = useState({
    tipo:      userToEdit?.tipo      ?? 'CC',
    documento: userToEdit?.documento ?? '',
    nombres:   userToEdit?.nombre?.split(' ').slice(0, 2).join(' ') ?? '',
    apellidos: userToEdit?.nombre?.split(' ').slice(2).join(' ')    ?? '',
    correo:    userToEdit?.correo    ?? '',
    telefono:  userToEdit?.telefono  ?? '',
    rol:       userToEdit?.rol       ?? '',
  });

  const [errors, setErrors] = useState({});

  const tiposDocumento = ['CC', 'CE', 'NIT', 'TI', 'PP'];
  const roles          = ['Administrador', 'Empleado', 'Cliente'];

  // ─── Validación de un campo individual ──────────────────────────────────────
    const validateField = (name, value) => {
      switch (name) {
        case 'documento':
          if (!value.trim())               return 'El documento es obligatorio.';
          if (!/^\d+$/.test(value.trim())) return 'El documento solo debe contener números.';
          return '';
        case 'nombres':
          if (!value.trim())                        return 'Los nombres son obligatorios.';
          if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Los nombres solo deben contener letras.';
          return '';
        case 'apellidos':
          if (!value.trim())                        return 'Los apellidos son obligatorios.';
          if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Los apellidos solo deben contener letras.';
          return '';
        case 'correo':
          if (!value.trim())                                      return 'El correo electrónico es obligatorio.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Ingrese un correo válido. Ej: ejemplo@correo.com';
          return '';
        case 'telefono':
          if (!value.trim())               return 'El teléfono es obligatorio.';
          if (!/^\d+$/.test(value.trim())) return 'El teléfono solo debe contener números.';
          return '';
        case 'rol':
          if (!value) return 'Seleccione un rol.';
          return '';
        default:
          return '';
      }
    };

    // ─── Validación en tiempo real + bloqueo de caracteres inválidos ────────────
    const handleChange = (e) => {
      const { name, value } = e.target;

      // ─── Filtrar caracteres no permitidos antes de actualizar el estado ──────
      let filtered = value;
      if (name === 'documento' || name === 'telefono') {
        filtered = value.replace(/\D/g, '');                        // Solo dígitos
      } else if (name === 'nombres' || name === 'apellidos') {
        filtered = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');           // Solo letras y espacios
      }

      setForm({ ...form, [name]: filtered });
      setErrors({ ...errors, [name]: validateField(name, filtered) });
    };

  const validate = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  // ─── Guardar en localStorage ─────────────────────────────────────────────
  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning('Formulario incompleto', 'Por favor revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    const stored  = localStorage.getItem(STORAGE_KEY);
    const users   = stored ? JSON.parse(stored) : [];
    const nombre  = `${form.nombres.trim()} ${form.apellidos.trim()}`.trim();

    if (isEditing) {
      const updated = users.map((u) =>
        u.id === userToEdit.id
          ? { ...u, tipo: form.tipo, documento: form.documento, nombre, correo: form.correo, telefono: form.telefono, rol: form.rol }
          : u
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showSuccess('Usuario actualizado', 'Los datos del usuario han sido actualizados.');
    } else {
      const newId   = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id:       newId,
        tipo:     form.tipo,
        documento: form.documento,
        nombre,
        correo:   form.correo,
        telefono: form.telefono,
        rol:      form.rol,
        activo:   true,
        registradoDesde: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, newUser]));
      showSuccess('Usuario creado', 'El nuevo usuario ha sido registrado exitosamente.');
    }

    navigate('/admin/users');
  };

  const handleCancel = () => navigate('/admin/users');

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field]
      ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button onClick={handleCancel} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
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
                  onChange={handleChange}
                  className={`appearance-none w-24 px-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
                    errors.tipo
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                  }`}
                >
                  {tiposDocumento.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
              <ErrorMsg field="tipo" />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Documento<span className="text-red-500">*</span>
              </label>
              <input type="text" name="documento" value={form.documento} onChange={handleChange} placeholder="Ingrese su número de documento" className={inputClass('documento')} />
              <ErrorMsg field="documento" />
            </div>
          </div>

          {/* Nombres + Apellidos */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Nombres<span className="text-red-500">*</span>
              </label>
              <input type="text" name="nombres" value={form.nombres} onChange={handleChange} placeholder="Nombres" className={inputClass('nombres')} />
              <ErrorMsg field="nombres" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Apellidos<span className="text-red-500">*</span>
              </label>
              <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Apellidos" className={inputClass('apellidos')} />
              <ErrorMsg field="apellidos" />
            </div>
          </div>

          {/* Correo */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico<span className="text-red-500">*</span>
            </label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="ejemplo123@gmail.com" className={inputClass('correo')} />
            <ErrorMsg field="correo" />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono - Celular<span className="text-red-500">*</span>
            </label>
            <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="000-000-0000" className={inputClass('telefono')} />
            <ErrorMsg field="telefono" />
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Rol<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select name="rol" value={form.rol} onChange={handleChange} className={selectClass('rol')}>
                <option value="" disabled>Seleccione un rol</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            </div>
            <ErrorMsg field="rol" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button onClick={handleCancel} className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormUser;