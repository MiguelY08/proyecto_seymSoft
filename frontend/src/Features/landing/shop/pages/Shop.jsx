import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Filters from "../components/FilterLanding";
import SortDropdown from "../components/SortDropdown";
import ProductCard from "../../../shared/productCard/ProductCard";
import Pagination from "../../../shared/PaginationLanding";
import ShopHero from "../components/ShopHero";

import ProductsService from "../../../administrtivePanel/purchases/products/services/productsServices.js";
import categoriesService from "../../../administrtivePanel/purchases/categories/services/categoriesService.js";
import useClientType from "../../../shared/hooks/useClientType.js";
import { getDisplayPricing } from "../../../shared/utils/shopPricingHelper.js";

import BgTienda from "../../../../assets/BgTienda.png";

/* ── Estilos inyectados (coherentes con Home/Favorites) ── */
const SHOP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes shop-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .shop-page {
    background: #f6f9fc;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    min-height: 100vh;
  }

  .shop-container {
    max-width: var(--store-content-max);
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) var(--store-content-x);
  }

  .shop-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 32px;
    align-items: start;
  }

  @media (max-width: 1023px) {
    .shop-layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  .shop-filters-col {
    position: sticky;
    top: 20px;
    align-self: start;
    z-index: 5;
  }

  @media (max-width: 1023px) {
    .shop-filters-col {
      position: static;
    }
  }

  .shop-products-col {
    min-width: 0;
  }

  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 8px;
    animation: shop-fadeUp 0.4s ease;
  }

  @media (min-width: 340px) {
    .products-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
  }

  @media (min-width: 640px) {
    .products-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
  }

  @media (min-width: 1024px) {
    .products-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
  }

  @media (min-width: 1180px) {
    .products-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 24px;
    margin-top: 16px;
  }
  .empty-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 8px;
  }
  .empty-sub {
    font-size: 0.85rem;
    color: #64748b;
    max-width: 280px;
  }

  /* Loading skeleton */
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 16px;
  }
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

