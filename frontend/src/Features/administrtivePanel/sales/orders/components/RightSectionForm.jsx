import React from 'react';
import { Package } from 'lucide-react';

/**
 * RightSectionForm — Sección derecha del formulario de edición de orden.
 * Muestra la lista de productos en una tabla y el total.
 * Si no hay productos, muestra un estado vacío.
 *
 * @param {Object} props
 * @param {Array} props.productos - Lista de productos de la orden.
 * @param {number} props.total - Total de la orden.
 */
const RightSectionForm = ({ productos, total }) => {
  if (!productos || productos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-gray-500 text-sm">No hay productos en este pedido</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Productos del Pedido</p>
          <p className="text-xs text-gray-400">{productos.length} artículo(s)</p>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P. Unitario</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((prod, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-800 font-medium">{prod.nombre}</td>
                <td className="px-5 py-3 text-right text-gray-600">${prod.precioUnitario.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-gray-600">{prod.cantidad}</td>
                <td className="px-5 py-3 text-right text-gray-800 font-semibold">${prod.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end items-center px-5 py-4 bg-gray-50 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700 mr-4">Total:</span>
        <span className="text-xl font-bold text-[#004D77]">${total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default RightSectionForm;