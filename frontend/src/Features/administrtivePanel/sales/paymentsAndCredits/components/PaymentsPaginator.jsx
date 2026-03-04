import { ChevronLeft, ChevronRight } from "lucide-react";

/* ───────────────── Pagination ───────────────── */
function Pagination({ currentPage, totalPages, onPageChange }) {

  const safeTotalPages = Math.max(1, totalPages);

  const getVisiblePages = () => {
    if (safeTotalPages <= 5)
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);

    if (currentPage <= 3)
      return [1, 2, 3, "...", safeTotalPages];

    if (currentPage >= safeTotalPages - 2)
      return [1, "...", safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      safeTotalPages
    ];
  };

  return (
    <div className="flex items-center gap-1">

      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer"
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Pages */}
      {getVisiblePages().map((page, i) =>
        page === "..." ? (
          <span
            key={`d-${i}`}
            className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === page
                ? "bg-[#004D77] text-white shadow-sm"
                : "text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() =>
          onPageChange(Math.min(safeTotalPages, currentPage + 1))
        }
        disabled={currentPage === safeTotalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === safeTotalPages
            ? "text-gray-300 cursor-not-allowed"
            : "text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer"
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ───────────────── PaymentsPaginator ───────────────── */
export default function PaymentsPaginator({
  itemsPerPage,
  totalItems,
  currentPage,
  onPageChange
}) {

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  );

  const firstItem =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const lastItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 mt-4">

      <p className="text-xs sm:text-sm font-semibold text-gray-700">
        Mostrando{" "}
        <span className="text-[#004D77]">
          {firstItem}–{lastItem}
        </span>{" "}
        registros de{" "}
        <span className="text-[#004D77]">
          {totalItems}
        </span>
      </p>

      <div className="px-1.5 py-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>

    </div>
  );
}