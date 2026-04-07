import { ChevronRight, Upload, Package, CreditCard, MapPin, Calendar, Clock, X, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';
import qr from '../../../assets/QR_Magic.jpg';
import { pedidos } from './Orders';

/* ── Estilos inyectados (coherentes con Home/Favorites) ── */
const ORDER_DETAIL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes detail-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }

  .order-detail-page {
    background: #f6f9fc;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
  }

  .order-detail-container {
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
  .breadcrumb a:hover {
    text-decoration: underline;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (min-width: 1024px) {
    .detail-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  /* Tarjetas */
  .info-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 77, 119, 0.05);
    transition: box-shadow 0.2s;
  }
  .info-card:hover {
    box-shadow: 0 8px 24px rgba(0, 77, 119, 0.08);
  }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 40px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eef2f6;
    font-size: 0.9rem;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-weight: 700;
    color: #1e4060;
  }
  .info-value {
    color: #334155;
  }

  /* Sección de pago */
  .payment-section {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 24px;
    padding: 24px;
    margin-top: 24px;
  }
  .amount-large {
    font-size: 2.5rem;
    font-weight: 900;
    color: #e53e3e;
    text-align: center;
    margin: 16px 0;
  }
  .qr-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin: 20px 0;
  }
  .qr-box {
    text-align: center;
  }
  .qr-image {
    width: 160px;
    height: 160px;
    border-radius: 20px;
    object-fit: cover;
    margin: 0 auto 12px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .qr-image:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
  .zoom-hint {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: #9abcce;
    cursor: pointer;
    margin-top: 4px;
  }

  /* Modal del QR */
  .qr-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: modalFadeIn 0.2s ease;
  }
  .qr-modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    background: #ffffff;
    border-radius: 28px;
    padding: 20px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  }
  .qr-modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 10;
  }
  .qr-modal-close:hover {
    background: #e2e8f0;
    transform: scale(1.05);
  }
  .qr-modal-image {
    max-width: 80vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 20px;
  }

  /* Área de subida corregida */
  .upload-area {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .upload-area:hover {
    border-color: #004D77;
    background: #f0f8ff;
  }

  .btn-primary-full {
    width: 100%;
    background: #004D77;
    border: none;
    border-radius: 40px;
    padding: 12px;
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

  /* Lista de productos */
  .product-list {
    margin-top: 16px;
  }
  .product-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #eef2f6;
    border-radius: 16px;
    margin-bottom: 8px;
    transition: all 0.2s;
    cursor: pointer;
  }
  .product-item:hover {
    background: #fafcff;
    border-color: #afd0e6;
    transform: translateX(4px);
  }
  .product-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .product-details {
    flex: 1;
  }
  .product-name {
    font-weight: 800;
    font-size: 0.9rem;
    color: #0c2a3a;
  }
  .product-meta {
    font-size: 0.7rem;
    color: #9abcce;
  }
  .product-price {
    font-weight: 900;
    color: #004D77;
  }

  /* Resumen de venta */
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 0.9rem;
  }
  .total-row {
    border-top: 1px solid #e2edf5;
    margin-top: 8px;
    padding-top: 12px;
    font-weight: 900;
    font-size: 1.1rem;
  }

  /* Margen para separar secciones */
  .mt-6 {
    margin-top: 24px;
  }

  @media (max-width: 768px) {
    .qr-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .qr-image {
      width: 120px;
      height: 120px;
    }
  }
