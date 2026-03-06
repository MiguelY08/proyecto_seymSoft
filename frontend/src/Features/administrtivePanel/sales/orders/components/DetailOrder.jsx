import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, FileText, CreditCard, CheckCircle } from 'lucide-react';

function DetailOrder({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const getEstadoColor = (estado) => {
    const colors = {
      'Por aprobar': 'bg-yellow-500',
      'Aprobado': 'bg-green-500',
      'Cancelado': 'bg-red-500'
    };
    return colors[estado] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 animate-slideUp">
        
        {/* Header */}
        <div className="bg-[#004D77] px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Pedido #{order.numerosPedido}</h2>
            <p className="text-blue-100 text-sm mt-0.5">Detalles del pedido</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido principal en 2 columnas */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna izquierda - Información del cliente */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Datos del cliente */}
              <div className="bg-[#004D77] text-white p-5 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Información del Cliente</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Nombre Completo</p>
                      <p className="font-semibold">{order.cliente.nombre}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Teléfono</p>
                      <p className="font-semibold">{order.cliente.telefono}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Correo Electrónico</p>
                      <p className="font-semibold break-all">{order.cliente.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Dirección de Entrega</p>
                      <p className="font-semibold">{order.cliente.direccion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Fecha</p>
                      <p className="font-semibold">{order.fecha}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full ${getEstadoColor(order.estado)} mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className="text-xs text-blue-200">Estado</p>
                      <p className="font-semibold">{order.estado}</p>
                    </div>
                  </div>
                </div>

                {/* Total del pedido */}
                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-sm text-blue-200 mb-1">Total del Pedido</p>
                  <p className="text-3xl font-bold">${order.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Comprobante de pago */}
              {order.comprobantePago && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-5 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#004D77]" />
                    Comprobante de Pago
                  </h3>
                  
                  <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-[#004D77]" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{order.comprobantePago}</p>
                    <button className="text-xs text-[#004D77] hover:underline">
                      Descargar archivo
                    </button>
                  </div>

                  {order.estado === 'Aprobado' && (
                    <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">Pago Confirmado</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna derecha - Productos del pedido */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#004D77]" />
                  Productos del Pedido
                </h3>

                {/* Tabla de productos */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Producto</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Cant.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">P. Unit.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.productos.map((producto, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{producto.nombre}</td>
                          <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{producto.cantidad}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">${producto.precioUnitario.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-[#004D77]">${producto.subtotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="3" className="px-4 py-4 text-right text-sm font-bold text-gray-900">Total:</td>
                        <td className="px-4 py-4 text-right text-xl font-bold text-[#004D77]">
                          ${order.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Información adicional */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Método de Pago</p>
                    <p className="font-semibold text-gray-900">{order.metodoPago}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total de Productos</p>
                    <p className="font-semibold text-gray-900">{order.productos.length} artículo(s)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 rounded-b-2xl">
          {order.estado === 'Por aprobar' && (
            <>
              <button className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                Aprobar Pedido
              </button>
              <button className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Rechazar Pedido
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailOrder;