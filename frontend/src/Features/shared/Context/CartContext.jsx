import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    if (!storedCart) return [];

    try {
      return JSON.parse(storedCart);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const stock = Number(product.totalStock ?? product.stock ?? 0);
      const requestedQuantity = Math.max(1, Number(quantity) || 1);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? {
                ...item,
                ...product,
                quantity: stock > 0
                  ? Math.min(item.quantity + requestedQuantity, stock)
                  : item.quantity + requestedQuantity,
              }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            ...product,
            quantity: stock > 0
              ? Math.min(requestedQuantity, stock)
              : requestedQuantity,
          },
        ];
      }
    });
    
    // Retorna true para que el componente muestre la alerta
    return true;
  };

  const increaseQuantity = (productId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id !== productId
          ? item
          : {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                Number(item.totalStock ?? item.stock) || item.quantity + 1
              ),
            }
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id !== productId
          ? item
          : {
              ...item,
              quantity: Math.min(
                Math.max(1, Number(newQuantity) || 1),
                Number(item.totalStock ?? item.stock) || Number.MAX_SAFE_INTEGER
              ),
            }
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.19;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
    getSubtotal,
    getTotalItems,
    getTax,
    getTotal,
    cartCount: getTotalItems()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
