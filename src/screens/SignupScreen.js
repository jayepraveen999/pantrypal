import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';
import Input from '../components/Input';
import Button from '../components/Button';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { generateUniqueUsername } from '../utils/usernameGenerator';

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Generate Anonymous Username
            const username = await generateUniqueUsername(db, true); // true = include Munich-themed names
            console.log('Generated username:', username);

            // 3. Update Profile with anonymous username
            await updateProfile(user, { displayName: username });

            // 4. Create User Document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                username: username, // Anonymous username (e.g., "HungryPanda42")
                email: email,
                realName: name || null, // Store real name privately (never displayed)
                createdAt: serverTimestamp(),
                stats: {
                    shared: 0,
                    rescued: 0,
                    karma: 0
                }
            });

            // 5. Initialize 7-day free trial
            const { initializeTrial } = require('../utils/subscriptionService');
            await initializeTrial(user.uid);

            // Navigation is handled by AppNavigator listening to auth state
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>You'll get an anonymous username like "HungryPanda42"</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Name (Optional)"
                        placeholder="For your records only"
                        value={name}
                        onChangeText={setName}
                    />
                    <Input
                        label="Email"
                        placeholder="hello@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input
                        label="Password"
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Sign Up"
                        onPress={handleSignup}
                        loading={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Log In</Text>
                    </TouchableOpacity>
                </View>
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
        flexGrow: 1,
        padding: SPACING.l,
        justifyContent: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: FONT_SIZE.m,
        color: COLORS.textLight,
    },
    form: {
        marginBottom: SPACING.xl,
    },
    button: {
        marginTop: SPACING.s,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.m,
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.m,
    },
    link: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
    },
});

export default SignupScreen;
