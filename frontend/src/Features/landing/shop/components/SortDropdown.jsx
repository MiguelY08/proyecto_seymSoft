import { ChevronDown } from "lucide-react";

/* ── Estilos inyectados (coherentes con Home/Favorites) ── */
const SORT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .sort-container {
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    position: relative;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  .sort-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    font-size: 0.8rem;
    font-weight: 700;
    color: #1e4060;
    letter-spacing: 0.02em;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 40px;
    transition: all 0.2s ease;
  }
  .sort-trigger:hover {
    background: #f0f8ff;
    color: #004D77;
  }
  .sort-label {
    font-weight: 600;
    color: #64748b;
  }
  .sort-value {
    font-weight: 800;
    color: #004D77;
  }
  .sort-icon {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }
  .sort-icon.rotated {
    transform: rotate(180deg);
  }
  .sort-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 200px;
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 77, 119, 0.12);
    overflow: hidden;
    z-index: 50;
    animation: sortFadeIn 0.2s ease;
  }
  @keyframes sortFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .sort-option {
    width: 100%;
    text-align: left;
    padding: 10px 16px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #334155;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .sort-option:hover {
    background: #f0f8ff;
    color: #004D77;
  }
  .sort-option.active {
    background: #e8f4fd;
    color: #004D77;
    font-weight: 800;
    border-left: 3px solid #004D77;
  }
`;

let sortStylesInjected = false;
function injectSortStyles() {
  if (sortStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = SORT_STYLES;
  document.head.appendChild(style);
  sortStylesInjected = true;
}

function SortDropdown({
  selectedSort,
  setSelectedSort,
  sortOpen,
  setSortOpen,
  sortOptions
}) {
  injectSortStyles();

  return (
    <div className="sort-container">
      <button
        onClick={() => setSortOpen(!sortOpen)}
        className="sort-trigger"
      >
        <span className="sort-label">Ordenar por:</span>
        <span className="sort-value">
          {sortOptions.find(opt => opt.value === selectedSort)?.label}
        </span>
        <ChevronDown className={`sort-icon ${sortOpen ? 'rotated' : ''}`} />
      </button>

      {sortOpen && (
        <div className="sort-dropdown">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedSort(option.value);
                setSortOpen(false);
              }}
              className={`sort-option ${selectedSort === option.value ? 'active' : ''}`}
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