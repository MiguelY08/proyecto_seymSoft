import React, { useState } from 'react';
import { Minus, Plus, Trash2, CreditCard, MapPin, User, Mail, Phone, FileText, Store, Truck, ShoppingCart as CartIcon, Building2, Home } from 'lucide-react';
import CompletePay from './modals/CompletePay';
import { useAlert } from '../../shared/alerts/useAlert';

// Datos de ejemplo
const sampleCartItems = [
  {
    id: 1,
    nombre: 'Set de marcadores Sharpie X30',
    descripcion: 'Set de 30 marcadores con una punta fina para mayor precisión y unos colores increíbles',
    precio: 120000,
    cantidad: 2,
    imagen: '📦'
  },
  {
    id: 2,
    nombre: 'Cuaderno Primavera',
    descripcion: 'Tamaño A5, 100 hojas',
    precio: 7000,
    cantidad: 1,
    imagen: '📦'
  }
];

// ─── Estado inicial del formulario ────────────────────────────────────────────
const initialForm = {
  nombre: '',
  correo: '',
  telefono: '',
  ciudad: '',
  barrio: '',
  direccion: '',
  notas: '',
};

// ─── Validaciones en tiempo real ──────────────────────────────────────────────
function validateField(name, value) {
  switch (name) {
    case 'nombre':
      if (!value.trim()) return 'El nombre completo es obligatorio.';
      if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      return '';

    case 'correo': {
      if (!value.trim()) return 'El correo electrónico es obligatorio.';
      if (!value.includes('@')) return 'El correo electrónico debe contener @.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'Ingresa un correo electrónico válido. Ej: nombre@dominio.com';
      return '';
    }

    case 'telefono':
      if (!value.trim()) return 'El teléfono es obligatorio.';
      if (value.replace(/\s/g, '').length < 7) return 'El teléfono debe tener al menos 7 dígitos.';
      return '';

    case 'ciudad':
      if (!value.trim()) return 'La ciudad es obligatoria.';
      if (value.trim().length < 2) return 'Ingresa una ciudad válida.';
      return '';

    case 'barrio':
      if (!value.trim()) return 'El barrio es obligatorio.';
      if (value.trim().length < 2) return 'Ingresa un barrio válido.';
      return '';

    case 'direccion':
      if (!value.trim()) return 'La dirección de envío es obligatoria.';
      if (value.trim().length < 5) return 'Ingresa una dirección más completa.';
      return '';

    default:
      return '';
  }
}

// ─── Componente de mensaje de error ──────────────────────────────────────────
function FieldError({ touched, error }) {
  if (!touched || !error) return null;
  return (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <span></span> {error}
    </p>
  );
}

// ─── Clases del input según estado ───────────────────────────────────────────
function inputClass(name, touched, errors) {
  const hasError = touched[name] && errors[name];
  const isOk     = touched[name] && !errors[name];
  return `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
    hasError
      ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
      : isOk
      ? 'border-green-400 focus:ring-green-200 bg-green-50'
      : 'border-gray-300 focus:ring-[#004D77]'
  }`;
}

