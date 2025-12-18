import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../contexts/OrderContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useProducts } from "../contexts/ProductsContext.jsx";
import { ArrowLeft, CheckCircle, XCircle, Truck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById } = useOrder();
  const { getProductsByIds } = useProducts();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const cancellationReasons = [
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Changed my mind",
    "Delivery time is too long",
    "Need to change shipping address",
    "Product specifications don't meet my needs",
    "Other",
  ];

  const handleViewOrderedProduct = async (productId) => {
    console.log([productId]);
    getProductsByIds([productId]);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    if (!orderId || !user) return;

    const loadOrder = async () => {
      const res = await fetchOrderById(orderId);
      console.log("res", res);
      if (res.success) setOrder(res.data);
      setLoading(false);
    };

    loadOrder();
  }, [orderId, user, cancelling]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
        <span className="text-gray-600">Loading order details...</span>
      </div>
    );

  if (error || !order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-600 mb-2">{error || "Order not found."}</p>
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-600 hover:underline"
        >
          Back to Orders
        </button>
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

  const deliveryDate =
    order.deliveryDate || computeDeliveryDate(order.createdAt || new Date());

  const statusIcons = {
    delivered: <CheckCircle className="w-5 h-5 text-green-600" />,
    pending: <Truck className="w-5 h-5 text-yellow-600" />,
    cancelled: <XCircle className="w-5 h-5 text-red-600" />,
  };

  const statusColors = {
    pending: "text-green-700 bg-green-100",
    processing: "text-blue-700 bg-blue-100",
    ready: "text-green-700 bg-green-100",
    pickedup: "text-green-700 bg-green-100",
    shipped: "text-cyan-700 bg-purple-100",
    delivered: "text-green-700 bg-green-100",
    cancelled: "text-red-700 bg-red-100",
    refunded: "text-yellow-700 bg-gray-200",
  };

  const handleCancelOrder = async () => {
    if (!selectedReason) {
      setError("Please select a cancellation reason");
      return;
    }

    if (selectedReason === "Other" && !cancellationReason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }

    if (confirmText !== "cancel order") {
      setError("Please type 'cancel order' to confirm");
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const finalReason =
        selectedReason === "Other" ? cancellationReason.trim() : selectedReason;

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/cancel-order/${
          order.orderId
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            cancellation_reason: finalReason,
          }),
        }
      );

      const data = await res.json();
      await fetchOrderById();
      if (!data.success) {
        setError(data.message || "Unable to cancel order");
        setCancelling(false);
        return;
      }

      setOrder((prev) => ({
        ...prev,
        status: "cancelled",
        cancellationReason: finalReason,
      }));
      setShowCancelModal(false);
      setConfirmText("");
      setSelectedReason("");
      setCancellationReason("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setCancelling(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setConfirmText("");
    setSelectedReason("");
    setCancellationReason("");
    setError("");
  };

  const statusMessages = {
    pending: "Order placed successfully",
    processing: "Order is being processed",
    ready: "Order is ready for pickup",
    pickedup: "Order picked Successfully",
    shipped: "Order is Out for Delivery",
    delivered: "Order delivered successfully",
    cancelled: "Order was cancelled",
    refunded: "Payment has been refunded",
  };
  const isStorePickup = order.paymentMethod === "sp";
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 lg:px-16">
      {true && (
        <div className="bg-white shadow border border-gray-100 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Order ID: <span className="font-mono">{order.orderId}</span>
            </h2>
            <div
              className={`flex items-center text-sm px-3 py-1 rounded-full font-medium ${
                statusColors[order.status]
              }`}
            >
              {/* {statusIcons[order.status]} */}
              <span className="ml-1">
                {statusMessages[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Products */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Ordered Items
              </h3>
              <div className="space-y-3">
                {order.productData.products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleViewOrderedProduct(p.product_id)}
                  >
                    <img
                      src={p.image || "https://placehold.co/80x80"}
                      alt={p.product_name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {p.product_name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {p.color && `Color: ${p.color}`}{" "}
                        {p.category && `• ${p.category}`}
                      </p>
                      <p className="text-gray-700 text-sm">
                        Qty {p.quantity} × ₹{p.product_price}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₹{(p.product_price * p.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Summary */}

            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Shipping & Payment
              </h3>

              {/* DELIVERY ADDRESS (ONLY FOR DELIVERY ORDERS) */}
              {!isStorePickup && (
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium">{order.shipping.name}</p>
                  <p>{order.shipping.phone}</p>
                  <p>
                    {order.shipping.address}, {order.shipping.city},{" "}
                    {order.shipping.state} - {order.shipping.pincode}
                  </p>
                  {order.shipping.landmark && (
                    <p>Landmark: {order.shipping.landmark}</p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 my-3"></div>

              {/* PAYMENT */}
              <p>Payment Method: {order.paymentMethod.toUpperCase()}</p>
              {order?.paymentId && <p>Payment ID: {order.paymentId}</p>}

              <div className="border-t border-gray-200 my-3"></div>

              {/* PRICE */}
              <p>
                Total: ₹{order.productData.totalPrice.toLocaleString("en-IN")}
              </p>

              {order.productData.tax > 0 && (
                <p>Tax: ₹{order.productData.tax.toLocaleString("en-IN")}</p>
              )}

              {!isStorePickup && order.productData.deliveryCharge > 0 && (
                <p>
                  Delivery: ₹
                  {order.productData.deliveryCharge.toLocaleString("en-IN")}
                </p>
              )}

              <div className="border-t border-gray-200 my-3"></div>

              {/* ORDER DATE */}
              <p>
                Order Date:{" "}
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>

              {/* DELIVERY ETA (DELIVERY ONLY) */}
              {!isStorePickup &&
                order.status !== "cancelled" &&
                order.status !== "shipped" &&
                order.status !== "delivered" && (
                  <p>
                    Expected Delivery:{" "}
                    {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              {!isStorePickup &&
                order.status !== "cancelled" &&
                order.status == "shipped" && (
                  <p>
                    Your order has been shipped and is out for delivery.
                    <br />
                    Expected delivery today between 9:00 AM and 11:00 PM.
                  </p>
                )}
              {!isStorePickup &&
                order.status !== "cancelled" &&
                order.status == "delivered" && (
                  <p>
                    Your order is delivered at:{" "}
                    {new Date(order.deliveredOn).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}

              {/* STORE PICKUP DETAILS */}
              {isStorePickup && order.pickup && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>

                  <p>
                    Pickup Method:{" "}
                    <span className="font-medium">Store Pickup</span>
                  </p>

                  {order.pickup.storeAddress && (
                    <p>Pickup Location: {order.pickup.storeAddress}</p>
                  )}

                  {order.status !== "ready" &&
                    order.status !== "cancelled" &&
                    order.status !== "pickedup" && (
                      <p>
                        Order will be available at store on:{" "}
                        {new Date(order.pickup.readyAt).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}

                  {order.status === "ready" && (
                    <p>
                      Order is available at store you can pick it up between
                      11:00 AM to 10:00 Pm
                    </p>
                  )}

                  {order.pickup.pickedUpAt && order.status === "pickedup" && (
                    <p>
                      Picked Up On:{" "}
                      {new Date(order.pickup.pickedUpAt).toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                </>
              )}

              {/* CANCELLATION */}
              {(order.status === "cancelled" || order.status === "refunded") &&
                order.cancelled?.cancelledAt && (
                  <>
                    <div className="border-t border-gray-200 my-3"></div>

                    <p>
                      Cancelled On:{" "}
                      {new Date(order.cancelled.cancelledAt).toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </p>

                    {!isStorePickup && order.cancelled.refundAmount && (
                      <p>
                        Refund Amount: ₹
                        {order.cancelled.refundAmount.toLocaleString("en-IN")}
                      </p>
                    )}

                    {!isStorePickup &&
                      order.status === "refunded" &&
                      order.cancelled?.refunded && (
                        <p>Payment refunded successfully</p>
                      )}

                    {!isStorePickup &&
                      !order.cancelled?.refunded &&
                      order.cancelled.refundDate && (
                        <p>
                          Expected Refund Date:{" "}
                          {new Date(
                            order.cancelled.refundDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      {order.status === "pending" && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Cancel Order
          </button>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Cancel Order
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {cancellationReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === "Other" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter your reason..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-semibold">"cancel order"</span> to
                confirm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeCancelModal}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition disabled:opacity-50"
              >
                Close
              </button>

              <button
                disabled={
                  !selectedReason ||
                  (selectedReason === "Other" && !cancellationReason.trim()) ||
                  confirmText !== "cancel order" ||
                  cancelling
                }
                onClick={handleCancelOrder}
                className={`px-4 py-2 rounded-lg text-white transition flex items-center ${
                  !selectedReason ||
                  (selectedReason === "Other" && !cancellationReason.trim()) ||
                  confirmText !== "cancel order" ||
                  cancelling
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
