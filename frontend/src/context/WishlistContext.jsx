import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children, userId }) {
  // Use a per-user key so different accounts never share a wishlist
  const storageKey = userId ? `kbr_wishlist_${userId}` : 'kbr_wishlist_guest';

  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });

  // When the user changes (login / logout), reload the correct wishlist
  useEffect(() => {
    try {
      let loadedItems = [];
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        loadedItems = JSON.parse(stored);
      }

      // Migration: if logging in (userId exists), check guest wishlist and merge
      if (userId) {
        const guestStored = localStorage.getItem('kbr_wishlist_guest');
        if (guestStored) {
          const guestItems = JSON.parse(guestStored);
          if (guestItems && guestItems.length > 0) {
            // Merge guestItems into loadedItems (unique products only)
            guestItems.forEach(gItem => {
              if (!loadedItems.some(i => i._id === gItem._id)) {
                loadedItems.push(gItem);
              }
            });
            localStorage.removeItem('kbr_wishlist_guest'); // Clear guest wishlist after migrating
          }
        }
      }

      setItems(loadedItems);
    } catch {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, userId]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const toggle = (product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      return exists ? prev.filter((p) => p._id !== product._id) : [...prev, product];
    });
  };

  const isWishlisted = (id) => items.some((p) => p._id === id);
  const remove = (id) => setItems((prev) => prev.filter((p) => p._id !== id));
  const count = items.length;

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, remove, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

