import { ChevronRight, Package, Building2, Truck, RotateCcw, CheckCircle, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BgPedidos from '../../../assets/BgPedidos.png';
import editar from '../orders/EditReturn.jsx';

function DetailReturnsOnOrders() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos de ejemplo de la devolución
  const devolucion = {
    id: '4512',
    pedidoId: '123456789',
    titulo: 'LIBRETA CON LAPICERO',
    estado: 'En proceso 0/1',
    estadoColor: 'bg-yellow-100 text-yellow-700',
    producto: {
      nombre: 'Libreta con lapicero',
      cantidad: 50,
      imagen: '/placeholder.png'
    },
    informacionGeneral: [
      '* Pedido en el día: 1º de agosto (1)',
      '* Libreta con lapicero'
    ],
    motivoDevolucion: 'Prod. en mal estado',
    remesosDevolucion: 'Reemplazo',
    evidencias: '/evidencia.jpg',
    seguimiento: [
      {
        id: 1,
        nombre: 'Enviar prod. a la dirección',
        icono: Package,
        completado: false,
        activo: true
      },
      {
        id: 2,
        nombre: 'Prod. recepción',
        icono: Building2,
        completado: false,
        activo: false
      },
      {
        id: 3,
        nombre: 'Productos identificados',
        icono: Truck,
        completado: false,
        activo: false
      },
      {
        id: 4,
        nombre: 'Rembolso/Remplazo',
        icono: RotateCcw,
        completado: false,
        activo: false
      },
      {
        id: 5,
        nombre: 'Devolución procesada',
        icono: CheckCircle,
        completado: false,
        activo: false
      }
    ]
  };

  const handleModificarDevolucion = () => {
    navigate(`/edit/${id}`);
  };

  const handleSolicitarCancelacion = () => {
    console.log('Solicitar cancelación');
    // Lógica para cancelar
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
              Pedidos / Devoluciones
            </h2>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver y Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/returnsOnOrders')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mb-4"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/devoluciones" className="hover:text-blue-600">Devoluciones</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Detalles de la devolución No. {devolucion.id}</span>
          </div>
        </div>

        {/* Información general */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Información general:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {devolucion.informacionGeneral.map((info, index) => (
              <p key={index}>{info}</p>
            ))}
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{devolucion.titulo}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda - Producto y estado */}
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${devolucion.estadoColor}`}>
                    {devolucion.estado}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Producto:</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">• {devolucion.producto.nombre}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{devolucion.producto.cantidad} unidades</p>
                </div>
              </div>

              {/* Columna central - Motivo y reemplazo */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Motivo de devolución</p>
                    <p className="text-sm text-gray-900">{devolucion.motivoDevolucion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Remesos de devolución</p>
                    <p className="text-sm text-gray-900">{devolucion.remesosDevolucion}</p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Evidencias y botones */}
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Evidencias</p>
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleModificarDevolucion}
                    className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#004D77' }}
                  >
                    Modificar devolución
                  </button>
                  <button 
                    onClick={handleSolicitarCancelacion}
                    className="w-full px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    style={{ borderColor: '#004D77', color: '#004D77' }}
                  >
                    Solicitar cancelación<br/>de la devolución
                  </button>
                </div>
              </div>
            </div>

            {/* Seguimiento */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Seguimiento</h3>
              
              <div className="flex items-start justify-between gap-4">
                {devolucion.seguimiento.map((paso, index) => (
                  <div key={paso.id} className="flex flex-col items-center flex-1">
                    {/* Icono */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      paso.completado 
                        ? 'bg-green-100' 
                        : paso.activo 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                    }`}>
                      <paso.icono className={`w-8 h-8 ${
                        paso.completado 
                          ? 'text-green-600' 
                          : paso.activo 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} />
                    </div>

                    {/* Flecha */}
                    {index < devolucion.seguimiento.length - 1 && (
                      <div className="absolute left-1/2 transform translate-x-8 mt-8">
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    {/* Texto */}
                    <p className="text-xs text-center text-gray-600 max-w-[100px]">
                      {paso.nombre}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default DetailReturnsOnOrders;