import React from "react";
import { Search } from "lucide-react";

export const PurchasesFilters = ({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
}) => {
  return (
    <div className="mb-3 flex items-end gap-69 flex-wrap">
      <div className="flex items-end gap-7 flex-wrap">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
          />
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          />
        </div>

        {/* 📅 FILTRO POR FECHA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-56">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha Inicial
            </label>
            <input
              type="date"
              value={fechaInicial}
              onChange={(e) => {
                setFechaInicial(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
            />
          </div>

          <div className="w-full sm:w-56">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha Final
            </label>
            <input
              type="date"
              value={fechaFinal}
              onChange={(e) => {
                setFechaFinal(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

{/* <PurchasesFilters
          search={search}
          setSearch={setSearch}
          fechaInicial={fechaInicial}
          setFechaInicial={setFechaInicial}
          fechaFinal={fechaFinal}
          setFechaFinal={setFechaFinal}
          setCurrentPage={setCurrentPage}
        /> */}