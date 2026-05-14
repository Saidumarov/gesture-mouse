Pod::Spec.new do |s|
  s.name         = "HandDetector"
  s.version      = "1.0.0"
  s.summary      = "Apple Vision hand pose detection for VisionCamera"
  s.homepage     = "https://github.com/placeholder"
  s.license      = { :type => "MIT" }
  s.author       = { "dev" => "dev@dev.com" }
  s.platform     = :ios, "15.0"
  s.source       = { :path => "." }
  s.source_files = "*.swift", "*.m", "*.h"
  s.swift_version = "5.9"

  s.frameworks   = "Vision"
  s.dependency "VisionCamera"
end
