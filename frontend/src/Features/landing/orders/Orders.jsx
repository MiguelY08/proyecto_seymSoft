import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Calendar, CreditCard } from 'lucide-react';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';
import cuaderno from '../../../assets/products/cuadernoprimaverax100h.png';

/* ── Estilos inyectados (versión compacta con imagen grande) ── */
const ORDERS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes orders-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .orders-page {
    background: #f6f9fc;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
  }

  .orders-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
  }

  /* Barra de filtros */
  .orders-filters-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
    background: #ffffff;
    padding: 12px 24px;
    border-radius: 20px;
    border: 1.5px solid #e2edf5;
    box-shadow: 0 2px 8px rgba(0, 77, 119, 0.05);
  }
  .orders-search {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    padding: 8px 16px;
    border-radius: 40px;
    border: 1px solid #e2edf5;
  }
  .orders-search input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.85rem;
    font-weight: 500;
    outline: none;
  }
  .orders-search input::placeholder {
    color: #9abcce;
  }
  .date-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .date-input {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    padding: 6px 12px;
    border-radius: 40px;
    border: 1px solid #e2edf5;
  }
  .date-input input {
    border: none;
    background: transparent;
    font-size: 0.8rem;
    padding: 4px 0;
    width: 130px;
    outline: none;
    font-family: 'Nunito', sans-serif;
  }
  .clear-dates {
    font-size: 0.7rem;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .clear-dates:hover {
    color: #004D77;
  }
  .orders-divider {
    width: 1px;
    height: 30px;
    background: #e2edf5;
  }
  .orders-count {
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 12px;
    border-radius: 40px;
  }
  .btn-outline-sm {
    background: transparent;
    border: 1.5px solid #004D77;
    border-radius: 40px;
    padding: 6px 16px;
    font-weight: 800;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #004D77;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline-sm:hover {
    background: #f0f8ff;
    transform: translateY(-1px);
  }

  /* Tarjeta de pedido */
  .order-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 24px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.25s ease;
    animation: orders-fadeUp 0.4s ease both;
  }
  .order-card:hover {
    box-shadow: 0 12px 28px rgba(0, 77, 119, 0.1);
    transform: translateY(-2px);
    border-color: #afd0e6;
  }
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #fefcf5;
    border-bottom: 1px solid #eef2f6;
  }
  .order-date {
    font-weight: 800;
    font-size: 0.8rem;
    color: #1e4060;
  }
  .order-id {
    font-size: 0.7rem;
    font-weight: 700;
    color: #9abcce;
    letter-spacing: 0.05em;
  }

  /* Grid principal */
  .order-body-grid {
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    gap: 24px;
    padding: 20px;
    align-items: start;
  }

  /* Columna izquierda: imagen grande */
  .order-image-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .order-image {
    width: 140px;
    height: 140px;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .order-image img {
    width: 80%;
    height: auto;
    object-fit: contain;
  }
  .order-title-small {
    font-weight: 800;
    font-size: 0.85rem;
    color: #0c2a3a;
    text-align: center;
    margin: 0;
  }
  .order-status {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 40px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Columna central: detalles */
  .order-details-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .detail-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 0.85rem;
    color: #475569;
  }
  .detail-row strong {
    color: #1e4060;
    font-weight: 700;
    min-width: 85px;
  }
  .product-count {
    font-weight: 800;
    color: #004D77;
  }

  /* Columna derecha: cards y acciones */
  .order-right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .payment-status-card {
    background: #f8fafc;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #eef2f6;
  }
  .payment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #1e4060;
    margin-bottom: 8px;
  }
  .payment-amount {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 4px;
  }
  .total-amount {
    font-weight: 900;
    color: #004D77;
  }
  .pending-amount {
    font-weight: 900;
    color: #e53e3e;
  }
  .devolution-card {
    background: #fff3e6;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #fde68a;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .devolution-text {
    font-size: 0.75rem;
    font-weight: 700;
    color: #e67e22;
  }
  .order-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .btn-primary-sm {
    background: #004D77;
    border: none;
    border-radius: 40px;
    padding: 8px 12px;
    font-weight: 800;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: center;
  }
  .btn-primary-sm:hover {
    background: #0c5c88;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    .order-body-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .order-image-col {
      flex-direction: row;
      gap: 16px;
    }
    .order-image {
      width: 100px;
      height: 100px;
    }
  }
  @media (max-width: 640px) {
    .order-image-col {
      flex-direction: column;
      align-items: center;
    }
  }
