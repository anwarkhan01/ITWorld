import {useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Trash2, Plus, Minus, Truck} from "lucide-react";
import {useCart} from "../contexts/CartContext.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import Toast from "../components/Toast.jsx";

export default function Cart() {
  const {cartItems, increaseQty, decreaseQty, removeFromCart, clearCart} =
    useCart();
  const {user} = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({});

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
      0
    );
    const shipping = subtotal >= 999 ? 0 : 99;
    const discount = subtotal > 2000 ? 200 : 0;
    const grandTotal = Math.max(0, subtotal - discount + shipping);
    return {subtotal, discount, shipping, grandTotal};
  }, [cartItems]);

  const handleCheckoutClick = () => {
    navigate("/checkout");
  };

  const handleRemoveItem = (productId, name) => {
    removeFromCart(productId);
    setToastData({
      message: `${name} removed from cart`,
      type: "success",
    });
    setShowToast(true);
  };
  const handlePincodeSuccess = (pincode) => {
    navigate("/checkout", {state: {pincode}});
  };

  return (
    <main className="bg-gray-50 min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500 text-sm">Your cart is empty.</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.toReversed().map((it) => (
                <div
                  key={it.product_id}
                  className="flex gap-4 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
                >
                  <Link
                    to={`/product/${it.product_id}`}
                    className="block w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={
                        it.image || "https://placehold.co/300x300?text=No+Image"
                      }
                      alt={it.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${it.id}`}
                        className="font-semibold text-gray-800 hover:text-blue-600 transition"
                      >
                        {it.product_name}
                      </Link>
                      {it.intro_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {it.intro_description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="inline-flex items-center rounded-md border border-gray-300">
                        <button
                          onClick={() => decreaseQty(it.product_id)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-10 text-center text-sm">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => increaseQty(it.product_id)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">
                          ₹{it.price}
                        </p>
                        <button
                          onClick={() =>
                            handleRemoveItem(it.product_id, it.product_name)
                          }
                          className="text-xs cursor-pointer text-red-500 hover:text-red-700 mt-1 inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={clearCart}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  Clear Cart
                </button>
                <Link
                  to="/"
                  className="rounded-md bg-white px-3 py-2 text-sm shadow-sm hover:shadow-md border border-gray-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 h-max">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              {/* Product list */}
              <div className="space-y-4">
                {cartItems.toReversed().map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {item.product_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Qty: {item.quantity} x ₹{item.price}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{totals.discount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {totals.shipping === 0 ? "Free" : `₹${totals.shipping}`}
                  </span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{totals.grandTotal}</span>
                </div>
              </div>

              {/* Proceed to checkout */}
              <button
                className="mt-6 w-full cursor-pointer bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                onClick={handleCheckoutClick}
              >
                Proceed to Checkout
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                <Truck className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                Free shipping on orders above ₹999
              </p>
            </div>
          </div>
        )}
      </div>
      {showToast && (
        <Toast
          message={toastData.message}
          type={toastData.type}
          duration={toastData.duration}
          onclose={() => setShowToast(false)}
        />
      )}
    </main>
  );
}
