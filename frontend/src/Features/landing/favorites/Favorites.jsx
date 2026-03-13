import { ShoppingCart, Info, Heart, ChevronDown, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import BgFavoritos from '../../../assets/BgFavoritos.png';
import { useFavorites } from '../../shared/Context/Favoritescontext'; // ← ajusta ruta si es necesario
import { useAlert } from '../../shared/alerts/useAlert';

function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { showConfirm, showSuccess } = useAlert();

  const [ordenar,    setOrdenar]    = useState('A - Z');
  const [searchTerm, setSearchTerm] = useState('');

  const opcionesOrdenar = [
    'A - Z',
    'Z - A',
    'Precio: Menor a Mayor',
    'Precio: Mayor a Menor',
  ];

  // ── Filtrar por búsqueda ────────────────────────────────────────────────────
  const productosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return favorites;
    const q = searchTerm.toLowerCase();
    return favorites.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [favorites, searchTerm]);

  // ── Ordenar ─────────────────────────────────────────────────────────────────
  const productosOrdenados = useMemo(() => {
    const lista = [...productosFiltrados];
    switch (ordenar) {
      case 'A - Z':                  return lista.sort((a,b) => a.name.localeCompare(b.name));
      case 'Z - A':                  return lista.sort((a,b) => b.name.localeCompare(a.name));
      case 'Precio: Menor a Mayor':  return lista.sort((a,b) => a.price - b.price);
      case 'Precio: Mayor a Menor':  return lista.sort((a,b) => b.price - a.price);
      default:                       return lista;
    }
  }, [productosFiltrados, ordenar]);

  // ── Quitar de favoritos con confirmación ────────────────────────────────────
  const handleQuitarFavorito = async (producto) => {
    const result = await showConfirm(
      'warning',
      '¿Quitar de favoritos?',
      `"${producto.name}" será eliminado de tu lista de deseos.`,
      {
        confirmButtonText: 'Sí, quitar',
        cancelButtonText: 'Cancelar',
      }
    );
    if (!result.isConfirmed) return;

    toggleFavorite(producto);
    showSuccess('Eliminado', `"${producto.name}" fue quitado de tu lista de deseos.`);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Barra de búsqueda y ordenar — solo si hay favoritos */}
        {favorites.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">

            {/* Buscador */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar en favoritos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Ordenar */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 whitespace-nowrap">Ordenar por:</span>
              <div className="relative">
                <select
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {opcionesOrdenar.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Contador de resultados al buscar */}
        {searchTerm && favorites.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {productosFiltrados.length === 0 ? (
                <>No se encontraron resultados para "<span className="font-semibold">{searchTerm}</span>"</>
              ) : (
                <>{productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
        )}

        {/* ── Estado vacío: sin favoritos ──────────────────────────────────── */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Tu lista de deseos está vacía</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Agrega productos a tu lista de deseos para encontrarlos fácilmente más tarde
            </p>
            <a
              href="/shop"
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#004D77' }}
            >
              Explorar productos
            </a>
          </div>

        ) : productosOrdenados.length === 0 ? (
          /* ── Sin resultados de búsqueda ──────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Intenta con otro término de búsqueda
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#004D77' }}
            >
              Limpiar búsqueda
            </button>
          </div>

        ) : (
          /* ── Grid de productos favoritos ─────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productosOrdenados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex gap-6">

                    {/* Imagen */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={producto.image}
                          alt={producto.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{producto.name}</h3>
                      <p className="text-xs text-gray-500 mb-3 uppercase">{producto.category}</p>
                      <p className="text-2xl font-bold mb-4" style={{ color: '#004D77' }}>
                        ${producto.price.toLocaleString()}
                      </p>

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

                    {/* Divisor */}
                    <div className="w-px bg-gray-200" />

                    {/* Botón quitar favorito */}
                    <div className="flex-shrink-0 flex items-center">
                      <button
                        onClick={() => handleQuitarFavorito(producto)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Quitar de favoritos"
                      >
                        <Heart
                          className="w-7 h-7"
                          style={{
                            color: '#004D77',
                            fill: isFavorite(producto.id) ? '#004D77' : 'none',
                            strokeWidth: 2,
                          }}
                        />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;