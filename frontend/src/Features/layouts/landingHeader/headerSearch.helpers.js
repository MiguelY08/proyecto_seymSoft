export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

const RECENT_SEARCHES_STORAGE_KEY = "papeleria_magic_recent_searches";
const MAX_RECENT_SEARCHES = 5;

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function normalizeRecentSearch(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function buildSearchText(...values) {
  return normalizeSearchText(
    values
      .filter(value => value !== null && value !== undefined)
      .join(" ")
  );
}

export function getStoredRecentSearches() {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    const parsedValue = JSON.parse(storedValue ?? "[]");

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeRecentSearch)
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveStoredRecentSearches(searches) {
  const normalizedSearches = Array.isArray(searches)
    ? searches
        .map(normalizeRecentSearch)
        .filter(Boolean)
        .slice(0, MAX_RECENT_SEARCHES)
    : [];

  if (!canUseLocalStorage()) {
    return normalizedSearches;
  }

  window.localStorage.setItem(
    RECENT_SEARCHES_STORAGE_KEY,
    JSON.stringify(normalizedSearches)
  );

  return normalizedSearches;
}

export function addStoredRecentSearch(searches, search) {
  const normalizedSearch = normalizeRecentSearch(search);

  if (!normalizedSearch) {
    return saveStoredRecentSearches(searches);
  }

  const nextSearches = [
    normalizedSearch,
    ...searches.filter(
      item => normalizeSearchText(item) !== normalizeSearchText(normalizedSearch)
    ),
  ];

  return saveStoredRecentSearches(nextSearches);
}

export function removeStoredRecentSearch(searches, search) {
  const normalizedSearch = normalizeSearchText(search);
  const nextSearches = searches.filter(
    item => normalizeSearchText(item) !== normalizedSearch
  );

  return saveStoredRecentSearches(nextSearches);
}

export function clearStoredRecentSearches() {
  return saveStoredRecentSearches([]);
}

export function getSearchTokens(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean);
}

export function getTokenMatchCount(searchableText, query) {
  const searchableTokens = getSearchTokens(searchableText);
  const queryTokens = getSearchTokens(query);

  if (searchableTokens.length === 0 || queryTokens.length === 0) {
    return 0;
  }

  return queryTokens.filter(queryToken =>
    searchableTokens.some(searchableToken =>
      searchableToken.includes(queryToken)
    )
  ).length;
}

export function hasAllTokenMatches(searchableText, query) {
  const queryTokens = getSearchTokens(query);

  return (
    queryTokens.length > 0 &&
    getTokenMatchCount(searchableText, query) === queryTokens.length
  );
}

export function hasSearchMatch(searchableText, query) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return false;
  }

  return normalizeSearchText(searchableText).includes(normalizedQuery);
}

function getResultMatchScore(result, query) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedLabel = normalizeSearchText(result?.label);
  const normalizedSearchableText = normalizeSearchText(result?.searchableText);
  const queryTokens = getSearchTokens(normalizedQuery);
  const tokenMatchCount = getTokenMatchCount(normalizedSearchableText, normalizedQuery);
  const tokenMatchRatio =
    queryTokens.length > 0 ? tokenMatchCount / queryTokens.length : 0;

  if (!normalizedQuery) {
    return 0;
  }

  if (normalizedLabel === normalizedQuery) {
    return 100;
  }

  if (normalizedLabel.startsWith(normalizedQuery)) {
    return 80;
  }

  if (normalizedLabel.includes(normalizedQuery)) {
    return 60;
  }

  if (normalizedSearchableText.includes(normalizedQuery)) {
    return 40;
  }

  if (
    queryTokens.length > 1 &&
    tokenMatchCount === queryTokens.length
  ) {
    return 35;
  }

  if (
    queryTokens.length > 2 &&
    tokenMatchCount >= 2 &&
    tokenMatchRatio >= 0.5
  ) {
    return 15 + tokenMatchCount * 5;
  }

  return 0;
}

