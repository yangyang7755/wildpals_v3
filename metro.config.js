const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add video file extensions to asset extensions
config.resolver.assetExts.push(
  'mp4',
  'MP4',
  'mov',
  'MOV',
  'avi',
  'AVI',
  'mkv',
  'MKV'
);

module.exports = config;
