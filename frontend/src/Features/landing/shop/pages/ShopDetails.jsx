import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../../shared/ProductCard";
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useCart } from "../../../shared/Context/Cartcontext";
import { useAlert } from "../../../shared/alerts/useAlert";

import notebookPen from "../../../../assets/products/notebookAndPen.png";
import correctorcinta from "../../../../assets/products/correctorencinta.png";
import cuadernoprimavera from "../../../../assets/products/cuadernoprimaverax100h.png";
import setsharpie from "../../../../assets/products/setsharpiex30.png";
import sewingmachine from "../../../../assets/products/sewingmachine.png";
import Tijeraspunta from "../../../../assets/products/Tijeraspuntaroma.png";
import vinilopq from "../../../../assets/products/vinilopqpowercolorrojo.png";
import BgTienda from "../../../../assets/BgTienda.png";

/* ── Estilos inyectados (coherentes con Home/Favorites) ── */
const DETAIL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes detail-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes detail-slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .detail-page {
    background: #f6f9fc;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    min-height: 100vh;
  }

  .detail-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 40px) 20px;
  }

  /* Botón volver */
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    font-size: 0.85rem;
    font-weight: 700;
    color: #004D77;
    cursor: pointer;
    padding: 8px 0;
    margin-bottom: 24px;
    transition: all 0.2s;
  }
  .back-button:hover {
    gap: 12px;
    color: #0c5c88;
  }

  /* Layout principal */
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 64px;
  }

  @media (min-width: 768px) {
    .detail-grid {
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
  }

  /* Imagen */
  .detail-image-wrapper {
    background: linear-gradient(150deg, #eef6fb 0%, #e0eef7 100%);
    border-radius: 28px;
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #e4eff6;
    transition: all 0.3s ease;
  }
  .detail-image-wrapper:hover {
    box-shadow: 0 12px 32px rgba(0, 77, 119, 0.12);
    transform: translateY(-2px);
  }
  .detail-image {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .detail-image-wrapper:hover .detail-image {
    transform: scale(1.03);
  }

  /* Info producto */
  .detail-info {
    animation: detail-slideIn 0.4s ease;
  }
  .detail-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3vw, 2.2rem);
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 16px;
  }
  .detail-category {
    display: inline-block;
    background: #e8f4fd;
    color: #004D77;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 40px;
    margin-bottom: 20px;
  }
  .detail-description {
    color: #475569;
    line-height: 1.65;
    margin-bottom: 24px;
    font-size: 0.95rem;
  }
  .detail-price {
    font-size: 2rem;
    font-weight: 900;
    color: #004D77;
    margin-bottom: 24px;
  }
  .detail-price span {
    font-size: 0.8rem;
    font-weight: 600;
    color: #9abcce;
  }

  /* Control de cantidad */
  .quantity-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .quantity-control {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 60px;
    overflow: hidden;
  }
  .quantity-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    color: #1e4060;
  }
  .quantity-btn:hover {
    background: #eef6fb;
    color: #004D77;
  }
  .quantity-btn:active {
    transform: scale(0.95);
  }
  .quantity-number {
    min-width: 48px;
    text-align: center;
    font-weight: 800;
    font-size: 1rem;
    color: #0c2a3a;
  }
  .add-to-cart-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #004D77;
    color: white;
    border: 2px solid #004D77;
    padding: 10px 28px;
    border-radius: 60px;
    font-weight: 800;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.2s;
  }
  .add-to-cart-btn:hover {
    background: transparent;
    color: #004D77;
    transform: translateY(-2px);
  }
  .add-to-cart-btn:active {
    transform: scale(0.97);
  }

  /* Características */
  .features-section {
    border-top: 1.5px solid #e2edf5;
    padding-top: 24px;
    margin-top: 16px;
  }
  .features-title {
    font-weight: 800;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1e4060;
    margin-bottom: 12px;
  }
  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .features-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #475569;
    padding: 6px 0;
  }
  .features-list li::before {
    content: "✓";
    color: #004D77;
    font-weight: 800;
  }

  /* Productos relacionados */
  .related-section {
    margin-top: 48px;
  }
  .related-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
  }
  .related-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }
  .related-eyebrow {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #004D77;
    margin-bottom: 4px;
  }

  /* Carrusel mejorado */
  .carousel-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .carousel-track {
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    gap: 20px;
    padding: 8px 4px;
    flex: 1;
  }
  .carousel-track::-webkit-scrollbar {
    display: none;
  }
  .carousel-slide {
    flex: 0 0 auto;
    width: 260px;
    transition: transform 0.3s;
  }
  .carousel-slide:hover {
    transform: translateY(-4px);
  }
  .carousel-btn {
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .carousel-btn:hover {
    border-color: #004D77;
    background: #f0f8ff;
    transform: scale(1.05);
  }
  .carousel-btn:active {
    transform: scale(0.95);
  }
  .carousel-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

let detailStylesInjected = false;
function injectDetailStyles() {
  if (detailStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = DETAIL_STYLES;
  document.head.appendChild(style);
  detailStylesInjected = true;
}

function ShopDetail() {
  injectDetailStyles();

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess } = useAlert();

  const [quantity, setQuantity] = useState(1);
  const [selectedSort, setSelectedSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions = [
    { value: "default", label: "Por defecto" },
    { value: "price-low", label: "Precio: menor a mayor" },
    { value: "price-high", label: "Precio: mayor a menor" },
  ];

  const product = {
    id: 1,
    name: "Set sharpie x30",
    category: "Escritura",
    price: 120000,
    description:
      "Dale un toque de estilo y color a tus ideas. Combina tonos vibrantes que los hacen irresistibles a la vista, mientras su mina HB garantiza una escritura suave, precisa y duradera.",
    image: setsharpie,
  };

  const relatedProducts = [
    { id: 1, image: notebookPen, name: "Libreta con lapicero", category: "Escolar", price: 5000 },
    { id: 2, image: correctorcinta, name: "Corrector cinta", category: "Oficina", price: 4000 },
    { id: 3, image: cuadernoprimavera, name: "Cuaderno primavera x100h", category: "Arte", price: 70000 },
    { id: 4, image: setsharpie, name: "Set sharpie x30", category: "Escritura", price: 120000 },
    { id: 5, image: sewingmachine, name: "Sewing machine", category: "Papelería Básica", price: 5000 },
    { id: 6, image: Tijeraspunta, name: "Tijeras punta roma", category: "Escolar", price: 3000 },
    { id: 7, image: vinilopq, name: "Vinilo power color rojo", category: "Oficina", price: 1500 },
    { id: 8, image: correctorcinta, name: "Corrector en cinta", category: "Arte", price: 7000 },
  ];

  const sortedRelatedProducts = [...relatedProducts]
    .filter(item => item.id !== product.id)
    .sort((a, b) => {
      if (selectedSort === "price-low") return a.price - b.price;
      if (selectedSort === "price-high") return b.price - a.price;
      return 0;
    });

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showSuccess(
      "Añadido al carrito",
      `${quantity} x ${product.name} se ha agregado al carrito.`
    );
    setQuantity(1);
  };

  // Carrusel manual con scroll
  const scrollCarousel = (direction) => {
    const container = document.querySelector('.carousel-track');
    if (container) {
      const scrollAmount = 280; // ancho aproximado de cada tarjeta + gap
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="detail-page"><div className="detail-container">
        {/* Botón volver */}
        <button onClick={() => navigate("/shop")} className="back-button">
          <ChevronLeft size={18} /> Volver a tienda
        </button>

        {/* Producto principal */}
        <div className="detail-grid">
          <div className="detail-image-wrapper">
            <img src={product.image} alt={product.name} className="detail-image" />
          </div>

          <div className="detail-info">
            <div className="detail-category">{product.category}</div>
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-description">{product.description}</p>
            <div className="detail-price">
              ${totalPrice.toLocaleString("es-CO")} <span>COP</span>
            </div>

            <div className="quantity-section">
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <Minus size={16} />
                </button>
                <span className="quantity-number">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <ShoppingCart size={16} /> Añadir al carrito
              </button>
            </div>

            <div className="features-section">
              <h3 className="features-title">Características</h3>
              <ul className="features-list">
                <li>Set extragrande</li>
                <li>Diseño degradado</li>
                <li>Ideal para dibujo y pintura</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <div className="related-section">
          <div className="related-header">
            <div>
              <p className="related-eyebrow">También te puede interesar</p>
              <h2 className="related-title">Productos relacionados</h2>
            </div>
            {/* Aquí podrías agregar el SortDropdown si lo deseas, pero se omite por simplicidad visual */}
          </div>

          <div className="carousel-container">
            <button
              className="carousel-btn"
              onClick={() => scrollCarousel('left')}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="carousel-track">
              {sortedRelatedProducts.map((relProduct) => (
                <div key={relProduct.id} className="carousel-slide">
                  <ProductCard
                    image={relProduct.image}
                    name={relProduct.name}
                    category={relProduct.category}
                    price={relProduct.price}
                    productData={relProduct}
                  />
                </div>
              ))}
            </div>

            <button
              className="carousel-btn"
              onClick={() => scrollCarousel('right')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopDetail;