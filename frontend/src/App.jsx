import {Routes, Route} from "react-router-dom";
import Root from "./Root";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetail from "./components/productDetail.jsx";
import Contact from "./pages/Contact.jsx";
import GoogleAuth from "./pages/Auth.jsx";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        {/* <Route path="contact" element={<Contact />} /> */}
        <Route path="auth" element={<GoogleAuth />} />
      </Route>
    </Routes>
  );
};

export default App;
