# 團體記帳

TuanFund是一個用於管理多人參加金（例如家庭基金、小團體儲蓄）的 React Native 應用程式。</br>使用者可以建立或加入群組，透明化追蹤每位成員的繳費狀態，並支援月繳、預繳等多種儲值方式，以便追蹤與管理每人繳費狀態。

## 技術架構
- **React Native** + **Expo** — 跨平台行動應用開發
- **TypeScript** — 靜態型別強化專案穩定性
- **Firebase** — 使用 Authentication + Firestore 做為後端支援
- **NativeWind** — 使用 Tailwind CSS 風格撰寫樣式
- **MVVM 架構** — 模組化畫面與邏輯，提升可維護性

## 主要功能
- 使用者註冊 / 登入（Account/Password，支援 Firebase Auth）
<img src="https://drive.google.com/uc?export=view&id=1WkoL3rvtJj3xKnjgykSEI-8oHlQkM9Ss" width="50%" height="50%" />

- 首頁
  - 可查看目前群組總金額年度折線圖
  - 可查看最近出入帳資訊
  - 可查看本用戶是否完成"本月份"繳費
<img src="https://drive.google.com/uc?export=view&id=1DvZw3Lz0vWQLxY5Utw7rDhhPeyaWGkPe" width="30%" height="30%" />

- 紀錄
  - 可設置查詢日期範圍
  - 可查看群組全部紀錄或個人新增的出入帳紀錄
  - 成員間繳費狀況透明顯示（如：該費用預繳期間）
  - 提供刪除與編輯（待完善）功能
<img src="https://drive.google.com/uc?export=view&id=1LiyVcdj0wAsQYiy_dIVcqd-rwY0zXbt8" width="50%" height="50%" />

- 建立出入帳紀錄
  - 設置標題、金額、備註，出帳或入帳
  - 入帳可開啟預繳計算，協助查看本次入帳可以預繳幾個月、並設置從何時開啟預繳，方便首頁計算
  - 限制成員權限，成員僅能入帳、群主可出入帳方便管理帳務
 <img src="https://drive.google.com/uc?export=view&id=12Jb5x0IxaWV7BLTRg1Ysk5iSM_8gDPx-" width="50%" height="50%" />

- 成員
  - 查看成員名稱、身分、可客製化預繳金額、移除成員
 <img src="https://drive.google.com/uc?export=view&id=1yL1Q9pIuyPHlLaYr6Bu5gJDdZjDnOFy4" width="30%" height="30%" />

- 設定頁
  - 查看個人資料（名稱、目前所在群組）
  - 一個帳號可加入多個群組，於設定頁面切換
  - 提供退出群組功能
  - 提供建立群組介面
  - 提供加入現有群組介面
<img src="https://drive.google.com/uc?export=view&id=1UWLhWLl-MREGLQY_-OeHP7mxkGlnAioN" width="50%" height="50%" />
<img src="https://drive.google.com/uc?export=view&id=1QRP9GlgwJzurT3QBAX5yHjLLP109EiTQ" width="55%" height="50%" />

## 專案未來可擴充方向
目前已達成 MVP，該 App 現已有6-7人群組日常使用作為資金規劃與檢視，未來預計新增：
- 推播通知（如：繳費提醒）
- 完整測試覆蓋（UI 測試、自動化測試）
- 部分UI與流程優化（編輯紀錄、完善使用者介面、優化本月/季/年預繳，首頁顯示狀態）
- Firebase Rule 安全強化
- 串接三方金流完成繳費

## 開發者資訊
本專案由 yii016999 個人開發，用於私人團體工具、學習與展示作品使用
暫不開放商業使用或再發佈，未經授權請勿直接使用本專案於其他用途

This project is developed by yii016999 for personal learning and portfolio presentation only.
No permission is granted to copy, modify, distribute, or use this project in whole or in part
without explicit written consent from the author.

- Email: yii016999@gmail.com
- Copyright ©2025 yii016999
