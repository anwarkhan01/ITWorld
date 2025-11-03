import {createContext, useContext, useEffect, useState, useRef} from "react";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {useAuth} from "./AuthContext.jsx";

const CartContext = createContext();

const STORAGE_KEY = "cart";
const SYNC_DELAY = 500;

export const CartProvider = ({children}) => {
  const {products} = useProducts();
  const {mongoUser, user, loading} = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncTimeoutRef = useRef(null);
  const prevAuthRef = useRef(null);
  const hasLoggedInRef = useRef(false);

  const hydrateCart = (cart) => {
    if (!Array.isArray(cart) || !products.length) return [];
    return cart
      .map(({id, productId, quantity}) => {
        const pid = productId || id;
        const product = products.find((p) => p.product_id === pid);
        return product ? {...product, quantity} : null;
      })
      .filter(Boolean);
  };

  const mergeCarts = (guest, server) => {
    const map = new Map();

    for (const item of server) {
      const pid = item.product_id || item.productId;
      map.set(pid, {...item});
    }

    // Add guest items (if not already in server, merge quantities if exists)
    for (const item of guest) {
      const pid = item.product_id || item.productId;
      if (map.has(pid)) {
        // If item exists in server, add guest quantity to server quantity
        const existing = map.get(pid);
        map.set(pid, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        // If item doesn't exist in server, add it
        map.set(pid, {...item});
      }
    }

    return Array.from(map.values());
  };

  const compactCart = (cart) =>
    cart.map(({product_id, quantity}) => ({
      id: product_id,
      quantity,
    }));

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
      return Array.isArray(data?.data?.items) ? data.data.items : [];
    } catch (err) {
      console.error("Error fetching server cart:", err);
      return [];
    }
  };

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

  // INITIALIZATION
  useEffect(() => {
    if (loading || !products.length) return;

    const init = async () => {
      const isLoggedIn = !!(mongoUser && user);
      const wasLoggedIn = prevAuthRef.current;
      prevAuthRef.current = isLoggedIn;

      try {
        if (isLoggedIn) {
          // User is logged in
          if (!wasLoggedIn && !hasLoggedInRef.current) {
            // User JUST logged in (transition from guest to logged-in)
            console.log("User just logged in - merging carts");

            // 1. Fetch server cart
            const serverCart = await fetchServerCart(user);
            const hydratedServer = hydrateCart(serverCart);

            // 2. Get localStorage cart
            const localCart =
              JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            const hydratedLocal = hydrateCart(localCart);

            // 3. Merge carts (combine quantities if same item)
            const merged = mergeCarts(hydratedLocal, hydratedServer);

            // 4. Update state
            setCartItems(merged);

            // 5. Sync merged cart to server
            if (merged.length > 0) {
              await syncToServer(merged, user);
            }

            // 6. Clear localStorage
            localStorage.removeItem(STORAGE_KEY);

            hasLoggedInRef.current = true;
          } else {
            // User was already logged in - fetch from server
            console.log("User already logged in - fetching from server");
            const serverCart = await fetchServerCart(user);
            const hydratedServer = hydrateCart(serverCart);
            setCartItems(hydratedServer);
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
          const hydrated = hydrateCart(localCart);
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
  }, [loading, products.length, mongoUser, user]);

  // SYNC CHANGES
  useEffect(() => {
    if (!isInitialized) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      const isLoggedIn = !!(mongoUser && user);

      try {
        if (isLoggedIn) {
          // User is logged in: sync to MongoDB ONLY
          console.log("Syncing to server (logged in user)");
          await syncToServer(cartItems, user);

          if (localStorage.getItem(STORAGE_KEY)) {
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          // User is guest: sync to localStorage ONLY
          console.log("Syncing to localStorage (guest user)");
          if (cartItems.length > 0) {
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
  }, [cartItems, mongoUser, user, isInitialized]);

  // ACTIONS
  const addToCart = (productId, qty = 1) => {
    const product = products.find((p) => p.product_id === productId);
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      return existing
        ? prev.map((i) =>
            i.product_id === productId ? {...i, quantity: i.quantity + qty} : i
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
