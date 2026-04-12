module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required for Expo Router: inlines EXPO_ROUTER_APP_ROOT so require.context() gets a static path.
    plugins: [require.resolve('expo-router/babel')],
  };
};
