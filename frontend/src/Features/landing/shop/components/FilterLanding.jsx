import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SIDEBAR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .filter-sidebar {
    font-family: 'Nunito', sans-serif;
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 20px;
    padding: 20px 16px;
    transition: all 0.2s;
    /* Sin límite de altura ni overflow */
  }

  .filter-header {
    margin-bottom: 16px;
  }
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

  .filter-section {
    border-top: 1px solid #eef2f6;
    margin-top: 16px;
  }
  .filter-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 12px 0 8px 0;
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1e4060;
    cursor: pointer;
    transition: color 0.2s;
  }
  .filter-section-header:hover {
    color: #004D77;
  }

  /* Contenedor de opciones SIN scroll interno */
  .filter-options {
    margin-bottom: 12px;
    /* Sin max-height ni overflow */
  }

  .filter-option {
    margin-bottom: 8px;
  }
  .filter-option-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
  .filter-expand-btn:hover {
    color: #004D77;
  }

  /* Subcategorías con animación suave y SIN scroll (max-height enorme) */
  .filter-subcategory-list {
    overflow: hidden;
    transition: max-height 0.3s ease-out, opacity 0.2s ease;
    max-height: 0;
    opacity: 0;
  }
  .filter-subcategory-list.open {
    max-height: 2000px;  /* Suficiente para cualquier cantidad */
    opacity: 1;
  }
  .filter-subcategory-item {
    margin-left: 24px;
    padding: 4px 0;
    border-left: 2px solid #e2edf5;
    padding-left: 12px;
  }
  .filter-subcategory-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .filter-child-list {
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    max-height: 0;
  }
  .filter-child-list.open {
    max-height: 2000px;
  }
  .filter-child-item {
    margin-left: 20px;
    padding: 2px 0;
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
  const style = document.createElement('style');
  style.textContent = SIDEBAR_STYLES;
  document.head.appendChild(style);
  sidebarStylesInjected = true;
}

function Filters({
  totalProducts,
  categories,
  brands,
  categoryOpen,
  brandOpen,
  setCategoryOpen,
  setBrandOpen,
  selectedCategories,
  selectedBrands,
  handleCategoryChange,
  handleBrandChange
}) {
  injectSidebarStyles();

  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubs, setExpandedSubs] = useState({});

  const toggleCategory = (catName) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const toggleSubcategory = (subName) => {
    setExpandedSubs(prev => ({ ...prev, [subName]: !prev[subName] }));
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h2 className="filter-title">Filtros</h2>
        <p className="filter-results">{totalProducts} resultados</p>
      </div>

      {/* Sección Categorías */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          <span>Categorías</span>
          {categoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {categoryOpen && (
          <div className="filter-options">
            {categories.map(cat => (
              <div key={cat.name} className="filter-option">
                <div className="filter-option-main">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => handleCategoryChange(cat.name)}
                    />
                    <span>{cat.name}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="filter-count">{cat.count}</span>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <button
                        className="filter-expand-btn"
                        onClick={() => toggleCategory(cat.name)}
                      >
                        {expandedCategories[cat.name] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className={`filter-subcategory-list ${expandedCategories[cat.name] ? 'open' : ''}`}>
                  {cat.subcategories?.map(sub => (
                    <div key={sub.name} className="filter-subcategory-item">
                      <div className="filter-subcategory-header">
                        <label className="filter-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(sub.name)}
                            onChange={() => handleCategoryChange(sub.name)}
                          />
                          <span>{sub.name}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="filter-count">{sub.count}</span>
                          {sub.children && sub.children.length > 0 && (
                            <button
                              className="filter-expand-btn"
                              onClick={() => toggleSubcategory(sub.name)}
                            >
                              {expandedSubs[sub.name] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`filter-child-list ${expandedSubs[sub.name] ? 'open' : ''}`}>
                        {sub.children?.map(child => (
                          <div key={child.name} className="filter-child-item">
                            <label className="filter-checkbox-label">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(child.name)}
                                onChange={() => handleCategoryChange(child.name)}
                              />
                              <span>{child.name}</span>
                            </label>
                            <span className="filter-count ml-2">{child.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección Marcas */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => setBrandOpen(!brandOpen)}
        >
          <span>Marca</span>
          {brandOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {brandOpen && (
          <div className="filter-options">
            {brands.map(brand => (
              <div key={brand} className="filter-option-main">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span>{brand}</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Filters;