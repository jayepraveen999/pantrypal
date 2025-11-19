import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

const Input = ({ label, error, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={COLORS.textLight}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
        width: '100%',
    },
    label: {
        fontSize: FONT_SIZE.s,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        fontWeight: '500',
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: SPACING.m,
        fontSize: FONT_SIZE.m,
        color: COLORS.text,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    error: {
        color: COLORS.error,
        fontSize: FONT_SIZE.xs,
        marginTop: SPACING.xs,
    },
});

export default Input;
