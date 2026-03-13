import { createContext, useContext, useState, useCallback } from 'react';

// ─── Contexto ─────────────────────────────────────────────────────────────────
const FavoritesContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  /**
   * toggleFavorite(product)
   * - Si ya está en favoritos: lo quita y devuelve false
   * - Si no está: lo agrega y devuelve true
   * Retorna un booleano para que el componente sepa qué pasó
   * y pueda mostrar la alerta correcta.
   */
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

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  }
  return ctx;
}