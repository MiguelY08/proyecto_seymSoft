import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, SquarePen, X } from "lucide-react";
import {
  calcularTotalesProducto,
  formatCurrency,
  getBadgeEstadoDevolucion,
  getBadgeEstadoProducto,
} from "../helpers/returnsHelpers";

const Badge = ({ label, style }) => (
  <span
    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
    style={style}
  >
    {label || "-"}
  </span>
);

const InfoRow = ({ label, children }) => (
  <div className="flex flex-col py-3 gap-0.5 min-w-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    {children}
  </div>
);

const TextValue = ({ children }) => (
  <span className="text-sm font-medium text-gray-800 truncate">{children || "-"}</span>
);

const hasPriceData = (producto) =>
  Number(producto?.valorUnit ?? 0) > 0 || Number(producto?.iva ?? 0) > 0;

const ReturnInfo = ({ devolucion, onClose, onEdit }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 4;

  const productos = devolucion?.productos ?? [];
  const estado = devolucion?.estado ?? "";
  const isAnulada = estado === "Anulada";
  const isClosed = isAnulada || estado === "Listo" || estado.startsWith("Procesada");
  const canEdit = !isClosed;
  const estadoStyle = getBadgeEstadoDevolucion(estado);
  const providerName =
    devolucion?.proveedor ??
    devolucion?.provider?.name ??
    devolucion?.purchase?.provider?.name ??
    "-";
  const progressLabel =
    devolucion?.progress?.label ??
    `${devolucion?.progress?.completed ?? 0}/${devolucion?.progress?.total ?? productos.length}`;
  const shouldShowTotals = productos.some(hasPriceData);
  const cancellationReason =
    devolucion?.motivoAnulacion ??
    devolucion?.cancellationReason ??
    devolucion?.annulmentReason ??
    null;
  const cancellationDate =
    devolucion?.fechaAnulacion ??
    devolucion?.cancelledAt ??
    devolucion?.annulledAt ??
    null;

  const totalPaginas = Math.max(1, Math.ceil(productos.length / porPagina));
  const productosPagina = useMemo(() => {
    const start = (paginaActual - 1) * porPagina;
    return productos.slice(start, start + porPagina);
  }, [paginaActual, productos]);

  const { totalSubtotal, totalIva, totalGeneral } = useMemo(
    () =>
      productos.reduce(
        (acc, producto) => {
          const { subtotal, ivaValor, total } = calcularTotalesProducto(producto);
          return {
            totalSubtotal: acc.totalSubtotal + subtotal,
            totalIva: acc.totalIva + ivaValor,
            totalGeneral: acc.totalGeneral + total,
          };
        },
        { totalSubtotal: 0, totalIva: 0, totalGeneral: 0 }
      ),
    [productos]
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-4xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-lg leading-tight">Detalle de Devolucion</h2>
            <span className="text-white/60 text-xs">{devolucion?.id ?? "-"}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col">
          <div className="flex flex-col divide-y divide-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
              <InfoRow label="No. Devolucion">
                <TextValue>{devolucion?.id}</TextValue>
              </InfoRow>
              <InfoRow label="No. Factura">
                <TextValue>{devolucion?.idCompra}</TextValue>
              </InfoRow>
              <InfoRow label="Proveedor">
                <TextValue>{providerName}</TextValue>
              </InfoRow>
              <InfoRow label="Fecha">
                <TextValue>{devolucion?.fechaDevolucion}</TextValue>
              </InfoRow>
              <InfoRow label="Estado">
                <Badge label={estado} style={estadoStyle} />
              </InfoRow>
              <InfoRow label="Progreso">
                <TextValue>{progressLabel}</TextValue>
              </InfoRow>
              <InfoRow label="Detalles">
                <TextValue>{String(productos.length)}</TextValue>
              </InfoRow>
              <InfoRow label="Compra">
                <TextValue>{devolucion?.purchaseId}</TextValue>
              </InfoRow>
            </div>
          </div>

          {isAnulada && (
            <div
              className="flex gap-2.5 items-start rounded-lg px-4 py-3 text-xs mb-3"
              style={{ backgroundColor: "#fff1f2", border: "1px solid #fecaca" }}
            >
              <AlertTriangle
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: "#b91c1c" }}
                strokeWidth={1.8}
              />
              <div>
                <p className="font-semibold mb-0.5" style={{ color: "#b91c1c" }}>
                  Motivo de anulacion
                </p>
                <p style={{ color: "#7f1d1d" }}>
                  {cancellationReason || "Sin motivo registrado."}
                </p>
                {cancellationDate && (
                  <p className="mt-1" style={{ color: "#9f1239" }}>
                    Anulada el {cancellationDate}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Productos ({productos.length})
            </p>

            <div className="rounded-lg overflow-x-auto border border-gray-200">
              <table className="w-full min-w-[760px] text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Producto</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Referencia</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Codigo</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Motivo</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tipo</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Estado</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Cant.</th>
                    {shouldShowTotals && (
                      <>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">V. Unit</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">IVA</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {productosPagina.map((producto, index) => {
                    const { ivaValor, total } = calcularTotalesProducto(producto);
                    const estadoProductoStyle = getBadgeEstadoProducto(producto.estado);

                    return (
                      <tr
                        key={producto.id ?? `${producto.codigoBarras}-${index}`}
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-gray-800 max-w-[180px] truncate">
                          {producto.nombre ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          {producto.referencia || "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          {producto.codigoBarras || "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{producto.motivo || "-"}</td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          {producto.tipoDevolucion || "-"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge label={producto.estado} style={estadoProductoStyle} />
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-gray-700">
                          {producto.cantidadDevolver ?? "-"}
                        </td>
                        {shouldShowTotals && (
                          <>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {formatCurrency(producto.valorUnit)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {formatCurrency(ivaValor)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-800">
                              {formatCurrency(total)}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {shouldShowTotals ? (
              <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subtotal</span>
                  <span className="text-xs font-semibold text-gray-700">{formatCurrency(totalSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">IVA</span>
                  <span className="text-xs font-semibold text-gray-700">{formatCurrency(totalIva)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: "#f0f9ff" }}>
                  <span className="text-sm font-bold text-gray-600">Total devolucion</span>
                  <span className="text-sm font-bold" style={{ color: "#004D77" }}>
                    {formatCurrency(totalGeneral)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                El detalle recibido no incluye valores unitarios ni IVA; por ahora se muestran solo los datos
                operativos de la devolucion.
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-gray-400">
                  Pagina {paginaActual} de {totalPaginas}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPaginaActual((page) => Math.max(1, page - 1))}
                    disabled={paginaActual === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 bg-white hover:border-[#004D77] hover:text-[#004D77] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPaginaActual((page) => Math.min(totalPaginas, page + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 bg-white hover:border-[#004D77] hover:text-[#004D77] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          {canEdit && onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(devolucion);
              }}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
            >
              <SquarePen className="w-4 h-4" strokeWidth={1.8} />
              Editar devolucion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnInfo;
