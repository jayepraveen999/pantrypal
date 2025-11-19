import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

const Button = ({ title, onPress, variant = 'primary', loading = false, style }) => {
    const backgroundColor = variant === 'primary' ? COLORS.primary : COLORS.white;
    const textColor = variant === 'primary' ? COLORS.white : COLORS.primary;
    const border = variant === 'outline' ? { borderWidth: 1, borderColor: COLORS.primary } : {};

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor }, border, style]}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.text, { color: textColor }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.l,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    text: {
        fontSize: FONT_SIZE.m,
        fontWeight: '600',
    },
});

export default Button;
