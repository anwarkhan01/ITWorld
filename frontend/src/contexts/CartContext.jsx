import {createContext, useContext, useEffect, useState, useRef} from "react";
import {useAuth} from "./AuthContext.jsx";

const CartContext = createContext();

const STORAGE_KEY = "cart";
const SYNC_DELAY = 500;

export const CartProvider = ({children}) => {
  const {mongoUser, user, loading} = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncTimeoutRef = useRef(null);
  const prevAuthRef = useRef(null);
  const hasLoggedInRef = useRef(false);

  // --- Compact Cart Format for Syncing ---
  const compactCart = (cart) =>
    cart.map(({product_id, productId, id, quantity}) => ({
      id: product_id || productId || id,
      quantity,
    }));

  // --- Fetch Cart from Server ---
  const fetchServerCart = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/get-cart`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      const items = Array.isArray(data?.data?.items)
        ? data.data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];
      return items;
    } catch (err) {
      console.error("Error fetching server cart:", err);
      return [];
    }
  };

  // --- Sync Cart to Server ---
  const syncToServer = async (cart, firebaseUser) => {
    try {
      if (!firebaseUser) return false;
      const token = await firebaseUser.getIdToken(true);
      const body = JSON.stringify({cart: compactCart(cart)});
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/update-cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );
      if (!res.ok) throw new Error("Failed to sync cart");
      return true;
    } catch (err) {
      console.error("Error syncing to server:", err);
      return false;
    }
  };

  // --- Hydrate Cart by Fetching Product Details Directly ---
  const hydrateCart = async (cart) => {
    if (!Array.isArray(cart) || cart.length === 0) return [];
    try {
      const ids = cart.map((item) => item.productId || item.id);
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/products/get-products-by-ids`;

      const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ids}),
      });

      if (!res.ok) throw new Error("Failed to fetch product details");

      const data = await res.json();
      const fetchedProducts = Array.isArray(data?.data) ? data.data : [];

      return cart
        .map(({id, productId, quantity}) => {
          const pid = productId || id;
          const product = fetchedProducts.find((p) => p.product_id === pid);
          return product ? {...product, quantity} : null;
        })
        .filter(Boolean);
    } catch (err) {
      console.error("Error hydrating cart:", err);
      return [];
    }
  };

  // --- Merge Local + Server Carts ---
  const mergeCarts = (guest, server) => {
    const map = new Map();

    for (const item of server) {
      const pid = item.product_id || item.productId || item.id;
      map.set(pid, {...item});
    }

    for (const item of guest) {
      const pid = item.product_id || item.productId || item.id;
      if (map.has(pid)) {
        const existing = map.get(pid);
        map.set(pid, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        map.set(pid, {...item});
      }
    }

    return Array.from(map.values());
  };

  // --- Initialize Cart (Independent of Products Context) ---
  useEffect(() => {
    if (loading) return;

    const init = async () => {
      const isLoggedIn = !!(mongoUser && user);
      const wasLoggedIn = prevAuthRef.current;
      prevAuthRef.current = isLoggedIn;

      try {
        if (isLoggedIn) {
          // Case: User just logged in (merge guest + server)
          if (!wasLoggedIn && !hasLoggedInRef.current) {
            console.log("User just logged in — merging carts");
            const serverCart = await fetchServerCart(user);
            const localCart =
              JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

            const merged = mergeCarts(localCart, serverCart);
            const hydrated = await hydrateCart(merged);

            setCartItems(hydrated);
            if (hydrated.length > 0) await syncToServer(hydrated, user);
            localStorage.removeItem(STORAGE_KEY);
            hasLoggedInRef.current = true;
          } else {
            // Already logged in — just load from server
            const serverCart = await fetchServerCart(user);
            const hydrated = await hydrateCart(serverCart);
            setCartItems(hydrated);
          }
        } else {
          // Guest user — load from localStorage
          const localCart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
          const hydrated = await hydrateCart(localCart);
          setCartItems(hydrated);
          hasLoggedInRef.current = false;
        }
      } catch (err) {
        console.error("Error initializing cart:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [loading, mongoUser, user]);

  // --- Sync Changes Automatically ---
  // --- Sync Changes Automatically (Fixed for Guest Cart) ---
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      const isLoggedIn = !!(mongoUser && user);

      try {
        if (isLoggedIn) {
          console.log("Syncing to server (logged in user)");
          await syncToServer(cartItems, user);
          localStorage.removeItem(STORAGE_KEY);
        } else {
          console.log("Syncing to localStorage (guest user)");
          // Always persist guest cart (even first load)
          if (cartItems && cartItems.length > 0) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(compactCart(cartItems))
            );
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error("Error syncing cart:", err);
      }
    }, SYNC_DELAY);

    return () => clearTimeout(syncTimeoutRef.current);
  }, [cartItems, mongoUser, user]);

  // --- Cart Actions ---
  const addToCart = (product, qty = 1) => {
    if (!product || !product.product_id) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      return existing
        ? prev.map((i) =>
            i.product_id === product.product_id
              ? {...i, quantity: i.quantity + qty}
              : i
          )
        : [...prev, {...product, quantity: qty}];
    });
  };

  const increaseQty = (productId) =>
    setCartItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? {...i, quantity: i.quantity + 1} : i
      )
    );

  const decreaseQty = (productId) =>
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? {...i, quantity: Math.max(1, i.quantity - 1)}
            : i
        )
        .filter(Boolean)
    );

  const removeFromCart = (productId) =>
    setCartItems((prev) => prev.filter((i) => i.product_id !== productId));

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((a, i) => a + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        totalItems,
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
