import {createContext, useContext, useEffect, useState} from "react";
import {useAuth} from "./AuthContext";

const OrderContext = createContext();

export const OrderProvider = ({children}) => {
  const {user, mongoUser, loading} = useAuth();
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const createOrder = async (orderData) => {
    if (!user) throw new Error("User not authenticated");

    setIsOrderProcessing(true);
    try {
      const token = await user.getIdToken();
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await resp.json();
      console.log(data);
      if (!resp.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error("Order creation error:", error);
      return {
        success: false,
        message: error.message || "Failed to create order",
      };
    } finally {
      setIsOrderProcessing(false);
    }
  };

  const initiatePayment = async (paymentData) => {
    if (!user || !mongoUser) throw new Error("User not authenticated");

    setIsOrderProcessing(true);
    try {
      const payload = {
        productData: paymentData.productData,
        shipping: paymentData.shipping,
      };

      const token = await user.getIdToken();
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/start-payu`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        throw new Error("Failed to initiate payment");
      }

      // Get PayU HTML form and render it
      const payuHtml = await resp.text();
      document.open();
      document.write(payuHtml);
      document.close();

      return {success: true};
    } catch (error) {
      console.error("Payment initiation error:", error);
      setIsOrderProcessing(false);
      return {
        success: false,
        message: error.message || "Failed to initiate payment",
      };
    }
  };

  const fetchOrders = async (page = 1, limit = 10) => {
    if (!user) throw new Error("User not authenticated");

    setOrderLoading(true);
    setOrderError(null);

    try {
      const token = await user.getIdToken();
      const resp = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/order/get-orders?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }
      setOrders(data.data.orders || []);
      console.log(data);
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Fetch orders error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch orders",
      };
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const token = await user.getIdToken();
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/get-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }
      console.log(data);
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Fetch order error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch order",
      };
    }
  };

  const value = {
    createOrder,
    initiatePayment,
    fetchOrders,
    fetchOrderById,
    isOrderProcessing,
    orders,
    orderLoading,
    orderError,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
