// features/administrtivePanel/purchases/purchases/components/TableCreate.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const BarcodeCell = ({ codigoBarras, codigosExtra = [] }) => {
  const total = codigosExtra.length;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-mono text-xs">{codigoBarras}</span>
      {total > 0 && (
        <div className="relative group">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-semibold text-[#004D77] cursor-default select-none">
            +{total} más
          </span>
          <div className="absolute z-50 bottom-full left-0 mb-1.5 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-xl px-3 py-2.5 min-w-[180px]">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Códigos adicionales</p>
            <ul className="flex flex-col gap-1">
              {codigosExtra.map((code, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs font-mono text-gray-700">
                  <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-[#004D77] text-white text-[9px] font-bold shrink-0">{i + 1}</span>
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

const CreateTable = ({ currentData, handleDeleteItem }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-3 text-left font-semibold">Producto</th>
            <th className="px-3 py-3 text-left font-semibold">Código De Barras</th>
            <th className="px-3 py-3 text-center font-semibold">Cantidad</th>
            <th className="px-3 py-3 text-right font-semibold">Valor Unit</th>
            <th className="px-3 py-3 text-right font-semibold">Subtotal</th>
            <th className="px-3 py-3 text-center font-semibold">%IVA</th>
            <th className="px-3 py-3 text-right font-semibold">IVA</th>
            <th className="px-3 py-3 text-right font-semibold">Total</th>
            <th className="px-3 py-3 text-center font-semibold"><Trash2 size={14} /></th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr key={item.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>
              <td className="px-3 py-3 text-gray-800 font-medium">{item.producto}</td>
              <td className="px-3 py-3 text-gray-600">
                <BarcodeCell codigoBarras={item.codigoBarras} codigosExtra={item.codigosExtra || []} />
              </td>
              <td className="px-3 py-3 text-center text-gray-800 font-semibold">{item.cantidad}</td>
              <td className="px-3 py-3 text-right text-gray-800">{item.valorUnit.toLocaleString()}</td>
              <td className="px-3 py-3 text-right text-gray-800 font-semibold">{item.subtotal.toLocaleString()}</td>
              <td className="px-3 py-3 text-center text-gray-600">{item.iva}%</td>
              <td className="px-3 py-3 text-right text-gray-800">{item.ivaValor.toLocaleString()}</td>
              <td className="px-3 py-3 text-right text-gray-800 font-bold">{item.total.toLocaleString()}</td>
              <td className="px-3 py-3 text-center">
                <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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