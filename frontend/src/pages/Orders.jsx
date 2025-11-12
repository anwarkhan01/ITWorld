import React from "react";
import {useNavigate} from "react-router-dom";
import {useOrder} from "../contexts/OrderContext.jsx";
import {Loader2, CheckCircle, Truck, XCircle} from "lucide-react";

const Orders = () => {
  const navigate = useNavigate();
  const {orders, loading, error} = useOrder();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
        <span className="text-gray-600">Loading your orders...</span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700 font-medium">No Orders Yet</p>
        <p className="text-sm text-gray-500">
          Your placed orders will appear here.
        </p>
      </div>
    );

  const computeDeliveryDate = (createdAt) => {
    const d = new Date(createdAt);
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyles = {
    Delivered: "text-green-700 bg-green-100",
    Pending: "text-yellow-700 bg-yellow-100",
    Cancelled: "text-red-700 bg-red-100",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-8 lg:px-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        My Orders
      </h1>

      <div className="space-y-4">
        {orders?.map((order) => {
          const first = order.productData.products[0];
          const deliveryDate =
            order.deliveryDate ||
            computeDeliveryDate(order.createdAt || new Date());
          const total = order.productData?.totalPrice || 0;

          return (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="flex flex-col sm:flex-row items-start sm:items-center bg-white shadow hover:shadow-md border border-gray-100 rounded-lg p-4 sm:p-6 cursor-pointer transition-all"
            >
              {/* Image */}
              <img
                src={
                  first?.image || "https://placehold.co/100x100?text=No+Image"
                }
                alt={first?.product_name || "Product"}
                className="w-24 h-24 object-cover rounded-md mb-3 sm:mb-0 sm:mr-6"
              />

              {/* Info */}
              <div className="flex-1">
                <p className="text-base sm:text-lg font-medium text-gray-800">
                  {first?.product_name}
                </p>
                {first?.category && (
                  <p className="text-sm text-gray-500">
                    Category: {first.category}
                  </p>
                )}
                {first?.color && (
                  <p className="text-sm text-gray-500">Color: {first.color}</p>
                )}
                <p className="text-gray-700 text-sm mt-1">
                  Price: ₹{first?.product_price?.toLocaleString("en-IN")}{" "}
                  {order.productData.products.length > 1 && (
                    <span className="text-gray-500 ml-2">
                      + {order.productData.products.length - 1} more item(s)
                    </span>
                  )}
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
              <div className="mt-3 sm:mt-0 sm:ml-6 text-right">
                <div
                  className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                    statusStyles[order.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status === "Delivered" ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : order.status === "Cancelled" ? (
                    <XCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Truck className="w-4 h-4 mr-1" />
                  )}
                  {order.status}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Delivery by{" "}
                  <span className="font-medium">{deliveryDate}</span>
                </p>
                <p className="text-gray-800 font-semibold mt-1">
                  ₹{total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
