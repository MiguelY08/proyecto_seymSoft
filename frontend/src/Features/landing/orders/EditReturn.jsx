import { ChevronRight, X, AlertTriangle, Phone, Upload, Plus, Minus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import HeaderLanding from '../../layouts/HeaderLanding.jsx';
import Footer from '../../layouts/Footer.jsx';
import BgPedidos from '../../../assets/BgPedidos.png';

function EditReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [seleccionarTodos, setSeleccionarTodos] = useState(true);
  const [productosSeleccionados, setProductosSeleccionados] = useState([1]);
  
  // Estados para el formulario
  const [motivo, setMotivo] = useState('Prod. en mal estado');
  const [metodoDevolucion, setMetodoDevolucion] = useState('Reemplazo');
  const [cantidad, setCantidad] = useState(15);
  const [evidencias, setEvidencias] = useState([]);

  // Datos de ejemplo del pedido
  const pedido = {
    id: '4512',
    productos: [
      {
        id: 1,
        nombre: 'LIBRETA CON LAPICERO',
        cantidad: 50,
        imagen: '/placeholder.png'
      }
    ]
  };

  const motivosDevolucion = [
    'Prod. en mal estado',
    'Producto incorrecto',
    'No cumple expectativas',
    'Cambio de opinión',
    'Otro'
  ];

  const metodosDevolucion = [
    'Reemplazo',
    'Reembolso'
  ];

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

  const handleIncrementarCantidad = () => {
    if (cantidad < 50) {
      setCantidad(cantidad + 1);
    }
  };

  const handleDecrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleEvidenciaChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidencias([...evidencias, ...files]);
  };

  const handleGuardar = () => {
    if (productosSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un producto');
      return;
    }
    console.log('Guardando devolución:', {
      productos: productosSeleccionados,
      motivo,
      metodoDevolucion,
      cantidad,
      evidencias
    });
    // Aquí iría la lógica para guardar la devolución
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLanding />

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
            onClick={() => navigate(`/devoluciones/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mb-4"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/devoluciones" className="hover:text-blue-600">Devoluciones</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Modificando devolución No. {pedido.id}</span>
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
                  <div key={producto.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-4 mb-4">
                      <input
                        type="checkbox"
                        id={`producto-${producto.id}`}
                        checked={productosSeleccionados.includes(producto.id)}
                        onChange={() => handleSeleccionarProducto(producto.id)}
                        className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📦</span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
                        <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                      </div>

                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Formulario expandido */}
                    {productosSeleccionados.includes(producto.id) && (
                      <div className="pl-9 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Motivo */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Motivo <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                              >
                                {motivosDevolucion.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Método de devolución */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Método de devolución <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={metodoDevolucion}
                                onChange={(e) => setMetodoDevolucion(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                              >
                                {metodosDevolucion.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Evidencias */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Evidencias <span className="text-red-500">*</span>
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="flex items-center gap-4">
                              {evidencias.length > 0 && (
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm text-gray-500">📷</span>
                                </div>
                              )}
                              <label className="flex-1 cursor-pointer">
                                <div className="flex flex-col items-center justify-center">
                                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                  <span className="text-sm text-gray-600">
                                    PNG, JPG o JPEG (máx. 10MB)
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/png,image/jpeg,image/jpg"
                                  onChange={handleEvidenciaChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={handleDecrementarCantidad}
                              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={cantidad}
                              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleIncrementarCantidad}
                              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500">Máx. 50</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón guardar */}
              <button 
                onClick={handleGuardar}
                className="w-full mt-6 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{ backgroundColor: '#004D77' }}
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

      <Footer />
    </div>
  );
}

export default EditReturn;