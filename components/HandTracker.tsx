import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureState, GestureType } from '../types/gesture';

const GESTURE_LABELS: Record<GestureType, string> = {
  none:     '✋ Detecting...',
  pointing: '☝️ Pointing',
  fist:     '✊ Tap!',
  pinch:    '🤏 Pinch / Zoom',
  open:     '🖐 Open',
};

const GESTURE_COLORS: Record<GestureType, string> = {
  none:     '#888',
  pointing: '#00E5FF',
  fist:     '#FF4081',
  pinch:    '#69F0AE',
  open:     '#fff',
};

interface Props {
  gestureState: GestureState | null;
  isDetected: boolean;
}

/**
 * Overlay that shows current gesture label and cursor coords.
 * Pure display — no logic.
 */
export function HandTracker({ gestureState, isDetected }: Props) {
  const gesture = gestureState?.gesture ?? 'none';
  const label   = GESTURE_LABELS[gesture];
  const color   = GESTURE_COLORS[gesture];

  return (
    <View style={styles.container}>
      {/* Gesture badge */}
      <View style={[styles.badge, { borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>

      {/* Coordinates */}
      {isDetected && gestureState && (
        <View style={styles.coords}>
          <Text style={styles.coordText}>
            X: {gestureState.cursorX.toFixed(0)}
            {'  '}
            Y: {gestureState.cursorY.toFixed(0)}
          </Text>
          {gestureState.pinchDistance != null && (
            <Text style={styles.coordText}>
              Pinch: {(gestureState.pinchDistance * 100).toFixed(1)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#00000088',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  coords: {
    backgroundColor: '#00000066',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  coordText: {
    color: '#ffffffaa',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
