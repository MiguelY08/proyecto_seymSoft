import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Package, ChevronLeft, Calendar } from 'lucide-react';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';

// ─── Devoluciones base (sin IDs transformados) ─────────────────────────────
const devolucionesBase = [
  {
    pedidoId: '987654321',
    fecha: '28 de agosto 2025',
    titulo: 'Devolución generada el 28 de agosto',
    estado: 'Aprobada',
    estadoColor: 'bg-green-100 text-green-700',
    proceso: 'En proceso 0/1',
    procesoColor: 'bg-yellow-100 text-yellow-700',
    motivoDevolucion: 'Producto en mal estado',
    resolucion: 'Reemplazo',
    productos: [
      { id: 1, nombre: 'SET SHARPIE X30', cantidad: 1, precioUnidad: 120000 },
    ],
    seguimiento: [
      { id: 1, nombre: 'Enviar producto a la dirección', completado: false, activo: true },
      { id: 2, nombre: 'Recepción del producto', completado: false, activo: false },
      { id: 3, nombre: 'Producto identificado', completado: false, activo: false },
      { id: 4, nombre: 'Reembolso / Reemplazo', completado: false, activo: false },
      { id: 5, nombre: 'Devolución procesada', completado: false, activo: false },
    ],
  },
  {
    pedidoId: '123456789',
    fecha: '10 de septiembre 2025',
    titulo: 'Devolución generada el 10 de septiembre',
    estado: 'Aprobada',
    estadoColor: 'bg-green-100 text-green-700',
    proceso: 'Completada 2/2',
    procesoColor: 'bg-blue-100 text-blue-700',
    motivoDevolucion: 'Cantidad incorrecta recibida',
    resolucion: 'Reembolso parcial',
    productos: [
      { id: 1, nombre: 'TIJERAS PUNTA ROMA', cantidad: 5, precioUnidad: 3000 },
      { id: 2, nombre: 'LIBRETA CON LAPICERO', cantidad: 2, precioUnidad: 5000 },
    ],
    seguimiento: [
      { id: 1, nombre: 'Enviar producto a la dirección', completado: true, activo: false },
      { id: 2, nombre: 'Recepción del producto', completado: true, activo: false },
      { id: 3, nombre: 'Producto identificado', completado: false, activo: true },
      { id: 4, nombre: 'Reembolso / Reemplazo', completado: false, activo: false },
      { id: 5, nombre: 'Devolución procesada', completado: false, activo: false },
    ],
  },
];

// Transformar devoluciones: generar ID único por pedido (pedidoId-1, pedidoId-2...)
const devoluciones = (() => {
  const conteoPorPedido = {};
  return devolucionesBase.map((dev, index) => {
    const pedidoId = dev.pedidoId;
    if (!conteoPorPedido[pedidoId]) conteoPorPedido[pedidoId] = 0;
    conteoPorPedido[pedidoId] += 1;
    const secuencia = conteoPorPedido[pedidoId];
    return {
      ...dev,
      id: `${pedidoId}-${secuencia}`,
    };
  });
})();

// Exportar para otros componentes
export { devoluciones };

