import VisionCamera
import CoreMedia
import CoreVideo

/// VisionCamera v4 Frame Processor Plugin.
/// Called from JS as: const result = detectHands(frame)
@objc(HandDetectorPlugin)
public class HandDetectorPlugin: FrameProcessorPlugin {

  public override init(proxy: VisionCameraProxyHolder,
                       options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(
    _ frame: Frame,
    withArguments arguments: [AnyHashable: Any]?
  ) -> Any? {
    let sampleBuffer = frame.buffer
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return ["detected": false, "error": "Could not get pixel buffer"]
    }

    guard let landmarks = HandDetector.detect(pixelBuffer: pixelBuffer) else {
      return ["detected": false]
    }

    return [
      "detected": true,
      "landmarks": landmarks
    ]
  }
}
