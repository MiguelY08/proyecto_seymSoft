import React, { useState, useEffect } from "react";
import { PurchaseproductsServices } from "./Purchases.service";
import { Search,Info, SquarePen, RefreshCw, XCircle, ChevronLeft,ChevronRight  } from "lucide-react";
import { Link } from "react-router-dom";


export const Purchases = () => {
  const [productsData, setProductsData] = useState({
    numeroFacturacion: "",
    fechaCompra: "",
    proveedor: "",
    cantidadProductos: "",
    precioTotal: "",
    estado: "",
  });

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
const [fechaFinal, setFechaFinal] = useState("");

  useEffect(() => {
    setProducts(PurchaseproductsServices.listProducts());
  }, []);

  const handleDelete = (id) => {
    const updated = PurchaseproductsServices.deleteProduct(id);
    setProducts(updated);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductsData({
      ...productsData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const newProduct =
    PurchaseproductsServices.createProducts(productsData);

  setProducts([...products, newProduct]);

  setProductsData({
    numeroFacturacion: "",
    fechaCompra: "",
    proveedor: "",
    cantidadProductos: "",
    precioTotal: "",
    estado: "",
  });
  };
  const RECORDS_PER_PAGE = 13;
  

  const filteredProducts = products.filter((compra) => {
  const estadoReal =
    compra.estado && compra.estado.trim() !== ""
      ? compra.estado
      : "Pendiente";

  const coincideBusqueda =
    compra.numeroFacturacion?.toLowerCase().includes(search.toLowerCase()) ||
    compra.proveedor?.toLowerCase().includes(search.toLowerCase()) ||
    estadoReal.toLowerCase().includes(search.toLowerCase());

  // 🔥 FILTRO POR FECHA
  const fechaCompra = new Date(compra.fechaCompra);
  const fechaInicioValida = fechaInicial
    ? fechaCompra >= new Date(fechaInicial)
    : true;

  const fechaFinValida = fechaFinal
    ? fechaCompra <= new Date(fechaFinal)
    : true;

  return coincideBusqueda && fechaInicioValida && fechaFinValida;
});

const totalPages = Math.ceil(filteredProducts.length / RECORDS_PER_PAGE);

const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
const endIndex = startIndex + RECORDS_PER_PAGE;

const currentData = filteredProducts.slice(startIndex, endIndex);

return (
  <div>
    
  <div className="mt-0.3 px-4 md:px-0 max-w-7xl mx-auto">
    
   {/* 🔎 BUSCADOR */}
<div className="mb-3 flex items-end gap-69 flex-wrap">

  {/* Grupo inputs */}
  <div className="flex items-end gap-7 flex-wrap">

    {/* BUSCAR más grande */}
    <div className="relative w-full sm:w-80">
      <input
        type="text"
        placeholder="Buscar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
      />
      <Search
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
      />
    </div>

    {/* 📅 FILTRO POR FECHA */}
<div className=" flex flex-col sm:flex-row gap-3">

  <div className="w-full sm:w-56">
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Fecha Inicial
    </label>
    <input
      type="date"
      value={fechaInicial}
      onChange={(e) => {
        setFechaInicial(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
    />
  </div>

  <div className="w-full sm:w-56">
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Fecha Final
    </label>
    <input
      type="date"
      value={fechaFinal}
      onChange={(e) => {
        setFechaFinal(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm"
    />
  </div>

</div>  

  </div>

  {/* BOTÓN separado */}
  <Link
  to="/admin/purchases/create"
  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-sky-700 text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 text-sm font-semibold whitespace-nowrap inline-block text-center"
  >
    Crear Compra +
  </Link>

</div>

    {/* 📋 TABLA */}
    {filteredProducts.length === 0 ? (
      <p className="text-gray-500 text-center md:text-left">
        No hay compras registradas aún.
      </p>
    ) : (
      <>
        <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
          
          {/* 🔥 scroll horizontal en móvil */}
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-xs">
              <thead className="bg-[#004D77] text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">
                    No. Facturación
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Fecha compra
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Proveedor
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Cantidad
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Precio
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((compra, index) => (
                  <tr
                    key={compra.id}
                    className={
                      index % 2 === 0
                        ? "bg-[#FFFFFF] hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    <td className="px-3 py-2.5">
                      {compra.numeroFacturacion}
                    </td>
                    <td className="px-3 py-2.5">
                      {compra.fechaCompra}
                    </td>
                    <td className="px-3 py-2.5">
                      {compra.proveedor}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {compra.cantidadProductos}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      ${Number(compra.precioTotal).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          compra.estado === "Completada"
                            ? "bg-green-100 text-green-700"
                            : compra.estado === "Cancelada"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {compra.estado || "Pendiente"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="hover:text-blue-600 transition-colors">
                          <Info size={16}/>
                        </button>
                        <button className="hover:text-yellow-600 transition-colors">
                          <RefreshCw size={16}/>
                        </button>
                        <button
                          onClick={() => handleDelete(compra.id)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <XCircle size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                
        </div>

        {/* 📄 PAGINADOR - Separado de la tabla */}
        <div className="flex items-center justify-between py-3 ">
          <p className="text-xs text-gray-600">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} registros
          </p>

          <div className="flex items-center gap-1.5  rounded-2xl px-4 py-1.5 shadow">
            {/* Botón anterior */}
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                currentPage === 1 
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números de página */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#004D77] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Botón siguiente */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer bg-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    )}
  </div>
  
</div>
  
);
};

export default Purchases;