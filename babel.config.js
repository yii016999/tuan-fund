module.exports = function (api) {
  // Babel 可以永遠重複使用這份設定
  api.cache(true);

  return {
    // 由 Expo 團隊提供的 Babel 預設設定包（preset）
    // 包含所有 Expo 的 Babel 設定
    // 支援 React JSX、Ts、Js
    // 或是 React Native 特有支援	ex.transform runtime、Hermes
    // 整合 React Refresh	開發時自動 hot reload（也叫 Fast Refresh）
    presets: [
      'babel-preset-expo',
      // 整合 NativeWind 的 Babel 插件
      'nativewind/babel',
    ],
    plugins: [
      // 讓 Expo Router 正常運作的 Babel 插件
      'expo-router/babel',
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};