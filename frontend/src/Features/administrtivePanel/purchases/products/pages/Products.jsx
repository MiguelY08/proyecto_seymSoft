import React, { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import {
  Search,
  Plus,
  Info,
  SquarePen,
  Trash2,
  Download,
  Filter,
  Eraser,
  Package,
} from "lucide-react";
import * as XLSX from "xlsx";

import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import ActiveToggle from "../components/ActiveToggle";
import ProductsPagination from "../components/ProductsPagination";
import ProductsToolbar from "../components/ProductsToolbar";
import DetailProduct from "../modals/DetailProduct";
import CreateProduct from "../modals/CreateProduct";
import EditProduct from "../modals/EditProduct";
import { useAlert } from "../../../../shared/alerts/useAlert";
import ProductsService from "../services/productsServices";
import { getParentCategories, HighlightText } from "../helpers/productsHelpers";

const RECORDS_PER_PAGE = 13;

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
  const refreshData = async () => {
    try {
      const products = await ProductsService.list();
      setData(products || []);
    } catch (error) {
      console.error("Error al recargar:", error);
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

  // Extraer categorías únicas
  const categories = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const allCategories = new Set();
    data.forEach((product) => {
      if (product.category?.name) {
        allCategories.add(product.category.name);
      }
    });
    return Array.from(allCategories).sort();
  }, [data]);

  // Extraer subcategorías únicas (filtradas por categoría si aplica)
  const subcategories = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const allSubcategories = new Set();

    data.forEach((product) => {
      // Si hay subcategoría y coincide con el filtro de categoría
      if (product.subcategory?.name) {
        if (
          filterCategory === "all" ||
          product.category?.name === filterCategory
        ) {
          allSubcategories.add(product.subcategory.name);
        }
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
          row.barcodes?.[0]?.barcode?.toLowerCase().includes(query) ||
          row.reference?.toLowerCase().includes(query) ||
          row.category?.name?.toLowerCase().includes(query) ||
          row.unitMeasure?.name?.toLowerCase().includes(query) ||
          row.unitMeasure?.abbreviation?.toLowerCase().includes(query) ||
          String(row.retailPrice).includes(query) ||
          String(row.totalStock).includes(query);
      }

      // Filtro de categoría
      const matchesCategory =
        filterCategory === "all" || row.category?.name === filterCategory;

      // Filtro de subcategoría
      const matchesSubcategory =
        filterSubcategory === "all" ||
        row.subcategory?.name === filterSubcategory;

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
    }
  };

  const handleDelete = async (producto) => {
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
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Crear array de datos con encabezado personalizado
      const now = new Date();
      const dateStr = now.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = now.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Preparar datos de productos
      const productData = filteredData.map((product) => ({
        Nombre: product.name || "N/A",
        "Código de Barras": product.barcodes?.[0]?.barcode || "N/A",
        Referencia: product.reference || "N/A",
        Proveedor: product.provider || "N/A",
        Categorías: product.category?.name || "N/A",
        Unidad: product.unitMeasure?.abbreviation || product.unitMeasure?.name || "N/A",
        Stock: product.totalStock ?? 0,
        "Precio Detalle": product.retailPrice ?? 0,
        "Precio Mayorista": product.wholesalePrice ?? 0,
        "Precio Colegas": product.partnerPrice ?? 0,
        "Precio Pacas": product.bulkPrice ?? 0,
        "IVA %": product.ivaPercentage ?? 0,
        Estado: product.status === "Activo" ? "Activo" : "Inactivo",
      }));

      // Crear hoja de trabajo manualmente para personalizar el encabezado
      const ws = XLSX.utils.aoa_to_sheet([
        ["PRODUCTOS"], // Título
        [`Fecha de exportación: ${dateStr} - ${timeStr}`], // Fecha y hora
        [], // Fila vacía
        // Headers de las columnas
        [
          "Nombre",
          "Código de Barras",
          "Referencia",
          "Proveedor",
          "Categorías",
          "Unidad",
          "Stock",
          "Precio Detalle",
          "Precio Mayorista",
          "Precio Colegas",
          "Precio Pacas",
          "Cantidad x Paca",
          "Estado",
        ],
      ]);

      // Agregar los datos de productos
      XLSX.utils.sheet_add_json(ws, productData, {
        origin: "A4", // Comenzar desde la fila 4 (después del título, fecha y espacio)
        skipHeader: true, // No agregar headers automáticos porque ya los pusimos
      });

      // Estilos para el título (merge cells)
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Merge título en toda la primera fila
        { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Merge fecha en toda la segunda fila
      ];

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 30 }, // Nombre
        { wch: 15 }, // Código de Barras
        { wch: 15 }, // Referencia
        { wch: 25 }, // Proveedor
        { wch: 30 }, // Categorías
        { wch: 14 }, // Unidad
        { wch: 10 }, // Stock
        { wch: 15 }, // Precio Detalle
        { wch: 15 }, // Precio Mayorista
        { wch: 15 }, // Precio Colegas
        { wch: 15 }, // Precio Pacas
        { wch: 15 }, // Cantidad x Paca
        { wch: 10 }, // Estado
      ];
      ws["!cols"] = colWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Productos");

      // Descargar archivo
      const fileName = `productos_${now.toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showSuccess(
        "Excel exportado",
        `Se descargaron ${productData.length} productos exitosamente.`,
      );
    } catch (error) {
      showError(
        "Error al exportar",
        "No se pudo generar el archivo Excel. Intenta de nuevo.",
      );
      console.error("Error al exportar:", error);
    }
  };

  const handleProductoCreado = () => {
    refreshData();
    setCurrentPage(1);
    setShowFormModal(false);
  };
  const handleProductoActualizado = () => {
    refreshData();
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
    <div className="min-h-screen bg-gray-50">
      <div
        className={`h-full flex flex-col gap-3 p-3 sm:p-4 ${showModal || showFormModal || showEditModal ? "blur-sm" : ""}`}
      >
        {/* Toolbar con búsqueda y botón crear */}
        {!loading && canView && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <ProductsToolbar
              search={search}
              onSearchChange={setSearch}
              onNewClick={() => setShowFormModal(true)}
            />

            {/* Botón Exportar Excel */}
            {canExport && (
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-green-600 rounded-lg text-green-700 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap w-full sm:w-auto justify-center"
                title="Exportar a Excel"
              >
                {" "}
                <Download className="w-4 h-4" strokeWidth={2} />
                <span> Exportar Excel </span>
              </button>
            )}
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
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-full max-w-3xl animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-64 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
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
            <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
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
                      Funciones
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
                          <HighlightText
                            text={String(row.totalStock || 0)}
                            highlight={search}
                          />
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
                                className="text-gray-400 hover:text-red-600 hover:scale-110 transition cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  strokeWidth={1.5}
                                />
                              </button>
                            )}
                            {canToggle && (
                              <ActiveToggle
                                activo={row.status === "Activo" ? true : false}
                                onChange={() => handleToggle(row.id)}
                              />
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
      />
      <EditProduct
        producto={selectedProduct}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdate={handleProductoActualizado}
      />
    </div>
  );
}

export default Products;
