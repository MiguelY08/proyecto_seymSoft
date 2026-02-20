import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { swalWarning } from '../../../shared/Alerts.js';

function FormUser() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const userToEdit = location.state?.user ?? null;
  const isEditing  = userToEdit !== null;

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar el error del campo al corregirlo
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // ─── Validaciones ───────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.tipo)
      newErrors.tipo = 'Seleccione un tipo de documento.';

    if (!form.documento.trim())
      newErrors.documento = 'El documento es obligatorio.';
    else if (!/^\d+$/.test(form.documento.trim()))
      newErrors.documento = 'El documento solo debe contener números.';

    if (!form.nombres.trim())
      newErrors.nombres = 'Los nombres son obligatorios.';

    if (!form.correo.trim())
      newErrors.correo = 'El correo electrónico es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()))
      newErrors.correo = 'Ingrese un correo electrónico válido. Ej: ejemplo@correo.com';

    if (!form.telefono.trim())
      newErrors.telefono = 'El teléfono es obligatorio.';

    if (!form.rol)
      newErrors.rol = 'Seleccione un rol.';

    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      swalWarning(
        'Formulario incompleto',
        'Por favor revisa los campos marcados en rojo antes de continuar.'
      );
      return;
    }

    console.log(isEditing ? 'Editar usuario:' : 'Nuevo usuario:', form);
    navigate('/admin/users');
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  // ─── Clases de input según error ────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-lg outline-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
      errors[field]
        ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  const selectClass = (field) =>
    `appearance-none w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
      errors[field]
        ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;

  // ─── Mensaje de error bajo el campo ─────────────────────────────────────────
  const ErrorMsg = ({ field }) =>
    errors[field]
      ? <p className="text-red-500 text-[10px] sm:text-xs mt-0.5">{errors[field]}</p>
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-base sm:text-lg">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-3 sm:gap-4">

          {/* Tipo + Documento */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Tipo<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className={`appearance-none w-20 sm:w-24 pl-2 sm:pl-3 pr-6 sm:pr-8 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-lg outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
                    errors.tipo
                      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                  }`}
                >
                  {tiposDocumento.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
              <ErrorMsg field="tipo" />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Documento<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Ingrese su número de documento"
                className={inputClass('documento')}
              />
              <ErrorMsg field="documento" />
            </div>
          </div>

          {/* Nombres + Apellidos */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Nombres<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                placeholder="Nombres"
                className={inputClass('nombres')}
              />
              <ErrorMsg field="nombres" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Apellidos"
                className={inputClass('apellidos')}
              />
            </div>
          </div>

          {/* Correo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">
              Correo electrónico<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="ejemplo123@gmail.com"
              className={inputClass('correo')}
            />
            <ErrorMsg field="correo" />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">
              Teléfono - Celular<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="000-000-0000"
              className={inputClass('telefono')}
            />
            <ErrorMsg field="telefono" />
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">
              Rol<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className={selectClass('rol')}
              >
                <option value="" disabled>Seleccione un rol</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            </div>
            <ErrorMsg field="rol" />
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 px-4 sm:px-0 pb-4 sm:pb-0 gap-2 sm:gap-0 mt-1 sm:mt-0">
          <button
            onClick={handleSubmit}
            className="py-3 sm:py-3.5 bg-[#004D77] hover:bg-[#003d5e] text-white font-semibold text-xs sm:text-sm transition-colors duration-200 cursor-pointer rounded-bl-2xl sm:rounded-none"
          >
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
          <button
            onClick={handleCancel}
            className="py-3 sm:py-3.5 bg-gray-400 hover:bg-gray-500 text-white font-semibold text-xs sm:text-sm transition-colors duration-200 cursor-pointer rounded-br-2xl sm:rounded-none"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormUser;