import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Info,
  SquarePen,
  RefreshCw,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { highlight } from "../helpers/salesHelpers";
import {
  ESTADO_LOGISTICO_LABELS,
  getEstadoLogisticoBadgeClasses,
  getEstadoLogisticoColor,
} from "../../orders/helpers/ordersHelpers";
import Spinner from "../../../../shared/spinner";
import Permission from "../../../configuration/roles/components/Permission";

const estadoVariants = {
  Aprobada: "bg-green-100 text-green-700 border-green-300",
  "Esp. aprobacion": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Anulada: "bg-red-100 text-red-400 border-red-200",
  Denegada: "bg-red-100 text-red-600 border-red-300",
  Cancelada: "bg-orange-100 text-orange-600 border-orange-300",
};

function EstadoBadge({ estado, term }) {
  const label = estado || "-";
  const classes =
    estadoVariants[label] ?? "bg-gray-100 text-gray-600 border-gray-300";
  const content = term?.trim() ? highlight(label, term) : label;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}
    >
      {content}
    </span>
  );
}

const normalizeStatusText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const PULSING_ORDER_STATUSES = new Set(["en proceso", "listo"]);

function EstadoPedidoIndicator({ estado, term }) {
  const label = estado || "-";
  const normalizedStatus = normalizeStatusText(label);
  const normalized = normalizedStatus === "cancelado" ? "anulado" : normalizedStatus;
  const shouldPulse = PULSING_ORDER_STATUSES.has(normalized);
  const displayLabel = ESTADO_LOGISTICO_LABELS[normalized] || label;
  const content = term?.trim() ? highlight(displayLabel, term) : displayLabel;
  const classes = getEstadoLogisticoBadgeClasses(normalized);
  const dotClass = getEstadoLogisticoColor(normalized);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}
      title={`Pedido: ${displayLabel}`}
    >
      <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
        {shouldPulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${dotClass}`}
          />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotClass}`}
        />
      </span>
      {content}
    </span>
  );
}

const getPermisos = (estado) => {
  if (estado === "Aprobada") {
    return { puedeDevolver: true, puedeAnular: true, deshabilitado: false };
  }

  if (estado === "Anulada") {
    return { puedeDevolver: false, puedeAnular: false, deshabilitado: true };
  }

  return { puedeDevolver: false, puedeAnular: false, deshabilitado: false };
};

const MAX_SALE_RETURN_DAYS = 30;

const getSaleId = (sale = {}) =>
  sale.idSale ?? sale.idVending ?? sale.id_vending ?? sale.id ?? sale.factura ?? null;

const parseDisplayDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const text = String(value).trim();
  if (text.includes('/')) {
    const [day, month, year] = text.split('/');
    if (day && month && year) {
      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (!Number.isNaN(localDate.getTime())) return localDate;
    }
  }

  const directDate = new Date(text);
  return Number.isNaN(directDate.getTime()) ? null : directDate;
};

