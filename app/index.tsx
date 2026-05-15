import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from '../components/CameraView';
import { GestureCursor } from '../components/GestureCursor';
import { HandTracker } from '../components/HandTracker';
import { useHandTracking } from '../hooks/useHandTracking';
import { GestureState } from '../types/gesture';

export function GestureScreen() {
  const [gestureState, setGestureState] = useState<GestureState | null>(null);
  const [detected, setDetected] = useState(false);

  const onGestureChange = useCallback((state: GestureState) => {
    setGestureState(state);
    setDetected(true);
  }, []);

  const tracking = useHandTracking(onGestureChange);

  return (
    <View style={styles.root}>
      <CameraView tracking={tracking} />
      <HandTracker gestureState={gestureState} isDetected={detected} />
      <GestureCursor
        cursorX={tracking.cursorX}
        cursorY={tracking.cursorY}
        isDetected={tracking.isDetected}
        gesture={tracking.gesture}
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
