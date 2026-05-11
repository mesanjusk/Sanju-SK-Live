import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext();

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => load('sk_favorites'));
  const [liked, setLiked] = useState(() => load('sk_liked'));

  useEffect(() => {
    localStorage.setItem('sk_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sk_liked', JSON.stringify(liked));
  }, [liked]);

  const toggleFavorite = (item) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f._id === item._id);
      return exists ? prev.filter((f) => f._id !== item._id) : [item, ...prev];
    });
  };

  const addLiked = (item) => {
    setLiked((prev) => prev.some((f) => f._id === item._id) ? prev : [item, ...prev]);
  };

  // backward-compat
  const addFavorite = (item) => toggleFavorite(item);
  const removeFavorite = (id) => setFavorites((prev) => prev.filter((f) => f._id !== id && f.id !== id));

  return (
    <FavoritesContext.Provider value={{ favorites, liked, toggleFavorite, addFavorite, removeFavorite, addLiked }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
