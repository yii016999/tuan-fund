import 'dotenv/config'

export default {
  expo: {
    // 在裝置上看到的 App 名（例如主畫面圖示下、App Switcher），支持多語系
    name: '團體記帳',
    // Expo 用來識別專案的 唯一 URL 標籤，必須是英文小寫 + 數字 + dash（-）等組成，不能有空格或特殊字元
    // 通常也會被用作產出的 bundle 路徑的一部分
    slug: 'tuanfund',
    version: '1.0.0',
    userInterfaceStyle: 'automatic',
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  },
}