`;

let ordersStylesInjected = false;
function injectOrdersStyles() {
  if (ordersStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = ORDERS_STYLES;
  document.head.appendChild(style);
  ordersStylesInjected = true;
}

// ─── Datos (sin cambios) ───────────────────────────────────────────────
const P = {
  libreta:    { nombre: 'LIBRETA CON LAPICERO',     precioUnidad: 5000   },
  corrector:  { nombre: 'CORRECTOR CINTA',           precioUnidad: 4000   },
  cuaderno:   { nombre: 'CUADERNO PRIMAVERA X100H',  precioUnidad: 70000  },
  sharpie:    { nombre: 'SET SHARPIE X30',           precioUnidad: 120000 },
  sewingMachine: { nombre: 'SEWING MACHINE',         precioUnidad: 5000   },
  tijeras:    { nombre: 'TIJERAS PUNTA ROMA',        precioUnidad: 3000   },
  vinilo:     { nombre: 'VINILO PQ POWER COLOR ROJO',precioUnidad: 1500   },
  correctorEnc:  { nombre: 'CORRECTORCINTA',         precioUnidad: 7000   },
};

export const pedidos = [
  {
    id: '123456789',
    fecha: '7 de septiembre 2025',
    fecha_corta: '7 de septiembre',
    numeroOrden: '#123456789',
    estado: 'En proceso',
    estadoColor: 'bg-yellow-100 text-yellow-700',
    titulo: 'El pedido ha sido recibido',
    metodoEnvio: 'Entrega',
    cliente: 'El cliente lo recoge',
    direccion: 'El cliente lo recoge',
    infoPago: 'Crédito (Pendiente de pago)',
    tieneDevolucion: false,
    abonado: 50000,
    metodoPagoDetalle: { tipo: 'Transferencia', llave: '0900485426' },
    productos: [
      { id: 1, ...P.cuaderno,  cantidad: 10 },
      { id: 2, ...P.libreta,   cantidad: 5  },
      { id: 3, ...P.tijeras,   cantidad: 8  },
    ],
  },
  {
    id: '987654321',
    fecha: '25 de agosto 2025',
    fecha_corta: '25 de agosto',
    numeroOrden: '#987654321',
    estado: 'Entregado',
    estadoColor: 'bg-green-100 text-green-700',
    titulo: 'Pedido finalizado y entregado',
    metodoEnvio: 'Entrega',
    cliente: 'Cra 75 #21-50 (Belén San Bernardo)',
    direccion: 'Cra 75 #21-50 (Belén San Bernardo)',
    infoPago: 'Transferencia',
    tieneDevolucion: true,
    abonado: 132000,
    metodoPagoDetalle: { tipo: 'Transferencia', llave: '0900485426' },
    productos: [
      { id: 1, ...P.sharpie,   cantidad: 1 },
      { id: 2, ...P.corrector, cantidad: 3 },
    ],
  },
  {
    id: '456789123',
    fecha: '15 de agosto 2025',
    fecha_corta: '15 de agosto',
    numeroOrden: '#456789123',
    estado: 'En proceso',
    estadoColor: 'bg-yellow-100 text-yellow-700',
    titulo: 'El pedido ha sido recibido',
    metodoEnvio: 'Domicilio',
    cliente: 'Calle 50 #34-12 (Laureles)',
    direccion: 'Calle 50 #34-12 (Laureles)',
    infoPago: 'Efectivo (Pendiente de pago)',
    tieneDevolucion: false,
    abonado: 0,
    metodoPagoDetalle: { tipo: 'Efectivo', llave: '' },
    productos: [
      { id: 1, ...P.vinilo,        cantidad: 20 },
      { id: 2, ...P.sewingMachine, cantidad: 2  },
      { id: 3, ...P.correctorEnc,  cantidad: 5  },
      { id: 4, ...P.tijeras,       cantidad: 10 },
    ],
  },
  {
    id: '741852963',
    fecha: '2 de agosto 2025',
    fecha_corta: '2 de agosto',
    numeroOrden: '#741852963',
    estado: 'Cancelado',
    estadoColor: 'bg-red-100 text-red-700',
    titulo: 'El pedido fue cancelado',
    metodoEnvio: 'Entrega',
    cliente: 'El cliente lo recoge',
    direccion: 'El cliente lo recoge',
    infoPago: 'Tarjeta de débito',
    tieneDevolucion: false,
    abonado: 0,
    metodoPagoDetalle: { tipo: 'Tarjeta de débito', llave: '' },
    productos: [
      { id: 1, ...P.libreta,   cantidad: 30 },
      { id: 2, ...P.corrector, cantidad: 15 },
    ],
  },
];

function Orders() {
  injectOrdersStyles();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');

  const parseFechaPedido = (fechaStr) => {
    const meses = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const partes = fechaStr.split(' de ');
    if (partes.length !== 2) return null;
    const dia = parseInt(partes[0]);
    const mesStr = partes[1].toLowerCase();
    const mes = meses[mesStr];
    if (isNaN(dia) || mes === undefined) return null;
    return new Date(new Date().getFullYear(), mes, dia);
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (search && !pedido.id.includes(search) && !pedido.titulo.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (fechaInicial || fechaFinal) {
      const fechaPedido = parseFechaPedido(pedido.fecha_corta);
      if (fechaPedido) {
        if (fechaInicial && fechaPedido < new Date(fechaInicial)) return false;
        if (fechaFinal && fechaPedido > new Date(fechaFinal)) return false;
      }
    }
    return true;
  });

  const handleVerPedido = (id) => navigate(`/orders-l/${id}`);
  const handleVerDevoluciones = () => navigate('/returnsOnOrders');

  return (
    <div className="orders-page">
      <ShopHero
        image={BgPedidos}
        title="Pedidos"
        tag="Historial"
        subtitle="Revisa el estado de tus compras"
      />

      <div className="orders-container">
        {/* Barra de filtros */}
        <div className="orders-filters-bar">
          <div className="orders-search">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de pedido o producto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="date-filters">
            <div className="date-input">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={fechaInicial}
                onChange={(e) => setFechaInicial(e.target.value)}
              />
            </div>
            <span className="text-gray-400">—</span>
            <div className="date-input">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)}
              />
            </div>
            {(fechaInicial || fechaFinal) && (
              <button
                onClick={() => { setFechaInicial(''); setFechaFinal(''); }}
                className="clear-dates"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="orders-divider" />
          <span className="orders-count">{pedidosFiltrados.length} pedidos</span>
          <button onClick={handleVerDevoluciones} className="btn-outline-sm">
            Ver devoluciones
          </button>
        </div>

        {/* Lista de pedidos */}
        <div className="orders-list">
          {pedidosFiltrados.map((pedido, idx) => {
            const total = pedido.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
            const faltante = total - pedido.abonado;
            const pagadoCompleto = faltante <= 0 && pedido.estado !== 'Cancelado';

            return (
              <div key={pedido.id} className="order-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="order-header">
                  <span className="order-date">{pedido.fecha}</span>
                  <span className="order-id">Pedido No. {pedido.id}</span>
                </div>

                <div className="order-body-grid">
                  {/* Columna izquierda: imagen + título/estado */}
                  <div className="order-image-col">
                    <div className="order-image">
                      <img src={cuaderno} alt="producto" />
                    </div>
                    <div className="order-title-small">{pedido.titulo}</div>
                    <span className={`order-status ${pedido.estadoColor}`}>
                      {pedido.estado}
                    </span>
                  </div>

                  {/* Columna central: detalles */}
                  <div className="order-details-col">
                    <div className="detail-row">
                      <strong>Entrega:</strong> {pedido.cliente}
                    </div>
                    <div className="detail-row">
                      <strong>Pago:</strong> {pedido.infoPago}
                    </div>
                    <div className="detail-row">
                      <strong>Productos:</strong> <span className="product-count">{pedido.productos.length} unidades</span>
                    </div>
                  </div>

                  {/* Columna derecha: estado de pago + devolución activa + acción */}
                  <div className="order-right-col">
                    <div className="payment-status-card">
                      <div className="payment-header">
                        <CreditCard size={14} /> Estado de pago
                      </div>
                      <div className="payment-amount">
                        <span>Total:</span>
                        <span className="total-amount">${total.toLocaleString()}</span>
                      </div>
                      <div className="payment-amount">
                        <span>Abonado:</span>
                        <span>${pedido.abonado.toLocaleString()}</span>
                      </div>
                      {faltante > 0 ? (
                        <div className="payment-amount">
                          <span>Faltante:</span>
                          <span className="pending-amount">${faltante.toLocaleString()}</span>
                        </div>
                      ) : pagadoCompleto && (
                        <div className="payment-amount">
                          <span>Estado:</span>
                          <span className="text-green-600 font-bold">Pagado completo ✓</span>
                        </div>
                      )}
                    </div>

                    {pedido.tieneDevolucion && (
                      <div className="devolution-card">
                        <Package size={16} className="text-orange-500" />
                        <div className="devolution-text">
                          Este pedido tiene un proceso de devolución activo
                        </div>
                      </div>
                    )}

                    <div className="order-actions">
                      <button
                        onClick={() => handleVerPedido(pedido.id)}
                        className="btn-primary-sm"
                      >
                        Ver pedido
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Orders;