import React, { useState } from "react";
import { ShoppingCart, Heart, HeartCrack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../shared/Context/Cartcontext";
import { useFavorites } from "../shared/Context/Favoritescontext";
import { useAlert } from "../shared/alerts/useAlert";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes pm-heartPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.4); }
    70%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }

  .pm-card {
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,77,119,0.08);
    border: 1.5px solid #e4eff6;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
  }
  .pm-card:hover {
    box-shadow: 0 12px 36px rgba(0,77,119,0.14);
    transform: translateY(-4px);
    border-color: #afd0e6;
  }
  .pm-card:active {
    transform: scale(0.984);
    box-shadow: 0 3px 12px rgba(0,77,119,0.1);
  }

  /* ── Imagen ── */
  .pm-img-wrap {
    position: relative;
    background: linear-gradient(150deg, #eef6fb 0%, #e0eef7 100%);
    aspect-ratio: 1 / 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pm-img-wrap img {
    width: 78%;
    height: 78%;
    object-fit: contain;
    transition: transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    z-index: 1;
  }
  .pm-card:hover .pm-img-wrap img {
    transform: scale(1.08);
  }

  /* Chip de categoría sobre imagen */
  .pm-chip {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(0,77,119,0.12);
    border-radius: 20px;
    padding: 3px 9px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #004D77;
    z-index: 2;
    pointer-events: none;
  }

  /* Botón favorito flotante sobre imagen */
  .pm-fav-float {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(0,77,119,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
    flex-shrink: 0;
  }
  .pm-fav-float:hover { transform: scale(1.12); }
  .pm-fav-float:active { transform: scale(0.9); }
  .pm-fav-float.is-fav {
    background: #004D77;
    border-color: #004D77;
  }
  .pm-heart-icon.popping {
    animation: pm-heartPop 0.38s ease forwards;
  }

  /* ── Cuerpo ── */
  .pm-body {
    padding: 12px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  .pm-name {
    font-size: 0.84rem;
    font-weight: 800;
    color: #0c2a3a;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.25em;
  }

  .pm-price-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .pm-price {
    font-size: 1.3rem;
    font-weight: 900;
    color: #004D77;
    letter-spacing: -0.03em;
  }
  .pm-price-label {
    font-size: 0.58rem;
    font-weight: 700;
    color: #9abcce;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* ── Botón carrito ── */
  .pm-btn-cart {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 12px;
    background: #004D77;
    color: #ffffff;
    border: 2px solid #004D77;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
    white-space: nowrap;
  }
  .pm-btn-cart:hover {
    background: transparent;
    color: #004D77;
  }
  .pm-btn-cart:active { transform: scale(0.96); }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

function ProductCard({ image, name, category, price, productData }) {
  injectStyles();

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showSuccess } = useAlert();

  const [heartPopping, setHeartPopping] = useState(false);
  const [isHoveringHeart, setIsHoveringHeart] = useState(false);

  const product = productData || { id: Math.random(), image, name, category, price };
  const favorited = isFavorite(product.id);

  const handleFavorite = (e) => {
    e.stopPropagation();
    const wasAdded = toggleFavorite(product);
    setHeartPopping(true);
    setTimeout(() => setHeartPopping(false), 420);
    showSuccess(
      wasAdded ? 'Agregado a favoritos' : 'Eliminado de favoritos',
      wasAdded
        ? `${product.name} se agregó a tu lista de deseos`
        : `${product.name} se eliminó de tu lista de deseos`
    );
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    showSuccess('Añadido al carrito', `${product.name} se ha agregado al carrito.`);
  };

  const goToDetail = () => navigate('/shop/detail');

  return (
    <div className="pm-card" onClick={goToDetail}>

      {/* ── Imagen ── */}
      <div className="pm-img-wrap">
        <img src={image} alt={name} />

        {/* Chip categoría */}
        <span className="pm-chip">{category}</span>

        {/* Favorito flotante */}
        <button
          className={`pm-fav-float${favorited ? ' is-fav' : ''}`}
          onClick={handleFavorite}
          onMouseEnter={() => setIsHoveringHeart(true)}
          onMouseLeave={() => setIsHoveringHeart(false)}
        >
          {favorited ? (
            isHoveringHeart
              ? <HeartCrack size={15} color="#ffffff" strokeWidth={2.5} className={`pm-heart-icon${heartPopping ? ' popping' : ''}`} />
              : <Heart size={15} color="#ffffff" fill="#ffffff" strokeWidth={2.5} className={`pm-heart-icon${heartPopping ? ' popping' : ''}`} />
          ) : (
            <Heart size={15} color="#004D77" fill="transparent" strokeWidth={2.5} className={`pm-heart-icon${heartPopping ? ' popping' : ''}`} />
          )}
        </button>
      </div>

      {/* ── Cuerpo ── */}
      <div className="pm-body">
        <h3 className="pm-name">{name}</h3>

        <div className="pm-price-row">
          <span className="pm-price">${price.toLocaleString('es-CO')}</span>
          <span className="pm-price-label">COP</span>
        </div>

        <button className="pm-btn-cart" onClick={handleAddToCart}>
          <ShoppingCart size={14} strokeWidth={2.5} />
          Añadir al carrito
        </button>
      </div>

    </div>
  );
}

export default ProductCard;