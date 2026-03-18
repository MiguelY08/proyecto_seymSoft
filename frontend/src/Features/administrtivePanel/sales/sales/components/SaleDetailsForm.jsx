import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, FileText, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UsersDB }                                  from '../../../users/services/usersDB';
import { METODOS_PAGO, ESTADOS_VENTA, ENTREGAS }   from '../helpers/salesHelpers';

const MAX_DIRECCION = 250;

// ─── Campo de solo lectura ────────────────────────────────────────────────────
/**
 * Componente para mostrar un campo de solo lectura.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.value - Valor a mostrar.
 */
function ReadonlyField({ value }) {
  return (
    <div className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
      {value || '—'}
    </div>
  );
}

// ─── Select con buscador integrado ────────────────────────────────────────────
/**
 * Componente de select con funcionalidad de búsqueda integrada.
 * Permite filtrar opciones escribiendo en un input.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.value - Valor seleccionado.
 * @param {Function} props.onChange - Función para cambiar el valor.
 * @param {Array} props.options - Lista de opciones.
 * @param {string} props.placeholder - Placeholder del input.
 * @param {boolean} props.error - Indica si hay error.
 * @param {Function} props.getLabel - Función para obtener el label de una opción.
 * @param {Function} props.getValue - Función para obtener el valor de una opción.
 */
function SearchableSelect({ value, onChange, options, placeholder, error, getLabel, getValue }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef(null);

  const filtered = useMemo(() =>
    options.filter((o) =>
      getLabel(o).toLowerCase().includes(query.toLowerCase().trim())
    ), [options, query]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => getValue(o) === value);
    return found ? getLabel(found) : '';
  }, [value, options]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
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
            ? 'border-red-500 ring-2 ring-red-200'
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
              <li className="px-4 py-3 text-xs text-gray-400 text-center">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Select simple ────────────────────────────────────────────────────────────
/**
 * Componente de select simple sin búsqueda.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.name - Nombre del campo.
 * @param {string} props.value - Valor seleccionado.
 * @param {Function} props.onChange - Función para cambiar el valor.
 * @param {Array} props.options - Lista de opciones.
 * @param {string} props.placeholder - Placeholder del select.
 * @param {boolean} props.error - Indica si hay error.
 * @param {boolean} props.disabled - Indica si está deshabilitado.
 */
