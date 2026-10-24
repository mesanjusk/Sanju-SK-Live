import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'skdigital-cart-v1';

export const useCart = () => useContext(CartContext);

const validQuantity = (qty) => Number.isSafeInteger(Number(qty)) && Number(qty) > 0 && Number(qty) <= 100000;
const validProduct = (product) => product && typeof product._id === 'string' && product._id.length > 0;

const readCart = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => validProduct(item?.product) && validQuantity(item?.qty)).slice(0, 100);
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Browsing in private mode or with storage disabled should not break shopping.
    }
  }, [items]);

  const addToCart = (product, qty = 1) => {
    if (!validProduct(product) || !validQuantity(qty)) return;
    const quantity = Number(qty);
    setItems(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item => item.product._id === product._id
          ? { ...item, qty: Math.min(100000, item.qty + quantity) }
          : item);
      }
      return [...prev, { product, qty: quantity }];
    });
  };

  const updateQty = (id, qty) => {
    if (!validQuantity(qty)) return;
    setItems(prev => prev.map(item => item.product._id === id
      ? { ...item, qty: Number(qty) }
      : item));
  };

  const removeFromCart = id => setItems(prev => prev.filter(item => item.product._id !== id));
  const clearCart = () => setItems([]);

  // Display-only estimate; the server must recalculate and validate any future order.
  const total = items.reduce((sum, item) => {
    const price = Number(item.product.price);
    return sum + (Number.isFinite(price) && price >= 0 ? price * item.qty : 0);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};
