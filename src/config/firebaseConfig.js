import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyC1-WlZ25oxO9c8Gm7XSeQvEWEMAwn4un0",
    authDomain: "lastbite-47228.firebaseapp.com",
    projectId: "lastbite-47228",
    storageBucket: "lastbite-47228.firebasestorage.app",
    messagingSenderId: "973346187550",
    appId: "1:973346187550:web:c9f2bfc479ea40847e410f",
    measurementId: "G-98PB30N701"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
