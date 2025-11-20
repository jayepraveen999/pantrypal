import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, FlatList, Dimensions, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map as MapIcon, List, Search, X, MapPin, Grid } from 'lucide-react-native';
import FoodCard from '../components/FoodCard';
import FoodMap from '../components/FoodMap';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { getCurrentLocation, filterByDistance, formatDistance } from '../utils/locationService';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_MARGIN = SPACING.s;
const CONTAINER_PADDING = SPACING.m;
const CARD_WIDTH = (width - (CONTAINER_PADDING * 2) - (CARD_MARGIN * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Other'];

const HomeScreen = ({ navigation }) => {
    const [allFoodItems, setAllFoodItems] = useState([]);
    const [filteredFoodItems, setFilteredFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        loadFoodItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [searchQuery, selectedCategory, allFoodItems]);

    const loadFoodItems = async () => {
        try {
            const location = await getCurrentLocation();
            setUserLocation(location);

            const foodsRef = collection(db, 'foods');
            const q = query(
                foodsRef,
                where('status', '==', 'available'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(item => item.createdBy !== auth.currentUser?.uid); // Filter out own listings

            const itemsWithDistance = location
                ? filterByDistance(items, location, 5)
                : items;

            const formattedItems = itemsWithDistance.map(item => ({
                ...item,
                image: item.imageUrl,
                distance: item.distance ? formatDistance(item.distance) : null,
                tags: [item.location?.district || item.location?.city || 'Munich']
            }));

            setAllFoodItems(formattedItems);
        } catch (error) {
            console.error('Error loading food items:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let result = allFoodItems;

        // Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        }

        setFilteredFoodItems(result);
    };

    const handleCardPress = (item) => {
        navigation.navigate('FoodDetails', { item });
    };

    const handleMarkerPress = (item) => {
        navigation.navigate('FoodDetails', { item });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Branding & Search */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.logo}>PantryPal 🛒</Text>
                        <Text style={styles.tagline}>Share groceries, reduce waste</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                    >
                        {viewMode === 'grid' ? (
                            <MapPin size={24} color={COLORS.primary} />
                        ) : (
                            <Grid size={24} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.textLight} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for milk, bread, etc..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textLight}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContent}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.categoryTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
                {viewMode === 'grid' ? (
                    <FlatList
                        data={filteredFoodItems}
                        keyExtractor={(item) => item.id}
                        numColumns={COLUMN_COUNT}
                        contentContainerStyle={styles.gridContainer}
                        columnWrapperStyle={styles.columnWrapper}
                        renderItem={({ item }) => (
                            <FoodCard
                                item={item}
                                onPress={() => handleCardPress(item)}
                                style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.4 }}
                            />
                        )}
                        refreshing={loading}
                        onRefresh={loadFoodItems}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No items found.</Text>
                                <Text style={styles.emptySubtext}>Try adjusting your search or filters.</Text>
                            </View>
                        }
                    />
                ) : (
                    <FoodMap
                        foodItems={filteredFoodItems}
                        userLocation={userLocation}
                        onMarkerPress={handleMarkerPress}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    header: {
        paddingTop: SPACING.m,
        paddingBottom: SPACING.s,
        backgroundColor: COLORS.background,
        zIndex: 10,
        ...SHADOWS.small,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.m,
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    tagline: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginTop: 4,
        fontStyle: 'italic',
    },
    toggleButton: {
        padding: 8,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        ...SHADOWS.small,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.m,
        paddingHorizontal: SPACING.m,
        height: 44,
        borderRadius: 12,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.m,
        color: COLORS.text,
        height: '100%',
    },
    categoryScroll: {
        maxHeight: 40,
    },
    categoryContent: {
        paddingHorizontal: SPACING.m,
        paddingRight: SPACING.l, // Extra padding at end
    },
    categoryChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 6,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.text,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
    gridContainer: {
        padding: CONTAINER_PADDING,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    loader: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: SPACING.l,
    },
    emptyText: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.s,
    },
    emptySubtext: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});

export default HomeScreen;
