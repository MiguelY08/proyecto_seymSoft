import { useMemo } from 'react';
import { ClipboardList, Package } from 'lucide-react';
import { formatPrice, today, loadSalesUsers } from '../helpers/salesHelpers';
import SaleDetailRow from '../components/SaleDetailRow';

// ─── DataSalePreview ──────────────────────────────────────────────────────────
function DataSalePreview({ form, items, facturaNo, isAnulada = false, motivoAnulacion = '', fechaAnulacion = '' }) {
  const users = loadSalesUsers();

  const cliente  = useMemo(() => users.find((u) => String(u.id) === String(form?.clienteId)),  [form?.clienteId]);
  const vendedor = useMemo(() => users.find((u) => String(u.id) === String(form?.vendedorId)), [form?.vendedorId]);

  const subtotal = useMemo(() =>
    items.reduce((acc, i) => acc + i.product.precioDetalle * i.cantidad, 0),
  [items]);

  const IVA_RATE = 0.19;
  const iva      = Math.round(subtotal * IVA_RATE);
  const total    = subtotal + iva;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

      {/* Header sección */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <ClipboardList className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">3. Datos de la venta</p>
          <p className="text-xs text-gray-400">Detalles del pedido y la venta</p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* Columna izquierda: Detalles de la venta */}
          <div className="pb-5 md:pb-0 md:pr-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Detalles de la venta
            </p>

            <SaleDetailRow label="Factura No."    value={facturaNo}             placeholder="—"                         />
            <SaleDetailRow label="Fecha"          value={today()}               placeholder="—"                         />
            <SaleDetailRow label="Cliente"        value={cliente?.nombre}       placeholder="(Elija un cliente)"        />
            <SaleDetailRow label="Vendedor"       value={vendedor?.nombre}      placeholder="(Elija un vendedor)"       />
            <SaleDetailRow label="Método de pago" value={form?.metodoPago}      placeholder="(Elija un método de pago)" />
            <SaleDetailRow label="Estado"         value={form?.estado}          placeholder="(Elija el estado)"         />
            <SaleDetailRow label="Entrega"        value={form?.entrega}         placeholder="(Elija una opción)"        />
            <SaleDetailRow label="Dirección"      value={form?.direccion}       placeholder="(Sin dirección)"           />
            {isAnulada && (
              <>
                <SaleDetailRow
                  label="Motivo de anulación"
                  value={motivoAnulacion || 'Sin motivo registrado.'}
                  placeholder="—"
                />
                {fechaAnulacion && (
                  <SaleDetailRow label="Fecha de anulación" value={fechaAnulacion} placeholder="—" />
                )}
              </>
            )}
          </div>

          {/* Columna derecha: Detalles del pedido */}
          <div className="pt-5 md:pt-0 md:pl-6 flex flex-col">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Detalles del pedido
            </p>

            {/* Info cliente + domicilio */}
            <div className="mb-3">
              <SaleDetailRow label="Cliente"  value={cliente?.nombre} placeholder="(Elija un cliente)" />
              <SaleDetailRow
                label="Domicilio"
                value={
                  form?.entrega === 'Domicilio'
                    ? (form?.direccion?.trim() || null)
                    : null
                }
                placeholder={
                  form?.entrega === 'Domicilio'
                    ? '(Ingrese la dirección)'
                    : '(No aplica)'
                }
              />
            </div>

            {/* Tabla de productos */}
            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-1.5 border-b border-gray-200 mb-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Prod</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Cant</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">V. Unit</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide text-right">Total</span>
                </div>

                <div className="flex flex-col divide-y divide-gray-50 mb-3">
                  {items.map(({ product, cantidad }) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-1.5 items-center"
                    >
                      <span className="text-xs text-gray-700 truncate">{product.nombre}</span>
                      <span className="text-xs text-gray-600 text-right tabular-nums">{cantidad}</span>
                      <span className="text-xs text-gray-600 text-right tabular-nums">
                        {product.precioDetalle.toLocaleString('es-CO')}
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-right tabular-nums">
                        {(product.precioDetalle * cantidad).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="mt-auto border-t border-gray-200 pt-3 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Subtotal</span>
                    <span className="text-xs font-medium text-gray-700 tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">IVA (19%)</span>
                    <span className="text-xs font-medium text-gray-700 tabular-nums">{formatPrice(iva)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-300">
                    <span className="text-sm font-bold text-gray-800">Total</span>
                    <span className="text-sm font-bold text-[#004D77] tabular-nums">{formatPrice(total)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 flex-1">
                <Package className="w-7 h-7 text-gray-200" strokeWidth={1.5} />
                <p className="text-xs text-gray-300 text-center">
                  Agrega productos para ver el resumen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataSalePreview;