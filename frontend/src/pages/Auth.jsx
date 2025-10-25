import React from "react";
import {useAuth} from "../contexts/AuthContext.jsx";
import {LogOut, User, Loader2, Mail} from "lucide-react";
import {FcGoogle} from "react-icons/fc";

const GoogleAuth = () => {
  const {user, mongoUser, signInWithGoogle, signOutWithGoogle, loading} =
    useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow border border-gray-200 p-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            <img
              src={user?.photoURL}
              alt={user?.displayName || "User"}
              className="w-20 h-20 rounded-full border border-gray-200 shadow-sm"
            />
          </div>

          {/* User Info */}
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

          {/* Divider */}
          <div className="border-t my-6"></div>

          {/* Sign Out Button */}
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to IT World
          </h2>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700 cursor-pointer">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  );
};

export default GoogleAuth;
