// Social authentication utilities for Google and Facebook sign-in
import { GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { auth, db } from '../config/firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { generateUniqueUsername } from './usernameGenerator';

// Google Sign-In
export const signInWithGoogle = async () => {
    try {
        // For Expo, we use expo-auth-session
        // This will open a browser for Google sign-in
        const [request, response, promptAsync] = Google.useAuthRequest({
            expoClientId: 'YOUR_EXPO_CLIENT_ID', // TODO: Add from Google Cloud Console
            iosClientId: 'YOUR_IOS_CLIENT_ID',
            androidClientId: 'YOUR_ANDROID_CLIENT_ID',
            webClientId: 'YOUR_WEB_CLIENT_ID',
        });

        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            const result = await signInWithCredential(auth, credential);

            // Check if user document exists, if not create one with anonymous username
            await ensureUserDocument(result.user);

            return result.user;
        }

        return null;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Facebook Sign-In
export const signInWithFacebook = async () => {
    try {
        const [request, response, promptAsync] = Facebook.useAuthRequest({
            clientId: 'YOUR_FACEBOOK_APP_ID', // TODO: Add from Facebook Developer Console
        });

        if (response?.type === 'success') {
            const { access_token } = response.params;
            const credential = FacebookAuthProvider.credential(access_token);
            const result = await signInWithCredential(auth, credential);

            // Check if user document exists, if not create one with anonymous username
            await ensureUserDocument(result.user);

            return result.user;
        }

        return null;
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        throw error;
    }
};

// Ensure user document exists in Firestore with anonymous username
const ensureUserDocument = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Generate anonymous username for new social auth users
        const username = await generateUniqueUsername(db, true);

        await setDoc(userRef, {
            uid: user.uid,
            username: username,
            email: user.email,
            realName: user.displayName || null, // Store real name privately
            createdAt: serverTimestamp(),
            stats: {
                shared: 0,
                rescued: 0,
                karma: 0
            }
        });

        // Update Firebase Auth displayName to anonymous username
        await user.updateProfile({ displayName: username });
    }
};
