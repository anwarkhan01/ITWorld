import {Navigate, Route, Routes} from "react-router-dom";
import AdminRoot from "./AdminRoot.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import Products from "./pages/Products.jsx";
import Users from "./pages/Users.jsx";
import {SidebarProvider} from "./contexts/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AdminRoot />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SidebarProvider>
  );
}

export default App;
