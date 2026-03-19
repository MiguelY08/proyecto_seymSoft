import { useState, useMemo } from "react";

import Filters from "../components/FilterLanding";
import SortDropdown from "../components/SortDropdown";
import ProductCard from "../../../shared/ProductCard";
import Pagination from "../../../shared/PaginationLanding";
import ShopHero from "../components/ShopHero";

import BgTienda from "../../../../assets/BgTienda.png";
import nacional from "../../../../assets/products/atlNacional.png";
import notebookPen from "../../../../assets/products/notebookAndPen.png";
import correctorcinta from "../../../../assets/products/correctorencinta.png";
import cuadernoprimavera from "../../../../assets/products/cuadernoprimaverax100h.png";
import setsharpie from "../../../../assets/products/setsharpiex30.png";
import sewingmachine from "../../../../assets/products/sewingmachine.png";
import Tijeraspunta from "../../../../assets/products/Tijeraspuntaroma.png";
import vinilopq from "../../../../assets/products/vinilopqpowercolorrojo.png";

function Shop() {

  const products = [
    { id:1,image:notebookPen,name:'Libreta con lapicero',category:'Escolar',subcategory:'Cuadernos',childCategory:'Cosidos',brand:'Norma',price:5000},
    { id:2,image:correctorcinta,name:'Corrector en cinta',category:'Escritura',subcategory:'Correctores',childCategory:'Cinta',brand:'Pelikan',price:4000},
    { id:3,image:cuadernoprimavera,name:'Cuaderno primavera x100h',category:'Escolar',subcategory:'Cuadernos',childCategory:'Argollados',brand:'Scribe',price:70000},
    { id:4,image:setsharpie,name:'Set Sharpie x30',category:'Escritura',subcategory:'Marcadores',childCategory:'Permanentes',brand:'Gilpao',price:120000},
    { id:5,image:sewingmachine,name:'Resma hojas blancas',category:'Papelería Básica',subcategory:'Hojas blancas',childCategory:'Resma',brand:'Eterna',price:5000},
    { id:6,image:Tijeraspunta,name:'Tijeras punta roma',category:'Escolar',subcategory:'Tijeras',childCategory:'Escolares',brand:'Norma',price:3000},
    { id:7,image:vinilopq,name:'Vinilo rojo',category:'Arte',subcategory:'Pinturas',childCategory:'Vinilos',brand:'Pelikan',price:1500},
    { id:8,image:correctorcinta,name:'Corrector líquido',category:'Escritura',subcategory:'Correctores',childCategory:'Líquido',brand:'Norma',price:7000},
    { id:9,image:nacional,name:'Lapicero Atlético Nacional',category:'Escritura',subcategory:'Bolígrafos',childCategory:'Tinta negra',brand:'Gilpao',price:200},
    { id:10,image:nacional,name:'Block notas Atlético Nacional',category:'Papelería Básica',subcategory:'Blocks de notas',childCategory:'Decorados',brand:'Eterna',price:10000},
    { id:11,image:notebookPen,name:'Cuaderno cuadriculado',category:'Escolar',subcategory:'Cuadernos',childCategory:'Cosidos',brand:'Norma',price:6000},
    { id:12,image:notebookPen,name:'Cuaderno universitario',category:'Escolar',subcategory:'Cuadernos',childCategory:'Argollados',brand:'Scribe',price:8000},
    { id:13,image:Tijeraspunta,name:'Tijeras escolares pequeñas',category:'Escolar',subcategory:'Tijeras',childCategory:'Escolares',brand:'Norma',price:2500},
    { id:14,image:Tijeraspunta,name:'Tijeras metálicas oficina',category:'Oficina',subcategory:'Tijeras',childCategory:'Metálicas',brand:'Pelikan',price:9000},
    { id:15,image:setsharpie,name:'Marcador permanente negro',category:'Escritura',subcategory:'Marcadores',childCategory:'Permanentes',brand:'Pelikan',price:3500},
    { id:16,image:setsharpie,name:'Marcadores escolares x12',category:'Arte',subcategory:'Marcadores artísticos',childCategory:'Escolares',brand:'Norma',price:15000},
    { id:17,image:vinilopq,name:'Vinilo azul',category:'Arte',subcategory:'Pinturas',childCategory:'Vinilos',brand:'Pelikan',price:1700},
    { id:18,image:vinilopq,name:'Vinilo amarillo',category:'Arte',subcategory:'Pinturas',childCategory:'Vinilos',brand:'Pelikan',price:1700},
    { id:19,image:sewingmachine,name:'Hojas blancas carta',category:'Papelería Básica',subcategory:'Hojas blancas',childCategory:'Paquete',brand:'Eterna',price:4500},
    { id:20,image:sewingmachine,name:'Hojas de colores',category:'Papelería Básica',subcategory:'Hojas de colores',childCategory:'Paquete',brand:'Eterna',price:6500},
    { id:21,image:correctorcinta,name:'Corrector tipo pluma',category:'Escritura',subcategory:'Correctores',childCategory:'Líquido',brand:'Pelikan',price:3000},
    { id:22,image:correctorcinta,name:'Corrector escolar',category:'Escritura',subcategory:'Correctores',childCategory:'Cinta',brand:'Norma',price:3500},
    { id:23,image:nacional,name:'Bolígrafo azul',category:'Escritura',subcategory:'Bolígrafos',childCategory:'Tinta azul',brand:'Gilpao',price:500},
    { id:24,image:nacional,name:'Bolígrafo rojo',category:'Escritura',subcategory:'Bolígrafos',childCategory:'Tinta roja',brand:'Gilpao',price:500},
    { id:25,image:nacional,name:'Block de notas pequeño',category:'Papelería Básica',subcategory:'Blocks de notas',childCategory:'Decorados',brand:'Eterna',price:3000}
  ];

  const categoriesBase = [
    {name:"Escolar",subcategories:["Cuadernos","Cartucheras","Mochilas","Tijeras","Reglas","Pegantes"]},
    {name:"Oficina",subcategories:["Archivadores","Carpetas","Grapadoras","Perforadoras","Clips","Notas adhesivas"]},
    {name:"Arte",subcategories:["Pinturas","Pinceles","Lienzos","Blocks de dibujo","Marcadores artísticos","Manualidades"]},
    {name:"Papelería Básica",subcategories:["Hojas blancas","Hojas de colores","Cartulinas","Sobres","Etiquetas","Post-it"]},
    {name:"Escritura",subcategories:["Bolígrafos","Lápices","Portaminas","Marcadores","Resaltadores","Correctores"]}
  ];

  const brands = ['Gilpao','Eterna','Pelikan','Norma','Scribe'];

  const [selectedCategories,setSelectedCategories]=useState([]);
  const [selectedBrands,setSelectedBrands]=useState([]);
  const [currentPage,setCurrentPage]=useState(1);
  const [selectedSort,setSelectedSort]=useState("relevant");
  const [sortOpen,setSortOpen]=useState(false);
  const [categoryOpen,setCategoryOpen]=useState(true);
  const [brandOpen,setBrandOpen]=useState(true);

  const productsPerPage=8;

  const handleCategoryChange = (category) => {
    let updated = [...selectedCategories];

    if (updated.includes(category)) {
      updated = updated.filter(c => c !== category);
    } else {
      updated.push(category);
      const parentCategory = categoriesBase.find(cat =>
        cat.subcategories.includes(category)
      );
      if (parentCategory && !updated.includes(parentCategory.name)) {
        updated.push(parentCategory.name);
      }
    }

    setSelectedCategories(updated);
    setCurrentPage(1);
  };

  const handleBrandChange=(brand)=>{
    const updated=selectedBrands.includes(brand)
      ?selectedBrands.filter(b=>b!==brand)
      :[...selectedBrands,brand];

    setSelectedBrands(updated);
    setCurrentPage(1);
  };

  const filteredProducts = products.filter(product => {
    const mainCategories = selectedCategories.filter(cat =>
      categoriesBase.some(c => c.name === cat)
    );

    const subCategories = selectedCategories.filter(cat =>
      categoriesBase.some(c => c.subcategories.includes(cat))
    );

    const matchMainCategory =
      mainCategories.length === 0 ||
      mainCategories.includes(product.category);

    const matchSubCategory =
      subCategories.length === 0 ||
      subCategories.includes(product.subcategory);

    const matchBrand =
      selectedBrands.length === 0 ||
      selectedBrands.includes(product.brand);

    return matchMainCategory && matchSubCategory && matchBrand;
  });

  const categoriesWithCount = useMemo(()=>{
    return categoriesBase.map(cat=>{
      const catProducts = products.filter(
        p => p.category === cat.name
      );

      const subcategories = cat.subcategories.map(sub=>{
        const subProducts = products.filter(
          p => p.subcategory === sub
        );

        return{
          name: sub,
          count: subProducts.length
        };
      });

      return{
        name: cat.name,
        count: catProducts.length,
        subcategories
      };
    });
  },[products]);

  const sortedProducts=[...filteredProducts].sort((a,b)=>{
    if(selectedSort==="price_high") return b.price-a.price;
    if(selectedSort==="price_low") return a.price-b.price;
    return 0;
  });

  const totalProducts=sortedProducts.length;
  const indexOfLastProduct=currentPage*productsPerPage;
  const indexOfFirstProduct=indexOfLastProduct-productsPerPage;
  const currentProducts=sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const sortOptions=[
    {value:"relevant",label:"Más vendidos"},
    {value:"price_high",label:"Costo: Mayor a menor"},
    {value:"price_low",label:"Costo: Menor a mayor"}
  ];

  return(
    <>
      <ShopHero image={BgTienda} title="Tienda"/>

      <section className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <Filters
            totalProducts={totalProducts}
            categories={categoriesWithCount}
            brands={brands}
            categoryOpen={categoryOpen}
            brandOpen={brandOpen}
            setCategoryOpen={setCategoryOpen}
            setBrandOpen={setBrandOpen}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            handleCategoryChange={handleCategoryChange}
            handleBrandChange={handleBrandChange}
          />

          <div className="flex-1">
            <SortDropdown
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              sortOptions={sortOptions}
            />

            {currentProducts.length === 0 ? (
              <div className="w-full flex justify-center items-center py-20">
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-6 py-5 rounded-lg text-center max-w-md">
                  <h3 className="text-lg font-semibold mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-sm">
                    Intenta cambiar los filtros o seleccionar otra categoría.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    image={product.image}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    productData={product}
                  />
                ))}
              </div>
            )}

            <Pagination
              totalProducts={totalProducts}
              productsPerPage={productsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default Shop;