import { Search } from "lucide-react";

export default function TableFilters({
  search = "",
  setSearch = () => {},
  startDate = "",
  setStartDate = () => {},
  endDate = "",
  setEndDate = () => {},
  setCurrentPage = () => {},
  children,
  showDateFilters = true, 
  searchWidth = "flex-1 min-w-[220px]"
}) {
  return (
    <div>
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">

        {/* BUSCADOR */}
        <div className={`relative ${searchWidth}`}>
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
          />

          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            strokeWidth={2}
          />
        </div>

        {/*  SOLO SE MUESTRA SI ES TRUE */}
        {showDateFilters && (
          <>
            {/* FECHA INICIAL */}
            <div className="flex-1 min-w-[170px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha Inicial
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
              />
            </div>

            {/* FECHA FINAL */}
            <div className="flex-1 min-w-[170px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha Final
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
              />
            </div>
          </>
        )}

        {/* FILTROS EXTRA */}
        {children}
      </div>
    </div>
  );
}
