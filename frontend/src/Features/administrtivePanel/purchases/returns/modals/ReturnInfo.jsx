import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Package,
  PackageCheck,
  SquarePen,
  Truck,
  X,
} from "lucide-react";
import {
  calcularTotalesProducto,
  formatCurrency,
  getBadgeEstadoDevolucion,
  getBadgeEstadoProducto,
} from "../helpers/returnsHelpers";

const Badge = ({ label, style }) => (
  <span
    className="inline-flex items-center rounded-full border border-black/5 px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap"
    style={style}
  >
    {label || "-"}
  </span>
);

const DetailRow = ({ icon: Icon, label, value, highlight = false }) => {
  const hasValue =
    value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div className="flex items-start gap-3 border-b border-gray-50 py-2 last:border-0">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
          hasValue ? "bg-[#004D77]/10" : "bg-gray-100"
        }`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${
            hasValue ? "text-[#004D77]" : "text-gray-300"
          }`}
          strokeWidth={1.8}
        />
      </div>
      <div className="min-w-0 flex-1">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide leading-none text-gray-400">
          {label}
        </span>
        <span
          className={`block truncate text-sm font-medium ${
            hasValue
              ? highlight
                ? "font-semibold text-[#004D77]"
                : "text-gray-800"
              : "font-normal italic text-gray-300"
          }`}
        >
          {hasValue ? value : "-"}
        </span>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div className="mb-3 flex items-center gap-2">
    <div className="h-px flex-1 bg-gray-100" />
    <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {children}
    </span>
    <div className="h-px flex-1 bg-gray-100" />
  </div>
);

const hasPriceData = (product) =>
  Number(product?.valorUnit ?? 0) > 0 || Number(product?.iva ?? 0) > 0;

