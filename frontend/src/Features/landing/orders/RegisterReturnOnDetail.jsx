import { ChevronRight, X, AlertTriangle, Phone } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import BgPedidos from '../../../assets/BgPedidos.png';

function RegisterReturnOnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  
  // Datos de ejemplo del pedido
  const pedido = {
    id: '123456789',
    productos: [
      {
        id: 1,
        nombre: 'LIBRETA CON LAPICERO',
        cantidad: 50,
        imagen: '/placeholder.png'
      },
      {
        id: 2,
        nombre: 'Cuaderno Norma',
        cantidad: 20,
        imagen: '/placeholder.png'
      },
      {
        id: 3,
        nombre: 'Lapicero Bic',
        cantidad: 100,
        imagen: '/placeholder.png'
      }
    ]
  };

  const handleSeleccionarTodos = () => {
    if (!seleccionarTodos) {
      setProductosSeleccionados(pedido.productos.map(p => p.id));
    } else {
      setProductosSeleccionados([]);
    }
    setSeleccionarTodos(!seleccionarTodos);
  };

  const handleSeleccionarProducto = (productoId) => {
    if (productosSeleccionados.includes(productoId)) {
      setProductosSeleccionados(productosSeleccionados.filter(id => id !== productoId));
    } else {
      setProductosSeleccionados([...productosSeleccionados, productoId]);
    }
  };

  const handleGuardar = () => {
    if (productosSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un producto');
      return;
    }
    console.log('Productos seleccionados:', productosSeleccionados);
    // Aquí iría la lógica para guardar la devolución
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-xl">
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
            onClick={() => navigate(`/orders-l`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mb-4"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/returnsOnOrders" className="hover:text-blue-600">Devoluciones</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Registrando devolución en el pedido No. {pedido.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Productos del pedido</h2>
              <p className="text-sm text-gray-600 mb-6">Escoja los productos que desea devolver</p>

              {/* Checkbox seleccionar todos */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <input
                  type="checkbox"
                  id="seleccionar-todos"
                  checked={seleccionarTodos}
                  onChange={handleSeleccionarTodos}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="seleccionar-todos" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Seleccionar todos
                </label>
              </div>

              {/* Lista de productos */}
              <div className="space-y-4">
                {pedido.productos.map((producto) => (
                  <div key={producto.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`producto-${producto.id}`}
                      checked={productosSeleccionados.includes(producto.id)}
                      onChange={() => handleSeleccionarProducto(producto.id)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón guardar */}
              <button 
                onClick={handleGuardar}
                className="w-full mt-6 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Guardar
              </button>

              {/* Alerta */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="mb-2">
                    En el momento de "Guardar", se enviará la solicitud de devolución. Nuestro equipo estará al tanto y se 
                    encargará de aprobar o desaprobar esta devolución.
                  </p>
                  <p>En cualquier caso, te avisaremos a través de tu correo electrónico.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contacto</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Tienes dudas sobre cómo generar la devolución? Comunícate con nosotros y te 
                ayudaremos con todo lo que necesites saber.
              </p>

              {/* WhatsApp */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <a 
                    href="https://wa.me/573002936722" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    +57 300 293 6722
                  </a>
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Nuestras redes</h4>
                <div className="flex gap-3">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <FaInstagram className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://tiktok.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <FaTiktok className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default RegisterReturnOnDetail;