import React from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { MapPin, Navigation } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const FoodMap = ({ foodItems, userLocation, onMarkerPress }) => {
    const initialRegion = userLocation ? {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        latitude: 48.1351, // Munich default
        longitude: 11.5820,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {foodItems.map((item) => {
                    if (!item.location || !item.location.lat || !item.location.lng) return null;

                    return (
                        <Marker
                            key={item.id}
                            coordinate={{
                                latitude: item.location.lat,
                                longitude: item.location.lng,
                            }}
                            title={item.title}
                            description={item.description}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.priceBadge}>
                                    <Text style={styles.priceText}>
                                        {item.price === 0 ? 'Free' : `€${item.price}`}
                                    </Text>
                                </View>
                                <View style={styles.triangle} />
                            </View>

                            <Callout tooltip onPress={() => onMarkerPress(item)}>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{item.title}</Text>
                                    <Text style={styles.calloutPrice}>
                                        {item.price === 0 ? 'Free' : `€${item.price}`}
                                    </Text>
                                    <Text style={styles.calloutDistance}>{item.distance}</Text>
                                    <View style={styles.calloutButton}>
                                        <Text style={styles.calloutButtonText}>Tap for details</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Custom My Location Button */}
            {userLocation && (
                <TouchableOpacity style={styles.myLocationButton}>
                    <Navigation size={24} color={COLORS.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    priceBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.white,
        ...SHADOWS.small,
    },
    priceText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.xs,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.primary,
        marginTop: -1,
    },
    calloutContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        width: 200,
        ...SHADOWS.medium,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: FONT_SIZE.m,
        marginBottom: 4,
    },
    calloutPrice: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    calloutDistance: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.s,
        marginBottom: 8,
    },
    calloutButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    calloutButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        fontWeight: 'bold',
    },
    myLocationButton: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.m,
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 30,
        ...SHADOWS.medium,
    },
});

export default FoodMap;
