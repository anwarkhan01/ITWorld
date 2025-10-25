import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from "./App";
import "./index.css";
import {CartProvider} from "./contexts/CartContext.jsx";
import {ProductsProvider} from "./contexts/ProductsContext.jsx";
import {AuthProvider} from "./contexts/AuthContext.jsx";
import ScrollToTop from "./utils/scrollToTop.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ScrollToTop />
      <ProductsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </BrowserRouter>
);
