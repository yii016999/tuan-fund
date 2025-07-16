import { RecordTransactionType, PrepaymentStartType } from "@/constants/types"
import { VALIDATION } from '@/constants/config'

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
  // 創建者顯示名稱（用於記錄頁面顯示）
  creatorDisplayName?: string
}

// 創建交易時的輸入資料（僅業務邏輯欄位）
export interface CreateTransactionInput {
  type: RecordTransactionType
  amount: number
  date: string
  title: string
  description?: string
  isPrepayment?: boolean
  prepaymentStartType?: PrepaymentStartType
  prepaymentCustomDate?: string  // 自訂預繳開始日期 (YYYYMM 格式)
}

// 交易錯誤類型
export class TransactionError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'TransactionError'
  }
}

// 更新驗證函數
export const validateCreateTransactionInput = (input: CreateTransactionInput): void => {
  if (input.amount <= 0) {
    throw new TransactionError('金額必須大於0', 'INVALID_AMOUNT')
  }
  
  if (!input.title.trim()) {
    throw new TransactionError('項目標題不能為空', 'INVALID_TITLE')
  }
  
  if (input.title.length > VALIDATION.MAX_TITLE_LENGTH) {
    throw new TransactionError('項目標題過長', 'TITLE_TOO_LONG')
  }
  
  if (input.description && input.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    throw new TransactionError('備註過長', 'DESCRIPTION_TOO_LONG')
  }
  
  // 使用常數中的正則表達式
  if (!VALIDATION.DATE_PATTERN.test(input.date)) {
    throw new TransactionError('日期格式不正確', 'INVALID_DATE_FORMAT')
  }
  
  if (input.prepaymentCustomDate && !VALIDATION.PREPAYMENT_DATE_PATTERN.test(input.prepaymentCustomDate)) {
    throw new TransactionError('預繳自訂日期格式不正確', 'INVALID_PREPAYMENT_DATE_FORMAT')
  }
} 