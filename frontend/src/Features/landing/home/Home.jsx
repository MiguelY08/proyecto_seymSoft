import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, Briefcase, ClipboardPen, FileText, Palette, ArrowRight } from 'lucide-react';

import { getActiveBanners } from '../../administrtivePanel/configuration/carousel/services/bannerService.js';
import ProductsService from '../../administrtivePanel/purchases/products/services/productsServices.js';
import categoriesService from '../../administrtivePanel/purchases/categories/services/categoriesService.js';
import ProductCard from '../../shared/productCard/ProductCard.jsx';
import useClientType from '../../shared/hooks/useClientType.js';

import mayoristaBg from '../../../assets/mayoristasBg.png';

/* ── Estilos globales de la página ── */
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Nunito:wght@400;600;700;800&display=swap');

  .home-page {
    background: #f6f9fc;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
  }

  /* ─ Section label ─ */
  .section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #004D77;
    margin-bottom: 8px;
  }
  .section-eyebrow::before {
    content: '';
    display: block;
    width: 22px;
    height: 2px;
    background: #004D77;
    border-radius: 2px;
  }

  /* ─ Section title ─ */
  .section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    color: #0c2a3a;
    line-height: 1.2;
    margin-bottom: 4px;
  }
  .section-subtitle {
    font-size: 0.88rem;
    color: #64748b;
    margin-top: 6px;
  }

  /* ─ "Ver más" button ─ */
  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 22px;
    border: 2px solid #004D77;
    color: #004D77;
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border-radius: 100px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s, transform 0.15s;
  }
  .btn-outline:hover {
    background: #004D77;
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-outline:active { transform: scale(0.97); }

  /* ─ Category cards ─ */
  .cat-card {
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px 12px;
    cursor: pointer;
    text-decoration: none;
    transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  }
  .cat-card:hover {
    box-shadow: 0 8px 28px rgba(0,77,119,0.13);
    transform: translateY(-3px);
    border-color: #afd0e6;
    background: #f0f8ff;
  }
  .cat-card:active { transform: scale(0.96); }
  .cat-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(140deg, #e8f4fd 0%, #d4ebf8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease;
  }
  .cat-card:hover .cat-icon-wrap {
    transform: scale(1.1) rotate(-4deg);
  }
  .cat-label {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1e4060;
    text-align: center;
    line-height: 1.3;
  }

  /* ─ Carousel ─ */
  .carousel-wrap {
    width: 100%;
    border-radius: 0;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  }
  @media (min-width: 640px) {
    .carousel-wrap { border-radius: 16px; width: 98%; margin: 0 auto; }
  }
  @media (min-width: 1024px) {
    .carousel-wrap { border-radius: 20px; width: 95%; }
  }

  /* ─ Staggered card reveal ─ */
  @keyframes pm-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .products-grid .pm-card {
    animation: pm-fadeUp 0.45s ease both;
  }
  .products-grid .pm-card:nth-child(1)  { animation-delay: 0.04s; }
  .products-grid .pm-card:nth-child(2)  { animation-delay: 0.09s; }
  .products-grid .pm-card:nth-child(3)  { animation-delay: 0.14s; }
  .products-grid .pm-card:nth-child(4)  { animation-delay: 0.19s; }
  .products-grid .pm-card:nth-child(5)  { animation-delay: 0.24s; }
  .products-grid .pm-card:nth-child(6)  { animation-delay: 0.29s; }
  .products-grid .pm-card:nth-child(7)  { animation-delay: 0.34s; }
  .products-grid .pm-card:nth-child(8)  { animation-delay: 0.39s; }

  /* ─ Loading skeleton ─ */
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ─ Mayoristas section ─ */
  .mayoristas-wrap {
    width: 100%;
    position: relative;
    overflow: hidden;
    min-height: 50vh;
  }
  @media (min-width: 640px) {
    .mayoristas-wrap { width: 98%; margin: 0 auto; border-radius: 16px; min-height: 58vh; }
  }
  @media (min-width: 1024px) {
    .mayoristas-wrap { width: 95%; border-radius: 20px; min-height: 72vh; }
  }
  .mayoristas-content {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    min-height: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    gap: 0;
  }
  .mayoristas-tag {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    margin-bottom: 16px;
  }
  .mayoristas-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.4rem, 7vw, 5.5rem);
    font-weight: 700;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .mayoristas-divider {
    width: 40px;
    height: 2px;
    background: rgba(255,255,255,0.45);
    border-radius: 2px;
    margin: 0 auto 20px;
  }
  .mayoristas-subtitle {
    font-size: clamp(0.88rem, 1.5vw, 1.05rem);
    color: rgba(255,255,255,0.78);
    max-width: 420px;
    line-height: 1.65;
    margin-bottom: 32px;
  }
  .btn-mayoristas {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 32px;
    border: 2px solid rgba(255,255,255,0.85);
    color: #ffffff;
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.25s, color 0.25s, transform 0.15s;
  }
  .btn-mayoristas:hover {
    background: #ffffff;
    color: #004D77;
    transform: translateY(-2px);
  }
  .btn-mayoristas:active { transform: scale(0.97); }

  /* ─ Divider ─ */
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d1e5f0, transparent);
    margin-top: 48px;
  }
