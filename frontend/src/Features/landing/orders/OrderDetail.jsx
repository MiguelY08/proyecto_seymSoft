import { ChevronRight, Upload } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';
import { pedidos } from './Orders';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [archivoComprobante, setArchivoComprobante] = useState(null);

  const pedido = pedidos.find((p) => p.id === id);

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-4">Pedido no encontrado</p>
          <button
            onClick={() => navigate('/orders-l')}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#004D77' }}
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  const subtotal = pedido.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
  const total    = subtotal;
  const abonado  = pedido.abonado;
  const faltante = total - abonado;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('El archivo es demasiado grande. Máximo 10MB.'); return; }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Solo se permiten archivos PNG, JPG o JPEG.'); return;
    }
    setArchivoComprobante(file);
  };

  const handleEnviarComprobante = () => {
    if (!archivoComprobante) { alert('Por favor selecciona un comprobante para enviar.'); return; }
    console.log('Enviando comprobante:', archivoComprobante);
    alert('Comprobante enviado exitosamente!');
    setArchivoComprobante(null);
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <a href="/orders-l" className="hover:text-blue-600">Pedidos</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Detalles del pedido</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna izquierda ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Estado */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{pedido.titulo}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${pedido.estadoColor}`}>
                  {pedido.estado}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Venta realizada</span>
                  <span>{pedido.fecha_corta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Entrega</span>
                  <span>{pedido.direccion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pedido número</span>
                  <span>{pedido.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Método de pago</span>
                  <span>{pedido.infoPago}</span>
                </div>
              </div>
            </div>

            {/* Abonar / Pagar — solo si hay faltante */}
            {faltante > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Abonar - Pagar</h3>

                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Faltante por pagar</p>
                    <p className="text-4xl font-bold text-red-600">$ {faltante.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">Escanee el código QR para pagar</p>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                        <div className="w-48 h-48 bg-gray-900 flex items-center justify-center">
                          <p className="text-white text-xs text-center">QR Code<br />Placeholder</p>
                        </div>
                      </div>
                      {pedido.metodoPagoDetalle.llave && (
                        <p className="text-xs text-gray-500 mt-2">Llave: {pedido.metodoPagoDetalle.llave}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Comprobante de transferencia</p>
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-1">
                            {archivoComprobante ? archivoComprobante.name : 'Haga clic para subir el comprobante'}
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG o JPEG (máx. 10MB)</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleEnviarComprobante}
                    className="w-full px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                    style={{ backgroundColor: '#004D77' }}
                  >
                    Enviar comprobante
                  </button>
                </div>
              </div>
            )}

            {/* Ayuda */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ayuda con el pedido</h3>
              <button className="text-blue-600 hover:underline text-sm">
                Tengo un problema con el pedido
              </button>
            </div>
          </div>

          {/* ── Columna derecha ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">

              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {pedido.productos.length} productos en tu pedido
              </h3>

              <div className="space-y-3">
                {pedido.productos.map((producto) => {
                  const linea = producto.precioUnidad * producto.cantidad;
                  return (
                    <div key={producto.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {producto.cantidad} und. × $ {producto.precioUnidad.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                        $ {linea.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Detalle de la venta */}
              <div className="mt-6 pt-5 border-t space-y-2 text-sm">
                <h3 className="text-base font-bold text-gray-900 mb-1">Detalle de la venta</h3>
                <p className="text-xs text-gray-500 mb-3">{pedido.fecha_corta} | {pedido.numeroOrden}</p>

                {pedido.productos.map((producto) => (
                  <div key={producto.id} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">{producto.nombre}</span>
                    <span className="font-medium whitespace-nowrap">
                      $ {(producto.precioUnidad * producto.cantidad).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between border-t pt-2 text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">$ {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">$ {total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-green-700">Abonado</span>
                  <span className="font-bold text-green-600">$ {abonado.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-red-700">Faltante</span>
                  <span className="font-bold text-red-600">$ {faltante.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderDetail;