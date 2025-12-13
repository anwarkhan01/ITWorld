import {Routes, Route, Navigate} from "react-router-dom";
import Root from "./Root";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetail from "./components/productDetail.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Profile from "./pages/Profile.jsx";
import CheckoutPage from "./pages/CheckOut.jsx";
import {useAuth} from "./contexts/AuthContext.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import PaymentSuccess from "./pages/payment/PaymentSuccess.jsx";
import PaymentFailed from "./pages/payment/PaymentFailed.jsx";

const ProtectedRoute = ({children}) => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const AuthRoute = ({children}) => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="contact" element={<Contact />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route
          path="/payment/payment-successful"
          element={<PaymentSuccess />}
        />
        <Route path="/payment/payment-failed" element={<PaymentFailed />} />
        {/* Protected Profile Route */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes   */}
        <Route path="/auth">
          <Route
            path="login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
