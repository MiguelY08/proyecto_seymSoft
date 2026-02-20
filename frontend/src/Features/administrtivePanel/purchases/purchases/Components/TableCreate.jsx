import React from "react";
import { Trash2 } from "lucide-react";

const CreateTable = ({ currentData, handleDeleteItem }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-3 text-left font-semibold">Producto</th>
            <th className="px-3 py-3 text-left font-semibold">Código De Barras</th>
            <th className="px-3 py-3 text-left font-semibold">Proveedor</th>
            <th className="px-3 py-3 text-center font-semibold">Cantidad</th>
            <th className="px-3 py-3 text-right font-semibold">Valor Unit</th>
            <th className="px-3 py-3 text-right font-semibold">Subtotal</th>
            <th className="px-3 py-3 text-center font-semibold">%IVA</th>
            <th className="px-3 py-3 text-right font-semibold">IVA</th>
            <th className="px-3 py-3 text-right font-semibold">Total</th>
            <th className="px-3 py-3 text-center font-semibold">
              <Trash2 size={14} />
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr
              key={item.id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition-colors`}
            >
              <td className="px-3 py-3 text-gray-800 font-medium">
                {item.producto}
              </td>
              <td className="px-3 py-3 text-gray-600">
                {item.codigoBarras}
              </td>
              <td className="px-3 py-3 text-gray-600">
                {item.proveedor}
              </td>
              <td className="px-3 py-3 text-center text-gray-800 font-semibold">
                {item.cantidad}
              </td>
              <td className="px-3 py-3 text-right text-gray-800">
                {item.valorUnit.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-right text-gray-800 font-semibold">
                {item.subtotal.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center text-gray-600">
                {item.iva}%
              </td>
              <td className="px-3 py-3 text-right text-gray-800">
                {item.ivaValor.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-right text-gray-800 font-bold">
                {item.total.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center">
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreateTable;
