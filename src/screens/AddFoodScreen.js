// Fixed duplicate imports

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';
import Input from '../components/Input';
import Button from '../components/Button';
import { auth, db, storage } from '../config/firebaseConfig';
import { Camera, MapPin, Thermometer, Package, CheckSquare, Square } from 'lucide-react-native';
import { getCurrentLocation } from '../utils/locationService';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Other'];
const STORAGE_OPTIONS = ['Pantry', 'Refrigerated', 'Frozen'];
const PACKAGE_OPTIONS = ['Sealed', 'Opened'];
const EXPIRY_OPTIONS = [
    { label: 'Today', hours: 12 },
    { label: 'Tomorrow', hours: 24 },
    { label: '2 Days', hours: 48 },
    { label: '3 Days', hours: 72 },
    { label: '1 Week', hours: 168 },
];

const AddFoodScreen = ({ navigation, route }) => {
    const editItem = route.params?.item;
    const isEditing = !!editItem;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedExpiry, setSelectedExpiry] = useState('Tomorrow');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [category, setCategory] = useState('');
    const [storageCondition, setStorageCondition] = useState('Pantry');
    const [packageStatus, setPackageStatus] = useState('Sealed');
    const [safetyPledge, setSafetyPledge] = useState(false);
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setTitle(editItem.title);
            setDescription(editItem.description);
            setSelectedExpiry('Tomorrow'); // Default for editing
            setPrice(editItem.price?.toString() || '');
            setOriginalPrice(editItem.originalPrice?.toString() || '');
            setCategory(editItem.category || '');
            setStorageCondition(editItem.storageCondition || 'Pantry');
            setPackageStatus(editItem.packageStatus || 'Sealed');
            setSafetyPledge(true);
            setImage(editItem.imageUrl);
            setLocation(editItem.location);
            navigation.setOptions({ title: 'Edit Food' });
        }
    }, [editItem, navigation]);

    const handleImageSelection = () => {
        Alert.alert(
            'Add Photo',
            'Choose a method to add a photo',
            [
                {
                    text: 'Take Photo',
                    onPress: takePhoto,
                },
                {
                    text: 'Choose from Library',
                    onPress: pickImage,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const takePhoto = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.status !== 'granted') {
                Alert.alert('Permission Required', 'We need camera permissions to take a photo!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.status !== 'granted') {
                Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload photos!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error in pickImage:', error);
            Alert.alert('Error', `Failed to pick image: ${error.message}`);
        }
    };

    const uploadImage = async (uri) => {
        // If image hasn't changed (still a URL), return it directly
        if (uri.startsWith('http')) return uri;

        try {
            // Why XMLHttpRequest? Firebase Storage sometimes fails with fetch() on React Native
            // This is the recommended workaround for Expo/RN
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.log(e);
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uri, true);
                xhr.send(null);
            });

            const filename = `food_images / ${auth.currentUser.uid}/${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, blob);

            // We're done with the blob, close and release it
            blob.close();

            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Image upload failed:", error);
            throw error;
        }
    };

    const getLocation = async () => {
        setLoadingLocation(true);
        try {
            const userLocation = await getCurrentLocation();
            if (userLocation) {
                setLocation(userLocation);
                console.log('Location captured:', userLocation);
            } else {
                Alert.alert('Location Error', 'Could not get your location. Please enable location services.');
            }
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert('Location Error', 'Failed to get location. You can still post without it.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handlePost = async () => {
        if (!title || !description || !image || !price || !category) {
            Alert.alert('Error', 'Please fill in all required fields (Title, Description, Price, Category, Image)');
            return;
        }

        // Validate price
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0 || priceValue > 999.99) {
            Alert.alert('Invalid Price', 'Please enter a valid price between €0.00 and €999.99');
            return;
        }

        // Validate original price if provided
        if (originalPrice) {
            const originalPriceValue = parseFloat(originalPrice);
            if (isNaN(originalPriceValue) || originalPriceValue < 0 || originalPriceValue > 999.99) {
                Alert.alert('Invalid Original Price', 'Please enter a valid original price between €0.00 and €999.99');
                return;
            }
            if (originalPriceValue <= priceValue) {
                Alert.alert('Invalid Prices', 'Original price should be higher than the current price');
                return;
            }
        }

        if (!location) {
            Alert.alert('Location Required', 'Please add your location so others can find your food in Munich!', [
                { text: 'Add Location', onPress: getLocation },
                { text: 'Cancel', style: 'cancel' }
            ]);
            return;
        }

        if (!safetyPledge) {
            Alert.alert('Safety Pledge Required', 'Please confirm that the food is safe to eat and stored properly.');
            return;
        }

        setLoading(true);
        try {
            const imageUrl = await uploadImage(image);

            const foodData = {
                title,
                description,
                expiry: selectedExpiry, // Simple label like "Tomorrow", "2 Days"
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                currency: '€',
                category,
                storageCondition,
                packageStatus,
                imageUrl,
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    address: location.address,
                    city: location.city || 'Munich',
                    district: location.district || ''
                },
            };

            if (isEditing) {
                await updateDoc(doc(db, 'foods', editItem.id), {
                    ...foodData,
                    updatedAt: serverTimestamp(),
                });
                Alert.alert('Success', 'Food updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await addDoc(collection(db, 'foods'), {
                    ...foodData,
                    createdBy: auth.currentUser.uid,
                    creatorName: auth.currentUser.displayName || 'Anonymous',
                    createdAt: serverTimestamp(),
                    status: 'available',
                    reservedBy: null,
                    reservedByUsername: null
                });

                Alert.alert('Success', 'Your food has been posted!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setTitle('');
                            setDescription('');
                            setSelectedExpiry('Tomorrow');
                            setPrice('');
                            setOriginalPrice('');
                            setCategory('');
                            setImage(null);
                            setLocation(null);
                            navigation.navigate('HomeTab');
                        }
                    }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'post'} food. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={handleImageSelection}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Camera color={COLORS.textLight} size={40} />
                            <Text style={styles.placeholderText}>Add Food Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Location Button */}
                <TouchableOpacity
                    style={[styles.locationButton, location && styles.locationButtonActive]}
                    onPress={getLocation}
                    disabled={loadingLocation}
                >
                    <MapPin
                        color={location ? COLORS.white : COLORS.primary}
                        size={20}
                    />
                    <Text style={[styles.locationButtonText, location && styles.locationButtonTextActive]}>
                        {loadingLocation ? 'Getting location...' : location ? location.address : 'Add Location (Munich)'}
                    </Text>
                </TouchableOpacity>

                <Input
                    label="Title"
                    placeholder="e.g. Homemade Lasagna"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={20}
                />
                <Text style={styles.charCounter}>{title.length}/20</Text>

                <Input
                    label="Description"
                    placeholder="Describe the food, quantity, etc."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                    maxLength={200}
                />
                <Text style={styles.charCounter}>{description.length}/200</Text>

                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Input
                    label="Price (€)"
                    placeholder="5.00"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                />
                <Input
                    label="Original Price (Optional)"
                    placeholder="10.00"
                    keyboardType="decimal-pad"
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                />

                {/* Platform Fee Breakdown */}
                {price && parseFloat(price) > 0 && (
                    <View style={styles.feeBreakdown}>
                        <Text style={styles.feeTitle}>💰 Platform Fee (10%)</Text>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Listed Price:</Text>
                            <Text style={styles.feeValue}>€{parseFloat(price).toFixed(2)}</Text>
                        </View>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Platform Fee:</Text>
                            <Text style={styles.feeValueRed}>-€{(parseFloat(price) * 0.10).toFixed(2)}</Text>
                        </View>
                        <View style={[styles.feeRow, styles.feeRowTotal]}>
                            <Text style={styles.feeLabelBold}>You Receive:</Text>
                            <Text style={styles.feeValueGreen}>€{(parseFloat(price) * 0.90).toFixed(2)}</Text>
                        </View>
                        <Text style={styles.feeNote}>Free items (€0.00) have no platform fee</Text>
                    </View>
                )}

                <Text style={styles.label}>Expiry Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {EXPIRY_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.label}
                            style={[styles.categoryChip, selectedExpiry === option.label && styles.categoryChipActive]}
                            onPress={() => setSelectedExpiry(option.label)}
                        >
                            <Text style={[styles.categoryText, selectedExpiry === option.label && styles.categoryTextActive]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>Storage Condition</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {STORAGE_OPTIONS.map((option) => {
                        const getStorageEmoji = () => {
                            switch (option) {
                                case 'Frozen': return '❄️';
                                case 'Refrigerated': return '🧊';
                                case 'Pantry': return '🌡️';
                                default: return '📦';
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={option}
                                style={[styles.categoryChip, storageCondition === option && styles.categoryChipActive]}
                                onPress={() => setStorageCondition(option)}
                            >
                                <Text style={{ fontSize: 16, marginRight: 4 }}>{getStorageEmoji()}</Text>
                                <Text style={[styles.categoryText, storageCondition === option && styles.categoryTextActive]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={styles.label}>Package Status</Text>
                <View style={styles.row}>
                    {PACKAGE_OPTIONS.map((option) => {
                        const getPackageEmoji = () => option === 'Sealed' ? '📦' : '🔓';

                        return (
                            <TouchableOpacity
                                key={option}
                                style={[styles.radioOption, packageStatus === option && styles.radioOptionActive]}
                                onPress={() => setPackageStatus(option)}
                            >
                                <Text style={{ fontSize: 18, marginRight: 8 }}>{getPackageEmoji()}</Text>
                                <Text style={[styles.radioText, packageStatus === option && styles.radioTextActive]}>
                                    {option}
                                </Text>
                                {packageStatus === option && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={styles.pledgeContainer}
                    onPress={() => setSafetyPledge(!safetyPledge)}
                >
                    {safetyPledge ? (
                        <CheckSquare size={24} color={COLORS.primary} />
                    ) : (
                        <Square size={24} color={COLORS.textLight} />
                    )}
                    <Text style={styles.pledgeText}>
                        I confirm that this food is safe to eat, not expired, and has been stored properly.
                    </Text>
                </TouchableOpacity>

                <Button
                    title={isEditing ? "Update Food" : "Post Food"}
                    onPress={handlePost}
                    loading={loading}
                    style={styles.button}
                />
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
        padding: SPACING.l,
    },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: SPACING.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: SPACING.l,
        borderWidth: 2,
        borderColor: COLORS.primary,
        gap: SPACING.s,
    },
    locationButtonActive: {
        backgroundColor: COLORS.primary,
    },
    locationButtonText: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.primary,
    },
    locationButtonTextActive: {
        color: COLORS.white,
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: SPACING.s,
        color: COLORS.textLight,
        fontSize: FONT_SIZE.m,
    },
    button: {
        marginTop: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    halfInput: {
        flex: 1,
    },
    label: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    categoryContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    categoryChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: '#eee',
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        fontSize: FONT_SIZE.s,
        color: COLORS.text,
    },
    categoryTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.m,
        gap: SPACING.s,
    },
    dateText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.text,
    },
    radioOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
    },
    radioOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F9F4',
    },
    radioText: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    radioTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
    pledgeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: SPACING.m,
        backgroundColor: '#FFF8E1', // Light yellow warning bg
        borderRadius: 12,
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
        gap: SPACING.s,
    },
    pledgeText: {
        flex: 1,
        fontSize: FONT_SIZE.s,
        color: '#856404', // Dark yellow/brown text
        lineHeight: 20,
    },
    charCounter: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        textAlign: 'right',
        marginTop: -SPACING.s,
        marginBottom: SPACING.s,
    },
    feeBreakdown: {
        backgroundColor: '#FFF8E1',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    feeTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: '#F57C00',
        marginBottom: SPACING.s,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    feeRowTotal: {
        marginTop: SPACING.s,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: '#FFE082',
    },
    feeLabel: {
        fontSize: FONT_SIZE.s,
        color: COLORS.text,
    },
    feeLabelBold: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    feeValue: {
        fontSize: FONT_SIZE.s,
        color: COLORS.text,
    },
    feeValueRed: {
        fontSize: FONT_SIZE.s,
        color: '#D32F2F',
        fontWeight: '600',
    },
    feeValueGreen: {
        fontSize: FONT_SIZE.m,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    feeNote: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginTop: SPACING.s,
    },
});

export default AddFoodScreen;
