import React, {useState} from "react";
import {useAuth} from "../contexts/AuthContext.jsx";
import {LogOut, User, Loader2, Mail, MapPin, X} from "lucide-react";
import {FcGoogle} from "react-icons/fc";
import {useNavigate} from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {auth} from "../config/firebase.js";

const Auth = () => {
  const {user, mongoUser, signInWithGoogle, signOutWithGoogle, loading} =
    useAuth();
  const navigate = useNavigate();

  // Form states
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  // Pincode modal states
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError("");
  };

  // Email/Password Sign Up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Update user profile with name
      await userCredential.user.updateProfile({
        displayName: formData.name,
      });

      // Send user data to backend
      const token = await userCredential.user.getIdToken();
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          token,
          name: formData.name,
          email: formData.email,
        }),
      });

      // Show pincode modal
      setShowPincodeModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Email/Password Sign In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Auth context will handle the rest
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign In with Pincode Check
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      // After successful Google sign-in, show pincode modal for new users
      setShowPincodeModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Check Pincode Availability
  const handlePincodeCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    setPincodeLoading(true);
    setPincodeError("");
    setPincodeVerified(true);
    return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/check-pincode`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({pincode}),
        }
      );

      const data = await response.json();

      if (data.deliverable) {
        setPincodeVerified(true);
      } else {
        setPincodeError("Sorry, we don't deliver to this pincode yet");
      }
    } catch (err) {
      setPincodeError("Error checking pincode. Please try again.");
    } finally {
      setPincodeLoading(false);
    }
  };

  // Continue to Phase 2
  const handleContinueToPhase2 = () => {
    navigate("/complete-profile", {state: {pincode}});
  };

  // If loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // If user is logged in
  if (user && !showPincodeModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex justify-center mb-4">
            <img
              src={user?.photoURL || "https://via.placeholder.com/80"}
              alt={user?.displayName || "User"}
              className="w-20 h-20 rounded-full border border-gray-200 shadow-sm"
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center justify-center gap-1">
              <User className="w-4 h-4 text-blue-600" />
              {mongoUser?.name || user.displayName}
            </h2>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Mail className="w-4 h-4 text-gray-400" />
              {mongoUser?.email || user.email}
            </p>
          </div>

          <div className="border-t my-6"></div>

          <button
            onClick={signOutWithGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-500">
              {isSignUp ? "Sign up to continue" : "Sign in to continue"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form
            onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn}
            className="space-y-4 mb-6"
          >
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">
              Continue with Google
            </span>
          </button>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setFormData({name: "", email: "", password: ""});
              }}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* Pincode Verification Modal */}
      {/* {showPincodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Check Delivery Availability
              </h3>
              <button
                onClick={() => {
                  setShowPincodeModal(false);
                  setPincode("");
                  setPincodeVerified(false);
                  setPincodeError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!pincodeVerified ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your pincode to check if we deliver to your area
                </p>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) {
                          setPincode(value);
                          setPincodeError("");
                        }
                      }}
                      placeholder="Enter 6-digit pincode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handlePincodeCheck}
                    disabled={pincodeLoading || pincode.length !== 6}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {pincodeLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>

                {pincodeError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {pincodeError}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Great news!</span>
                  </div>
                  <p className="text-sm text-green-600">
                    We deliver to pincode {pincode}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleContinueToPhase2}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                  >
                    Back to Browsing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )} */}
    </>
  );
};

export default Auth;
