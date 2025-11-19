import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, PlusCircle, MessageCircle, User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

// Import Screens (using placeholders for now)
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import AddFoodScreen from '../screens/AddFoodScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import MyPickupsScreen from '../screens/MyPickupsScreen';
import RequestChatScreen from '../screens/RequestChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="AddFoodTab"
                component={AddFoodScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={32} />,
                }}
            />
            <Tab.Screen
                name="ChatTab"
                component={ChatListScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

const AppNavigator = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="ChatDetail" component={ChatScreen} />
                        <Stack.Screen
                            name="MyListings"
                            component={MyListingsScreen}
                            options={{ headerShown: true, title: 'My Listings' }}
                        />
                        <Stack.Screen
                            name="MyPickups"
                            component={MyPickupsScreen}
                            options={{ headerShown: true, title: 'My Pickups' }}
                        />
                        <Stack.Screen
                            name="RequestChat"
                            component={RequestChatScreen}
                            options={{ headerShown: true, title: 'Chat' }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ headerShown: true, title: 'Settings' }}
                        />
                        <Stack.Screen
                            name="Achievements"
                            component={AchievementsScreen}
                            options={{ headerShown: true, title: 'Achievements' }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