let shopStylesInjected = false;
function injectShopStyles() {
  if (shopStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = SHOP_STYLES;
  document.head.appendChild(style);
  shopStylesInjected = true;
}

function buildCategoryFilters(categories, products) {
  return categories.map(category => {
    const categoryId = Number(category.id);
    const categoryProducts = products.filter(product =>
      product.categories?.some(item => Number(item.id) === categoryId)
    );

    return {
      id: categoryId,
      name: category.name ?? category.categoryName ?? "Sin categoría",
      count: categoryProducts.length,
      subcategories: (category.subcategories || []).map(subcategory => {
        const subcategoryId = Number(subcategory.id);

        return {
          id: subcategoryId,
          name: subcategory.name,
          count: categoryProducts.filter(product =>
            product.subcategories?.some(
              item => Number(item.id) === subcategoryId
            )
          ).length,
        };
      }),
    };
  });
}

function getPositiveParamId(searchParams, paramName) {
  const paramId = Number(searchParams.get(paramName));
  return Number.isInteger(paramId) && paramId > 0 ? paramId : null;
}

function getSelectedIdsFromParam(searchParams, paramName) {
  const paramId = getPositiveParamId(searchParams, paramName);
  return paramId ? [paramId] : [];
}

function areSelectedIdsEqual(currentIds, nextIds) {
  return (
    currentIds.length === nextIds.length &&
    currentIds.every((id, index) => id === nextIds[index])
  );
}

function toggleSelectedId(currentIds, nextId) {
  return currentIds.includes(nextId)
    ? currentIds.filter(id => id !== nextId)
    : [...currentIds, nextId];
}

function Shop() {
  injectShopStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const internalSearchSyncRef = useRef("");
  const applyingSearchParamsRef = useRef(false);

  // ═══ ESTADO ═══
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => {
    return getSelectedIdsFromParam(searchParams, "category");
  });
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState(() => {
    return getSelectedIdsFromParam(searchParams, "subcategory");
  });
  const selectedFiltersRef = useRef({
    categoryIds: selectedCategoryIds,
    subcategoryIds: selectedSubcategoryIds,
  });
  selectedFiltersRef.current = {
    categoryIds: selectedCategoryIds,
    subcategoryIds: selectedSubcategoryIds,
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("relevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);

  // Hook para obtener clientType
  const { clientType } = useClientType();

  const productsPerPage = 8;

  // ═══ CARGAR PRODUCTOS ═══
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const allProducts = await ProductsService.list();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error cargando productos:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // ═══ CARGAR CATEGORÍAS ═══
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const allCategories = await categoriesService.getAllActiveWithSubcategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Los contadores y el catálogo deben partir del mismo conjunto de productos.
  const activeProducts = useMemo(
    () => products.filter(product => product.isActive),
    [products]
  );

  const categoryFilters = useMemo(
    () => buildCategoryFilters(categories, activeProducts),
    [categories, activeProducts]
  );

  // ═══ MANEJAR CAMBIOS DE CATEGORÍA ═══
  const handleCategoryChange = (categoryId) => {
    const normalizedCategoryId = Number(categoryId);
    setSelectedCategoryIds(current => toggleSelectedId(current, normalizedCategoryId));
  };

  // ═══ MANEJAR CAMBIOS DE SUBCATEGORÍA ═══
  const handleSubcategoryChange = (subcategoryId) => {
    const normalizedSubcategoryId = Number(subcategoryId);
    setSelectedSubcategoryIds(current => toggleSelectedId(current, normalizedSubcategoryId));
  };

  const handleClearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryIds, selectedSubcategoryIds]);

  useEffect(() => {
    const currentSearch = searchParams.toString();

    if (internalSearchSyncRef.current === currentSearch) {
      internalSearchSyncRef.current = "";
      return;
    }

    const nextCategoryIds = getSelectedIdsFromParam(searchParams, "category");
    const nextSubcategoryIds = getSelectedIdsFromParam(searchParams, "subcategory");
    const isExternalFilterChange =
      !areSelectedIdsEqual(selectedFiltersRef.current.categoryIds, nextCategoryIds) ||
      !areSelectedIdsEqual(selectedFiltersRef.current.subcategoryIds, nextSubcategoryIds);

    if (isExternalFilterChange) {
      applyingSearchParamsRef.current = true;
    }

    setSelectedCategoryIds(current =>
      areSelectedIdsEqual(current, nextCategoryIds) ? current : nextCategoryIds
    );
    setSelectedSubcategoryIds(current =>
      areSelectedIdsEqual(current, nextSubcategoryIds) ? current : nextSubcategoryIds
    );
  }, [searchParams]);

  useEffect(() => {
    if (applyingSearchParamsRef.current) {
      applyingSearchParamsRef.current = false;
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (selectedCategoryIds.length === 1) {
      nextParams.set("category", String(selectedCategoryIds[0]));
    } else {
      nextParams.delete("category");
    }

    if (selectedSubcategoryIds.length === 1) {
      nextParams.set("subcategory", String(selectedSubcategoryIds[0]));
    } else {
      nextParams.delete("subcategory");
    }

    const nextSearch = nextParams.toString();

    if (nextSearch !== searchParams.toString()) {
      internalSearchSyncRef.current = nextSearch;
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, selectedCategoryIds, selectedSubcategoryIds, setSearchParams]);

  // ═══ FILTRAR PRODUCTOS ═══
  const filteredProducts = useMemo(() => {
    return activeProducts.filter(product => {
      // Filtrar por categorías
      if (selectedCategoryIds.length > 0) {
        const hasSelectedCategory = product.categories?.some(cat =>
          selectedCategoryIds.includes(Number(cat.id))
        );
        if (!hasSelectedCategory) return false;
      }

      // Filtrar por subcategorías
      if (selectedSubcategoryIds.length > 0) {
        const hasSelectedSubcategory = product.subcategories?.some(sub =>
          selectedSubcategoryIds.includes(Number(sub.id))
        );
        if (!hasSelectedSubcategory) return false;
      }

      return true;
    });
  }, [activeProducts, selectedCategoryIds, selectedSubcategoryIds]);

  // ═══ ORDENAR PRODUCTOS ═══
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    const getVisiblePrice = product =>
      getDisplayPricing(product, clientType).price;

    if (selectedSort === "price_high") {
      sorted.sort((a, b) => getVisiblePrice(b) - getVisiblePrice(a));
    } else if (selectedSort === "price_low") {
      sorted.sort((a, b) => getVisiblePrice(a) - getVisiblePrice(b));
    }

    return sorted;
  }, [clientType, filteredProducts, selectedSort]);

  // ═══ PAGINACIÓN ═══
  const totalProducts = sortedProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const sortOptions = [
    { value: "relevant", label: "Orden predeterminado" },
    { value: "price_high", label: "Precio: Mayor a menor" },
    { value: "price_low", label: "Precio: Menor a mayor" }
  ];

  return (
    <div className="shop-page">
      <ShopHero
        image={BgTienda}
        title="Tienda"
        tag="Catálogo"
        subtitle="Encuentra todo lo que necesitas para tu oficina, escuela o proyectos creativos"
      />
      <div className="shop-container">
        <div className="shop-layout">
          {/* ═══ FILTROS ═══ */}
          <div className="shop-filters-col">
            {loadingCategories ? (
              <div className="loading-skeleton" style={{ height: '400px' }} />
            ) : (
              <Filters
                totalProducts={totalProducts}
                categories={categoryFilters}
                categoryOpen={categoryOpen}
                setCategoryOpen={setCategoryOpen}
                selectedCategoryIds={selectedCategoryIds}
                selectedSubcategoryIds={selectedSubcategoryIds}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>

          {/* ═══ PRODUCTOS ═══ */}
          <div className="shop-products-col">
            <SortDropdown
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              sortOptions={sortOptions}
            />

            {loadingProducts ? (
              // Loading skeletons
              <div className="products-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="loading-skeleton" style={{ minHeight: '300px' }} />
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004D77" strokeWidth="1.5">
                    <path d="M20 7h-4.18A3 3 0 0 0 13 5h-2a3 3 0 0 0-2.82 2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    <path d="M12 11v4" /><path d="M10 13h4" />
                  </svg>
                </div>
                <h3 className="empty-title">No se encontraron productos</h3>
                <p className="empty-sub">Intenta cambiar los filtros o seleccionar otra categoría o subcategoría.</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {currentProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      clientType={clientType}
                    />
                  ))}
                </div>
                <Pagination
                  totalProducts={totalProducts}
                  productsPerPage={productsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;
