import { useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { useSharedValue, runOnJS, type SharedValue } from 'react-native-reanimated';
import {
  useFrameProcessor,
  VisionCameraProxy,
  type ReadonlyFrameProcessor,
} from 'react-native-vision-camera';
import { GestureState, GestureType, HandLandmarkIndex } from '../types/gesture';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Initialized once at module load — correct VisionCamera v4 pattern
const handPlugin = VisionCameraProxy.initFrameProcessorPlugin('detectHands', {});

// ---------- worklet helpers (must be top-level for worklet compiler) ----------

function dist2D(a: number[], b: number[]): number {
  'worklet';
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function classifyGesture(lm: number[][]): GestureType {
  'worklet';
  if (!lm || lm.length < 21) return 'none';

  const thumbTip  = lm[HandLandmarkIndex.THUMB_TIP];
  const indexTip  = lm[HandLandmarkIndex.INDEX_FINGER_TIP];
  const middleTip = lm[HandLandmarkIndex.MIDDLE_FINGER_TIP];
  const ringTip   = lm[HandLandmarkIndex.RING_FINGER_TIP];
  const pinkyTip  = lm[HandLandmarkIndex.PINKY_TIP];
  const wrist     = lm[HandLandmarkIndex.WRIST];

  // Pinch: thumb ↔ index < 6% of frame width
  if (dist2D(thumbTip, indexTip) < 0.06) return 'pinch';

  // Fist: average fingertip-to-wrist distance < 12%
  const tips = [indexTip, middleTip, ringTip, pinkyTip];
  const avgDist =
    (dist2D(tips[0], wrist) +
      dist2D(tips[1], wrist) +
      dist2D(tips[2], wrist) +
      dist2D(tips[3], wrist)) /
    4;
  if (avgDist < 0.12) return 'fist';

  return 'pointing';
}

// ---------- public interface ----------

export interface HandTrackingResult {
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  isDetected: SharedValue<boolean>;
  frameProcessor: ReadonlyFrameProcessor;
}

export function useHandTracking(
  onGestureChange?: (state: GestureState) => void,
): HandTrackingResult {
  const cursorX    = useSharedValue(SCREEN_W / 2);
  const cursorY    = useSharedValue(SCREEN_H / 2);
  const isDetected = useSharedValue(false);

  // Stable callback ref — avoids stale closure in worklet → JS bridge
  const callbackRef = useRef(onGestureChange);
  callbackRef.current = onGestureChange;

  const notifyJS = useCallback((state: GestureState) => {
    callbackRef.current?.(state);
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (handPlugin == null) return;

    const raw = handPlugin.call(frame) as {
      detected: boolean;
      landmarks?: number[][];
    } | null;

    if (!raw?.detected || !raw.landmarks) {
      isDetected.value = false;
      return;
    }

    isDetected.value = true;
    const lm = raw.landmarks;

    // Mirror X for front (selfie) camera
    const tipX = 1 - lm[HandLandmarkIndex.INDEX_FINGER_TIP][0];
    const tipY = lm[HandLandmarkIndex.INDEX_FINGER_TIP][1];

    cursorX.value = tipX * SCREEN_W;
    cursorY.value = tipY * SCREEN_H;

    const gesture = classifyGesture(lm);
    const pinchDistance =
      gesture === 'pinch'
        ? dist2D(lm[HandLandmarkIndex.THUMB_TIP], lm[HandLandmarkIndex.INDEX_FINGER_TIP])
        : undefined;

    runOnJS(notifyJS)({
      gesture,
      cursorX: tipX * SCREEN_W,
      cursorY: tipY * SCREEN_H,
      pinchDistance,
    });
  }, [notifyJS]);

  return { cursorX, cursorY, isDetected, frameProcessor };
}
