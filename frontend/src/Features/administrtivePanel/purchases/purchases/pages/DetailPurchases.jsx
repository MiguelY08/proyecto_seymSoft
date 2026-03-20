import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import Pagination from "../../../../shared/PaginationLanding";

// 🔥 Mock data (solo desarrollo)
const mockPurchase = {
  numeroFacturacion: "FAC-001",
  fechaCompra: "2026-01-02",
  proveedor: "Importadora Global",
  estado: "Anulada",
  motivoAnulacion: "Productos recibidos en mal estado y proveedor no responde.",
  productos: [
    { nombre: "Cuaderno Norma", codigoBarras: "COD-1001", cantidad: 2, valorUnit: 8000, iva: 19 },
    { nombre: "Lapicero Azul", codigoBarras: "COD-1002", cantidad: 5, valorUnit: 1500, iva: 19 },
    { nombre: "Borrador Nata", codigoBarras: "COD-1003", cantidad: 3, valorUnit: 1200, iva: 19 },
    { nombre: "Regla 30cm", codigoBarras: "COD-1004", cantidad: 2, valorUnit: 3000, iva: 19 },
    { nombre: "Marcador Permanente", codigoBarras: "COD-1005", cantidad: 1, valorUnit: 4500, iva: 19 },
  ].map((p) => {
    const subtotal = p.valorUnit * p.cantidad;
    const ivaValor = Math.round(subtotal * 0.19);
    return { ...p, subtotal, ivaValor };
  }),
};

// Calculamos totales para el mock
mockPurchase.ivaTotal = mockPurchase.productos.reduce((sum, p) => sum + p.ivaValor, 0);
mockPurchase.precioTotal =
  mockPurchase.productos.reduce((sum, p) => sum + p.subtotal, 0) + mockPurchase.ivaTotal;

// Componente para mostrar el estado
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

const DetailPurchases = ({ purchase, onClose }) => {
  const navigate  = useNavigate();
  // Datos seguros: purchase o mock
  const data      = purchase ?? mockPurchase;
  const productos = Array.isArray(data.productos) ? data.productos : [];

  // Función de formato de números
  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("es-CO", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      : n ?? "-";

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return productos.slice(start, start + productsPerPage);
  }, [currentPage, productos]);

  useEffect(() => {
    setCurrentPage(1); // reset paginación cuando cambien los productos
  }, [productos]);

  const isAnulada        = data.estado === "Anulada";
  const isCompletadaStar = data.estado === "Completada*";
  const isProcDevolucion = data.estado === "Proc. devolución";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div
        className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "780px", maxWidth: "95vw", maxHeight: "95vh" }}
      >
        {/* Header */}
        <div className="relative flex items-center px-6 py-2.5 shrink-0" style={{ backgroundColor: "#004D77" }}>
          <h2 className="absolute left-1/2 transform -translate-x-1/2 text-white font-semibold text-xl">
            Detalle De Compra
          </h2>
          <button
            onClick={onClose}
            className="ml-auto text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-8 py-4 text-sm text-gray-800 overflow-y-auto flex-1">
          {/* Info general */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 mb-3">
            <p><strong>No.Facturación:</strong> {data.numeroFacturacion ?? "-"}</p>
            <p><strong>Fecha:</strong> {data.fechaCompra ?? "-"}</p>
            <p><strong>Proveedor:</strong> {data.proveedor ?? "-"}</p>
            <div className="flex items-center gap-2">
              <strong>Estado:</strong>
              <EstadoBadge estado={data.estado ?? "N/A"} />
            </div>
          </div>

          {/* ── Banner de estado especial ────────────────────────────────── */}

          {/* Anulada — rojo */}
          {isAnulada && data.motivoAnulacion && (
            <div
              className="flex gap-2.5 items-start rounded-lg px-3 py-2.5 mb-3 text-xs"
              style={{ backgroundColor: "#fff1f2", border: "1px solid #fecaca" }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#b91c1c" }} strokeWidth={1.8} />
              <div>
                <p className="font-semibold mb-0.5" style={{ color: "#b91c1c" }}>
                  Motivo de anulación
                </p>
                <p style={{ color: "#7f1d1d" }}>{data.motivoAnulacion}</p>
              </div>
            </div>
          )}

          {/* Completada* — verde */}
          {isCompletadaStar && (
            <div
              className="flex gap-2.5 items-start rounded-lg px-3 py-2.5 mb-3 text-xs"
              style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#15803d" }} strokeWidth={1.8} />
              <p style={{ color: "#166534" }}>
                Esta compra ha pasado por un proceso de devolución.
              </p>
            </div>
          )}

          {/* Proc. devolución — amarillo con enlace */}
          {isProcDevolucion && (
            <div
              className="flex gap-2.5 items-start rounded-lg px-3 py-2.5 mb-3 text-xs"
              style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a" }}
            >
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
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-left border-b border-gray-300">
                <th className="pb-1.5 font-semibold text-gray-700">Producto</th>
                <th className="pb-1.5 font-semibold text-gray-700">Código Barras</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-right">Cantidad</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-right">Valor Unit</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-right">%IVA</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-right">IVA</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5">{p.nombre ?? "-"}</td>
                  <td className="py-1.5">{p.codigoBarras ?? "-"}</td>
                  <td className="py-1.5 text-right">{p.cantidad ?? 0}</td>
                  <td className="py-1.5 text-right">{fmt(p.valorUnit)}</td>
                  <td className="py-1.5 text-right">{p.iva ?? 0}%</td>
                  <td className="py-1.5 text-right">{fmt(p.ivaValor)}</td>
                  <td className="py-1.5 text-right">{fmt(p.subtotal)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="pt-2 pb-1 font-bold text-sm">IVA</td>
                <td colSpan={2} className="pt-2 pb-1 text-right text-sm">{fmt(data.ivaTotal ?? 0)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="py-1 font-bold text-sm">Total</td>
                <td colSpan={2} className="py-1 text-right font-bold text-sm text-gray-900">
                  ${Number(data.precioTotal ?? 0).toLocaleString("es-CO")}.00
                </td>
              </tr>
            </tbody>
          </table>

          {/* Paginador */}
          <Pagination
            totalProducts={productos.length}
            productsPerPage={productsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />

          {/* Botón cerrar */}
          <div className="flex justify-center mt-3">
            <button
              onClick={onClose}
              className="px-20 py-2 rounded text-white text-sm bg-[#3F3F46] hover:bg-[#6B7280] transition-all duration-200"
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