import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { Trash2, CheckCircle, X, Check, MessageCircle } from 'lucide-react-native';

const MyListingsScreen = ({ navigation }) => {
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([loadListings(), loadRequests()]);
        setLoading(false);
    };

    const loadListings = async () => {
        try {
            const foodsRef = collection(db, 'foods');
            const q = query(
                foodsRef,
                where('createdBy', '==', auth.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setListings(items);
        } catch (error) {
            console.error('Error loading listings:', error);
        }
    };

    const loadRequests = async () => {
        try {
            const matchesRef = collection(db, 'matches');
            const q = query(
                matchesRef,
                where('giverId', '==', auth.currentUser.uid),
                where('status', '==', 'interested'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setRequests(items);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const handleApproveRequest = async (request) => {
        Alert.alert(
            'Approve Request',
            `Approve ${request.seekerUsername}'s request for "${request.foodTitle}"?\n\nThe food will be reserved for them.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            // Update match status
                            await updateDoc(doc(db, 'matches', request.id), {
                                status: 'approved',
                                giverApproved: true
                            });

                            // Update food status to reserved
                            await updateDoc(doc(db, 'foods', request.foodId), {
                                status: 'reserved',
                                reservedBy: request.seekerId,
                                reservedByUsername: request.seekerUsername
                            });

                            Alert.alert('Approved! ✅', 'The food has been reserved. You can coordinate pickup details via chat.');
                            loadData();
                        } catch (error) {
                            console.error('Approve error:', error);
                            Alert.alert('Error', 'Failed to approve request');
                        }
                    }
                }
            ]
        );
    };

    const handleRejectRequest = async (request) => {
        try {
            await updateDoc(doc(db, 'matches', request.id), {
                status: 'rejected'
            });

            setRequests(prev => prev.filter(r => r.id !== request.id));
            Alert.alert('Rejected', 'Request has been declined');
        } catch (error) {
            console.error('Reject error:', error);
        }
    };

    const handleDelete = async (item) => {
        if (item.status !== 'available') {
            Alert.alert('Cannot Delete', 'You can only delete available items');
            return;
        }

        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'foods', item.id));
                            setListings(prev => prev.filter(l => l.id !== item.id));
                            Alert.alert('Success', 'Item deleted');
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const handleMarkPickedUp = async (item) => {
        if (item.status !== 'reserved') {
            Alert.alert('Error', 'This item is not reserved');
            return;
        }

        Alert.alert(
            'Confirm Pickup',
            `Confirm that ${item.reservedByUsername} picked up "${item.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, 'foods', item.id), {
                                status: 'completed'
                            });

                            loadListings();
                            Alert.alert('Success', 'Pickup confirmed!');
                        } catch (error) {
                            console.error('Update error:', error);
                            Alert.alert('Error', 'Failed to update status');
                        }
                    }
                }
            ]
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            available: { text: 'Available', color: COLORS.success || '#4CAF50' },
            reserved: { text: 'Reserved', color: COLORS.warning || '#FF9800' },
            completed: { text: 'Completed', color: COLORS.textLight }
        };

        const badge = badges[status] || badges.available;

        return (
            <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
                <Text style={styles.statusText}>{badge.text}</Text>
            </View>
        );
    };

    const renderRequest = ({ item }) => (
        <View style={styles.requestCard}>
            <Image source={{ uri: item.foodImage }} style={styles.requestImage} />

            <View style={styles.requestContent}>
                <Text style={styles.requestTitle}>{item.foodTitle}</Text>
                <Text style={styles.requestFrom}>Request from: {item.seekerUsername}</Text>

                <View style={styles.requestActions}>
                    <TouchableOpacity
                        style={styles.chatRequestButton}
                        onPress={() => navigation.navigate('RequestChat', { matchId: item.id })}
                    >
                        <MessageCircle size={18} color={COLORS.primary} />
                        <Text style={styles.chatRequestText}>Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveRequest(item)}
                    >
                        <Check size={18} color={COLORS.white} />
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectRequest(item)}
                    >
                        <X size={18} color={COLORS.error} />
                        <Text style={styles.rejectText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderListing = ({ item }) => (
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

                {item.status === 'reserved' && (
                    <Text style={styles.reservedBy}>
                        Reserved by: {item.reservedByUsername}
                    </Text>
                )}

                <View style={styles.actions}>
                    {item.status === 'available' && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item)}
                        >
                            <Trash2 size={18} color={COLORS.error} />
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'reserved' && (
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => handleMarkPickedUp(item)}
                        >
                            <CheckCircle size={18} color={COLORS.white} />
                            <Text style={styles.confirmText}>Mark as Picked Up</Text>
                        </TouchableOpacity>
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
                    <Text style={styles.loadingText}>Loading your listings...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.screenTitle}>My Listings</Text>
                <Text style={styles.subtitle}>
                    {requests.length} pending requests · {listings.length} items
                </Text>
            </View>

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        {requests.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Pending Requests ({requests.length})</Text>
                                {requests.map(request => (
                                    <View key={request.id}>
                                        {renderRequest({ item: request })}
                                    </View>
                                ))}
                            </View>
                        )}

                        {listings.length > 0 && (
                            <Text style={styles.sectionTitle}>Your Listings ({listings.length})</Text>
                        )}
                    </>
                )}
                data={listings}
                renderItem={renderListing}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    requests.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No listings yet</Text>
                            <Text style={styles.emptySubText}>
                                Post your first food item to help reduce waste!
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
        marginBottom: SPACING.m,
    },
    requestCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.warning || '#FF9800',
        ...SHADOWS.small,
    },
    requestImage: {
        width: 100,
        height: 100,
    },
    requestContent: {
        flex: 1,
        padding: SPACING.m,
    },
    requestTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    requestFrom: {
        fontSize: FONT_SIZE.s,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: SPACING.s,
    },
    requestActions: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    chatRequestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 4,
        justifyContent: 'center',
    },
    chatRequestText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.primary,
        fontWeight: '600',
    },
    approveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        backgroundColor: COLORS.success || '#4CAF50',
        gap: 4,
        flex: 1,
        justifyContent: 'center',
    },
    approveText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.white,
        fontWeight: '600',
    },
    rejectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
        gap: 4,
        justifyContent: 'center',
    },
    rejectText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.error,
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
    reservedBy: {
        fontSize: FONT_SIZE.s,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: SPACING.s,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.s,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
        gap: 4,
    },
    deleteText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.error,
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
        marginTop: SPACING.xl,
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

export default MyListingsScreen;
