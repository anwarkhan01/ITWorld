import React, {createContext, useContext, useEffect, useState} from "react";
import {useAuth} from "./AuthContext.jsx";

const OrderContext = createContext();

export const OrderProvider = ({children}) => {
  const {user} = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        return;
      }
      setOrderLoading(true);
      setError("");
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/order/get-orders`,
          {headers: {Authorization: `Bearer ${token}`}}
        );
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        if (data.success && data.data) {
          setOrders(data.data.orders || []);
        } else {
          setError(data.message || "Failed to fetch orders");
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Unable to load orders");
        setOrders([]);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getOrderById = (id) => orders.find((o) => o._id === id);

  return (
    <OrderContext.Provider value={{orders, orderLoading, error, getOrderById}}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
