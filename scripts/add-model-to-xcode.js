/**
 * Directly patches project.pbxproj to add hand_landmarker.task
 * to Copy Bundle Resources phase.
 * Run: node scripts/add-model-to-xcode.js
 */
const fs   = require('fs');
const path = require('path');

const pbxPath = path.join(
  __dirname,
  '../ios/gesturemouse.xcodeproj/project.pbxproj'
);

let content = fs.readFileSync(pbxPath, 'utf8');

const MODEL_FILE      = 'hand_landmarker.task';
const FILE_REF_UUID   = 'A1B2C3D4E5F6A7B8C9D0E1F2'; // PBXFileReference
const BUILD_FILE_UUID = 'F2E1D0C9B8A7F6E5D4C3B2A1'; // PBXBuildFile

// --- Guard: already patched? ---
if (content.includes(FILE_REF_UUID)) {
  console.log('✅ hand_landmarker.task already in Xcode project. Nothing to do.');
  process.exit(0);
}

// --- 1. Add PBXFileReference entry (after "Begin PBXFileReference section") ---
const fileRefEntry = `\t\t${FILE_REF_UUID} /* ${MODEL_FILE} */ = {isa = PBXFileReference; lastKnownFileType = file; name = "${MODEL_FILE}"; path = "gesturemouse/models/${MODEL_FILE}"; sourceTree = "<group>"; };`;

content = content.replace(
  '/* Begin PBXFileReference section */',
  `/* Begin PBXFileReference section */\n${fileRefEntry}`
);

// --- 2. Add PBXBuildFile entry (after "Begin PBXBuildFile section") ---
const buildFileEntry = `\t\t${BUILD_FILE_UUID} /* ${MODEL_FILE} in Resources */ = {isa = PBXBuildFile; fileRef = ${FILE_REF_UUID} /* ${MODEL_FILE} */; };`;

content = content.replace(
  '/* Begin PBXBuildFile section */',
  `/* Begin PBXBuildFile section */\n${buildFileEntry}`
);

// --- 3. Add to PBXResourcesBuildPhase files array ---
// Find the Resources build phase and add our build file
content = content.replace(
  /(\t\t\t\tBB2F792D24A3F905000567C9 \/\* Expo\.plist in Resources \*\/,)/,
  `\t\t\t\t${BUILD_FILE_UUID} /* ${MODEL_FILE} in Resources */,\n\t\t\t\t$1`
);

// --- 4. Add FileReference to gesturemouse PBX group children ---
// Insert before AppDelegate.swift in the gesturemouse group
content = content.replace(
  /(\t\t\t\tF11748412D0307B40044C1D9 \/\* AppDelegate\.swift \*\/,)/,
  `\t\t\t\t${FILE_REF_UUID} /* ${MODEL_FILE} */,\n\t\t\t\t$1`
);

fs.writeFileSync(pbxPath, content, 'utf8');
console.log('✅ Patched project.pbxproj — hand_landmarker.task added to Copy Bundle Resources.');