`;

let orderDetailStylesInjected = false;
function injectOrderDetailStyles() {
  if (orderDetailStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = ORDER_DETAIL_STYLES;
  document.head.appendChild(style);
  orderDetailStylesInjected = true;
}

function OrderDetail() {
  injectOrderDetailStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const [archivoComprobante, setArchivoComprobante] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const pedido = pedidos.find((p) => p.id === id);

  if (!pedido) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container text-center py-20">
          <p className="text-xl font-semibold text-gray-700 mb-4">Pedido no encontrado</p>
          <button
            onClick={() => navigate('/orders-l')}
            className="btn-primary-full"
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  const subtotal = pedido.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
  const total = subtotal;
  const abonado = pedido.abonado;
  const faltante = total - abonado;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Solo se permiten archivos PNG, JPG o JPEG.');
      return;
    }
    setArchivoComprobante(file);
  };

  const handleEnviarComprobante = () => {
    if (!archivoComprobante) {
      alert('Por favor selecciona un comprobante para enviar.');
      return;
    }
    console.log('Enviando comprobante:', archivoComprobante);
    alert('Comprobante enviado exitosamente!');
    setArchivoComprobante(null);
  };

  return (
    <div className="order-detail-page">
      <ShopHero
        image={BgPedidos}
        title="Pedidos"
        tag="Detalle"
        subtitle={`Pedido N.° ${pedido.id}`}
      />

      <div className="order-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/orders-l">Pedidos</a>
          <ChevronRight size={14} />
          <span>Detalles del pedido</span>
        </div>

        <div className="detail-grid">
          {/* Columna izquierda */}
          <div>
            {/* Información del pedido */}
            <div className="info-card">
              <div className="card-title">
                <Package size={20} color="#004D77" />
                Información del pedido
              </div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-900">{pedido.titulo}</h4>
                <span className={`status-badge ${pedido.estadoColor}`}>
                  {pedido.estado}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Venta realizada</span>
                <span className="info-value">{pedido.fecha_corta}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Entrega</span>
                <span className="info-value">{pedido.direccion}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Pedido número</span>
                <span className="info-value">{pedido.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Método de pago</span>
                <span className="info-value">{pedido.infoPago}</span>
              </div>
            </div>

            {/* Sección de pago (si hay faltante) */}
            {faltante > 0 && (
              <div className="payment-section">
                <div className="card-title">
                  <CreditCard size={20} color="#004D77" />
                  Abonar - Pagar
                </div>
                <div className="amount-large">
                  $ {faltante.toLocaleString()} COP
                </div>

                <div className="qr-grid">
                  <div className="qr-box">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Escanea el código QR para pagar
                    </p>
                    <img
                      src={qr}
                      alt="Código QR para pago"
                      className="qr-image"
                      onClick={() => setQrModalOpen(true)}
                    />
                    <div className="zoom-hint" onClick={() => setQrModalOpen(true)}>
                      <ZoomIn size={14} /> Haz clic para ampliar
                    </div>
                    {pedido.metodoPagoDetalle.llave && (
                      <p className="text-xs text-gray-500 mt-2">
                        Llave: {pedido.metodoPagoDetalle.llave}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Comprobante de transferencia
                    </p>
                    <label className="upload-area">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Upload size={28} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {archivoComprobante ? archivoComprobante.name : 'Haz clic para subir el comprobante'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG o JPEG (máx. 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                <button className="btn-primary-full" onClick={handleEnviarComprobante}>
                  Enviar comprobante
                </button>
              </div>
            )}

            {/* Ayuda - con margen superior para separar */}
            <div className="info-card mt-6">
              <div className="card-title">Ayuda con el pedido</div>
              <button
                onClick={() => navigate(`/registerReturn/${pedido.id}`)}
                className="text-[#004D77] font-semibold text-sm hover:underline"
              >
                Tengo un problema con el pedido
              </button>
            </div>
          </div>

          {/* Columna derecha - sidebar con productos clickeables */}
          <div>
            <div className="info-card sticky top-24">
              <div className="card-title">
                <Package size={20} color="#004D77" />
                {pedido.productos.length} productos en tu pedido
              </div>

              <div className="product-list">
                {pedido.productos.map((producto) => {
                  const linea = producto.precioUnidad * producto.cantidad;
                  return (
                    <div
                      key={producto.id}
                      className="product-item"
                      onClick={() => navigate('/shop/detail')}
                    >
                      <div className="product-icon">
                        <span className="text-xl">📦</span>
                      </div>
                      <div className="product-details">
                        <div className="product-name">{producto.nombre}</div>
                        <div className="product-meta">
                          {producto.cantidad} und. × $ {producto.precioUnidad.toLocaleString()}
                        </div>
                      </div>
                      <div className="product-price">$ {linea.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-bold text-gray-900 mb-3">Detalle de la venta</h3>
                <p className="text-xs text-gray-500 mb-4">
                  {pedido.fecha_corta} | {pedido.numeroOrden}
                </p>

                {pedido.productos.map((producto) => (
                  <div key={producto.id} className="summary-row">
                    <span className="truncate pr-2">{producto.nombre}</span>
                    <span className="font-medium whitespace-nowrap">
                      $ {(producto.precioUnidad * producto.cantidad).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="summary-row border-t pt-2 mt-2">
                  <span>Subtotal</span>
                  <span className="font-medium">$ {subtotal.toLocaleString()}</span>
                </div>

                <div className="summary-row total-row">
                  <span>Total</span>
                  <span className="text-[#004D77]">$ {total.toLocaleString()}</span>
                </div>

                <div className="summary-row">
                  <span className="font-medium text-green-700">Abonado</span>
                  <span className="font-bold text-green-600">$ {abonado.toLocaleString()}</span>
                </div>

                <div className="summary-row">
                  <span className="font-medium text-red-700">Faltante</span>
                  <span className="font-bold text-red-600">$ {faltante.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ampliar el QR */}
      {qrModalOpen && (
        <div className="qr-modal-overlay" onClick={() => setQrModalOpen(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={() => setQrModalOpen(false)}>
              <X size={20} />
            </button>
            <img src={qr} alt="QR ampliado" className="qr-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;