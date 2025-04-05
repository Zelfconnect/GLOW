const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          'react-native-reanimated', 
          '@react-navigation',
          '@firebase'
        ]
      }
    },
    argv
  );

  // Customize the config for web before returning it
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    '@react-native-community/async-storage': 'react-native-web/dist/exports/AsyncStorage',
    'react-native-gesture-handler': 'react-native-web'
  };

  return config;
}; 