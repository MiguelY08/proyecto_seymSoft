import { ChevronRight, Package, Building2, Truck, RotateCcw, CheckCircle, X, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';
import { devoluciones } from './Returns_On_Orders';

const ICONOS_SEGUIMIENTO = [Package, Building2, Truck, RotateCcw, CheckCircle];

function DetailReturnsOnOrders() {
  const { id } = useParams();
  const navigate = useNavigate();

  const dev = devoluciones.find((d) => d.id === id);

  if (!dev) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-4">Devolución no encontrada</p>
          <button
            onClick={() => navigate('/returnsOnOrders')}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#004D77' }}
          >
            Volver a devoluciones
          </button>
        </div>
      </div>
    );
  }

  const totalMonto = dev.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BgPedidos})` }} />
          <div className="absolute inset-0 bg-blue-950/75" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white">Pedidos / Devoluciones</h2>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Volver + Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/returnsOnOrders')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mb-4"
          >
            <X className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/returnsOnOrders" className="hover:text-blue-600">Devoluciones</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Devolución No. {dev.id}</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

          {/* Header de la card */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Devolución No. {dev.id} · Pedido No. {dev.pedidoId}</p>
              <h2 className="text-xl font-bold text-gray-900">{dev.titulo}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{dev.fecha}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${dev.estadoColor}`}>
                {dev.estado}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${dev.procesoColor}`}>
                {dev.proceso}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-8">

            {/* ── Información general ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Productos devueltos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Productos devueltos</p>
                <div className="space-y-3">
                  {dev.productos.map((producto) => (
                    <div key={producto.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {producto.cantidad} und. × $ {producto.precioUnidad.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                        $ {(producto.precioUnidad * producto.cantidad).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Monto total */}
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Monto de devolución</span>
                  <span className="text-lg font-bold text-gray-900">$ {totalMonto.toLocaleString()}</span>
                </div>
              </div>

              {/* Detalle de la solicitud */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalle de la solicitud</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Motivo</p>
                    <p className="text-sm font-medium text-gray-900">{dev.motivoDevolucion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resolución solicitada</p>
                    <p className="text-sm font-medium text-gray-900">{dev.resolucion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pedido asociado</p>
                    <p className="text-sm font-medium text-gray-900">No. {dev.pedidoId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de solicitud</p>
                    <p className="text-sm font-medium text-gray-900">{dev.fecha}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Seguimiento ─────────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">Seguimiento</p>

              <div className="relative">
                {/* Línea de progreso */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200" />
                <div
                  className="absolute top-6 left-6 h-0.5 bg-blue-500 transition-all"
                  style={{
                    width: `${
                      ((dev.seguimiento.filter(s => s.completado).length) /
                      (dev.seguimiento.length - 1)) * 100
                    }%`
                  }}
                />

                <div className="relative flex justify-between">
                  {dev.seguimiento.map((paso, i) => {
                    const Icono = ICONOS_SEGUIMIENTO[i];
                    return (
                      <div key={paso.id} className="flex flex-col items-center" style={{ width: `${100 / dev.seguimiento.length}%` }}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 mb-3 border-2 transition-colors ${
                          paso.completado
                            ? 'bg-green-100 border-green-400'
                            : paso.activo
                            ? 'bg-blue-100 border-blue-400'
                            : 'bg-white border-gray-200'
                        }`}>
                          {paso.completado
                            ? <Check className="w-6 h-6 text-green-600" />
                            : <Icono className={`w-6 h-6 ${paso.activo ? 'text-blue-600' : 'text-gray-300'}`} />
                          }
                        </div>
                        <p className={`text-xs text-center leading-tight max-w-[80px] ${
                          paso.completado ? 'text-green-700 font-medium'
                          : paso.activo   ? 'text-blue-700 font-medium'
                          : 'text-gray-400'
                        }`}>
                          {paso.nombre}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailReturnsOnOrders;