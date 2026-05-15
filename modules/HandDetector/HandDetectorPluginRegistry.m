#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#if __has_include("HandDetector-Swift.h")
  #import "HandDetector-Swift.h"
#else
  #import <HandDetector/HandDetector-Swift.h>
#endif

@interface HandDetectorPlugin (AutoRegistration)
@end

@implementation HandDetectorPlugin (AutoRegistration)
+ (void)load {
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectHands"
    withInitializer:^FrameProcessorPlugin* _Nonnull (VisionCameraProxyHolder* _Nonnull proxy,
                                                     NSDictionary* _Nullable options) {
      return [[HandDetectorPlugin alloc] initWithProxy:proxy withOptions:options];
    }];
}
@end
