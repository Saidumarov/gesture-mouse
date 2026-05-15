import React, { useState, useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { CameraView } from '../components/CameraView';
import { GestureCursor } from '../components/GestureCursor';
import { HandTracker } from '../components/HandTracker';
import { useHandTracking } from '../hooks/useHandTracking';
import { GestureState, GestureType } from '../types/gesture';

const { width: W, height: H } = Dimensions.get('window');

export function GestureScreen() {
  const [gestureState, setGestureState] = useState<GestureState | null>(null);
  const [cursorX, setCursorX]   = useState(W / 2);
  const [cursorY, setCursorY]   = useState(H / 2);
  const [detected, setDetected] = useState(false);
  const [gesture, setGesture]   = useState<GestureType>('none');

  const onGestureChange = useCallback((state: GestureState) => {
    setGestureState(state);
    setCursorX(state.cursorX);
    setCursorY(state.cursorY);
    setDetected(true);
    setGesture(state.gesture);
  }, []);

  const tracking = useHandTracking(onGestureChange);

  return (
    <View style={styles.root}>
      <CameraView tracking={tracking} />
      <HandTracker gestureState={gestureState} isDetected={detected} />
      <GestureCursor
        x={cursorX}
        y={cursorY}
        detected={detected}
        gesture={gesture}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
});
