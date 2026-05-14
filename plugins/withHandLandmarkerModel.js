const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');

/**
 * Adds hand_landmarker.task to the iOS bundle resources.
 * Runs during `npx expo prebuild` (triggered automatically by EAS Build).
 */
const withHandLandmarkerModel = (config) => {
  return withXcodeProject(config, (mod) => {
    const xcodeProject = mod.modResults;
    const projectName = mod.modRequest.projectName;

    const fileName = 'hand_landmarker.task';
    const relativePath = path.join('models', fileName);

    // Skip if already added
    const refs = xcodeProject.pbxFileReferenceSection();
    const alreadyAdded = Object.values(refs).some(
      (ref) => ref && ref.path === `"${fileName}"`
    );

    if (!alreadyAdded) {
      xcodeProject.addResourceFile(
        relativePath,
        { target: xcodeProject.getFirstTarget().uuid },
        projectName
      );
      console.log(`[withHandLandmarkerModel] Added ${fileName} to iOS bundle`);
    }

    return mod;
  });
};

module.exports = withHandLandmarkerModel;
