const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro's "web" platform has no .web.js for many react-native/Libraries files * (only .ios.js / .android.js). Resolving those imports as "ios" fixes the graph;
 * react-native-web still supplies most app-level components.
 */
const config = getDefaultConfig(__dirname);
const originalResolveRequest = config.resolver.resolveRequest;

const isUnderReactNativeLibraries = (originModulePath) => {
  if (!originModulePath) return false;
  const normalized = originModulePath.split(path.sep).join('/');
  return normalized.includes('/node_modules/react-native/Libraries/');
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve =
    originalResolveRequest ??
    ((ctx, mod, plat) => ctx.resolveRequest(ctx, mod, plat));

  if (platform === 'web' && isUnderReactNativeLibraries(context.originModulePath)) {
    return resolve(context, moduleName, 'ios');
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
