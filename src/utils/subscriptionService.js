// Subscription and Platform Fee Service
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Calculate platform fee (10% of price)
 * Free items (€0.00) have no fee
 */
export const calculatePlatformFee = (price) => {
    if (!price || price === 0) return 0;
    return price * 0.10; // 10% fee
};

/**
 * Calculate what the giver receives after platform fee
 */
export const calculateGiverReceives = (price) => {
    if (!price || price === 0) return 0;
    const fee = calculatePlatformFee(price);
    return price - fee;
};

/**
 * Check if user's trial is still active
 */
export const isTrialActive = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return false;

        const userData = userDoc.data();

        // If no trial data, user signed up before freemium - give them trial
        if (!userData.trialStartDate) {
            return true; // Legacy users get benefit of doubt
        }

        const trialEndDate = userData.trialEndDate?.toDate();
        if (!trialEndDate) return false;

        return new Date() < trialEndDate;
    } catch (error) {
        console.error('Error checking trial status:', error);
        return false;
    }
};

/**
 * Get user's subscription status
 */
export const getSubscriptionStatus = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { status: 'unknown', daysRemaining: 0 };
        }

        const userData = userDoc.data();

        // Legacy users (no trial data)
        if (!userData.trialStartDate) {
            return { status: 'trial', daysRemaining: 7, isLegacy: true };
        }

        const trialEndDate = userData.trialEndDate?.toDate();
        const now = new Date();

        if (now < trialEndDate) {
            const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
            return {
                status: 'trial',
                daysRemaining,
                trialEndDate: trialEndDate.toLocaleDateString()
            };
        }

        return {
            status: 'active', // Post-trial, fees apply
            daysRemaining: 0,
            trialEnded: true
        };
    } catch (error) {
        console.error('Error getting subscription status:', error);
        return { status: 'error', daysRemaining: 0 };
    }
};

/**
 * Initialize trial for new user
 */
export const initializeTrial = async (userId) => {
    try {
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

        await updateDoc(doc(db, 'users', userId), {
            trialStartDate: serverTimestamp(),
            trialEndDate: trialEndDate,
            subscriptionStatus: 'trial',
            totalEarnings: 0,
            totalFees: 0,
            updatedAt: serverTimestamp()
        });

        return { success: true, trialEndDate };
    } catch (error) {
        console.error('Error initializing trial:', error);
        return { success: false, error };
    }
};

/**
 * Format fee breakdown for display
 */
export const formatFeeBreakdown = (price) => {
    if (!price || price === 0) {
        return {
            price: '€0.00',
            fee: '€0.00',
            giverReceives: '€0.00',
            isFree: true
        };
    }

    const fee = calculatePlatformFee(price);
    const giverReceives = calculateGiverReceives(price);

    return {
        price: `€${price.toFixed(2)}`,
        fee: `€${fee.toFixed(2)}`,
        giverReceives: `€${giverReceives.toFixed(2)}`,
        isFree: false
    };
};
