import { ChevronLeft, Package, Phone, MessageCircle, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { pedidos } from './Orders'; // Importar los pedidos reales

/* ── Estilos inyectados (coherentes con el sistema) ── */
const REGISTER_RETURN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes view-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .register-return-page {
    background: #f6f9fc;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
  }

  .register-return-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
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
    margin-bottom: 24px;
  }
  .btn-back:hover {
    background: #f0f8ff;
    border-color: #afd0e6;
    transform: translateY(-1px);
  }

  .view-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 28px;
  }
  @media (min-width: 1024px) {
    .view-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  /* Tarjeta principal */
  .info-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0, 77, 119, 0.05);
    animation: view-fadeUp 0.4s ease;
  }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 8px;
  }
  .card-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 24px;
  }

  /* Tabla de productos */
  .products-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 28px;
  }
  .products-table th {
    text-align: left;
    padding: 12px 8px;
    font-weight: 800;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9abcce;
    border-bottom: 1px solid #eef2f6;
  }
  .products-table td {
    padding: 12px 8px;
    font-size: 0.85rem;
    color: #334155;
    border-bottom: 1px solid #eef2f6;
  }
  .product-name-cell {
    font-weight: 800;
    color: #0c2a3a;
  }

  /* Mensaje informativo */
  .info-message {
    background: #e8f4fd;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-top: 20px;
  }
  .info-message-content {
    flex: 1;
  }
  .info-message-title {
    font-weight: 800;
    font-size: 0.9rem;
    color: #004D77;
    margin-bottom: 8px;
  }
  .info-message-text {
    font-size: 0.8rem;
    color: #1e4060;
    line-height: 1.5;
  }
  .contact-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #25D366;
    color: white;
    border: none;
    border-radius: 40px;
    padding: 10px 20px;
    font-weight: 800;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 12px;
    text-decoration: none;
  }
  .contact-button:hover {
    background: #128C7E;
    transform: translateY(-2px);
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
    .info-card {
      padding: 20px;
    }
    .products-table th, .products-table td {
      padding: 8px 4px;
    }
    .contact-card {
      position: static;
    }
  }
`;

let registerStylesInjected = false;
function injectRegisterStyles() {
  if (registerStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = REGISTER_RETURN_STYLES;
  document.head.appendChild(style);
  registerStylesInjected = true;
}

function RegisterReturnOnDetail() {
  injectRegisterStyles();
  const { id } = useParams();
  const navigate = useNavigate();

  // Buscar el pedido por ID
  const pedido = pedidos.find((p) => p.id === id);

  // Si no se encuentra el pedido, mostrar mensaje de error
  if (!pedido) {
    return (
      <div className="register-return-page">
        <div className="register-return-container text-center py-20">
          <p className="text-xl font-semibold text-gray-700 mb-4">Pedido no encontrado</p>
          <button
            onClick={() => navigate('/orders-l')}
            className="btn-back"
            style={{ margin: '0 auto' }}
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  const whatsappNumber = '+573212828628';
  const whatsappMessage = encodeURIComponent(`Hola, necesito ayuda con una devolución de mi pedido No. ${pedido.id}`);

  return (
    <div className="register-return-page">
      <div className="register-return-container">
        <button onClick={() => navigate('/orders-l')} className="btn-back">
          <ChevronLeft size={14} /> Volver
        </button>

        <div className="view-grid">
          {/* Columna izquierda - Información del pedido */}
          <div className="info-card">
            <h2 className="card-title">Productos del pedido</h2>
            <p className="card-subtitle">Revisa los artículos que solicitaste (Pedido No. {pedido.id})</p>

            <table className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {pedido.productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="product-name-cell">{producto.nombre}</td>
                    <td>{producto.cantidad} und.</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mensaje informativo sobre devoluciones */}
            <div className="info-message">
              <Info size={24} className="text-[#004D77] flex-shrink-0" />
              <div className="info-message-content">
                <div className="info-message-title">¿Necesitas realizar una devolución?</div>
                <div className="info-message-text">
                  Las devoluciones se gestionan directamente con un asesor de atención al cliente. 
                  Por favor, contáctanos por WhatsApp para recibir asistencia personalizada.
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button"
                >
                  <MessageCircle size={18} /> Contactar asesor
                </a>
              </div>
            </div>
          </div>

          {/* Columna derecha - Contacto (reforzado) */}
          <div className="contact-card">
            <h3 className="contact-title">Contacto para devoluciones</h3>
            <p className="contact-text">
              Nuestro equipo de atención al cliente está listo para ayudarte con cualquier 
              solicitud de devolución o cambio. Escríbenos y te guiaremos en el proceso.
            </p>

            <div className="whatsapp-link">
              <div className="whatsapp-icon">
                <Phone size={20} className="text-green-600" />
              </div>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-[#004D77] transition-colors"
              >
                (+57) 321 282 8628
              </a>
            </div>

            <div>
              <h4 className="social-title">Nuestras redes</h4>
              <div className="social-icons">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link bg-gradient-to-br from-purple-500 to-pink-500"
                >
                  <FaInstagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link bg-black"
                >
                  <FaTiktok className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterReturnOnDetail;