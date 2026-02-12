import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Briefcase, ClipboardPen, FileText, Palette } from 'lucide-react';

import Header from '../../layouts/Header.jsx';
import Footer from '../../layouts/Footer.jsx';

import img01 from '../../../assets/carrusel/01.png';
import img02 from '../../../assets/carrusel/02.png';
import img03 from '../../../assets/carrusel/03.png';

import ProductCard from '../../layouts/ProductCard.jsx';
import nacional from '../../../assets/products/atlNacional.png';
import mayoristaBg from '../../../assets/mayoristasBg.png';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, image: img01, alt: 'Promoción 1' },
    { id: 2, image: img02, alt: 'Promoción 2' },
    { id: 3, image: img03, alt: 'Promoción 3' },
  ];

  const categories = [
    { id: 1, name: 'ESCOLAR',          icon: ShoppingBag,  href: '/categoria/escolar'         },
    { id: 2, name: 'OFICINA',          icon: Briefcase,    href: '/categoria/oficina'          },
    { id: 3, name: 'ESCRITURA',        icon: ClipboardPen, href: '/categoria/escritura'        },
    { id: 4, name: 'PAPELERÍA BÁSICA', icon: FileText,     href: '/categoria/papeleria-basica' },
    { id: 5, name: 'ARTE',             icon: Palette,      href: '/categoria/arte'             },
  ];

  const products = [
    { id: 1, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 2, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 3, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 4, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 5, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 6, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 7, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
    { id: 8, image: nacional, name: 'Atletico Nacional', category: 'MEJOR DE COLOMBIA', price: 1000000 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <>
      <Header />

      {/* Sección Carrusel */}
      <section className="w-full flex items-center justify-center py-2 sm:py-4">
        <div className="w-full sm:w-[98%] lg:w-[95%] h-auto lg:h-[80vh] relative overflow-hidden rounded-none sm:rounded-lg lg:rounded-2xl shadow-2xl">
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute w-full h-full transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110" style={{ backgroundImage: `url(${slide.image})` }} />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative w-full h-full flex items-center justify-center p-0 sm:p-2 lg:p-4">
                  <img src={slide.image} alt={slide.alt} className="w-full lg:max-w-full h-auto lg:max-h-full object-contain relative z-10" />
                </div>
              </div>
            ))}
          </div>

          <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer group z-20">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" strokeWidth={3} />
          </button>
          <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer group z-20">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" strokeWidth={3} />
          </button>

          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full z-20">
            <div className="flex gap-1.5 sm:gap-2">
              {slides.map((_, index) => (
                <button key={index} onClick={() => goToSlide(index)} className={`transition-all duration-300 rounded-full cursor-pointer ${index === currentSlide ? 'w-4 sm:w-6 h-1.5 sm:h-2 bg-white' : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/75'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección Categorías */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <h2 className="text-2xl sm:text-3xl font-serif italic font-semibold text-blue-900 tracking-tight text-center mb-6 sm:mb-8">
          Categorías
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer group sm:aspect-square p-4 lg:p-6"
            >
              <category.icon className="w-10 h-10 lg:w-14 lg:h-14 text-blue-700 group-hover:scale-110 transition-transform duration-300 shrink-0" strokeWidth={1.5} />
              <span className="text-sm sm:text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wide sm:text-center leading-tight">
                {category.name}
              </span>
            </a>
          ))}
        </div>

        <div className="flex justify-center mt-6 sm:mt-8">
          <a href="/categorias" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-full transition-colors duration-200 cursor-pointer">
            Ver más categorías
          </a>
        </div>

        <div className="h-px bg-gray-200 mt-8 sm:mt-10" />
      </section>

      {/* Sección Nuestros Productos */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif italic font-semibold text-blue-900 tracking-tight">
            Nuestros productos
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
            Encuentra los productos ideales para ti en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              category={product.category}
              price={product.price}
              onAddToCart={() => console.log(`Añadido al carrito: ${product.name}`)}
              onAddToFavorites={() => console.log(`Añadido a favoritos: ${product.name}`)}
            />
          ))}
        </div>

        <div className="flex justify-center mt-6 sm:mt-8">
          <a href="/tienda" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-full transition-colors duration-200 cursor-pointer">
            Ver más productos
          </a>
        </div>

        <div className="h-px bg-gray-200 mt-8 sm:mt-10" />
      </section>

      {/* Sección Mayoristas */}
      <section className="w-full flex items-center justify-center py-2 sm:py-6">
        <div className="w-full sm:w-[98%] lg:w-[95%] h-[50vh] sm:h-[60vh] lg:h-[90vh] relative overflow-hidden rounded-none sm:rounded-lg lg:rounded-2xl">
          
          {/* Imagen de fondo */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${mayoristaBg})` }}
          />

          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-blue-950/75" />

          {/* Contenido */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 sm:px-8 text-center gap-4 sm:gap-6">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
              ¿Eres mayorista?
            </h2>

            <p className="text-sm sm:text-base lg:text-xl text-gray-200 max-w-xl">
              Comunícate con nosotros y con gusto te atenderemos
            </p>

            <div className="w-24 sm:w-32 h-px bg-white/60 my-1 sm:my-2" />

            <a
              href="https://wa.me/573002936722"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-8 sm:px-10 py-2.5 sm:py-3 border-2 border-white text-white text-xs sm:text-sm font-semibold uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-all duration-300 cursor-pointer rounded-sm"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;