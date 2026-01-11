import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('hoohlyashop-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hoohlyashop-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, brand, size = null) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product_id === product.id && item.size === size
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        brand_name: brand?.name || 'Unknown',
        quantity: 1,
        size: size,
        image_url: product.images?.[0] || null,
        price_text: product.price_text || 'CHF on request',
        price_text_de: product.price_text_de || 'CHF auf Anfrage'
      }];
    });
  };

  const removeFromCart = (productId, size = null) => {
    setCart(prev => prev.filter(
      item => !(item.product_id === productId && item.size === size)
    ));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.product_id === productId && item.size === size) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
