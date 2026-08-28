import React from "react";
import { Info, Loader2, Package, Plus, RefreshCw, XCircle } from "lucide-react";
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

function EmptyState({ isSearching, onCreatePurchase }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004D77]/10">
        <Package className="h-8 w-8 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="max-w-xs text-center text-xs text-gray-400">
            Ninguna compra coincide con la búsqueda.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-500">No hay compras registradas</p>
          <p className="max-w-xs text-center text-xs text-gray-400">
            Aún no se han registrado compras.
          </p>

          <Permission permission="compras.crear">
            <button
              type="button"
              onClick={onCreatePurchase}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c] sm:px-3"
            >
              <span>Nueva compra</span>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </Permission>
        </>
      )}
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
  onCreatePurchase,
  annullingId = null,
}) => {
  const { hasPermission } = usePermissions();
  const canCreateReturn = hasPermission("devoluciones_en_compras.crear");

  if (currentData.length === 0) {
    return <EmptyState isSearching={isSearching} onCreatePurchase={onCreatePurchase} />;
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
      <table className="min-w-max w-full table-auto">
        <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">
              No. Facturación
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Fecha compra</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Proveedor</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Cantidad</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Precio</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Límite devolución
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((purchase, index) => {
            const baseRowBg = index % 2 === 0 ? "bg-gray-100" : "bg-white";
            const isAnnulled = purchase.estado === "Anulada";
            const isAnnulling = annullingId === purchase.id;
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
                  className={`sticky left-0 z-10 px-3 py-2 text-center font-mono text-xs text-gray-700 whitespace-nowrap transition-colors duration-150 ${baseRowBg} group-hover:bg-blue-50`}
                >
                  {highlightText(purchase.numeroFacturacion || purchase.id || "-", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(purchase.fechaCompra || "-", search)}
                </td>
                <td className="max-w-xs truncate px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap">
                  {highlightText(purchase.proveedor || "Proveedor no disponible", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                  {highlightText(purchase.cantidadProductos?.toString() || "0", search)}
                </td>
                <td className="px-3 py-2 text-center text-xs font-semibold text-gray-800 whitespace-nowrap">
                  {highlightText(
                    `$${Number(purchase.precioTotal || 0).toLocaleString("es-CO")}`,
                    search
                  )}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      isExpired
                        ? "border-red-300 bg-red-100 text-red-700"
                        : "border-blue-300 bg-blue-100 text-blue-700"
                    }`}
                  >
                    {formatDate(purchase.maxReturnDate)}
                    {isExpired ? " (Vencida)" : ""}
                  </span>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
                      purchase.estado
                    )}`}
                  >
                    {highlightText(purchase.estado || "Sin estado", search)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <Permission permission="compras.ver_informacion">
                    <button
                      type="button"
                      onClick={() => handleViewDetail(purchase)}
                      className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]"
                      title="Ver información"
                    >
                      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
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
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                    </button>
                    </Permission>

                    <Permission permission="compras.anular">
                    {isAnnulled ? (
                      <span
                        className="cursor-not-allowed text-gray-200"
                        title="No disponible para compras anuladas"
                      >
                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCancel(purchase)}
                        disabled={isAnnulling}
                        className={`text-gray-400 transition ${
                          isAnnulling
                            ? "cursor-wait opacity-50"
                            : "cursor-pointer hover:scale-110 hover:text-red-500"
                        }`}
                        title={isAnnulling ? "Procesando..." : "Anular compra"}
                      >
                        {isAnnulling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        )}
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
