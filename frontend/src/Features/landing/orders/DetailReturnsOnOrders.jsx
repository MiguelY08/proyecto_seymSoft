import { ChevronLeft, Package, Building2, Truck, RotateCcw, CheckCircle, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { devoluciones } from './Returns_On_Orders';

/* ── Estilos inyectados (coherentes con Home/Favorites) ── */
const DETAIL_RETURN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes returnDetail-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .return-detail-page {
    background: #f6f9fc;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
  }

  .return-detail-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
  }

  /* Botón volver */
  .nav-header {
    margin-bottom: 24px;
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
  }
  .btn-back:hover {
    background: #f0f8ff;
    border-color: #afd0e6;
    transform: translateY(-1px);
  }

  /* Tarjeta principal */
  .detail-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 77, 119, 0.06);
    animation: returnDetail-fadeUp 0.4s ease;
  }
  .detail-header {
    padding: 16px 24px;
    background: #fefcf5;
    border-bottom: 1px solid #eef2f6;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .detail-title-section {
    flex: 1;
  }
  .detail-id {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9abcce;
    margin-bottom: 4px;
  }
  .detail-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }
  .detail-date {
    font-size: 0.7rem;
    color: #64748b;
    margin-top: 4px;
  }
  .detail-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .badge {
    padding: 4px 12px;
    border-radius: 40px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Cuerpo compacto */
  .detail-body {
    padding: 20px 24px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-bottom: 28px;
  }
  .info-panel {
    background: #f8fafc;
    border-radius: 20px;
    padding: 16px;
    border: 1px solid #eef2f6;
  }
  .panel-title {
    font-weight: 800;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9abcce;
    margin-bottom: 12px;
  }
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eef2f6;
    gap: 12px;
  }
  .product-item:last-child {
    border-bottom: none;
  }
  .product-info {
    flex: 1;
  }
  .product-name {
    font-weight: 800;
    font-size: 0.8rem;
    color: #0c2a3a;
  }
  .product-quantity {
    font-size: 0.65rem;
    color: #64748b;
  }
  .product-subtotal {
    font-weight: 900;
    font-size: 0.85rem;
    color: #004D77;
    white-space: nowrap;
  }
  .total-amount {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 2px solid #e2edf5;
    display: flex;
    justify-content: space-between;
    font-weight: 900;
    font-size: 0.95rem;
  }
  .detail-text {
    font-size: 0.8rem;
    color: #334155;
    margin-bottom: 6px;
  }
  .detail-text strong {
    color: #1e4060;
    font-weight: 800;
  }

  /* Timeline horizontal (restaurado) */
  .timeline-section {
    margin-top: 8px;
  }
  .timeline-title {
    font-weight: 800;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9abcce;
    margin-bottom: 24px;
  }
  .timeline-horizontal {
    position: relative;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .timeline-step {
    flex: 1;
    min-width: 100px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  .timeline-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .timeline-icon.completed {
    background: #c6f0d0;
    border: 2px solid #38a169;
  }
  .timeline-icon.active {
    background: #d4e8ff;
    border: 2px solid #004D77;
  }
  .timeline-icon.pending {
    background: #f1f5f9;
    border: 2px solid #e2edf5;
  }
  .timeline-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #334155;
    line-height: 1.3;
  }
  .timeline-step.completed .timeline-label {
    color: #38a169;
  }
  .timeline-step.active .timeline-label {
    color: #004D77;
  }
  .timeline-progress {
    position: absolute;
    top: 24px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e2edf5;
    z-index: 0;
  }
  .timeline-progress-bar {
    height: 100%;
    background: #004D77;
    transition: width 0.3s;
  }

  @media (max-width: 768px) {
    .detail-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .info-grid {
      grid-template-columns: 1fr;
    }
    .timeline-horizontal {
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }
    .timeline-step {
      display: flex;
      align-items: center;
      gap: 16px;
      text-align: left;
      width: 100%;
    }
    .timeline-icon {
      margin: 0;
    }
    .timeline-progress {
      display: none;
    }
  }
`;

let detailReturnStylesInjected = false;
function injectDetailReturnStyles() {
  if (detailReturnStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = DETAIL_RETURN_STYLES;
  document.head.appendChild(style);
  detailReturnStylesInjected = true;
}

const ICONOS_SEGUIMIENTO = [Package, Building2, Truck, RotateCcw, CheckCircle];

function DetailReturnsOnOrders() {
  injectDetailReturnStyles();
  const { id } = useParams();
  const navigate = useNavigate();

  const dev = devoluciones.find((d) => d.id === id);

  if (!dev) {
    return (
      <div className="return-detail-page">
        <div className="return-detail-container text-center py-20">
          <p className="text-xl font-semibold text-gray-700 mb-4">Devolución no encontrada</p>
          <button
            onClick={() => navigate('/returnsOnOrders')}
            className="btn-back"
            style={{ margin: '0 auto' }}
          >
            <ChevronLeft size={14} /> Volver
          </button>
        </div>
      </div>
    );
  }

  const totalMonto = dev.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
  const pasosCompletados = dev.seguimiento.filter(p => p.completado).length;
  const totalPasos = dev.seguimiento.length;
  const progreso = totalPasos > 1 ? ((pasosCompletados) / (totalPasos - 1)) * 100 : 0;

  return (
    <div className="return-detail-page">
      <div className="return-detail-container">
        <div className="nav-header">
          <button onClick={() => navigate('/returnsOnOrders')} className="btn-back">
            <ChevronLeft size={14} /> Volver
          </button>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-title-section">
              <div className="detail-id">Devolución No. {dev.id}</div>
              <h2 className="detail-title">{dev.titulo}</h2>
              <div className="detail-date">{dev.fecha}</div>
            </div>
            <div className="detail-badges">
              <span className={`badge ${dev.estadoColor}`}>{dev.estado}</span>
              <span className={`badge ${dev.procesoColor}`}>{dev.proceso}</span>
            </div>
          </div>

          <div className="detail-body">
            <div className="info-grid">
              {/* Productos devueltos */}
              <div className="info-panel">
                <div className="panel-title">Productos devueltos</div>
                {dev.productos.map((producto) => (
                  <div key={producto.id} className="product-item">
                    <div className="product-info">
                      <div className="product-name">{producto.nombre}</div>
                      <div className="product-quantity">{producto.cantidad} und. × $ {producto.precioUnidad.toLocaleString()}</div>
                    </div>
                    <div className="product-subtotal">
                      $ {(producto.precioUnidad * producto.cantidad).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="total-amount">
                  <span>Monto de devolución</span>
                  <span>$ {totalMonto.toLocaleString()}</span>
                </div>
              </div>

              {/* Detalle de la solicitud */}
              <div className="info-panel">
                <div className="panel-title">Detalle de la solicitud</div>
                <div className="detail-text"><strong>Motivo:</strong> {dev.motivoDevolucion}</div>
                <div className="detail-text"><strong>Resolución solicitada:</strong> {dev.resolucion}</div>
                <div className="detail-text"><strong>Fecha de solicitud:</strong> {dev.fecha}</div>
              </div>
            </div>

            {/* Timeline horizontal */}
            <div className="timeline-section">
              <div className="timeline-title">Seguimiento</div>
              <div className="timeline-horizontal">
                <div className="timeline-progress">
                  <div className="timeline-progress-bar" style={{ width: `${progreso}%` }} />
                </div>
                {dev.seguimiento.map((paso, i) => {
                  const Icono = ICONOS_SEGUIMIENTO[i];
                  let statusClass = 'pending';
                  if (paso.completado) statusClass = 'completed';
                  else if (paso.activo) statusClass = 'active';
                  return (
                    <div key={paso.id} className={`timeline-step ${statusClass}`}>
                      <div className={`timeline-icon ${statusClass}`}>
                        {paso.completado ? (
                          <Check size={20} className="text-green-600" />
                        ) : (
                          <Icono size={20} className={paso.activo ? 'text-[#004D77]' : 'text-gray-400'} />
                        )}
                      </div>
                      <div className="timeline-label">{paso.nombre}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailReturnsOnOrders;