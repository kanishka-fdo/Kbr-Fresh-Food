import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children, userId }) {
  // Use a per-user key so different accounts never share a cart
  const storageKey = userId ? `kbr_cart_${userId}` : 'kbr_cart_guest';

  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // When the user changes (login / logout), reload the correct cart
  useEffect(() => {
    try {
      let loadedItems = [];
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        loadedItems = JSON.parse(stored);
      }

      // Migration: if logging in (userId exists), check guest cart and merge
      if (userId) {
        const guestStored = localStorage.getItem('kbr_cart_guest');
        if (guestStored) {
          const guestItems = JSON.parse(guestStored);
          if (guestItems && guestItems.length > 0) {
            // Merge guestItems into loadedItems
            guestItems.forEach(gItem => {
              const existing = loadedItems.find(i => i.product === gItem.product);
              if (existing) {
                existing.quantity += gItem.quantity;
              } else {
                loadedItems.push(gItem);
              }
            });
            localStorage.removeItem('kbr_cart_guest'); // Clear guest cart after migrating
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

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          unit: product.unit,
          retailPrice: product.retailPrice,
          images: product.images || [],
          category: product.category || null,
          stockQuantity: product.stockQuantity || 0,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) return removeItem(productId);
    setItems((prev) => prev.map((i) => (i.product === productId ? { ...i, quantity } : i)));
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.retailPrice * (Number(i.quantity) || 0), 0);
  const count = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

