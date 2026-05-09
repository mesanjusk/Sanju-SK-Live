import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('favorites');
        if (stored) {
          try {
            setFavorites(JSON.parse(stored));
          } catch (_) {
            // ignore parse errors
          }
        }
      }
    }, []);

    // Persist to localStorage whenever it changes
    useEffect(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('favorites', JSON.stringify(favorites));
      }
    }, [favorites]);

  const addFavorite = (listing) => {
    setFavorites((prev) => {
      if (prev.find((item) => item.id === listing.id)) return prev;
      return [...prev, listing];
    });
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

