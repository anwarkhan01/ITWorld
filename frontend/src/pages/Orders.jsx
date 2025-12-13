import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useOrder} from "../contexts/OrderContext.jsx";
import {Loader2, CheckCircle, Truck, XCircle, ChevronRight} from "lucide-react";
import {useAuth} from "../contexts/AuthContext.jsx";

const Orders = () => {
  const navigate = useNavigate();
  const {fetchOrders, orders, orderLoading} = useOrder();
  const {loading, user} = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setError("User not authorized");
      return;
    }
    fetchOrders();
  }, [loading]);

  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
        <span className="text-gray-600">Loading your orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  if (!orderLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-lg text-gray-700 font-medium">No Orders Yet</p>
        <p className="text-sm text-gray-500">
          Your placed orders will appear here.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const computeDeliveryDate = (createdAt) => {
    const d = new Date(createdAt);
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const statusStyles = {
    delivered: "text-green-700 bg-green-100",
    processing: "text-blue-700 bg-blue-100",
    pending: "text-yellow-700 bg-yellow-100",
    cancelled: "text-red-700 bg-red-100",
  };

  const getStatusIcon = (status) => {
    if (status === "delivered") return <CheckCircle className="w-3 h-3" />;
    if (status === "cancelled") return <XCircle className="w-3 h-3" />;
    return <Truck className="w-3 h-3" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-6 sm:px-8 lg:px-16">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
        My Orders
      </h1>

      <div className="space-y-3 sm:space-y-4">
        {orders.map((order) => {
          const first = order.productData?.products?.[0];
          const deliveryDate =
            order.deliveryDate ||
            computeDeliveryDate(order.createdAt || new Date());
          const total = order.productData?.totalPrice || 0;
          const itemCount = order.productData?.products?.length || 0;

          return (
            <div
              key={order.orderId || order._id}
              onClick={() => navigate(`/orders/${order.orderId}`)}
              className="bg-white shadow hover:shadow-md border border-gray-100 rounded-lg p-3 sm:p-6 cursor-pointer transition-all"
            >
              {/* Mobile Layout */}
              <div className="flex gap-3 sm:hidden">
                {/* Image */}
                <img
                  src={
                    first?.image || "https://placehold.co/80x80?text=No+Image"
                  }
                  alt={first?.product_name || "Product"}
                  className="w-20 h-20 object-cover rounded-md shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {first?.product_name || "Product"}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${
                      statusStyles[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>

                  <p className="text-xs text-gray-500 mb-1">
                    {itemCount} item{itemCount > 1 ? "s" : ""} • ₹
                    {total.toLocaleString("en-IN")}
                  </p>

                  {order.status !== "Delivered" &&
                    order.status !== "Cancelled" && (
                      <p className="text-xs text-gray-600">
                        Delivery by{" "}
                        <span className="font-medium">{deliveryDate}</span>
                      </p>
                    )}
                </div>
              </div>

              {/* Desktop/Tablet Layout */}
              <div className="hidden sm:flex items-center gap-6">
                {/* Image */}
                <img
                  src={
                    first?.image || "https://placehold.co/100x100?text=No+Image"
                  }
                  alt={first?.product_name || "Product"}
                  className="w-24 h-24 object-cover rounded-md"
                />

                {/* Info */}
                <div className="flex-1">
                  <p className="text-base lg:text-lg font-medium text-gray-800 mb-1">
                    {first?.product_name || "Product"}
                  </p>
                  {first?.category && (
                    <p className="text-sm text-gray-500">
                      Category: {first.category}
                    </p>
                  )}
                  {first?.color && (
                    <p className="text-sm text-gray-500">
                      Color: {first.color}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm mt-1">
                    Price: ₹{first?.product_price?.toLocaleString("en-IN") || 0}{" "}
                    {itemCount > 1 && (
                      <span className="text-gray-500 ml-2">
                        + {itemCount - 1} more item(s)
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Order ID: {order.orderId}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Ordered on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Status */}
                <div className="text-right">
                  <div
                    className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                      statusStyles[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </div>
                  {order.status !== "Delivered" &&
                    order.status !== "Cancelled" && (
                      <p className="text-gray-600 text-sm mt-2">
                        Delivery by{" "}
                        <span className="font-medium">
                          {computeDeliveryDate(order.createdAt || new Date())}
                        </span>
                      </p>
                    )}
                  <p className="text-gray-800 font-semibold mt-1">
                    ₹{total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
