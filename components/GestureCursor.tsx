import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { GestureType } from '../types/gesture';

const CURSOR_SIZE = 28;
const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.6 };

// Color per gesture
const GESTURE_COLORS: Record<GestureType, string> = {
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
  gesture: GestureType;
}

export function GestureCursor({ cursorX, cursorY, isDetected, gesture }: Props) {
  const color = GESTURE_COLORS[gesture] ?? GESTURE_COLORS.none;

  // Smooth movement with spring
  const smoothX = useDerivedValue(() => withSpring(cursorX.value, SPRING_CONFIG));
  const smoothY = useDerivedValue(() => withSpring(cursorY.value, SPRING_CONFIG));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: smoothX.value - CURSOR_SIZE / 2 },
      { translateY: smoothY.value - CURSOR_SIZE / 2 },
    ],
    opacity: withSpring(isDetected.value ? 1 : 0, SPRING_CONFIG),
  }));

  // Inner dot pulses on fist (tap)
  const innerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(gesture === 'fist' ? 0.4 : 1, SPRING_CONFIG) },
    ],
  }));

  return (
    <Animated.View style={[styles.cursor, containerStyle, { borderColor: color }]}>
      <Animated.View style={[styles.inner, innerStyle, { backgroundColor: color }]} />
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
