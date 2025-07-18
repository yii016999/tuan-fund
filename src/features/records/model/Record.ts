import { RecordStatus, RecordTransactionType, RecordType } from "@/constants/types"
import { FieldValue, Timestamp } from "firebase/firestore"

// 基礎記錄介面
interface BaseRecord {
  id: string
  createdAt: Timestamp | FieldValue | Date
  updatedAt: Timestamp | FieldValue | Date
}

// 群組收支記錄
export interface GroupTransactionRecord extends BaseRecord {
  type: RecordTransactionType
  amount: number
  date: string
  title: string
  description?: string
  groupId: string
  userId: string // 記錄創建者
  // 預繳相關欄位
  isPrepayment?: boolean
  prepaymentStartType?: string
  prepaymentCustomDate?: string
}

// 個人繳費記錄
export interface MemberPaymentRecord extends BaseRecord {
  groupId: string
  memberId: string
  amount: number
  paymentDate: string
  billingMonth: string
  title?: string // 確保有 title 欄位
  description?: string
  status: RecordStatus
  transactionId?: string
  // 預繳相關欄位
  isPrepayment?: boolean
  prepaymentRange?: {
    startMonth: string // YYYYMM
    endMonth: string   // YYYYMM
  }
}

// 記錄列表項目 (用於顯示在列表中)
export interface RecordListItem {
  id: string
  type: RecordType
  title: string
  amount: number
  date: string
  description?: string
  canEdit: boolean
  canDelete: boolean
  // 創建者顯示名稱（僅群組收支記錄使用）
  creatorDisplayName?: string
}

// 記錄查詢參數
export interface RecordQueryParams {
  groupId: string
  startDate: Date
  endDate: Date
  userId?: string
  limit?: number
}

// 記錄統計資料
export interface RecordSummary {
  totalIncome: number
  totalExpense: number
  recordCount: number
  period: {
    startDate: Date
    endDate: Date
  }
} 