import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import type { HandTrackingResult } from '../hooks/useHandTracking';

interface Props {
  tracking: HandTrackingResult;
}

/**
 * Full-screen front camera with frame processor attached.
 * Handles permission request and loading states.
 */
export function CameraView({ tracking }: Props) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Front camera not found</Text>
      </View>
    );
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={tracking.frameProcessor}
      // Mirror front camera visually so it feels like a mirror
      outputOrientation="device"
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
