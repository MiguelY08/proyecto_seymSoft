import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductsService from "../../administrtivePanel/purchases/products/services/productsServices.js";
import categoriesService from "../../administrtivePanel/purchases/categories/services/categoriesService.js";

import {
  addStoredRecentSearch,
  clearStoredRecentSearches,
  createHeaderSearchResults,
  filterHeaderSearchResults,
  getStoredRecentSearches,
  normalizeSearchText,
  removeStoredRecentSearch,
} from "./headerSearch.helpers";

const MIN_QUERY_LENGTH = 2;
const MAX_VISIBLE_RESULTS = 8;

function useHeaderSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() =>
    getStoredRecentSearches()
  );

  useEffect(() => {
    let isMounted = true;

    const loadSearchData = async () => {
      setIsLoading(true);
      setError(null);

      const [productsResult, categoriesResult] = await Promise.allSettled([
        ProductsService.list({ active: true }),
        categoriesService.getAllActiveWithSubcategories(),
      ]);

      if (!isMounted) {
        return;
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
      } else {
        setProducts([]);
        console.error("Error loading header search products:", productsResult.reason);
      }

      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value);
      } else {
        setCategories([]);
        console.error("Error loading header search categories:", categoriesResult.reason);
      }

      if (
        productsResult.status === "rejected" ||
        categoriesResult.status === "rejected"
      ) {
        setError("No se pudieron cargar todos los datos del buscador.");
      }

      setIsLoading(false);
    };

    loadSearchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = useMemo(
    () => normalizeSearchText(query),
    [query]
  );

  const allResults = useMemo(
    () => createHeaderSearchResults({ products, categories }),
    [products, categories]
  );

  const results = useMemo(() => {
    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      return [];
    }

    return filterHeaderSearchResults(
      allResults,
      normalizedQuery,
      MAX_VISIBLE_RESULTS
    );
  }, [allResults, normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0;
  const shouldShowResults = isOpen && normalizedQuery.length >= MIN_QUERY_LENGTH;
  const shouldShowRecentSearches =
    isOpen && !hasQuery && recentSearches.length > 0;
  const hasResults = results.length > 0;

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setIsOpen(false);
  }, []);

  const updateQuery = useCallback((nextQuery) => {
    setQuery(nextQuery);
    setIsOpen(true);
  }, []);

  const selectRecentSearch = useCallback((search) => {
    setQuery(search);
    setIsOpen(true);
  }, []);

  const removeRecentSearch = useCallback((search) => {
    setRecentSearches(currentSearches =>
      removeStoredRecentSearch(currentSearches, search)
    );
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches(clearStoredRecentSearches());
  }, []);

  const selectResult = useCallback((result) => {
    if (!result?.href) {
      return;
    }

    setRecentSearches(currentSearches =>
      addStoredRecentSearch(currentSearches, query)
    );
    setQuery("");
    setIsOpen(false);
    navigate(result.href);
  }, [navigate, query]);

  const submitSearch = useCallback((event) => {
    event?.preventDefault();

    if (results.length > 0) {
      selectResult(results[0]);
    }
  }, [results, selectResult]);

  return {
    query,
    setQuery: updateQuery,
    normalizedQuery,
    isOpen,
    openSearch,
    closeSearch,
    clearSearch,
    selectRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    selectResult,
    submitSearch,
    recentSearches,
    setRecentSearches,
    products,
    setProducts,
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    error,
    setError,
    results,
    allResults,
    hasQuery,
    hasResults,
    shouldShowResults,
    shouldShowRecentSearches,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}

export default useHeaderSearch;
