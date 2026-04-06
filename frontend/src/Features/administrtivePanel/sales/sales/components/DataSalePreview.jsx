import { useMemo } from 'react';
import { ClipboardList, Package, Hash, Calendar, User, UserCheck, CreditCard, Tag, Truck, MapPin, Receipt, DollarSign } from 'lucide-react';
import { formatPrice, today, loadSalesUsers } from '../helpers/salesHelpers';

// ─── Fila de detalle ──────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value, placeholder, highlight = false }) {
  const hasValue = value && String(value).trim() !== '';
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
        hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'
      }`}>
        <Icon className={`w-3.5 h-3.5 ${hasValue ? 'text-[#004D77]' : 'text-gray-300'}`} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span className={`block text-sm font-medium truncate ${
          hasValue
            ? highlight
              ? 'text-[#004D77] font-semibold'
              : 'text-gray-800'
            : 'text-gray-300 italic font-normal'
        }`}>
          {hasValue ? value : placeholder}
        </span>
      </div>
    </div>
  );
}

// ─── DataSalePreview ──────────────────────────────────────────────────────────
function DataSalePreview({
  form, items, facturaNo,
  isAnulada      = false,
  motivoAnulacion = '',
  fechaAnulacion  = '',
  paymentAmounts = {},
}) {
  const users = loadSalesUsers();

  const cliente  = useMemo(() => users.find((u) => String(u.id) === String(form?.clienteId)),  [form?.clienteId]);
  const vendedor = useMemo(() => users.find((u) => String(u.id) === String(form?.vendedorId)), [form?.vendedorId]);

  const subtotal = useMemo(() =>
    items.reduce((acc, i) => acc + i.product.precioDetalle * i.cantidad, 0),
  [items]);

  const iva   = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  // Obtener métodos de pago seleccionados (array)
  const selectedMethods = Array.isArray(form?.metodoPago) ? form.metodoPago : (form?.metodoPago ? [form.metodoPago] : []);

  // Filtrar montos solo para métodos seleccionados y con valor > 0
  const paymentEntries = selectedMethods
    .map(method => ({ method, amount: paymentAmounts[method] || 0 }))
    .filter(entry => entry.amount > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-linear-to-r from-[#004D77]/5 to-transparent border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#004D77] flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">3. Vista previa</p>
            <p className="text-xs text-gray-400">Resumen en tiempo real de la venta</p>
          </div>
        </div>
        {/* Indicador live */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Cambios reflejados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* ── Columna izquierda: Detalles de la venta ────────────────────── */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
              Detalles de la venta
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <DetailRow icon={Hash}       label="Factura No."    value={facturaNo}          placeholder="—"                         highlight />
          <DetailRow icon={Calendar}   label="Fecha"          value={today()}            placeholder="—"                                   />
          <DetailRow icon={User}       label="Cliente"        value={cliente?.name}      placeholder="(Elija un cliente)"                  />
          <DetailRow icon={UserCheck}  label="Vendedor"       value={vendedor?.name}     placeholder="(Elija un vendedor)"                 />
          <DetailRow icon={CreditCard} label="Método de pago"
            value={selectedMethods.length ? selectedMethods.join(' · ') : null}
            placeholder="(Elija al menos un método de pago)" />
          
          {/* ─── Montos de pago (solo si hay métodos seleccionados y montos >0) ─── */}
          {paymentEntries.length > 0 && (
            <div className="mt-2 pt-1 border-t border-dashed border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3 h-3 text-gray-400" strokeWidth={1.8} />
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Desglose de pagos</span>
              </div>
              {paymentEntries.map(({ method, amount }) => (
                <div key={method} className="flex justify-between items-center text-xs py-0.5">
                  <span className="text-gray-500">{method}</span>
                  <span className="font-medium text-gray-700">{formatPrice(amount)}</span>
                </div>
              ))}
            </div>
          )}

          <DetailRow icon={Tag}        label="Estado"         value={form?.estado}       placeholder="(Elija el estado)"                   />
          <DetailRow icon={Truck}      label="Entrega"        value={form?.entrega}      placeholder="(Elija una opción)"                  />
          <DetailRow icon={MapPin}     label="Dirección"      value={form?.direccion}    placeholder="(Sin dirección)"                     />

          {isAnulada && (
            <>
              <DetailRow icon={Receipt} label="Motivo de anulación" value={motivoAnulacion || 'Sin motivo registrado.'} placeholder="—" />
              {fechaAnulacion && (
                <DetailRow icon={Calendar} label="Fecha de anulación" value={fechaAnulacion} placeholder="—" />
              )}
            </>
          )}
        </div>

        {/* ── Columna derecha: Detalles del pedido ───────────────────────── */}
        <div className="p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
              Detalles del pedido
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Info cliente + domicilio */}
          <div className="mb-3">
            <DetailRow icon={User}    label="Cliente"   value={cliente?.name}                                             placeholder="(Elija un cliente)" />
            <DetailRow icon={MapPin}  label="Domicilio" value={form?.entrega === 'Domicilio' ? (form?.direccion?.trim() || null) : null}
              placeholder={form?.entrega === 'Domicilio' ? '(Ingrese la dirección)' : '(No aplica)'} />
          </div>

          {items.length > 0 ? (
            <>
              {/* Encabezado tabla productos */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-1.5 rounded-md bg-[#004D77]/5 mb-1">
                <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide">Producto</span>
                <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Cant</span>
                <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">V. Unit</span>
                <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Total</span>
              </div>

              {/* Filas de productos */}
              <div className="flex flex-col mb-3 flex-1">
                {items.map(({ product, cantidad }, idx) => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-2 items-center rounded-md ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded bg-[#004D77]/10 flex items-center justify-center shrink-0">
                        <Package className="w-3 h-3 text-[#004D77]/60" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs text-gray-700 truncate">{product.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-500 text-right tabular-nums font-medium">{cantidad}</span>
                    <span className="text-xs text-gray-500 text-right tabular-nums">
                      {product.precioDetalle.toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 text-right tabular-nums">
                      {(product.precioDetalle * cantidad).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs text-gray-400">Subtotal</span>
                  <span className="text-xs text-gray-600 tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs text-gray-400">IVA (19%)</span>
                  <span className="text-xs text-gray-600 tabular-nums">{formatPrice(iva)}</span>
                </div>
                <div className="flex justify-between items-center mt-1 px-3 py-2.5 bg-[#004D77] rounded-lg">
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Total</span>
                  <span className="text-sm font-bold text-white tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>
            </>
          ) : (
            /* Estado vacío */
            <div className="flex flex-col items-center justify-center py-10 gap-3 flex-1 rounded-lg border-2 border-dashed border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-200" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-gray-300 text-center">
                Agrega productos para<br />ver el resumen
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DataSalePreview;