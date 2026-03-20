import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Info, SquarePen, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DetailProduct from './modals/DetailProduct.jsx';
import CreateProduct from './modals/CreateProduct.jsx';
import EditProduct from './modals/EditProduct.jsx';
import { useAlert } from '../../../shared/alerts/useAlert.js'; // ← ajusta la ruta según tu proyecto

const RECORDS_PER_PAGE = 13;

// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      }`}
    >
      <span
        className={`absolute top-0 h-full flex items-center text-white font-bold text-[9px] transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {activo ? 'A' : 'I'}
      </span>
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-[1.4rem]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

// ─── Función para resaltar texto ──────────────────────────────────────────────
function HighlightText({ text, highlight }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.toString().split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-[#004d7726] text-[#004D77] font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

// ─── Paginador ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={`d-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === page
                ? 'bg-[#004D77] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Componente de estado vacío ──────────────────────────────────────────────
function EmptyState({ onCreateProduct }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Plus className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No hay productos registrados</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        Comienza agregando tu primer producto al inventario. Podrás gestionar stock, precios y categorías fácilmente.
      </p>
      <button
        onClick={onCreateProduct}
        className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
        style={{ backgroundColor: '#004D77' }}
      >
        <Plus className="w-5 h-5" strokeWidth={2} />
        Crear primer producto
      </button>
    </div>
  );
}

// ─── Función para migrar productos antiguos ───────────────────────────────────
function migrateOldProducts(products) {
  return products.map(product => ({
    ...product,
    categorias: product.categorias || (product.categoria ? [product.categoria] : []),
    proveedores: product.proveedores || (product.proveedor ? [product.proveedor] : []),
    precioColegas: product.precioColegas || 0,
    precioPacas: product.precioPacas || 0,
    precioMayorista: product.precioMayorista || 0,
  }));
}