`;

let homeStylesInjected = false;
function injectHomeStyles() {
  if (homeStylesInjected) return;
  const el = document.createElement('style');
  el.textContent = PAGE_STYLES;
  document.head.appendChild(el);
  homeStylesInjected = true;
}

function Home() {
  injectHomeStyles();

  // Estado para carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);

  // Estado para productos y categorías
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Hook para obtener clientType
  const { clientType, loading: loadingClientType } = useClientType();

  // Iconos para categorías (placeholder - se reemplazarán con dinámicos si es necesario)
  const categoryIcons = {
    1: ShoppingBag,
    2: Briefcase,
    3: ClipboardPen,
    4: FileText,
    5: Palette,
  };

  // ═══ CARGAR CARRUSEL ═══
  useEffect(() => {
    const loadCarousel = async () => {
      try {
        const activeBanners = await getActiveBanners();
        const mappedSlides = activeBanners.map((banner) => ({
          id: banner.id,
          image: banner.imageUrl,
          alt: `Banner ${banner.id}`,
        }));

        setSlides((prevSlides) => {
          const prevJson = JSON.stringify(prevSlides);
          const nextJson = JSON.stringify(mappedSlides);
          return prevJson === nextJson ? prevSlides : mappedSlides;
        });
      } catch (err) {
        console.error('Error al cargar carrusel:', err);
      }
    };

    loadCarousel();

    const intervalId = setInterval(() => {
      loadCarousel();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // ═══ CARGAR PRODUCTOS DESTACADOS ═══
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const featuredProducts = await ProductsService.getFeatured(8);
        setProducts(featuredProducts);
      } catch (error) {
        console.error('Error cargando productos destacados:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // ═══ CARGAR CATEGORÍAS ═══
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const allCategories = await categoriesService.getAll();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // ═══ CARRUSEL AUTOMÁTICO ═══
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides]);

  // ═══ CONTROLES DEL CARRUSEL ═══
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div className="home-page">

      {/* ══ Carrusel ══ */}
      {slides.length > 0 && (
        <section style={{ padding: '12px 0 0' }}>
          <div className="carousel-wrap" style={{ height: 'clamp(200px, 52vw, 78vh)' }}>

            {/* Slides */}
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                style={{
                  position: 'absolute', inset: 0,
                  transition: 'opacity 0.7s ease, transform 0.7s ease',
                  opacity: index === currentSlide ? 1 : 0,
                  transform: index === currentSlide
                    ? 'translateX(0)'
                    : index < currentSlide ? 'translateX(-100%)' : 'translateX(100%)',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'blur(22px)', transform: 'scale(1.1)',
                }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', zIndex: 1 }}>
                  <img src={slide.image} alt={slide.alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            ))}

            {/* Nav buttons */}
            {[{ action: prevSlide, side: 'left' },
              { action: nextSlide, side: 'right' }
            ].map(({ action, side }) => (
              <button
                key={side}
                onClick={action}
                style={{
                  position: 'absolute', top: '50%', [side]: 14,
                  transform: 'translateY(-50%)',
                  width: 40, height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 20,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              >
                {side === 'left'
                  ? <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
                  : <ChevronRight size={20} color="#fff" strokeWidth={2.5} />}
              </button>
            ))}

            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6, alignItems: 'center', zIndex: 20,
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)',
              padding: '5px 10px', borderRadius: 20,
            }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  style={{
                    width: i === currentSlide ? 20 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.45)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ Categorías ══ */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <p className="section-eyebrow">Explora</p>
            <h2 className="section-title">Categorías</h2>
          </div>
          <Link to="/shop" className="btn-outline">
            Ver todas <ArrowRight size={13} strokeWidth={3} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}
          className="categories-grid">
          <style>{`
            @media (max-width: 767px) { .categories-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (min-width: 768px) and (max-width: 1023px) { .categories-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          `}</style>

          {loadingCategories ? (
            // Skeleton loaders
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="cat-card loading-skeleton" style={{ minHeight: '120px' }} />
            ))
          ) : categories.length > 0 ? (
            categories.slice(0, 5).map((cat) => {
              const Icon = categoryIcons[cat.id] || ShoppingBag;
              return (
                <Link key={cat.id} to={`/shop?category=${cat.id}`} className="cat-card">
                  <div className="cat-icon-wrap">
                    <Icon size={24} color="#004D77" strokeWidth={1.75} />
                  </div>
                  <span className="cat-label">{cat.name}</span>
                </Link>
              );
            })
          ) : (
            <p className="section-subtitle">No hay categorías disponibles</p>
          )}
        </div>

        <div className="section-divider" />
      </section>

      {/* ══ Productos destacados ══ */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <p className="section-eyebrow">Destacados</p>
            <h2 className="section-title">Nuestros productos</h2>
            <p className="section-subtitle">Encuentra los productos ideales para ti en un solo lugar</p>
          </div>
          <Link to="/shop" className="btn-outline">
            Ver más <ArrowRight size={13} strokeWidth={3} />
          </Link>
        </div>

        <div
          className="products-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}
        >
          <style>{`
            @media (max-width: 639px)  { .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
            @media (min-width: 640px) and (max-width: 1023px) { .products-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important; } }
          `}</style>

          {loadingProducts || loadingClientType ? (
            // Skeleton loaders
            Array.from({ length: 8 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="loading-skeleton" style={{ minHeight: '300px', borderRadius: '16px' }} />
            ))
          ) : products.length > 0 ? (
            products
              .filter((product) => product.isActive)
              .map((product) => (
                <div key={product.id} className="pm-card">
                  <ProductCard
                    product={product}
                    clientType={clientType}
                  />
                </div>
              ))
          ) : (
            <p className="section-subtitle" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              No hay productos disponibles en este momento
            </p>
          )}
        </div>

        <div className="section-divider" />
      </section>

      {/* ══ Mayoristas ══ */}
      <section style={{ padding: 'clamp(32px,5vw,56px) 0 clamp(32px,5vw,56px)' }}>
        <div className="mayoristas-wrap">
          {/* Fondo imagen */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${mayoristaBg})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          {/* Overlay gradiente */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(0,40,70,0.93) 0%, rgba(0,77,119,0.80) 100%)',
          }} />

          <div className="mayoristas-content">
            <p className="mayoristas-tag">Canal mayorista</p>
            <h2 className="mayoristas-title">¿Eres mayorista?</h2>
            <div className="mayoristas-divider" />
            <p className="mayoristas-subtitle">
              Comunícate con nosotros y con gusto te asesoraremos con los mejores precios del mercado.
            </p>
            <a
              href="https://wa.me/573002936722"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-mayoristas"
            >
              Contáctanos por WhatsApp
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
