// ShopHero.jsx
import React from 'react';

/* ── Estilos (coherentes con el banner de Favorites) ── */
const SHOP_HERO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@800&display=swap');

  .shop-hero-wrap {
    width: 100%;
    position: relative;
    overflow: hidden;
    height: clamp(140px, 22vw, 300px);
  }
  @media (min-width: 640px) {
    .shop-hero-wrap {
      width: 98%;
      margin: 12px auto 0;
      border-radius: 20px;
    }
  }
  @media (min-width: 1024px) {
    .shop-hero-wrap {
      width: 95%;
    }
  }
  .shop-hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
  }
  .shop-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,40,70,0.92) 0%, rgba(0,77,119,0.78) 100%);
  }
  .shop-hero-content {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    padding: 24px;
  }
  .shop-hero-tag {
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .shop-hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 7vw, 5rem);
    font-weight: 700;
    color: #ffffff;
    line-height: 1.1;
    margin: 0;
  }
  .shop-hero-subtitle {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.7);
    max-width: 400px;
  }
`;

let heroStylesInjected = false;
function injectHeroStyles() {
  if (heroStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = SHOP_HERO_STYLES;
  document.head.appendChild(style);
  heroStylesInjected = true;
}

function ShopHero({ image, title, tag = "Explora", subtitle = "" }) {
  injectHeroStyles();
  return (
    <div className="shop-hero-wrap">
      <div className="shop-hero-bg" style={{ backgroundImage: `url(${image})` }} />
      <div className="shop-hero-overlay" />
      <div className="shop-hero-content">
        <p className="shop-hero-tag">{tag}</p>
        <h1 className="shop-hero-title">{title}</h1>
        {subtitle && <p className="shop-hero-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default ShopHero;