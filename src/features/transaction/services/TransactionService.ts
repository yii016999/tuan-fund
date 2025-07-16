import { COLLECTIONS, COLUMNS, DOCUMENTS, QUERIES } from '@/constants/firestorePaths'
import { COMMON, TRANSACTION } from '@/constants/string'
import { UI } from '@/constants/config'
import { PREPAYMENT_START_TYPES, RECORD_STATUSES, RECORD_TRANSACTION_TYPES } from '@/constants/types'
import { getDocOrThrow } from '@/utils/collectionErrorMapping'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, WhereFilterOp } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { CreateTransactionInput, TransactionError, validateCreateTransactionInput } from '../model/Transaction'

// 在文件頂部加入錯誤處理輔助函數
const handleServiceError = (error: unknown, fallbackMessage: string, fallbackCode: string): never => {
  if (error instanceof TransactionError) {
    throw error
  }

  console.error('Service error:', error)

  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    throw new TransactionError(
      (error as any).message || fallbackMessage,
      (error as any).code || fallbackCode,
      error
    )
  }

  throw new TransactionError(fallbackMessage, fallbackCode, error)
}

// 主要的交易服務類
export class TransactionService {
  private static getCollectionPath(groupId: string) {
    return `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`
  }

  static async create(groupId: string, userId: string, data: CreateTransactionInput): Promise<string> {
    try {
      // 驗證輸入資料
      validateCreateTransactionInput(data)

      // 檢查群組是否存在
      await this.validateGroupExists(groupId)

      // 創建群組收支記錄
      const transactionId = await this.createGroupTransaction(groupId, userId, data)

      // 如果是收入，自動創建個人繳費記錄
      if (data.type === RECORD_TRANSACTION_TYPES.INCOME) {
        await MemberPaymentService.createMemberPayment(groupId, userId, data)
      }

      return transactionId
    } catch (error) {
      return handleServiceError(error, TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION, 'CREATE_TRANSACTION_FAILED')
    }
  }

  // 創建群組收支記錄
  private static async createGroupTransaction(groupId: string, userId: string, data: CreateTransactionInput): Promise<string> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      ) as CreateTransactionInput

      const transactionData = {
        ...cleanData,
        groupId,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(
        collection(db, this.getCollectionPath(groupId)),
        transactionData
      )

      return docRef.id
    } catch (error) {
      console.error('Error creating group transaction:', error)
      throw new TransactionError(
        '創建群組交易失敗',
        'CREATE_GROUP_TRANSACTION_FAILED',
        error
      )
    }
  }

  // 驗證群組是否存在
  private static async validateGroupExists(groupId: string): Promise<void> {
    try {
      await getDocOrThrow(doc(db, COLLECTIONS.GROUPS, groupId))
    } catch (error) {
      handleServiceError(error, '群組不存在', 'GROUP_NOT_EXIST')
    }
  }

  // 檢查群組是否允許預繳
  static async checkAllowPrepayment(groupId: string): Promise<boolean> {
    try {
      const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId))
      if (groupDoc.exists()) {
        return groupDoc.data().allowPrepay || false
      }
      return false
    } catch (error) {
      console.error('Error checking allow prepayment:', error)
      // 不拋出錯誤，而是返回 false 作為安全的預設值
      return false
    }
  }

  // 計算預繳月份數 - 移除硬編碼的群組月繳金額
  static calculatePrepaymentMonths(
    amount: number, 
    currentMonthTotal: number, 
    groupMonthlyAmount: number = UI.DEFAULT_GROUP_MONTHLY_AMOUNT  // 使用常數作為預設值
  ): number {
    try {
      if (groupMonthlyAmount === 0) return 0

      const currentMonthNeeded = Math.max(0, groupMonthlyAmount - currentMonthTotal)
      const excessAmount = amount - currentMonthNeeded

      return Math.floor(excessAmount / groupMonthlyAmount)
    } catch (error) {
      console.error('Error calculating prepayment months:', error)
      return 0
    }
  }
}

// 成員繳費服務類
export class MemberPaymentService {
  private static getMemberPaymentsPath(groupId: string) {
    return `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`
  }

