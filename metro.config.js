const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add tflite and task to asset extensions so Metro bundles them
config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('task');

module.exports = config;
