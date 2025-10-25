import React, {createContext, useContext, useState, useEffect} from "react";
import {auth, googleProvider} from "../config/firebase.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({token}),
        }
      );

      const data = await res.json();
      setUser(firebaseUser);
      setMongoUser(data.user);
      console.log("firebaseUser", firebaseUser);
      console.log("mongoUser", data.user);
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  const signOutWithGoogle = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setMongoUser(null);
      localStorage.removeItem("cart");
      console.log("User signed out successfully");
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
          {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({token}),
          }
        );
        const data = await res.json();
        setMongoUser(data.user);

        // Sync guest cart to backend
        const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (guestCart.length) {
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/cart/update-cart`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({cart: guestCart}),
            }
          );
          localStorage.removeItem("cart");
        }
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{user, mongoUser, loading, signInWithGoogle, signOutWithGoogle}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
