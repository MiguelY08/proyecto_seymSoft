import { Search, ChevronDown, Package, MapPin, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';
import cuaderno from '../../../assets/products/cuadernoprimaverax100h.png';
import { PurchasesFilters } from '../../shared/DateFilter';

function Orders() {
  const navigate = useNavigate();

  // Datos de ejemplo para los pedidos
  const pedidos = [
    {
      id: '123456789',
      fecha: '7 de septiembre 2025',
      estado: 'En proceso',
      titulo: 'El pedido ha sido recibido',
      metodoEnvio: 'Entrega',
      cliente: 'El cliente lo recoge',
      metodoPago: 'Paga:',
      infoPago: 'Crédito (Pendiente de pago)*',
      productos: 5,
      tieneDevolucion: false,
      estadoColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: '987654321',
      fecha: '25 de agosto',
      estado: 'Entregado',
      titulo: 'Pedido finalizado y entregado',
      metodoEnvio: 'Entrega',
      cliente: 'Cra 75 #21-50 (Belén San Bernardo - 1er piso)',
      metodoPago: 'Paga:',
      infoPago: 'Transferencia',
      productos: 1,
      tieneDevolucion: true,
      estadoColor: 'bg-green-100 text-green-700'
    },
    {
      id: '456789123',
      fecha: '15 de agosto',
      estado: 'En camino',
      titulo: 'El pedido está en camino',
      metodoEnvio: 'Domicilio',
      cliente: 'Calle 50 #34-12 (Laureles)',
      metodoPago: 'Paga:',
      infoPago: 'Efectivo',
      productos: 3,
      tieneDevolucion: false,
      estadoColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: '741852963',
      fecha: '2 de agosto',
      estado: 'Cancelado',
      titulo: 'El pedido fue cancelado',
      metodoEnvio: 'Entrega',
      cliente: 'El cliente lo recoge',
      metodoPago: 'Paga:',
      infoPago: 'Tarjeta de débito',
      productos: 2,
      tieneDevolucion: false,
      estadoColor: 'bg-red-100 text-red-700'
    }
  ];

  const handleVerPedido = (pedidoId) => {
    navigate(`/orders-l/${pedidoId}`);
  };

  const handleGenerarDevolucion = (pedidoId) => {
    navigate(`/registerReturn`);
  };

  const handleVerDevoluciones = () => {
    navigate('/returnsOnOrders');
  };

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner Pedidos */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-2xl">
          {/* Imagen de fondo */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BgPedidos})` }}
          />
         
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-blue-950/75" />
         
          {/* Contenido */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white">
              Pedidos
            </h2> 
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de búsqueda y filtros */}
        <div className="flex items-center gap-4 mb-6">
          
          
          <div className="h-10 w-px bg-gray-300"></div>
          
          <PurchasesFilters
          search={search}
          setSearch={setSearch}
          fechaInicial={fechaInicial}
          setFechaInicial={setFechaInicial}
          fechaFinal={fechaFinal}
          setFechaFinal={setFechaFinal}
          setCurrentPage={setCurrentPage}
        />
          
          <div className="h-10 w-px bg-gray-300"></div>
          
          <span className="text-gray-600">4 pedidos</span>
          
          <div className="flex-1"></div>
          
          <button 
            onClick={handleVerDevoluciones}
            className="px-6 py-1 border-2 rounded-md hover:bg-blue-50 transition-colors" 
            style={{ borderColor: '#004D77', color: '#004D77' }}
          >
            Ver devoluciones
          </button>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header del pedido */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{pedido.fecha}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pedido No. {pedido.id}</p>
                  </div>
                </div>
              </div>

              {/* Contenido del pedido */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-6">
                  {/* Icono del pedido */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img src={cuaderno} alt="Cuaderno" className="w-full h-full" />
                    </div>
                  </div>

                  {/* Información del pedido */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${pedido.estadoColor}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {pedido.titulo}
                    </h4>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="font-medium">{pedido.metodoEnvio}</p>
                      <p>{pedido.cliente}</p>
                      <p>
                        <span className="font-medium">{pedido.metodoPago}</span>{' '}
                        {pedido.infoPago}
                      </p>
                      <p className="text-gray-500">{pedido.productos} productos</p>
                    </div>

                    {pedido.tieneDevolucion && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Este pedido tiene un proceso de devolución
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex-shrink-0 flex flex-col justify-center space-y-2 w-44">
                    <button 
                      onClick={() => handleVerPedido(pedido.id)}
                      className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#004D77' }}
                    >
                      Ver pedido
                    </button>
                    
                    <button 
                      onClick={() => handleGenerarDevolucion(pedido.id)}
                      className="w-full px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#004D77', color: '#004D77' }}
                    >
                      Generar devolución
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default Orders;