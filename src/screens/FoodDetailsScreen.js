import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, ArrowLeft, MessageCircle, Check, Thermometer, Package, ShieldCheck } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const FoodDetailsScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const [loading, setLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null); // null, 'interested', 'approved', 'completed'

    useEffect(() => {
        checkRequestStatus();
    }, []);

    const checkRequestStatus = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const matchesRef = collection(db, 'matches');
            const q = query(
                matchesRef,
                where('foodId', '==', item.id),
                where('seekerId', '==', currentUser.uid)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const matchData = snapshot.docs[0].data();
                setRequestStatus(matchData.status);
            }
        } catch (error) {
            console.error('Error checking request status:', error);
        }
    };

    const handleRequest = async () => {
        const currentUser = auth.currentUser;

        if (item.createdBy === currentUser.uid) {
            Alert.alert('Oops!', 'You cannot request your own item');
            return;
        }

        setLoading(true);
        try {
            const matchRef = await addDoc(collection(db, 'matches'), {
                foodId: item.id,
                foodTitle: item.title,
                foodImage: item.imageUrl,
                giverId: item.createdBy,
                giverUsername: item.creatorName,
                seekerId: currentUser.uid,
                seekerUsername: currentUser.displayName || 'Anonymous',
                status: 'interested',
                giverApproved: false,
                seekerConfirmed: false,
                giverConfirmed: false,
                createdAt: serverTimestamp()
            });

            setRequestStatus('interested');
            Alert.alert(
                'Request Sent! 📬',
                `Now send a message to ${item.creatorName} to coordinate pickup.`,
                [
                    {
                        text: 'Send Message',
                        onPress: () => navigation.navigate('RequestChat', { matchId: matchRef.id })
                    },
                    { text: 'Later', style: 'cancel' }
                ]
            );
        } catch (error) {
            console.error('Error sending request:', error);
            Alert.alert('Error', 'Failed to send request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async () => {
        // We need to find the matchId to navigate to chat
        // Ideally we store matchId in state, but for now we can query it again or pass it if we have it
        // For simplicity, let's query it if we don't have it, or just navigate to My Pickups
        navigation.navigate('MyPickups');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image || item.imageUrl }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.priceBadge}>
                        {typeof item.originalPrice === 'number' && (
                            <Text style={styles.originalPrice}>€{item.originalPrice.toFixed(2)}</Text>
                        )}
                        <Text style={styles.price}>
                            {item.price === 0 ? 'Free' : (typeof item.price === 'number' ? `€${item.price.toFixed(2)}` : '€0.00')}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Title and Meta */}
                    <Text style={styles.title}>{item.title}</Text>

                    <View style={styles.metaRow}>
                        {item.distance && (
                            <View style={styles.metaItem}>
                                <MapPin size={16} color={COLORS.primary} />
                                <Text style={styles.metaText}>{item.distance}</Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Clock size={16} color={COLORS.primary} />
                            <Text style={styles.metaText}>{item.expiry}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagContainer}>
                        {item.tags && item.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {item.description || 'No description provided.'}
                    </Text>

                    {/* Safety Information */}
                    {(item.storageCondition || item.packageStatus) && (
                        <>
                            <Text style={styles.sectionTitle}>Safety Information</Text>
                            <View style={styles.safetySection}>
                                <View style={styles.safetyBadge}>
                                    <ShieldCheck size={20} color={COLORS.primary} />
                                    <Text style={styles.safetyBadgeText}>Safety Verified</Text>
                                </View>

                                <View style={styles.safetyDetails}>
                                    {item.storageCondition && (
                                        <View style={styles.safetyItem}>
                                            <Thermometer size={18} color={COLORS.textLight} />
                                            <View style={styles.safetyItemContent}>
                                                <Text style={styles.safetyLabel}>Storage</Text>
                                                <Text style={styles.safetyValue}>{item.storageCondition}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {item.packageStatus && (
                                        <View style={styles.safetyItem}>
                                            <Package size={18} color={COLORS.textLight} />
                                            <View style={styles.safetyItemContent}>
                                                <Text style={styles.safetyLabel}>Package</Text>
                                                <Text style={styles.safetyValue}>{item.packageStatus}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </>
                    )}

                    {/* Seller Info */}
                    <Text style={styles.sectionTitle}>Listed by</Text>
                    <View style={styles.sellerInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.creatorName ? item.creatorName.charAt(0).toUpperCase() : 'A'}
                            </Text>
                        </View>
                        <Text style={styles.sellerName}>{item.creatorName || 'Anonymous'}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Button Footer */}
            <View style={styles.footer}>
                {requestStatus ? (
                    <TouchableOpacity style={[styles.button, styles.chatButton]} onPress={handleChat}>
                        <MessageCircle size={20} color={COLORS.white} />
                        <Text style={styles.buttonText}>Chat with Giver</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRequest}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Request Item</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100, // Space for footer
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: SPACING.m,
        left: SPACING.m,
        backgroundColor: COLORS.white,
        padding: 8,
        borderRadius: 20,
        ...SHADOWS.small,
    },
    priceBadge: {
        position: 'absolute',
        bottom: SPACING.m,
        right: SPACING.m,
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...SHADOWS.medium,
    },
    price: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    originalPrice: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
    },
    content: {
        padding: SPACING.l,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.l,
        marginBottom: SPACING.m,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.s,
        marginBottom: SPACING.l,
    },
    tag: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    tagText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.s,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        marginTop: SPACING.m,
    },
    description: {
        fontSize: FONT_SIZE.m,
        color: COLORS.text,
        lineHeight: 24,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.m,
    },
    sellerName: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.text,
    },
    safetySection: {
        backgroundColor: '#F0F9F4',
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C6F6D5',
        marginBottom: SPACING.m,
    },
    safetyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.m,
    },
    safetyBadgeText: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.primary,
    },
    safetyDetails: {
        gap: SPACING.s,
    },
    safetyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    safetyItemContent: {
        flex: 1,
    },
    safetyLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    safetyValue: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.text,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.l,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        ...SHADOWS.medium,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    chatButton: {
        backgroundColor: COLORS.secondary, // Or a different color for chat
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
    },
});

export default FoodDetailsScreen;
