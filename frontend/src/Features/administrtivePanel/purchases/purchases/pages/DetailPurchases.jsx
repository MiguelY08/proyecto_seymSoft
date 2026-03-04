import React, { useState, useMemo, useEffect } from "react";
import Pagination from "../../../../shared/PaginationLanding";

// 🔥 Mock data (solo desarrollo)
const mockPurchase = {
  numeroFacturacion: "FAC-001",
  fechaCompra: "2026-01-02",
  proveedor: "Importadora Global",
  estado: "Activo",
  precioTotal: 450000,
  ivaTotal: 85500,
  productos: Array.from({ length: 32 }, (_, i) => ({
    nombre: `Producto ${i + 1}`,
    codigoBarras: `COD-${1000 + i}`,
    cantidad: Math.floor(Math.random() * 5) + 1,
    valorUnit: 20000,
    iva: 19,
    ivaValor: 3800,
    subtotal: 23800,
  })),
};

const DetailPurchases = ({ purchase, onClose }) => {
  const data =
    purchase && purchase.productos && purchase.productos.length > 0
      ? purchase
      : mockPurchase;

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("es-CO", {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        })
      : n;

  // 🔥 PAGINACIÓN (máximo 5 productos)
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return data.productos.slice(start, start + productsPerPage);
  }, [currentPage, data.productos]);

  // Reiniciar página si cambia compra
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">      <div
        className="bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ width: "820px", maxWidth: "95vw" }}
      >
        {/* Header */}
       <div
        className="relative flex items-center px-6 py-3"
        style={{ backgroundColor: "#004D77" }}
        >
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-white font-semibold text-2xl ">
            Detalle De Compra
        </h2>

        <button
            onClick={onClose}
            className="ml-auto text-white text-lg font-bold hover:opacity-75 transition"
        >
            ✕
        </button>
        </div>

        {/* Body */}
        <div className="px-10 py-6 text-sm text-gray-800">
          <div className="flex gap-16 mb-4">
            <p>
              <strong>No.Facturación:</strong> {data.numeroFacturacion}
            </p>
          </div>

          <div className="mb-5">
            <div className="flex gap-4">
              <p><strong>Fecha:</strong></p>
              <p>{data.fechaCompra}</p>
            </div>

            <div className="flex gap-4 mt-1">
              <p><strong>Proveedor:</strong></p>
              <p>{data.proveedor}</p>
            </div>
          </div>

          {/* Tabla */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b border-gray-300">
                <th className="pb-2 font-semibold text-gray-700">Producto</th>
                <th className="pb-2 font-semibold text-gray-700">Código Barras</th>
                <th className="pb-2 font-semibold text-gray-700 text-right">Cantidad</th>
                <th className="pb-2 font-semibold text-gray-700 text-right">Valor Unit</th>
                <th className="pb-2 font-semibold text-gray-700 text-right">%IVA</th>
                <th className="pb-2 font-semibold text-gray-700 text-right">IVA</th>
                <th className="pb-2 font-semibold text-gray-700 text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((p, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">{p.nombre}</td>
                  <td className="py-2">{p.codigoBarras}</td>
                  <td className="py-2 text-right">{p.cantidad}</td>
                  <td className="py-2 text-right">{fmt(p.valorUnit)}</td>
                  <td className="py-2 text-right">{p.iva}%</td>
                  <td className="py-2 text-right">{fmt(p.ivaValor)}</td>
                  <td className="py-2 text-right">{fmt(p.subtotal)}</td>
                </tr>
              ))}

              <tr>
                <td colSpan={5} className="pt-3 pb-1 font-bold">IVA</td>
                <td colSpan={2} className="pt-3 pb-1 text-right">
                  {fmt(data.ivaTotal)}
                </td>
              </tr>

              <tr>
                <td colSpan={5} className="py-1 font-bold">Total</td>
                <td colSpan={2} className="py-1 text-right font-bold text-gray-900">
                  ${Number(data.precioTotal).toLocaleString("es-CO")}.00
                </td>
              </tr>
            </tbody>
          </table>

          {/* 🔥 TU PAGINADOR */}
          <Pagination
            totalProducts={data.productos.length}
            productsPerPage={productsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />

          {/* Botón cerrar */}
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="px-24 py-2 rounded text-white text-sm bg-[#3F3F46] hover:bg-[#6B7280]  transition-all duration-200"
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