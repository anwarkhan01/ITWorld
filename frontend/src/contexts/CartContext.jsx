import {createContext, useContext, useEffect, useState} from "react";
import {useProducts} from "../contexts/ProductsContext.jsx";

const CartContext = createContext();

export const CartProvider = ({children}) => {
  const {products} = useProducts();
  const [cartItems, setCartItems] = useState([]);

  // Load cart IDs + quantity from localStorage
  const [savedCart, setSavedCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    setSavedCart(saved); // store ids + qty
  }, []);

  // Hydrate cart items once products are loaded
  useEffect(() => {
    if (!products.length || !savedCart.length) return;
    const hydrated = savedCart
      .map(({id, quantity}) => {
        const product = products.find((p) => p.product_id === id);
        return product ? {...product, quantity} : null;
      })
      .filter(Boolean);
    setCartItems(hydrated);
  }, [products, savedCart]);

  // Save cart IDs + qty to localStorage
  useEffect(() => {
    const compact = cartItems.map((i) => ({
      id: i.product_id,
      quantity: i.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(compact));
  }, [cartItems]);

  const addToCart = (productId, quantity = 1) => {
    setCartItems((prev) => {
      if (prev.find((i) => i.product_id === productId)) return prev;
      const product = products.find((p) => p.product_id === productId);
      if (!product) return prev;
      return [...prev, {...product, quantity}];
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
