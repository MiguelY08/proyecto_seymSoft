import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

  const tiposDocumento = ['CC', 'CE', 'NIT', 'TI', 'PP'];
  const roles          = ['Administrador', 'Empleado', 'Cliente'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log(isEditing ? 'Editar usuario:' : 'Nuevo usuario:', form);
    navigate('/users');
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      {/* ── Modal ───────────────────────────────────────────────────────── */}
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
                  className="appearance-none w-20 sm:w-24 pl-2 sm:pl-3 pr-6 sm:pr-8 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 cursor-pointer"
                >
                  {tiposDocumento.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
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
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none text-gray-700 placeholder-gray-400"
              />
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
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none text-gray-700 placeholder-gray-400"
              />
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
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none text-gray-700 placeholder-gray-400"
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
              className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none text-gray-700 placeholder-gray-400"
            />
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
              className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none text-gray-700 placeholder-gray-400"
            />
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
                className="appearance-none w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 cursor-pointer"
              >
                <option value="" disabled>Seleccione un rol</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            </div>
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