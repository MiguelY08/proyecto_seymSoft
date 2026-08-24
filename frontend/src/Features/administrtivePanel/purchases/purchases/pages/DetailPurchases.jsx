import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Barcode,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Package,
  PackageCheck,
  Truck,
  ReceiptText,
  Ruler,
  Scale,
  Droplet,
} from "lucide-react";
import Pagination from "../../../../shared/PaginationLanding";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";

const TYPE_ICONS = {
  "Unidad": Package,
  "X Paca": Ruler,
  "Litros": Droplet,
  "Kilos": Scale,
};

const STATUS_STYLES = {
  Completada: "border-green-300 bg-green-100 text-green-700",
  "Completada*": "border-emerald-300 bg-emerald-100 text-emerald-700",
  "Proc. devolución": "border-amber-300 bg-amber-100 text-amber-700",
  Anulada: "border-red-200 bg-red-100 text-red-600",
};

const EstadoBadge = ({ estado }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
      STATUS_STYLES[estado] ?? "border-gray-300 bg-gray-100 text-gray-600"
    }`}
  >
    {estado ?? "-"}
  </span>
);

const TypeBadge = ({ type }) => {
  const Icon = TYPE_ICONS[type] || Package;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-medium text-gray-600">
      <Icon className="w-3 h-3" strokeWidth={1.8} />
      {type || "Unidad"}
    </span>
  );
};

const DetailRow = ({ icon: Icon, label, value, highlight = false }) => {
  const hasValue = value !== undefined && value !== null && String(value).trim();

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

const BarcodeCell = ({ codigoBarras, codigosExtra = [] }) => (
  <div className="flex items-center justify-center gap-1.5">
    <span className="font-mono text-xs text-gray-600">{codigoBarras ?? "-"}</span>
    {codigosExtra.length > 0 && (
      <div className="group relative">
        <span className="inline-flex cursor-default select-none items-center rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#004D77]">
          +{codigosExtra.length}
        </span>
        <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden min-w-[190px] -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-xl group-hover:block">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Códigos adicionales
          </p>
          <ul className="flex flex-col gap-1.5">
            {codigosExtra.map((code, index) => (
              <li
                key={`${code}-${index}`}
                className="flex items-center gap-2 text-xs font-mono text-gray-700"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#004D77] text-[9px] font-bold text-white">
                  {index + 1}
                </span>
                {code}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
);

const DetailPurchases = ({ purchase, onClose, loading = false }) => {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose, { hasUnsavedChanges: false });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const products = Array.isArray(purchase?.productos) ? purchase.productos : [];

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return products.slice(start, start + productsPerPage);
  }, [currentPage, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  if (!purchase || loading) return null;

  const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatCurrency = (value) => `$${formatNumber(value)}`;
  const isAnnulled = purchase.estado === "Anulada";
  const hasCompletedReturn = purchase.estado === "Completada*";
  const isReturnInProgress = purchase.estado === "Proc. devolución";
  const ivaTotal =
    purchase.ivaTotal ??
    products.reduce((sum, product) => sum + Number(product.ivaValor ?? 0), 0);
  const purchaseTotal =
    purchase.precioTotal ??
    products.reduce(
      (sum, product) =>
        sum + Number(product.total ?? product.subtotal ?? 0),
      0
    );

  const openReturns = () => {
    onClose();
    navigate("/admin/purchases/returns-p", {
      state: { openReturnForm: true, purchase },
    });
  };

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-lg"
      >
        <PurchaseModalHeader
          icon={ReceiptText}
          eyebrow="Gestión de compras"
          title={`Detalle de compra #${purchase.numeroFacturacion ?? purchase.id ?? "-"}`}
          onClose={onClose}
          closeLabel="Cerrar detalle de compra"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isAnnulled && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-semibold text-red-600">Compra anulada</p>
                <p className="mt-0.5 text-xs leading-relaxed text-red-500">
                  {purchase.motivoAnulacion || "Sin motivo registrado."}
                </p>
              </div>
            </div>
          )}

          {hasCompletedReturn && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Proceso de devolución completado
                </p>
                <p className="mt-0.5 text-xs text-emerald-600">
                  Esta compra ha pasado por un proceso de devolución.
                </p>
              </div>
            </div>
          )}

          {isReturnInProgress && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  Devolución en proceso
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-600">
                  Esta compra tiene una devolución en curso.{" "}
                  <button
                    type="button"
                    onClick={openReturns}
                    className="cursor-pointer font-semibold underline underline-offset-2 hover:text-amber-800"
                  >
                    Ir a devoluciones
                  </button>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="px-6 py-5">
              <SectionTitle>Información general</SectionTitle>
              <DetailRow
                icon={FileText}
                label="No. facturación"
                value={purchase.numeroFacturacion}
                highlight
              />
              <DetailRow
                icon={Calendar}
                label="Fecha de compra"
                value={purchase.fechaCompra}
              />
              <DetailRow
                icon={Truck}
                label="Proveedor"
                value={purchase.proveedor}
              />
              <DetailRow
                icon={PackageCheck}
                label="Estado"
                value={<EstadoBadge estado={purchase.estado} />}
              />
            </div>

            <div className="px-6 py-5">
              <SectionTitle>Resumen de compra</SectionTitle>
              <DetailRow
                icon={Package}
                label="Unidades compradas"
                value={`${purchase.cantidadProductos ?? 0} unidades`}
              />
              <DetailRow
                icon={Barcode}
                label="Productos registrados"
                value={`${products.length} líneas`}
              />
              <DetailRow
                icon={DollarSign}
                label="IVA total"
                value={formatCurrency(ivaTotal)}
              />
              <DetailRow
                icon={DollarSign}
                label="Total de la compra"
                value={formatCurrency(purchaseTotal)}
                highlight
              />
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-5">
            <SectionTitle>Productos comprados</SectionTitle>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 py-10">
                <Package className="h-7 w-7 text-gray-300" strokeWidth={1.5} />
                <p className="text-xs text-gray-400">
                  No hay productos registrados en esta compra
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-[850px] w-full">
                    <thead className="bg-[#004D77]/5">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Código de barras
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Tipo
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Cant.
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Valor unit.
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          IVA
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Valor IVA
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product, index) => (
                        <tr
                          key={product.id ?? `${product.codigoBarras}-${index}`}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-2 text-xs font-medium text-gray-800">
                            {product.nombre ?? "-"}
                          </td>
                          <td className="px-3 py-2">
                            <BarcodeCell
                              codigoBarras={product.codigoBarras}
                              codigosExtra={product.codigosExtra ?? []}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <TypeBadge type={product.purchaseType || "Unidad"} />
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                            {product.cantidad ?? 0}
                            {product.purchaseType === "X Paca" && product.quantityPerPack > 0 && (
                              <span className="block text-[9px] text-gray-400 font-normal">
                                {product.cantidad} pacas × {product.quantityPerPack} und = {product.cantidad * product.quantityPerPack} und
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-600">
                            {formatCurrency(product.valorUnit)}
                          </td>
                          <td className="px-3 py-2 text-center text-xs text-gray-600">
                            {product.iva ?? 0}%
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-600">
                            {formatCurrency(product.ivaValor)}
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-semibold text-gray-800">
                            {formatCurrency(product.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 ml-auto w-full max-w-sm overflow-hidden rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
                    <span className="text-xs font-medium text-gray-500">IVA total</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {formatCurrency(ivaTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#004D77] px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/80">
                      Total compra
                    </span>
                    <span className="text-base font-bold text-white">
                      {formatCurrency(purchaseTotal)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {products.length > productsPerPage && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  totalProducts={products.length}
                  productsPerPage={productsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPurchases;
