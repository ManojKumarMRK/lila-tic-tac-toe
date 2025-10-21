const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js globals
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': 'react-native-crypto',
  'stream': 'stream-browserify',
  'buffer': '@craftzdog/react-native-buffer',
};

// Ensure proper handling of Node.js polyfills
config.resolver.unstable_enablePackageExports = false;

// Add global polyfills
config.resolver.platforms = [...config.resolver.platforms, 'native', 'android', 'ios'];

module.exports = config;