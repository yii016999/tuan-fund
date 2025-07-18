import { UI } from '@/constants/config'
import { COLLECTIONS, COLUMNS, DOCUMENTS, QUERIES } from '@/constants/firestorePaths'
import { TRANSACTION } from '@/constants/string'
import { PREPAYMENT_START_TYPES, RECORD_STATUSES, RECORD_TRANSACTION_TYPES } from '@/constants/types'
import { getDocOrThrow } from '@/utils/collectionErrorMapping'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, WhereFilterOp } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { MemberPaymentRecord } from '../../records/model/Record'
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
      validateCreateTransactionInput(data)
      await this.validateGroupExists(groupId)
      
      // 1. 創建群組記錄，應該返回正確的 transactionId
      const transactionId = await this.createGroupTransaction(groupId, userId, data)

      // 2. 創建個人記錄，應該傳遞正確的 transactionId
      if (data.type === RECORD_TRANSACTION_TYPES.INCOME) {
        await MemberPaymentService.createMemberPayment(groupId, userId, data, transactionId)
      }

      return transactionId
    } catch (error) {
      return handleServiceError(error, TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION, 'CREATE_TRANSACTION_FAILED')
    }
  }

  // 創建群組收支記錄，支援預繳描述
  private static async createGroupTransaction(groupId: string, userId: string, data: CreateTransactionInput): Promise<string> {
    try {
      let transactionData = { ...data };
      
      // 為預繳收入記錄添加預繳範圍描述
      if (data.type === RECORD_TRANSACTION_TYPES.INCOME && data.prepaymentStartOption) {
        const memberMonthlyAmount = await TransactionService.getMemberMonthlyAmount(groupId, userId);
        
        const { startMonth, endMonth } = PrepaymentService.calculatePrepaymentRange(
          data, 
          data.amount, 
          0,
          memberMonthlyAmount,
          data.prepaymentStartOption,
          data.customStartMonth
        );
        
        transactionData = {
          ...data,
          description: `預繳 ${startMonth}-${endMonth}`
        };
      }

      const cleanData: CreateTransactionInput = {
        title: transactionData.title,
        amount: transactionData.amount,
        date: transactionData.date,
        type: transactionData.type,
        ...(transactionData.description && { description: transactionData.description }),
      };

      const finalTransactionData = {
        ...cleanData,
        groupId,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(
        collection(db, this.getCollectionPath(groupId)),
        finalTransactionData
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
      return false
    }
  }

  // 計算預繳月份數
  static calculatePrepaymentMonths(
    amount: number,
    currentMonthTotal: number,
    groupMonthlyAmount: number = UI.DEFAULT_GROUP_MONTHLY_AMOUNT
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

  // 取得群組月繳金額
  static async getGroupMonthlyAmount(groupId: string): Promise<number> {
    try {
      const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
      if (groupDoc.exists()) {
        return groupDoc.data().monthlyAmount || UI.DEFAULT_GROUP_MONTHLY_AMOUNT;
      }
      return UI.DEFAULT_GROUP_MONTHLY_AMOUNT;
    } catch (error) {
      console.error('Error fetching group monthly amount:', error);
      return UI.DEFAULT_GROUP_MONTHLY_AMOUNT;
    }
  }

  // 取得個人月繳金額（考慮客製化金額）
  static async getMemberMonthlyAmount(groupId: string, userId: string): Promise<number> {
    try {
      const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const memberCustomAmounts = groupData.memberCustomAmounts || {};
        const defaultMonthlyAmount = groupData.monthlyAmount || UI.DEFAULT_GROUP_MONTHLY_AMOUNT;
        
        return memberCustomAmounts[userId] || defaultMonthlyAmount;
      }
      return UI.DEFAULT_GROUP_MONTHLY_AMOUNT;
    } catch (error) {
      console.error('Error fetching member monthly amount:', error);
      return UI.DEFAULT_GROUP_MONTHLY_AMOUNT;
    }
  }
}

// 成員繳費服務類
export class MemberPaymentService {
  private static getMemberPaymentsPath(groupId: string) {
    return `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`
  }

  // 創建個人繳費記錄
  static async createMemberPayment(groupId: string, userId: string, data: CreateTransactionInput, transactionId?: string): Promise<void> {
    
    try {
      const billingMonth = data.date.substring(0, 7); // YYYY-MM 格式

      // 查詢當月已繳費總金額
      const currentMonthTotal = await this.getCurrentMonthPaymentTotal(groupId, userId, billingMonth);

      // 查詢個人月繳金額（考慮客製化金額）
      const memberMonthlyAmount = await this.getMemberMonthlyAmount(groupId, userId);

      // 計算新的累計金額
      const newTotal = currentMonthTotal + data.amount;

      // 判斷繳費狀態
      const status = newTotal >= memberMonthlyAmount ? RECORD_STATUSES.PAID : RECORD_STATUSES.PENDING;

      // 判斷是否為預繳
      if (data.prepaymentStartOption && newTotal > memberMonthlyAmount) {
        await PrepaymentService.handlePrepayment(groupId, userId, data, currentMonthTotal, memberMonthlyAmount, transactionId);
      } else {
        await this.createSimplePayment(groupId, userId, data, billingMonth, status, transactionId);
      }

      // 如果新增後達到繳費標準，更新當月所有記錄的狀態
      if (status === RECORD_STATUSES.PAID) {
        await this.updateMonthlyPaymentStatus(groupId, userId, billingMonth, RECORD_STATUSES.PAID);
      }
    } catch (error) {
      console.error('Error creating member payment:', error)
      throw new TransactionError(
        TRANSACTION.ERROR_CREATING_PAYMENT_RECORD,
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
    status: string,
    transactionId?: string
  ): Promise<void> {
    try {
      const memberPaymentData = {
        memberId: userId,
        groupId: groupId,
        amount: data.amount,
        paymentDate: data.date,
        billingMonth: billingMonth,
        title: data.title, // 單純顯示標題
        // 移除 description: data.title，一般記錄不需要 description
        status: status,
        transactionId: transactionId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // 只有在有值時才加入 userNote
        ...(data.description && { userNote: data.description }),
      }

      const docRef = await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        memberPaymentData
      )
    } catch (error) {
      console.error('Error creating simple payment:', error)
      throw new TransactionError(
        TRANSACTION.ERROR_CREATING_PAYMENT_RECORD,
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

  // 取得個人月繳金額，而不是群組預設金額
  private static async getMemberMonthlyAmount(groupId: string, userId: string): Promise<number> {
    try {
      const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const memberCustomAmounts = groupData.memberCustomAmounts || {};
        const defaultMonthlyAmount = groupData.monthlyAmount || 0;
        
        // 優先使用客製化金額，否則使用群組預設金額
        return memberCustomAmounts[userId] || defaultMonthlyAmount;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching member monthly amount:', error);
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

  // 刪除個人繳費記錄
  static async deleteMemberPayment(id: string, groupId: string): Promise<void> {
    try {
      // 先獲取要刪除的記錄資料
      const paymentDoc = await getDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`, id))

      if (!paymentDoc.exists()) {
        throw new Error('繳費記錄不存在')
      }

      const paymentData = paymentDoc.data() as MemberPaymentRecord

      // 刪除 memberPayments 記錄
      await deleteDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`, id))

      // 同步刪除相關的群組交易記錄
      if (paymentData.transactionId) {
        try {
          await deleteDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, paymentData.transactionId))
        } catch (error) {
          console.error('Error deleting related transaction by ID:', error)
          await this.deleteTransactionByMatching(groupId, paymentData)
        }
      } else {
        await this.deleteTransactionByMatching(groupId, paymentData)
      }
    } catch (error) {
      console.error('Error deleting member payment:', error)
      throw error
    }
  }

  // 使用匹配邏輯刪除交易記錄
  private static async deleteTransactionByMatching(groupId: string, paymentData: MemberPaymentRecord): Promise<void> {
    try {
      // 檢查是否為預繳記錄 - 通過 transactionId 或金額匹配
      const isPrePayment = paymentData.transactionId || paymentData.amount > 0;

      // 查詢同日期同用戶的所有交易記錄
      const transactionsQuery = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.USER_ID, QUERIES.EQUALS as WhereFilterOp, paymentData.memberId),
        where(COLUMNS.DATE, QUERIES.EQUALS as WhereFilterOp, paymentData.paymentDate),
        where(COLUMNS.TYPE, QUERIES.EQUALS as WhereFilterOp, RECORD_TRANSACTION_TYPES.INCOME)
      )

      const transactionSnapshot = await getDocs(transactionsQuery)

      const deletePromises = transactionSnapshot.docs.map(doc => {
        const transactionData = doc.data()

        // 更寬鬆的匹配邏輯
        // 1. 金額相同
        // 2. 同一用戶同一天
        // 3. 都是收入記錄
        if (transactionData.amount === paymentData.amount) {
          return deleteDoc(doc.ref)
        }

        return Promise.resolve()
      })

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting transaction by matching:', error)
      throw error
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
    memberMonthlyAmount: number,
    transactionId?: string
  ): Promise<void> {
    
    try {
      const billingMonth = data.date.substring(0, 7);
      const currentMonthNeeded = Math.max(0, memberMonthlyAmount - currentMonthTotal);
      
      const { startMonth, endMonth } = this.calculatePrepaymentRange(
        data, 
        data.amount, 
        currentMonthNeeded,
        memberMonthlyAmount,
        data.prepaymentStartOption,
        data.customStartMonth
      );
      
      const description = `預繳 ${startMonth}-${endMonth}`;
      
      await this.createPaymentRecord(
        groupId,
        userId,
        {
          ...data,
          description: description,
        },
        billingMonth,
        RECORD_STATUSES.PAID,
        transactionId
      );
      
    } catch (error) {
      console.error('Error handling prepayment:', error);
      throw error;
    }
  }

  // 修正：計算預繳範圍，支援不同選項
  static calculatePrepaymentRange(
    data: CreateTransactionInput,
    totalAmount: number,
    currentMonthNeeded: number,
    memberMonthlyAmount: number,
    prepaymentStartOption?: string,
    customStartMonth?: string
  ): { startMonth: string; endMonth: string } {
    try {
      const billingMonth = data.date.substring(0, 7);
      const totalMonths = Math.floor(totalAmount / memberMonthlyAmount);
      
      let startDate: Date;
      const currentDate = new Date(billingMonth + '-01');
      
      switch (prepaymentStartOption) {
        case 'previousMonth':
          startDate = new Date(currentDate);
          startDate.setMonth(currentDate.getMonth() - 1);
          break;
        case 'currentMonth':
          startDate = new Date(currentDate);
          break;
        case 'customMonth':
          if (customStartMonth) {
            // 修正：直接解析 YYYYMM 格式
            const year = parseInt(customStartMonth.substring(0, 4));
            const month = parseInt(customStartMonth.substring(4, 6)) - 1; // 月份從0開始
            startDate = new Date(year, month, 1);
          } else {
            startDate = new Date(currentDate);
          }
          break;
        default:
          startDate = new Date(currentDate);
          break;
      }
      
      // 修正：正確計算結束月份
      const endDate = new Date(startDate);
      const endYear = startDate.getFullYear();
      const endMonth = startDate.getMonth() + totalMonths - 1;
      
      // 處理跨年情況
      if (endMonth >= 12) {
        endDate.setFullYear(endYear + Math.floor(endMonth / 12));
        endDate.setMonth(endMonth % 12);
      } else {
        endDate.setMonth(endMonth);
      }
      
      const startMonth = `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const endMonthStr = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}`;
      
      return { startMonth, endMonth: endMonthStr };
    } catch (error) {
      console.error('Error calculating prepayment range:', error);
      const billingMonth = data.date.substring(0, 7);
      return { startMonth: billingMonth.replace('-', ''), endMonth: billingMonth.replace('-', '') };
    }
  }

  // 創建繳費記錄，分開儲存 title 和 description
  private static async createPaymentRecord(
    groupId: string,
    userId: string,
    data: CreateTransactionInput,
    billingMonth: string,
    status: string,
    transactionId?: string
  ): Promise<void> {
    
    try {
      const paymentData = {
        memberId: userId,
        groupId: groupId,
        amount: data.amount,
        paymentDate: data.date,
        billingMonth: billingMonth,
        title: data.title,
        description: data.description,
        status: status,
        transactionId: transactionId, // 確認這裡有正確設置
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        paymentData
      );
      
    } catch (error) {
      console.error('Error creating payment record:', error)
      throw new TransactionError(
        TRANSACTION.ERROR_CREATING_PAYMENT_RECORD,
        'CREATE_PAYMENT_RECORD_FAILED',
        error
      )
    }
  }
}

// 保持向後兼容
export const AddService = TransactionService;