function getResultTypePriority(type) {
  const priorities = {
    product: 1,
    category: 2,
    subcategory: 3,
  };

  return priorities[type] ?? 99;
}

export function filterHeaderSearchResults(results, query, limit = 8) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  return results
    .map((result, index) => ({
      result,
      index,
      score: getResultMatchScore(result, normalizedQuery),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const typeDifference =
        getResultTypePriority(a.result.type) -
        getResultTypePriority(b.result.type);

      if (typeDifference !== 0) {
        return typeDifference;
      }

      return a.index - b.index;
    })
    .slice(0, limit)
    .map(item => item.result);
}

function getEntityName(entity) {
  return entity?.name ?? entity?.categoryName ?? entity?.nombre ?? "";
}

function getProductBarcodes(product) {
  if (!Array.isArray(product?.barcodes)) {
    return [];
  }

  return product.barcodes
    .map(item => item?.barcode)
    .filter(Boolean);
}

function getProductDetailHref(product) {
  const identifier = product?.slug ?? product?.id;
  return identifier ? `/shop/detail/${identifier}` : "/shop";
}

export function createProductSearchResult(product) {
  const categoryNames = Array.isArray(product?.categories)
    ? product.categories.map(getEntityName)
    : [];
  const subcategoryNames = Array.isArray(product?.subcategories)
    ? product.subcategories.map(getEntityName)
    : [];
  const barcodes = getProductBarcodes(product);
  const label = product?.name ?? "Producto sin nombre";
  const descriptionParts = [
    product?.reference ? `Ref. ${product.reference}` : null,
    categoryNames[0] || subcategoryNames[0] || null,
  ].filter(Boolean);

  return {
    id: product?.id,
    type: "product",
    label,
    description: descriptionParts.join(" - "),
    href: getProductDetailHref(product),
    searchableText: buildSearchText(
      label,
      product?.reference,
      product?.description,
      ...barcodes,
      ...categoryNames,
      ...subcategoryNames
    ),
    source: product,
  };
}

export function createCategorySearchResult(category) {
  const categoryId = Number(category?.id);
  const label = getEntityName(category) || "Categoria sin nombre";

  return {
    id: categoryId,
    type: "category",
    label,
    description: "Categoria",
    href: `/shop?category=${categoryId}`,
    searchableText: buildSearchText(label),
    source: category,
  };
}

export function createSubcategorySearchResult(subcategory, parentCategory) {
  const subcategoryId = Number(subcategory?.id);
  const parentCategoryId = Number(parentCategory?.id);
  const label = getEntityName(subcategory) || "Subcategoria sin nombre";
  const parentLabel = getEntityName(parentCategory);
  const params = new URLSearchParams();

  if (Number.isInteger(parentCategoryId) && parentCategoryId > 0) {
    params.set("category", String(parentCategoryId));
  }

  params.set("subcategory", String(subcategoryId));

  return {
    id: subcategoryId,
    type: "subcategory",
    label,
    description: parentLabel ? `Subcategoria de ${parentLabel}` : "Subcategoria",
    href: `/shop?${params.toString()}`,
    searchableText: buildSearchText(label, parentLabel),
    parentCategoryId: Number.isInteger(parentCategoryId) ? parentCategoryId : null,
    source: subcategory,
  };
}

export function createHeaderSearchResults({
  products = [],
  categories = [],
} = {}) {
  const productResults = products.map(createProductSearchResult);
  const categoryResults = categories.map(createCategorySearchResult);
  const subcategoryResults = categories.flatMap(category =>
    Array.isArray(category?.subcategories)
      ? category.subcategories.map(subcategory =>
          createSubcategorySearchResult(subcategory, category)
        )
      : []
  );

  return [
    ...productResults,
    ...categoryResults,
    ...subcategoryResults,
  ].filter(result => result.id);
}
