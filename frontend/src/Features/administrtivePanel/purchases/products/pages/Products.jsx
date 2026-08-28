import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Plus,
  Info,
  SquarePen,
  Trash2,
  Package,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { createExcelLogoId, prepareExcelLogoHeader } from "../../../../shared/excel/logoHeader";

import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import ActiveToggle from "../components/ActiveToggle";
import PaginationAdmin from "../../../../shared/PaginationAdmin";
import ProductsToolbar from "../components/ProductsToolbar";
import DetailProduct from "../modals/DetailProduct";
import { useAlert } from "../../../../shared/alerts/useAlert";
import Spinner from "../../../../shared/spinner";
import ProductsService from "../services/productsServices";
import { HighlightText } from "../helpers/productsHelpers";
import {
  productMatchesBarcodeSearch,
} from "../../../../shared/scanner";

const RECORDS_PER_PAGE = 11;
const LOW_STOCK_THRESHOLD = 10;
const COMPANY_COLOR = "004D77";
const LIGHT_BLUE = "DCEBF3";
const LIGHT_GRAY = "F3F4F6";
const WHITE = "FFFFFF";

const getProductCategories = (product) =>
  Array.isArray(product.categories) ? product.categories : [];

const getProductSubcategories = (product) =>
  Array.isArray(product.subcategories) ? product.subcategories : [];

const getProductCategoryNames = (product) =>
  getProductCategories(product).map((category) => category.name).filter(Boolean);

const getProductSubcategoryNames = (product) =>
  getProductSubcategories(product).map((subcategory) => subcategory.name).filter(Boolean);

const getProductTotalStock = (product) =>
  Number(product?.totalStock ?? product?.stock ?? 0) || 0;

const hasLowStock = (product) =>
  getProductTotalStock(product) < LOW_STOCK_THRESHOLD;

