import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../../shared/ProductCard";
import ShopHero from "../components/ShopHero";
import { Minus, Plus } from "lucide-react";

import notebookPen from "../../../../assets/products/notebookAndPen.png";
import correctorcinta from "../../../../assets/products/correctorencinta.png";
import cuadernoprimavera from "../../../../assets/products/cuadernoprimaverax100h.png";
import setsharpie from "../../../../assets/products/setsharpiex30.png";
import sewingmachine from "../../../../assets/products/sewingmachine.png";
import Tijeraspunta from "../../../../assets/products/Tijeraspuntaroma.png";
import vinilopq from "../../../../assets/products/vinilopqpowercolorrojo.png";
import BgTienda from "../../../../assets/BgTienda.png";
import SortDropdown from "../components/SortDropdown";
import { useAlert } from "../../../shared/alerts/useAlert";

function ShopDetail() {
  const navigate = useNavigate();
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
    showSuccess(
      "Añadido al carrito",
      `${quantity} x ${product.name} se ha agregado al carrito.`
    );
  };

  return (
    <>
      <ShopHero image={BgTienda} title="Tienda" />

      <section className="w-full max-w-7xl mx-auto px-4 pt-4 pb-16">

        <button
          onClick={() => navigate("/shop")}
          className="mb-4 text-[#004D77] font-semibold hover:underline transition"
        >
          ← Volver a tienda
        </button>

        <div className="grid md:grid-cols-2 gap-10">

          <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center h-105 shadow-xl">
            <img
              src={product.image}
              alt={product.name}
              className="h-96 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <p className="text-2xl font-bold text-[#004D77] mb-6">
              ${totalPrice.toLocaleString("es-CO")} COP
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition"
                >
                  <Minus size={18} />
                </button>

                <span className="px-4">{quantity}</span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-[#004D77] text-white px-6 py-3 rounded-lg hover:bg-[#003456] transition"
              >
                Añadir al carrito
              </button>
            </div>

            <div className="mt-10 border-t pt-6">
              <h3 className="font-semibold mb-2">Características</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Set extragrande</li>
                <li>Diseño degradado</li>
                <li>Ideal para dibujo y pintura</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24">

          <div className="flex items-center mb-10">
            <h2 className="text-2xl font-bold flex-1">
              Productos relacionados
            </h2>

            <SortDropdown
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              sortOptions={sortOptions}
            />
          </div>

          <Carousel
            products={sortedRelatedProducts}
            showSuccess={showSuccess}
          />

        </div>

      </section>
    </>
  );
}

function Carousel({ products, showSuccess }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleRange = isMobile ? 0 : 2;
  const maxIndex = products.length - 1;

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const next = () => {
    if (currentIndex < maxIndex) setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="relative w-full flex items-center justify-center">

      <button
        onClick={prev}
        disabled={currentIndex === 0}
        className="absolute left-0 z-20 bg-white shadow-xl rounded-full p-4 hover:scale-105 transition disabled:opacity-30"
      >
        ‹
      </button>

      <div className="flex items-center justify-center gap-8 w-full overflow-hidden py-10">

        {products.map((product, index) => {
          const shouldHide = isMobile
            ? index !== currentIndex
            : Math.abs(index - currentIndex) > visibleRange;

          return (
            <div
              key={product.id}
              style={{ display: shouldHide ? "none" : "block" }}
            >
              <div className="w-[260px]">
                <ProductCard
                  image={product.image}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  productId={product.id}
                  onAddToCart={() =>
                    showSuccess(
                      "Añadido al carrito",
                      `${product.name} se ha agregado al carrito.`
                    )
                  }
                />
              </div>
            </div>
          );
        })}

      </div>

      <button
        onClick={next}
        disabled={currentIndex === maxIndex}
        className="absolute right-0 z-20 bg-white shadow-xl rounded-full p-4 hover:scale-105 transition disabled:opacity-30"
      >
        ›
      </button>

    </div>
  );
}

export default ShopDetail;