const startOfDay = (date) => {
  if (!date) return null;
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const daysSince = (value) => {
  const date = startOfDay(parseDisplayDate(value));
  if (!date) return null;

  const today = startOfDay(new Date());
  return Math.floor((today.getTime() - date.getTime()) / 86400000);
};

const isDeliveredSale = (sale = {}) => {
  const statusText = normalizeStatusText(
    sale.estadoPedido ??
    sale.orderStatusName ??
    sale.sales_orders?.order_statuses?.name_status ??
    ''
  );

  return statusText === 'entregado' || Number(sale.idOrderStatus ?? sale.estadoPedidoId ?? sale.sales_orders?.id_order_status) === 3;
};

const getReturnStartDate = (sale = {}) =>
  sale.saleReturnDeliveredAt ||
  sale.deliveredAt ||
  sale.deliveryDate ||
  sale.sales_orders?.hev?.status_date ||
  sale.saleDate ||
  sale.fechaPago ||
  sale.createdAt ||
  sale.fecha;

const getReturnAvailability = (sale = {}) => {
  const saleReturnNumber = sale.saleReturnNumber || sale.returnNumber || '';

  if (sale.hasSaleReturn || saleReturnNumber) {
    return {
      canCreate: false,
      reason: 'Devolución ya registrada',
      title: `Esta venta ya tiene asociada la devolución de venta ${saleReturnNumber || 'registrada'}.`,
    };
  }

  const { puedeDevolver } = getPermisos(sale.estado);
  if (!puedeDevolver) {
    return {
      canCreate: false,
      reason: 'Devolución no permitida',
      title: `No es posible generar una devolución sobre una venta con estado "${sale.estado}".`,
    };
  }

  if (sale.canCreateSaleReturn === false) {
    return {
      canCreate: false,
      reason: 'Devolución no permitida',
      title: sale.saleReturnBlockReason || 'Esta venta no cumple las condiciones para devolución.',
    };
  }

  if (!isDeliveredSale(sale)) {
    return {
      canCreate: false,
      reason: 'Pedido no entregado',
      title: 'Solo puedes generar devolución cuando el pedido esté en estado Entregado.',
    };
  }

  if (sale.canCreateSaleReturn === true) {
    return { canCreate: true, reason: '', title: 'Generar devolución' };
  }

  const elapsedDays = sale.saleReturnDaysSinceDelivery ?? daysSince(getReturnStartDate(sale));
  if (elapsedDays !== null && elapsedDays > MAX_SALE_RETURN_DAYS) {
    return {
      canCreate: false,
      reason: 'Plazo vencido',
      title: `La venta superó el plazo máximo de ${MAX_SALE_RETURN_DAYS} días para devolución.`,
    };
  }

  return { canCreate: true, reason: '', title: 'Generar devolución' };
};

function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
      <div className="w-16 h-16 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <ShoppingCart
          className="w-8 h-8 text-[#004D77]/40"
          strokeWidth={1.5}
        />
      </div>
      {isSearching ? (
        <>
          <p className="text-sm font-semibold text-gray-500">
            No se encontraron resultados
          </p>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Ninguna venta coincide con la búsqueda. Intenta con otro término.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-500">
            No hay ventas registradas
          </p>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Aún no se han registrado ventas en el sistema. Crea la primera para
            comenzar.
          </p>
        </>
      )}
    </div>
  );
}

function TableText({ value, fallback, search, className = "" }) {
  if (!value || value === "-") {
    return <span className="italic text-gray-400">{fallback}</span>;
  }

  return <span className={className}>{highlight(value, search)}</span>;
}

