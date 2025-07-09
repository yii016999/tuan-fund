import { RecordTransactionType } from "@/constants/types"

// 完整的交易記錄實體（包含系統欄位）
export interface Transaction {
  id?: string
  type: RecordTransactionType
  amount: number
  date: string
  title: string
  description?: string
  groupId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// 創建交易時的輸入資料（僅業務邏輯欄位）
export interface CreateTransactionInput {
  type: RecordTransactionType
  amount: number
  date: string
  title: string
  description?: string
  isPrepayment?: boolean
} 