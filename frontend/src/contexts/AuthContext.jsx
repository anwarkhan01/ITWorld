import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
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

  const authStateHandledRef = useRef(false);

  const fetchMongoUser = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch mongo user");
      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error("Failed to fetch mongo user:", error);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const mongoData = await fetchMongoUser(firebaseUser);

      setUser(firebaseUser);
      setMongoUser(mongoData);
    } catch (err) {
      console.error("Google sign-in failed:", err);
      throw err;
    }
  };

  const signOutWithGoogle = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setMongoUser(null);
      localStorage.removeItem("cart");
    } catch (err) {
      console.error("Sign-out failed:", err);
      throw err;
    }
  };

  // Handle Firebase auth state changes
  useEffect(() => {
    authStateHandledRef.current = false;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Prevent multiple runs for the same auth state
      if (authStateHandledRef.current) {
        setLoading(false);
        return;
      }

      try {
        if (firebaseUser) {
          const mongoData = await fetchMongoUser(firebaseUser);
          setUser(firebaseUser);
          setMongoUser(mongoData);
        } else {
          setUser(null);
          setMongoUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        authStateHandledRef.current = true;
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        mongoUser,
        loading,
        signInWithGoogle,
        signOutWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