  // 創建個人繳費記錄
  static async createMemberPayment(groupId: string, userId: string, data: CreateTransactionInput): Promise<void> {
    try {
      const billingMonth = data.date.substring(0, 7); // YYYY-MM 格式

      // 查詢當月已繳費總金額
      const currentMonthTotal = await this.getCurrentMonthPaymentTotal(groupId, userId, billingMonth);

      // 查詢群組月繳金額
      const groupMonthlyAmount = await this.getGroupMonthlyAmount(groupId);

      // 計算新的累計金額
      const newTotal = currentMonthTotal + data.amount;

      // 判斷繳費狀態
      const status = newTotal >= groupMonthlyAmount ? RECORD_STATUSES.PAID : RECORD_STATUSES.PENDING;

      // 如果是預繳且有溢出金額，處理預繳邏輯
      if (data.isPrepayment && newTotal > groupMonthlyAmount) {
        await PrepaymentService.handlePrepayment(groupId, userId, data, currentMonthTotal, groupMonthlyAmount);
      } else {
        // 正常繳費記錄
        await this.createSimplePayment(groupId, userId, data, billingMonth, status);
      }

      // 如果新增後達到繳費標準，更新當月所有記錄的狀態
      if (status === RECORD_STATUSES.PAID) {
        await this.updateMonthlyPaymentStatus(groupId, userId, billingMonth, RECORD_STATUSES.PAID);
      }
    } catch (error) {
      console.error('Error creating member payment:', error)
      throw new TransactionError(
        '創建成員繳費記錄失敗',
        'CREATE_MEMBER_PAYMENT_FAILED',
        error
      )
    }
  }

  // 創建簡單繳費記錄
  private static async createSimplePayment(
    groupId: string,
    userId: string,
    data: CreateTransactionInput,
    billingMonth: string,
    status: string
  ): Promise<void> {
    try {
      const memberPaymentData = {
        memberId: userId,
        groupId: groupId,
        amount: data.amount,
        paymentDate: data.date,
        billingMonth: billingMonth,
        description: data.description || `${TRANSACTION.PAYMENT_DESCRIPTION} ${COMMON.DASH} ${data.title}`,
        status: status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        memberPaymentData
      )
    } catch (error) {
      console.error('Error creating simple payment:', error)
      throw new TransactionError(
        '創建簡單繳費記錄失敗',
        'CREATE_SIMPLE_PAYMENT_FAILED',
        error
      )
    }
  }

  // 獲取當月已繳費總金額
  private static async getCurrentMonthPaymentTotal(groupId: string, userId: string, billingMonth: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.getMemberPaymentsPath(groupId)),
        where('memberId', '==', userId),
        where('billingMonth', '==', billingMonth)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
    } catch (error) {
      console.error('Error fetching current month payment total:', error);
      // 返回 0 作為安全的預設值
      return 0;
    }
  }

  // 獲取群組月繳金額
  private static async getGroupMonthlyAmount(groupId: string): Promise<number> {
    try {
      const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
      if (groupDoc.exists()) {
        return groupDoc.data().monthlyAmount || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching group monthly amount:', error);
      // 返回 0 作為安全的預設值
      return 0;
    }
  }

  // 更新當月所有繳費記錄的狀態
  private static async updateMonthlyPaymentStatus(groupId: string, userId: string, billingMonth: string, status: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.getMemberPaymentsPath(groupId)),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.BILLING_MONTH, QUERIES.EQUALS as WhereFilterOp, billingMonth)
      );

      const snapshot = await getDocs(q);

      // 批量更新所有記錄的狀態
      const updatePromises = snapshot.docs.map(docSnapshot =>
        updateDoc(docSnapshot.ref, { status, updatedAt: serverTimestamp() })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating monthly payment status:', error);
      // 不拋出錯誤，避免影響主流程
    }
  }
}

// 預繳服務類
export class PrepaymentService {
  private static getMemberPaymentsPath(groupId: string) {
    return `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`
  }

