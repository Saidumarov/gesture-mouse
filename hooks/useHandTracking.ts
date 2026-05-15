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

const handPlugin = VisionCameraProxy.initFrameProcessorPlugin('detectHands', {});

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

  if (dist2D(thumbTip, indexTip) < 0.06) return 'pinch';

  const avgDist =
    (dist2D(indexTip, wrist) +
      dist2D(middleTip, wrist) +
      dist2D(ringTip, wrist) +
      dist2D(pinkyTip, wrist)) /
    4;
  if (avgDist < 0.12) return 'fist';

  return 'pointing';
}

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

  const callbackRef = useRef(onGestureChange);
  callbackRef.current = onGestureChange;

  // All Reanimated SharedValue writes happen here — on the JS thread (safe!)
  const updateOnJS = useCallback((
    x: number,
    y: number,
    detected: boolean,
    gesture: string,
    pinchDist: number,
  ) => {
    cursorX.value = x;
    cursorY.value = y;
    isDetected.value = detected;

    if (detected && callbackRef.current) {
      callbackRef.current({
        gesture: gesture as GestureType,
        cursorX: x,
        cursorY: y,
        pinchDistance: pinchDist > 0 ? pinchDist : undefined,
      });
    }
  }, [cursorX, cursorY, isDetected]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (handPlugin == null) {
      runOnJS(updateOnJS)(SCREEN_W / 2, SCREEN_H / 2, false, 'none', 0);
      return;
    }

    const raw = handPlugin.call(frame) as unknown as {
      detected: boolean;
      landmarks?: number[][];
    } | null;

    if (!raw?.detected || !raw.landmarks) {
      runOnJS(updateOnJS)(SCREEN_W / 2, SCREEN_H / 2, false, 'none', 0);
      return;
    }

    const lm = raw.landmarks;
    const tipX = 1 - lm[HandLandmarkIndex.INDEX_FINGER_TIP][0];
    const tipY = lm[HandLandmarkIndex.INDEX_FINGER_TIP][1];
    const x = tipX * SCREEN_W;
    const y = tipY * SCREEN_H;

    const gesture = classifyGesture(lm);
    const pinchDist = gesture === 'pinch'
      ? dist2D(lm[HandLandmarkIndex.THUMB_TIP], lm[HandLandmarkIndex.INDEX_FINGER_TIP])
      : 0;

    runOnJS(updateOnJS)(x, y, true, gesture, pinchDist);
  }, [updateOnJS]);

  return { cursorX, cursorY, isDetected, frameProcessor };
}
