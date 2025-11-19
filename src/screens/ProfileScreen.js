import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Award, Heart, LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
    // Get anonymous username from Firebase Auth
    const currentUser = auth.currentUser;
    const username = currentUser?.displayName || 'Anonymous';
    const email = currentUser?.email || '';

    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [interestedCount, setInterestedCount] = useState(0);

    // TODO: Fetch real stats from Firestore
    const stats = {
        shared: 0,
        rescued: 0,
        karma: 0,
    };

    useEffect(() => {
        loadCounts();

        // Refresh counts when screen is focused
        const unsubscribe = navigation.addListener('focus', () => {
            loadCounts();
        });

        return unsubscribe;
    }, [navigation]);

    const loadCounts = async () => {
        try {
            // Count pending requests for giver (My Listings)
            const giverMatchesRef = collection(db, 'matches');
            const giverQuery = query(
                giverMatchesRef,
                where('giverId', '==', currentUser.uid),
                where('status', '==', 'interested')
            );
            const giverSnapshot = await getDocs(giverQuery);
            setPendingRequestsCount(giverSnapshot.size);

            // Count interested requests for seeker (My Pickups)
            const seekerMatchesRef = collection(db, 'matches');
            const seekerQuery = query(
                seekerMatchesRef,
                where('seekerId', '==', currentUser.uid),
                where('status', '==', 'interested')
            );
            const seekerSnapshot = await getDocs(seekerQuery);
            setInterestedCount(seekerSnapshot.size);
        } catch (error) {
            console.error('Error loading counts:', error);
        }
    };

    const MenuItem = ({ icon: Icon, title, subtitle, color = COLORS.text, onPress, badge }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Icon size={24} color={color} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color }]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {badge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            <ChevronRight size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.appBranding}>
                    <Text style={styles.appName}>LastBite 🍽️</Text>
                    <Text style={styles.appTagline}>Save Food, Share Love</Text>
                </View>

                <View style={styles.header}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{username}</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.shared}</Text>
                        <Text style={styles.statLabel}>Shared</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.rescued}</Text>
                        <Text style={styles.statLabel}>Rescued</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.karma}</Text>
                        <Text style={styles.statLabel}>Karma</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Activity</Text>
                    <MenuItem
                        icon={Settings}
                        title="My Listings"
                        subtitle="Manage your posted food"
                        onPress={() => navigation.navigate('MyListings')}
                        badge={pendingRequestsCount}
                    />
                    <MenuItem
                        icon={Heart}
                        title="My Pickups"
                        subtitle="Track your reservations"
                        onPress={() => navigation.navigate('MyPickups')}
                        badge={interestedCount}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <MenuItem
                        icon={Settings}
                        title="Settings"
                        subtitle="Notifications, Privacy"
                        onPress={() => navigation.navigate('Settings')}
                    />
                    <MenuItem
                        icon={Award}
                        title="Achievements"
                        subtitle="Track your impact"
                        onPress={() => navigation.navigate('Achievements')}
                    />
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={() => auth.signOut()}>
                        <LogOut size={20} color={COLORS.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingBottom: SPACING.xl,
    },
    appBranding: {
        alignItems: 'center',
        paddingTop: SPACING.l,
        paddingBottom: SPACING.m,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    appTagline: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.m,
        borderWidth: 3,
        borderColor: COLORS.white,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.m,
        borderWidth: 3,
        borderColor: COLORS.white,
        ...SHADOWS.medium,
    },
    name: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    email: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.m,
        marginBottom: SPACING.xl,
        ...SHADOWS.small,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.border,
    },
    statValue: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: SPACING.m,
        marginLeft: SPACING.s,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
    },
    badge: {
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginRight: SPACING.s,
    },
    badgeText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        backgroundColor: '#FFE5E5',
        borderRadius: 16,
        gap: SPACING.s,
    },
    logoutText: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.error,
    },
});

export default ProfileScreen;
