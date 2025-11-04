import React, {useState} from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";
import {User, Mail, Lock, Loader2, ArrowRight, CheckCircle} from "lucide-react";
import {FcGoogle} from "react-icons/fc";
import {useNavigate} from "react-router-dom";

const Register = () => {
  const {signInWithGoogle, registerWithEmail} = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({name: "", email: "", password: ""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerWithEmail(formData.email, formData.password, formData.name);
      setVerificationSent(true);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError("");
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              We've sent a verification link to{" "}
              <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your inbox and click the verification link to
              complete your registration.
            </p>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-500">Sign up to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">
            Continue with Google
          </span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or register with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailRegister} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account?</span>
          <a
            href="/auth/login"
            className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
