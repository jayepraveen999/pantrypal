import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, X, Info } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const FoodCard = ({ item }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.95}
                onPress={() => setShowDetails(true)}
            >
                <Image key={item.id} source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <View style={styles.tagContainer}>
                            {item.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.title}>{item.title}</Text>

                        <View style={styles.row}>
                            {item.distance && (
                                <>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoText}>{item.distance}</Text>
                                    </View>
                                    <View style={styles.separator}>
                                        <Text style={styles.separatorText}>•</Text>
                                    </View>
                                </>
                            )}
                            <View style={styles.infoItem}>
                                <Clock size={14} color={COLORS.white} />
                                <Text style={styles.infoText}>{item.expiry}</Text>
                            </View>
                        </View>

                        <View style={styles.tapHint}>
                            <Info size={12} color={COLORS.white} />
                            <Text style={styles.tapHintText}>Tap for details</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Details Modal */}
            <Modal
                visible={showDetails}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDetails(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowDetails(false)}
                        >
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>

                        <ScrollView>
                            <Image key={item.id} source={{ uri: item.image }} style={styles.modalImage} />
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalTitle}>{item.title}</Text>

                                <View style={styles.modalMetaRow}>
                                    {item.distance && (
                                        <View style={styles.modalMetaItem}>
                                            <Text style={styles.modalMetaText}>{item.distance}</Text>
                                        </View>
                                    )}
                                    {item.distance && (
                                        <View style={styles.separator}>
                                            <Text style={styles.separatorText}>•</Text>
                                        </View>
                                    )}
                                    <View style={styles.modalMetaItem}>
                                        <Clock size={18} color={COLORS.primary} />
                                        <Text style={styles.modalMetaText}>{item.expiry}</Text>
                                    </View>
                                </View>

                                <View style={styles.tagContainer}>
                                    {item.tags.map((tag, i) => (
                                        <View key={i} style={styles.modalTag}>
                                            <Text style={styles.modalTagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>

                                <Text style={styles.modalSectionTitle}>Description</Text>
                                <Text style={styles.modalDescription}>
                                    {item.description || 'Delicious food ready to be rescued!'}
                                </Text>

                                <Text style={styles.modalHint}>
                                    Close to continue swiping
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
        justifyContent: 'flex-end',
        padding: SPACING.m,
    },
    content: {
        gap: SPACING.xs,
    },
    tagContainer: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    tag: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    tagText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    title: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.s,
        opacity: 0.9,
    },
    separator: {
        marginHorizontal: 4,
    },
    separatorText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.s,
        opacity: 0.6,
    },
    tapHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: SPACING.xs,
        opacity: 0.7,
    },
    tapHintText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
        zIndex: 10,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    modalImage: {
        width: '100%',
        height: 300,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalInfo: {
        padding: SPACING.l,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    modalMetaRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    modalMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    modalMetaText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.text,
        fontWeight: '500',
    },
    modalTag: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 16,
        marginRight: SPACING.s,
        marginBottom: SPACING.s,
    },
    modalTagText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.primary,
        fontWeight: '600',
    },
    modalSectionTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.m,
        marginBottom: SPACING.s,
    },
    modalDescription: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        lineHeight: 22,
    },
    modalHint: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: SPACING.l,
        fontStyle: 'italic',
    },
});

export default FoodCard;
