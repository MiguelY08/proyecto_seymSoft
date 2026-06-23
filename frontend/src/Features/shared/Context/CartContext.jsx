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

const LEGACY_GUEST_CART_KEY = 'cart';
const GUEST_CART_KEY = 'cart:guest';
const USER_CART_PREFIX = 'cart:user:';
const CartContext = createContext();

const normalizeItems = (items) => (
  Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
    : []
);

const readStoredCart = (key) => {
  if (!key) return [];

  try {
    if (key === GUEST_CART_KEY && !localStorage.getItem(GUEST_CART_KEY)) {
      const legacyCart = localStorage.getItem(LEGACY_GUEST_CART_KEY);
      if (legacyCart) {
        localStorage.setItem(GUEST_CART_KEY, legacyCart);
        localStorage.removeItem(LEGACY_GUEST_CART_KEY);
      }
    }

    return normalizeItems(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch (error) {
    console.error('Error al cargar el carrito local:', error);
    return [];
  }
};

const writeStoredCart = (key, items) => {
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(normalizeItems(items)));
};

const mergeLocalCarts = (firstCart, secondCart) => {
  const merged = new Map();

  [...normalizeItems(firstCart), ...normalizeItems(secondCart)].forEach((item) => {
    const productId = item.id;
    const current = merged.get(String(productId));

    merged.set(
      String(productId),
      current
        ? { ...current, quantity: current.quantity + item.quantity }
        : item,
    );
  });

  return [...merged.values()];
};

const claimGuestCart = (userCartKey) => {
  if (!userCartKey) return [];

  const userCart = readStoredCart(userCartKey);
  const guestCart = readStoredCart(GUEST_CART_KEY);
  if (!guestCart.length) return userCart;

  const mergedCart = mergeLocalCarts(userCart, guestCart);
  writeStoredCart(userCartKey, mergedCart);
  localStorage.removeItem(GUEST_CART_KEY);
  return mergedCart;
};

const getUserIdentity = (user) => (
  user?.idUser
  ?? user?.id_user
  ?? user?.id
  ?? user?.email?.trim().toLowerCase()
  ?? null
);

const getClientId = (client) => (
  client?.idClient ?? client?.id_client ?? client?.id ?? null
);

const clampQuantity = (product, quantity) => {
  const requested = Math.max(1, Number(quantity) || 1);
  const stock = Number(product.totalStock ?? product.stock ?? 0);
  return stock > 0 ? Math.min(requested, stock) : requested;
};

// Se conserva esta exportación por compatibilidad con los consumidores actuales.
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const {
    client,
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const clientId = getClientId(client);
  const userIdentity = getUserIdentity(user);
  const userCartKey = userIdentity ? `${USER_CART_PREFIX}${userIdentity}` : null;
  const localCartKey = isAuthenticated ? userCartKey : GUEST_CART_KEY;
  const cartIdentity = clientId
    ? `client:${clientId}`
    : isAuthenticated
      ? `user:${userIdentity ?? 'unresolved'}`
      : 'guest';

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestVersion = useRef(0);
  const synchronizationRef = useRef(null);
  const activeIdentityRef = useRef(cartIdentity);

  useEffect(() => {
    if (authLoading) return undefined;

    const version = ++requestVersion.current;
    activeIdentityRef.current = cartIdentity;
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;

      setCartItems([]);
      setError(null);

      if (!clientId) {
        synchronizationRef.current = null;
        const localItems = isAuthenticated
          ? claimGuestCart(userCartKey)
          : readStoredCart(GUEST_CART_KEY);
        setCartItems(localItems);
        setLoading(false);
        return;
      }

      setLoading(true);
      const pendingCart = claimGuestCart(userCartKey);

      if (synchronizationRef.current?.identity !== cartIdentity) {
        synchronizationRef.current = {
          identity: cartIdentity,
          pendingCart,
          promise: pendingCart.length
            ? storefrontService.mergeCart(pendingCart)
            : storefrontService.getCart(),
        };
      }

      const synchronization = synchronizationRef.current;
      synchronization.promise
        .then((remoteCart) => {
          if (!active || version !== requestVersion.current) return;
          setCartItems(normalizeItems(remoteCart));
          if (userCartKey) localStorage.removeItem(userCartKey);
        })
        .catch((syncError) => {
          if (!active || version !== requestVersion.current) return;
          setCartItems(synchronization.pendingCart);
          setError(
            syncError?.response?.data?.message
            || 'No fue posible sincronizar el carrito.',
          );
        })
        .finally(() => {
          if (active && version === requestVersion.current) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    authLoading,
    cartIdentity,
    clientId,
    isAuthenticated,
    userCartKey,
  ]);

  useEffect(() => {
    if (clientId || !localCartKey) return undefined;

    const synchronizeLocalCart = (event) => {
      if (event.key === localCartKey) {
        setCartItems(readStoredCart(localCartKey));
      }
    };

    window.addEventListener('storage', synchronizeLocalCart);
    return () => window.removeEventListener('storage', synchronizeLocalCart);
  }, [clientId, localCartKey]);

  const commitCartItem = useCallback((
    productId,
    quantity,
    previousItems,
  ) => {
    const requestedIdentity = cartIdentity;

    storefrontService.setCartItem(productId, quantity).catch((requestError) => {
      if (activeIdentityRef.current !== requestedIdentity) return;

      setCartItems(previousItems);
      setError(
        requestError?.response?.data?.message
        || 'No fue posible actualizar el carrito.',
      );
    });
  }, [cartIdentity]);

  const updateItems = useCallback(
    (updater, remoteChange) => {
      setCartItems((previousItems) => {
        const nextItems = updater(previousItems);
        setError(null);

        if (!clientId) {
          writeStoredCart(localCartKey, nextItems);
        } else {
          remoteChange?.(nextItems, previousItems);
        }

        return nextItems;
      });
    },
    [clientId, localCartKey],
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
    const requestedIdentity = cartIdentity;

    updateItems(
      (previousItems) => previousItems.filter((item) => item.id !== productId),
      (_nextItems, previousItems) => {
        storefrontService.removeCartItem(productId).catch((requestError) => {
          if (activeIdentityRef.current !== requestedIdentity) return;

          setCartItems(previousItems);
          setError(
            requestError?.response?.data?.message
            || 'No fue posible eliminar el producto del carrito.',
          );
        });
      },
    );
  }, [cartIdentity, updateItems]);

  const clearCart = useCallback(async () => {
    const previousItems = cartItems;
    const requestedIdentity = cartIdentity;
    setCartItems([]);
    setError(null);

    if (!clientId) {
      writeStoredCart(localCartKey, []);
      return true;
    }

    try {
      await storefrontService.clearCart();
      return true;
    } catch (requestError) {
      if (activeIdentityRef.current === requestedIdentity) {
        setCartItems(previousItems);
        setError(
          requestError?.response?.data?.message
          || 'No fue posible vaciar el carrito.',
        );
      }
      return false;
    }
  }, [cartIdentity, cartItems, clientId, localCartKey]);

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
    loading: loading || authLoading,
    error,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