function ShoppingCart() {
  const { showConfirm, showSuccess } = useAlert();

  const [cartItems, setCartItems]           = useState(sampleCartItems);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [form,    setForm]    = useState(initialForm);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  // ── Handlers del formulario ───────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Teléfono: solo dígitos y espacios, bloquear letras
    if (name === 'telefono') {
      const clean = value.replace(/[^\d\s]/g, '');
      setForm(prev => ({ ...prev, [name]: clean }));
      setTouched(prev => ({ ...prev, [name]: true }));
      setErrors(prev => ({ ...prev, [name]: validateField(name, clean) }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Validar todos los campos requeridos al enviar
  const validateAll = () => {
    const requiredFields = ['nombre', 'correo', 'telefono', 'ciudad', 'barrio', 'direccion'];
    const newErrors  = {};
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
      newErrors[field]  = validateField(field, form[field]);
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every(e => e === '');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setShowPaymentModal(true);
  };

  // ── Carrito ───────────────────────────────────────────────────────────────
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, cantidad: newQuantity } : item)
    );
  };

  const handleRemoveItem = async (id) => {
    const result = await showConfirm(
      'warning',
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto del carrito?',
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );
    if (!result.isConfirmed) return;
    setCartItems(items => items.filter(item => item.id !== id));
    showSuccess('Producto eliminado', 'El producto fue eliminado del carrito exitosamente.');
  };

  const handleVaciarCarrito = async () => {
    const result = await showConfirm(
      'warning',
      'Vaciar carrito',
      '¿Estás seguro de que deseas eliminar todos los productos del carrito? Esta acción no se puede deshacer.',
      { confirmButtonText: 'Sí, vaciar', cancelButtonText: 'Cancelar' }
    );
    if (!result.isConfirmed) return;
    setCartItems([]);
    setDeliveryMethod(null);
    showSuccess('Carrito vaciado', 'Todos los productos fueron eliminados del carrito.');
  };

  const handleFinalizarCompra = () => setShowPaymentModal(true);

  const subtotal        = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const total           = subtotal;
  const showPaymentForm = deliveryMethod === 'delivery';

  return (
    <>
      <style>{`
        @keyframes fadeIn       { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp      { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn       { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp      { animation: slideUp 0.3s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#004D77] rounded-full flex items-center justify-center">
              <CartIcon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Carrito de compras</h1>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleVaciarCarrito}
              disabled={cartItems.length === 0}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Vaciar carrito
            </button>
            <button className="px-6 py-2.5 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium">
              Seguir comprando
            </button>
          </div>

          {/* Grid principal */}
          <div className={`grid gap-6 transition-all duration-500 ease-in-out ${
            showPaymentForm ? 'lg:grid-cols-[1fr_420px]' : 'grid-cols-1'
          }`}>

            {/* ── Columna de productos ─────────────────────────────────── */}
            <div className="space-y-6">

              {cartItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CartIcon className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-600">Agrega productos para comenzar tu compra</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">{item.imagen}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{item.nombre}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.descripcion}</p>
                        <p className="text-lg font-bold text-gray-900">{item.precio.toLocaleString()} COP</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                          <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{(item.precio * item.cantidad).toLocaleString()} COP</p>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mt-2 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Resumen del pedido */}
              {cartItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del pedido</h3>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Método de entrega</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                          deliveryMethod === 'delivery' ? 'border-[#004D77] bg-blue-50 scale-105' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Truck className={`w-6 h-6 transition-colors duration-300 ${deliveryMethod === 'delivery' ? 'text-[#004D77]' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium transition-colors duration-300 ${deliveryMethod === 'delivery' ? 'text-[#004D77]' : 'text-gray-600'}`}>Domicilio</span>
                      </button>
                      <button
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                          deliveryMethod === 'pickup' ? 'border-[#004D77] bg-blue-50 scale-105' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Store className={`w-6 h-6 transition-colors duration-300 ${deliveryMethod === 'pickup' ? 'text-[#004D77]' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium transition-colors duration-300 ${deliveryMethod === 'pickup' ? 'text-[#004D77]' : 'text-gray-600'}`}>Recoger en tienda</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{subtotal.toLocaleString()} COP</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Envío</span>
                      <span>{deliveryMethod === 'delivery' ? 'Gratis' : deliveryMethod === 'pickup' ? 'N/A' : '-'}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>{total.toLocaleString()} COP</span>
                      </div>
                    </div>
                  </div>

                  {deliveryMethod === 'pickup' && (
                    <button
                      type="button"
                      onClick={handleFinalizarCompra}
                      className="w-full mt-4 py-3 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold flex items-center justify-center gap-2 animate-slideUp"
                    >
                      <CreditCard className="w-5 h-5" />
                      Finalizar compra
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Formulario de domicilio ──────────────────────────────── */}
            {showPaymentForm && cartItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-6 animate-slideInRight">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Información de envío
                </h3>

                <form onSubmit={handleProceedToPayment} noValidate className="space-y-4">

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleFormChange}
                      onBlur={handleBlur}
                      placeholder="Juan Pérez"
                      className={inputClass('nombre', touched, errors)}
                    />
                    <FieldError touched={touched.nombre} error={errors.nombre} />
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="correo"
                      value={form.correo}
                      onChange={handleFormChange}
                      onBlur={handleBlur}
                      placeholder="ejemplo@correo.com"
                      className={inputClass('correo', touched, errors)}
                    />
                    <FieldError touched={touched.correo} error={errors.correo} />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleFormChange}
                      onBlur={handleBlur}
                      placeholder="300 123 4567"
                      maxLength={15}
                      inputMode="numeric"
                      className={inputClass('telefono', touched, errors)}
                    />
                    <FieldError touched={touched.telefono} error={errors.telefono} />
                  </div>

                  {/* Ciudad y Barrio */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Ciudad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={form.ciudad}
                        onChange={handleFormChange}
                        onBlur={handleBlur}
                        placeholder="Medellín"
                        className={inputClass('ciudad', touched, errors)}
                      />
                      <FieldError touched={touched.ciudad} error={errors.ciudad} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Home className="w-4 h-4" /> Barrio <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="barrio"
                        value={form.barrio}
                        onChange={handleFormChange}
                        onBlur={handleBlur}
                        placeholder="El Poblado"
                        className={inputClass('barrio', touched, errors)}
                      />
                      <FieldError touched={touched.barrio} error={errors.barrio} />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Dirección de envío <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="direccion"
                      value={form.direccion}
                      onChange={handleFormChange}
                      onBlur={handleBlur}
                      placeholder="Calle 123 # 45-67, Apto 101"
                      rows="3"
                      className={`${inputClass('direccion', touched, errors)} resize-none`}
                    />
                    <FieldError touched={touched.direccion} error={errors.direccion} />
                  </div>

                  {/* Notas (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Notas adicionales <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                    </label>
                    <textarea
                      name="notas"
                      value={form.notas}
                      onChange={handleFormChange}
                      placeholder="Instrucciones especiales..."
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D77] resize-none text-sm transition-all"
                    />
                  </div>

                  {/* Botón */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#004D77] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceder al pago
                  </button>

                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal de pago */}
      <CompletePay
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        deliveryMethod={deliveryMethod}
      />
    </>
  );
}

export default ShoppingCart;