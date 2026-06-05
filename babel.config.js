module.exports = function(api) {
  // Detect if target platform is web
  const isWeb = api.caller(caller => caller && (caller.platform === 'web' || caller.name === 'babel-loader'));
  
  // Invalidate cache when platform changes
  api.cache.invalidate(() => `${isWeb}`);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      !isWeb && ['react-native-worklets-core/plugin']
    ].filter(Boolean),
  };
};



