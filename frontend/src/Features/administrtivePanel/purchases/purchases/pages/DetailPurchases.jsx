// Features/administrtivePanel/purchases/purchases/components/DetailPurchases.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import Pagination from "../../../../shared/PaginationLanding";

const EstadoBadge = ({ estado }) => {
  const styles = {
    "Completada":        { bg: "#dcfce7", color: "#15803d" },
    "Completada*":       { bg: "#d1fae5", color: "#065f46" },
    "Proc. devolución":  { bg: "#fef9c3", color: "#a16207" },
    "Anulada":           { bg: "#fee2e2", color: "#b91c1c" },
  };
  const s = styles[estado] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {estado ?? "-"}
    </span>
  );
};

const BarcodeCell = ({ codigoBarras, codigosExtra = [] }) => {
  const total = codigosExtra.length;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-mono text-xs">{codigoBarras ?? "-"}</span>
      {total > 0 && (
        <div className="relative group">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-semibold text-[#004D77] cursor-default select-none">
            +{total} más
          </span>
          <div className="absolute z-50 bottom-full left-0 mb-1.5 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-xl px-3 py-2.5 min-w-[180px]">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Códigos adicionales
            </p>
            <ul className="flex flex-col gap-1">
              {codigosExtra.map((code, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs font-mono text-gray-700">
                  <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-[#004D77] text-white text-[9px] font-bold shrink-0">
                    {i + 1}
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
};

const DetailPurchases = ({ purchase, onClose, loading = false }) => {
  const navigate = useNavigate();
  
  if (!purchase && !loading) {
    return null;
  }

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : n ?? "-";

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const productos = Array.isArray(purchase?.productos) ? purchase.productos : [];
  
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return productos.slice(start, start + productsPerPage);
  }, [currentPage, productos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [productos]);

  const isAnulada        = purchase?.estado === "Anulada";
  const isCompletadaStar = purchase?.estado === "Completada*";
  const isProcDevolucion = purchase?.estado === "Proc. devolución";

  const ivaTotal = purchase?.ivaTotal ?? productos.reduce((sum, p) => sum + (p.ivaValor || 0), 0);
  const precioTotal = purchase?.precioTotal ?? productos.reduce((sum, p) => sum + (p.total || p.subtotal || 0), 0);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div
        className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "1000px", maxWidth: "95vw", maxHeight: "95vh" }}
      >
        {/* Header */}
        <div className="relative flex items-center px-6 py-3 shrink-0" style={{ backgroundColor: "#004D77" }}>
          <h2 className="absolute left-1/2 transform -translate-x-1/2 text-white font-semibold text-lg">
            Detalle De Compra
          </h2>
          <button onClick={onClose} className="ml-auto text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 text-sm text-gray-800 overflow-y-auto flex-1">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
            <div>
              <p className="text-xs text-gray-500">No. Facturación</p>
              <p className="font-semibold text-gray-800">{purchase?.numeroFacturacion ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="font-semibold text-gray-800">{purchase?.fechaCompra ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Proveedor</p>
              <p className="font-semibold text-gray-800">{purchase?.proveedor ?? "-"}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Estado</p>
              <EstadoBadge estado={purchase?.estado ?? "N/A"} />
            </div>
          </div>

          {/* Cantidad de productos */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <strong>Cantidad total de productos:</strong> {purchase?.cantidadProductos ?? 0} unidades
            </p>
            <p className="text-sm mt-1">
              <strong>Total de la compra:</strong> ${fmt(precioTotal)}
            </p>
          </div>

          {/* Motivo de anulación */}
          {isAnulada && purchase?.motivoAnulacion && (
            <div className="flex gap-2.5 items-start rounded-lg px-3 py-2.5 mb-4 text-xs" style={{ backgroundColor: "#fff1f2", border: "1px solid #fecaca" }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#b91c1c" }} strokeWidth={1.8} />
              <div>
                <p className="font-semibold mb-0.5" style={{ color: "#b91c1c" }}>Motivo de anulación</p>
                <p style={{ color: "#7f1d1d" }}>{purchase.motivoAnulacion}</p>
              </div>
            </div>
          )}

          {/* Completada* */}
          {isCompletadaStar && (
            <div className="flex gap-2.5 items-start rounded-lg px-3 py-2.5 mb-4 text-xs" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#15803d" }} strokeWidth={1.8} />
              <p style={{ color: "#166534" }}>Esta compra ha pasado por un proceso de devolución.</p>
            </div>
          )}

          {/* Proc. devolución */}
          {isProcDevolucion && (
            <div className="flex gap-2.5 items-start rounded-lg px-3 py-2.5 mb-4 text-xs" style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a" }}>
              <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#a16207" }} strokeWidth={1.8} />
              <p style={{ color: "#854d0e" }}>
                Esta compra tiene un proceso de devolución en curso.{" "}
                <button
                  onClick={() => { onClose(); navigate("/admin/purchases/returns-p"); }}
                  className="font-semibold underline underline-offset-2 cursor-pointer transition-opacity hover:opacity-75"
                  style={{ color: "#a16207" }}
                >
                  Pulse aquí para ir a Devoluciones en Compras.
                </button>
              </p>
            </div>
          )}

          {/* Tabla de productos */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Productos comprados</h3>
            {productos.length === 0 ? (
              <p className="text-xs text-gray-500">No hay productos registrados en esta compra.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="text-left border-b border-gray-300">
                      <th className="pb-2 font-semibold text-gray-700">Producto</th>
                      <th className="pb-2 font-semibold text-gray-700">Código Barras</th>
                      <th className="pb-2 font-semibold text-gray-700 text-center">Cantidad</th>
                      <th className="pb-2 font-semibold text-gray-700 text-right">Valor Unit</th>
                      <th className="pb-2 font-semibold text-gray-700 text-center">%IVA</th>
                      <th className="pb-2 font-semibold text-gray-700 text-right">IVA</th>
                      <th className="pb-2 font-semibold text-gray-700 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((p, i) => (
                      <tr key={p.id || i} className="border-b border-gray-100">
                        <td className="py-2">{p.nombre ?? "-"}</td>
                        <td className="py-2">
                          <BarcodeCell codigoBarras={p.codigoBarras} codigosExtra={p.codigosExtra || []} />
                        </td>
                        <td className="py-2 text-center">{p.cantidad ?? 0}</td>
                        <td className="py-2 text-right">${fmt(p.valorUnit)}</td>
                        <td className="py-2 text-center">{p.iva ?? 0}%</td>
                        <td className="py-2 text-right">${fmt(p.ivaValor)}</td>
                        <td className="py-2 text-right">${fmt(p.subtotal)}</td>
                      </tr>
                    ))}
                    {/* Totales */}
                    <tr className="border-t border-gray-300">
                      <td colSpan={5} className="pt-2 pb-1 font-bold text-sm text-right">IVA Total</td>
                      <td colSpan={2} className="pt-2 pb-1 font-bold text-sm text-right">${fmt(ivaTotal)}</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td colSpan={5} className="py-2 font-bold text-sm text-right">Total Compra</td>
                      <td colSpan={2} className="py-2 font-bold text-sm text-right text-[#004D77]">${fmt(precioTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginador */}
          {productos.length > productsPerPage && (
            <div className="mt-4 flex justify-center">
              <Pagination
                totalProducts={productos.length}
                productsPerPage={productsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}

          {/* Botón cerrar */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-white text-sm bg-gray-500 hover:bg-gray-600 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPurchases;