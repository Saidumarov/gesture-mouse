import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import type { GestureType } from '../types/gesture';

const CURSOR_SIZE = 28;
const { width: W, height: H } = Dimensions.get('window');
const SPRING = { speed: 20, bounciness: 4, useNativeDriver: true } as const;

const GESTURE_COLORS: Record<string, string> = {
  none:     '#FFFFFF40',
  pointing: '#00E5FF',
  fist:     '#FF4081',
  pinch:    '#69F0AE',
  open:     '#FFFFFF',
};

interface Props {
  x: number;
  y: number;
  detected: boolean;
  gesture: GestureType;
}

export function GestureCursor({ x, y, detected, gesture }: Props) {
  const animX       = useRef(new Animated.Value(W / 2 - CURSOR_SIZE / 2)).current;
  const animY       = useRef(new Animated.Value(H / 2 - CURSOR_SIZE / 2)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(animX, { toValue: x - CURSOR_SIZE / 2, ...SPRING }).start();
  }, [x]);

  useEffect(() => {
    Animated.spring(animY, { toValue: y - CURSOR_SIZE / 2, ...SPRING }).start();
  }, [y]);

  useEffect(() => {
    Animated.spring(animOpacity, { toValue: detected ? 1 : 0, ...SPRING }).start();
  }, [detected]);

  useEffect(() => {
    Animated.spring(animScale, { toValue: gesture === 'fist' ? 0.4 : 1, ...SPRING }).start();
  }, [gesture]);

  const color = GESTURE_COLORS[gesture] ?? GESTURE_COLORS.none;

  return (
    <Animated.View
      style={[
        styles.cursor,
        { borderColor: color, opacity: animOpacity },
        { transform: [{ translateX: animX }, { translateY: animY }] },
      ]}
    >
      <Animated.View
        style={[styles.inner, { backgroundColor: color, transform: [{ scale: animScale }] }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cursor: {
    position: 'absolute',
    top: 0,
    left: 0,
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
