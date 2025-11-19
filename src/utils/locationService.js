// Location service for Munich-based food discovery
import * as Location from 'expo-location';

/**
 * Request location permissions from user
 * @returns {Promise<boolean>} True if granted, false otherwise
 */
export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

/**
 * Get user's current location
 * @returns {Promise<{lat: number, lng: number, address: string} | null>}
 */
export const getCurrentLocation = async () => {
    try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            console.log('Location permission denied');
            return null;
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Reverse geocode to get address
        const addresses = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        const address = addresses[0];
        const formattedAddress = address
            ? `${address.street || ''}, ${address.district || address.city || 'Munich'}`
            : 'Munich, Germany';

        return {
            lat: latitude,
            lng: longitude,
            address: formattedAddress,
            city: address?.city || 'Munich',
            district: address?.district || '',
        };
    } catch (error) {
        console.error('Error getting current location:', error);
        return null;
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance (e.g., "0.8 km" or "850 m")
 */
export const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm} km`;
};

/**
 * Filter food items by distance from user location
 * @param {Array} foodItems - Array of food items with location data
 * @param {Object} userLocation - User's location {lat, lng}
 * @param {number} radiusKm - Maximum distance in kilometers (default: 5)
 * @returns {Array} Filtered and sorted food items with distance
 */
export const filterByDistance = (foodItems, userLocation, radiusKm = 5) => {
    if (!userLocation) return foodItems;

    return foodItems
        .map((item) => {
            if (!item.location?.lat || !item.location?.lng) {
                return { ...item, distance: null };
            }

            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                item.location.lat,
                item.location.lng
            );

            return { ...item, distance };
        })
        .filter((item) => item.distance === null || item.distance <= radiusKm)
        .sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });
};
