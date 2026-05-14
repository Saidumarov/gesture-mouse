import Foundation
import Vision

/// Apple Vision hand pose detector — same 21-landmark output as MediaPipe.
/// Synchronous, safe to call from a background frame processor thread.
@objc public class HandDetector: NSObject {

  // MediaPipe landmark order (21 joints)
  private static let jointNames: [VNHumanHandPoseObservation.JointName] = [
    .wrist,
    .thumbCMC, .thumbMP, .thumbIP, .thumbTip,
    .indexMCP, .indexPIP, .indexDIP, .indexTip,
    .middleMCP, .middlePIP, .middleDIP, .middleTip,
    .ringMCP,  .ringPIP,  .ringDIP,  .ringTip,
    .littleMCP,.littlePIP,.littleDIP,.littleTip,
  ]

  /// Returns 21 landmarks as [[x, y, confidence]] (0.0–1.0), or nil if no hand detected.
  @objc public static func detect(pixelBuffer: CVPixelBuffer) -> [[NSNumber]]? {
    let request = VNDetectHumanHandPoseRequest()
    request.maximumHandCount = 1

    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])
    do {
      try handler.perform([request])
    } catch {
      return nil
    }

    guard let observation = request.results?.first else { return nil }

    return jointNames.map { name in
      guard let point = try? observation.recognizedPoint(name) else {
        return [NSNumber(value: 0), NSNumber(value: 0), NSNumber(value: 0)]
      }
      return [
        NSNumber(value: Float(point.location.x)),
        NSNumber(value: Float(1.0 - point.location.y)), // flip Y: Vision is bottom-left origin
        NSNumber(value: Float(point.confidence)),
      ]
    }
  }
}
