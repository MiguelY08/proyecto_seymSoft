import React from "react";
import { Trash2, Package, Ruler, Scale, Droplet } from "lucide-react";

const TYPE_ICONS = {
  "Unidad": Package,
  "X Paca": Ruler,
  "Litros": Droplet,
  "Kilos": Scale,
};

const TypeBadge = ({ type }) => {
  const Icon = TYPE_ICONS[type] || Package;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-medium text-gray-600">
      <Icon className="w-3 h-3" strokeWidth={1.8} />
      {type || "Unidad"}
    </span>
  );
};

const BarcodeCell = ({ codigoBarras, codigosExtra = [] }) => (
  <div className="flex items-center gap-1.5">
    <span className="font-mono text-xs text-gray-600">{codigoBarras}</span>
    {codigosExtra.length > 0 && (
      <div className="group relative">
        <span className="inline-flex cursor-default select-none items-center rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#004D77]">
          +{codigosExtra.length}
        </span>
        <div className="absolute bottom-full left-0 z-50 mb-2 hidden min-w-[190px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-xl group-hover:block">
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

const CreateTable = ({ currentData, handleDeleteItem }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-[1050px] w-full">
      <thead className="bg-[#004D77]/5">
        <tr>
          <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Producto</th>
          <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Código de barras</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Tipo</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Cant.</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Stock a sumar</th>
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Valor unit.</th>
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Subtotal</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">IVA</th>
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Valor IVA</th>
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Total</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Acción</th>
        </tr>
      </thead>
      <tbody>
        {currentData.map((item, index) => (
          <tr
            key={item.id}
            className={`${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } transition-colors hover:bg-blue-50`}
          >
            <td className="px-3 py-2 text-xs font-medium text-gray-800">{item.producto}</td>
            <td className="px-3 py-2">
              <BarcodeCell
                codigoBarras={item.codigoBarras}
                codigosExtra={item.codigosExtra || []}
              />
            </td>
            <td className="px-3 py-2 text-center">
              <TypeBadge type={item.purchaseType || "Unidad"} />
            </td>
            <td className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
              {item.cantidad}
            </td>
            <td className="px-3 py-2 text-center text-xs font-semibold text-[#004D77]">
              {item.stockTotal?.toLocaleString() || item.cantidad}
              {item.purchaseTypeValue === "pack" && item.quantityPerPack > 0 && (
                <span className="block text-[8px] text-gray-400 font-normal">
                  ({item.cantidad} pacas × {item.quantityPerPack} und/paca)
                </span>
              )}
              {item.purchaseTypeValue === "pack" && item.quantityPerPack === 0 && (
                <span className="block text-[8px] text-amber-500 font-normal">
                  ⚠️ Sin cantidad por paca
                </span>
              )}
            </td>
            <td className="px-3 py-2 text-right text-xs text-gray-600">
              ${item.valorUnit.toLocaleString("es-CO")}
            </td>
            <td className="px-3 py-2 text-right text-xs text-gray-600">
              ${item.subtotal.toLocaleString("es-CO")}
            </td>
            <td className="px-3 py-2 text-center text-xs text-gray-600">
              {item.iva}%
            </td>
            <td className="px-3 py-2 text-right text-xs text-gray-600">
              ${item.ivaValor.toLocaleString("es-CO")}
            </td>
            <td className="px-3 py-2 text-right text-xs font-semibold text-gray-800">
              ${item.total.toLocaleString("es-CO")}
            </td>
            <td className="px-3 py-2 text-center">
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-red-500"
                title="Eliminar producto"
              >
                <Trash2 size={15} strokeWidth={1.7} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CreateTable;