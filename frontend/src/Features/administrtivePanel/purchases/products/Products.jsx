import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Eye, SquarePen, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DetailProduct from './modals/DetailProduct.jsx';
import CreateProduct from './modals/CreateProduct.jsx';
import EditProduct from './modals/EditProduct.jsx';

const sampleProducts = [
  { id: 1, nombre: 'Resma de papel A4 500 hojas', codBarras: '23243532', referencia: '5052', categoria: 'Oficina', stock: 120, precio: 50000, activo: true },
  { id: 2, nombre: 'Cuaderno 5 materias cuadriculado', codBarras: '234552525', referencia: '3035', categoria: 'Escolar', stock: 70, precio: 13000, activo: true },
  { id: 3, nombre: 'Marcadores punta fina X4', codBarras: '567765546', referencia: '2027', categoria: 'Oficina/Escolar', stock: 93, precio: 20000, activo: true },
  { id: 4, nombre: 'Pinceles surtido para acuarela X9', codBarras: '2342324', referencia: '7956', categoria: 'Artes', stock: 45, precio: 18000, activo: false },
  { id: 5, nombre: 'Carpeta de archivo con gancho metálico', codBarras: '67978879', referencia: '20201', categoria: 'Oficina', stock: 50, precio: 5000, activo: true },
  { id: 6, nombre: 'Colores Faber-Castell (Caja X12)', codBarras: '4543232', referencia: '30371', categoria: 'Artes/Escolar', stock: 65, precio: 20000, activo: true },
  { id: 7, nombre: 'Pintura acrílica blanca 250mL', codBarras: '67655', referencia: '59867', categoria: 'Artes', stock: 28, precio: 7000, activo: true },
  { id: 8, nombre: 'Borrador pelikan pequeño', codBarras: '2343242', referencia: '30297', categoria: 'Escolar', stock: 100, precio: 1500, activo: true },
  { id: 9, nombre: 'Resaltadores pastel X6', codBarras: '235323', referencia: '2387', categoria: 'Escolar/Oficina', stock: 33, precio: 17000, activo: false },
  { id: 10, nombre: 'Tijeras surtido', codBarras: '3435453', referencia: '7900', categoria: 'Escolar', stock: 130, precio: 2000, activo: true },
  { id: 11, nombre: 'Grapadora metálica grande', codBarras: '6575465', referencia: '34589', categoria: 'Oficina', stock: 40, precio: 6000, activo: false },
  { id: 12, nombre: 'Bloc de dibujo tamaño carta', codBarras: '33465464', referencia: '4871', categoria: 'Artes/Escolar', stock: 55, precio: 4000, activo: true },
  { id: 13, nombre: 'Corrector de cinta', codBarras: '5474546', referencia: '5476', categoria: 'Escolar', stock: 3, precio: 5000, activo: false },
];

const RECORDS_PER_PAGE = 16;
const TOTAL_RECORDS    = 744;
const TOTAL_PAGES      = Math.ceil(TOTAL_RECORDS / RECORDS_PER_PAGE);

// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      }`}
    >
      {/* Letra A o I */}
      <span
        className={`absolute top-0 h-full flex items-center text-white font-bold text-[9px] transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {activo ? 'A' : 'I'}
      </span>
      {/* Círculo deslizante */}
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

// ─── Products ─────────────────────────────────────────────────────────────────
function Products({ data: initialData = sampleProducts }) {
  const [data, setData]               = useState(initialData);
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal]     = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate                      = useNavigate();

  // ── Filtrado por búsqueda ─────────────────────────────────────────────────
  const filteredData = data.filter((row) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      row.nombre.toLowerCase().includes(query) ||
      row.codBarras.toLowerCase().includes(query) ||
      row.referencia.toLowerCase().includes(query) ||
      row.categoria.toLowerCase().includes(query) ||
      row.precio.toString().includes(query) ||
      row.stock.toString().includes(query)
    );
  });

  const handleToggle = (id) => {
    setData((prev) => prev.map((row) => row.id === id ? { ...row, activo: !row.activo } : row));
  };

  const handleNuevoProducto = () => {
    setShowFormModal(true);
  };

  const handleVerDetalles = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  const handleEditarProducto = (producto) => {
    setSelectedProduct(producto);
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

  const handleEditFromDetail = (producto) => {
    setSelectedProduct(producto);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className={`h-full flex flex-col gap-3 p-3 sm:p-4 ${showModal || showFormModal || showEditModal ? 'blur-sm' : ''}`}>
        
        {/* ── Barra superior ───────────────────────────────────────────────── */}
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

        {/* ── Tabla ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
          <table className="min-w-max w-full">
            <thead className="bg-[#004D77] text-white">
              <tr>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Nombre del producto</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Cod Barras</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Referencia</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Categoría</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Stock</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Precio detal</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">Funciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, index) => {
                const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
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
                      <HighlightText text={row.categoria} highlight={search} />
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
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
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

        {/* ── Footer: registros + paginador ────────────────────────────────── */}
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
                <span className="text-[#004D77]">1</span>
                {' '}a{' '}
                <span className="text-[#004D77]">{RECORDS_PER_PAGE}</span>
                {' '}de{' '}
                <span className="text-[#004D77]">{TOTAL_RECORDS}</span>
                {' '}productos
              </>
            )}
          </p>

          <div className="bg-white shadow-md rounded-xl px-3 py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={TOTAL_PAGES}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

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
      />

      {/* Modal de editar producto */}
      <EditProduct
        producto={selectedProduct}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
      />

    </div>
  );
}

export default Products;