// ─── Products ─────────────────────────────────────────────────────────────────
function Products() {
  const { showConfirm, showSuccess } = useAlert(); // ← alertas de confirmación y éxito
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  // Cargar productos del localStorage al montar el componente (SOLO UNA VEZ)
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        const products = JSON.parse(storedProducts);
        const migratedProducts = migrateOldProducts(products);
        setData(migratedProducts);
        localStorage.setItem('products', JSON.stringify(migratedProducts));
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setData([]);
      }
    } else {
      setData([]);
    }
    setIsLoaded(true);
  }, []); // Array vacío = solo se ejecuta al montar

  // Guardar productos en localStorage SOLO después de la carga inicial
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('products', JSON.stringify(data));
      console.log('Productos guardados en localStorage:', data.length);
    }
  }, [data, isLoaded]);

  // ── Filtrado por búsqueda ─────────────────────────────────────────────────
  const filteredData = data.filter((row) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      row.nombre.toLowerCase().includes(query) ||
      row.codBarras.toLowerCase().includes(query) ||
      row.referencia.toLowerCase().includes(query) ||
      (row.subcategorias || []).join(' ').toLowerCase().includes(query) ||
      row.precio.toString().includes(query) ||
      row.stock.toString().includes(query)
    );
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // ── Alerta: Confirmación y éxito al desactivar/activar producto ─────────
  const handleToggle = async (id) => {
    const producto = data.find((row) => row.id === id);
    if (!producto) return;

    if (producto.activo) {
      const result = await showConfirm(
        'warning',
        '¿Desactivar este producto?',
        'El producto dejará de estar disponible para los usuarios, pero podrá activarse nuevamente más adelante.',
        {
          confirmButtonText: 'Sí, desactivar',
          cancelButtonText: 'Cancelar',
        }
      );
      if (!result.isConfirmed) return;

      setData((prev) =>
        prev.map((row) => row.id === id ? { ...row, activo: false } : row)
      );
      showSuccess('Producto desactivado', 'El producto fue desactivado exitosamente.');
    } else {
      setData((prev) =>
        prev.map((row) => row.id === id ? { ...row, activo: true } : row)
      );
      showSuccess('Producto activado', 'El producto está disponible nuevamente para los usuarios.');
    }
  };

  const handleNuevoProducto = () => {
    setShowFormModal(true);
  };

  const handleCrearProducto = (nuevoProducto) => {
    const newId = data.length > 0 ? Math.max(...data.map(p => p.id)) + 1 : 1;
    
    const productoCompleto = {
      id: newId,
      nombre: nuevoProducto.nombre,
      codBarras: nuevoProducto.codBarras,
      referencia: nuevoProducto.referencia,
      categorias: nuevoProducto.categorias || [],
      stock: parseInt(nuevoProducto.stock),
      precio: parseInt(nuevoProducto.precioDetalle),
      precioMayorista: parseInt(nuevoProducto.precioMayorista),
      precioColegas: parseInt(nuevoProducto.precioColegas),
      precioPacas: parseInt(nuevoProducto.precioPacas),
      proveedores: nuevoProducto.proveedores || [],
      descripcion: nuevoProducto.descripcion,
      imagen: nuevoProducto.imagen,
      activo: true
    };

    setData([productoCompleto, ...data]);
    setCurrentPage(1);
    setShowFormModal(false);
  };

  const handleVerDetalles = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  const handleEditarProducto = (producto) => {
    setSelectedProduct(producto);
    setShowEditModal(true);
  };

  const handleActualizarProducto = (productoEditado) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === productoEditado.id
          ? {
              ...row,
              nombre: productoEditado.nombre,
              codBarras: productoEditado.codBarras,
              referencia: productoEditado.referencia,
              categorias: productoEditado.categorias || [],
              stock: parseInt(productoEditado.stock),
              precio: parseInt(productoEditado.precioDetalle),
              precioMayorista: parseInt(productoEditado.precioMayorista),
              precioColegas: parseInt(productoEditado.precioColegas),
              precioPacas: parseInt(productoEditado.precioPacas),
              proveedores: productoEditado.proveedores || [],
              descripcion: productoEditado.descripcion,
              imagen: productoEditado.imagen || row.imagen
            }
          : row
      )
    );
    setShowEditModal(false);
    setSelectedProduct(null);
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

  const handleEditFromDetail = (producto) => {
    setSelectedProduct(producto);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className={`h-full flex flex-col gap-3 p-3 sm:p-4 ${showModal || showFormModal || showEditModal ? 'blur-sm' : ''}`}>
        
        {/* ── Barra superior (solo si hay productos) ───────────────────────── */}
        {data.length > 0 && (
          <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">

            {/* Buscador */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>

            {/* Botón Nuevo */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNuevoProducto}
                title="Crear nuevo producto"
                className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <span className="hidden sm:inline">Crear nuevo producto</span>
                <span className="sm:hidden">Nuevo</span>
                <Plus className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* ── Estado vacío o Tabla ─────────────────────────────────────────── */}
        {data.length === 0 ? (
          <EmptyState onCreateProduct={handleNuevoProducto} />
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              No hay productos que coincidan con "{search}". Intenta con otra búsqueda.
            </p>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
              style={{ backgroundColor: '#004D77' }}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <>
            {/* ── Tabla ────────────────────────────────────────────────────── */}
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
                    const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
                    const categoriaDisplay = row.categorias && row.categorias.length > 0 
                      ? row.subcategorias.join(', ') 
                      : (row.categoria || 'N/A');
                    
                    return (
                      <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>

                        <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                          <HighlightText text={row.nombre} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={row.codBarras} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={row.referencia} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={categoriaDisplay} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={row.stock.toString()} highlight={search} />
                        </td>
                        <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                          <HighlightText text={row.precio.toLocaleString()} highlight={search} />
                        </td>
                        
                        <td className="px-3 py-1.5">
                          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                            <button
                              onClick={() => handleVerDetalles(row)}
                              className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                              title="Ver detalles"
                            >
                              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleEditarProducto(row)}
                              className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                            </button>
                            <ActiveToggle activo={row.activo} onChange={() => handleToggle(row.id)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Footer: registros + paginador ────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {search.trim() ? (
                  <>
                    <span className="text-[#004D77]">{filteredData.length}</span>
                    {' '}resultado{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    Mostrando{' '}
                    <span className="text-[#004D77]">{startIndex + 1}</span>
                    {' '}a{' '}
                    <span className="text-[#004D77]">{Math.min(endIndex, filteredData.length)}</span>
                    {' '}de{' '}
                    <span className="text-[#004D77]">{filteredData.length}</span>
                    {' '}productos
                  </>
                )}
              </p>

              {totalPages > 1 && (
                <div className="bg-white shadow-md rounded-xl px-3 py-2">
                  <Pagination
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

      {/* Modal de detalles del producto */}
      <DetailProduct
        producto={selectedProduct}
        isOpen={showModal}
        onClose={handleCloseModal}
        onEdit={handleEditFromDetail}
      />

      {/* Modal de crear producto */}
      <CreateProduct
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onCreate={handleCrearProducto}
      />

      {/* Modal de editar producto */}
      <EditProduct
        producto={selectedProduct}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdate={handleActualizarProducto}
      />

    </div>
  );
}

export default Products;