import { Search } from "lucide-react";

export default function TableFilters({
  search = "",
  setSearch = () => {},
  startDate = "",
  setStartDate = () => {},
  endDate = "",
  setEndDate = () => {},
  setCurrentPage = () => {},
  children
}) {

  return (
    <div className="mb-4">

      <div className="flex flex-wrap items-end gap-4 w-full">

        {/* BUSCADOR */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
          />

          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          />
        </div>


        {/* FECHA INICIAL */}
        <div className="flex-1 min-w-[170px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Inicial
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setCurrentPage(1)
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
              setEndDate(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
          />
        </div>


        {/* FILTROS EXTRA */}
        {children}

      </div>

    </div>
  )
}