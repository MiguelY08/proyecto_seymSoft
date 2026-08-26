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

const getProductStock = (product) => {
  const stock = Number(product?.totalStock ?? product?.stock ?? 0);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};

const clampQuantity = (product, quantity) => {
  const requested = Math.max(1, Number(quantity) || 1);
  return Math.min(requested, getProductStock(product));
};

const getCartItemKey = (productId) => String(productId);

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
  const cartItemRequestVersions = useRef(new Map());
  const cartItemUpdateQueues = useRef(new Map());
  const cartItemsRef = useRef([]);

  const replaceCartItems = useCallback((items) => {
    const normalizedItems = normalizeItems(items);
    cartItemsRef.current = normalizedItems;
    setCartItems(normalizedItems);
  }, []);

  const invalidatePendingCartLoad = useCallback(() => {
    requestVersion.current += 1;
    synchronizationRef.current = null;
    setLoading(false);
  }, []);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    if (authLoading) return undefined;

    const version = ++requestVersion.current;
    activeIdentityRef.current = cartIdentity;
    cartItemRequestVersions.current.clear();
    cartItemUpdateQueues.current.clear();
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;

      setError(null);

      if (!clientId) {
        synchronizationRef.current = null;
        const localItems = isAuthenticated
          ? claimGuestCart(userCartKey)
          : readStoredCart(GUEST_CART_KEY);
        replaceCartItems(localItems);
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
        .then((cartResponse) => {
          if (!active || version !== requestVersion.current) return;
          replaceCartItems(cartResponse?.items);
          if (userCartKey) localStorage.removeItem(userCartKey);
        })
        .catch((syncError) => {
          if (!active || version !== requestVersion.current) return;
          replaceCartItems(synchronization.pendingCart);
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
    replaceCartItems,
    userCartKey,
  ]);

  useEffect(() => {
    if (clientId || !localCartKey) return undefined;

    const synchronizeLocalCart = (event) => {
      if (event.key === localCartKey) {
        replaceCartItems(readStoredCart(localCartKey));
      }
    };

    window.addEventListener('storage', synchronizeLocalCart);
    return () => window.removeEventListener('storage', synchronizeLocalCart);
  }, [clientId, localCartKey, replaceCartItems]);

  const updateItems = useCallback(
    (updater, remoteChange) => {
      const previousItems = cartItemsRef.current;
      const nextItems = normalizeItems(updater(previousItems));
      invalidatePendingCartLoad();
      setError(null);
      replaceCartItems(nextItems);

      if (!clientId) {
        writeStoredCart(localCartKey, nextItems);
      } else {
        remoteChange?.(nextItems, previousItems);
      }
    },
    [clientId, invalidatePendingCartLoad, localCartKey, replaceCartItems],
  );

  const createCartItemRequest = useCallback((productId) => {
    const key = getCartItemKey(productId);
    const version = (cartItemRequestVersions.current.get(key) || 0) + 1;
    cartItemRequestVersions.current.set(key, version);
    return { key, version };
  }, []);

  const isLatestCartItemRequest = useCallback(
    (request, requestedIdentity) => (
      activeIdentityRef.current === requestedIdentity
      && cartItemRequestVersions.current.get(request.key) === request.version
    ),
    [],
  );

  const mergeCartItemFromResponse = useCallback((productId, items) => {
    const serverItem = items?.find((item) => item.id === productId);
    if (!serverItem) {
      replaceCartItems(
        cartItemsRef.current.filter((item) => item.id !== productId),
      );
      return;
    }

    replaceCartItems(cartItemsRef.current.map((item) => (
      item.id === productId ? { ...item, ...serverItem } : item
    )));
  }, [replaceCartItems]);

  const restoreCartItemFromServer = useCallback(async (productId) => {
    try {
      const cartResponse = await storefrontService.getCart();
      mergeCartItemFromResponse(productId, cartResponse?.items);
    } catch (syncError) {
      setError(
        syncError?.response?.data?.message
        || 'No fue posible sincronizar el carrito.',
      );
    }
  }, [mergeCartItemFromResponse]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const requestedQuantity = Math.max(1, Number(quantity) || 1);

    if (getProductStock(product) <= 0) return false;

    if (!clientId) {
      updateItems((previousItems) => {
        const existing = previousItems.find((item) => item.id === product.id);
        const nextQuantity = clampQuantity(
          product,
          (existing?.quantity || 0) + requestedQuantity,
        );

        return existing
          ? previousItems.map((item) => (
              item.id === product.id
                ? { ...item, ...product, quantity: nextQuantity }
                : item
            ))
          : [...previousItems, { ...product, quantity: nextQuantity }];
      });
      return true;
    }

    const requestedIdentity = cartIdentity;
    const cartItemRequest = createCartItemRequest(product.id);
    const previousItems = cartItemsRef.current;
    const existing = previousItems.find((item) => item.id === product.id);
    const nextQuantity = clampQuantity(
      product,
      (existing?.quantity || 0) + requestedQuantity,
    );
    const nextItems = existing
      ? previousItems.map((item) => (
          item.id === product.id
            ? { ...item, ...product, quantity: nextQuantity }
            : item
        ))
      : [...previousItems, { ...product, quantity: nextQuantity }];

    try {
      invalidatePendingCartLoad();
      setError(null);
      replaceCartItems(nextItems);
      const cartResponse = await storefrontService.setCartItem(
        product.id,
        nextQuantity,
      );

      if (!isLatestCartItemRequest(cartItemRequest, requestedIdentity)) return false;

      replaceCartItems(cartResponse?.items);
      return true;
    } catch (requestError) {
      if (isLatestCartItemRequest(cartItemRequest, requestedIdentity)) {
        replaceCartItems(previousItems);
        setError(
          requestError?.response?.data?.message
          || 'No fue posible actualizar el carrito.',
        );
      }
      return false;
    }
  }, [
    cartIdentity,
    clientId,
    createCartItemRequest,
    invalidatePendingCartLoad,
    isLatestCartItemRequest,
    replaceCartItems,
    updateItems,
  ]);

  const updateQuantity = useCallback((productId, newQuantity) => {
    const previousItems = cartItemsRef.current;
    const currentItem = previousItems.find((item) => item.id === productId);
    if (!currentItem || getProductStock(currentItem) <= 0) return false;

    const nextItems = normalizeItems(previousItems.map((item) => (
      item.id === productId
        ? { ...item, quantity: clampQuantity(item, newQuantity) }
        : item
    )));
    const item = nextItems.find((entry) => entry.id === productId);
    if (!item) return false;

    invalidatePendingCartLoad();
    setError(null);
    replaceCartItems(nextItems);

    if (!clientId) {
      writeStoredCart(localCartKey, nextItems);
      return true;
    }

    const requestedIdentity = cartIdentity;
    const cartItemRequest = createCartItemRequest(productId);
    const queueKey = getCartItemKey(productId);
    const previousRequest = cartItemUpdateQueues.current.get(queueKey) || Promise.resolve();
    const queuedRequest = previousRequest
      .catch(() => undefined)
      .then(() => storefrontService.setCartItem(productId, item.quantity));

    cartItemUpdateQueues.current.set(queueKey, queuedRequest);

    queuedRequest
      .then((cartResponse) => {
        if (!isLatestCartItemRequest(cartItemRequest, requestedIdentity)) return;
        mergeCartItemFromResponse(productId, cartResponse?.items);
      })
      .catch((requestError) => {
        if (!isLatestCartItemRequest(cartItemRequest, requestedIdentity)) return;

        setError(
          requestError?.response?.data?.message
          || 'No fue posible actualizar el carrito.',
        );
        restoreCartItemFromServer(productId);
      })
      .finally(() => {
        if (cartItemUpdateQueues.current.get(queueKey) === queuedRequest) {
          cartItemUpdateQueues.current.delete(queueKey);
        }
      });
    return true;
  }, [
    cartIdentity,
    clientId,
    createCartItemRequest,
    invalidatePendingCartLoad,
    isLatestCartItemRequest,
    localCartKey,
    mergeCartItemFromResponse,
    replaceCartItems,
    restoreCartItemFromServer,
  ]);

  const increaseQuantity = useCallback((productId) => {
    const item = cartItemsRef.current.find((entry) => entry.id === productId);
    if (item) updateQuantity(productId, item.quantity + 1);
  }, [updateQuantity]);

  const decreaseQuantity = useCallback((productId) => {
    const item = cartItemsRef.current.find((entry) => entry.id === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    }
  }, [updateQuantity]);

  const removeFromCart = useCallback((productId) => {
    const requestedIdentity = cartIdentity;
    const cartItemRequest = createCartItemRequest(productId);

    updateItems(
      (previousItems) => previousItems.filter((item) => item.id !== productId),
      (_nextItems, previousItems) => {
        storefrontService.removeCartItem(productId)
          .then((cartResponse) => {
            if (!isLatestCartItemRequest(cartItemRequest, requestedIdentity)) return;
            replaceCartItems(cartResponse?.items);
          })
          .catch((requestError) => {
            if (!isLatestCartItemRequest(cartItemRequest, requestedIdentity)) return;

            replaceCartItems(previousItems);
            setError(
              requestError?.response?.data?.message
              || 'No fue posible eliminar el producto del carrito.',
            );
          });
      },
    );
  }, [
    cartIdentity,
    createCartItemRequest,
    isLatestCartItemRequest,
    replaceCartItems,
    updateItems,
  ]);

  const clearCart = useCallback(async () => {
    const previousItems = cartItemsRef.current;
    const requestedIdentity = cartIdentity;
    cartItemRequestVersions.current.clear();
    cartItemUpdateQueues.current.clear();
    invalidatePendingCartLoad();
    replaceCartItems([]);
    setError(null);

    if (!clientId) {
      writeStoredCart(localCartKey, []);
      return true;
    }

    try {
      const cartResponse = await storefrontService.clearCart();
      if (activeIdentityRef.current === requestedIdentity) {
        replaceCartItems(cartResponse?.items);
      }
      return true;
    } catch (requestError) {
      if (activeIdentityRef.current === requestedIdentity) {
        replaceCartItems(previousItems);
        setError(
          requestError?.response?.data?.message
          || 'No fue posible vaciar el carrito.',
        );
      }
      return false;
    }
  }, [cartIdentity, clientId, invalidatePendingCartLoad, localCartKey, replaceCartItems]);

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
