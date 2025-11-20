
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, Thermometer, Package } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';

const FoodCard = ({ item, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.card, style]}
            activeOpacity={0.9}
            onPress={onPress}
        >
            <Image source={{ uri: item.image || item.imageUrl }} style={styles.image} resizeMode="cover" />

            {/* Category Badge */}
            {item.category && (
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
            )}

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        {item.packageStatus && (
                            <Text style={styles.packageEmoji}>
                                {item.packageStatus === 'Sealed' ? '📦' : '🔓'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.priceRow}>
                        {item.price !== undefined && (
                            <View style={styles.priceContainer}>
                                {typeof item.originalPrice === 'number' && (
                                    <Text style={styles.originalPrice}>€{item.originalPrice.toFixed(2)}</Text>
                                )}
                                <Text style={styles.price}>
                                    {item.price === 0 ? 'Free' : (typeof item.price === 'number' ? `€${item.price.toFixed(2)}` : '€0.00')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.footer}>
                        {item.distance && (
                            <Text style={styles.distance}>{item.distance}</Text>
                        )}
                        <View style={styles.expiryContainer}>
                            <Clock size={12} color={COLORS.white} />
                            <Text style={styles.expiry}>{item.expiry}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        ...SHADOWS.small,
        marginBottom: SPACING.m,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '600',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        justifyContent: 'flex-end',
        padding: SPACING.s,
    },
    content: {
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
    },
    title: {
        flex: 1,
        color: COLORS.white,
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
    },
    packageEmoji: {
        fontSize: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    price: {
        color: '#4ADE80', // Green
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
    },
    originalPrice: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        textDecorationLine: 'line-through',
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    distance: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        opacity: 0.9,
    },
    expiryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expiry: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        opacity: 0.9,
    },
});

export default FoodCard;
