import { useEffect, useRef } from "react";
import {
  FolderTree,
  History,
  Loader2,
  Package,
  Search,
  Tags,
  X,
} from "lucide-react";

const resultTypeConfig = {
  product: {
    label: "Producto",
    icon: Package,
    className: "bg-[#e8f3f9] text-[#004D77]",
  },
  category: {
    label: "Categoria",
    icon: FolderTree,
    className: "bg-emerald-50 text-emerald-700",
  },
  subcategory: {
    label: "Subcategoria",
    icon: Tags,
    className: "bg-amber-50 text-amber-700",
  },
};

function HeaderSearchResult({
  result,
  onSelect
}) {
  const config =
    resultTypeConfig[result.type] ?? resultTypeConfig.product;
  const Icon =
    config.icon;

  return (
    <button
      type="button"
      role="option"
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect(result);
      }}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#f3f8fb] focus:bg-[#f3f8fb] focus:outline-none"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.className}`}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#0c2a3a]">
          {result.label}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {result.description || config.label}
        </span>
      </span>
      <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500 sm:inline-flex">
        {config.label}
      </span>
    </button>
  );
}

function HeaderRecentSearchItem({
  search,
  onSelect,
  onRemove
}) {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          onSelect(search);
        }}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#0c2a3a] transition-colors duration-150 hover:bg-[#f3f8fb] focus:bg-[#f3f8fb] focus:outline-none"
      >
        <History className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
        <span className="truncate">{search}</span>
      </button>
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove(search);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-red-500 focus:bg-slate-100 focus:outline-none"
        aria-label={`Eliminar busqueda ${search}`}
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function HeaderSearch({
  searchQuery,
  setSearchQuery,
  onSubmit,
  results = [],
  recentSearches = [],
  shouldShowResults = false,
  shouldShowRecentSearches = false,
  hasResults = false,
  isLoading = false,
  error = null,
  onFocus,
  onSelectResult,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onClose,
  onClear
}) {
  const searchRef = useRef(null);

  useEffect(() => {
    if (!shouldShowResults && !shouldShowRecentSearches) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, shouldShowRecentSearches, shouldShowResults]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose?.();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="min-w-0 flex-1 max-w-[13rem] sm:max-w-sm lg:max-w-xl"
      ref={searchRef}
    >
      <div className="relative group">
        <input
          type="text"
          aria-label="Buscar productos"
          placeholder="Buscar"
          value={searchQuery}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          onChange={(e) =>
            setSearchQuery(
              e.target.value
            )
          }
          aria-autocomplete="list"
          aria-expanded={shouldShowResults || shouldShowRecentSearches}
          aria-controls="header-search-results"
          className="w-full rounded-full border border-[#e2edf5] bg-[#f8fafc] py-1.5 pl-3 pr-16 text-xs text-gray-700 outline-none transition-all duration-150 placeholder-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 sm:pr-[4.25rem] sm:text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute right-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors duration-150 hover:bg-slate-200 hover:text-[#004D77]"
            aria-label="Limpiar busqueda"
            onClick={onClear}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
          aria-label="Buscar productos"
        >
          <Search
            className="h-4 w-4 text-gray-500 transition-all duration-150 hover:text-[#004D77]"
            strokeWidth={2}
          />
        </button>

        {(shouldShowResults || shouldShowRecentSearches) && (
          <div
            id="header-search-results"
            role="listbox"
            className="fixed left-2 right-2 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-[#dcebf3] bg-white shadow-[0_18px_45px_rgba(12,42,58,0.16)] sm:absolute sm:left-0 sm:right-0 sm:top-[calc(100%+0.5rem)] sm:max-h-[70vh]"
          >
            {shouldShowRecentSearches ? (
              <div className="py-1">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Busquedas recientes
                  </span>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onClearRecentSearches?.();
                    }}
                    className="shrink-0 text-xs font-bold text-[#004D77] transition-colors duration-150 hover:text-[#003d5e]"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="max-h-[18rem] overflow-y-auto py-1">
                  {recentSearches.map((search) => (
                    <HeaderRecentSearchItem
                      key={search}
                      search={search}
                      onSelect={onSelectRecentSearch}
                      onRemove={onRemoveRecentSearch}
                    />
                  ))}
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#004D77]" />
                <span>Buscando...</span>
              </div>
            ) : error ? (
              <div className="px-3 py-3 text-sm text-red-600">
                No se pudo cargar el buscador.
              </div>
            ) : hasResults ? (
              <div className="max-h-[22rem] overflow-y-auto py-1">
                {results.map((result) => (
                  <HeaderSearchResult
                    key={`${result.type}-${result.id}`}
                    result={result}
                    onSelect={onSelectResult}
                  />
                ))}
              </div>
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500">
                No encontramos coincidencias. Prueba otro termino.
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

export default HeaderSearch;
