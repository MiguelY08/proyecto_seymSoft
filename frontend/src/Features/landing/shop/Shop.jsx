import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Header from "../../layouts/HeaderLanding";
import Footer from "../../layouts/Footer";
import BgTienda from "../../../assets/BgTienda.png";
import ProductCard from "../../shared/ProductCard";
import nacional from "../../../assets/products/atlNacional.png";
import Pagination from "../../shared/PaginationLanding";
import notebookPen from "../../../assets/products/notebookAndPen.png";
import correctorcinta from "../../../assets/products/correctorencinta.png";
import cuadernoprimavera from "../../../assets/products/cuadernoprimaverax100h.png";
import setsharpie from "../../../assets/products/setsharpiex30.png";
import sewingmachine from "../../../assets/products/sewingmachine.png";
import Tijeraspunta from "../../../assets/products/Tijeraspuntaroma.png";
import vinilopq from "../../../assets/products/vinilopqpowercolorrojo.png";


function Shop() {

  const products = [
    { id: 1, image: notebookPen, name: 'Libreta con lapicero', category: 'Escolar', brand: 'Norma', price: 5000 },
    { id: 2, image: correctorcinta, name: 'corrector cinta', category: 'Oficina', brand: 'Pelikan', price: 4000 },
    { id: 3, image: cuadernoprimavera, name: 'cuaderno primavera x100h', category: 'Arte', brand: 'Scribe', price: 70000 },
    { id: 4, image: setsharpie, name: 'set sharpie x30', category: 'Escritura', brand: 'Gilpao', price: 120000 },
    { id: 5, image: sewingmachine, name: 'sewing machine', category: 'Papelería Básica', brand: 'Eterna', price: 5000 },
    { id: 6, image: Tijeraspunta, name: 'Tijeras punta roma', category: 'Escolar', brand: 'Norma', price: 3000 },
    { id: 7, image: vinilopq, name: 'vinilo pq power color rojo', category: 'Oficina', brand: 'Pelikan', price: 1500 },
    { id: 8, image: correctorcinta, name: 'correctorencinta', category: 'Arte', brand: 'Norma', price: 7000 },
    { id: 9, image: nacional, name: 'Atletico Nacional', category: 'Escritura', brand: 'Gilpao', price: 200 },
    { id: 10, image: nacional, name: 'Atletico Nacional', category: 'Papelería Básica', brand: 'Eterna', price: 10000 },
  ];

  const categories = ['Escolar', 'Oficina', 'Escritura', 'Papelería Básica', 'Arte'];
  const brands = ['Gilpao', 'Eterna', 'Pelikan', 'Norma', 'Scribe'];

  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // 🔽 ORDEN
  const [selectedSort, setSelectedSort] = useState("relevant");
  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions = [
    { value: "relevant", label: "Más relevantes" },
    { value: "price_high", label: "Costo: Mayor a menor" },
    { value: "price_low", label: "Costo: Menor a mayor" }
  ];

  const productsPerPage = 8;

  const handleCategoryChange = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    setCurrentPage(1);
  };

  const handleBrandChange = (brand) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(updated);
    setCurrentPage(1);
  };

  // 🔎 FILTRO
  const filteredProducts = products.filter(product => {
    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchBrand =
      selectedBrands.length === 0 ||
      selectedBrands.includes(product.brand);

    return matchCategory && matchBrand;
  });

  // 🔽 ORDENAMIENTO
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === "price_high") return b.price - a.price;
    if (selectedSort === "price_low") return a.price - b.price;
    return 0;
  });

  const totalProducts = sortedProducts.length;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="mt-2 w-full flex items-center justify-center">
        <div className="w-full sm:w-[98%] lg:w-[95%] h-[20vh] relative overflow-hidden rounded-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BgTienda})` }}
          />
          <div className="absolute inset-0 bg-blue-950/75" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <h2 className="text-5xl font-bold text-white">Tienda</h2>
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* FILTROS */}
          <div className="w-64 bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold">Filtros</h2>
            <p className="text-sm text-gray-500">{totalProducts} resultados</p>

            {/* Categorías */}
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex justify-between w-full py-2 mt-4"
            >
              <span className="font-medium">Categorías</span>
              {categoryOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {categoryOpen && (
              <div className="space-y-2 mt-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="mr-2"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            )}

            <hr className="my-4" />

            {/* Marcas */}
            <button
              onClick={() => setBrandOpen(!brandOpen)}
              className="flex justify-between w-full py-2"
            >
              <span className="font-medium">Marca</span>
              {brandOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {brandOpen && (
              <div className="space-y-2 mt-2">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="mr-2"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCTOS */}
          <div className="flex-1">

            {/* ORDENAR */}
            <div className="flex justify-end mb-4 relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-[#000000]"
              >
                Ordenar por:{" "}
                <span className="text-[#004D77] font-medium">
                  {sortOptions.find(opt => opt.value === selectedSort)?.label}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    sortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {sortOpen && (
                <div className="absolute right-0 mt-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedSort(option.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                        selectedSort === option.value
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentProducts.map(product => (
                <ProductCard
                  key={product.id}
                  image={product.image}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                />
              ))}
            </div>

            <Pagination
              totalProducts={totalProducts}
              productsPerPage={productsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}

export default Shop;