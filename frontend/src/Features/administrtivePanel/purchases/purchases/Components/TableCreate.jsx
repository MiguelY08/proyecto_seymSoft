import React from "react";
import { Trash2, Package, Ruler, Scale, Droplet, Pencil } from "lucide-react";

const TYPE_ICONS = {
  "Unidad": Package,
  "X Paca": Ruler,
  "Litros": Droplet,
  "Kilos": Scale,
};

const TypeBadge = ({ type }) => {
  const Icon = TYPE_ICONS[type] || Package;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-medium text-blue-700">
      <Icon className="w-3 h-3" strokeWidth={1.8} />
      {type || "Unidad"}
    </span>
  );
};

const CreateTable = ({ currentData, handleDeleteItem, handleEditItem }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-[660px] w-full">
      <thead className="bg-[#004D77]/5">
        <tr>
          <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Producto</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Tipo</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Cant.</th>
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Subtotal</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">IVA</th>
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Total</th>
          <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Acciones</th>
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
            <td className="px-3 py-2 text-xs font-medium text-gray-800">
              {item.producto}
              {item.variantName && (
                <span className="font-normal text-gray-500"> - {item.variantName}</span>
              )}
            </td>
            <td className="px-3 py-2 text-center">
              <TypeBadge type={item.purchaseType || "Unidad"} />
            </td>
            <td className="px-3 py-2 text-center text-xs">
              {item.purchaseTypeValue === "pack" && item.quantityPerPack > 0 ? (
                <>
                  <span className="font-semibold text-gray-700">
                    {Number(item.cantidad).toLocaleString("es-CO")} pacas
                  </span>
                  <span className="block text-[10px] text-[#004D77]">
                    = {Number(item.stockTotal).toLocaleString("es-CO")} unidades
                  </span>
                </>
              ) : (
                <span className="font-semibold text-gray-700">
                  {Number(item.cantidad).toLocaleString("es-CO")}
                </span>
              )}
            </td>
            <td className="px-3 py-2 text-right text-xs text-gray-600">
              ${item.subtotal.toLocaleString("es-CO")}
            </td>
            <td className="px-3 py-2 text-center text-xs text-gray-600">
              <span className="font-semibold text-gray-700">{item.iva}%</span>
              <span className="block text-[10px] text-[#004D77]">
                ${Number(item.ivaValor || 0).toLocaleString("es-CO")}
              </span>
            </td>
            <td className="px-3 py-2 text-right text-xs font-semibold text-gray-800">
              ${item.total.toLocaleString("es-CO")}
            </td>
            <td className="px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleEditItem(item)}
                  className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]"
                  title="Editar producto"
                >
                  <Pencil size={15} strokeWidth={1.7} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-red-500"
                  title="Eliminar producto"
                >
                  <Trash2 size={15} strokeWidth={1.7} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CreateTable;