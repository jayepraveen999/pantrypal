import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { MessageCircle, CheckCircle, X } from 'lucide-react-native';
import { formatDistance } from '../utils/locationService';

const MyPickupsScreen = ({ navigation }) => {
    const [pickups, setPickups] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([loadPickups(), loadPendingRequests()]);
        setLoading(false);
    };

    const loadPickups = async () => {
        try {
            const foodsRef = collection(db, 'foods');
            const q = query(
                foodsRef,
                where('reservedBy', '==', auth.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setPickups(items);
        } catch (error) {
            console.error('Error loading pickups:', error);
            Alert.alert('Error', 'Failed to load your pickups');
        }
    };

    const loadPendingRequests = async () => {
        try {
            const matchesRef = collection(db, 'matches');
            const q = query(
                matchesRef,
                where('seekerId', '==', auth.currentUser.uid),
                where('status', '==', 'interested'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setPendingRequests(items);
        } catch (error) {
            console.error('Error loading pending requests:', error);
        }
    };

    const handleConfirmPickup = async (item) => {
        Alert.alert(
            'Confirm Pickup',
            `Did you pick up "${item.title}" from ${item.creatorName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Picked Up',
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, 'foods', item.id), {
                                status: 'completed'
                            });

                            loadPickups();
                            Alert.alert('Success', 'Pickup confirmed! Thanks for reducing food waste! 🎉');
                        } catch (error) {
                            console.error('Update error:', error);
                            Alert.alert('Error', 'Failed to confirm pickup');
                        }
                    }
                }
            ]
        );
    };

    const handleCancelReservation = async (item) => {
        if (item.status === 'completed') {
            Alert.alert('Cannot Cancel', 'This pickup is already completed');
            return;
        }

        Alert.alert(
            'Cancel Reservation',
            `Are you sure you want to cancel your reservation for "${item.title}"?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, 'foods', item.id), {
                                status: 'available',
                                reservedBy: null,
                                reservedByUsername: null
                            });

                            setPickups(prev => prev.filter(p => p.id !== item.id));
                            Alert.alert('Cancelled', 'Reservation cancelled');
                        } catch (error) {
                            console.error('Cancel error:', error);
                            Alert.alert('Error', 'Failed to cancel reservation');
                        }
                    }
                }
            ]
        );
    };

    const handleChat = (item) => {
        // TODO: Navigate to chat screen
        Alert.alert('Coming Soon', 'Chat feature will be available soon!');
    };

    const getStatusBadge = (status) => {
        const badges = {
            reserved: { text: 'Pending Pickup', color: COLORS.warning || '#FF9800' },
            completed: { text: 'Completed', color: COLORS.success || '#4CAF50' }
        };

        const badge = badges[status] || badges.reserved;

        return (
            <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
                <Text style={styles.statusText}>{badge.text}</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{item.title}</Text>
                    {getStatusBadge(item.status)}
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>From:</Text>
                    <Text style={styles.infoValue}>{item.creatorName}</Text>
                </View>

                {item.location && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Location:</Text>
                        <Text style={styles.infoValue}>{item.location.address}</Text>
                    </View>
                )}

                {item.expiry && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Expires:</Text>
                        <Text style={styles.infoValue}>{item.expiry}</Text>
                    </View>
                )}

                <View style={styles.actions}>
                    {item.status === 'reserved' && (
                        <>
                            <TouchableOpacity
                                style={styles.chatButton}
                                onPress={() => handleChat(item)}
                            >
                                <MessageCircle size={18} color={COLORS.primary} />
                                <Text style={styles.chatText}>Chat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => handleConfirmPickup(item)}
                            >
                                <CheckCircle size={18} color={COLORS.white} />
                                <Text style={styles.confirmText}>Confirm Pickup</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => handleCancelReservation(item)}
                            >
                                <X size={18} color={COLORS.error} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading your pickups...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const reserved = pickups.filter(p => p.status === 'reserved');
    const completed = pickups.filter(p => p.status === 'completed');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.screenTitle}>My Pickups</Text>
                <Text style={styles.subtitle}>
                    {pendingRequests.length} pending · {reserved.length} reserved · {completed.length} completed
                </Text>
            </View>

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        {pendingRequests.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Pending Requests ({pendingRequests.length})</Text>
                                <Text style={styles.sectionSubtitle}>Waiting for giver's approval</Text>
                                {pendingRequests.map(request => (
                                    <View key={request.id} style={styles.pendingCard}>
                                        <Image source={{ uri: request.foodImage }} style={styles.pendingImage} />
                                        <View style={styles.pendingContent}>
                                            <Text style={styles.pendingTitle}>{request.foodTitle}</Text>
                                            <Text style={styles.pendingFrom}>Requested from: {request.giverUsername}</Text>
                                            <TouchableOpacity
                                                style={styles.chatPendingButton}
                                                onPress={() => navigation.navigate('RequestChat', { matchId: request.id })}
                                            >
                                                <MessageCircle size={18} color={COLORS.white} />
                                                <Text style={styles.chatPendingText}>Chat to Discuss</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {pickups.length > 0 && (
                            <Text style={styles.sectionTitle}>Approved Pickups ({pickups.length})</Text>
                        )}
                    </>
                )}
                data={pickups}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    pendingRequests.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No pickups yet</Text>
                            <Text style={styles.emptySubText}>
                                Swipe right on food items to reserve them!
                            </Text>
                        </View>
                    )
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    screenTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginTop: 4,
    },
    list: {
        padding: SPACING.m,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginBottom: SPACING.m,
    },
    pendingCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.warning || '#FF9800',
        ...SHADOWS.small,
    },
    pendingImage: {
        width: 100,
        height: 100,
    },
    pendingContent: {
        flex: 1,
        padding: SPACING.m,
    },
    pendingTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    pendingFrom: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginBottom: SPACING.s,
    },
    chatPendingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        gap: 4,
        justifyContent: 'center',
    },
    chatPendingText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.white,
        fontWeight: '600',
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    image: {
        width: '100%',
        height: 150,
    },
    content: {
        padding: SPACING.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: COLORS.white,
    },
    description: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginBottom: SPACING.s,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        width: 80,
    },
    infoValue: {
        fontSize: FONT_SIZE.s,
        color: COLORS.text,
        fontWeight: '500',
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.s,
        marginTop: SPACING.m,
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 4,
    },
    chatText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.primary,
        fontWeight: '600',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        gap: 4,
        flex: 1,
        justifyContent: 'center',
    },
    confirmText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.white,
        fontWeight: '600',
    },
    cancelButton: {
        padding: SPACING.s,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.m,
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    emptySubText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});

export default MyPickupsScreen;
