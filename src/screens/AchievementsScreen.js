import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Lock, TrendingUp, Heart, Star, Zap } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';

const AchievementsScreen = () => {
    const upcomingAchievements = [
        {
            icon: Star,
            title: 'First Share',
            description: 'Post your first food item',
            color: '#FFD700',
        },
        {
            icon: Heart,
            title: 'Food Saver',
            description: 'Rescue 5 food items',
            color: '#FF6B6B',
        },
        {
            icon: TrendingUp,
            title: 'Rising Star',
            description: 'Reach 100 karma points',
            color: '#4ECDC4',
        },
        {
            icon: Zap,
            title: 'Speed Demon',
            description: 'Complete 3 pickups in one day',
            color: '#FFE66D',
        },
        {
            icon: Award,
            title: 'Community Hero',
            description: 'Help 20 people reduce food waste',
            color: '#A8E6CF',
        },
    ];

    const AchievementCard = ({ icon: Icon, title, description, color }) => (
        <View style={styles.achievementCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon size={32} color={color} />
                <View style={styles.lockBadge}>
                    <Lock size={12} color={COLORS.white} />
                </View>
            </View>
            <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>{title}</Text>
                <Text style={styles.achievementDescription}>{description}</Text>
                <Text style={styles.comingSoon}>Coming Soon</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Achievements</Text>
                <Text style={styles.subtitle}>Track your impact on reducing food waste</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.banner}>
                    <Award size={48} color={COLORS.primary} />
                    <Text style={styles.bannerTitle}>Achievements Coming Soon!</Text>
                    <Text style={styles.bannerText}>
                        We're building an exciting achievement system to celebrate your contributions to reducing food waste.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Upcoming Achievements</Text>

                {upcomingAchievements.map((achievement, index) => (
                    <AchievementCard key={index} {...achievement} />
                ))}
            </ScrollView>
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
    banner: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.l,
        alignItems: 'center',
        marginBottom: SPACING.l,
        ...SHADOWS.small,
    },
    bannerTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.m,
        marginBottom: SPACING.s,
    },
    bannerText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 22,
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
    comingSoon: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: '600',
        fontStyle: 'italic',
    },
});

export default AchievementsScreen;
