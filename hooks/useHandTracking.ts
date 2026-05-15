import { useRef } from 'react';
import { Dimensions } from 'react-native';
import { useRunOnJS } from 'react-native-worklets-core';
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
  frameProcessor: ReadonlyFrameProcessor;
}

export function useHandTracking(
  onGestureChange?: (state: GestureState) => void,
): HandTrackingResult {
  const callbackRef = useRef(onGestureChange);
  callbackRef.current = onGestureChange;

  const notifyJS = useRunOnJS((
    x: number,
    y: number,
    gestureStr: string,
    pinchDist: number,
  ) => {
    callbackRef.current?.({
      gesture: gestureStr as GestureType,
      cursorX: x,
      cursorY: y,
      pinchDistance: pinchDist > 0 ? pinchDist : undefined,
    });
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (handPlugin == null) return;

    const raw = handPlugin.call(frame) as unknown as {
      detected: boolean;
      landmarks?: number[][];
    } | null;

    if (!raw?.detected || !raw.landmarks) return;

    const lm = raw.landmarks;
    const tipX = 1 - lm[HandLandmarkIndex.INDEX_FINGER_TIP][0];
    const tipY = lm[HandLandmarkIndex.INDEX_FINGER_TIP][1];
    const x = tipX * SCREEN_W;
    const y = tipY * SCREEN_H;

    const gesture = classifyGesture(lm);
    const pinchDist = gesture === 'pinch'
      ? dist2D(lm[HandLandmarkIndex.THUMB_TIP], lm[HandLandmarkIndex.INDEX_FINGER_TIP])
      : 0;

    notifyJS(x, y, gesture, pinchDist);
  }, [notifyJS]);

  return { frameProcessor };
}
