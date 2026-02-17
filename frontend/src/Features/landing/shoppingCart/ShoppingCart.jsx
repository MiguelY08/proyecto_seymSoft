import { Trash2, Plus, Minus, X, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import HeaderLanding from '../../layouts/HeaderLanding.jsx';
import Footer from '../../layouts/Footer.jsx';

function ShoppingCart() {
  const [metodoEntrega, setMetodoEntrega] = useState('recoger'); // 'recoger' o 'domicilio'
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [archivoComprobante, setArchivoComprobante] = useState(null);
  const [cantidades, setCantidades] = useState({
    1: 2,
    2: 1
  });

  // Datos de ejemplo del carrito
  const productosCarrito = [
    {
      id: 1,
      nombre: 'Set de marcadores Sharpie X30',
      descripcion: 'Set de 30 marcadores con una punta fina para mayor precisión y unos colores increíbles',
      precio: 120000,
      imagen: '/placeholder.png'
    },
    {
      id: 2,
      nombre: 'Cuaderno Primavera',
      descripcion: 'Tamaño A5, 100 hojas',
      precio: 7000,
      imagen: '/placeholder.png'
    }
  ];

  const handleIncrementar = (productoId) => {
    setCantidades({
      ...cantidades,
      [productoId]: cantidades[productoId] + 1
    });
  };

  const handleDecrementar = (productoId) => {
    if (cantidades[productoId] > 1) {
      setCantidades({
        ...cantidades,
        [productoId]: cantidades[productoId] - 1
      });
    }
  };

  const handleEliminar = (productoId) => {
    console.log('Eliminar producto:', productoId);
    // Aquí iría la lógica para eliminar del carrito
  };

  // Cálculos
  const subtotal = productosCarrito.reduce((acc, producto) => {
    return acc + (producto.precio * cantidades[producto.id]);
  }, 0);

  const iva = subtotal * 0.19;
  const valorDomicilio = metodoEntrega === 'domicilio' ? 12000 : 0;
  const total = subtotal + iva + valorDomicilio;

  const handleFinalizarCompra = () => {
    setMostrarModalPago(true);
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
    setMostrarModalPago(false);
    setArchivoComprobante(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLanding />

      {/* Contenido principal */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mostrarModalPago ? 'blur-sm' : ''}`}>
        {/* Título */}
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Carrito de compras</h1>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mb-6">
          <button className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: '#004D77' }}>
            Seguir comprando
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Productos */}
          <div className="lg:col-span-2 space-y-4">
            {productosCarrito.map((producto) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-6">
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{producto.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-3">{producto.descripcion}</p>
                    <p className="text-lg font-bold text-gray-900">{producto.precio.toLocaleString()} COP</p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleDecrementar(producto.id)}
                        className="p-2 hover:bg-gray-100 rounded-l-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium">{cantidades[producto.id]}</span>
                      <button
                        onClick={() => handleIncrementar(producto.id)}
                        className="p-2 hover:bg-gray-100 rounded-r-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {(producto.precio * cantidades[producto.id]).toLocaleString()} COP
                      </p>
                      <button
                        onClick={() => handleEliminar(producto.id)}
                        className="text-red-500 hover:text-red-700 mt-2 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Resumen del pedido */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del pedido</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{subtotal.toLocaleString()}COP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="font-medium">{iva.toLocaleString()}COP</span>
                </div>
                {metodoEntrega === 'domicilio' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor de domicilio</span>
                    <span className="font-medium">{valorDomicilio.toLocaleString()}COP</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{total.toLocaleString()} COP</span>
                  </div>
                </div>
              </div>

              {/* Método de entrega */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Método de entrega</h4>
                
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="metodo-entrega"
                      value="domicilio"
                      checked={metodoEntrega === 'domicilio'}
                      onChange={(e) => setMetodoEntrega(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Envío a domicilio</p>
                      <p className="text-xs text-gray-500">(El precio está sujeto al lugar de entrega)</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="metodo-entrega"
                      value="recoger"
                      checked={metodoEntrega === 'recoger'}
                      onChange={(e) => setMetodoEntrega(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Recoger en tienda</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleFinalizarCompra}
                className="w-full px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{ backgroundColor: '#004D77' }}
              >
                Finalizar compra
              </button>
            </div>
          </div>

          {/* Columna derecha - Formulario de domicilio (condicional) */}
          {metodoEntrega === 'domicilio' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Domicilio</h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de quien recibe *
                    </label>
                    <input
                      type="text"
                      placeholder="Emmanuel Muñoz"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección de entrega *
                    </label>
                    <input
                      type="text"
                      placeholder="Calle 123 # 45-67"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de contacto *
                    </label>
                    <input
                      type="tel"
                      placeholder="300 000 0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de respaldo
                    </label>
                    <input
                      type="tel"
                      placeholder="300 000 0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones adicionales
                    </label>
                    <textarea
                      placeholder="Ejemplo: Casa de 2 pisos, con un carro en la puerta color blanco. Puede dejar después de tocar la puerta"
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      *CUANDO SU PEDIDO SEA RECIBIDO SE LE NOTIFICARÁ EL ESTIMADO DE ENTREGA*
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {mostrarModalPago && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Completar pago</h3>
              <button 
                onClick={() => setMostrarModalPago(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              {/* Alerta */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800">
                  Tiene 48 horas para pagar antes de que el pedido sea cancelado
                </p>
              </div>

              {/* Total */}
              <div className="text-center mb-4">
                <p className="text-xs text-gray-600 mb-1">Total a pagar</p>
                <p className="text-3xl font-bold text-gray-900">{total.toLocaleString()} COP</p>
                <p className="text-xs text-gray-600 mt-1">Método de envío: {metodoEntrega === 'domicilio' ? 'Domicilio' : 'Recoger en tienda'}</p>
              </div>

              {/* QR Code */}
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Escanee el código QR para pagar
                </p>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-3 inline-block">
                  <div className="w-40 h-40 bg-gray-900 flex items-center justify-center">
                    <div className="text-white text-xs text-center">
                      QR Code<br/>Placeholder
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Cuenta bancaria: 1234567890 - Bancolombia - Cuenta de Ahorros
                </p>
              </div>

              {/* Upload comprobante */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                  Comprobante de transferencia
                </p>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      {archivoComprobante ? archivoComprobante.name : 'Haga clic para subir el comprobante'}
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG o JPEG (máx. 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalPago(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarComprobante}
                  className="flex-1 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
                  style={{ backgroundColor: '#004D77' }}
                >
                  Enviar comprobante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ShoppingCart;