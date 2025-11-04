import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  auth,
  googleProvider,
  registerWithEmail as firebaseRegister,
  loginWithEmail as firebaseLogin,
} from "../config/firebase.js";
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

  const syncEmailUserWithMongo = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/email-sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to sync user with MongoDB");
      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error("Failed to sync email user:", error);
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

  const registerWithEmail = async (email, password, name) => {
    try {
      const firebaseUser = await firebaseRegister(email, password, name);
      return {user: firebaseUser};
    } catch (err) {
      console.error("Email registration failed:", err);
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const firebaseUser = await firebaseLogin(email, password);

      if (!firebaseUser.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error(
          "Please verify your email before logging in. Check your inbox."
        );
      }

      const mongoData = await syncEmailUserWithMongo(firebaseUser);

      setUser(firebaseUser);
      setMongoUser(mongoData);

      return {user: firebaseUser, mongoUser: mongoData};
    } catch (err) {
      console.error("Email login failed:", err);
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
          // Check if it's a Google user or email user
          const isGoogleUser = firebaseUser.providerData.some(
            (provider) => provider.providerId === "google.com"
          );

          let mongoData;
          if (isGoogleUser) {
            mongoData = await fetchMongoUser(firebaseUser);
          } else {
            mongoData = await syncEmailUserWithMongo(firebaseUser);
          }

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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        mongoUser,
        loading,
        signInWithGoogle,
        signOutWithGoogle,
        registerWithEmail,
        loginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
