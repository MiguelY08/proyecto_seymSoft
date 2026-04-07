import { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronDown, FileText, Search, UserPlus, X, Plus,
  Users, UserCheck, CreditCard, Tag, Truck, MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UsersDB }                                from '../../../users/services/usersDB';
import { SalesDB }                                from '../services/salesBD';
import { METODOS_PAGO, ESTADOS_VENTA, ENTREGAS, formatPrice, getClientCreditInfo } from '../helpers/salesHelpers';

const MAX_DIRECCION = 250;

// ─── Campo de solo lectura ────────────────────────────────────────────────────
function ReadonlyField({ value }) {
  return (
    <div className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed select-none">
      {value || '—'}
    </div>
  );
}

// ─── Icono de campo ───────────────────────────────────────────────────────────
const FIcon = ({ icon: Icon }) => (
  <Icon
    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10"
    strokeWidth={1.8}
  />
);

// ─── Select con buscador integrado ────────────────────────────────────────────
function SearchableSelect({ value, onChange, options, placeholder, error, getLabel, getValue, icon }) {
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
      {icon && <FIcon icon={icon} />}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm border rounded-lg bg-white transition-colors duration-200 ${
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
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
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
function SimpleSelect({ name, value, onChange, options, placeholder, error, disabled, icon }) {
  return (
    <div className="relative">
      {icon && <FIcon icon={icon} />}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`appearance-none w-full ${icon ? 'pl-10' : 'pl-4'} pr-8 py-2.5 text-sm border rounded-lg outline-none bg-white transition-colors duration-200 ${
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
  'Aprobada':        { badge: 'bg-green-100 text-green-700 border-green-300',    dot: 'bg-green-500'  },
  'Esp. aprobación': { badge: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
  'Anulada':         { badge: 'bg-red-100 text-red-400 border-red-200',          dot: 'bg-red-400'    },
  'Desaprobada':     { badge: 'bg-red-100 text-red-600 border-red-300',          dot: 'bg-red-600'    },
};

// ─── Select de estado con badges coloreados ───────────────────────────────────
function StatusSelect({ value, onChange, options, placeholder, error, icon }) {
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
      {icon && <FIcon icon={icon} />}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm border rounded-lg bg-white transition-colors duration-200 ${
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
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1">
            {options.map((estado) => {
              const style      = ESTADO_STYLES[estado];
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
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#004D77]" />}
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
function SaleDetailsForm({
  form,
  onChange,
  errors,
  isEditing,
  isAnulada,
  motivoAnulacion = '',
  fechaAnulacion = '',
  paymentAmounts = {},
  onPaymentAmountChange,
  totalAmount = 0,
}) {
  const navigate = useNavigate();

  const [clients, setClients] = useState(() => SalesDB.getClients());
  const [users, setUsers] = useState(() => UsersDB.list());
  const [paymentErrors, setPaymentErrors] = useState({});

  // Obtener información de crédito del cliente seleccionado
  const creditInfo = useMemo(() => {
    if (!form.clienteId) return { available: 0, creditAmount: 0, balance: 0 };
    return getClientCreditInfo(form.clienteId);
  }, [form.clienteId]);

  useEffect(() => {
    const sync = () => {
      setClients(SalesDB.getClients());
      setUsers(UsersDB.list());
    };
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

  const activeVendors = users.filter((u) => u.active && u.role && u.role !== 'Nulo');
  const clienteEditName = useMemo(() => {
    const found = SalesDB.getClientById(form.clienteId);
    return found?.name ?? '—';
  }, [form.clienteId]);

  const vendedorEditName = useMemo(() => {
    const found = users.find((u) => String(u.id) === String(form.vendedorId));
    return found?.name ?? '—';
  }, [form.vendedorId, users]);

  const selectedMethods = useMemo(() => {
    if (Array.isArray(form.metodoPago)) return form.metodoPago;
    if (form.metodoPago) return [form.metodoPago];
    return [];
  }, [form.metodoPago]);

  const getMaxForMethod = (method) => {
    if (totalAmount === 0) return 0;
    const otrosSum = selectedMethods
      .filter(m => m !== method)
      .reduce((sum, m) => sum + (paymentAmounts[m] || 0), 0);
    return Math.max(0, totalAmount - otrosSum);
  };

  const validateSinglePayment = (method, amount) => {
    const maxAllowed = getMaxForMethod(method);
    if (amount > maxAllowed) {
      return `El monto máximo permitido para ${method} es ${formatPrice(maxAllowed)} (restante del total).`;
    }
    if (amount < 0) return 'El monto no puede ser negativo.';
    if (method === 'Crédito' && amount > creditInfo.available) {
      return `El monto a crédito (${formatPrice(amount)}) supera el cupo disponible (${formatPrice(creditInfo.available)}).`;
    }
    return null;
  };

  useEffect(() => {
    const newErrors = {};
    for (const method of selectedMethods) {
      const amount = paymentAmounts[method] || 0;
      const error = validateSinglePayment(method, amount);
      if (error) newErrors[method] = error;
    }
    setPaymentErrors(newErrors);
  }, [paymentAmounts, totalAmount, selectedMethods, creditInfo.available]);

  const handlePaymentAmountChange = (method, rawValue) => {
    const numValue = rawValue === '' ? 0 : Number(rawValue);
    if (isNaN(numValue)) return;

    let newAmount = numValue;
    const maxAllowed = getMaxForMethod(method);
    if (newAmount > maxAllowed) newAmount = maxAllowed;
    if (newAmount < 0) newAmount = 0;
    if (method === 'Crédito' && newAmount > creditInfo.available) newAmount = creditInfo.available;

    const newAmounts = { ...paymentAmounts, [method]: newAmount };
    onPaymentAmountChange(newAmounts);
  };

  const handleMethodChange = (idx, newMethod) => {
    const oldMethod = selectedMethods[idx];
    if (oldMethod === newMethod) return;

    const oldAmount = paymentAmounts[oldMethod] || 0;
    const newAmounts = { ...paymentAmounts };
    delete newAmounts[oldMethod];
    newAmounts[newMethod] = (newAmounts[newMethod] || 0) + oldAmount;

    const updatedMethods = [...selectedMethods];
    updatedMethods[idx] = newMethod;

    onChange('metodoPago', updatedMethods);
    onPaymentAmountChange(newAmounts);
  };

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

      <div className="p-5 flex flex-col gap-4">
        {/* Cliente + Vendedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Cliente</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                {isEditing ? (
                  <ReadonlyField value={clienteEditName} />
                ) : (
                  <SearchableSelect
                    value={form.clienteId}
                    onChange={(val) => onChange('clienteId', val)}
                    options={clients}
                    placeholder="Selecciona un cliente"
                    error={errors?.clienteId}
                    getLabel={(c) => c.name}
                    getValue={(c) => String(c.id)}
                    icon={Users}
                  />
                )}
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/sales/new-user', { state: { returnTo: '/admin/sales/form-sale' } })}
                  title="Nuevo cliente"
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
              <ReadonlyField value={vendedorEditName} />
            ) : (
              <SearchableSelect
                value={form.vendedorId}
                onChange={(val) => onChange('vendedorId', val)}
                options={activeVendors}
                placeholder="Selecciona un vendedor"
                error={errors?.vendedorId}
                getLabel={(u) => u.name}
                getValue={(u) => String(u.id)}
                icon={UserCheck}
              />
            )}
            <ErrorMsg field="vendedorId" />
          </div>
        </div>

        {/* Método de pago con montos */}
        <div>
          <Label required>Método de pago</Label>
          <div className="flex flex-col gap-3">
            {selectedMethods.map((metodo, idx) => {
              const allSelected = selectedMethods;
              const usedMethods = allSelected.filter((_, i) => i !== idx);
              const available = METODOS_PAGO.filter((m) => !usedMethods.includes(m));
              const canRemove = allSelected.length > 1 && !isAnulada;
              const montoActual = paymentAmounts[metodo] ?? 0;
              const errorMsg = paymentErrors[metodo];
              const maxAllowed = getMaxForMethod(metodo);
              const isDisabled = isAnulada || totalAmount === 0;
              const isCredit = metodo === 'Crédito';

              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.8} />
                      <select
                        value={metodo}
                        disabled={isAnulada}
                        onChange={(e) => handleMethodChange(idx, e.target.value)}
                        className={`appearance-none w-full pl-10 pr-7 py-2.5 text-sm border ${canRemove ? 'rounded-l-lg border-r-0' : 'rounded-lg'} outline-none bg-white text-gray-700 cursor-pointer transition-colors duration-200 ${
                          errors?.metodoPago
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                        } ${isAnulada ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                      >
                        {available.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    </div>

                    {/* Input de monto */}
                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                      <input
                        type="number"
                        value={montoActual}
                        onChange={(e) => handlePaymentAmountChange(metodo, e.target.value)}
                        disabled={isDisabled}
                        min={0}
                        max={isCredit ? Math.min(maxAllowed, creditInfo.available) : maxAllowed}
                        step={1000}
                        placeholder="0"
                        className={`w-full pl-7 pr-2 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors duration-200 ${
                          isDisabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
                        } ${errorMsg ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300'}`}
                      />
                    </div>

                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedMethods = allSelected.filter((_, i) => i !== idx);
                          onChange('metodoPago', updatedMethods);
                          const newAmounts = { ...paymentAmounts };
                          delete newAmounts[metodo];
                          onPaymentAmountChange(newAmounts);
                        }}
                        className="h-10.5 px-2.5 border border-gray-300 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Quitar método"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-red-500 ml-1">{errorMsg}</p>
                  )}
                  {!errorMsg && maxAllowed > 0 && totalAmount > 0 && (
                    <p className="text-[10px] text-gray-400 ml-1">
                      Máx: {formatPrice(maxAllowed)}
                      {isCredit && ` · Cupo disponible: ${formatPrice(creditInfo.available)}`}
                    </p>
                  )}
                  {isCredit && creditInfo.available === 0 && totalAmount > 0 && !errorMsg && (
                    <p className="text-[10px] text-orange-500 ml-1">Cliente sin cupo de crédito disponible.</p>
                  )}
                </div>
              );
            })}

            {!isAnulada && selectedMethods.length < METODOS_PAGO.length && (
              <button
                type="button"
                onClick={() => {
                  const current = selectedMethods;
                  const next = METODOS_PAGO.find((m) => !current.includes(m));
                  if (next) {
                    onChange('metodoPago', [...current, next]);
                    onPaymentAmountChange({ ...paymentAmounts, [next]: 0 });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#004D77] border border-dashed border-[#004D77]/40 rounded-lg hover:bg-[#004D77]/5 transition-colors duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Agregar método de pago
              </button>
            )}
          </div>
          <ErrorMsg field="metodoPago" />
        </div>

        {/* Estado */}
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
                icon={Tag}
              />
              <ErrorMsg field="estado" />
            </>
          )}
        </div>

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

        <div>
          <Label required>Entrega</Label>
          <SimpleSelect
            name="entrega"
            value={form.entrega}
            onChange={handleChange}
            options={ENTREGAS}
            placeholder="Elija una opción"
            error={errors?.entrega}
            icon={Truck}
          />
          <ErrorMsg field="entrega" />
        </div>

        {form.entrega === 'Domicilio' && (
          <div>
            <Label required>Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
              <textarea
                name="direccion"
                value={form.direccion}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DIRECCION) handleChange(e);
                }}
                placeholder="Digite la dirección, barrio y descripción del punto de encuentro"
                rows={3}
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
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