function EmptyState({ onCreateProduct, canCreate, isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004D77]/10">
        <Package className="h-8 w-8 text-[#004D77]/40" strokeWidth={1.5} />
      </div>

      {isSearching ? (
        <>
          <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="max-w-xs text-center text-xs text-gray-400">
            Ningún producto coincide con la búsqueda.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-500">No hay productos registrados</p>
          <p className="max-w-xs text-center text-xs text-gray-400">
            Aún no se han registrado productos.
          </p>

          {canCreate && (
            <button
              type="button"
              onClick={onCreateProduct}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c] sm:px-3"
            >
              <span>Nuevo producto</span>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Products() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const canCreate = hasPermission("productos.crear");
  const canEdit = hasPermission("productos.editar");
  const canDelete = hasPermission("productos.eliminar");
  const canToggle = hasPermission("productos.activar_desactivar");
  const canView = hasPermission("productos.ver");
  const canViewInfo = hasPermission("productos.ver_informacion");
  const canExport = hasPermission("productos.exportar");

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubcategory, setFilterSubcategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [togglingIds, setTogglingIds] = useState([]);
  // Cargar productos del backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await ProductsService.list();
        console.log("Productos cargados:", products);
        setData(products || []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);
  useEffect(() => {
    window.__data = data;
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterSubcategory, showLowStockOnly]);

  // Resetear subcategoría cuando cambia la categoría
  useEffect(() => {
    setFilterSubcategory("all");
  }, [filterCategory]);



  // Extraer categorías únicas
  const categories = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const allCategories = new Set();
    data.forEach((product) => {
      getProductCategoryNames(product).forEach((name) => allCategories.add(name));
    });
    return Array.from(allCategories).sort();
  }, [data]);

  // Extraer subcategorías únicas (filtradas por categoría si aplica)
  const subcategories = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const allSubcategories = new Set();

    data.forEach((product) => {
      const categoryNames = getProductCategoryNames(product);
      const matchesSelectedCategory =
        filterCategory === "all" || categoryNames.includes(filterCategory);

      if (matchesSelectedCategory) {
        getProductSubcategoryNames(product).forEach((name) => allSubcategories.add(name));
      }
    });

    return Array.from(allSubcategories).sort();
  }, [data, filterCategory]);
  // Verificar si hay filtros activos
  const hasActiveFilters =
    filterCategory !== "all" || filterSubcategory !== "all" || showLowStockOnly;

  const lowStockCount = useMemo(
    () => data.filter(hasLowStock).length,
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filtro de búsqueda
      const query = search.toLowerCase().trim();
      let matchesSearch = true;
      if (query) {
        matchesSearch =
          row.name?.toLowerCase().includes(query) ||
          productMatchesBarcodeSearch(row, query) ||
          row.reference?.toLowerCase().includes(query) ||
          getProductCategoryNames(row).some((name) => name.toLowerCase().includes(query)) ||
          getProductSubcategoryNames(row).some((name) => name.toLowerCase().includes(query)) ||
          row.unitMeasure?.name?.toLowerCase().includes(query) ||
          row.unitMeasure?.abbreviation?.toLowerCase().includes(query) ||
          String(row.retailPrice).includes(query) ||
          String(row.totalStock).includes(query);
      }

      // Filtro de categoría
      const categoryNames = getProductCategoryNames(row);
      const subcategoryNames = getProductSubcategoryNames(row);

      const matchesCategory =
        filterCategory === "all" || categoryNames.includes(filterCategory);

      // Filtro de subcategoría
      const matchesSubcategory =
        filterSubcategory === "all" ||
        subcategoryNames.includes(filterSubcategory);

      const matchesLowStock =
        !showLowStockOnly || hasLowStock(row);

      return matchesSearch && matchesCategory && matchesSubcategory && matchesLowStock;
    });
  }, [data, search, filterCategory, filterSubcategory, showLowStockOnly]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / RECORDS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleToggle = async (id) => {
    if (togglingIds.includes(id)) return;

    try {
      const producto = data.find((row) => row.id === id);
      if (!producto) return;

      // Cambiar 'Active' por 'Activo'
      const isActive = producto.status === "Activo";

      if (isActive) {
        const result = await showConfirm(
          "warning",
          "¿Desactivar este producto?",
          "El producto dejará de estar disponible para los usuarios, pero podrá activarse nuevamente más adelante.",
          { confirmButtonText: "Sí, desactivar", cancelButtonText: "Cancelar" },
        );
        if (!result.isConfirmed) return;
      }

      setTogglingIds((prev) => [...prev, id]);

      // Llamar al backend para cambiar estado
      const updated = await ProductsService.toggleStatus(id);

      if (updated) {
        // Actualizar estado local SIN hacer refreshData
        setData(data.map((p) => (p.id === id ? updated : p)));

        const newStatus =
          updated.status === "Activo" ? "activado" : "desactivado";
        showSuccess(
          `Producto ${newStatus}`,
          `"${updated.name}" fue ${newStatus} exitosamente.`,
        );
      }
    } catch (error) {
      showError(
        "Error",
        error.message || "No se pudo cambiar el estado del producto",
      );
    } finally {
      setTogglingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = async (producto) => {
    if (deletingIds.includes(producto.id)) return;

    // Validar que esté desactivado
    if (producto.status === "Activo") {
      showError(
        "No se puede eliminar",
        "No puedes eliminar un producto que está activo. Desactívalo primero.",
      );
      return;
    }

    const result = await showConfirm(
      "warning",
      "¿Eliminar este producto?",
      `¿Estás seguro de eliminar "${producto.name}"? Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" },
    );

    if (!result.isConfirmed) return;

    try {
      setDeletingIds((prev) => [...prev, producto.id]);
      await ProductsService.delete(producto.id);
      setData(data.filter((p) => p.id !== producto.id));
      showSuccess(
        "Producto eliminado",
        `"${producto.name}" fue eliminado exitosamente.`,
      );
    } catch (error) {
      showError(
        "Error",
        error.message || "No se pudo eliminar el producto. Intenta de nuevo.",
      );
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== producto.id));
    }
  };

  const handleExportExcel = async () => {
    if (exporting) return;

    try {
      setExporting(true);
      if (filteredData.length === 0) {
        showError("Sin registros", "No hay productos para exportar.");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Productos");
      const currentDate = new Date();
      const fileDate = currentDate.toISOString().split("T")[0];

      worksheet.columns = [
        { key: "id", width: 10 },
        { key: "name", width: 30 },
        { key: "barcode", width: 18 },
        { key: "reference", width: 16 },
        { key: "categories", width: 30 },
        { key: "subcategories", width: 30 },
        { key: "unit", width: 18 },
        { key: "stock", width: 12 },
        { key: "retailPrice", width: 18 },
        { key: "wholesalePrice", width: 18 },
        { key: "partnerPrice", width: 18 },
        { key: "bulkPrice", width: 18 },
        { key: "status", width: 14 },
      ];

      const logoId = await createExcelLogoId(workbook);
      prepareExcelLogoHeader(worksheet, {
        title: "PRODUCTOS",
        subtitle: `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`,
        columnCount: 13,
        logoId,
        blue: COMPANY_COLOR,
        logoAlign: "left",
        singleBlueHeader: true,
      });

      /*
      worksheet.mergeCells("A1:M1");
      worksheet.getCell("A1").value = "PRODUCTOS";
      worksheet.getCell("A1").font = {
        bold: true,
        size: 18,
        color: { argb: WHITE },
      };
      worksheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COMPANY_COLOR },
      };

      worksheet.mergeCells("A2:M2");
      worksheet.getCell("A2").value =
        `Fecha de exportacion: ${currentDate.toLocaleString("es-CO")}`;
      worksheet.getCell("A2").alignment = { horizontal: "center" };
      worksheet.getCell("A2").font = {
        italic: true,
        color: { argb: COMPANY_COLOR },
      };

      worksheet.addRow([]);
      */

      const headerRow = worksheet.addRow([
        "ID",
        "Nombre",
        "Codigo de barras",
        "Referencia",
        "Categorias",
        "Subcategorias",
        "Unidad",
        "Stock",
        "Precio detalle",
        "Precio mayorista",
        "Precio colegas",
        "Precio pacas",
        "Estado",
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: WHITE } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COMPANY_COLOR },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      filteredData.forEach((product, index) => {
        const categoriesText = getProductCategoryNames(product).join(", ") || "N/A";
        const subcategoriesText = getProductSubcategoryNames(product).join(", ") || "N/A";
        const unitText = product.unitMeasure
          ? `${product.unitMeasure.name || ""}${product.unitMeasure.abbreviation ? ` (${product.unitMeasure.abbreviation})` : ""}`.trim()
          : "N/A";

        const row = worksheet.addRow([
          product.id,
          product.name || "N/A",
          product.barcodes?.[0]?.barcode || "N/A",
          product.reference || "N/A",
          categoriesText,
          subcategoriesText,
          unitText,
          product.totalStock ?? 0,
          product.retailPrice ?? 0,
          product.wholesalePrice ?? 0,
          product.partnerPrice ?? 0,
          product.bulkPrice ?? 0,
          product.status === "Activo" ? "Activo" : "Inactivo",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: index % 2 === 0 ? WHITE : LIGHT_GRAY },
          };
          cell.border = {
            top: { style: "thin", color: { argb: LIGHT_BLUE } },
            left: { style: "thin", color: { argb: LIGHT_BLUE } },
            bottom: { style: "thin", color: { argb: LIGHT_BLUE } },
            right: { style: "thin", color: { argb: LIGHT_BLUE } },
          };
        });
      });

      /*
      worksheet.columns = [
        { key: "id", width: 10 },
        { key: "name", width: 30 },
        { key: "barcode", width: 18 },
        { key: "reference", width: 16 },
        { key: "categories", width: 30 },
        { key: "subcategories", width: 30 },
        { key: "unit", width: 18 },
        { key: "stock", width: 12 },
        { key: "retailPrice", width: 18 },
        { key: "wholesalePrice", width: 18 },
        { key: "partnerPrice", width: 18 },
        { key: "bulkPrice", width: 18 },
        { key: "status", width: 14 },
      ];
      */
      worksheet.views = [{ state: "frozen", ySplit: 5 }];
      worksheet.autoFilter = { from: "A5", to: "M5" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `productos_${fileDate}.xlsx`);

      showSuccess(
        "Excel exportado",
        `Se descargaron ${filteredData.length} productos exitosamente.`,
      );
    } catch (error) {
      showError(
        "Error al exportar",
        "No se pudo generar el archivo Excel. Intenta de nuevo.",
      );
      console.error("Error al exportar:", error);
    } finally {
      setExporting(false);
    }
  };
  const handleVerDetalles = (p) => {
    if (!canViewInfo) return;
    setSelectedProduct(p);
    setShowModal(true);
  };
  const handleEditarProducto = (p) => {
    navigate(`/admin/purchases/products/${p.id}/edit`);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  const handleEditFromDetail = (p) => {
    setShowModal(false);
    setSelectedProduct(null);
    navigate(`/admin/purchases/products/${p.id}/edit`);
  };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterSubcategory("all");
    setShowLowStockOnly(false);
  };

  const handleShowLowStockProducts = () => {
    setShowLowStockOnly(true);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto touch-pan-y bg-white p-3 sm:p-4 ${showModal ? "blur-sm" : ""}`}
      >
        {/* Toolbar con busqueda, filtros y acciones */}
        {!loading && canView && data.length > 0 && (
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <ProductsToolbar
              search={search}
              onSearchChange={setSearch}
              categories={categories}
              subcategories={subcategories}
              filterCategory={filterCategory}
              onCategoryChange={setFilterCategory}
              filterSubcategory={filterSubcategory}
              onSubcategoryChange={setFilterSubcategory}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={resetFilters}
              canExport={canExport}
              exporting={exporting}
              onExport={handleExportExcel}
              canCreate={canCreate}
              onCreate={() => navigate('/admin/purchases/products/new')}
            />
          </div>
        )}

        {!loading && canView && lowStockCount > 0 && (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm sm:flex-row sm:items-center">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Productos con stock bajo</p>
              <p className="text-xs leading-relaxed text-amber-700">
                {lowStockCount === 1
                  ? "Hay 1 producto con menos de 10 unidades disponibles."
                  : `Hay ${lowStockCount} productos con menos de 10 unidades disponibles.`}
                {" Revisa el inventario para programar una compra."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleShowLowStockProducts}
              className="w-full shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 sm:ml-auto sm:w-auto"
            >
              Ver stock bajo
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-white">
            <Spinner
              message="Cargando productos..."
              className="min-h-0"
            />
          </div>
        ) : !canView ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Sin acceso al módulo
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              No tiene permisos para visualizar productos.
            </p>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            canCreate={canCreate}
            onCreateProduct={() => navigate('/admin/purchases/products/new')}
            isSearching={false}
          />
        ) : filteredData.length === 0 ? (
          <EmptyState isSearching />
        ) : (
          <>
            <div className="min-w-0 w-full shrink-0 overflow-x-auto overscroll-x-contain rounded-xl bg-white shadow-md [-webkit-overflow-scrolling:touch]">
              <table className="min-w-max w-full table-auto">
                <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
                  <tr>
                    <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">
                      Nombre del producto
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
                      Cod Barras
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
                      Referencia
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
                      Categoría/Sub
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
                      Stock
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
                      Precio detal
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => {
                    const lowStock = hasLowStock(row);
                    const rowBg =
                      lowStock
                        ? "bg-amber-50 hover:bg-amber-100"
                        : index % 2 === 0
                        ? "bg-gray-100 hover:bg-blue-50"
                        : "bg-white hover:bg-blue-50";
                    const subcategoriaDisplay =
                      row.subcategories?.length > 0
                        ? row.subcategories.map((sub) => sub.name).join(", ")
                        : row.categories?.length > 0
                          ? row.categories.map((cat) => cat.name).join(", ")
                          : "";
                    return (
                      <tr
                        key={row.id}
                        className={`group transition-colors duration-150 ${rowBg}`}
                      >
                        <td className={`sticky left-0 z-10 px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap transition-colors duration-150 ${
                          lowStock
                            ? "bg-amber-50 group-hover:bg-amber-100"
                            : index % 2 === 0
                              ? "bg-gray-100 group-hover:bg-blue-50"
                              : "bg-white group-hover:bg-blue-50"
                        }`}>
                          <HighlightText text={row.name} highlight={search} />
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={row.barcodes?.[0]?.barcode || ""}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={row.reference || ""}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={subcategoriaDisplay}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className={`flex h-7 w-24 items-center justify-center gap-1.5 rounded-md border bg-white px-2 shadow-sm ${
                              lowStock ? "border-amber-300" : "border-[#004D77]/15"
                            }`}>
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                                lowStock ? "bg-amber-100 text-amber-700" : "bg-[#004D77]/10 text-[#004D77]"
                              }`}>
                                {lowStock ? (
                                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
                                ) : (
                                  <Package className="h-3.5 w-3.5" strokeWidth={2} />
                                )}
                              </span>
                              <span className={`min-w-0 truncate font-semibold ${
                                lowStock ? "text-amber-800" : "text-gray-800"
                              }`}>
                                <HighlightText
                                  text={getProductTotalStock(row).toLocaleString(
                                    "es-CO",
                                  )}
                                  highlight={search}
                                />
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap font-semibold">
                          <HighlightText
                            text={Number(row.retailPrice || 0).toLocaleString(
                              "es-CO",
                            )}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                            {canToggle && (
                              <ActiveToggle
                                activo={row.status === "Activo" ? true : false}
                                onChange={() => handleToggle(row.id)}
                                loading={togglingIds.includes(row.id)}
                                disabled={deletingIds.includes(row.id)}
                              />
                            )}

                            {canViewInfo && (
                              <button
                                type="button"
                                onClick={() => handleVerDetalles(row)}
                                className="text-gray-400 hover:text-[#004D77] hover:scale-110 transition cursor-pointer"
                                title="Ver detalles"
                              >
                                <Info
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  strokeWidth={1.5}
                                />
                              </button>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleEditarProducto(row)}
                                className="text-gray-400 hover:text-[#004D77] hover:scale-110 transition cursor-pointer"
                                title="Editar"
                              >
                                <SquarePen
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  strokeWidth={1.5}
                                />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                disabled={deletingIds.includes(row.id)}
                                className={`text-gray-400 hover:text-red-600 hover:scale-110 transition ${
                                  deletingIds.includes(row.id) ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                                }`}
                                title="Eliminar"
                              >
                                {deletingIds.includes(row.id) ? (
                                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" strokeWidth={1.5} />
                                ) : (
                                  <Trash2
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    strokeWidth={1.5}
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="shrink-0">
                <PaginationAdmin
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  totalRecords={filteredData.length}
                  recordsPerPage={RECORDS_PER_PAGE}
                />
              </div>
            )}
          </>
        )}

        <Outlet />
      </div>

      {canViewInfo && (
        <DetailProduct
          producto={selectedProduct}
          isOpen={showModal}
          onClose={handleCloseModal}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}

export default Products;
