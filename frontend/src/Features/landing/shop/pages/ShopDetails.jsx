import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../layouts/HeaderLanding";
import Footer from "../../../layouts/Footer";
import ProductCard from "../../../shared/ProductCard";
import ShopHero from "../components/ShopHero";
import { Minus, Plus } from "lucide-react";

import Pagination from "../../../shared/PaginationLanding";
import notebookPen from "../../../../assets/products/notebookAndPen.png";
import correctorcinta from "../../../../assets/products/correctorencinta.png";
import cuadernoprimavera from "../../../../assets/products/cuadernoprimaverax100h.png";
import setsharpie from "../../../../assets/products/setsharpiex30.png";
import sewingmachine from "../../../../assets/products/sewingmachine.png";
import Tijeraspunta from "../../../../assets/products/Tijeraspuntaroma.png";
import vinilopq from "../../../../assets/products/vinilopqpowercolorrojo.png";
import BgTienda from "../../../../assets/BgTienda.png";
import SortDropdown from "../components/SortDropdown";


function ShopDetail() {
  const navigate = useNavigate();
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
        { id: 1, image: notebookPen, name: 'Libreta con lapicero', category: 'Escolar', brand: 'Norma', price: 5000 },
        { id: 2, image: correctorcinta, name: 'corrector cinta', category: 'Oficina', brand: 'Pelikan', price: 4000 },
        { id: 3, image: cuadernoprimavera, name: 'cuaderno primavera x100h', category: 'Arte', brand: 'Scribe', price: 70000 },
        { id: 4, image: setsharpie, name: 'set sharpie x30', category: 'Escritura', brand: 'Gilpao', price: 120000 },
        { id: 5, image: sewingmachine, name: 'sewing machine', category: 'Papelería Básica', brand: 'Eterna', price: 5000 },
        { id: 6, image: Tijeraspunta, name: 'Tijeras punta roma', category: 'Escolar', brand: 'Norma', price: 3000 },
        { id: 7, image: vinilopq, name: 'vinilo pq power color rojo', category: 'Oficina', brand: 'Pelikan', price: 1500 },
        { id: 8, image: correctorcinta, name: 'correctorencinta', category: 'Arte', brand: 'Norma', price: 7000 },
  ];
  const sortedRelatedProducts = [...relatedProducts]
  .filter(item => item.id !== product.id)
  .sort((a, b) => {
    if (selectedSort === "price-low") return a.price - b.price;
    if (selectedSort === "price-high") return b.price - a.price;
    return 0;
  });


  const totalPrice = product.price * quantity;

  return (
    <>
      
      {/* HERO */}
            <ShopHero
        image={BgTienda}
        title="Tienda"
      />


      <section className="w-full max-w-7xl mx-auto px-4 py-10">

        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate("/shop")}
          className="mb-6 text-[#004D77] font-semibold hover:underline transition"
        >
          ← Volver a tienda
        </button>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* IMAGEN */}
          <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center h-112.5">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* INFORMACIÓN */}
          <div>

            <h1 className="text-3xl font-bold mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            <p className="text-2xl font-bold text-[#004D77] mb-6">
              ${totalPrice.toLocaleString("es-CO")} COP
            </p>

            {/* CANTIDAD */}
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

              <button className="bg-[#004D77] text-white px-6 py-3 rounded-lg hover:bg-[#003456] transition">
                Añadir al carrito
              </button>
            </div>

            {/* CARACTERÍSTICAS */}
            <div className="grid sm:grid-cols-3 gap-6 mt-10 border-t pt-6">

              <div>
                <h3 className="font-semibold mb-2">Características Técnicas</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Mina HB resistente</li>
                  <li>Diseño degradado</li>
                  <li>Ideal para dibujo y escritura</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Colores disponibles</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Rosa - Morado</li>
                  <li>Amarillo - Naranja</li>
                  <li>Verde - Esmeralda</li>
                  <li>Azul - Celeste</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Ficha técnica</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Material: Madera</li>
                  <li>Unidad por caja: 12</li>
                  <li>Fabricante: Gipao</li>
                </ul>
              </div>

            </div>

          </div>
        </div>
        
        {/* PRODUCTOS RELACIONADOS */}
        
        <div className="mt-16">
          <div className="flex">
          <h2 className="text-xl font-semibold mb-6 flex-1">
            Productos relacionados
          </h2>
          <SortDropdown className ="flex-3"
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              sortOptions={sortOptions}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedRelatedProducts
            .slice(0, 8)
            .map(item => (

                <ProductCard
                  key={item.id}
                  image={item.image}
                  name={item.name}
                  category={item.category}
                  price={item.price}
                  productId={item.id}
                />
              ))}
          </div>
        </div>

      </section>

    </>
  );
}

export default ShopDetail;