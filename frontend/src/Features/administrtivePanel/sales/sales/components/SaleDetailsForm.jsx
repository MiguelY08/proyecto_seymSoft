import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, FileText, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_USERS = 'pm_users';
const MAX_DIRECCION = 250;

const METODOS_PAGO = ['Efectivo', 'Crédito', 'Transferencia'];
const ESTADOS_VENTA = [
  'Aprobada', 'Esp. aprobación', 'Créd. aprobado',
  'Anulada', 'Desaprobada', 'Cancelada', 'Créd. denegado',
];
const ENTREGAS = ['Cliente lo recoge', 'Domicilio'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

// ─── Campo de solo lectura ────────────────────────────────────────────────────
function ReadonlyField({ value }) {
  return (
    <div className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
      {value || '—'}
    </div>
  );
}

// ─── Select con buscador integrado ───────────────────────────────────────────
function SearchableSelect({ value, onChange, options, placeholder, error, getLabel, getValue }) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState('');
  const ref                 = useRef(null);

  const filtered = useMemo(() =>
    options.filter((o) =>
      getLabel(o).toLowerCase().includes(query.toLowerCase().trim())
    ), [options, query]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => getValue(o) === value);
    return found ? getLabel(found) : '';
  }, [value, options]);

  // Cerrar al click afuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (option) => {
    onChange(getValue(option));
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border rounded-lg bg-white transition-colors duration-200 ${
          error
            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-200'
            : open
              ? 'border-[#004D77] ring-2 ring-[#004D77]/20'
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={selectedLabel ? 'text-gray-700' : 'text-gray-400'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Buscador */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-[#004D77] focus:ring-1 focus:ring-[#004D77]/20"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            </div>
          </div>

          {/* Opciones */}
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <li
                  key={getValue(option)}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                    getValue(option) === value
                      ? 'bg-[#004D77]/10 text-[#004D77] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getLabel(option)}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Select simple ────────────────────────────────────────────────────────────
function SimpleSelect({ name, value, onChange, options, placeholder, error }) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`appearance-none w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white cursor-pointer transition-colors duration-200 ${
          value ? 'text-gray-700' : 'text-gray-400'
        } ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
        }`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
    </div>
  );
}

// ─── SaleDetailsForm ──────────────────────────────────────────────────────────
function SaleDetailsForm({ form, onChange, errors, isEditing }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState(loadUsers);

  // ─── Re-cargar usuarios si se acaba de crear uno nuevo ───────────────────
  useEffect(() => {
    const sync = () => setUsers(loadUsers());
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  // ─── Validación y cambio en campos simples ───────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSelectChange = (name, value) => {
    onChange(name, value);
  };

  const ErrorMsg = ({ field }) =>
    errors?.[field]
      ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      : null;

  const Label = ({ children, required }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

      {/* ── Header sección ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">1. Detalles</p>
          <p className="text-xs text-gray-400">Ingrese los datos básicos</p>
        </div>
      </div>

      {/* ── Campos ──────────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col gap-4">

        {/* Cliente + Vendedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Cliente */}
          <div>
            <Label required>Cliente</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                {isEditing ? (
                  <ReadonlyField value={
                    users.find((u) => String(u.id) === String(form.clienteId))?.nombre
                  } />
                ) : (
                  <SearchableSelect
                    value={form.clienteId}
                    onChange={(val) => handleSelectChange('clienteId', val)}
                    options={users}
                    placeholder="Cliente"
                    error={errors?.clienteId}
                    getLabel={(u) => u.nombre}
                    getValue={(u) => String(u.id)}
                  />
                )}
              </div>
              {/* Botón nuevo usuario — solo en creación */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/sales/new-user', { state: { returnTo: '/admin/sales/form-sale' } })}
                  title="Nuevo usuario"
                  className="shrink-0 w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:border-[#004D77] hover:text-[#004D77] hover:bg-[#004D77]/5 transition-colors duration-200 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" strokeWidth={1.8} />
                </button>
              )}
            </div>
            <ErrorMsg field="clienteId" />
          </div>

          {/* Vendedor */}
          <div>
            <Label required>Vendedor</Label>
            {isEditing ? (
              <ReadonlyField value={
                users.filter((u) => u.rol === 'Empleado')
                    .find((u) => String(u.id) === String(form.vendedorId))?.nombre
              } />
            ) : (
              <SearchableSelect
                value={form.vendedorId}
                onChange={(val) => handleSelectChange('vendedorId', val)}
                options={users.filter((u) => u.rol === 'Empleado')}
                placeholder="Vendedor"
                error={errors?.vendedorId}
                getLabel={(u) => u.nombre}
                getValue={(u) => String(u.id)}
              />
            )}
            <ErrorMsg field="vendedorId" />
          </div>
        </div>

        {/* Método de pago + Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Método de pago</Label>
            {isEditing ? (
              <ReadonlyField value={form.metodoPago} />
            ) : (
              <SimpleSelect
                name="metodoPago"
                value={form.metodoPago}
                onChange={handleChange}
                options={METODOS_PAGO}
                placeholder="Elija el método de pago"
                error={errors?.metodoPago}
              />
            )}
            <ErrorMsg field="metodoPago" />
          </div>
          <div>
            <Label required>Estado</Label>
            <SimpleSelect
              name="estado"
              value={form.estado}
              onChange={handleChange}
              options={ESTADOS_VENTA}
              placeholder="Elija un estado"
              error={errors?.estado}
            />
            <ErrorMsg field="estado" />
          </div>
        </div>

        {/* Entrega */}
        <div>
          <Label required>Entrega</Label>
          <SimpleSelect
            name="entrega"
            value={form.entrega}
            onChange={handleChange}
            options={ENTREGAS}
            placeholder="Elija una opción"
            error={errors?.entrega}
          />
          <ErrorMsg field="entrega" />
        </div>

        {/* Dirección */}
        <div>
          <Label required>Dirección</Label>
          <div className="relative">
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={(e) => {
                if (e.target.value.length <= MAX_DIRECCION) handleChange(e);
              }}
              placeholder="Digite la dirección, barrio y descripción del punto de encuentro"
              rows={3}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
                errors?.direccion
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
              }`}
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
              {form.direccion?.length ?? 0}/{MAX_DIRECCION}
            </span>
          </div>
          <ErrorMsg field="direccion" />
        </div>

      </div>
    </div>
  );
}

export default SaleDetailsForm;