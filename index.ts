import { registerRootComponent } from 'expo';
import App from './App';

// App 的 entry point
// 由 Metro bundler (本機開發時的 JS 打包工具，幫你組合所有 JS/TS 檔案，傳給 App 執行) 
// 或 native runtime (安裝在手機上的 React Native 引擎，負責載入、執行 JS bundle，並提供原生功能支持)
// 載入並啟動的第一個檔案

// 當使用 expo-router，這個 index.ts 暫時不需要
// 在 app.json 中 "entryPoint": "./node_modules/expo-router/entry"
// 這個 entry point 會自己從 app/ 資料夾開始找 index.tsx，自動註冊 Root Component
registerRootComponent(App);