import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"

const firebaseConfig = {
    apiKey: `${import.meta.env.VITE_FIREBASE_APIKEY}`,
    authDomain: `${import.meta.env.VITE_FIREBASE_AUTHODOMAIN}`,
    projectId: `${import.meta.env.VITE_FIREBASE_PROJECTID}`,
    storageBucket: `${import.meta.env.VITE_FIREBASE_STORAGEBUCKET}`,
    messagingSenderId: `${import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID}`,
    appId: `${import.meta.env.VITE_FIREBASE_APPID}`,
    measurementId: `${import.meta.env.VITE_FIREBASE_MEASUREMENTID}`
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
};