import React from "react";
import { Info, Package, RefreshCw, XCircle } from "lucide-react";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import Permission from "../../../configuration/roles/components/Permission";

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text, search) => {
  if (!search?.trim() || text === null || text === undefined) return text;

  const normalizedSearch = search.trim();
  const regex = new RegExp(`(${escapeRegExp(normalizedSearch)})`, "gi");

  return String(text).split(regex).map((part, index) =>
    part.toLowerCase() === normalizedSearch.toLowerCase() ? (
      <span
        key={`${part}-${index}`}
        className="rounded bg-[#004D77]/10 px-0.5 text-[#004D77]"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

const isWithinReturnPeriod = (purchaseDate, maxReturnDate) => {
  if (maxReturnDate) {
    const today = new Date();
    const limitDate = new Date(maxReturnDate);
    today.setHours(0, 0, 0, 0);
    limitDate.setHours(0, 0, 0, 0);
    return today <= limitDate;
  }

  if (!purchaseDate) return false;

  const purchase = new Date(purchaseDate);
  const today = new Date();
  return (today - purchase) / (1000 * 60 * 60 * 24) <= 60;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return String(dateString);

  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getStatusClasses = (status) => {
  if (status === "Completada") {
    return "border-green-300 bg-green-100 text-green-700";
  }
  if (status === "Anulada") {
    return "border-red-200 bg-red-100 text-red-500";
  }
  return "border-amber-300 bg-amber-100 text-amber-700";
};

function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#004D77]/10">
        <Package className="h-10 w-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-gray-500">
        {isSearching
          ? "No se encontraron resultados"
          : "No hay compras registradas"}
      </p>
      <p className="max-w-xs text-center text-sm text-gray-400">
        {isSearching
          ? "Ninguna compra coincide con los filtros aplicados. Intenta con otros criterios."
          : "Aún no se han registrado compras en el sistema. Crea la primera para comenzar."}
      </p>
    </div>
  );
}

export const PurchasesTable = ({
  currentData = [],
  handleCancel,
  handleViewDetail,
  handleReturn,
  search = "",
  isSearching = false,
}) => {
  const { hasPermission } = usePermissions();
  const canCreateReturn = hasPermission("devoluciones_en_compras.crear");

  if (currentData.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  return (
    <div className="h-full min-h-0 min-w-0 w-full flex-1 overflow-auto overscroll-contain rounded-xl [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[860px] table-auto lg:min-w-[940px]">
        <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-30 bg-[#004D77] px-4 py-3 text-center text-sm font-semibold">
              No. Facturación
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Fecha compra</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Proveedor</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Cantidad</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Precio</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">
              Límite devolución
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((purchase, index) => {
            const baseRowBg = index % 2 === 0 ? "bg-gray-100" : "bg-white";
            const isAnnulled = purchase.estado === "Anulada";
            const isExpired =
              Boolean(purchase.maxReturnDate) &&
              new Date(purchase.maxReturnDate) < new Date();
            const canReturn =
              canCreateReturn &&
              !isAnnulled &&
              isWithinReturnPeriod(purchase.fechaCompra, purchase.maxReturnDate);

            let returnTitle = "Registrar devolución";
            if (isAnnulled) {
              returnTitle = "No se puede devolver una compra anulada";
            } else if (!canCreateReturn) {
              returnTitle = "No tienes permiso para crear devoluciones";
            } else if (!canReturn) {
              returnTitle = purchase.maxReturnDate
                ? `La fecha límite de devolución era ${formatDate(purchase.maxReturnDate)}`
                : "La compra superó el periodo permitido para devoluciones";
            }

            return (
              <tr
                key={purchase.id}
                className={`group transition-colors duration-150 ${baseRowBg} hover:bg-blue-50`}
              >
                <td
                  className={`sticky left-0 z-10 px-4 py-2.5 text-center font-mono text-sm text-gray-700 whitespace-nowrap transition-colors duration-150 ${baseRowBg} group-hover:bg-blue-50`}
                >
                  {highlightText(purchase.numeroFacturacion || purchase.id || "-", search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(purchase.fechaCompra || "-", search)}
                </td>
                <td className="max-w-xs truncate px-4 py-2.5 text-center text-sm text-gray-800 whitespace-nowrap">
                  {highlightText(purchase.proveedor || "Proveedor no disponible", search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                  {highlightText(purchase.cantidadProductos?.toString() || "0", search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {highlightText(
                    `$${Number(purchase.precioTotal || 0).toLocaleString("es-CO")}`,
                    search
                  )}
                </td>
                <td className="px-4 py-2.5 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isExpired
                        ? "border-red-300 bg-red-100 text-red-700"
                        : "border-blue-300 bg-blue-100 text-blue-700"
                    }`}
                  >
                    {formatDate(purchase.maxReturnDate)}
                    {isExpired ? " (Vencida)" : ""}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      purchase.estado
                    )}`}
                  >
                    {highlightText(purchase.estado || "Sin estado", search)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <Permission permission="compras.ver_informacion">
                    <button
                      type="button"
                      onClick={() => handleViewDetail(purchase)}
                      className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]"
                      title="Ver información"
                    >
                      <Info className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                    </Permission>

                    <Permission permission="compras.devolver">
                    <button
                      type="button"
                      onClick={() => canReturn && handleReturn?.(purchase)}
                      title={returnTitle}
                      disabled={!canReturn}
                      className={`transition ${
                        canReturn
                          ? "cursor-pointer text-gray-400 hover:scale-110 hover:text-amber-500"
                          : "cursor-not-allowed text-gray-200"
                      }`}
                    >
                      <RefreshCw className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                    </Permission>

                    <Permission permission="compras.anular">
                    {isAnnulled ? (
                      <span
                        className="cursor-not-allowed text-gray-200"
                        title="No disponible para compras anuladas"
                      >
                        <XCircle className="h-4.5 w-4.5" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCancel(purchase)}
                        className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-red-500"
                        title="Anular compra"
                      >
                        <XCircle className="h-4.5 w-4.5" strokeWidth={1.5} />
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
};

export default PurchasesTable;
