import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../../../shared/ProductCard";

/* ── Estilos inyectados (coherentes con Home/Favorites) ── */
const SLIDER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .slider-container {
    position: relative;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
  }

  .slider-track {
    display: flex;
    gap: 24px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #e2edf5;
    padding: 8px 4px 16px 4px;
    margin: 0 40px;
  }

  .slider-track::-webkit-scrollbar {
    height: 6px;
  }

  .slider-track::-webkit-scrollbar-track {
    background: #e2edf5;
    border-radius: 10px;
  }

  .slider-track::-webkit-scrollbar-thumb {
    background: #9abcce;
    border-radius: 10px;
  }

  .slider-track::-webkit-scrollbar-thumb:hover {
    background: #004D77;
  }

  .slider-item {
    flex: 0 0 auto;
    width: 260px;
    transition: transform 0.3s ease;
  }

  .slider-item:hover {
    transform: translateY(-4px);
  }

  .slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    background: #ffffff;
    border: 2px solid #004D77;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 77, 119, 0.15);
  }

  .slider-btn:hover {
    background: #004D77;
    transform: translateY(-50%) scale(1.08);
  }

  .slider-btn:hover svg {
    color: white;
  }

  .slider-btn:active {
    transform: translateY(-50%) scale(0.96);
  }

  .slider-btn-left {
    left: -8px;
  }

  .slider-btn-right {
    right: -8px;
  }

  @media (min-width: 768px) {
    .slider-btn-left {
      left: -16px;
    }
    .slider-btn-right {
      right: -16px;
    }
  }

  .slider-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
    transform: translateY(-50%);
  }
`;

let sliderStylesInjected = false;
function injectSliderStyles() {
  if (sliderStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = SLIDER_STYLES;
  document.head.appendChild(style);
  sliderStylesInjected = true;
}

function RelatedProductsSlider({ products }) {
  injectSliderStyles();

  const sliderRef = useRef(null);
  const [isClickingLeft, setIsClickingLeft] = useState(false);
  const [isClickingRight, setIsClickingRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    const amount = 280; // Ancho aproximado de tarjeta + gap

    if (dir === "left") {
      setIsClickingLeft(true);
      setTimeout(() => setIsClickingLeft(false), 200);
      sliderRef.current.scrollBy({ left: -amount, behavior: "smooth" });
    } else {
      setIsClickingRight(true);
      setTimeout(() => setIsClickingRight(false), 200);
      sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }

    // Actualizar estado después del scroll
    setTimeout(updateScrollButtons, 300);
  };

  // Escuchar eventos de scroll para actualizar botones
  const handleScroll = () => {
    updateScrollButtons();
  };

  return (
    <div className="slider-container">
      {/* Botón izquierdo */}
      <button
        onClick={() => scroll("left")}
        className={`slider-btn slider-btn-left ${!canScrollLeft ? 'disabled' : ''}`}
        disabled={!canScrollLeft}
        style={{
          transform: isClickingLeft ? 'translateY(-50%) scale(0.9)' : 'translateY(-50%)'
        }}
      >
        <ChevronLeft size={20} strokeWidth={2.5} color="#004D77" />
      </button>

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="slider-track"
        onScroll={handleScroll}
      >
        {products.map((item) => (
          <div key={item.id} className="slider-item">
            <ProductCard
              image={item.image}
              name={item.name}
              category={item.category}
              price={item.price}
              productData={item}
            />
          </div>
        ))}
      </div>

      {/* Botón derecho */}
      <button
        onClick={() => scroll("right")}
        className={`slider-btn slider-btn-right ${!canScrollRight ? 'disabled' : ''}`}
        disabled={!canScrollRight}
        style={{
          transform: isClickingRight ? 'translateY(-50%) scale(0.9)' : 'translateY(-50%)'
        }}
      >
        <ChevronRight size={20} strokeWidth={2.5} color="#004D77" />
      </button>
    </div>
  );
}

export default RelatedProductsSlider;