const ReturnInfo = ({ devolucion, onClose, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;
  const products = devolucion?.productos ?? [];
  const status = devolucion?.estado ?? "";
  const isAnnulled = status === "Anulada";
  const isClosed =
    isAnnulled || status === "Listo" || status.startsWith("Procesada");
  const canEdit = !isClosed;
  const statusStyle = getBadgeEstadoDevolucion(status);
  const providerName =
    devolucion?.proveedor ??
    devolucion?.provider?.name ??
    devolucion?.purchase?.provider?.name ??
    "-";
  const progressLabel =
    devolucion?.progress?.label ??
    `${devolucion?.progress?.completed ?? 0}/${
      devolucion?.progress?.total ?? products.length
    }`;
  const completedDetails =
    devolucion?.completedDetails ?? devolucion?.progress?.completed ?? 0;
  const totalDetails =
    devolucion?.totalDetails ?? devolucion?.progress?.total ?? products.length;
  const showTotals = products.some(hasPriceData);
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

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return products.slice(start, start + productsPerPage);
  }, [currentPage, products]);

  const { totalSubtotal, totalIva, totalGeneral } = useMemo(
    () =>
      products.reduce(
        (totals, product) => {
          const { subtotal, ivaValor, total } =
            calcularTotalesProducto(product);
          return {
            totalSubtotal: totals.totalSubtotal + subtotal,
            totalIva: totals.totalIva + ivaValor,
            totalGeneral: totals.totalGeneral + total,
          };
        },
        { totalSubtotal: 0, totalIva: 0, totalGeneral: 0 }
      ),
    [products]
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between bg-[#004D77] px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white">
              Devolución #{devolucion?.id ?? "-"}
            </h2>
            <p className="mt-0.5 text-xs text-white/60">
              Detalle de devolución en compra
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-white transition-colors hover:bg-white/20"
            title="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isAnnulled && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-semibold text-red-600">
                  Devolución anulada
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-red-500">
                  {cancellationReason || "Sin motivo registrado."}
                </p>
                {cancellationDate && (
                  <p className="mt-1 text-xs text-red-400">
                    Anulada el {cancellationDate}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="px-6 py-5">
              <SectionTitle>Información general</SectionTitle>
              <DetailRow
                icon={FileText}
                label="No. devolución"
                value={devolucion?.id}
                highlight
              />
              <DetailRow
                icon={FileText}
                label="No. factura"
                value={devolucion?.idCompra}
              />
              <DetailRow
                icon={Truck}
                label="Proveedor"
                value={providerName}
              />
              <DetailRow
                icon={Calendar}
                label="Fecha de devolución"
                value={devolucion?.fechaDevolucion}
              />
            </div>

            <div className="px-6 py-5">
              <SectionTitle>Estado del proceso</SectionTitle>
              <DetailRow
                icon={PackageCheck}
                label="Estado"
                value={<Badge label={status} style={statusStyle} />}
              />
              <DetailRow
                icon={CheckCircle2}
                label="Progreso"
                value={progressLabel}
                highlight
              />
              <DetailRow
                icon={Package}
                label="Detalles listos"
                value={`${completedDetails} de ${totalDetails}`}
              />
              <DetailRow
                icon={FileText}
                label="Compra asociada"
                value={devolucion?.purchaseId ?? devolucion?.idCompra}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-5">
            <SectionTitle>Productos devueltos</SectionTitle>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 py-10">
                <Package className="h-7 w-7 text-gray-300" strokeWidth={1.5} />
                <p className="text-xs text-gray-400">
                  No hay productos registrados en esta devolución
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-[920px] w-full">
                  <thead className="bg-[#004D77]/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Referencia
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Código
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Motivo
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Tipo
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Estado
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                        Cant.
                      </th>
                      {showTotals && (
                        <>
                          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                            V. unit.
                          </th>
                          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                            IVA
                          </th>
                          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                            Total
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((product, index) => {
                      const { ivaValor, total } =
                        calcularTotalesProducto(product);
                      const productStatusStyle = getBadgeEstadoProducto(
                        product.estado
                      );

                      return (
                        <tr
                          key={
                            product.id ??
                            `${product.codigoBarras}-${index}`
                          }
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="max-w-[190px] truncate px-3 py-2 text-xs font-medium text-gray-800">
                            {product.nombre ?? "-"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {product.referencia || "-"}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-600 whitespace-nowrap">
                            {product.codigoBarras || "-"}
                          </td>
                          <td className="max-w-[160px] truncate px-3 py-2 text-xs text-gray-600">
                            {product.motivo || "-"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {product.tipoDevolucion || "-"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge
                              label={product.estado}
                              style={productStatusStyle}
                            />
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                            {product.cantidadDevolver ?? "-"}
                          </td>
                          {showTotals && (
                            <>
                              <td className="px-3 py-2 text-right text-xs text-gray-600">
                                {formatCurrency(product.valorUnit)}
                              </td>
                              <td className="px-3 py-2 text-right text-xs text-gray-600">
                                {formatCurrency(ivaValor)}
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-semibold text-gray-800">
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
            )}

            {showTotals ? (
              <div className="mt-3 ml-auto w-full max-w-sm overflow-hidden rounded-lg border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
                  <span className="text-xs font-medium text-gray-500">
                    Subtotal
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(totalSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
                  <span className="text-xs font-medium text-gray-500">IVA</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(totalIva)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#004D77] px-4 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-white/80">
                    Total devolución
                  </span>
                  <span className="text-base font-bold text-white">
                    {formatCurrency(totalGeneral)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs leading-relaxed text-blue-800">
                  El detalle recibido no incluye valores unitarios ni IVA. Se
                  muestran únicamente los datos operativos de la devolución.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between px-1">
                <span className="text-xs text-gray-400">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#004D77] hover:text-[#004D77] disabled:cursor-not-allowed disabled:opacity-40"
                    title="Página anterior"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#004D77] hover:text-[#004D77] disabled:cursor-not-allowed disabled:opacity-40"
                    title="Página siguiente"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-gray-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
          >
            Cerrar
          </button>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(devolucion);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#004D77] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003a5c]"
            >
              <SquarePen className="h-4 w-4" strokeWidth={1.8} />
              Editar devolución
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnInfo;
