const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

module.exports = {
  resolver: {
    extraNodeModules: {
      // Add any additional modules needed here
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [
    // Add any additional watch folders needed here
  ],
};
