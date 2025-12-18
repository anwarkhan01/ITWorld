import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import OrderModal from "../components/OrderModal";
import { API_BASE } from "../utils/api";
import { ArrowDown } from "lucide-react";

const STATUS_BY_PAYMENT = {
  sp: ["pending", "processing", "ready", "pickedup", "cancelled"],
  default: [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ],
};

const getAllowedStatuses = (paymentMethod) =>
  paymentMethod === "sp" ? STATUS_BY_PAYMENT.sp : STATUS_BY_PAYMENT.default;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const menuRefs = useRef({});

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const url =
          filterStatus === "all"
            ? `${API_BASE}/orders?page=${currentPage}&limit=10`
            : `${API_BASE}/orders/status/${filterStatus}`;

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const payload = data?.data || {};

        setOrders(payload.orders || payload || []);
        setTotalPages(payload.pagination?.totalPages || 1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching orders:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    return () => controller.abort();
  }, [currentPage, filterStatus]);

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find((o) => o.orderId === orderId);
    const allowedStatuses = getAllowedStatuses(order?.paymentMethod);

    if (!allowedStatuses.includes(status)) return;

    try {
      console.log(status);
      await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status, menuOpen: false } : o
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // outside click handler
  useEffect(() => {
    function handleClickOutside(e) {
      const refs = menuRefs.current;

      const clickedInside = Object.values(refs).some((ref) =>
        ref?.contains(e.target)
      );

      if (!clickedInside) {
        setOrders((prev) =>
          prev.map((o) => (o.menuOpen ? { ...o, menuOpen: false } : o))
        );
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Manage
          </p>
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-60 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready</option>
          <option value="pickedup">Pickedup</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Status / Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 border-b-2 border-gray-900 rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                const openAbove = index >= orders.length - 3;
                const allowedStatuses = getAllowedStatuses(order.paymentMethod);

                return (
                  <tr key={order._id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-semibold">{order.orderId}</td>

                    <td className="px-6 py-4">{order.useremail || "N/A"}</td>

                    <td className="px-6 py-4 font-medium">
                      ₹{order.productData?.totalPrice?.toFixed(2) || 0}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Status selector */}
                        <div
                          className="relative"
                          ref={(el) => (menuRefs.current[order._id] = el)}
                        >
                          <button
                            onClick={() =>
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o._id === order._id
                                    ? {
                                        ...o,
                                        menuOpen: !o.menuOpen,
                                      }
                                    : {
                                        ...o,
                                        menuOpen: false,
                                      }
                                )
                              )
                            }
                            className={`
                              flex items-center justify-between px-4 py-1.5 rounded-full
                              text-xs font-semibold capitalize border shadow-sm w-30
                              ${
                                order.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                  : order.status === "processing"
                                  ? "bg-blue-50 text-blue-700 border-blue-300"
                                  : order.status === "ready"
                                  ? "bg-green-50 text-green-700 border-green-300"
                                  : order.status === "pickedup"
                                  ? "bg-green-50 text-green-700 border-green-300"
                                  : order.status === "shipped"
                                  ? "bg-purple-50 text-purple-700 border-purple-300"
                                  : order.status === "refunded"
                                  ? "bg-purple-50 text-yellow-700 border-yellow-300"
                                  : order.status === "delivered"
                                  ? "bg-green-50 text-green-700 border-green-300"
                                  : "bg-red-50 text-red-700 border-red-300"
                              }
                            `}
                          >
                            <span>{order.status}</span>
                            <ArrowDown size={20} />
                          </button>

                          {order.menuOpen && (
                            <div
                              className={`
                                absolute w-40 bg-white border border-gray-200
                                rounded-xl shadow-lg z-50
                                ${
                                  openAbove
                                    ? "bottom-full mb-2"
                                    : "top-full mt-2"
                                }
                              `}
                            >
                              {allowedStatuses.map((s) => (
                                <button
                                  key={s}
                                  onClick={() =>
                                    updateOrderStatus(order.orderId, s)
                                  }
                                  className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-100
                                    ${
                                      s === order.status
                                        ? "text-blue-600 font-semibold"
                                        : "text-gray-700"
                                    }
                                  `}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/orders/${order.orderId}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-600 hover:bg-blue-100 transition"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <OrderModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        updateOrderStatus={updateOrderStatus}
      />
    </div>
  );
};

export default Orders;
