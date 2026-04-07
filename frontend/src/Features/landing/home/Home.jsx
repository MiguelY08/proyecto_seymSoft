import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, Briefcase, ClipboardPen, FileText, Palette, ArrowRight } from 'lucide-react';

import { getImage, seedDefaultImage } from '../../administrtivePanel/configuration/carousel/services/CarouselBD.js';

import ProductCard from '../../shared/ProductCard.jsx';
import correctorCinta      from '../../../assets/products/correctorencinta.png';
import cuadernoPrimavera   from '../../../assets/products/cuadernoprimaverax100h.png';
import notebookPen         from '../../../assets/products/notebookAndPen.png';
import setSharpie30        from '../../../assets/products/setsharpiex30.png';
import cosedora            from '../../../assets/products/sewingmachine.png';
import tijeraPuntaRoma     from '../../../assets/products/Tijeraspuntaroma.png';
import viniloRojo          from '../../../assets/products/vinilopqpowercolorrojo.png';
import marcadorEterna      from '../../../assets/products/marcadoreseterna.png';

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides,       setSlides]       = useState([]);
  const urlsRef = useRef([]);

  const categories = [
    { id: 1, name: 'Escolar',          icon: ShoppingBag,  href: '/categoria/escolar'         },
    { id: 2, name: 'Oficina',          icon: Briefcase,    href: '/categoria/oficina'          },
    { id: 3, name: 'Escritura',        icon: ClipboardPen, href: '/categoria/escritura'        },
    { id: 4, name: 'Papelería básica', icon: FileText,     href: '/categoria/papeleria-basica' },
    { id: 5, name: 'Arte',             icon: Palette,      href: '/categoria/arte'             },
  ];

  const products = [
    { id: 1, image: correctorCinta,    name: 'Corrector en Cinta',       category: 'ESCRITURA', price: 4500  },
    { id: 2, image: cuadernoPrimavera, name: 'Cuaderno Primavera x100h', category: 'ESCOLAR',   price: 8900  },
    { id: 3, image: notebookPen,       name: 'Notebook con Bolígrafo',   category: 'OFICINA',   price: 15900 },
    { id: 4, image: setSharpie30,      name: 'Set Sharpie x30 Colores',  category: 'ARTE',      price: 62000 },
    { id: 5, image: cosedora,          name: 'Cosedora Metálica',        category: 'OFICINA',   price: 18500 },
    { id: 6, image: tijeraPuntaRoma,   name: 'Tijeras Punta Roma',       category: 'ESCOLAR',   price: 6200  },
    { id: 7, image: viniloRojo,        name: 'Vinilo Power Color Rojo',  category: 'ARTE',      price: 9800  },
    { id: 8, image: marcadorEterna,    name: 'Marcadores Eterna x12',    category: 'ESCRITURA', price: 13500 },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        await seedDefaultImage();
        const stored = localStorage.getItem('pm_carousel');
        const meta   = stored ? JSON.parse(stored) : [];
        const activos = meta.filter((s) => s.activo).sort((a, b) => a.orden - b.orden);
        const loaded = await Promise.all(
          activos.map(async (s) => {
            const blob = await getImage(s.id);
            const url  = blob ? URL.createObjectURL(blob) : null;
            return { id: s.id, image: url, alt: s.nombre };
          })
        );
        const validos = loaded.filter((s) => s.image !== null);
        urlsRef.current = validos.map((s) => s.image);
        setSlides(validos);
      } catch (err) {
        console.error('Error al cargar carrusel:', err);
        setSlides([]);
      }
    };
    load();
    return () => { urlsRef.current.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

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
            {[{ dir: 'prev', Icon: ChevronLeft, action: prevSlide, side: 'left' },
              { dir: 'next', Icon: ChevronRight, action: nextSlide, side: 'right' }
            ].map(({ Icon, action, side }) => (
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
                <Icon size={20} color="#fff" strokeWidth={2.5} />
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
          <a href="/categorias" className="btn-outline">
            Ver todas <ArrowRight size={13} strokeWidth={3} />
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}
          className="categories-grid">
          <style>{`
            @media (max-width: 767px) { .categories-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (min-width: 768px) and (max-width: 1023px) { .categories-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          `}</style>
          {categories.map((cat) => (
            <a key={cat.id} href={cat.href} className="cat-card">
              <div className="cat-icon-wrap">
                <cat.icon size={24} color="#004D77" strokeWidth={1.75} />
              </div>
              <span className="cat-label">{cat.name}</span>
            </a>
          ))}
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
          <Link to="/tienda" className="btn-outline">
            Ver más <ArrowRight size={13} strokeWidth={3} />
          </Link>
        </div>

        <div
          className="products-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
        >
          <style>{`
            @media (max-width: 639px)  { .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
            @media (min-width: 640px) and (max-width: 1023px) { .products-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          `}</style>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              category={product.category}
              price={product.price}
            />
          ))}
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