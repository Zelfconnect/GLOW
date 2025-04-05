// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Override the problematic serializer configuration
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs', 'mjs']
};

// Remove any problematic serializer configuration
if (config.serializer && config.serializer.isThirdPartyModule) {
  delete config.serializer.isThirdPartyModule;
}

module.exports = config; 