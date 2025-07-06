import { RecordStatus, RecordTransactionType, RecordType } from "@/constants/types"
import { FieldValue, Timestamp } from "firebase/firestore"

// 群組收支記錄
export interface GroupTransactionRecord {
  id: string
  type: RecordTransactionType
  amount: number
  date: string
  title: string
  description?: string
  groupId: string
  userId: string // 記錄創建者
  createdAt: Date
  updatedAt: Date
}

// 個人繳費記錄
export interface MemberPaymentRecord {
  id: string            // 記錄 id
  groupId: string       // 群組 id
  memberId: string      // 繳費人的 uid
  amount: number        // 繳費金額
  paymentDate: string   // 繳費日期 (YYYY-MM-DD格式)
  billingMonth: string  // 繳費月份 (YYYY-MM格式)
  description?: string  // 繳費描述
  status: RecordStatus  // 繳費狀態
  createdAt: Timestamp | FieldValue       // 記錄創建時間
  updatedAt: Timestamp | FieldValue       // 記錄更新時間
}

export interface RecordListItem {
  id: string            // 記錄 id
  type: RecordType      // 記錄類型
  title: string         // 記錄標題
  amount: number        // 記錄金額
  date: string          // 記錄日期
  description?: string  // 記錄描述
  canEdit: boolean      // 根據權限決定是否可編輯
  canDelete: boolean    // 根據權限決定是否可刪除
} 