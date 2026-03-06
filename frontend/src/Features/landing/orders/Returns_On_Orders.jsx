import { Search, ChevronDown, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';

// ─── Devoluciones centralizadas — importadas también por DetailReturnsOnOrders
export const devoluciones = [
  {
    id: '4512',
    pedidoId: '987654321',           // pedido Entregado con devolución
    fecha: '28 de agosto 2025',
    titulo: 'Devolución generada el 28 de agosto',
    estado: 'Aprobada',
    estadoColor: 'bg-green-100 text-green-700',
    proceso: 'En proceso 0/1',
    procesoColor: 'bg-yellow-100 text-yellow-700',
    motivoDevolucion: 'Producto en mal estado',
    resolucion: 'Reemplazo',
    montoDevolucion: 120000,         // precio del sharpie que se devuelve
    productos: [
      { id: 1, nombre: 'SET SHARPIE X30', cantidad: 1, precioUnidad: 120000 },
    ],
    seguimiento: [
      { id: 1, nombre: 'Enviar producto a la dirección', completado: false, activo: true  },
      { id: 2, nombre: 'Recepción del producto',         completado: false, activo: false },
      { id: 3, nombre: 'Producto identificado',          completado: false, activo: false },
      { id: 4, nombre: 'Reembolso / Reemplazo',          completado: false, activo: false },
      { id: 5, nombre: 'Devolución procesada',           completado: false, activo: false },
    ],
  },
  {
    id: '3004',
    pedidoId: '123456789',           // pedido En proceso con abono parcial
    fecha: '10 de septiembre 2025',
    titulo: 'Devolución generada el 10 de septiembre',
    estado: 'Aprobada',
    estadoColor: 'bg-green-100 text-green-700',
    proceso: 'Completada 2/2',
    procesoColor: 'bg-blue-100 text-blue-700',
    motivoDevolucion: 'Cantidad incorrecta recibida',
    resolucion: 'Reembolso parcial',
    montoDevolucion: 25000,          // 5 tijeras devueltas (5 × 3000 = 15000) + 2 libretas (2 × 5000)
    productos: [
      { id: 1, nombre: 'TIJERAS PUNTA ROMA',    cantidad: 5, precioUnidad: 3000 },
      { id: 2, nombre: 'LIBRETA CON LAPICERO',  cantidad: 2, precioUnidad: 5000 },
    ],
    seguimiento: [
      { id: 1, nombre: 'Enviar producto a la dirección', completado: true,  activo: false },
      { id: 2, nombre: 'Recepción del producto',         completado: true,  activo: false },
      { id: 3, nombre: 'Producto identificado',          completado: false, activo: true  },
      { id: 4, nombre: 'Reembolso / Reemplazo',          completado: false, activo: false },
      { id: 5, nombre: 'Devolución procesada',           completado: false, activo: false },
    ],
  },
];

function Return_On_Orders() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BgPedidos})` }} />
          <div className="absolute inset-0 bg-blue-950/75" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">Devoluciones / Pedidos</h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Barra */}
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

          <div className="h-10 w-px bg-gray-300" />
          <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            Fecha <ChevronDown className="w-4 h-4" />
          </button>
          <div className="h-10 w-px bg-gray-300" />
          <span className="text-gray-600">{devoluciones.length} devoluciones</span>
        </div>

        {/* Lista */}
        <div className="space-y-6">
          {devoluciones.map((dev) => {
            const totalMonto = dev.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
            return (
              <div key={dev.id} className="bg-white rounded-lg shadow-md overflow-hidden">

                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{dev.titulo}</h3>
                  <div className="text-right text-sm text-gray-500">
                    <p>Pedido No. {dev.pedidoId}</p>
                    <p>Devolución No. {dev.id}</p>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="px-6 py-6">
                  <div className="flex items-start gap-6">

                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${dev.estadoColor}`}>
                          {dev.estado}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${dev.procesoColor}`}>
                          {dev.proceso}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Motivo:</span> {dev.motivoDevolucion}</p>
                        <p><span className="font-medium">Resolución:</span> {dev.resolucion}</p>
                        <p className="font-semibold text-gray-900 mt-2">Productos devueltos:</p>
                        <ul className="space-y-0.5 list-disc list-inside">
                          {dev.productos.map((p, i) => (
                            <li key={i}>{p.nombre} — {p.cantidad} und.</li>
                          ))}
                        </ul>
                        <p className="font-semibold text-gray-800 mt-1">
                          Monto: $ {totalMonto.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-44">
                      <button
                        onClick={() => navigate(`/returns/${dev.id}`)}
                        className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#004D77' }}
                      >
                        Ver devolución
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Return_On_Orders;