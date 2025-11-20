import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Lock, TrendingUp, Heart, Star, Zap, Check } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ConfettiCannon from 'react-native-confetti-cannon';

const AchievementsScreen = () => {
    const [stats, setStats] = useState({ shared: 0, rescued: 0, karma: 0 });
    const [loading, setLoading] = useState(true);
    const [previouslyUnlocked, setPreviouslyUnlocked] = useState(new Set());
    const [celebratingAchievement, setCelebratingAchievement] = useState(null);
    const confettiRef = useRef(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const foodsRef = collection(db, 'foods');
            const sharedQuery = query(foodsRef, where('createdBy', '==', currentUser.uid));
            const sharedSnapshot = await getDocs(sharedQuery);
            const sharedCount = sharedSnapshot.size;

            const matchesRef = collection(db, 'matches');
            const rescuedQuery = query(
                matchesRef,
                where('seekerId', '==', currentUser.uid),
                where('status', '==', 'completed')
            );
            const rescuedSnapshot = await getDocs(rescuedQuery);
            const rescuedCount = rescuedSnapshot.size;

            const karma = sharedCount + rescuedCount;

            // Check for newly unlocked achievements
            const newStats = { shared: sharedCount, rescued: rescuedCount, karma: karma };
            checkForNewAchievements(newStats);

            setStats(newStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const achievements = [
        {
            id: 'first_share',
            icon: Star,
            title: 'First Share',
            description: 'Post your first food item',
            color: '#FFD700',
            unlocked: stats.shared >= 1,
            progress: `${stats.shared}/1`,
            tier: 1,
        },
        {
            id: 'food_saver',
            icon: Heart,
            title: 'Food Saver',
            description: 'Rescue 5 food items',
            color: '#FF6B6B',
            unlocked: stats.rescued >= 5,
            progress: `${stats.rescued}/5`,
            tier: 2,
        },
        {
            id: 'rising_star',
            icon: TrendingUp,
            title: 'Rising Star',
            description: 'Reach 100 karma points',
            color: '#4ECDC4',
            unlocked: stats.karma >= 100,
            progress: `${stats.karma}/100`,
            tier: 3,
        },
        {
            id: 'generous_giver',
            icon: Zap,
            title: 'Generous Giver',
            description: 'Share 10 food items',
            color: '#FFE66D',
            unlocked: stats.shared >= 10,
            progress: `${stats.shared}/10`,
            tier: 2,
        },
        {
            id: 'community_hero',
            icon: Award,
            title: 'Community Hero',
            description: 'Reach 50 karma points',
            color: '#A8E6CF',
            unlocked: stats.karma >= 50,
            progress: `${stats.karma}/50`,
            tier: 2,
        },
    ];

    const checkForNewAchievements = (newStats) => {
        const tempAchievements = [
            { id: 'first_share', unlocked: newStats.shared >= 1, tier: 1 },
            { id: 'food_saver', unlocked: newStats.rescued >= 5, tier: 2 },
            { id: 'rising_star', unlocked: newStats.karma >= 100, tier: 3 },
            { id: 'generous_giver', unlocked: newStats.shared >= 10, tier: 2 },
            { id: 'community_hero', unlocked: newStats.karma >= 50, tier: 2 },
        ];

        tempAchievements.forEach(achievement => {
            if (achievement.unlocked && !previouslyUnlocked.has(achievement.id)) {
                // New achievement unlocked!
                triggerCelebration(achievement);
                setPreviouslyUnlocked(prev => new Set([...prev, achievement.id]));
            }
        });
    };

    const triggerCelebration = (achievement) => {
        setCelebratingAchievement(achievement);
        if (confettiRef.current) {
            confettiRef.current.start();
        }

        // Auto-dismiss after animation
        setTimeout(() => {
            setCelebratingAchievement(null);
        }, 4000);
    };

    const getConfettiConfig = (tier) => {
        switch (tier) {
            case 3: // Epic achievement
                return { count: 200, origin: { x: -10, y: 0 }, explosionSpeed: 500, fallSpeed: 3000 };
            case 2: // Rare achievement
                return { count: 150, origin: { x: -10, y: 0 }, explosionSpeed: 400, fallSpeed: 2500 };
            case 1: // Common achievement
            default:
                return { count: 100, origin: { x: -10, y: 0 }, explosionSpeed: 350, fallSpeed: 2000 };
        }
    };

    const AchievementCard = ({ icon: Icon, title, description, color, unlocked, progress }) => (
        <View style={[styles.achievementCard, unlocked && styles.achievementCardUnlocked]}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon size={32} color={color} />
                {!unlocked && (
                    <View style={styles.lockBadge}>
                        <Lock size={12} color={COLORS.white} />
                    </View>
                )}
                {unlocked && (
                    <View style={styles.checkBadge}>
                        <Check size={12} color={COLORS.white} />
                    </View>
                )}
            </View>
            <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>{title}</Text>
                <Text style={styles.achievementDescription}>{description}</Text>
                <Text style={[styles.progress, unlocked && styles.progressUnlocked]}>
                    {unlocked ? '✓ Unlocked!' : `Progress: ${progress}`}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 100 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Achievements</Text>
                <Text style={styles.subtitle}>Track your impact on reducing food waste</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Stats</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.shared}</Text>
                            <Text style={styles.statLabel}>Shared</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.rescued}</Text>
                            <Text style={styles.statLabel}>Rescued</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.karma}</Text>
                            <Text style={styles.statLabel}>Karma</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Your Achievements</Text>

                {achievements.map((achievement, index) => (
                    <AchievementCard key={index} {...achievement} />
                ))}
            </ScrollView>

            {/* Celebration Modal */}
            {celebratingAchievement && (
                <Modal transparent visible={true} animationType="fade">
                    <View style={styles.celebrationOverlay}>
                        <View style={styles.celebrationCard}>
                            <Text style={styles.celebrationEmoji}>
                                {celebratingAchievement.tier === 3 ? '🎉' : celebratingAchievement.tier === 2 ? '🎊' : '✨'}
                            </Text>
                            <Text style={styles.celebrationTitle}>Achievement Unlocked!</Text>
                            <Text style={styles.celebrationAchievement}>
                                {achievements.find(a => a.id === celebratingAchievement.id)?.title}
                            </Text>
                        </View>
                        <ConfettiCannon
                            ref={confettiRef}
                            autoStart={false}
                            {...getConfettiConfig(celebratingAchievement.tier)}
                        />
                    </View>
                </Modal>
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
    content: {
        padding: SPACING.m,
    },
    statsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.l,
        marginBottom: SPACING.l,
        ...SHADOWS.small,
    },
    statsTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    achievementCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        opacity: 0.6,
    },
    achievementCardUnlocked: {
        opacity: 1,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
        position: 'relative',
    },
    lockBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.textLight,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    achievementText: {
        flex: 1,
        justifyContent: 'center',
    },
    achievementTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    progress: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    progressUnlocked: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    celebrationOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    celebrationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.xl,
        alignItems: 'center',
        ...SHADOWS.medium,
        minWidth: 280,
    },
    celebrationEmoji: {
        fontSize: 80,
        marginBottom: SPACING.m,
    },
    celebrationTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.s,
    },
    celebrationAchievement: {
        fontSize: FONT_SIZE.l,
        color: COLORS.text,
        textAlign: 'center',
    },
});

export default AchievementsScreen;
