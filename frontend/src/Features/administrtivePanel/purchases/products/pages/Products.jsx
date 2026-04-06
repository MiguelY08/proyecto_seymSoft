import React, { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { Search, Plus, Info, SquarePen, Trash2, Download, Filter } from "lucide-react";
import * as XLSX from 'xlsx';

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
  const canEdit   = hasPermission("productos.editar");
  const canDelete = hasPermission("productos.eliminar");
  const canToggle = hasPermission("productos.activar_desactivar");
  const canView   = hasPermission("productos.ver");

  const [data, setData]                       = useState(() => ProductsService.list());
  const [search, setSearch]                   = useState("");
  const [filterCategory, setFilterCategory]   = useState("all");
  const [filterSubcategory, setFilterSubcategory] = useState("all");
  const [currentPage, setCurrentPage]         = useState(1);
  const [showModal, setShowModal]             = useState(false);
  const [showFormModal, setShowFormModal]     = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const refreshData = () => setData(ProductsService.list());

  useEffect(() => { setCurrentPage(1); }, [search, filterCategory, filterSubcategory]);

  // Resetear subcategoría cuando cambia la categoría
  useEffect(() => {
    setFilterSubcategory("all");
  }, [filterCategory]);

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const allCategories = new Set();
    data.forEach(product => {
      (product.categorias || []).forEach(cat => {
        if (!cat.includes(' > ')) {
          allCategories.add(cat);
        }
      });
    });
    return Array.from(allCategories).sort();
  }, [data]);

  // Extraer subcategorías únicas (filtradas por categoría si aplica)
  const subcategories = useMemo(() => {
    const allSubcategories = new Set();
    data.forEach(product => {
      (product.categorias || []).forEach(cat => {
        if (cat.includes(' > ')) {
          const [parent, sub] = cat.split(' > ');
          if (filterCategory === "all" || parent === filterCategory) {
            allSubcategories.add(sub);
          }
        }
      });
    });
    return Array.from(allSubcategories).sort();
  }, [data, filterCategory]);

  // Filtrar productos
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filtro de búsqueda
      const query = search.toLowerCase().trim();
      let matchesSearch = true;
      if (query) {
        const subcatsText = (row.categorias || [])
          .filter(c => c.includes(" > "))
          .map(c => c.split(" > ")[1])
          .join(" ")
          .toLowerCase();
        
        matchesSearch = (
          row.nombre?.toLowerCase().includes(query) ||
          row.codBarras?.toLowerCase().includes(query) ||
          row.referencia?.toLowerCase().includes(query) ||
          subcatsText.includes(query) ||
          String(row.precioDetalle).includes(query) ||
          String(row.stock).includes(query)
        );
      }

      // Filtro de categoría
      let matchesCategory = true;
      if (filterCategory !== "all") {
        const hasCategory = (row.categorias || []).some(cat => {
          if (cat.includes(' > ')) {
            const [parent] = cat.split(' > ');
            return parent === filterCategory;
          }
          return cat === filterCategory;
        });
        matchesCategory = hasCategory;
      }

      // Filtro de subcategoría
      let matchesSubcategory = true;
      if (filterSubcategory !== "all") {
        const hasSubcategory = (row.categorias || []).some(cat => {
          if (cat.includes(' > ')) {
            const [, sub] = cat.split(' > ');
            return sub === filterSubcategory;
          }
          return false;
        });
        matchesSubcategory = hasSubcategory;
      }

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [data, search, filterCategory, filterSubcategory]);

  const totalPages  = Math.max(1, Math.ceil(filteredData.length / RECORDS_PER_PAGE));
  const startIndex  = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex    = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleToggle = async (id) => {
    const producto = data.find((row) => row.id === id);
    if (!producto) return;

    if (producto.activo) {
      const result = await showConfirm(
        "warning",
        "¿Desactivar este producto?",
        "El producto dejará de estar disponible para los usuarios, pero podrá activarse nuevamente más adelante.",
        { confirmButtonText: "Sí, desactivar", cancelButtonText: "Cancelar" }
      );
      if (!result.isConfirmed) return;
      const updated = ProductsService.update({ ...producto, activo: false });
      refreshData();
      showSuccess("Producto desactivado", `"${updated.nombre}" fue desactivado exitosamente.`);
    } else {
      const updated = ProductsService.update({ ...producto, activo: true });
      refreshData();
      showSuccess("Producto activado", `"${updated.nombre}" está disponible nuevamente.`);
    }
  };

  const handleDelete = async (producto) => {
    const result = await showConfirm(
      "warning",
      "¿Eliminar este producto?",
      `¿Estás seguro de eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!result.isConfirmed) return;

    try {
      const products = data.filter(p => p.id !== producto.id);
      ProductsService._save(products);
      refreshData();
      showSuccess("Producto eliminado", `"${producto.nombre}" fue eliminado exitosamente.`);
      
      // Ajustar página si es necesario
      const newTotalPages = Math.max(1, Math.ceil((filteredData.length - 1) / RECORDS_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      showError("Error", "No se pudo eliminar el producto. Intenta de nuevo.");
    }
  };

  const handleExportExcel = () => {
    try {
      // Preparar datos para exportar
      const exportData = filteredData.map(product => ({
        'Nombre': product.nombre,
        'Código de Barras': product.codBarras || '',
        'Referencia': product.referencia || '',
        'Proveedor': product.proveedor || '',
        'Categorías': (product.categorias || []).join(', '),
        'Stock': product.stock,
        'Precio Detalle': product.precioDetalle,
        'Precio Mayorista': product.precioMayorista,
        'Precio Colegas': product.precioColegas,
        'Precio Pacas': product.precioPacas,
        'Cantidad x Paca': product.cantidadXPaca,
        'Estado': product.activo ? 'Activo' : 'Inactivo'
      }));

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 30 }, // Nombre
        { wch: 15 }, // Código de Barras
        { wch: 15 }, // Referencia
        { wch: 25 }, // Proveedor
        { wch: 30 }, // Categorías
        { wch: 10 }, // Stock
        { wch: 15 }, // Precio Detalle
        { wch: 15 }, // Precio Mayorista
        { wch: 15 }, // Precio Colegas
        { wch: 15 }, // Precio Pacas
        { wch: 15 }, // Cantidad x Paca
        { wch: 10 }, // Estado
      ];
      ws['!cols'] = colWidths;

      // Descargar archivo
      const fileName = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showSuccess("Excel exportado", `Se descargaron ${exportData.length} productos exitosamente.`);
    } catch (error) {
      showError("Error al exportar", "No se pudo generar el archivo Excel. Intenta de nuevo.");
      console.error('Error al exportar:', error);
    }
  };

  const handleProductoCreado      = () => { refreshData(); setCurrentPage(1); setShowFormModal(false); };
  const handleProductoActualizado = () => { refreshData(); setShowEditModal(false); setSelectedProduct(null); };

  const handleVerDetalles    = (p) => { setSelectedProduct(p); setShowModal(true); };
  const handleEditarProducto = (p) => { setSelectedProduct(p); setShowEditModal(true); };
  const handleCloseModal     = ()  => { setShowModal(false); setSelectedProduct(null); };
  const handleCloseFormModal = ()  => { setShowFormModal(false); };
  const handleCloseEditModal = ()  => { setShowEditModal(false); setSelectedProduct(null); };
  const handleEditFromDetail = (p) => { setShowModal(false); setSelectedProduct(p); setShowEditModal(true); };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterSubcategory("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`h-full flex flex-col gap-3 p-3 sm:p-4 ${showModal || showFormModal || showEditModal ? "blur-sm" : ""}`}>

        {/* Toolbar con búsqueda y botón crear */}
        {data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <ProductsToolbar
              search={search}
              onSearchChange={setSearch}
              onNewClick={() => setShowFormModal(true)}
            />
            
            {/* Botón Exportar Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-green-600 rounded-lg text-green-700 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap w-full sm:w-auto justify-center"
              title="Exportar a Excel"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              <span>Exportar Excel</span>
            </button>
          </div>
        )}

        {/* Filtros por Categoría y Subcategoría */}
        {data.length > 0 && (categories.length > 0 || subcategories.length > 0) && (
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
                {subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}

            {/* Botón limpiar filtros */}
            {(filterCategory !== "all" || filterSubcategory !== "all" || search) && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#004D77] underline"
              >
                Limpiar filtros
              </button>
            )}

            {/* Contador de resultados filtrados */}
            {(filterCategory !== "all" || filterSubcategory !== "all") && (
              <span className="text-sm text-gray-600 ml-auto">
                {filteredData.length} producto{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {data.length === 0 ? (
          <EmptyState canCreate={canCreate} onCreateProduct={() => setShowFormModal(true)} />

        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              {search ? `No hay productos que coincidan con "${search}".` : 'No hay productos con los filtros seleccionados.'} 
            </p>
            <button
              onClick={resetFilters}
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
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Nombre del producto</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Cod Barras</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Referencia</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Subcategoría</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Stock</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Precio detal</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Funciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => {
                    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
                    const subcats = (row.categorias || []).filter(c => c.includes(" > ")).map(c => c.split(" > ")[1]);
                    const subcategoriaDisplay = subcats.length > 0 ? subcats.join(", ") : "N/A";

                    return (
                      <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                          <HighlightText text={row.nombre} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={row.codBarras || ""} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={row.referencia || ""} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={subcategoriaDisplay} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={String(row.stock)} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText
                            text={Number(row.precioDetalle).toLocaleString("es-CO")}
                            highlight={search}
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                            {canView && (
                              <button
                                onClick={() => handleVerDetalles(row)}
                                className="text-gray-400 hover:text-[#004D77] hover:scale-110 transition cursor-pointer"
                                title="Ver detalles"
                              >
                                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => handleEditarProducto(row)}
                                className="text-gray-400 hover:text-[#004D77] hover:scale-110 transition cursor-pointer"
                                title="Editar"
                              >
                                <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(row)}
                                className="text-gray-400 hover:text-red-600 hover:scale-110 transition cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                              </button>
                            )}
                            {canToggle && (
                              <ActiveToggle
                                activo={row.activo ?? true}
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
                {search.trim() || filterCategory !== "all" || filterSubcategory !== "all" ? (
                  <>
                    <span className="text-[#004D77]">{filteredData.length}</span>{" "}
                    resultado{filteredData.length !== 1 ? "s" : ""} encontrado{filteredData.length !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    Mostrando{" "}
                    <span className="text-[#004D77]">{startIndex + 1}</span> a{" "}
                    <span className="text-[#004D77]">{Math.min(endIndex, filteredData.length)}</span>{" "}
                    de{" "}
                    <span className="text-[#004D77]">{filteredData.length}</span>{" "}
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

      <DetailProduct producto={selectedProduct} isOpen={showModal} onClose={handleCloseModal} onEdit={handleEditFromDetail} />
      <CreateProduct isOpen={showFormModal} onClose={handleCloseFormModal} onCreate={handleProductoCreado} />
      <EditProduct producto={selectedProduct} isOpen={showEditModal} onClose={handleCloseEditModal} onUpdate={handleProductoActualizado} />
    </div>
  );
}

export default Products;