function SalesTable({ data = [], search = "", totalData = 0, hasActiveFilters = false }) {
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [loadingMessage, setLoadingMessage] = useState("");

  const navigateWithSpinner = (message, to, options) => {
    setLoadingMessage(message);
    window.setTimeout(() => {
      navigate(to, options);
    }, 80);
  };

  const handleAnular = (row) => {
    const { puedeAnular } = getPermisos(row.estado);

    if (!puedeAnular) {
      showError(
        "Anulación no permitida",
        `No es posible anular una venta con estado "${row.estado}".`,
      );
      return;
    }

    navigate(`/admin/sales/${row.id}/annul`);
  };

  const handleDevolucion = (row) => {
    if (row.hasSaleReturn || row.saleReturnNumber) {
      showError(
        "Devolución ya registrada",
        `Esta venta ya tiene asociada la devolución de venta ${row.saleReturnNumber || "registrada"}.`,
      );
      return;
    }

    const { puedeDevolver } = getPermisos(row.estado);

    if (!puedeDevolver) {
      showError(
        "Devolución no permitida",
        `No es posible generar una devolución sobre una venta con estado "${row.estado}".`,
      );
      return;
    }

    navigateWithSpinner("Preparando devolución de venta...", "/admin/sales/returns-s", {
      state: { openReturnForm: true, sale: row },
    });
  };

  const handleReturnClick = (row) => {
    const availability = getReturnAvailability(row);

    if (!availability.canCreate) {
      showError(
        availability.reason || "Devolución no permitida",
        availability.title,
      );
      return;
    }

    navigateWithSpinner("Preparando devolución de venta...", "/admin/sales/returns-s", {
      state: { openReturnForm: true, sale: { ...row, idSale: getSaleId(row) } },
    });
  };

  if (data.length === 0) {
    return (
      <EmptyState isSearching={hasActiveFilters || (totalData > 0 && search.trim().length > 0)} />
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
      {loadingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Spinner message={loadingMessage} className="min-h-0" />
        </div>
      )}

      <table className="min-w-max w-full table-auto">
        <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">
              No. Factura
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Recibe/Cliente
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Vendedor
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Fecha
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              M. Pago
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Total
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Estado pedido
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Estado
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const baseRowBg = index % 2 === 0 ? "bg-gray-100" : "bg-white";
            const clienteMostrar =
              row.deliveryRecipientName ||
              row.cliente ||
              "Cliente no disponible";
            const { puedeDevolver, puedeAnular, deshabilitado } = getPermisos(
              row.estado,
            );
            const editDisabledByCompletedSale =
              isDeliveredSale(row) && normalizeStatusText(row.estado) === 'aprobada';
            const isEditDisabled = deshabilitado || editDisabledByCompletedSale;
            const editDisabledTitle = deshabilitado
              ? 'No disponible para ventas anuladas'
              : 'No disponible para ventas aprobadas con pedido entregado';
            const hasAssociatedReturn = Boolean(row.hasSaleReturn || row.saleReturnNumber);
            const returnTitle = hasAssociatedReturn
              ? `Esta venta ya tiene asociada la devolución de venta ${row.saleReturnNumber || "registrada"}.`
              : puedeDevolver
                ? "Generar devolución"
                : "Devolución no disponible";
            const canCreateReturn = puedeDevolver && !hasAssociatedReturn;
            const effectiveReturnAvailability = getReturnAvailability(row);
            const effectiveReturnTitle = effectiveReturnAvailability.title || returnTitle;
            const effectiveCanCreateReturn = effectiveReturnAvailability.canCreate;

            return (
              <tr
                key={row.id || row.idSale || row.factura}
                className={`group transition-colors duration-150 ${baseRowBg} hover:bg-blue-50`}
              >
                <td
                  className={`sticky left-0 z-10 ${baseRowBg} group-hover:bg-blue-50 px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap font-mono transition-colors duration-150`}
                >
                  {highlight(String(row.factura || row.id || "-"), search)}
                </td>

                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap">
                  <TableText
                    value={clienteMostrar}
                    fallback="Cliente no disponible"
                    search={search}
                  />
                </td>

                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  <TableText
                    value={row.vendedor}
                    fallback="Vendedor no disponible"
                    search={search}
                  />
                </td>

                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.fecha || "-", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.metodoPago || "-", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap font-semibold">
                  {highlight(row.total || "0", search)}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <EstadoPedidoIndicator estado={row.estadoPedido} term={search} />
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <EstadoBadge estado={row.estado} term={search} />
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <Permission permission="ventas.ver_informacion">
                      <button
                        onClick={() => {
                          navigateWithSpinner(
                            "Cargando detalles de la venta...",
                            `/admin/sales/${row.id}/detail`
                          );
                        }}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Ver información"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                    </Permission>

                    <Permission permission="ventas.editar">
                      {isEditDisabled ? (
                        <span
                          className="text-gray-200 cursor-not-allowed"
                          title={editDisabledTitle}
                        >
                          <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const orderId = row.pedidoId ?? row.order?.id ?? row.order?.idOrder;
                            const orderStatus = String(row.estadoPedido ?? '')
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .toLowerCase();
                            const usesOrderForm = orderStatus.includes('en proceso') || orderStatus.includes('listo');

                            if (!usesOrderForm) {
                              navigateWithSpinner('Cargando edicion de la venta...', '/admin/sales/edit-sale', {
                                state: { sale: row },
                              });
                              return;
                            }

                            if (!orderId) {
                              showError(
                                'Pedido no disponible',
                                'No se encontró el pedido asociado a esta venta para editarlo.'
                              );
                              return;
                            }

                            navigateWithSpinner(
                              'Cargando pedido para edicion...',
                              `/admin/sales/orders/${orderId}`
                            );
                          }}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar venta"
                        >
                          <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </button>
                      )}
                    </Permission>

                    <Permission permission="ventas.crear_devolucion">
                      {deshabilitado || hasAssociatedReturn ? (
                        <span
                          className="text-gray-200 cursor-not-allowed"
                          title={deshabilitado ? "No disponible para ventas anuladas" : effectiveReturnTitle}
                        >
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReturnClick(row)}
                          className={`transition ${
                            effectiveCanCreateReturn
                              ? "text-gray-400 hover:scale-110 hover:text-amber-500 cursor-pointer"
                              : "text-gray-200 cursor-not-allowed"
                          }`}
                          disabled={!effectiveCanCreateReturn}
                          title={effectiveReturnTitle}
                        >
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </button>
                      )}
                    </Permission>

                    <Permission permission="ventas.anular">
                      {deshabilitado ? (
                        <span
                          className="text-gray-200 cursor-not-allowed"
                          title="No disponible para ventas anuladas"
                        >
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAnular(row)}
                          className={`transition ${
                            puedeAnular
                              ? "text-gray-400 hover:scale-110 hover:text-red-500 cursor-pointer"
                              : "text-gray-200 cursor-not-allowed"
                          }`}
                          title={
                            puedeAnular
                              ? "Anular venta"
                              : "Anulación no disponible"
                          }
                        >
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </button>
                      )}
                    </Permission>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SalesTable;
