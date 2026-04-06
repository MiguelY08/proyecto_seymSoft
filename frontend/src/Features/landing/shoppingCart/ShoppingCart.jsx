import { useState } from 'react';
import {
  ShoppingCart as CartIcon,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Home as HomeIcon,
  Store,
  MessageSquare,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/Context/Cartcontext';
import { useAlert } from '../../shared/alerts/useAlert';
import CompletePay from './modals/CompletePay.jsx';

/* ── Estilos (coherentes con Home/Favorites) ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes cart-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes cart-emptyFloat {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }

  .cart-page {
    background: #f6f9fc;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    min-height: 100vh;
  }

  .cart-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
  }

  /* Header */
  .cart-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .cart-icon-circle {
    width: 52px;
    height: 52px;
    background: linear-gradient(140deg, #e8f4fd 0%, #d4ebf8 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cart-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }

  /* Botones acción */
  .cart-action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .btn-secondary {
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 40px;
    padding: 8px 20px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #1e4060;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-secondary:hover {
    border-color: #afd0e6;
    background: #f0f8ff;
    transform: translateY(-1px);
  }
  .btn-primary {
    background: #004D77;
    border: 2px solid #004D77;
    border-radius: 40px;
    padding: 8px 24px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background: transparent;
    color: #004D77;
    transform: translateY(-1px);
  }

  /* Tarjeta producto */
  .cart-item-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 20px;
    padding: 16px;
    margin-bottom: 12px;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    animation: cart-fadeUp 0.4s ease both;
  }
  .cart-item-card:hover {
    box-shadow: 0 8px 28px rgba(0, 77, 119, 0.1);
    transform: translateY(-2px);
    border-color: #afd0e6;
  }
  .cart-item-inner {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .cart-item-img {
    width: 80px;
    height: 80px;
    background: linear-gradient(150deg, #eef6fb 0%, #e0eef7 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }
  .cart-item-img img {
    width: 70%;
    height: 70%;
    object-fit: contain;
  }
  .cart-item-info {
    flex: 2;
    min-width: 150px;
  }
  .cart-item-name {
    font-weight: 800;
    font-size: 1rem;
    color: #0c2a3a;
    cursor: pointer;
    margin-bottom: 4px;
  }
  .cart-item-name:hover {
    color: #004D77;
  }
  .cart-item-category {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #9abcce;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }
  .cart-item-price {
    font-size: 1.2rem;
    font-weight: 900;
    color: #004D77;
  }
  .cart-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    padding: 4px 8px;
    border-radius: 40px;
    border: 1px solid #e2edf5;
  }
  .qty-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e2edf5;
    cursor: pointer;
    transition: all 0.15s;
  }
  .qty-btn:hover {
    background: #eef6fb;
    border-color: #afd0e6;
  }
  .qty-number {
    font-weight: 800;
    min-width: 28px;
    text-align: center;
  }
  .item-total {
    font-weight: 900;
    font-size: 1.1rem;
    color: #0c2a3a;
  }
  .delete-btn {
    background: none;
    border: none;
    color: #9abcce;
    cursor: pointer;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }
  .delete-btn:hover {
    color: #e53e3e;
  }

  /* Tarjeta de resumen / formulario */
  .summary-card, .delivery-form-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  }
  .summary-title, .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .delivery-method-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .method-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    border: 2px solid #e2edf5;
    border-radius: 18px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }
  .method-option.active {
    border-color: #004D77;
    background: #f0f8ff;
  }
  .method-icon {
    width: 32px;
    height: 32px;
    color: #9abcce;
  }
  .method-option.active .method-icon {
    color: #004D77;
  }
  .method-label {
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Formulario */
  .form-group {
    margin-bottom: 18px;
  }
  .form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 800;
    color: #1e4060;
    margin-bottom: 6px;
  }
  .form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2edf5;
    border-radius: 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.85rem;
    transition: all 0.2s;
    background: #ffffff;
  }
  .form-input:focus {
    outline: none;
    border-color: #004D77;
    box-shadow: 0 0 0 3px rgba(0, 77, 119, 0.1);
  }
  .form-input.error {
    border-color: #f56565;
  }
  .form-input.success {
    border-color: #48bb78;
  }
  .error-message {
    font-size: 0.7rem;
    color: #f56565;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .price-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  .total-row {
    border-top: 1px solid #e2edf5;
    margin-top: 16px;
    padding-top: 16px;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .btn-checkout {
    width: 100%;
    background: #004D77;
    color: white;
    border: none;
    border-radius: 40px;
    padding: 14px;
    font-weight: 800;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 16px;
  }
  .btn-checkout:hover {
    background: #0c5c88;
    transform: translateY(-2px);
  }

  /* ── Empty state (estilo Favorites) ── */
  .cart-empty {
    text-align: center;
    padding: clamp(48px, 10vw, 96px) 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    animation: cart-fadeUp 0.5s ease;
  }
  .cart-empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border: 1.5px solid #e2edf5;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: cart-emptyFloat 3s ease-in-out infinite;
  }
  .cart-empty-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }
  .cart-empty-sub {
    font-size: 0.88rem;
    color: #64748b;
    max-width: 320px;
    line-height: 1.6;
    margin: 0;
  }
  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    border: 2px solid #004D77;
    color: #004D77;
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border-radius: 100px;
    text-decoration: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
  }
  .btn-outline:hover {
    background: #004D77;
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-outline:active {
    transform: scale(0.97);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .cart-item-inner {
      flex-direction: column;
      align-items: stretch;
    }
    .cart-item-actions {
      align-items: flex-start;
    }
    .delivery-method-grid {
      grid-template-columns: 1fr;
    }
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function ShoppingCart() {
  injectStyles();
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
    getTotalItems,
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
    notas: '',
  });
  const [errors, setErrors] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    ciudad: '',
    barrio: '',
    direccion: '',
  });
  const [touched, setTouched] = useState({
    nombreCompleto: false,
    correo: false,
    telefono: false,
    ciudad: false,
    barrio: false,
    direccion: false,
  });

  // Validaciones (idénticas al original)
  const validateNombreCompleto = (value) => {
    if (!value.trim()) return 'El nombre completo es obligatorio';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'Solo letras';
    if (value.trim().split(/\s+/).length < 2) return 'Ingresa nombre y apellido';
    return '';
  };
  const validateCorreo = (value) => {
    if (!value.trim()) return 'El correo es obligatorio';
    if (!value.includes('@')) return 'Debe contener @';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Formato inválido';
    return '';
  };
  const validateTelefono = (value) => {
    if (!value.trim()) return 'El teléfono es obligatorio';
    if (!/^[\d\s]+$/.test(value)) return 'Solo números';
    const digitsOnly = value.replace(/\s/g, '');
    if (digitsOnly.length < 10) return 'Mínimo 10 dígitos';
    if (digitsOnly.length > 10) return 'Máximo 10 dígitos';
    return '';
  };
  const validateCiudad = (value) => {
    if (!value.trim()) return 'La ciudad es obligatoria';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'Solo letras';
    return '';
  };
  const validateBarrio = (value) => {
    if (!value.trim()) return 'El barrio es obligatorio';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    return '';
  };
  const validateDireccion = (value) => {
    if (!value.trim()) return 'La dirección es obligatoria';
    if (value.trim().length < 5) return 'Mínimo 5 caracteres';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      const cleaned = value.replace(/[^\d\s]/g, '');
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: validateTelefono(cleaned) }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    let error = '';
    switch (name) {
      case 'nombreCompleto':
        error = validateNombreCompleto(formData.nombreCompleto);
        break;
      case 'correo':
        error = validateCorreo(formData.correo);
        break;
      case 'telefono':
        error = validateTelefono(formData.telefono);
        break;
      case 'ciudad':
        error = validateCiudad(formData.ciudad);
        break;
      case 'barrio':
        error = validateBarrio(formData.barrio);
        break;
      case 'direccion':
        error = validateDireccion(formData.direccion);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      nombreCompleto: validateNombreCompleto(formData.nombreCompleto),
      correo: validateCorreo(formData.correo),
      telefono: validateTelefono(formData.telefono),
      ciudad: validateCiudad(formData.ciudad),
      barrio: validateBarrio(formData.barrio),
      direccion: validateDireccion(formData.direccion),
    };
    setErrors(newErrors);
    setTouched({
      nombreCompleto: true,
      correo: true,
      telefono: true,
      ciudad: true,
      barrio: true,
      direccion: true,
    });
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleRemoveItem = async (item) => {
    const result = await showConfirm(
      'warning',
      '¿Eliminar producto?',
      `¿Estás seguro de eliminar "${item.name}" del carrito?`
    );
    if (result.isConfirmed) removeFromCart(item.id);
  };

  const handleClearCart = async () => {
    const result = await showConfirm(
      'warning',
      '¿Vaciar carrito?',
      '¿Estás seguro de eliminar todos los productos del carrito?'
    );
    if (result.isConfirmed) clearCart();
  };

  const handleProcederPago = () => {
    if (deliveryMethod === 'domicilio') {
      if (!validateForm()) {
        showError('Formulario incompleto', 'Por favor completa todos los campos correctamente.');
        return;
      }
    }
    setShowPaymentModal(true);
  };

  const subtotal = getSubtotal();

  // ── Empty state rediseñado al estilo Favorites ──
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <CartIcon size={32} color="#004D77" strokeWidth={1.5} />
            </div>
            <h3 className="cart-empty-title">Tu carrito está vacío</h3>
            <p className="cart-empty-sub">
              Agrega los productos que deseas y continúa tu compra de forma fácil y rápida.
            </p>
            <button onClick={() => navigate('/shop')} className="btn-outline">
              Ir a la tienda <ArrowRight size={13} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-icon-circle">
            <CartIcon size={26} color="#004D77" strokeWidth={1.8} />
          </div>
          <h1 className="cart-title">Carrito de compras</h1>
        </div>

        {/* Botones acción */}
        <div className="cart-action-buttons">
          <button onClick={handleClearCart} className="btn-secondary">
            Vaciar carrito
          </button>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Seguir comprando
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda: productos */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item, idx) => (
              <div
                key={item.id}
                className="cart-item-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="cart-item-inner">
                  <div
                    className="cart-item-img"
                    onClick={() => navigate('/shop/detail')}
                  >
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <div
                      className="cart-item-name"
                      onClick={() => navigate('/shop/detail')}
                    >
                      {item.name}
                    </div>
                    <div className="cart-item-category">{item.category}</div>
                    <div className="cart-item-price">
                      ${item.price.toLocaleString()} COP
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => increaseQuantity(item.id)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toLocaleString()} COP
                    </div>
                    <button className="delete-btn" onClick={() => handleRemoveItem(item)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha: resumen o formulario */}
          <div>
            {deliveryMethod === 'domicilio' ? (
              <div className="delivery-form-card">
                <div className="form-title">
                  <MapPin size={22} color="#004D77" /> Información de envío
                </div>

                <div className="delivery-method-grid">
                  <div
                    className={`method-option ${deliveryMethod === 'domicilio' ? 'active' : ''}`}
                    onClick={() => setDeliveryMethod('domicilio')}
                  >
                    <MapPin className="method-icon" />
                    <span className="method-label">Domicilio</span>
                  </div>
                  <div
                    className={`method-option ${deliveryMethod === 'tienda' ? 'active' : ''}`}
                    onClick={() => setDeliveryMethod('tienda')}
                  >
                    <Store className="method-icon" />
                    <span className="method-label">Recoger en tienda</span>
                  </div>
                </div>

                {/* Formulario campos */}
                {[
                  { name: 'nombreCompleto', label: 'Nombre completo', icon: HomeIcon, type: 'text', placeholder: 'Juan Pérez' },
                  { name: 'correo', label: 'Correo electrónico', icon: Mail, type: 'email', placeholder: 'ejemplo@correo.com' },
                  { name: 'telefono', label: 'Teléfono', icon: Phone, type: 'tel', placeholder: '300 123 4567' },
                ].map((field) => (
                  <div className="form-group" key={field.name}>
                    <label className="form-label">
                      <field.icon size={14} /> {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={field.placeholder}
                      className={`form-input ${
                        errors[field.name] && touched[field.name]
                          ? 'error'
                          : formData[field.name] && !errors[field.name] && touched[field.name]
                          ? 'success'
                          : ''
                      }`}
                    />
                    {errors[field.name] && touched[field.name] && (
                      <div className="error-message">
                        <AlertCircle size={12} /> {errors[field.name]}
                      </div>
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={14} /> Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('ciudad')}
                      placeholder="Medellín"
                      className={`form-input ${
                        errors.ciudad && touched.ciudad ? 'error' : formData.ciudad && !errors.ciudad && touched.ciudad ? 'success' : ''
                      }`}
                    />
                    {errors.ciudad && touched.ciudad && <div className="error-message"><AlertCircle size={12} /> {errors.ciudad}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <HomeIcon size={14} /> Barrio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="barrio"
                      value={formData.barrio}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('barrio')}
                      placeholder="El Poblado"
                      className={`form-input ${
                        errors.barrio && touched.barrio ? 'error' : formData.barrio && !errors.barrio && touched.barrio ? 'success' : ''
                      }`}
                    />
                    {errors.barrio && touched.barrio && <div className="error-message"><AlertCircle size={12} /> {errors.barrio}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={14} /> Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('direccion')}
                    placeholder="Calle 123 # 45-67, Apto 101"
                    className={`form-input ${
                      errors.direccion && touched.direccion ? 'error' : formData.direccion && !errors.direccion && touched.direccion ? 'success' : ''
                    }`}
                  />
                  {errors.direccion && touched.direccion && <div className="error-message"><AlertCircle size={12} /> {errors.direccion}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare size={14} /> Notas adicionales (opcional)
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows="2"
                    className="form-input"
                    placeholder="Instrucciones especiales..."
                  />
                </div>

                {/* Resumen dentro del formulario */}
                <div className="summary-card" style={{ marginTop: 24 }}>
                  <div className="summary-title">Resumen del pedido</div>
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span className="font-bold">${subtotal.toLocaleString()} COP</span>
                  </div>
                  <div className="price-row">
                    <span>Envío</span>
                    <span>N/A</span>
                  </div>
                  <div className="price-row total-row">
                    <span>Total</span>
                    <span className="text-[#004D77] text-xl">${subtotal.toLocaleString()} COP</span>
                  </div>
                  <button className="btn-checkout" onClick={handleProcederPago}>
                    <CreditCard size={18} /> Proceder al pago
                  </button>
                </div>
              </div>
            ) : (
              <div className="summary-card">
                <div className="summary-title">
                  <Store size={22} color="#004D77" /> Resumen del pedido
                </div>

                <div className="delivery-method-grid">
                  <div
                    className={`method-option ${deliveryMethod === 'domicilio' ? 'active' : ''}`}
                    onClick={() => setDeliveryMethod('domicilio')}
                  >
                    <MapPin className="method-icon" />
                    <span className="method-label">Domicilio</span>
                  </div>
                  <div
                    className={`method-option ${deliveryMethod === 'tienda' ? 'active' : ''}`}
                    onClick={() => setDeliveryMethod('tienda')}
                  >
                    <Store className="method-icon" />
                    <span className="method-label">Recoger en tienda</span>
                  </div>
                </div>

                <div className="price-row">
                  <span>Subtotal</span>
                  <span className="font-bold">${subtotal.toLocaleString()} COP</span>
                </div>
                <div className="price-row">
                  <span>Envío</span>
                  <span>N/A</span>
                </div>
                <div className="price-row total-row">
                  <span>Total</span>
                  <span className="text-[#004D77] text-xl">${subtotal.toLocaleString()} COP</span>
                </div>
                <button className="btn-checkout" onClick={handleProcederPago}>
                  <CreditCard size={18} /> Finalizar compra
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && (
        <CompletePay
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totalAmount={subtotal}
          deliveryMethod={deliveryMethod}
          deliveryInfo={deliveryMethod === 'domicilio' ? formData : null}
        />
      )}
    </div>
  );
}

export default ShoppingCart;