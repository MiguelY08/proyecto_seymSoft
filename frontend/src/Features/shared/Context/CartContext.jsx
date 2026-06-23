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

const GUEST_CART_KEY = 'cart';
const CartContext = createContext();

const readGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al cargar carrito del visitante:', error);
    return [];
  }
};

const writeGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const clampQuantity = (product, quantity) => {
  const requested = Math.max(1, Number(quantity) || 1);
  const stock = Number(product.totalStock ?? product.stock ?? 0);
  return stock > 0 ? Math.min(requested, stock) : requested;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { client, loading: authLoading } = useAuth();
  const clientId = client?.idClient ?? null;
  const [cartItems, setCartItems] = useState(readGuestCart);
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
      setCartItems(readGuestCart());
      setLoading(false);
      setError(null);
      return undefined;
    }

    if (activeClientRef.current !== clientId) {
      activeClientRef.current = clientId;
      setCartItems([]);
    }

    let active = true;
    const synchronize = async () => {
      setLoading(true);
      setError(null);

      if (synchronizationRef.current?.clientId !== clientId) {
        const guestCart = readGuestCart();
        if (guestCart.length) {
          localStorage.removeItem(GUEST_CART_KEY);
        }

        const promise = (async () => {
          try {
            return guestCart.length
              ? await storefrontService.mergeCart(guestCart)
              : await storefrontService.getCart();
          } catch (syncError) {
            if (guestCart.length && !localStorage.getItem(GUEST_CART_KEY)) {
              writeGuestCart(guestCart);
            }
            throw syncError;
          }
        })();

        synchronizationRef.current = { clientId, promise };
      }

      try {
        const remoteCart = await synchronizationRef.current.promise;
        if (active && version === requestVersion.current) {
          setCartItems(remoteCart);
        }
      } catch (syncError) {
        if (active && version === requestVersion.current) {
          setError(
            syncError?.response?.data?.message ||
            'No fue posible sincronizar el carrito.',
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
  }, [authLoading, clientId]);

  useEffect(() => {
    if (clientId) return undefined;

    const synchronizeGuestCart = (event) => {
      if (event.key === GUEST_CART_KEY) {
        setCartItems(readGuestCart());
      }
    };

    window.addEventListener('storage', synchronizeGuestCart);
    return () => window.removeEventListener('storage', synchronizeGuestCart);
  }, [clientId]);

  const commitCartItem = useCallback((productId, quantity, previousItems) => {
    storefrontService.setCartItem(productId, quantity).catch((requestError) => {
      setCartItems(previousItems);
      setError(
        requestError?.response?.data?.message ||
        'No fue posible actualizar el carrito.',
      );
    });
  }, []);

  const updateItems = useCallback(
    (updater, remoteChange) => {
      setCartItems((previousItems) => {
        const nextItems = updater(previousItems);
        setError(null);

        if (!clientId) {
          writeGuestCart(nextItems);
        } else if (clientId) {
          remoteChange?.(nextItems, previousItems);
        }

        return nextItems;
      });
    },
    [clientId],
  );

  const addToCart = useCallback((product, quantity = 1) => {
    updateItems(
      (previousItems) => {
        const existing = previousItems.find((item) => item.id === product.id);
        const nextQuantity = clampQuantity(
          product,
          (existing?.quantity || 0) + Math.max(1, Number(quantity) || 1),
        );

        return existing
          ? previousItems.map((item) => (
              item.id === product.id
                ? { ...item, ...product, quantity: nextQuantity }
                : item
            ))
          : [...previousItems, { ...product, quantity: nextQuantity }];
      },
      (nextItems, previousItems) => {
        const item = nextItems.find((entry) => entry.id === product.id);
        commitCartItem(product.id, item.quantity, previousItems);
      },
    );
    return true;
  }, [commitCartItem, updateItems]);

  const updateQuantity = useCallback((productId, newQuantity) => {
    updateItems(
      (previousItems) => previousItems.map((item) => (
        item.id === productId
          ? { ...item, quantity: clampQuantity(item, newQuantity) }
          : item
      )),
      (nextItems, previousItems) => {
        const item = nextItems.find((entry) => entry.id === productId);
        if (item) commitCartItem(productId, item.quantity, previousItems);
      },
    );
  }, [commitCartItem, updateItems]);

  const increaseQuantity = useCallback((productId) => {
    const item = cartItems.find((entry) => entry.id === productId);
    if (item) updateQuantity(productId, item.quantity + 1);
  }, [cartItems, updateQuantity]);

  const decreaseQuantity = useCallback((productId) => {
    const item = cartItems.find((entry) => entry.id === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    }
  }, [cartItems, updateQuantity]);

  const removeFromCart = useCallback((productId) => {
    updateItems(
      (previousItems) => previousItems.filter((item) => item.id !== productId),
      (_nextItems, previousItems) => {
        storefrontService.removeCartItem(productId).catch((requestError) => {
          setCartItems(previousItems);
          setError(
            requestError?.response?.data?.message ||
            'No fue posible eliminar el producto del carrito.',
          );
        });
      },
    );
  }, [updateItems]);

  const clearCart = useCallback(async () => {
    const previousItems = cartItems;
    setCartItems([]);
    setError(null);

    if (!clientId) {
      writeGuestCart([]);
      return true;
    }

    try {
      await storefrontService.clearCart();
      return true;
    } catch (requestError) {
      setCartItems(previousItems);
      setError(
        requestError?.response?.data?.message ||
        'No fue posible vaciar el carrito.',
      );
      return false;
    }
  }, [cartItems, clientId]);

  const getSubtotal = () => cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0,
  );
  const getTotalItems = () => cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart: (productId) => cartItems.some((item) => item.id === productId),
    getItemQuantity: (productId) => (
      cartItems.find((item) => item.id === productId)?.quantity || 0
    ),
    getSubtotal,
    getTotalItems,
    getTax: () => getSubtotal() * 0.19,
    getTotal: () => getSubtotal() * 1.19,
    cartCount: getTotalItems(),
    loading,
    error,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