function SimpleSelect({ name, value, onChange, options, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`appearance-none w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-white transition-colors duration-200 ${
          disabled
            ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
            : value ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-pointer'
        } ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : disabled
              ? ''
              : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
        }`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${disabled ? 'text-gray-300' : 'text-gray-400'}`} strokeWidth={2} />
    </div>
  );
}

// ─── Estilos de badge por estado ─────────────────────────────────────────────
const ESTADO_STYLES = {
  'Aprobada':        { badge: 'bg-green-100 text-green-700 border-green-300',  dot: 'bg-green-500'  },
  'Esp. aprobación': { badge: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
  'Anulada':         { badge: 'bg-red-100 text-red-400 border-red-200',        dot: 'bg-red-400'    },
  'Desaprobada':     { badge: 'bg-red-100 text-red-600 border-red-300',        dot: 'bg-red-600'    },
};

// ─── Select de estado con badges coloreados ───────────────────────────────────
/**
 * Componente de select para estados de venta con badges coloreados.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.value - Valor seleccionado.
 * @param {Function} props.onChange - Función para cambiar el valor.
 * @param {Array} props.options - Lista de opciones de estado.
 * @param {string} props.placeholder - Placeholder del select.
 * @param {boolean} props.error - Indica si hay error.
 */
function StatusSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = ESTADO_STYLES[value];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border rounded-lg bg-white transition-colors duration-200 ${
          error
            ? 'border-red-500 ring-2 ring-red-200'
            : open
              ? 'border-[#004D77] ring-2 ring-[#004D77]/20'
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {value && selected ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${selected.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${selected.dot}`} />
            {value}
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1">
            {options.map((estado) => {
              const style     = ESTADO_STYLES[estado];
              const isSelected = estado === value;
              return (
                <li
                  key={estado}
                  onClick={() => { onChange('estado', estado); setOpen(false); }}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style?.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style?.dot}`} />
                    {estado}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004D77]" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── SaleDetailsForm ──────────────────────────────────────────────────────────
/**
 * Componente principal para el formulario de detalles de venta.
 * Maneja la selección de cliente, vendedor, método de pago, estado, entrega y dirección.
 * Soporta modo de edición y anulación.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.form - Datos del formulario.
 * @param {Function} props.onChange - Función para cambiar valores del formulario.
 * @param {Object} props.errors - Errores de validación.
 * @param {boolean} props.isEditing - Indica si está en modo edición.
 * @param {boolean} props.isAnulada - Indica si la venta está anulada.
 * @param {string} [props.motivoAnulacion=''] - Motivo de anulación.
 * @param {string} [props.fechaAnulacion=''] - Fecha de anulación.
 */
function SaleDetailsForm({ form, onChange, errors, isEditing, isAnulada, motivoAnulacion = '', fechaAnulacion = '' }) {
  const navigate = useNavigate();

  const [users, setUsers] = useState(() => UsersDB.list());

  useEffect(() => {
    const sync = () => setUsers(UsersDB.list());
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'entrega' && value !== 'Domicilio') onChange('direccion', '');
    onChange(name, value);
  };

  const ErrorMsg = ({ field }) =>
    errors?.[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

  const Label = ({ children, required }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500">*</span>}
    </label>
  );

  const activeUsers   = users.filter((u) => u.activo);
  const activeVendors = users.filter((u) => u.activo && (u.rol === 'Empleado' || u.rol === 'Administrador' || u.rol === 'Nulo'));

  return (
    <div className="bg-white rounded-lg border border-gray-200">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">1. Detalles</p>
          <p className="text-xs text-gray-400">
            {isAnulada
              ? 'Esta venta ha sido anulada y no puede modificarse'
              : 'Ingrese los datos básicos'}
          </p>
        </div>
      </div>

      {/* Campos */}
      <div className="p-5 flex flex-col gap-4">

        {/* Cliente + Vendedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Cliente</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                {isEditing ? (
                  <ReadonlyField value={users.find((u) => String(u.id) === String(form.clienteId))?.name} />
                ) : (
                  <SearchableSelect
                    value={form.clienteId}
                    onChange={(val) => onChange('clienteId', val)}
                    options={activeUsers}
                    placeholder="Cliente"
                    error={errors?.clienteId}
                    getLabel={(u) => u.name}
                    getValue={(u) => String(u.id)}
                  />
                )}
              </div>
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

          <div>
            <Label required>Vendedor</Label>
            {isEditing ? (
              <ReadonlyField value={users.find((u) => String(u.id) === String(form.vendedorId))?.name} />
            ) : (
              <SearchableSelect
                value={form.vendedorId}
                onChange={(val) => onChange('vendedorId', val)}
                options={activeVendors}
                placeholder="Vendedor"
                error={errors?.vendedorId}
                getLabel={(u) => u.name}
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
            {isAnulada ? (
              <>
                <ReadonlyField value="Anulada" />
                <p className="mt-1 text-xs text-red-500">La anulación es permanente y no puede revertirse.</p>
              </>
            ) : (
              <>
                <StatusSelect
                  value={form.estado}
                  onChange={onChange}
                  options={ESTADOS_VENTA}
                  placeholder="Elija un estado"
                  error={errors?.estado}
                />
                <ErrorMsg field="estado" />
              </>
            )}
          </div>
        </div>

        {/* Motivo y fecha de anulación */}
        {isAnulada && (
          <div className="flex flex-col gap-3">
            <div>
              <Label>Motivo de anulación</Label>
              <ReadonlyField value={motivoAnulacion || 'Sin motivo registrado.'} />
            </div>
            {fechaAnulacion && (
              <div>
                <Label>Fecha de anulación</Label>
                <ReadonlyField value={fechaAnulacion} />
              </div>
            )}
          </div>
        )}

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

        {/* Dirección — solo cuando entrega es Domicilio */}
        {form.entrega === 'Domicilio' && (
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
        )}
      </div>
    </div>
  );
}

export default SaleDetailsForm;