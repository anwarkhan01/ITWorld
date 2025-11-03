import React, {useState, useEffect, useMemo} from "react";
import {useLocation} from "react-router-dom";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  Edit2,
  Check,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {useCart} from "../contexts/CartContext";
import {useAuth} from "../contexts/AuthContext.jsx";
import {useProducts} from "../contexts/ProductsContext.jsx";
const CheckoutPage = () => {
  const {cartItems} = useCart();
  const {user, mongoUser} = useAuth();
  const {products} = useProducts();
  const {state} = useLocation();

  const buyNowItemId = state?.buyNowItemId;
  const buyNowItem = useMemo(() => {
    if (!buyNowItemId) return null;
    return products.find((p) => p.product_id === buyNowItemId);
  }, [buyNowItemId, products]);

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
  const [isEditingContact, setIsEditingContact] = useState(true);
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

      if (mongoUser.name && mongoUser.phone) {
        setIsEditingContact(false);
      }

      if (mongoUser.address?.fullAddress && mongoUser.address?.city) {
        setIsEditingAddress(false);
      }
    }
  }, [mongoUser]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.18);
  const deliveryCharge = subtotal > 50000 ? 0 : 500;
  const total = subtotal + tax + deliveryCharge;

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: Banknote,
      description: "Pay when you receive",
    },
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, Rupay",
    },
    {
      id: "razorpay",
      name: "Razorpay",
      icon: Wallet,
      description: "All payment options",
    },
  ];

  const validatePhone = (phoneNumber) => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");

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
    const {name, value} = e.target;

    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({...prev, [name]: phoneValue}));
      if (phoneValue) {
        validatePhone(phoneValue);
      } else {
        setPhoneError("");
      }
    } else if (name === "pincode") {
      const pincodeValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({...prev, [name]: pincodeValue}));
    } else {
      setFormData((prev) => ({...prev, [name]: value}));
    }

    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: ""}));
    }
  };

  const handleContactSave = async () => {
    const contactErrors = {};

    if (!formData.name.trim()) {
      contactErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      contactErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.phone.trim()) {
      contactErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      contactErrors.phone = phoneError || "Invalid phone number";
    }

    if (Object.keys(contactErrors).length > 0) {
      setErrors((prev) => ({...prev, ...contactErrors}));
      return;
    }

    // Save phone to backend
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
          body: JSON.stringify({phone: formData.phone}),
        }
      );

      const phoneData = await phoneResponse.json();

      if (phoneData.success) {
        setIsEditingContact(false);
        alert("Contact information saved successfully!");
      } else {
        alert("Failed to save contact details. Please try again.");
      }
    } catch (err) {
      console.error("Error saving contact details:", err);
      alert("Error saving contact details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = phoneError || "Invalid phone number";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSave = async () => {
    const addressErrors = {};

    if (!formData.address.trim()) addressErrors.address = "Address is required";
    if (!formData.city.trim()) addressErrors.city = "City is required";
    if (!formData.state.trim()) addressErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      addressErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      addressErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (Object.keys(addressErrors).length > 0) {
      setErrors((prev) => ({...prev, ...addressErrors}));
      return;
    }

    // Save to backend
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
        alert("Address saved successfully!");
      } else {
        alert("Failed to save address. Please try again.");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Error saving address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      console.log("Order placed:", {formData, cartItems, total});
      alert(
        "Order placed successfully! 🎉\n\nOrder details logged to console."
      );
      setIsProcessing(false);
    }, 2000);
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>
                {!isEditingContact && (
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingContact ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.phone || phoneError
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="10-digit mobile number"
                    />
                    {(errors.phone || phoneError) && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">
                        {errors.phone || phoneError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
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
                          name: mongoUser?.name || "",
                          phone: mongoUser?.phone || "",
                        }));
                        setIsEditingContact(false);
                        setPhoneError("");
                        setErrors((prev) => ({...prev, name: "", phone: ""}));
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">
                    {formData.name || "Name not set"}
                  </p>
                  <p className="text-gray-600">
                    Phone: {formData.phone || "Phone number not set"}
                  </p>
                </div>
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
                <div className="bg-gray-50 rounded-lg p-4">
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 ml-3 text-gray-600" />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {method.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.paymentMethod && (
                <p className="mt-2 text-xs sm:text-sm text-red-500">
                  {errors.paymentMethod}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {itemsToCheckout.toReversed().map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-start space-x-3"
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.product_name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Qty: {item.quantity} × ₹
                        {item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
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
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge === 0 && (
                  <p className="text-xs text-green-600">
                    Free delivery on orders above ₹50,000
                  </p>
                )}
              </div>

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

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
