import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart } from 'lucide-react-native';
import SwipeDeck from '../components/SwipeDeck';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { getCurrentLocation, filterByDistance, formatDistance } from '../utils/locationService';

const HomeScreen = ({ navigation }) => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const swipeLeftTrigger = useRef(null);
    const swipeRightTrigger = useRef(null);

    useEffect(() => {
        loadFoodItems();
    }, []);

    const loadFoodItems = async () => {
        try {
            // Get user's current location
            const location = await getCurrentLocation();
            console.log('User location:', location);
            setUserLocation(location);

            // Fetch available food items from Firestore
            const foodsRef = collection(db, 'foods');
            const q = query(
                foodsRef,
                where('status', '==', 'available'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('Food Items Loaded:', items.length);
            items.forEach(i => console.log(`- ${i.title} (${i.id})`));

            console.log('Raw food items:', items.map(i => ({
                title: i.title,
                hasLocation: !!i.location,
                location: i.location
            })));

            // Filter by distance (5km radius) and add distance info
            const filteredItems = location
                ? filterByDistance(items, location, 5)
                : items;

            console.log('Filtered items with distance:', filteredItems.map(i => ({
                title: i.title,
                distance: i.distance
            })));

            // Format for display
            const formattedItems = filteredItems.map(item => ({
                ...item,
                image: item.imageUrl,
                distance: item.distance ? formatDistance(item.distance) : null,
                tags: [item.location?.district || item.location?.city || 'Munich']
            }));

            setFoodItems(formattedItems);
        } catch (error) {
            console.error('Error loading food items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipeLeft = (item) => {
        console.log('Passed:', item.title);
    };

    const handleSwipeRight = async (item) => {
        console.log('Liked:', item.title);

        try {
            const currentUser = auth.currentUser;

            // Don't allow users to request their own food
            if (item.createdBy === currentUser.uid) {
                Alert.alert('Oops!', 'You cannot request your own food item');
                return;
            }

            // Create interest/request (not instant reservation)
            const matchRef = await addDoc(collection(db, 'matches'), {
                foodId: item.id,
                foodTitle: item.title,
                foodImage: item.imageUrl,
                giverId: item.createdBy,
                giverUsername: item.creatorName,
                seekerId: currentUser.uid,
                seekerUsername: currentUser.displayName || 'Anonymous',
                status: 'interested', // New status: interested -> approved -> completed
                giverApproved: false,
                seekerConfirmed: false,
                giverConfirmed: false,
                createdAt: serverTimestamp()
            });

            // Remove from swipe deck
            setFoodItems(prev => prev.filter(f => f.id !== item.id));

            // Prompt user to send initial message
            Alert.alert(
                'Request Sent! 📬',
                `Now send a message to ${item.creatorName} with:\n• When you can pick up\n• Any questions about the food`,
                [
                    {
                        text: 'Send Message',
                        onPress: () => navigation.navigate('RequestChat', { matchId: matchRef.id })
                    }
                ]
            );
        } catch (error) {
            console.error('Request creation error:', error);
            Alert.alert('Error', 'Failed to send request. Please try again.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Branding */}
            <View style={styles.header}>
                <Text style={styles.logo}>LastBite 🍽️</Text>
                <Text style={styles.tagline}>Rescue food, one bite at a time</Text>
            </View>

            {/* Swipe Deck */}
            <View style={styles.deckContainer}>
                <SwipeDeck
                    data={foodItems}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeLeftPress={swipeLeftTrigger}
                    onSwipeRightPress={swipeRightTrigger}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton]}
                    onPress={() => swipeLeftTrigger.current?.()}
                >
                    <X size={32} color={COLORS.error} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={() => swipeRightTrigger.current?.()}
                >
                    <Heart size={32} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        alignItems: 'center',
        paddingTop: SPACING.m,
        paddingBottom: SPACING.s,
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    tagline: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginTop: 4,
        fontStyle: 'italic',
    },
    deckContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xl,
        paddingVertical: SPACING.l,
        paddingBottom: SPACING.xl,
    },
    actionButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    passButton: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.error,
    },
    likeButton: {
        backgroundColor: COLORS.primary,
    },
    loader: {
        flex: 1,
    },
});

export default HomeScreen;
