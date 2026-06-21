import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../../access/context/AuthContext';
import storefrontService from '../services/storefrontService';

const GUEST_FAVORITES_KEY = 'favorites';
const FavoritesContext = createContext(null);

const readGuestFavorites = () => {
  try {
    const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al cargar favoritos del visitante:', error);
    return [];
  }
};

const writeGuestFavorites = (favorites) => {
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
};

export function FavoritesProvider({ children }) {
  const { client, isAuthenticated, loading: authLoading } = useAuth();
  const clientId = client?.idClient ?? null;
  const [favorites, setFavorites] = useState(readGuestFavorites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestVersion = useRef(0);
  const synchronizationRef = useRef(null);
  const activeClientRef = useRef(null);

  useEffect(() => {
    if (authLoading) return undefined;

    const version = ++requestVersion.current;

    if (!clientId) {
      synchronizationRef.current = null;
      activeClientRef.current = null;
      setFavorites(isAuthenticated ? [] : readGuestFavorites());
      setLoading(false);
      setError(null);
      return undefined;
    }

    if (activeClientRef.current !== clientId) {
      activeClientRef.current = clientId;
      setFavorites([]);
    }

    let active = true;
    const synchronize = async () => {
      setLoading(true);
      setError(null);

      if (synchronizationRef.current?.clientId !== clientId) {
        const guestFavorites = readGuestFavorites();
        if (guestFavorites.length) {
          localStorage.removeItem(GUEST_FAVORITES_KEY);
        }

        const promise = (async () => {
          try {
            if (guestFavorites.length) {
              await Promise.all(
                guestFavorites
                  .filter((product) => Number(product?.id) > 0)
                  .map((product) => storefrontService.addFavorite(product.id)),
              );
            }
            return await storefrontService.getFavorites();
          } catch (syncError) {
            if (
              guestFavorites.length &&
              !localStorage.getItem(GUEST_FAVORITES_KEY)
            ) {
              writeGuestFavorites(guestFavorites);
            }
            throw syncError;
          }
        })();

        synchronizationRef.current = { clientId, promise };
      }

      try {
        const remoteFavorites = await synchronizationRef.current.promise;
        if (active && version === requestVersion.current) {
          setFavorites(remoteFavorites);
        }
      } catch (syncError) {
        if (active && version === requestVersion.current) {
          setError(
            syncError?.response?.data?.message ||
            'No fue posible sincronizar los favoritos.',
          );
        }
      } finally {
        if (active && version === requestVersion.current) {
          setLoading(false);
        }
      }
    };

    synchronize();
    return () => {
      active = false;
    };
  }, [authLoading, clientId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated || clientId) return undefined;

    const synchronizeGuestFavorites = (event) => {
      if (event.key === GUEST_FAVORITES_KEY) {
        setFavorites(readGuestFavorites());
      }
    };

    window.addEventListener('storage', synchronizeGuestFavorites);
    return () => window.removeEventListener('storage', synchronizeGuestFavorites);
  }, [clientId, isAuthenticated]);

  const isFavorite = useCallback(
    (productId) => favorites.some((product) => product.id === productId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (product) => {
      const alreadyFavorite = favorites.some((item) => item.id === product.id);
      const nextFavorites = alreadyFavorite
        ? favorites.filter((item) => item.id !== product.id)
        : [...favorites, product];

      setFavorites(nextFavorites);
      setError(null);

      if (!isAuthenticated) {
        writeGuestFavorites(nextFavorites);
      } else if (clientId) {
        const request = alreadyFavorite
          ? storefrontService.removeFavorite(product.id)
          : storefrontService.addFavorite(product.id);

        request.catch((requestError) => {
          setFavorites(favorites);
          setError(
            requestError?.response?.data?.message ||
            'No fue posible actualizar los favoritos.',
          );
        });
      }

      return !alreadyFavorite;
    },
    [clientId, favorites, isAuthenticated],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
        loading,
        error,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  }
  return context;
}
