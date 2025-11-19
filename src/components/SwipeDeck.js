import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import FoodCard from './FoodCard';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

const SwipeDeck = ({ data, onSwipeLeft, onSwipeRight, onSwipeLeftPress, onSwipeRightPress }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const currentItem = data[currentIndex];
    const nextItem = data[currentIndex + 1];

    const handleSwipeComplete = (direction) => {
        const item = data[currentIndex];
        if (!item) return;

        if (direction === 'right') {
            onSwipeRight && onSwipeRight(item);
        } else {
            onSwipeLeft && onSwipeLeft(item);
        }

        // Reset position immediately
        translateX.value = 0;
        translateY.value = 0;
        setCurrentIndex((prev) => prev + 1);
    };

    // Expose swipe methods
    useEffect(() => {
        if (onSwipeLeftPress) {
            onSwipeLeftPress.current = () => {
                if (!currentItem) return;
                translateX.value = withSpring(-width * 1.5, {}, () => {
                    runOnJS(handleSwipeComplete)('left');
                });
            };
        }
        if (onSwipeRightPress) {
            onSwipeRightPress.current = () => {
                if (!currentItem) return;
                translateX.value = withSpring(width * 1.5, {}, () => {
                    runOnJS(handleSwipeComplete)('right');
                });
            };
        }
    }, [onSwipeLeftPress, onSwipeRightPress, currentIndex]);

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 'right' : 'left';
                translateX.value = withSpring(
                    direction === 'right' ? width * 1.5 : -width * 1.5,
                    {},
                    () => {
                        runOnJS(handleSwipeComplete)(direction);
                    }
                );
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-width / 2, 0, width / 2],
            [-10, 0, 10],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    if (!currentItem) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No more food nearby!</Text>
                    <Text style={styles.emptySubText}>Check back later or post your own.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background Card - Static, No animation */}
            {nextItem && (
                <View style={[styles.cardContainer, styles.nextCard]}>
                    <FoodCard item={nextItem} />
                </View>
            )}

            {/* Active Card - Swipeable */}
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.cardContainer, animatedStyle]}>
                    <FoodCard item={currentItem} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        position: 'absolute',
    },
    nextCard: {
        zIndex: 0,
        transform: [{ scale: 0.95 }, { translateY: 10 }],
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 16,
        color: COLORS.textLight,
    },
});

export default SwipeDeck;
