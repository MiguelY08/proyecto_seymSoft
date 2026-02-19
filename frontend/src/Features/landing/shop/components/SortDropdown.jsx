import { ChevronDown } from "lucide-react";

function SortDropdown({
  selectedSort,
  setSelectedSort,
  sortOpen,
  setSortOpen,
  sortOptions
}) {
  return (
    <div className="flex justify-end mb-4 relative">
      <button
        onClick={() => setSortOpen(!sortOpen)}
        className="flex items-center gap-2 text-[#000000]"
      >
        Ordenar por:{" "}
        <span className="text-[#004D77] font-medium">
          {sortOptions.find(opt => opt.value === selectedSort)?.label}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            sortOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {sortOpen && (
        <div className="absolute right-0 mt-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedSort(option.value);
                setSortOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                selectedSort === option.value
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortDropdown;
