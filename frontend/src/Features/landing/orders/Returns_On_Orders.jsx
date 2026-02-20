import { Search, ChevronDown, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';
import ReturnDetail from '../orders/DetailReturnsOnOrders.jsx';

function Return_On_Orders() {
  const navigate = useNavigate();

  // Datos de ejemplo de devoluciones
  const devoluciones = [
    {
      id: '4512',
      pedidoId: '123456789',
      fecha: '5 de septiembre',
      titulo: 'Devolución generada el 5 de septiembre',
      estado: 'Devolución aprobada',
      estadoColor: 'bg-green-100 text-green-700',
      proceso: 'En proceso 0/1',
      procesoColor: 'bg-yellow-100 text-yellow-700',
      productos: [
        { nombre: '¿Libreta con lapiceros (30u.)', cantidad: 50 }
      ],
      totalProductos: 50
    },
    {
      id: '3004',
      pedidoId: '439753792',
      fecha: '5 de septiembre',
      titulo: 'Devolución generada el 5 de septiembre',
      estado: 'Devolución aprobada',
      estadoColor: 'bg-green-100 text-green-700',
      proceso: 'Completada 2/2',
      procesoColor: 'bg-blue-100 text-blue-700',
      productos: [
        { nombre: 'Corrector', cantidad: 1 },
        { nombre: 'Silicona líquida ETEIN X (75u.)', cantidad: 1 },
        { nombre: 'Cuaderno primavera X100X (40u.)', cantidad: 1 }
      ],
      totalProductos: 55
    }
  ];

  const handleVerDevolucion = (devolucionId) => {
    navigate(`/returns/${devolucionId}`);
  };

  const handleSolicitarCancelacion = (devolucionId) => {
    console.log('Solicitar cancelación de devolución:', devolucionId);
    // Aquí iría la lógica para solicitar la cancelación
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-2xl">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${BgPedidos})` }}
                />
                <div className="absolute inset-0 bg-blue-950/75" />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                    Devoluciones / Pedidos
                  </h2>
                </div>
              </div>
            </div>
      

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver y barra de búsqueda */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/orders-l')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="relative w-80">
            <input
              type="text"
              placeholder="Busca devoluciones"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="h-10 w-px bg-gray-300"></div>
          
          <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            Fecha
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <div className="h-10 w-px bg-gray-300"></div>
          
          <span className="text-gray-600">2 devoluciones</span>
        </div>

        {/* Lista de devoluciones */}
        <div className="space-y-6">
          {devoluciones.map((devolucion) => (
            <div key={devolucion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header de la devolución */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {devolucion.titulo}
                    </h3>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Pedido No. {devolucion.pedidoId}</p>
                    <p>Devolución No. {devolucion.id}</p>
                  </div>
                </div>
              </div>

              {/* Contenido de la devolución */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-6">
                  {/* Icono de la devolución */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  {/* Información de la devolución */}
                  <div className="flex-1">
                    <div className="flex gap-2 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${devolucion.estadoColor}`}>
                        {devolucion.estado}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${devolucion.procesoColor}`}>
                        {devolucion.proceso}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="font-semibold text-gray-900">Producto/s</p>
                      <ul className="list-disc list-inside space-y-1">
                        {devolucion.productos.map((producto, index) => (
                          <li key={index}>
                            {producto.nombre}
                          </li>
                        ))}
                      </ul>
                      <p className="text-gray-500 mt-2">
                        {devolucion.totalProductos} unidades
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex-shrink-0 space-y-2 w-48">
                    <button 
                      onClick={() => handleVerDevolucion(devolucion.id)}
                      className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#004D77' }}
                    >
                      Ver devolución
                    </button>
                    <button 
                      onClick={() => handleSolicitarCancelacion(devolucion.id)}
                      className="w-full px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#004D77', color: '#004D77' }}
                    >
                      Solicitar cancelación<br/>de la devolución
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

export default Return_On_Orders;