  // 處理預繳邏輯
  static async handlePrepayment(
    groupId: string,
    userId: string,
    data: CreateTransactionInput,
    currentMonthTotal: number,
    groupMonthlyAmount: number
  ): Promise<void> {
    try {
      const billingMonth = data.date.substring(0, 7);
      let remainingAmount = data.amount;

      // 計算當月還需要繳費的金額
      const currentMonthNeeded = Math.max(0, groupMonthlyAmount - currentMonthTotal);

      // 先處理當月繳費
      if (currentMonthNeeded > 0) {
        const currentMonthPayment = Math.min(remainingAmount, currentMonthNeeded);
        await this.createPaymentRecord(
          groupId,
          userId,
          data,
          billingMonth,
          currentMonthPayment,
          `${data.description || data.title} ${COMMON.DASH} ${TRANSACTION.PAYMENT_THIS_MONTH}`,
          RECORD_STATUSES.PAID
        );
        remainingAmount -= currentMonthPayment;
      }

      // 計算預繳開始日期
      const startDate = this.calculatePrepaymentStartDate(data);

      // 處理預繳月份
      await this.processPrepaymentMonths(groupId, userId, data, startDate, remainingAmount, groupMonthlyAmount);
    } catch (error) {
      console.error('Error handling prepayment:', error)
      throw new TransactionError(
        '處理預繳邏輯失敗',
        'HANDLE_PREPAYMENT_FAILED',
        error
      )
    }
  }

  // 計算預繳開始日期
  private static calculatePrepaymentStartDate(data: CreateTransactionInput): Date {
    try {
      let startDate = new Date(data.date);

      switch (data.prepaymentStartType) {
        case PREPAYMENT_START_TYPES.PREVIOUS:
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case PREPAYMENT_START_TYPES.CURRENT:
          // 保持當月
          break;
        case PREPAYMENT_START_TYPES.CUSTOM:
          if (data.prepaymentCustomDate) {
            const year = parseInt(data.prepaymentCustomDate.substring(0, 4));
            const month = parseInt(data.prepaymentCustomDate.substring(4, 6));
            startDate = new Date(year, month - 1, 1);
          } else {
            // 如果沒有自訂日期，預設為下個月
            startDate.setMonth(startDate.getMonth() + 1);
          }
          break;
        default:
          // 預設：從下個月開始
          startDate.setMonth(startDate.getMonth() + 1);
          break;
      }

      return startDate;
    } catch (error) {
      console.error('Error calculating prepayment start date:', error)
      // 返回安全的預設值
      const defaultDate = new Date(data.date);
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      return defaultDate;
    }
  }

  // 處理預繳月份
  private static async processPrepaymentMonths(
    groupId: string,
    userId: string,
    data: CreateTransactionInput,
    startDate: Date,
    remainingAmount: number,
    groupMonthlyAmount: number
  ): Promise<void> {
    try {
      let currentDate = new Date(startDate);

      while (remainingAmount >= groupMonthlyAmount) {
        const prepayMonth = currentDate.toISOString().substring(0, 7);

        await this.createPaymentRecord(
          groupId,
          userId,
          data,
          prepayMonth,
          groupMonthlyAmount,
          `${data.description || data.title} ${COMMON.DASH} ${TRANSACTION.PREPAYMENT} ${prepayMonth}`,
          RECORD_STATUSES.PAID
        );

        remainingAmount -= groupMonthlyAmount;
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // 如果還有剩餘金額，記錄到下個月
      if (remainingAmount > 0) {
        const nextMonth = currentDate.toISOString().substring(0, 7);

        await this.createPaymentRecord(
          groupId,
          userId,
          data,
          nextMonth,
          remainingAmount,
          `${data.description || data.title} ${COMMON.DASH} ${TRANSACTION.PREPAYMENT} ${nextMonth}`,
          RECORD_STATUSES.PENDING
        );
      }
    } catch (error) {
      console.error('Error processing prepayment months:', error)
      throw new TransactionError(
        '處理預繳月份失敗',
        'PROCESS_PREPAYMENT_MONTHS_FAILED',
        error
      )
    }
  }

  // 創建繳費記錄
  private static async createPaymentRecord(
    groupId: string,
    userId: string,
    data: CreateTransactionInput,
    billingMonth: string,
    amount: number,
    description: string,
    status: string
  ): Promise<void> {
    try {
      await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        {
          memberId: userId,
          groupId: groupId,
          amount: amount,
          paymentDate: data.date,
          billingMonth: billingMonth,
          description: description,
          status: status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error('Error creating payment record:', error)
      throw new TransactionError(
        '創建繳費記錄失敗',
        'CREATE_PAYMENT_RECORD_FAILED',
        error
      )
    }
  }
}

// 保持向後兼容
export const AddService = TransactionService;