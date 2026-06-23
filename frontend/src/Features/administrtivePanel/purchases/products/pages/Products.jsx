import React, { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import {
  Search,
  Plus,
  Info,
  SquarePen,
  Trash2,
  Package,
  FileSpreadsheet,
  Loader2,
  Filter,
  Eraser,
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import ActiveToggle from "../components/ActiveToggle";
import ProductsPagination from "../components/ProductsPagination";
import ProductsToolbar from "../components/ProductsToolbar";
import DetailProduct from "../modals/DetailProduct";
import CreateProduct from "../modals/CreateProduct";
import EditProduct from "../modals/EditProduct";
import { useAlert } from "../../../../shared/alerts/useAlert";
import Spinner from "../../../../shared/spinner";
import ProductsService from "../services/productsServices";
import ButtonComponent from "../../../../shared/ButtonComponent";
import { HighlightText } from "../helpers/productsHelpers";
import {
  findProductByBarcode,
  normalizeBarcode,
  productMatchesBarcodeSearch,
  useBarcodeScanner,
} from "../../../../shared/scanner";

const RECORDS_PER_PAGE = 13;
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

function EmptyState({ onCreateProduct, canCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Plus className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        No hay productos registrados
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        Comienza agregando tu primer producto al inventario. Podrás gestionar
        stock, precios y categorías fácilmente.
      </p>
      {canCreate && (
        <button
          onClick={onCreateProduct}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
          style={{ backgroundColor: "#004D77" }}
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          Crear primer producto
        </button>
      )}
      {!canCreate && (
        <p className="text-sm text-gray-500">
          No tiene permisos para crear productos.
        </p>
      )}
    </div>
  );
}

function Products() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { hasPermission } = usePermissions();

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenLoadingMessage, setScreenLoadingMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [togglingIds, setTogglingIds] = useState([]);
  const refreshData = async (message = "") => {
    if (message) setScreenLoadingMessage(message);

    try {
      const products = await ProductsService.list();
      setData(products || []);
    } catch (error) {
      console.error("Error al recargar:", error);
      showError("Error de carga", "No se pudieron actualizar los productos.");
    } finally {
      if (message) setScreenLoadingMessage("");
    }
  };
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
  }, [search, filterCategory, filterSubcategory]);

  // Resetear subcategoría cuando cambia la categoría
  useEffect(() => {
    setFilterSubcategory("all");
  }, [filterCategory]);

  const handleScannedProductSearch = ({ code, target }) => {
    const scannedCode = normalizeBarcode(code, { numericOnly: true });
    const inputCode = normalizeBarcode(target?.value, { numericOnly: true });
    const product =
      findProductByBarcode(data, scannedCode) ||
      findProductByBarcode(data, inputCode);
    const searchCode = product ? "" : inputCode || scannedCode;

    if (!product) {
      setSearch(searchCode);
      showError(
        "Codigo no registrado",
        `No se encontro ningun producto con el codigo de barras ${searchCode}.`
      );
      return;
    }

    setSearch("");
    handleVerDetalles(product);
  };

  useBarcodeScanner({
    enabled: canView && canViewInfo && data.length > 0 && !showModal && !showFormModal && !showEditModal,
    numericOnly: true,
    minLength: 6,
    maxLength: 20,
    scannerFields: ["product-search"],
    duplicateDelayMs: 800,
    preventTerminatorDefault: true,
    onScan: ({ code, scannerField, target }) => {
      if (scannerField !== "product-search") return;
      handleScannedProductSearch({ code, target });
    },
  });

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
    filterCategory !== "all" || filterSubcategory !== "all";

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

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [data, search, filterCategory, filterSubcategory]);

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
      worksheet.views = [{ state: "frozen", ySplit: 4 }];
      worksheet.autoFilter = { from: "A4", to: "M4" };

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
  const handleProductoCreado = async () => {
    await refreshData("Actualizando productos...");
    setCurrentPage(1);
    setShowFormModal(false);
  };
  const handleProductoActualizado = async () => {
    await refreshData("Actualizando productos...");
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleVerDetalles = (p) => {
    if (!canViewInfo) return;
    setSelectedProduct(p);
    setShowModal(true);
  };
  const handleEditarProducto = (p) => {
    setSelectedProduct(p);
    setShowEditModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  const handleCloseFormModal = () => {
    setShowFormModal(false);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };
  const handleEditFromDetail = (p) => {
    setShowModal(false);
    setSelectedProduct(p);
    setShowEditModal(true);
  };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterSubcategory("all");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {screenLoadingMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Spinner message={screenLoadingMessage} className="min-h-0" />
        </div>
      )}

      <div
        className={`flex min-h-0 flex-1 flex-col gap-3 bg-white p-3 sm:p-4 ${showModal || showFormModal || showEditModal ? "blur-sm" : ""}`}
      >
        {/* Toolbar con búsqueda y botón crear */}
        {!loading && canView && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <ProductsToolbar
              search={search}
              onSearchChange={setSearch}
            />

            {/* Botón Exportar Excel */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {canExport && (
                <ButtonComponent
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2"
                  title="Exportar a Excel"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
                  )}
                  <span className="hidden sm:inline">
                    {exporting ? "Exportando..." : "Exportar Excel"}
                  </span>
                </ButtonComponent>
              )}

              {canCreate && (
                <ButtonComponent
                  onClick={() => setShowFormModal(true)}
                  title="Nuevo"
                >
                  <span className="hidden sm:inline">Nuevo</span>
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </ButtonComponent>
              )}
            </div>
          </div>
        )}

        {/* Filtros por Categoría y Subcategoría */}
        {!loading &&
          canView &&
          data.length > 0 &&
          (categories.length > 0 || subcategories.length > 0) && (
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros:
              </span>

              {/* Filtro Categoría */}
              {categories.length > 0 && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D77] bg-white"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {/* Filtro Subcategoría */}
              {subcategories.length > 0 && (
                <select
                  value={filterSubcategory}
                  onChange={(e) => setFilterSubcategory(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D77] bg-white"
                  disabled={subcategories.length === 0}
                >
                  <option value="all">Todas las subcategorías</option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              )}

              {/* Botón limpiar filtros - Solo se muestra si hay filtros activos */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Limpiar filtros
                </button>
              )}

              {/* Contador de resultados filtrados */}
              {hasActiveFilters && (
                <span className="text-sm text-gray-600 ml-auto">
                  {filteredData.length} producto
                  {filteredData.length !== 1 ? "s" : ""} encontrado
                  {filteredData.length !== 1 ? "s" : ""}
                </span>
              )}
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
            onCreateProduct={() => setShowFormModal(true)}
          />
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              {search
                ? `No hay productos que coincidan con "${search}".`
                : "No hay productos con los filtros seleccionados."}
            </p>
            <button
              onClick={() => {
                resetFilters();
                setSearch("");
              }}
              className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
              style={{ backgroundColor: "#004D77" }}
            >
              Limpiar filtros y búsqueda
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto rounded-xl bg-white shadow-md min-h-0">
              <table className="min-w-max w-full">
                <thead className="bg-[#004D77] text-white">
                  <tr>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">
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
                      Unidad
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
                    const rowBg =
                      index % 2 === 0
                        ? "bg-gray-100 hover:bg-blue-50"
                        : "bg-white hover:bg-blue-50";
                    const subcategoriaDisplay =
                      row.subcategories?.length > 0
                        ? row.subcategories.map((sub) => sub.name).join(", ")
                        : row.categories?.length > 0
                          ? row.categories.map((cat) => cat.name).join(", ")
                          : "";
                    const unitMeasureDisplay = row.unitMeasure
                      ? `${row.unitMeasure.name || ""}${row.unitMeasure.abbreviation ? ` (${row.unitMeasure.abbreviation})` : ""}`.trim()
                      : "N/A";
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors duration-150 ${rowBg}`}
                      >
                        <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                          <HighlightText text={row.name} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={row.barcodes?.[0]?.barcode || ""}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={row.reference || ""}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={subcategoriaDisplay}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={unitMeasureDisplay}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <div className="mx-auto flex h-7 w-24 items-center justify-center gap-1.5 rounded-md border border-[#004D77]/15 bg-white px-2 shadow-sm">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#004D77]/10 text-[#004D77]">
                              <Package className="h-3.5 w-3.5" strokeWidth={2} />
                            </span>
                            <span className="min-w-0 truncate font-semibold text-gray-800">
                              <HighlightText
                                text={Number(row.totalStock || 0).toLocaleString(
                                  "es-CO",
                                )}
                                highlight={search}
                              />
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={Number(row.retailPrice || 0).toLocaleString(
                              "es-CO",
                            )}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-1.5">
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {search.trim() || hasActiveFilters ? (
                  <>
                    <span className="text-[#004D77]">
                      {filteredData.length}
                    </span>{" "}
                    resultado{filteredData.length !== 1 ? "s" : ""} encontrado
                    {filteredData.length !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    Mostrando{" "}
                    <span className="text-[#004D77]">{startIndex + 1}</span> a{" "}
                    <span className="text-[#004D77]">
                      {Math.min(endIndex, filteredData.length)}
                    </span>{" "}
                    de{" "}
                    <span className="text-[#004D77]">
                      {filteredData.length}
                    </span>{" "}
                    productos
                  </>
                )}
              </p>
              {totalPages > 1 && (
                <div className="bg-white shadow-md rounded-xl px-3 py-2">
                  <ProductsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
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
      <CreateProduct
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onCreate={handleProductoCreado}
        existingProducts={data}
      />
      <EditProduct
        producto={selectedProduct}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdate={handleProductoActualizado}
        existingProducts={data}
      />
    </div>
  );
}

export default Products;
