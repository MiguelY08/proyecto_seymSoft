import { useState } from 'react';
import { ShoppingCart as CartIcon, Minus, Plus, Trash2, MapPin, Mail, Phone, Home as HomeIcon, Store, MessageSquare, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/Context/Cartcontext';
import { useAlert } from '../../shared/alerts/useAlert';
import CompletePay from './modals/CompletePay.jsx';

function ShoppingCart() {
  const navigate = useNavigate();
  const { showConfirm, showError } = useAlert();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTax,
    getTotalItems
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState('tienda');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    ciudad: '',
    barrio: '',
    direccion: '',
    notas: ''
  });

  const [errors, setErrors] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    ciudad: '',
    barrio: '',
    direccion: ''
  });

  const [touched, setTouched] = useState({
    nombreCompleto: false,
    correo: false,
    telefono: false,
    ciudad: false,
    barrio: false,
    direccion: false
  });

  // Validaciones
  const validateNombreCompleto = (value) => {
    if (!value.trim()) return 'El nombre completo es obligatorio';
    if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras';
    const palabras = value.trim().split(/\s+/);
    if (palabras.length < 2) return 'Ingresa nombre y apellido';
    return '';
  };

  const validateCorreo = (value) => {
    if (!value.trim()) return 'El correo electrónico es obligatorio';
    if (!value.includes('@')) return 'El correo debe contener @';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Formato de correo inválido';
    return '';
  };

  const validateTelefono = (value) => {
    if (!value.trim()) return 'El teléfono es obligatorio';
    if (!/^[\d\s]+$/.test(value)) return 'Solo se permiten números';
    const digitsOnly = value.replace(/\s/g, '');
    if (digitsOnly.length < 10) return 'El teléfono debe tener al menos 10 dígitos';
    if (digitsOnly.length > 10) return 'El teléfono no puede tener más de 10 dígitos';
    return '';
  };

  const validateCiudad = (value) => {
    if (!value.trim()) return 'La ciudad es obligatoria';
    if (value.trim().length < 3) return 'La ciudad debe tener al menos 3 caracteres';
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'La ciudad solo puede contener letras';
    return '';
  };

  const validateBarrio = (value) => {
    if (!value.trim()) return 'El barrio es obligatorio';
    if (value.trim().length < 3) return 'El barrio debe tener al menos 3 caracteres';
    return '';
  };

  const validateDireccion = (value) => {
    if (!value.trim()) return 'La dirección es obligatoria';
    if (value.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      const cleaned = value.replace(/[^\d\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      
      let error = '';
      if (touched[name]) {
        error = validateTelefono(cleaned);
      }
      setErrors(prev => ({ ...prev, [name]: error }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      let error = '';
      switch (name) {
        case 'nombreCompleto':
          error = validateNombreCompleto(value);
          break;
        case 'correo':
          error = validateCorreo(value);
          break;
        case 'ciudad':
          error = validateCiudad(value);
          break;
        case 'barrio':
          error = validateBarrio(value);
          break;
        case 'direccion':
          error = validateDireccion(value);
          break;
        default:
          break;
      }
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    let error = '';
    switch (name) {
      case 'nombreCompleto':
        error = validateNombreCompleto(formData[name]);
        break;
      case 'correo':
        error = validateCorreo(formData[name]);
        break;
      case 'telefono':
        error = validateTelefono(formData[name]);
        break;
      case 'ciudad':
        error = validateCiudad(formData[name]);
        break;
      case 'barrio':
        error = validateBarrio(formData[name]);
        break;
      case 'direccion':
        error = validateDireccion(formData[name]);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      nombreCompleto: validateNombreCompleto(formData.nombreCompleto),
      correo: validateCorreo(formData.correo),
      telefono: validateTelefono(formData.telefono),
      ciudad: validateCiudad(formData.ciudad),
      barrio: validateBarrio(formData.barrio),
      direccion: validateDireccion(formData.direccion)
    };

    setErrors(newErrors);
    setTouched({
      nombreCompleto: true,
      correo: true,
      telefono: true,
      ciudad: true,
      barrio: true,
      direccion: true
    });

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleRemoveItem = async (item) => {
    const result = await showConfirm(
      'warning',
      '¿Eliminar producto?',
      `¿Estás seguro de eliminar "${item.name}" del carrito?`
    );

    if (result.isConfirmed) {
      removeFromCart(item.id);
    }
  };

  const handleClearCart = async () => {
    const result = await showConfirm(
      'warning',
      '¿Vaciar carrito?',
      '¿Estás seguro de eliminar todos los productos del carrito?'
    );

    if (result.isConfirmed) {
      clearCart();
    }
  };

  const handleProcederPago = () => {
    if (deliveryMethod === 'domicilio') {
      if (!validateForm()) {
        showError('Formulario incompleto', 'Por favor completa todos los campos correctamente.');
        return;
      }
    }

    console.log('Abriendo modal con:', {
    totalAmount: subtotal,
    deliveryMethod,
    deliveryInfo: deliveryMethod === 'domicilio' ? formData : null
  });

  setShowPaymentModal(true);
};

  const handleCloseModal = () => {
    setShowPaymentModal(false);
  };

  const subtotal = getSubtotal();
  const ivaTotal = getTax();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CartIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos para continuar tu compra</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#004D77] rounded-full flex items-center justify-center">
              <CartIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Carrito de compras</h1>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleClearCart}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Vaciar carrito
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Seguir comprando
            </button>
          </div>

          <div className={`grid gap-8 ${deliveryMethod === 'domicilio' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            
            {/* Columna izquierda: Productos */}
            <div className={deliveryMethod === 'domicilio' ? 'lg:col-span-2' : ''}>
              
              {/* Lista de productos */}
              <div className="space-y-4 mb-8">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex gap-4">
                      {/* Imagen — click lleva al detalle */}
                      <div
                        onClick={() => navigate('/shop/detail')}
                        className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3
                          onClick={() => navigate('/shop/detail')}
                          className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-[#004D77] transition-colors"
                        >
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                        <p className="text-xl font-bold text-gray-900">
                          {item.price.toLocaleString()} COP
                        </p>
                      </div>

                      {/* Controles de cantidad y precio total */}
                      <div className="flex flex-col items-end justify-between">
                        {/* Controles cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Precio total del item */}
                        <p className="text-xl font-bold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} COP
                        </p>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del pedido (debajo de productos solo cuando hay formulario) */}
              {deliveryMethod === 'domicilio' && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del pedido</h2>

                  {/* Método de entrega */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Método de entrega</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryMethod('domicilio')}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          deliveryMethod === 'domicilio'
                            ? 'border-[#004D77] bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <MapPin className={`w-6 h-6 ${deliveryMethod === 'domicilio' ? 'text-[#004D77]' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${deliveryMethod === 'domicilio' ? 'text-[#004D77]' : 'text-gray-700'}`}>
                          Domicilio
                        </span>
                      </button>

                      <button
                        onClick={() => setDeliveryMethod('tienda')}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          deliveryMethod === 'tienda'
                            ? 'border-[#004D77] bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Store className={`w-6 h-6 ${deliveryMethod === 'tienda' ? 'text-[#004D77]' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${deliveryMethod === 'tienda' ? 'text-[#004D77]' : 'text-gray-700'}`}>
                          Recoger en tienda
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Resumen de precios */}
                  <div className="space-y-3 mb-6 pt-6 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">{subtotal.toLocaleString()} COP</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-semibold">N/A</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {subtotal.toLocaleString()} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón proceder */}
                  <button
                    onClick={handleProcederPago}
                    className="w-full py-3 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceder al pago
                  </button>
                </div>
              )}
            </div>

            {/* Columna derecha: Formulario de envío (solo cuando es domicilio) */}
            {deliveryMethod === 'domicilio' && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-[#004D77]" />
                    <h3 className="font-bold text-gray-900">Información de envío</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Nombre completo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <HomeIcon className="w-4 h-4" />
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="nombreCompleto"
                          value={formData.nombreCompleto}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('nombreCompleto')}
                          placeholder="Juan Pérez"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                            errors.nombreCompleto && touched.nombreCompleto
                              ? 'border-red-500 focus:ring-red-200'
                              : formData.nombreCompleto && !errors.nombreCompleto && touched.nombreCompleto
                              ? 'border-green-500 focus:ring-green-200'
                              : 'border-gray-300 focus:ring-[#004D77]'
                          }`}
                          required
                        />
                        {touched.nombreCompleto && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.nombreCompleto ? (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : formData.nombreCompleto ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      {errors.nombreCompleto && touched.nombreCompleto && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.nombreCompleto}
                        </p>
                      )}
                    </div>

                    {/* Correo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Correo electrónico <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('correo')}
                          placeholder="ejemplo@correo.com"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                            errors.correo && touched.correo
                              ? 'border-red-500 focus:ring-red-200'
                              : formData.correo && !errors.correo && touched.correo
                              ? 'border-green-500 focus:ring-green-200'
                              : 'border-gray-300 focus:ring-[#004D77]'
                          }`}
                          required
                        />
                        {touched.correo && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.correo ? (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : formData.correo ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      {errors.correo && touched.correo && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.correo}
                        </p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('telefono')}
                          placeholder="300 123 4567"
                          maxLength="12"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                            errors.telefono && touched.telefono
                              ? 'border-red-500 focus:ring-red-200'
                              : formData.telefono && !errors.telefono && touched.telefono
                              ? 'border-green-500 focus:ring-green-200'
                              : 'border-gray-300 focus:ring-[#004D77]'
                          }`}
                          required
                        />
                        {touched.telefono && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.telefono ? (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : formData.telefono ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      {errors.telefono && touched.telefono && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.telefono}
                        </p>
                      )}
                    </div>

                    {/* Ciudad y Barrio */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Ciudad <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('ciudad')}
                            placeholder="Medellín"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                              errors.ciudad && touched.ciudad
                                ? 'border-red-500 focus:ring-red-200'
                                : formData.ciudad && !errors.ciudad && touched.ciudad
                                ? 'border-green-500 focus:ring-green-200'
                                : 'border-gray-300 focus:ring-[#004D77]'
                            }`}
                            required
                          />
                          {touched.ciudad && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              {errors.ciudad ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : formData.ciudad ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {errors.ciudad && touched.ciudad && (
                          <p className="text-[10px] text-red-500 mt-1">{errors.ciudad}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <HomeIcon className="w-4 h-4" />
                          Barrio <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="barrio"
                            value={formData.barrio}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('barrio')}
                            placeholder="El Poblado"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                              errors.barrio && touched.barrio
                                ? 'border-red-500 focus:ring-red-200'
                                : formData.barrio && !errors.barrio && touched.barrio
                                ? 'border-green-500 focus:ring-green-200'
                                : 'border-gray-300 focus:ring-[#004D77]'
                            }`}
                            required
                          />
                          {touched.barrio && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              {errors.barrio ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : formData.barrio ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {errors.barrio && touched.barrio && (
                          <p className="text-[10px] text-red-500 mt-1">{errors.barrio}</p>
                        )}
                      </div>
                    </div>

                    {/* Dirección */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Dirección de envío <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('direccion')}
                          placeholder="Calle 123 # 45-67, Apto 101"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                            errors.direccion && touched.direccion
                              ? 'border-red-500 focus:ring-red-200'
                              : formData.direccion && !errors.direccion && touched.direccion
                              ? 'border-green-500 focus:ring-green-200'
                              : 'border-gray-300 focus:ring-[#004D77]'
                          }`}
                          required
                        />
                        {touched.direccion && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.direccion ? (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : formData.direccion ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      {errors.direccion && touched.direccion && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.direccion}
                        </p>
                      )}
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Notas adicionales <span className="text-gray-400">(opcional)</span>
                      </label>
                      <textarea
                        name="notas"
                        value={formData.notas}
                        onChange={handleInputChange}
                        placeholder="Instrucciones especiales..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D77] text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen cuando es RECOGER EN TIENDA - Full width */}
          {deliveryMethod === 'tienda' && (
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del pedido</h2>

              {/* Método de entrega - Full Width */}
              <div className="mb-8">
                <p className="text-base font-medium text-gray-700 mb-4">Método de entrega</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryMethod('domicilio')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                      deliveryMethod === 'domicilio'
                        ? 'border-[#004D77] bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <MapPin className={`w-8 h-8 ${deliveryMethod === 'domicilio' ? 'text-[#004D77]' : 'text-gray-600'}`} />
                    <span className={`text-base font-medium ${deliveryMethod === 'domicilio' ? 'text-[#004D77]' : 'text-gray-700'}`}>
                      Domicilio
                    </span>
                  </button>

                  <button
                    onClick={() => setDeliveryMethod('tienda')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                      deliveryMethod === 'tienda'
                        ? 'border-[#004D77] bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Store className={`w-8 h-8 ${deliveryMethod === 'tienda' ? 'text-[#004D77]' : 'text-gray-600'}`} />
                    <span className={`text-base font-medium ${deliveryMethod === 'tienda' ? 'text-[#004D77]' : 'text-gray-700'}`}>
                      Recoger en tienda
                    </span>
                  </button>
                </div>
              </div>

              {/* Resumen de precios - Full Width */}
              <div className="space-y-4 mb-8 pt-6 border-t">
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">{subtotal.toLocaleString()} COP</span>
                </div>

                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-700">Envío</span>
                  <span className="font-semibold text-gray-600">N/A</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-gray-900">
                      {subtotal.toLocaleString()} COP
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón proceder - Full Width */}
              <button
                onClick={handleProcederPago}
                className="w-full py-4 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-colors font-semibold text-lg flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                Finalizar compra
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && (
        <CompletePay
          isOpen={showPaymentModal}
          onClose={handleCloseModal}
          totalAmount={subtotal}
          deliveryMethod={deliveryMethod}
          deliveryInfo={deliveryMethod === 'domicilio' ? formData : null}
        />
      )}
    </>
  );
}

export default ShoppingCart;