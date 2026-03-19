import { ShoppingCart, Info, Heart, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import BgFavoritos from '../../../assets/BgFavoritos.png';
import corrector from '../../../assets/products/correctorencinta.png';
import cuaderno from '../../../assets/products/cuadernoprimaverax100h.png';
import notebookAndPen from '../../../assets/products/notebookAndPen.png';
import sharpie from '../../../assets/products/setsharpiex30.png';
import sewingmachine from '../../../assets/products/sewingmachine.png';
import tijeras from '../../../assets/products/tijeraspuntaroma.png';
import { useFavorites } from '../../shared/Context/Favoritescontext';
import { useCart } from '../../shared/Context/Cartcontext';
import { useAlert } from '../../shared/alerts/useAlert';

function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showSuccess, showConfirm } = useAlert();
  const [ordenar, setOrdenar] = useState('A - Z');

  const opcionesOrdenar = ['A - Z', 'Z - A', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'];

  const productosOrdenados = useMemo(() => {
    let productos = [...favorites];
    switch (ordenar) {
      case 'A - Z':
        return productos.sort((a, b) => a.name.localeCompare(b.name));
      case 'Z - A':
        return productos.sort((a, b) => b.name.localeCompare(a.name));
      case 'Precio: Menor a Mayor':
        return productos.sort((a, b) => a.price - b.price);
      case 'Precio: Mayor a Menor':
        return productos.sort((a, b) => b.price - a.price);
      default:
        return productos;
    }
  }, [ordenar, favorites]);

  const handleToggleFavorito = async (producto) => {
    const result = await showConfirm(
      'warning',
      '¿Quitar de favoritos?',
      `¿Estás seguro de eliminar "${producto.name}" de tu lista de deseos?`
    );

    if (result.isConfirmed) {
      toggleFavorite(producto);
      showSuccess('Eliminado', 'El producto fue eliminado de tu lista de deseos.');
    }
  };

  const handleAgregarAlCarrito = (producto) => {
    addToCart(producto, 1);
    showSuccess('Añadido al carrito', `${producto.name} se ha agregado al carrito.`);
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
                        src={producto.image}
                        alt={producto.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{producto.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 uppercase">{producto.category}</p>
                    <p className="text-2xl font-bold mb-4" style={{ color: '#004D77' }}>
                      ${producto.price.toLocaleString()}
                    </p>

                    {/* Botones */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAgregarAlCarrito(producto)}
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
                      onClick={() => handleToggleFavorito(producto)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Heart
                        className="w-7 h-7"
                        style={{
                          color: '#004D77',
                          fill: isFavorite(producto.id) ? '#004D77' : 'none',
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