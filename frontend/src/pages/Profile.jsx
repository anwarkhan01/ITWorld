import React, {useState, useEffect} from "react";
import {useAuth} from "../contexts/AuthContext.jsx";
import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  ChevronRight,
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Toast from "../components/Toast.jsx";
import {useOrder} from "../contexts/OrderContext.jsx";

const Profile = () => {
  const {user, mongoUser, signOutWithGoogle} = useAuth();
  const navigate = useNavigate();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({});
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const {orders, orderLoading, error: orderError, fetchOrders} = useOrder();
  const [addressData, setAddressData] = useState({
    fullAddress: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeMessage, setPincodeMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Initialize form data from mongoUser
  useEffect(() => {
    if (mongoUser) {
      setPhone(mongoUser.phone || "");
      setAddressData({
        fullAddress: mongoUser.address?.fullAddress || "",
        landmark: mongoUser.address?.landmark || "",
        city: mongoUser.address?.city || "",
        state: mongoUser.address?.state || "",
        country: mongoUser.address?.country || "India",
        pincode: mongoUser.address?.pincode || "",
      });
    }
  }, [mongoUser]);

  const validatePhone = (phoneNumber) => {
    // Remove all non-digit characters
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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    if (value) {
      validatePhone(value);
    } else {
      setPhoneError("");
    }
  };

  const handleSavePhone = async () => {
    if (!phone.trim()) {
      setPhoneError("Please enter a phone number");
      return;
    }

    if (!validatePhone(phone)) {
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-phone`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({phone}),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsEditingPhone(false);
        setPhoneError("");
        setToastData({
          message: "Phone number updated successfully!",
          type: "success",
        });
        setShowToast(true);
      } else {
        setIsEditingPhone(false);
        setPhoneError("");
        setToastData({
          message: data.message || "Failed to update phone number",
          type: "failure",
        });
        setShowToast(true);
      }
    } catch (err) {
      setIsEditingPhone(false);
      setPhoneError("");
      setToastData({
        message: "Error updating phone number",
        type: "failure",
      });
      setShowToast(true);
      console.error("Error updating phone:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (
      !addressData.fullAddress.trim() ||
      !addressData.city.trim() ||
      !addressData.state.trim() ||
      !addressData.pincode.trim()
    ) {
      setToastData({
        message: "Please fill in all required fields",
        type: "success",
      });
      setShowToast(true);
      return;
    }

    // if (pincodeStatus !== "valid") {
    //   alert("Please enter a valid pincode with delivery available");
    //   return;
    // }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-address`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({address: addressData}),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsEditingAddress(false);
        setToastData({
          message: "Address updated successfully!",
          type: "success",
        });
        setShowToast(true);
      } else {
        setIsEditingAddress(false);
        setToastData({
          message: data.message || "Failed to update address",
          type: "failure",
        });
        setShowToast(true);
      }
    } catch (err) {
      setIsEditingAddress(false);
      setToastData({
        message: data.message || "Error updating address",
        type: "failure",
      });
      setShowToast(true);
      console.error("Error updating address:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutWithGoogle();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <img
              src={
                user?.photoURL ||
                mongoUser?.photoURL ||
                "https://via.placeholder.com/120"
              }
              alt={mongoUser?.name || user?.displayName || "User"}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-200 shadow-sm object-cover"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {mongoUser?.name || user?.displayName || "User"}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-xs sm:text-sm break-all">
                  {mongoUser?.email || user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
        {/* Contact Information Card */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>

          {/* Phone Number */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs sm:text-sm font-medium">
                  Phone Number
                </span>
              </div>
              {!isEditingPhone && (
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {isEditingPhone ? (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    phoneError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="9876543210"
                  maxLength={10}
                />
                {phoneError && (
                  <p className="text-xs text-red-600">{phoneError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePhone}
                    disabled={loading || !!phoneError || !phone}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPhone(mongoUser?.phone || "");
                      setIsEditingPhone(false);
                      setPhoneError("");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 ml-0 sm:ml-7 text-xs sm:text-sm mt-1">
                {phone || "No phone number added"}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs sm:text-sm font-medium">
                  Delivery Address
                </span>
              </div>
              {!isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="flex flex-col gap-3 mt-2">
                {/* Full Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={addressData.fullAddress}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        fullAddress: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="House No., Building Name, Street, Area"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={(e) =>
                      setAddressData({...addressData, landmark: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Near Hospital, Mall, etc."
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressData.city}
                      onChange={(e) =>
                        setAddressData({...addressData, city: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressData.state}
                      onChange={(e) =>
                        setAddressData({...addressData, state: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                {/* Country and Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={addressData.country}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          country: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      placeholder="India"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={addressData.pincode}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setAddressData({...addressData, pincode: value});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                        placeholder="400001"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleSaveAddress}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Address
                  </button>
                  <button
                    onClick={() => {
                      setAddressData({
                        fullAddress: mongoUser?.address?.fullAddress || "",
                        landmark: mongoUser?.address?.landmark || "",
                        city: mongoUser?.address?.city || "",
                        state: mongoUser?.address?.state || "",
                        country: mongoUser?.address?.country || "India",
                        pincode: mongoUser?.address?.pincode || "",
                      });
                      setIsEditingAddress(false);
                      setPincodeStatus(null);
                      setPincodeMessage("");
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="ml-0 sm:ml-7 text-xs sm:text-sm mt-1">
                {addressData.fullAddress ? (
                  <div className="text-gray-900 space-y-1">
                    <p>{addressData.fullAddress}</p>
                    {addressData.landmark && (
                      <p className="text-gray-600">
                        Landmark: {addressData.landmark}
                      </p>
                    )}
                    <p className="text-gray-600">
                      {addressData.city}, {addressData.state} -{" "}
                      {addressData.pincode}
                    </p>
                    <p className="text-gray-600">{addressData.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No address added</p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Order */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 mt-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Recent Orders
          </h2>

          {orderLoading ? (
            <div className="flex items-center text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading
              orders...
            </div>
          ) : orderError ? (
            <p className="text-sm text-red-600">{orderError}</p>
          ) : !orders?.length ? (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <p className="text-sm text-gray-500 mb-2">No orders yet.</p>
              <button
                onClick={() => navigate("/orders")}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                View Orders
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {orders.slice(0, 2).map((order) => {
                  const first = order.productData.products[0];
                  const date = new Date(order.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <div
                      key={order.orderId}
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                      className="flex justify-between items-center py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors px-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {first?.product_name || "Product"}
                          {order.productData.products.length > 1 && (
                            <span className="text-gray-500 text-xs ml-1">
                              + {order.productData.products.length - 1} more
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ordered on {date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          ₹
                          {order.productData.totalPrice.toLocaleString("en-IN")}
                        </p>
                        <p
                          className={`text-xs ${
                            order.status === "Delivered"
                              ? "text-green-600"
                              : order.status === "Cancelled"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center sm:justify-end mt-4">
                <button
                  onClick={() => navigate("/orders")}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View All Orders
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
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

export default Profile;
