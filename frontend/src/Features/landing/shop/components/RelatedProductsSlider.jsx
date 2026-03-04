import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../../../shared/ProductCard";

function RelatedProductsSlider({ products }) {
  const sliderRef = useRef(null);

  const [isClickingLeft, setIsClickingLeft] = useState(false);
  const [isClickingRight, setIsClickingRight] = useState(false);

  const scroll = (dir) => {
    if (!sliderRef.current) return;

    const amount = 350;

    if (dir === "left") {
      setIsClickingLeft(true);
      setTimeout(() => setIsClickingLeft(false), 200);
    } else {
      setIsClickingRight(true);
      setTimeout(() => setIsClickingRight(false), 200);
    }

    sliderRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">

      {/* Botón izquierdo */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20
        bg-white shadow-lg p-3 rounded-full
        border-2 border-[#004D77]
        transition-all duration-200
        ${isClickingLeft ? "scale-90 -translate-x-1" : "hover:scale-110"}`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-12"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((item) => (
          <div
            key={item.id}
            className="min-w-[260px] hover:-translate-y-2 transition-transform duration-300"
          >
            <ProductCard
              image={item.image}
              name={item.name}
              category={item.category}
              price={item.price}
              productId={item.id}
            />
          </div>
        ))}
      </div>

      {/* Botón derecho */}
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20
        bg-white shadow-lg p-3 rounded-full
        border-2 border-[#004D77]
        transition-all duration-200
        ${isClickingRight ? "scale-90 translate-x-1" : "hover:scale-110"}`}
      >
        <ChevronRight size={20} />
      </button>

    </div>
  );
}

export default RelatedProductsSlider;
