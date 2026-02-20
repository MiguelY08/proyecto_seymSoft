import { ChevronRight, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';

function OrderDetail() {
  const { id } = useParams();
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [archivoComprobante, setArchivoComprobante] = useState(null);

  // Datos de ejemplo del pedido (luego puedes obtenerlos de tu API)
  const pedido = {
    id: id,
    fecha: '25 de agosto',
    numeroOrden: '#987654321',
    estado: 'En proceso',
    titulo: 'El pedido ha sido recibido',
    ventaRealizada: '25 de agosto',
    metodoEntrega: 'Entrega',
    direccion: 'El cliente lo recoge',
    numeroPedido: '987654321',
    productos: [
      { id: 1, nombre: 'LIBRETA CON LAPICERO', cantidad: 50, imagen: '/placeholder.png' },
      { id: 2, nombre: 'TIJERAS PUNTA ROMA', cantidad: 40, imagen: '/placeholder.png' },
      { id: 3, nombre: 'PINCEL #10 PLANO', cantidad: 60, imagen: '/placeholder.png' },
    ],
    cantidadProductos: 3,
    detalleVenta: {
      productos: 280000,
      descuento: 0,
      subtotal: 280000,
      total: 280000,
      credito: 'Crédito'
    },
    metodoPago: {
      tipo: 'Transferencia',
      monto: 50000,
      llave: '0900485426'
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño del archivo (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
      
      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PNG, JPG o JPEG.');
        return;
      }
      
      setArchivoComprobante(file);
    }
  };

  const handleEnviarComprobante = () => {
    if (!archivoComprobante) {
      alert('Por favor selecciona un comprobante para enviar.');
      return;
    }
    
    console.log('Enviando comprobante:', archivoComprobante);
    // Aquí iría la lógica para enviar el archivo al servidor
    alert('Comprobante enviado exitosamente!');
    setArchivoComprobante(null);
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
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white">
              Pedidos
            </h2>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mostrarModalProductos ? 'blur-sm' : ''}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <a href="/orders-l" className="hover:text-blue-600">Pedidos</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Detalles del pedido</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Detalles del pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pedido.cantidadProductos} productos
                  </h3>
                  <button 
                    onClick={() => setMostrarModalProductos(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver detalles
                  </button>
                </div>
                <div className="flex gap-3">
                  {pedido.productos.slice(0, 2).map((producto) => (
                    <div key={producto.id} className="relative">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      {producto.cantidad > 1 && (
                        <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          +{producto.cantidad}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {pedido.titulo}
                  </h4>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    {pedido.estado}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Venta realizada</span>
                    <span>{pedido.ventaRealizada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Entrega</span>
                    <span>{pedido.direccion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pedido número</span>
                    <span>{pedido.numeroPedido}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Abonar - Pagar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Abonar - Pagar</h3>

              <div className="space-y-6">
                {/* Monto */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Faltante</p>
                  <p className="text-4xl font-bold text-gray-900">$ {pedido.metodoPago.monto.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* QR Code */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Escanee el código QR para pagar
                    </p>
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                      <div className="w-48 h-48 bg-gray-900 flex items-center justify-center">
                        <div className="text-white text-xs text-center">
                          QR Code<br/>Placeholder
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Llave: {pedido.metodoPago.llave}
                    </p>
                  </div>

                  {/* Upload comprobante */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Comprobante de transferencia
                    </p>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                          {archivoComprobante ? archivoComprobante.name : 'Haga clic para subir el comprobante'}
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG o JPEG (máx. 10MB)
                        </p>
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

            {/* Ayuda con el pedido */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ayuda con el pedido</h3>
              <button className="text-blue-600 hover:underline text-sm">
                Tengo un problema con el pedido
              </button>
            </div>
          </div>

          {/* Columna derecha - Detalle de la venta (STICKY) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Detalle de la venta</h3>
              <p className="text-sm text-gray-500 mb-4">
                {pedido.fecha} | {pedido.numeroOrden}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos ({pedido.cantidadProductos})</span>
                  <span className="font-medium">$ {pedido.detalleVenta.productos.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento</span>
                  <span className="font-medium">{pedido.detalleVenta.descuento}%</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">$ {pedido.detalleVenta.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        $ {pedido.detalleVenta.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{pedido.detalleVenta.credito}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de productos */}
      {mostrarModalProductos && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl relative z-10">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {pedido.cantidadProductos} productos en tu pedido
              </h3>
              <button 
                onClick={() => setMostrarModalProductos(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de productos */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              <div className="space-y-4">
                {pedido.productos.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">📦</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                        <p className="text-sm text-gray-500">{producto.cantidad} unidades</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrderDetail;