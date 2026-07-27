import { ShoppingCart, Info, Heart, HeartCrack, ChevronDown, ArrowRight, ImageOff } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BgFavoritos from '../../../assets/BgFavoritos.png';
import { useAuth } from '../../access/context/AuthContext';
import { useFavorites } from '../../shared/Context/Favoritescontext';
import { useCart } from '../../shared/Context/CartContext';
import { useAlert } from '../../shared/alerts/useAlert';
import useClientType from '../../shared/hooks/useClientType';
import { getDisplayPricing } from '../../shared/utils/shopPricingHelper';

/* ── Estilos ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes fav-fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fav-heartPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.45); }
    70%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  @keyframes fav-emptyFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }

  /* ── Page ── */
  .fav-page {
    min-height: 100vh;
    background: #f6f9fc;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
  }

  /* ── Banner ── */
  .fav-banner-wrap {
    width: calc(100% - var(--store-content-x) - var(--store-content-x));
    max-width: var(--store-content-inner-max);
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    height: clamp(112px, 34vw, 150px);
  }
  @media (min-width: 640px) {
    .fav-banner-wrap {
      margin: 12px auto 0;
      border-radius: 20px;
      height: clamp(170px, 24vw, 240px);
    }
  }
  @media (min-width: 1024px) {
    .fav-banner-wrap {
      height: clamp(220px, 22vw, 300px);
    }
  }
  .fav-banner-bg {
    position: absolute; inset: 0;
    background-size: cover; background-position: center 46%;
  }
  .fav-banner-overlay {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg, rgba(0,28,48,0.72) 0%, rgba(0,54,86,0.82) 100%),
      linear-gradient(135deg, rgba(0,40,70,0.86) 0%, rgba(0,77,119,0.66) 100%);
  }
  .fav-banner-content {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 5px; text-align: center;
    padding: 18px 16px;
  }
  .fav-banner-tag {
    font-size: clamp(0.55rem, 2.5vw, 0.62rem); font-weight: 800;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .fav-banner-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.85rem, 9vw, 3rem);
    font-weight: 700; color: #ffffff;
    line-height: 1.1; margin: 0;
  }

  @media (min-width: 640px) {
    .fav-banner-content {
      gap: 8px;
      padding: 24px;
    }
    .fav-banner-tag {
      letter-spacing: 0.22em;
    }
    .fav-banner-title {
      font-size: clamp(3rem, 7vw, 5rem);
    }
  }

  /* ── Main content ── */
  .fav-main {
    max-width: var(--store-content-max);
    margin: 0 auto;
    padding: clamp(24px, 5vw, 52px) var(--store-content-x) clamp(40px, 6vw, 80px);
  }

  /* ── Section header ── */
  .fav-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 18px;
    margin-bottom: 22px;
  }
  .fav-header > div:first-child {
    min-width: 0;
  }
  .fav-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.6rem; font-weight: 800;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: #004D77; margin-bottom: 6px;
  }
  .fav-eyebrow::before {
    content: ''; display: block;
    width: 22px; height: 2px;
    background: #004D77; border-radius: 2px;
  }
  .fav-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.42rem, 7vw, 2.1rem);
    font-weight: 700; color: #0c2a3a;
    line-height: 1.2; margin: 0;
  }
  .fav-count {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px;
    background: rgba(0,77,119,0.08);
    border: 1px solid rgba(0,77,119,0.14);
    border-radius: 100px;
    font-size: 0.7rem; font-weight: 800;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: #004D77; margin-top: 8px;
  }

  /* ── Sort control ── */
  .fav-sort-wrap {
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 7px;
    width: 100%;
  }
  .fav-sort-label {
    font-size: 0.72rem; font-weight: 800;
    color: #64748b; white-space: nowrap;
  }
  .fav-sort-select-wrap {
    position: relative;
    width: 100%;
  }
  .fav-sort-select {
    appearance: none;
    width: 100%;
    min-height: 42px;
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 12px;
    padding: 0 38px 0 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem; font-weight: 800;
    color: #1e4060;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .fav-sort-select:hover  { border-color: #afd0e6; }
  .fav-sort-select:focus  { border-color: #004D77; box-shadow: 0 0 0 3px rgba(0,77,119,0.10); }
  .fav-sort-chevron {
    position: absolute; right: 11px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none; color: #9abcce;
  }

  @media (min-width: 640px) {
    .fav-header {
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 30px;
    }
    .fav-eyebrow {
      font-size: 0.65rem;
      letter-spacing: 0.16em;
    }
    .fav-sort-wrap {
      width: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .fav-sort-select-wrap {
      width: auto;
    }
    .fav-sort-select {
      width: auto;
      min-height: 38px;
      border-radius: 10px;
      padding: 0 36px 0 14px;
    }
    .fav-section-divider {
      margin-bottom: 32px;
    }
  }

  /* ── Product card ── */
  .fav-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    display: grid;
    grid-template-columns: minmax(92px, 30vw) minmax(0, 1fr);
    min-height: 142px;
    box-shadow: 0 2px 10px rgba(0,77,119,0.07);
    transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
    animation: fav-fadeUp 0.45s ease both;
  }
  .fav-card:hover {
    box-shadow: 0 10px 32px rgba(0,77,119,0.13);
    transform: translateY(-3px);
    border-color: #afd0e6;
  }
  .fav-card:active { transform: scale(0.992); }

  /* Stagger delays */
  .fav-card:nth-child(1) { animation-delay: 0.04s; }
  .fav-card:nth-child(2) { animation-delay: 0.09s; }
  .fav-card:nth-child(3) { animation-delay: 0.14s; }
  .fav-card:nth-child(4) { animation-delay: 0.19s; }
  .fav-card:nth-child(5) { animation-delay: 0.24s; }
  .fav-card:nth-child(6) { animation-delay: 0.29s; }

  /* Imagen */
  .fav-img-zone {
    width: 100%;
    min-width: 0;
    background: linear-gradient(150deg, #eef6fb 0%, #e0eef7 100%);
    position: relative;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .fav-img-zone img {
    width: 72%; height: 72%;
    object-fit: contain;
    transition: transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative; z-index: 1;
  }
  .fav-card:hover .fav-img-zone img { transform: scale(1.08); }
  .fav-img-fallback {
    width: 58%;
    aspect-ratio: 1;
    border-radius: 16px;
    background: rgba(255,255,255,0.62);
    border: 1px dashed rgba(0,77,119,0.22);
    color: #7ea8bf;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }
  .fav-chip {
    display: none;
    position: absolute; bottom: 10px; left: 10px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(0,77,119,0.12);
    border-radius: 20px;
    padding: 3px 9px;
    font-size: 0.58rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #004D77; z-index: 2;
  }

  /* Info */
  .fav-info {
    padding: 14px 44px 14px 14px;
    display: flex; flex-direction: column;
    justify-content: center; gap: 10px;
    min-width: 0;
  }
  .fav-prod-name {
    margin: 0;
    padding-right: 2px;
    font-size: clamp(0.86rem, 3.9vw, 0.98rem);
    font-weight: 800; color: #0c2a3a;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  .fav-mobile-category {
    display: inline-flex;
    align-self: flex-start;
    max-width: 100%;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(0,77,119,0.08);
    border: 1px solid rgba(0,77,119,0.12);
    font-size: 0.56rem;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #004D77;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fav-price-row {
    display: flex; align-items: baseline; gap: 5px;
    flex-wrap: wrap;
    row-gap: 0;
  }
  .fav-price {
    font-size: clamp(1.08rem, 5vw, 1.3rem);
    font-weight: 900; color: #004D77;
    letter-spacing: 0;
    line-height: 1.05;
  }
  .fav-currency {
    font-size: 0.58rem; font-weight: 700;
    color: #9abcce; text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .fav-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 38px;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .fav-btn-cart {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%;
    min-width: 0;
    height: 38px;
    padding: 0 12px;
    background: #004D77; color: #ffffff;
    border: 2px solid #004D77;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.72rem; font-weight: 800;
    letter-spacing: 0.02em; cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fav-btn-cart:hover  { background: transparent; color: #004D77; }
  .fav-btn-cart:active { transform: scale(0.96); }

  .fav-btn-detail {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    border: 2px solid #e2edf5;
    border-radius: 10px;
    background: transparent; color: #004D77;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .fav-btn-detail:hover  { border-color: #afd0e6; background: #f0f8ff; }
  .fav-btn-detail:active { transform: scale(0.94); }

  /* Separador vertical */
  .fav-divider-v {
    display: none;
    width: 1px;
    background: linear-gradient(to bottom, transparent, #e2edf5, transparent);
    flex-shrink: 0; align-self: stretch; margin: 16px 0;
  }

  /* Botón favorito lateral */
  .fav-side {
    position: absolute;
    top: 10px;
    right: 10px;
    width: auto;
    display: flex; align-items: center; justify-content: center;
  }
  .fav-heart-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    border: 1.5px solid #e4eff6;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .fav-heart-btn:hover  { border-color: #afd0e6; background: #f0f8ff; transform: scale(1.1); }
  .fav-heart-btn:active { transform: scale(0.9); }
  .fav-heart-btn.active {
    background: #004D77; border-color: #004D77;
  }
  .fav-heart-icon.popping {
    animation: fav-heartPop 0.38s ease forwards;
  }

  @media (min-width: 420px) {
    .fav-card {
      grid-template-columns: minmax(112px, 32vw) minmax(0, 1fr);
      min-height: 152px;
    }
    .fav-info {
      padding: 16px 48px 16px 16px;
    }
  }

  @media (min-width: 640px) {
    .fav-card {
      grid-template-columns: minmax(132px, 24vw) minmax(0, 1fr);
      min-height: 168px;
      border-radius: 18px;
    }
    .fav-info {
      padding: 18px 56px 18px 20px;
    }
    .fav-side {
      top: 14px;
      right: 14px;
    }
    .fav-chip {
      display: inline-flex;
    }
    .fav-mobile-category {
      display: none;
    }
    .fav-prod-name {
      font-size: clamp(0.95rem, 1.5vw, 1.08rem);
    }
    .fav-price {
      font-size: clamp(1.22rem, 2vw, 1.45rem);
    }
    .fav-actions {
      display: flex;
      width: auto;
      flex-wrap: wrap;
    }
    .fav-btn-cart {
      width: auto;
      height: 40px;
      padding: 0 18px;
      font-size: 0.76rem;
    }
    .fav-btn-detail {
      width: 40px;
      height: 40px;
    }
    .fav-heart-btn {
      width: 40px;
      height: 40px;
    }
  }

  @media (min-width: 900px) {
    .fav-card {
      display: flex;
      align-items: stretch;
      min-height: 176px;
    }
    .fav-img-zone {
      flex-shrink: 0;
      width: clamp(136px, 12vw, 176px);
    }
    .fav-info {
      flex: 1;
      padding: clamp(16px, 2vw, 22px) clamp(16px, 2vw, 24px);
    }
    .fav-divider-v {
      display: block;
    }
    .fav-side {
      position: static;
      flex-shrink: 0;
      width: clamp(52px, 6vw, 64px);
    }
  }

  /* Grid de cards */
  .fav-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  @media (min-width: 640px) {
    .fav-grid { gap: 16px; }
  }
  @media (min-width: 900px) {
    .fav-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (min-width: 1200px) {
    .fav-grid { gap: 18px; }
  }

  /* ── Empty state ── */
  .fav-empty {
    text-align: center;
    width: min(100%, 520px);
    margin: 0 auto;
    padding: clamp(34px, 10vw, 64px) clamp(18px, 6vw, 36px);
    background: rgba(255,255,255,0.72);
    border: 1.5px solid #e4eff6;
    border-radius: 18px;
    box-shadow: 0 10px 28px rgba(0,77,119,0.07);
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
    animation: fav-fadeUp 0.5s ease;
  }
  .fav-empty-icon {
    width: clamp(64px, 18vw, 82px);
    height: clamp(64px, 18vw, 82px);
    border-radius: 50%;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border: 1.5px solid #e2edf5;
    display: flex; align-items: center; justify-content: center;
    animation: fav-emptyFloat 3s ease-in-out infinite;
  }
  .fav-empty-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.28rem, 7vw, 1.9rem);
    font-weight: 700; color: #0c2a3a; margin: 0;
    line-height: 1.15;
  }
  .fav-empty-sub {
    font-size: clamp(0.84rem, 3.8vw, 0.92rem); color: #64748b;
    max-width: 360px; line-height: 1.55; margin: 0;
  }
  .fav-btn-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%;
    max-width: 260px;
    min-height: 44px;
    padding: 0 20px;
    border: 2px solid #004D77; color: #004D77;
    font-family: 'Nunito', sans-serif;
    font-size: 0.76rem; font-weight: 800;
    letter-spacing: 0.04em; text-transform: uppercase;
    border-radius: 100px; text-decoration: none;
    background: transparent; cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    white-space: nowrap;
  }
  .fav-btn-outline:hover  { background: #004D77; color: #fff; transform: translateY(-1px); }
  .fav-btn-outline:active { transform: scale(0.97); }

  @media (min-width: 640px) {
    .fav-empty {
      gap: 20px;
      border-radius: 20px;
    }
    .fav-btn-outline {
      width: auto;
      min-height: 42px;
      padding: 0 24px;
      font-size: 0.78rem;
    }
  }

  /* ── Section divider ── */
  .fav-section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d1e5f0, transparent);
    margin-bottom: 22px;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ── Componente ── */
function Favorites() {
  injectStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showSuccess, showConfirm, showError } = useAlert();
  const { clientType } = useClientType();

  const [ordenar, setOrdenar] = useState('A - Z');
  const [hoveringHeart, setHoveringHeart] = useState(null);
  const [poppingHeart, setPoppingHeart]   = useState(null);
  const [failedImages, setFailedImages] = useState(() => new Set());

  const opcionesOrdenar = [
    'A - Z',
    'Z - A',
    'Precio: Menor a Mayor',
    'Precio: Mayor a Menor',
  ];

  const productosOrdenados = useMemo(() => {
    const lista = favorites.map(producto => {
      const pricing = getDisplayPricing(producto, clientType);
      return {
        ...producto,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        discountPct: pricing.discountPct,
        priceLabel: pricing.label,
        clientType: pricing.clientType,
      };
    });
    switch (ordenar) {
      case 'A - Z':                 return lista.sort((a, b) => a.name.localeCompare(b.name));
      case 'Z - A':                 return lista.sort((a, b) => b.name.localeCompare(a.name));
      case 'Precio: Menor a Mayor': return lista.sort((a, b) => a.price - b.price);
      case 'Precio: Mayor a Menor': return lista.sort((a, b) => b.price - a.price);
      default:                       return lista;
    }
  }, [clientType, ordenar, favorites]);

  const handleToggleFavorito = async (producto) => {
    const result = await showConfirm(
      'warning',
      '¿Quitar de favoritos?',
      `¿Estás seguro de eliminar "${producto.name}" de tu lista de deseos?`
    );
    if (result.isConfirmed) {
      toggleFavorite(producto);
      showSuccess('Eliminado', 'El producto fue eliminado de tu lista de deseos.');
    }
  };

  const handleAgregarAlCarrito = (producto) => {
    const stock = Number(producto.totalStock ?? producto.stock ?? 0);
    if (!producto.isActive || stock <= 0) {
      showError('Producto no disponible', 'Este producto no tiene stock disponible.');
      return;
    }

    if (!isAuthenticated) {
      showError(
        'Inicia sesión',
        'Debes iniciar sesión antes de agregar productos al carrito.'
      );
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
      return;
    }

    addToCart(producto, 1);
    showSuccess('Añadido al carrito', `${producto.name} se ha agregado al carrito.`);
  };

  const handleHeartClick = (e, producto) => {
    e.stopPropagation();
    setPoppingHeart(producto.id);
    setTimeout(() => setPoppingHeart(null), 420);
    handleToggleFavorito(producto);
  };

  const handleImageError = (productId) => {
    setFailedImages((current) => new Set(current).add(productId));
  };

  return (
    <div className="fav-page">

      {/* ══ Banner ══ */}
      <div className="fav-banner-wrap">
        <div
          className="fav-banner-bg"
          style={{ backgroundImage: `url(${BgFavoritos})` }}
        />
        <div className="fav-banner-overlay" />
        <div className="fav-banner-content">
          <p className="fav-banner-tag">Tu selección</p>
          <h1 className="fav-banner-title">Lista de deseos</h1>
        </div>
      </div>

      {/* ══ Contenido principal ══ */}
      <main className="fav-main">

        {/* Header de sección */}
        <div className="fav-header">
          <div>
            <p className="fav-eyebrow">Guardados</p>
            <h2 className="fav-title">Mis favoritos</h2>
            {favorites.length > 0 && (
              <span className="fav-count">
                <Heart size={11} fill="#004D77" strokeWidth={0} />
                {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'}
              </span>
            )}
          </div>

          {favorites.length > 0 && (
            <div className="fav-sort-wrap">
              <span className="fav-sort-label">Ordenar por</span>
              <div className="fav-sort-select-wrap">
                <select
                  className="fav-sort-select"
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value)}
                >
                  {opcionesOrdenar.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="fav-sort-chevron" />
              </div>
            </div>
          )}
        </div>

        <div className="fav-section-divider" />

        {/* ══ Empty state ══ */}
        {favorites.length === 0 && (
          <div className="fav-empty">
            <div className="fav-empty-icon">
              <Heart size={32} color="#004D77" strokeWidth={1.5} />
            </div>
            <h3 className="fav-empty-title">Aún no tienes favoritos</h3>
            <p className="fav-empty-sub">
              Explora nuestra tienda y guarda los productos que más te gusten para encontrarlos fácilmente después.
            </p>
            <Link to="/shop" className="fav-btn-outline">
              Explorar tienda <ArrowRight size={13} strokeWidth={3} />
            </Link>
          </div>
        )}

        {/* ══ Grid de productos ══ */}
        {favorites.length > 0 && (
          <div className="fav-grid">
            {productosOrdenados.map((producto) => {
              const esFavorito = isFavorite(producto.id);
              const isHovering = hoveringHeart === producto.id;
              const isPopping  = poppingHeart  === producto.id;
              const categoryName = producto.category || producto.mainCategory?.name || producto.categories?.[0]?.name || 'Sin categoría';
              const productImage = producto.image || producto.mainImage?.url || producto.images?.[0]?.url;
              const showImageFallback = !productImage || failedImages.has(producto.id);

              return (
                <div key={producto.id} className="fav-card">

                  {/* Zona imagen */}
                  <div className="fav-img-zone">
                    {showImageFallback ? (
                      <div className="fav-img-fallback" aria-hidden="true">
                        <ImageOff size={24} strokeWidth={1.8} />
                      </div>
                    ) : (
                      <img
                        src={productImage}
                        alt={producto.name}
                        onError={() => handleImageError(producto.id)}
                      />
                    )}
                    <span className="fav-chip">
                      {categoryName}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="fav-info">
                    <span className="fav-mobile-category">{categoryName}</span>
                    <h3 className="fav-prod-name">{producto.name}</h3>

                    <div className="fav-price-row">
                      <span className="fav-price">
                        ${producto.price.toLocaleString('es-CO')}
                      </span>
                      <span className="fav-currency">COP</span>
                    </div>

                    <div className="fav-actions">
                      <button
                        className="fav-btn-cart"
                        onClick={() => handleAgregarAlCarrito(producto)}
                      >
                        <ShoppingCart size={14} strokeWidth={2.5} />
                        Añadir al carrito
                      </button>

                      <button
                        className="fav-btn-detail"
                        onClick={() => navigate(`/shop/detail/${producto.id}`)}
                        title="Ver detalle"
                      >
                        <Info size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="fav-divider-v" />

                  {/* Botón heart lateral */}
                  <div className="fav-side">
                    <button
                      className={`fav-heart-btn${esFavorito ? ' active' : ''}`}
                      onClick={(e) => handleHeartClick(e, producto)}
                      onMouseEnter={() => setHoveringHeart(producto.id)}
                      onMouseLeave={() => setHoveringHeart(null)}
                      title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      {esFavorito ? (
                        isHovering
                          ? <HeartCrack
                              size={16} color="#ffffff" strokeWidth={2.5}
                              className={`fav-heart-icon${isPopping ? ' popping' : ''}`}
                            />
                          : <Heart
                              size={16} color="#ffffff" fill="#ffffff" strokeWidth={2.5}
                              className={`fav-heart-icon${isPopping ? ' popping' : ''}`}
                            />
                      ) : (
                        <Heart
                          size={16} color="#004D77" fill="transparent" strokeWidth={2.5}
                          className={`fav-heart-icon${isPopping ? ' popping' : ''}`}
                        />
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

export default Favorites;

