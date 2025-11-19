import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, orderBy, or } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { MessageCircle } from 'lucide-react-native';

const ChatListScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChats();

        // Refresh when screen is focused
        const unsubscribe = navigation.addListener('focus', () => {
            loadChats();
        });

        return unsubscribe;
    }, [navigation]);

    const loadChats = async () => {
        try {
            const currentUser = auth.currentUser;

            // Get all matches where user is either giver or seeker
            const matchesRef = collection(db, 'matches');
            const q = query(
                matchesRef,
                or(
                    where('giverId', '==', currentUser.uid),
                    where('seekerId', '==', currentUser.uid)
                ),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const matchData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // ONLY show approved chats (not pending requests)
            const approvedChats = matchData.filter(match =>
                match.status === 'approved'
            );

            // Format for display
            const formattedChats = approvedChats.map(match => {
                const isGiver = match.giverId === currentUser.uid;
                return {
                    id: match.id,
                    matchId: match.id,
                    name: isGiver ? match.seekerUsername : match.giverUsername,
                    foodTitle: match.foodTitle,
                    foodImage: match.foodImage,
                    status: match.status,
                    lastMessage: 'Approved - Ready to coordinate pickup',
                    isGiver: isGiver
                };
            });

            setChats(formattedChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderChat = ({ item }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('RequestChat', { matchId: item.matchId })}
        >
            <Image source={{ uri: item.foodImage }} style={styles.foodImage} />

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <View style={styles.approvedBadge}>
                        <Text style={styles.approvedText}>Active</Text>
                    </View>
                </View>
                <Text style={styles.foodTitle} numberOfLines={1}>
                    {item.foodTitle}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.isGiver ? 'Pickup with ' : 'Picking up from '}{item.name}
                </Text>
            </View>

            <MessageCircle size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Messages</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
                {chats.length > 0 && (
                    <Text style={styles.subtitle}>{chats.length} conversations</Text>
                )}
            </View>

            {chats.length === 0 ? (
                <View style={styles.emptyState}>
                    <MessageCircle size={64} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>No active chats yet</Text>
                    <Text style={styles.emptySubText}>
                        Approved requests will appear here for coordination
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={chats}
                    renderItem={renderChat}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
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
    chatItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: SPACING.m,
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: COLORS.text,
        marginRight: SPACING.s,
    },
    pendingBadge: {
        backgroundColor: COLORS.warning || '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    pendingText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.white,
        fontWeight: '600',
    },
    approvedBadge: {
        backgroundColor: COLORS.success || '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    approvedText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.white,
        fontWeight: '600',
    },
    foodTitle: {
        fontSize: FONT_SIZE.s,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    lastMessage: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: SPACING.m,
        marginBottom: SPACING.s,
    },
    emptySubText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});

export default ChatListScreen;
