#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

// Registers HandDetectorPlugin as "detectHands" in the VisionCamera plugin system.
// Called automatically at app launch before any JS code runs.
VISION_EXPORT_FRAME_PROCESSOR(HandDetectorPlugin, detectHands)
