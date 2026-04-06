import { ChevronRight, X, AlertTriangle, Phone, Upload, Plus, Minus, ChevronDown, Package } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';

/* ── Estilos inyectados (coherentes con el sistema) ── */
const EDIT_RETURN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes edit-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .edit-return-page {
    background: #f6f9fc;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
  }

  .edit-return-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 24px;
  }
  .breadcrumb a {
    color: #004D77;
    text-decoration: none;
    font-weight: 600;
  }
  .btn-back {
    background: transparent;
    border: 1.5px solid #e2edf5;
    border-radius: 40px;
    padding: 8px 16px;
    font-weight: 700;
    font-size: 0.75rem;
    color: #1e4060;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .btn-back:hover {
    background: #f0f8ff;
    border-color: #afd0e6;
    transform: translateY(-1px);
  }

  .edit-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 28px;
  }
  @media (min-width: 1024px) {
    .edit-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  /* Tarjeta principal */
  .form-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0, 77, 119, 0.05);
    animation: edit-fadeUp 0.4s ease;
  }
  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 8px;
  }
  .form-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 24px;
  }

  /* Seleccionar todos */
  .select-all {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eef2f6;
    margin-bottom: 20px;
  }
  .select-all input {
    width: 18px;
    height: 18px;
    accent-color: #004D77;
    cursor: pointer;
  }
  .select-all label {
    font-weight: 800;
    font-size: 0.85rem;
    color: #1e4060;
    cursor: pointer;
  }

  /* Producto expandible */
  .product-item {
    border: 1px solid #eef2f6;
    border-radius: 20px;
    margin-bottom: 16px;
    transition: all 0.2s;
  }
  .product-item.selected {
    border-color: #004D77;
    background: #fafcff;
  }
  .product-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    cursor: pointer;
  }
  .product-checkbox {
    width: 20px;
    height: 20px;
    accent-color: #004D77;
    cursor: pointer;
  }
  .product-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .product-info {
    flex: 1;
  }
  .product-name {
    font-weight: 800;
    font-size: 0.9rem;
    color: #0c2a3a;
    margin-bottom: 4px;
  }
  .product-quantity {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 600;
  }
  .expand-icon {
    color: #9abcce;
    transition: transform 0.2s;
  }
  .expand-icon.open {
    transform: rotate(180deg);
  }

  /* Formulario expandido */
  .product-form {
    padding: 0 16px 20px 16px;
    border-top: 1px solid #eef2f6;
    margin-top: 8px;
  }
  .form-row {
    margin-bottom: 16px;
  }
  .form-row label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    color: #1e4060;
    margin-bottom: 6px;
  }
  .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2edf5;
    border-radius: 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.85rem;
    background: white;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239abcce' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 14px;
  }
  .form-select:focus {
    outline: none;
    border-color: #004D77;
  }
  .upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .upload-area:hover {
    border-color: #004D77;
    background: #f0f8ff;
  }
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .quantity-btn {
    width: 36px;
    height: 36px;
    border: 1.5px solid #e2edf5;
    border-radius: 12px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .quantity-btn:hover {
    border-color: #004D77;
    background: #f0f8ff;
  }
  .quantity-input {
    width: 60px;
    text-align: center;
    padding: 8px;
    border: 1.5px solid #e2edf5;
    border-radius: 12px;
    font-weight: 700;
  }
  .btn-primary-full {
    width: 100%;
    background: #004D77;
    border: none;
    border-radius: 40px;
    padding: 14px;
    font-weight: 800;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 20px;
  }
  .btn-primary-full:hover {
    background: #0c5c88;
    transform: translateY(-2px);
  }

  /* Alerta */
  .alert-box {
    margin-top: 24px;
    background: #fef9e3;
    border: 1px solid #fde68a;
    border-radius: 20px;
    padding: 16px;
    display: flex;
    gap: 12px;
  }
  .alert-content {
    font-size: 0.8rem;
    color: #92400e;
    line-height: 1.5;
  }

  /* Contacto sidebar */
  .contact-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 28px;
    padding: 24px;
    position: sticky;
    top: 24px;
    box-shadow: 0 4px 20px rgba(0, 77, 119, 0.05);
  }
  .contact-title {
    font-weight: 800;
    font-size: 1.1rem;
    color: #0c2a3a;
    margin-bottom: 12px;
  }
  .contact-text {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .whatsapp-link {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }
  .whatsapp-icon {
    width: 40px;
    height: 40px;
    background: #dcfce7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .social-title {
    font-weight: 800;
    font-size: 0.8rem;
    color: #1e4060;
    margin-bottom: 12px;
  }
  .social-icons {
    display: flex;
    gap: 12px;
  }
  .social-link {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  .social-link:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    .form-card {
      padding: 20px;
    }
    .contact-card {
      position: static;
    }
  }
`;

let editStylesInjected = false;
function injectEditStyles() {
  if (editStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = EDIT_RETURN_STYLES;
  document.head.appendChild(style);
  editStylesInjected = true;
}

function EditReturn() {
  injectEditStyles();
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados originales
  const [seleccionarTodos, setSeleccionarTodos] = useState(true);
  const [productosSeleccionados, setProductosSeleccionados] = useState([1]);
  const [motivo, setMotivo] = useState('Prod. en mal estado');
  const [metodoDevolucion, setMetodoDevolucion] = useState('Reemplazo');
  const [cantidad, setCantidad] = useState(15);
  const [evidencias, setEvidencias] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(1); // para controlar qué producto está expandido (el único producto)

  const pedido = {
    id: '4512',
    productos: [
      { id: 1, nombre: 'LIBRETA CON LAPICERO', cantidad: 50, imagen: '/placeholder.png' }
    ]
  };

  const motivosDevolucion = [
    'Prod. en mal estado',
    'Producto incorrecto',
    'No cumple expectativas',
    'Cambio de opinión',
    'Otro'
  ];

  const metodosDevolucion = ['Reemplazo', 'Reembolso'];

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
    if (cantidad < 50) setCantidad(cantidad + 1);
  };
  const handleDecrementarCantidad = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
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
    alert('Solicitud de devolución actualizada correctamente');
    navigate(`/returns/${id}`);
  };

  const producto = pedido.productos[0];
  const isSelected = productosSeleccionados.includes(producto.id);

  return (
    <div className="edit-return-page">
      <ShopHero
        image={BgPedidos}
        title="Devoluciones"
        tag="Editar"
        subtitle="Modifica tu solicitud de devolución"
      />

      <div className="edit-return-container">
        <button onClick={() => navigate(`/returns/${id}`)} className="btn-back">
          <X size={14} /> Volver
        </button>
        <div className="breadcrumb">
          <a href="/returnsOnOrders">Devoluciones</a>
          <ChevronRight size={14} />
          <span>Modificando devolución No. {pedido.id}</span>
        </div>

        <div className="edit-grid">
          {/* Columna izquierda - Formulario */}
          <div className="form-card">
            <h2 className="form-title">Productos del pedido</h2>
            <p className="form-subtitle">Escoja los productos que desea devolver</p>

            <div className="select-all">
              <input
                type="checkbox"
                id="seleccionar-todos"
                checked={seleccionarTodos}
                onChange={handleSeleccionarTodos}
              />
              <label htmlFor="seleccionar-todos">Seleccionar todos</label>
            </div>

            <div className="product-list">
              <div className={`product-item ${isSelected ? 'selected' : ''}`}>
                <div className="product-header" onClick={() => setExpandedProduct(expandedProduct === producto.id ? null : producto.id)}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSeleccionarProducto(producto.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="product-checkbox"
                  />
                  <div className="product-icon">
                    <Package size={24} className="text-gray-500" />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{producto.nombre}</div>
                    <div className="product-quantity">Cantidad: {producto.cantidad}</div>
                  </div>
                  <ChevronDown size={18} className={`expand-icon ${expandedProduct === producto.id ? 'open' : ''}`} />
                </div>

                {expandedProduct === producto.id && isSelected && (
                  <div className="product-form">
                    <div className="form-row">
                      <label>Motivo <span className="text-red-500">*</span></label>
                      <select className="form-select" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                        {motivosDevolucion.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Método de devolución <span className="text-red-500">*</span></label>
                      <select className="form-select" value={metodoDevolucion} onChange={(e) => setMetodoDevolucion(e.target.value)}>
                        {metodosDevolucion.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Evidencias <span className="text-red-500">*</span></label>
                      <label className="upload-area">
                        <input type="file" multiple accept="image/png,image/jpeg,image/jpg" onChange={handleEvidenciaChange} className="hidden" />
                        <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">
                          {evidencias.length > 0 ? `${evidencias.length} archivo(s) seleccionado(s)` : 'Haz clic para subir evidencias'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG o JPEG (máx. 10MB por archivo)</p>
                      </label>
                    </div>
                    <div className="form-row">
                      <label>Cantidad <span className="text-red-500">*</span></label>
                      <div className="quantity-control">
                        <button className="quantity-btn" onClick={handleDecrementarCantidad}><Minus size={14} /></button>
                        <input type="number" className="quantity-input" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} />
                        <button className="quantity-btn" onClick={handleIncrementarCantidad}><Plus size={14} /></button>
                        <span className="text-xs text-gray-500">Máx. 50</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button className="btn-primary-full" onClick={handleGuardar}>
              Guardar
            </button>

            <div className="alert-box">
              <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
              <div className="alert-content">
                <p className="mb-2">
                  En el momento de "Guardar", se enviará la solicitud de devolución. Nuestro equipo estará al tanto y se
                  encargará de aprobar o desaprobar esta devolución.
                </p>
                <p>En cualquier caso, te avisaremos a través de tu correo electrónico.</p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Contacto */}
          <div className="contact-card">
            <h3 className="contact-title">Contacto</h3>
            <p className="contact-text">
              ¿Tienes dudas sobre cómo generar la devolución? Comunícate con nosotros y te
              ayudaremos con todo lo que necesites saber.
            </p>
            <div className="whatsapp-link">
              <div className="whatsapp-icon"><Phone size={20} className="text-green-600" /></div>
              <a href="https://wa.me/573002936722" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 hover:text-[#004D77] transition-colors">+57 300 293 6722</a>
            </div>
            <div>
              <h4 className="social-title">Nuestras redes</h4>
              <div className="social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link bg-gradient-to-br from-purple-500 to-pink-500"><FaInstagram className="w-5 h-5 text-white" /></a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link bg-black"><FaTiktok className="w-5 h-5 text-white" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditReturn;