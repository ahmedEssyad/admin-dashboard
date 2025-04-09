import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Générer une clé unique pour identifier un produit avec ses variations
  const getItemKey = (product) => {
    if (product.productType === 'variable' && product.variationId) {
      return `${product._id}-${product.variationId}`;
    }
    return product._id;
  };

  // Vérifier si deux produits sont identiques (même ID et mêmes variations si applicable)
  const isSameItem = (item1, item2) => {
    if (item1.productType === 'variable' && item2.productType === 'variable') {
      return item1._id === item2._id && item1.variationId === item2.variationId;
    }
    return item1._id === item2._id;
  };

  const addToCart = (product) => {
    const productWithQuantity = {
      ...product,
      quantity: product.quantity || 1
    };

    setCartItems(prevItems => {
      // Chercher si l'article existe déjà (en tenant compte des variations)
      const existingItemIndex = prevItems.findIndex(item => isSameItem(item, productWithQuantity));
      
      if (existingItemIndex >= 0) {
        // Si l'article existe, mettre à jour la quantité
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (productWithQuantity.quantity || 1)
        };
        return updatedItems;
      } else {
        // Sinon, ajouter le nouvel article
        return [...prevItems, productWithQuantity];
      }
    });
  };

  const removeFromCart = (itemKey) => {
    // Pour les produits variables, itemKey peut être un ID composé
    if (typeof itemKey === 'string' && itemKey.includes('-')) {
      const [productId, variationId] = itemKey.split('-');
      setCartItems(prevItems => prevItems.filter(item => 
        !(item._id === productId && item.variationId === variationId)
      ));
    } else {
      // Pour les produits simples
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemKey));
    }
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemKey);
      return;
    }

    setCartItems(prevItems => {
      if (typeof itemKey === 'string' && itemKey.includes('-')) {
        // Pour les produits variables
        const [productId, variationId] = itemKey.split('-');
        return prevItems.map(item =>
          (item._id === productId && item.variationId === variationId)
            ? { ...item, quantity }
            : item
        );
      } else {
        // Pour les produits simples
        return prevItems.map(item =>
          item._id === itemKey
            ? { ...item, quantity }
            : item
        );
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Déterminer le prix à utiliser
      let price;
      
      if (item.productType === 'variable') {
        // Pour les produits variables, utiliser le prix de la variation si disponible
        price = item.variationPrice || item.discountedPrice || item.oldPrice;
      } else {
        // Pour les produits simples
        price = item.discountedPrice || item.oldPrice;
      }
      
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemKey = (item) => {
    if (item.productType === 'variable' && item.variationId) {
      return `${item._id}-${item.variationId}`;
    }
    return item._id;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    getCartItemKey
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};