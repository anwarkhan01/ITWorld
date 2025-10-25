import {createContext, useContext, useEffect, useState, useRef} from "react";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {useAuth} from "./AuthContext.jsx";

const CartContext = createContext();

export const CartProvider = ({children}) => {
  const {products} = useProducts();
  const {mongoUser, user} = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const previousAuthState = useRef(null);
  const isSyncing = useRef(false);

  // Load initial cart and handle login merge
  useEffect(() => {
    const loadCart = async () => {
      const isLoggedIn = !!(mongoUser && user);
      const wasLoggedIn = previousAuthState.current;
      const justLoggedIn = !wasLoggedIn && isLoggedIn;

      if (isLoggedIn) {
        try {
          const token = await user.getIdToken();
          if (justLoggedIn) {
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];

            if (localCart.length > 0) {
              // Upload localStorage cart to MongoDB
              const uploadRes = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/cart/update-cart`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({cart: localCart}),
                }
              );
              const uploadData = await uploadRes.json();
              console.log("Upload successful:", uploadData);
              localStorage.removeItem("cart");
              console.log(" localStorage cleared");
            }
          }

          // Fetch the current MongoDB cart
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/cart/get-cart`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();

          // Hydrate cart with product details
          if (data?.items?.length && products.length) {
            const hydrated = data.items
              .map(({productId, quantity}) => {
                const product = products.find(
                  (p) => p.product_id === productId
                );
                return product ? {...product, quantity} : null;
              })
              .filter(Boolean);
            setCartItems(hydrated);
          } else {
            setCartItems([]);
          }

          localStorage.removeItem("cart");
        } catch (err) {
          console.error("Failed to load cart:", err);
        } finally {
          setCartLoaded(true);
        }
      } else {
        const local = JSON.parse(localStorage.getItem("cart")) || [];

        if (local.length && products.length) {
          const hydrated = local
            .map(({id, quantity}) => {
              const product = products.find((p) => p.product_id === id);
              return product ? {...product, quantity} : null;
            })
            .filter(Boolean);
          setCartItems(hydrated);
        } else {
          setCartItems([]);
        }
        setCartLoaded(true);
      }

      // Update previous auth state
      previousAuthState.current = isLoggedIn;
    };

    if (products.length) {
      loadCart();
    }
  }, [mongoUser, user, products]);

  // Sync cart whenever it changes (but NOT on initial load)
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the first render (initial mount)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!cartLoaded || isSyncing.current) return;

    const saveCart = async () => {
      isSyncing.current = true;

      try {
        if (mongoUser && user) {
          // Logged-in user: Save to MongoDB ONLY
          const compact = cartItems.map((i) => ({
            id: i.product_id,
            quantity: i.quantity,
          }));

          const token = await user.getIdToken();
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/cart/update-cart`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({cart: compact}),
            }
          );

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();

          localStorage.removeItem("cart");
        } else {
          // Guest user: Save to localStorage ONLY
          const compact = cartItems.map((i) => ({
            id: i.product_id,
            quantity: i.quantity,
          }));

          localStorage.setItem("cart", JSON.stringify(compact));
        }
      } catch (err) {
        console.error("Failed to save cart:", err);
      } finally {
        isSyncing.current = false;
      }
    };

    // Add small delay to debounce rapid changes
    const timeoutId = setTimeout(saveCart, 300);
    return () => clearTimeout(timeoutId);
  }, [cartItems, mongoUser, user, cartLoaded]);

  // Cart actions
  const addToCart = (productId, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      if (existing) {
        return prev.map((i) =>
          i.product_id === productId
            ? {...i, quantity: i.quantity + quantity}
            : i
        );
      }

      const product = products.find((p) => p.product_id === productId);
      if (!product) {
        return prev;
      }
      return [...prev, {...product, quantity}];
    });
  };

  const increaseQty = (productId) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? {...i, quantity: i.quantity + 1} : i
      )
    );
  };

  const decreaseQty = (productId) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? {...i, quantity: Math.max(1, i.quantity - 1)}
            : i
        )
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
