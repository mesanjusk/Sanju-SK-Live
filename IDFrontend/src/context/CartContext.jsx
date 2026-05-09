import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(p => p.product._id === product._id);
      if (existing) {
        return prev.map(p =>
          p.product._id === product._id ? { ...p, qty: p.qty + qty } : p
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const updateQty = (id, qty) => {
    setItems(prev => prev.map(p => (p.product._id === id ? { ...p, qty } : p)));
  };

  const removeFromCart = id => {
    setItems(prev => prev.filter(p => p.product._id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
