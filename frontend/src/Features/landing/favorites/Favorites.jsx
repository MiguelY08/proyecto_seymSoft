import { ShoppingCart, Info, Heart, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import BgFavoritos from '../../../assets/BgFavoritos.png';
import corrector from '../../../assets/products/correctorencinta.png';
import cuaderno from '../../../assets/products/cuadernoprimaverax100h.png';
import notebookAndPen from '../../../assets/products/notebookAndPen.png';
import sharpie from '../../../assets/products/setsharpiex30.png';
import sewingmachine from '../../../assets/products/sewingmachine.png';
import tijeras from '../../../assets/products/tijeraspuntaroma.png';

function Favorites() {
  const [ordenar, setOrdenar] = useState('A - Z');

  const productosFavoritos = [
    {
      id: 1,
      nombre: 'LIBRETA CON LAPICERO',
      categorias: 'LIBRETAS, OFICINA, ESCUELA',
      precio: 5000,
      imagen: notebookAndPen,
      enFavoritos: true
    },
    {
      id: 2,
      nombre: 'SET SHARPIE X30',
      categorias: 'ESCOLAR, ARTE',
      precio: 120000,
      imagen: sharpie,
      enFavoritos: true
    },
    {
      id: 3,
      nombre: 'COSEDORA XINGLI XL207 Y',
      categorias: 'OFICINA, ESCOLAR',
      precio: 5000,
      imagen: sewingmachine,
      enFavoritos: true
    },
    {
      id: 4,
      nombre: 'CORRECTOR EN CINTA',
      categorias: 'ESCOLAR, OFICINA',
      precio: 4000,
      imagen: corrector,
      enFavoritos: true
    },
    {
      id: 5,
      nombre: 'CUADERNO PRIMAVERA X100N',
      categorias: 'ESCOLAR, LIBRETAS',
      precio: 8000,
      imagen: cuaderno,
      enFavoritos: true
    },
    {
      id: 6,
      nombre: 'TIJERAS PUNTO ROMA',
      categorias: 'OFICINA, ESCOLAR',
      precio: 6500,
      imagen: tijeras,
      enFavoritos: true
    }
  ];

  const opcionesOrdenar = ['A - Z', 'Z - A', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'];

  const productosOrdenados = useMemo(() => {
    let productos = [...productosFavoritos];
    switch (ordenar) {
      case 'A - Z':
        return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'Z - A':
        return productos.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'Precio: Menor a Mayor':
        return productos.sort((a, b) => a.precio - b.precio);
      case 'Precio: Mayor a Menor':
        return productos.sort((a, b) => b.precio - a.precio);
      default:
        return productos;
    }
  }, [ordenar]);

  const handleToggleFavorito = (productoId) => {
    console.log('Toggle favorito:', productoId);
  };

  const handleAgregarAlCarrito = (productoId) => {
    console.log('Agregar al carrito:', productoId);
  };

  const handleVerDetalles = (productoId) => {
    console.log('Ver detalles:', productoId);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full h-[15vh] sm:h-[18vh] lg:h-[22vh] relative overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BgFavoritos})` }}
          />
          <div className="absolute inset-0 bg-blue-950/75" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white">
              Lista de deseos
            </h2>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ordenar */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Ordenar por:</span>
            <div className="relative">
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {opcionesOrdenar.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productosOrdenados.map((producto) => (
            <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{producto.nombre}</h3>
                    <p className="text-xs text-gray-500 mb-3 uppercase">{producto.categorias}</p>
                    <p className="text-2xl font-bold mb-4" style={{ color: '#004D77' }}>
                      ${producto.precio.toLocaleString()}
                    </p>

                    {/* Botones */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAgregarAlCarrito(producto.id)}
                        className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        style={{ borderColor: '#004D77', color: '#004D77' }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Añadir al carrito
                      </button>

                      <button
                        onClick={() => handleVerDetalles(producto.id)}
                        className="w-10 h-10 border-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#004D77' }}
                      >
                        <Info className="w-5 h-5" style={{ color: '#004D77' }} />
                      </button>
                    </div>
                  </div>

                  {/* Línea divisoria vertical */}
                  <div className="w-px bg-gray-200"></div>

                  {/* Botón de favorito */}
                  <div className="flex-shrink-0 flex items-center">
                    <button
                      onClick={() => handleToggleFavorito(producto.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Heart
                        className="w-7 h-7"
                        style={{
                          color: '#004D77',
                          fill: producto.enFavoritos ? '#004D77' : 'none',
                          strokeWidth: 2
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Favorites;