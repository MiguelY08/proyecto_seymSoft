import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';
import cuaderno from '../../../assets/products/cuadernoprimaverax100h.png';
import { PurchasesFilters } from '../../shared/DateFilter';

// ─── Catálogo base de productos ───────────────────────────────────────────────
const P = {
  libreta:    { nombre: 'LIBRETA CON LAPICERO',     precioUnidad: 5000   },
  corrector:  { nombre: 'CORRECTOR CINTA',           precioUnidad: 4000   },
  cuaderno:   { nombre: 'CUADERNO PRIMAVERA X100H',  precioUnidad: 70000  },
  sharpie:    { nombre: 'SET SHARPIE X30',           precioUnidad: 120000 },
  sewingMachine: { nombre: 'SEWING MACHINE',         precioUnidad: 5000   },
  tijeras:    { nombre: 'TIJERAS PUNTA ROMA',        precioUnidad: 3000   },
  vinilo:     { nombre: 'VINILO PQ POWER COLOR ROJO',precioUnidad: 1500   },
  correctorEnc:  { nombre: 'CORRECTORCINTA',         precioUnidad: 7000   },
};

// ─── Pedidos centralizados — importados también por OrderDetail ───────────────
export const pedidos = [
  {
    id: '123456789',
    fecha: '7 de septiembre 2025',
    fecha_corta: '7 de septiembre',
    numeroOrden: '#123456789',
    estado: 'En proceso',
    estadoColor: 'bg-yellow-100 text-yellow-700',
    titulo: 'El pedido ha sido recibido',
    metodoEnvio: 'Entrega',
    cliente: 'El cliente lo recoge',
    direccion: 'El cliente lo recoge',
    infoPago: 'Crédito (Pendiente de pago)',
    tieneDevolucion: false,
    abonado: 50000,
    metodoPagoDetalle: { tipo: 'Transferencia', llave: '0900485426' },
    productos: [
      { id: 1, ...P.cuaderno,  cantidad: 10 },
      { id: 2, ...P.libreta,   cantidad: 5  },
      { id: 3, ...P.tijeras,   cantidad: 8  },
    ],
  },
  {
    id: '987654321',
    fecha: '25 de agosto 2025',
    fecha_corta: '25 de agosto',
    numeroOrden: '#987654321',
    estado: 'Entregado',
    estadoColor: 'bg-green-100 text-green-700',
    titulo: 'Pedido finalizado y entregado',
    metodoEnvio: 'Entrega',
    cliente: 'Cra 75 #21-50 (Belén San Bernardo)',
    direccion: 'Cra 75 #21-50 (Belén San Bernardo)',
    infoPago: 'Transferencia',
    tieneDevolucion: true,
    abonado: 132000,   // total exacto → pagado completo → puede estar Entregado
    metodoPagoDetalle: { tipo: 'Transferencia', llave: '0900485426' },
    productos: [
      { id: 1, ...P.sharpie,   cantidad: 1 },
      { id: 2, ...P.corrector, cantidad: 3 },
    ],
  },
  {
    id: '456789123',
    fecha: '15 de agosto 2025',
    fecha_corta: '15 de agosto',
    numeroOrden: '#456789123',
    estado: 'En proceso',
    estadoColor: 'bg-yellow-100 text-yellow-700',
    titulo: 'El pedido ha sido recibido',
    metodoEnvio: 'Domicilio',
    cliente: 'Calle 50 #34-12 (Laureles)',
    direccion: 'Calle 50 #34-12 (Laureles)',
    infoPago: 'Efectivo (Pendiente de pago)',
    tieneDevolucion: false,
    abonado: 0,
    metodoPagoDetalle: { tipo: 'Efectivo', llave: '' },
    productos: [
      { id: 1, ...P.vinilo,        cantidad: 20 },
      { id: 2, ...P.sewingMachine, cantidad: 2  },
      { id: 3, ...P.correctorEnc,  cantidad: 5  },
      { id: 4, ...P.tijeras,       cantidad: 10 },
    ],
  },
  {
    id: '741852963',
    fecha: '2 de agosto 2025',
    fecha_corta: '2 de agosto',
    numeroOrden: '#741852963',
    estado: 'Cancelado',
    estadoColor: 'bg-red-100 text-red-700',
    titulo: 'El pedido fue cancelado',
    metodoEnvio: 'Entrega',
    cliente: 'El cliente lo recoge',
    direccion: 'El cliente lo recoge',
    infoPago: 'Tarjeta de débito',
    tieneDevolucion: false,
    abonado: 0,
    metodoPagoDetalle: { tipo: 'Tarjeta de débito', llave: '' },
    productos: [
      { id: 1, ...P.libreta,   cantidad: 30 },
      { id: 2, ...P.corrector, cantidad: 15 },
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────
function Orders() {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal]     = useState('');

  const handleVerPedido         = (id) => navigate(`/orders-l/${id}`);
  const handleGenerarDevolucion = ()   => navigate('/registerReturn');
  const handleVerDevoluciones   = ()   => navigate('/returnsOnOrders');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BgPedidos})` }} />
          <div className="absolute inset-0 bg-blue-950/75" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white">Pedidos</h2>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-px bg-gray-300" />
          <PurchasesFilters
            search={search} setSearch={setSearch}
            fechaInicial={fechaInicial} setFechaInicial={setFechaInicial}
            fechaFinal={fechaFinal} setFechaFinal={setFechaFinal}
            setCurrentPage={setCurrentPage}
          />
          <div className="h-10 w-px bg-gray-300" />
          <span className="text-gray-600">{pedidos.length} pedidos</span>
          <div className="flex-1" />
          <button
            onClick={handleVerDevoluciones}
            className="px-6 py-1 border-2 rounded-md hover:bg-blue-50 transition-colors"
            style={{ borderColor: '#004D77', color: '#004D77' }}
          >
            Ver devoluciones
          </button>
        </div>

        {/* Lista */}
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            const total   = pedido.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
            const faltante = total - pedido.abonado;

            return (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden">

                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{pedido.fecha}</h3>
                  <p className="text-sm text-gray-500">Pedido No. {pedido.id}</p>
                </div>

                {/* Cuerpo */}
                <div className="px-6 py-6">
                  <div className="flex items-start gap-6">

                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={cuaderno} alt="producto" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${pedido.estadoColor}`}>
                        {pedido.estado}
                      </span>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{pedido.titulo}</h4>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Entrega:</span> {pedido.cliente}</p>
                        <p><span className="font-medium">Pago:</span> {pedido.infoPago}</p>
                        <p><span className="font-medium">{pedido.productos.length} productos</span></p>
                        <p className="font-semibold text-gray-800">Total: $ {total.toLocaleString()}</p>
                        {faltante > 0 && (
                          <p className="text-red-600 font-medium">Faltante: $ {faltante.toLocaleString()}</p>
                        )}
                        {faltante <= 0 && pedido.estado !== 'Cancelado' && (
                          <p className="text-green-600 font-medium">Pagado completo</p>
                        )}
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

                    <div className="flex-shrink-0 flex flex-col gap-2 w-44">
                      <button
                        onClick={() => handleVerPedido(pedido.id)}
                        className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#004D77' }}
                      >
                        Ver pedido
                      </button>
                      <button
                        onClick={handleGenerarDevolucion}
                        className="w-full px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#004D77', color: '#004D77' }}
                      >
                        Generar devolución
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

export default Orders;