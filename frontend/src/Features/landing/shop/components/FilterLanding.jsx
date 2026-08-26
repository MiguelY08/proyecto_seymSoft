import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const SIDEBAR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .filter-sidebar {
    font-family: 'Nunito', sans-serif;
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 20px;
    padding: 20px 16px;
    transition: all 0.2s;
  }
  .filter-header { margin-bottom: 16px; }
  .filter-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 4px;
  }
  .filter-results {
    font-size: 0.7rem;
    font-weight: 700;
    color: #9abcce;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .filter-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    padding: 6px 9px;
    border: 1px solid #d8e4ec;
    border-radius: 8px;
    background: #fff;
    color: #44677d;
    font-size: 0.72rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }
  .filter-clear-btn:hover {
    border-color: #004D77;
    background: #f0f7fb;
    color: #004D77;
  }
  .filter-section {
    border-top: 1px solid #eef2f6;
    margin-top: 16px;
  }
  .filter-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 12px 0 8px;
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1e4060;
    cursor: pointer;
    transition: color 0.2s;
  }
  .filter-section-header:hover { color: #004D77; }
  .filter-options { margin-bottom: 12px; }
  .filter-option { margin-bottom: 8px; }
  .filter-option-main,
  .filter-subcategory-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 0;
  }
  .filter-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.8rem;
    color: #334155;
  }
  .filter-checkbox-label input {
    width: 16px;
    height: 16px;
    accent-color: #004D77;
    cursor: pointer;
  }
  .filter-count {
    font-size: 0.7rem;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 20px;
  }
  .filter-expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #9abcce;
    transition: color 0.2s;
  }
  .filter-expand-btn:hover { color: #004D77; }
  .filter-subcategory-list {
    overflow: hidden;
    transition: max-height 0.3s ease-out, opacity 0.2s ease;
    max-height: 0;
    opacity: 0;
  }
  .filter-subcategory-list.open {
    max-height: 2000px;
    opacity: 1;
  }
  .filter-subcategory-item {
    margin-left: 24px;
    padding: 4px 0 4px 12px;
    border-left: 2px solid #e2edf5;
  }
  .filter-empty {
    padding: 12px 0;
    font-size: 0.78rem;
    color: #94a3b8;
  }
  @media (max-width: 767px) {
    .filter-sidebar {
      border-radius: 16px;
      margin-bottom: 16px;
    }
  }
`;

let sidebarStylesInjected = false;
function injectSidebarStyles() {
  if (sidebarStylesInjected) return;
  const style = document.createElement("style");
  style.textContent = SIDEBAR_STYLES;
  document.head.appendChild(style);
  sidebarStylesInjected = true;
}

function Filters({
  totalProducts,
  categories,
  categoryOpen,
  setCategoryOpen,
  selectedCategoryIds,
  selectedSubcategoryIds,
  onCategoryChange,
  onSubcategoryChange,
  onClearFilters,
}) {
  injectSidebarStyles();
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (categoryId) => {
    setExpandedCategories(current => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  };
  const hasActiveFilters =
    selectedCategoryIds.length > 0 || selectedSubcategoryIds.length > 0;

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h2 className="filter-title">Filtros</h2>
        <p className="filter-results">{totalProducts} resultados</p>
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-clear-btn"
            onClick={onClearFilters}
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="filter-section">
        <button
          type="button"
          className="filter-section-header"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          <span>Categorías</span>
          {categoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {categoryOpen && (
          <div className="filter-options">
            {categories.length === 0 ? (
              <p className="filter-empty">No hay categorías disponibles.</p>
            ) : (
              categories.map(category => (
                <div key={category.id} className="filter-option">
                  <div className="filter-option-main">
                    <label className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => onCategoryChange(category.id)}
                      />
                      <span>{category.name}</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="filter-count">{category.count}</span>
                      {category.subcategories.length > 0 && (
                        <button
                          type="button"
                          className="filter-expand-btn"
                          aria-label={`Mostrar subcategorías de ${category.name}`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          {expandedCategories[category.id]
                            ? <ChevronUp size={14} />
                            : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    className={`filter-subcategory-list ${
                      expandedCategories[category.id] ? "open" : ""
                    }`}
                  >
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="filter-subcategory-item">
                        <div className="filter-subcategory-header">
                          <label className="filter-checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedSubcategoryIds.includes(subcategory.id)}
                              onChange={() => onSubcategoryChange(subcategory.id)}
                            />
                            <span>{subcategory.name}</span>
                          </label>
                          <span className="filter-count">{subcategory.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Filters;
