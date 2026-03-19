import { createContext, useContext, useState, useCallback } from 'react';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (product) => {
      const alreadyFav = favorites.some((p) => p.id === product.id);
      if (alreadyFav) {
        setFavorites((prev) => prev.filter((p) => p.id !== product.id));
        return false; // fue eliminado
      } else {
        setFavorites((prev) => [...prev, product]);
        return true;  // fue agregado
      }
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