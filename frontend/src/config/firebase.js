import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from "firebase/auth";

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

export const registerWithEmail = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
};

export const loginWithEmail = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logout = async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
};