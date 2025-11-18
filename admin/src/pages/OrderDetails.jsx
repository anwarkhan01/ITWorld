import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {ArrowLeft} from "lucide-react";
import {API_BASE, getStatusColor} from "../utils/api";

const OrderDetails = () => {
  const {orderId} = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`);
        const data = await res.json();
        if (data?.data) {
          setOrder(data.data);
        } else {
          throw new Error(data?.message || "Order not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <div className="h-10 w-10 border-b-2 border-gray-900 rounded-full animate-spin" />
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} />
          Back to orders
        </Link>
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-800">
          {error || "Order not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      {/* TOP */}
      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderId}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <span
            className={`px-4 py-2 text-sm rounded-full font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* CUSTOMER / SHIPPING */}
        <div className="bg-gray-50 border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Customer & Shipping</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500 text-xs uppercase">Customer Name</p>
              <p className="font-medium">{order.shipping.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500 text-xs uppercase">Email</p>
              <p>{order.useremail}</p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500 text-xs uppercase">Phone</p>
              <p>{order.shipping.phone}</p>
            </div>

            <div className="space-y-1 col-span-full">
              <p className="text-gray-500 text-xs uppercase">
                Shipping Address
              </p>
              <p className="leading-5">
                {order.shipping.address}, {order.shipping.landmark}, <br />
                {order.shipping.city}, {order.shipping.state},{" "}
                {order.shipping.country} - {order.shipping.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT + META */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Payment Information</h2>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Method: </span>
              {order.paymentMethod}
            </p>
            <p>
              <span className="text-gray-500">Payment ID: </span>
              {order.paymentId || "N/A"}
            </p>
            <p>
              <span className="text-gray-500">Status: </span>
              {order.status}
            </p>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.productData.totalPrice}</span>
            </p>
            <p className="flex justify-between">
              <span>Tax</span>
              <span>₹{order.productData.tax}</span>
            </p>
            <p className="flex justify-between">
              <span>Delivery</span>
              <span>₹{order.productData.deliveryCharge}</span>
            </p>

            <p className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>
                ₹
                {order.productData.totalPrice +
                  order.productData.tax +
                  order.productData.deliveryCharge}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Order Meta</h2>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Firebase UID: </span>
              {order.firebaseUid}
            </p>
            {/* <p>
              <span className="text-gray-500">From Buy Now: </span>
              {order.meta.fromBuyNow ? "Yes" : "No"}
            </p> */}

            <p>
              <span className="text-gray-500">Meta Created: </span>
              {new Date(order.meta.createdAt).toLocaleString()}
            </p>

            <p>
              <span className="text-gray-500">Updated At: </span>
              {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ITEMS */}
      {order.productData?.products?.length > 0 && (
        <section className="bg-white shadow rounded-xl p-6 space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Items</h2>

          <div className="space-y-6">
            {order.productData.products.map((item) => (
              <div
                key={item.product_id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 last:border-none last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={item.image}
                    alt={item.product_name}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />

                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {item.product_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      Product ID: {item.product_id}
                    </p>

                    <p className="text-sm text-gray-700">
                      ₹{item.product_price} × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right md:text-right">
                  <p className="font-semibold text-lg">
                    ₹{(item.product_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OrderDetails;
