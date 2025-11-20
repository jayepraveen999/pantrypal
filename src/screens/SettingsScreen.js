import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Globe, Shield, HelpCircle, LogOut } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../constants/theme';
import { auth } from '../config/firebaseConfig';

const SettingsScreen = ({ navigation }) => {
    const [pushNotifications, setPushNotifications] = useState(true);
    const [locationServices, setLocationServices] = useState(true);
    const [showDistance, setShowDistance] = useState(true);

    const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightComponent }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Icon size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightComponent}
        </TouchableOpacity>
    );

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            // Navigation handled automatically by AppNavigator's auth state listener
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to log out');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <SettingItem
                        icon={Bell}
                        title="Push Notifications"
                        subtitle="Get notified about matches and messages"
                        rightComponent={
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <SettingItem
                        icon={MapPin}
                        title="Location Services"
                        subtitle="Allow app to access your location"
                        rightComponent={
                            <Switch
                                value={locationServices}
                                onValueChange={setLocationServices}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        }
                    />
                    <SettingItem
                        icon={Globe}
                        title="Show Distance"
                        subtitle="Display distance to food items"
                        rightComponent={
                            <Switch
                                value={showDistance}
                                onValueChange={setShowDistance}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy & Safety</Text>
                    <SettingItem
                        icon={Shield}
                        title="Privacy Policy"
                        subtitle="Read our privacy policy"
                        onPress={() => Alert.alert('Coming Soon', 'Privacy policy will be available soon')}
                    />
                    <SettingItem
                        icon={HelpCircle}
                        title="Help & Support"
                        subtitle="Get help or report an issue"
                        onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon')}
                    />
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <LogOut size={20} color={COLORS.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
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
        padding: SPACING.m,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: SPACING.m,
        marginLeft: SPACING.s,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.error,
        ...SHADOWS.small,
    },
    logoutText: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
        color: COLORS.error,
        marginLeft: SPACING.s,
    },
    version: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: SPACING.l,
    },
});

export default SettingsScreen;
