import {useParams, useNavigate} from "react-router-dom";
import {useOrder} from "../contexts/OrderContext.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {ArrowLeft, CheckCircle, XCircle, Truck, Loader2} from "lucide-react";
import {useState, useEffect} from "react";

const OrderDetail = () => {
  const {orderId} = useParams();
  const navigate = useNavigate();
  const {fetchOrderById} = useOrder();
  const {getProductsByIds} = useProducts();
  const {user} = useAuth();
  // const [order, setOrder] = useState(fetchOrderById(orderId));
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

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
  }, [orderId, user]);

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
    Delivered: <CheckCircle className="w-5 h-5 text-green-600" />,
    Pending: <Truck className="w-5 h-5 text-yellow-600" />,
    Cancelled: <XCircle className="w-5 h-5 text-red-600" />,
  };

  const statusColors = {
    Delivered: "text-green-700 bg-green-100",
    Pending: "text-yellow-700 bg-yellow-100",
    Cancelled: "text-red-700 bg-red-100",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 lg:px-16">
      {/* <button
        onClick={() => navigate("/orders")}
        className="flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
      </button> */}
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
              {statusIcons[order.status]}
              <span className="ml-1">{order.status}</span>
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
                    className="flex items-center bg-gray-50 rounded-lg p-3"
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

              <div className="border-t border-gray-200 my-3"></div>

              <p>Payment Method: {order.paymentMethod.toUpperCase()}</p>
              {order?.paymentId ? (
                <p>Payment ID: {order.paymentId || "N/A"}</p>
              ) : null}
              <div className="border-t border-gray-200 my-3"></div>

              <p>
                Total: ₹{order.productData.totalPrice.toLocaleString("en-IN")}
              </p>
              {order.productData.tax > 0 && (
                <p>Tax: ₹{order.productData.tax.toLocaleString("en-IN")}</p>
              )}
              {order.productData.deliveryCharge > 0 && (
                <p>
                  Delivery: ₹
                  {order.productData.deliveryCharge.toLocaleString("en-IN")}
                </p>
              )}

              <div className="border-t border-gray-200 my-3"></div>

              <p>
                Order Date:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p>Expected Delivery: {deliveryDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
