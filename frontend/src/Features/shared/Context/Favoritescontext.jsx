import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (!storedFavorites) return [];

    try {
      return JSON.parse(storedFavorites);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (product) => {
      const alreadyFav = favorites.some((p) => p.id === product.id);
      setFavorites((prev) =>
        alreadyFav
          ? prev.filter((p) => p.id !== product.id)
          : [...prev, product]
      );
      return !alreadyFav;
    },
    [favorites]
  );

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, favoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  }
  return ctx;
}
