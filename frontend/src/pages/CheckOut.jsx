import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Banknote,
  Edit2,
  Check,
  Loader2,
  Phone,
  Store,
} from "lucide-react";
import Toast from "../components/Toast.jsx";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useProducts } from "../contexts/ProductsContext.jsx";
import { useOrder } from "../contexts/OrderContext.jsx";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user, mongoUser } = useAuth();
  const { initiatePayment, createOrder, isOrderProcessing } = useOrder();
  const { products } = useProducts();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({});
  const buyNowItemId = state?.buyNowItemId;
  const buyNowQuantity = state?.buyNowQuantity ?? 1; // if product card sends quantity, backend can pass it via state

  const buyNowItem = useMemo(() => {
    if (!buyNowItemId) return null;
    const p = products.find((p) => p.product_id === buyNowItemId);
    if (!p) return null;
    return { ...p, quantity: buyNowQuantity }; // ensure quantity exists for buy-now flow
  }, [buyNowItemId, products, buyNowQuantity]);

  const itemsToCheckout = buyNowItem ? [buyNowItem] : cartItems;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    paymentMethod: "",
  });

  const [errors, setErrors] = useState({});
  const [phoneError, setPhoneError] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form data from mongoUser
  useEffect(() => {
    if (mongoUser) {
      setFormData({
        name: mongoUser.name || "",
        phone: mongoUser.phone || "",
        address: mongoUser.address?.fullAddress || "",
        landmark: mongoUser.address?.landmark || "",
        city: mongoUser.address?.city || "",
        state: mongoUser.address?.state || "",
        country: mongoUser.address?.country || "India",
        pincode: mongoUser.address?.pincode || "",
        paymentMethod: "",
      });

      if (mongoUser.phone) setIsEditingPhone(false);
      if (mongoUser.address?.fullAddress && mongoUser.address?.city)
        setIsEditingAddress(false);
    }
  }, [mongoUser, user]);

  // subtotal should be based on itemsToCheckout (handles buy-now correctly)
  const subtotal = itemsToCheckout.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity ?? 1),
    0
  );
  const tax = Math.round(subtotal * 0.18);
  const deliveryCharge = subtotal > 50000 ? 0 : 500;
  const total = subtotal + tax + deliveryCharge;

  const validatePhone = (phoneNumber) => {
    const digitsOnly = (phoneNumber || "").replace(/\D/g, "");
    if (!digitsOnly) {
      setPhoneError("");
      return false;
    }
    if (digitsOnly.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    if (!/^[6-9]/.test(digitsOnly)) {
      setPhoneError("Phone number must start with 6, 7, 8, or 9");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: phoneValue }));
      if (phoneValue) validatePhone(phoneValue);
      else setPhoneError("");
    } else if (name === "pincode") {
      const pincodeValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: pincodeValue }));
    } else if (name === "paymentMethod") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleContactSave = async () => {
    const contactErrors = {};

    if (!formData.name.trim()) contactErrors.name = "Name is required";
    else if (formData.name.trim().length < 3)
      contactErrors.name = "Name must be at least 3 characters";

    if (!formData.phone.trim())
      contactErrors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone))
      contactErrors.phone = phoneError || "Invalid phone number";

    if (Object.keys(contactErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...contactErrors }));
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const phoneResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-phone`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone: formData.phone }),
        }
      );

      const phoneData = await phoneResponse.json();
      if (phoneData.success) {
        setIsEditingPhone(false);
        console.log("Contact information saved successfully!");
      } else {
        console.log("Failed to save contact details. Please try again.");
      }
    } catch (err) {
      console.error("Error saving contact details:", err);
      console.log("Error saving contact details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      setToastData({
        message: "Please enter your phone number!",
        type: "information",
      });
      setShowToast(true);
    } else if (!validatePhone(formData.phone))
      newErrors.phone = phoneError || "Invalid phone number";

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      setToastData({
        message: "Please enter your address!",
        type: "information",
      });
      setShowToast(true);
    }
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode";

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
      setToastData({
        message: "Please select a payment method!",
        type: "information",
      });
      setShowToast(true);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSave = async () => {
    const addressErrors = {};
    if (!formData.address.trim()) addressErrors.address = "Address is required";
    if (!formData.city.trim()) addressErrors.city = "City is required";
    if (!formData.state.trim()) addressErrors.state = "State is required";

    if (!formData.pincode.trim()) addressErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode))
      addressErrors.pincode = "Enter a valid 6-digit pincode";

    if (Object.keys(addressErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...addressErrors }));
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const addressResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-address`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address: {
              fullAddress: formData.address,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
              country: formData.country,
              pincode: formData.pincode,
            },
          }),
        }
      );

      const addressData = await addressResponse.json();
      if (addressData.success) {
        setIsEditingAddress(false);
        console.log("Address saved successfully!");
      } else {
        console.log("Failed to save address. Please try again.");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      console.log("Error saving address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buildOrderPayload = () => {
    const userId = mongoUser?._id || user?.uid || "";
    const productsList = itemsToCheckout.map((it) => ({
      product_id: it.product_id,
      product_name: it.product_name,
      quantity: it.quantity ?? 1,
      product_price: it.price,
      image: it.image,
    }));

    const subtotal = productsList.reduce(
      (sum, p) => sum + p.product_price * p.quantity,
      0
    );

    const tax = Math.round(subtotal * 0.18);
    const deliveryCharge = subtotal > 50000 ? 0 : 500;

    const totalPrice = subtotal + tax + deliveryCharge;

    return {
      productData: {
        totalPrice,
        products: productsList,
      },
      shipping: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      },
      paymentMethod: formData.paymentMethod,
      meta: {
        fromBuyNow: Boolean(buyNowItem),
        createdAt: new Date().toISOString(),
      },
    };
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const payload = buildOrderPayload();
    if (formData.paymentMethod === "online") {
      const result = await initiatePayment(payload);

      if (!result.success) {
        setToastData({
          message: result.message || "Failed to initiate payment",
          type: "error",
        });
        setShowToast(true);
      }
      return;
    }

    try {
      const result = await createOrder(payload);

      if (result.success) {
        setToastData({
          message: "Order placed successfully!",
          type: "success",
        });
        setShowToast(true);
        setTimeout(() => {
          navigate(`/orders/${result.data.orderId}`);
        }, 1500);
      } else {
        setToastData({
          message: result.message || "Failed to place order",
          type: "error",
        });
        setShowToast(true);
      }
    } catch (error) {
      setToastData({
        message: "Something went wrong placing your order.",
        type: "error",
      });
      setShowToast(true);
      console.error(error);
    }
  };
  if (itemsToCheckout.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500">Add some items to proceed to checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-64 sm:py-8 lg:px-8 lg:py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-gray-700 mb-4 text-sm sm:text-base">
                    Please log in to continue with checkout.
                  </p>
                  <button
                    onClick={() =>
                      navigate("/auth/login", { state: { page: "/checkout" } })
                    }
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                  >
                    Continue to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Contact Information
                    </h2>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {formData.name || "Name not set"}
                    </p>
                  </div>

                  <div className="flex flex-col mb-4 bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      {!isEditingPhone && (
                        <button
                          type="button"
                          onClick={() => setIsEditingPhone(true)}
                          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingPhone ? (
                      <>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength="10"
                          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors.phone || phoneError
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your 10-digit phone number"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleContactSave}
                            disabled={loading}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                phone: mongoUser?.phone || "",
                              }));
                              setIsEditingPhone(false);
                              setPhoneError("");
                              setErrors((prev) => ({ ...prev, phone: "" }));
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-700">
                        {formData.phone || "Phone number not set"}
                      </p>
                    )}

                    {(errors.phone || phoneError) && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">
                        {errors.phone || phoneError}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </h2>
                {!isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="House/Flat no., Building name, Street"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Near Hospital, Mall, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                        placeholder="India"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength="6"
                        className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors.pincode ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="6-digit pincode"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500">
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddressSave}
                      disabled={loading}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          address: mongoUser?.address?.fullAddress || "",
                          landmark: mongoUser?.address?.landmark || "",
                          city: mongoUser?.address?.city || "",
                          state: mongoUser?.address?.state || "",
                          country: mongoUser?.address?.country || "India",
                          pincode: mongoUser?.address?.pincode || "",
                        }));
                        setIsEditingAddress(false);
                        setErrors((prev) => ({
                          ...prev,
                          address: "",
                          city: "",
                          state: "",
                          pincode: "",
                        }));
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-900">{formData.address}</p>
                  {formData.landmark && (
                    <p className="text-gray-600 mt-1">
                      Landmark: {formData.landmark}
                    </p>
                  )}
                  <p className="text-gray-600 mt-1">
                    {formData.city}, {formData.state} - {formData.pincode}
                  </p>
                  <p className="text-gray-600">{formData.country}</p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Store Pickup */}
                <div
                  onClick={() =>
                    handleInputChange({
                      target: { name: "paymentMethod", value: "sp" },
                    })
                  }
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                    formData.paymentMethod === "sp"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        formData.paymentMethod === "sp"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Store
                        className={`w-6 h-6 ${
                          formData.paymentMethod === "sp"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-semibold ${
                          formData.paymentMethod === "sp"
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        Store Pickup
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          formData.paymentMethod === "sp"
                            ? "text-blue-700"
                            : "text-gray-600"
                        }`}
                      >
                        Pay at the store upon pickup
                      </p>
                    </div>
                  </div>
                </div>

                {/* Online Payment */}
                <div
                  onClick={() =>
                    handleInputChange({
                      target: { name: "paymentMethod", value: "online" },
                    })
                  }
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                    formData.paymentMethod === "online"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        formData.paymentMethod === "online"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <CreditCard
                        className={`w-6 h-6 ${
                          formData.paymentMethod === "online"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-semibold ${
                          formData.paymentMethod === "online"
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        Online Payment
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          formData.paymentMethod === "online"
                            ? "text-blue-700"
                            : "text-gray-600"
                        }`}
                      >
                        UPI, Cards, Net Banking & More
                      </p>

                      <div className="flex-wrap gap-2 mt-3 md:flex hidden">
                        {[
                          "Google Pay",
                          "PhonePe",
                          "Paytm",
                          "Cards",
                          "Net Banking",
                        ].map((provider) => (
                          <span
                            key={provider}
                            className={`text-xs px-3 py-1 rounded-full ${
                              formData.paymentMethod === "online"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {provider}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery (Disabled) */}
                <div className="relative border-2 rounded-xl p-5 transition-all duration-200 border-gray-200 bg-gray-50 cursor-not-allowed opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200">
                      <Banknote className="w-6 h-6 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-500">
                          Cash on Delivery
                        </h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full md:block hidden">
                          Unavailable
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-gray-400">
                        Currently unavailable
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {errors.paymentMethod && (
                <p className="mt-4 text-xs sm:text-sm text-red-500">
                  {errors.paymentMethod}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-20">
              {/* Price breakdown */}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="text-gray-900">
                    ₹{tax.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span
                    className={
                      deliveryCharge === 0
                        ? "text-green-600 font-medium"
                        : "text-gray-900"
                    }
                  >
                    {deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment not available notice */}
              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800 text-center">
                  Online payment is currently unavailable
                </p>
                <p className="text-xs text-yellow-700 text-center mt-1">
                  Please contact us to confirm availability and complete your
                  order.
                </p>
              </div>

              {/* Contact details */}
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm font-medium text-gray-800">
                  Contact for order booking
                </p>

                <div className="mt-2 space-y-1text-sm flex items-center justify-center">
                  <p className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} />
                    <a
                      href="tel:+919665865056"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      +91 96658 65056
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastData.message}
          type={toastData.type}
          duration={toastData.duration}
          onclose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
