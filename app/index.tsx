import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from '../components/CameraView';
import { GestureCursor } from '../components/GestureCursor';
import { HandTracker } from '../components/HandTracker';
import { useHandTracking } from '../hooks/useHandTracking';
import { GestureState, GestureType } from '../types/gesture';

/**
 * Main gesture tracking screen.
 *
 * Layout (all layers stacked via position: absolute):
 *   1. CameraView   — full-screen live camera feed
 *   2. HandTracker  — gesture label overlay (top center)
 *   3. GestureCursor — animated cursor dot
 */
export function GestureScreen() {
  const [gestureState, setGestureState] = useState<GestureState | null>(null);
  const [gesture, setGesture] = useState<GestureType>('none');
  const [detected, setDetected] = useState(false);

  const onGestureChange = useCallback((state: GestureState) => {
    setGestureState(state);
    setGesture(state.gesture);
    setDetected(true);
  }, []);

  const tracking = useHandTracking(onGestureChange);

  return (
    <View style={styles.root}>
      {/* Layer 1: Camera feed */}
      <CameraView tracking={tracking} />

      {/* Layer 2: Gesture label */}
      <HandTracker
        gestureState={gestureState}
        isDetected={detected}
      />

      {/* Layer 3: Cursor */}
      <GestureCursor
        cursorX={tracking.cursorX}
        cursorY={tracking.cursorY}
        isDetected={tracking.isDetected}
        gesture={gesture}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
});