/* ── Estilos inyectados (coherentes con Orders) ── */
const RETURNS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes returns-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .returns-page {
    background: #f6f9fc;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
  }

  .returns-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
  }

  /* Barra de filtros - mejor alineada */
  .returns-filters-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
    background: #ffffff;
    padding: 8px 20px;
    border-radius: 20px;
    border: 1.5px solid #e2edf5;
    box-shadow: 0 2px 8px rgba(0, 77, 119, 0.05);
  }
  .btn-back {
    background: transparent;
    border: 1.5px solid #e2edf5;
    border-radius: 40px;
    padding: 6px 14px;
    font-weight: 700;
    font-size: 0.75rem;
    color: #1e4060;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .btn-back:hover {
    background: #f0f8ff;
    border-color: #afd0e6;
    transform: translateY(-1px);
  }
  .returns-search {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    padding: 6px 14px;
    border-radius: 40px;
    border: 1px solid #e2edf5;
  }
  .returns-search input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.85rem;
    font-weight: 500;
    outline: none;
  }
  .returns-search input::placeholder {
    color: #9abcce;
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
    width: 120px;
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
  .returns-divider {
    width: 1px;
    height: 30px;
    background: #e2edf5;
  }
  .returns-count {
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 12px;
    border-radius: 40px;
    white-space: nowrap;
  }

  /* Tarjeta de devolución - diseño compacto */
  .return-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 24px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.25s ease;
    animation: returns-fadeUp 0.4s ease both;
  }
  .return-card:hover {
    box-shadow: 0 12px 28px rgba(0, 77, 119, 0.1);
    transform: translateY(-2px);
    border-color: #afd0e6;
  }
  .return-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #fefcf5;
    border-bottom: 1px solid #eef2f6;
  }
  .return-title {
    font-weight: 800;
    font-size: 0.85rem;
    color: #1e4060;
  }
  .return-id {
    font-size: 0.7rem;
    font-weight: 700;
    color: #9abcce;
    letter-spacing: 0.05em;
  }
  .return-body {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 20px;
    padding: 16px 20px;
    align-items: start;
  }
  .return-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .return-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .return-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .badge {
    padding: 2px 10px;
    border-radius: 40px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .return-detail-line {
    font-size: 0.75rem;
    color: #475569;
  }
  .return-detail-line strong {
    color: #1e4060;
    font-weight: 700;
    margin-right: 6px;
  }
  .return-products {
    margin-top: 4px;
    padding-left: 16px;
    list-style: disc;
    color: #334155;
    font-size: 0.7rem;
  }
  .return-amount {
    font-weight: 900;
    font-size: 1rem;
    color: #004D77;
    margin-top: 4px;
  }
  .return-actions {
    display: flex;
    align-items: center;
  }
  .btn-primary-sm {
    background: #004D77;
    border: none;
    border-radius: 40px;
    padding: 8px 16px;
    font-weight: 800;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-primary-sm:hover {
    background: #0c5c88;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .returns-filters-bar {
      flex-direction: column;
      align-items: stretch;
      border-radius: 20px;
    }
    .return-body {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .return-icon {
      width: 40px;
      height: 40px;
    }
    .return-actions {
      justify-content: flex-start;
    }
  }
`;

let returnsStylesInjected = false;
function injectReturnsStyles() {
  if (returnsStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = RETURNS_STYLES;
  document.head.appendChild(style);
  returnsStylesInjected = true;
}

function Return_On_Orders() {
  injectReturnsStyles();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');

  // Función para parsear fecha "d de mes año"
  const parseFechaDevolucion = (fechaStr) => {
    const meses = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const partes = fechaStr.split(' de ');
    if (partes.length !== 3) return null;
    const dia = parseInt(partes[0]);
    const mesStr = partes[1].toLowerCase();
    const anio = parseInt(partes[2]);
    const mes = meses[mesStr];
    if (isNaN(dia) || mes === undefined || isNaN(anio)) return null;
    return new Date(anio, mes, dia);
  };

  const devolucionesFiltradas = devoluciones.filter(dev => {
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitulo = dev.titulo.toLowerCase().includes(term);
      const matchId = dev.id.toLowerCase().includes(term);
      const matchPedidoId = dev.pedidoId.toLowerCase().includes(term);
      if (!matchTitulo && !matchId && !matchPedidoId) return false;
    }
    // Filtro por rango de fechas
    if (fechaInicial || fechaFinal) {
      const fechaDev = parseFechaDevolucion(dev.fecha);
      if (fechaDev) {
        if (fechaInicial && fechaDev < new Date(fechaInicial)) return false;
        if (fechaFinal && fechaDev > new Date(fechaFinal)) return false;
      }
    }
    return true;
  });

  return (
    <div className="returns-page">
      <ShopHero
        image={BgPedidos}
        title="Devoluciones"
        tag="Solicitudes"
        subtitle="Gestiona tus devoluciones y reemplazos"
      />

      <div className="returns-container">
        {/* Barra de filtros mejor alineada */}
        <div className="returns-filters-bar">
          <button onClick={() => navigate('/orders-l')} className="btn-back">
            <ChevronLeft size={14} /> Volver
          </button>

          <div className="returns-search">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de devolución o pedido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="date-input">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={fechaInicial}
              onChange={(e) => setFechaInicial(e.target.value)}
              placeholder="Fecha inicial"
            />
          </div>
          <span className="text-gray-400">—</span>
          <div className="date-input">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={fechaFinal}
              onChange={(e) => setFechaFinal(e.target.value)}
              placeholder="Fecha final"
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

          <div className="returns-divider" />
          <span className="returns-count">{devolucionesFiltradas.length} devoluciones</span>
        </div>

        {/* Lista de devoluciones */}
        <div className="returns-list">
          {devolucionesFiltradas.map((dev, idx) => {
            const totalMonto = dev.productos.reduce((s, p) => s + p.precioUnidad * p.cantidad, 0);
            return (
              <div key={dev.id} className="return-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="return-header">
                  <span className="return-title">{dev.titulo}</span>
                  <span className="return-id">Devolución No. {dev.id}</span>
                </div>

                <div className="return-body">
                  <div className="return-icon">
                    <Package size={24} className="text-gray-500" />
                  </div>

                  <div className="return-info">
                    <div className="return-badges">
                      <span className={`badge ${dev.estadoColor}`}>{dev.estado}</span>
                      <span className={`badge ${dev.procesoColor}`}>{dev.proceso}</span>
                    </div>

                    <div className="return-detail-line">
                      <strong>Motivo:</strong> {dev.motivoDevolucion}
                    </div>
                    <div className="return-detail-line">
                      <strong>Resolución:</strong> {dev.resolucion}
                    </div>
                    <div className="return-detail-line">
                      <strong>Productos devueltos:</strong>
                      <ul className="return-products">
                        {dev.productos.map((p, i) => (
                          <li key={i}>{p.nombre} — {p.cantidad} und.</li>
                        ))}
                      </ul>
                    </div>
                    <div className="return-amount">
                      Monto: $ {totalMonto.toLocaleString()} COP
                    </div>
                  </div>

                  <div className="return-actions">
                    <button
                      onClick={() => navigate(`/returns/${dev.id}`)}
                      className="btn-primary-sm"
                    >
                      Ver devolución
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {devolucionesFiltradas.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">No se encontraron devoluciones</h3>
              <p className="text-sm text-gray-500">Intenta con otros filtros de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Return_On_Orders;