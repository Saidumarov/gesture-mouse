import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

const CURSOR_SIZE = 28;
const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.6 };

const GESTURE_COLORS: Record<string, string> = {
  none:     '#FFFFFF40',
  pointing: '#00E5FF',
  fist:     '#FF4081',
  pinch:    '#69F0AE',
  open:     '#FFFFFF',
};

interface Props {
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  isDetected: SharedValue<boolean>;
  gesture: SharedValue<string>;
}

export function GestureCursor({ cursorX, cursorY, isDetected, gesture }: Props) {
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(cursorX.value - CURSOR_SIZE / 2, SPRING_CONFIG) },
      { translateY: withSpring(cursorY.value - CURSOR_SIZE / 2, SPRING_CONFIG) },
    ],
    opacity: withSpring(isDetected.value ? 1 : 0, SPRING_CONFIG),
    borderColor: GESTURE_COLORS[gesture.value] ?? GESTURE_COLORS.none,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(gesture.value === 'fist' ? 0.4 : 1, SPRING_CONFIG) },
    ],
    backgroundColor: GESTURE_COLORS[gesture.value] ?? GESTURE_COLORS.none,
  }));

  return (
    <Animated.View style={[styles.cursor, containerStyle]}>
      <Animated.View style={[styles.inner, innerStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cursor: {
    position: 'absolute',
    width: CURSOR_SIZE,
    height: CURSOR_SIZE,
    borderRadius: CURSOR_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: CURSOR_SIZE * 0.4,
    height: CURSOR_SIZE * 0.4,
    borderRadius: CURSOR_SIZE * 0.2,
  },
});
