import { COMMON, TRANSACTION } from '@/constants/string'
import { RECORD_STATUSES, RECORD_TRANSACTION_TYPES } from '@/constants/types'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { CreateTransactionInput } from '../model/Transaction'

export class AddService {
  private static getCollectionPath(groupId: string) {
    return `groups/${groupId}/transactions`
  }

  private static getMemberPaymentsPath(groupId: string) {
    return `groups/${groupId}/memberPayments`
  }

  static async create(groupId: string, userId: string, data: CreateTransactionInput): Promise<string> {
    try {
      // 創建群組收支記錄
      const transactionId = await this.createGroupTransaction(groupId, userId, data)

      // 如果是收入，自動創建個人繳費記錄
      if (data.type === RECORD_TRANSACTION_TYPES.INCOME) {
        await this.createMemberPayment(groupId, userId, data)
      }

      return transactionId
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw new Error(TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION)
    }
  }

  // 創建群組收支記錄
  private static async createGroupTransaction(groupId: string, userId: string, data: CreateTransactionInput): Promise<string> {
    // 過濾掉 undefined 值
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
  }

  // 創建個人繳費記錄
  private static async createMemberPayment(groupId: string, userId: string, data: CreateTransactionInput): Promise<void> {
    const billingMonth = data.date.substring(0, 7); // YYYY-MM 格式
    
    // 1. 查詢當月已繳費總金額
    const currentMonthTotal = await this.getCurrentMonthPaymentTotal(groupId, userId, billingMonth);
    
    // 2. 查詢群組月繳金額
    const groupMonthlyAmount = await this.getGroupMonthlyAmount(groupId);
    
    // 3. 計算新的累計金額
    const newTotal = currentMonthTotal + data.amount;
    
    // 4. 判斷繳費狀態
    const status = newTotal >= groupMonthlyAmount ? RECORD_STATUSES.PAID : RECORD_STATUSES.PENDING;

    // 5. 如果是預繳且有溢出金額，處理預繳邏輯
    if (data.isPrepayment && newTotal > groupMonthlyAmount) {
      await this.handlePrepayment(groupId, userId, data, currentMonthTotal, groupMonthlyAmount);
    } else {
      // 正常繳費記錄
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
    }

    // 6. 如果新增後達到繳費標準，更新當月所有記錄的狀態
    if (status === RECORD_STATUSES.PAID) {
      await this.updateMonthlyPaymentStatus(groupId, userId, billingMonth, RECORD_STATUSES.PAID);
    }
  }

  // 處理預繳邏輯
  private static async handlePrepayment(
    groupId: string, 
    userId: string, 
    data: CreateTransactionInput,
    currentMonthTotal: number,
    groupMonthlyAmount: number
  ): Promise<void> {
    const billingMonth = data.date.substring(0, 7);
    let remainingAmount = data.amount;
    
    // 計算當月還需要繳費的金額
    const currentMonthNeeded = Math.max(0, groupMonthlyAmount - currentMonthTotal);
    
    // 先處理當月繳費
    if (currentMonthNeeded > 0) {
      const currentMonthPayment = Math.min(remainingAmount, currentMonthNeeded);
      
      await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        {
          memberId: userId,
          groupId: groupId,
          amount: currentMonthPayment,
          paymentDate: data.date,
          billingMonth: billingMonth,
          description: `${data.description || data.title} (當月繳費)`,
          status: RECORD_STATUSES.PAID,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      
      remainingAmount -= currentMonthPayment;
    }
    
    // 處理預繳月份
    let currentDate = new Date(data.date);
    currentDate.setMonth(currentDate.getMonth() + 1); // 從下個月開始預繳
    
    while (remainingAmount >= groupMonthlyAmount) {
      const prepayMonth = currentDate.toISOString().substring(0, 7);
      
      await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        {
          memberId: userId,
          groupId: groupId,
          amount: groupMonthlyAmount,
          paymentDate: data.date,
          billingMonth: prepayMonth,
          description: `${data.description || data.title} (預繳 ${prepayMonth})`,
          status: RECORD_STATUSES.PAID,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      
      remainingAmount -= groupMonthlyAmount;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // 如果還有剩餘金額，記錄到下個月
    if (remainingAmount > 0) {
      const nextMonth = currentDate.toISOString().substring(0, 7);
      
      await addDoc(
        collection(db, this.getMemberPaymentsPath(groupId)),
        {
          memberId: userId,
          groupId: groupId,
          amount: remainingAmount,
          paymentDate: data.date,
          billingMonth: nextMonth,
          description: `${data.description || data.title} (預繳 ${nextMonth})`,
          status: RECORD_STATUSES.PENDING,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    }
  }

  // 檢查群組是否允許預繳
  static async checkAllowPrepayment(groupId: string): Promise<boolean> {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        return groupDoc.data().allowPrepay || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking allow prepayment:', error);
      return false;
    }
  }

  // 計算預繳月份數
  static calculatePrepaymentMonths(amount: number, currentMonthTotal: number, groupMonthlyAmount: number): number {
    if (groupMonthlyAmount === 0) return 0;
    
    const currentMonthNeeded = Math.max(0, groupMonthlyAmount - currentMonthTotal);
    const excessAmount = amount - currentMonthNeeded;
    
    return Math.floor(excessAmount / groupMonthlyAmount);
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
      return 0;
    }
  }

  // 獲取群組月繳金額
  private static async getGroupMonthlyAmount(groupId: string): Promise<number> {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        return groupDoc.data().monthlyAmount || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching group monthly amount:', error);
      return 0;
    }
  }

  // 更新當月所有繳費記錄的狀態
  private static async updateMonthlyPaymentStatus(groupId: string, userId: string, billingMonth: string, status: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.getMemberPaymentsPath(groupId)),
        where('memberId', '==', userId),
        where('billingMonth', '==', billingMonth)
      );

      const snapshot = await getDocs(q);
      
      // 批量更新所有記錄的狀態
      const updatePromises = snapshot.docs.map(docSnapshot => 
        updateDoc(docSnapshot.ref, { status, updatedAt: serverTimestamp() })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating monthly payment status:', error);
    }
  }
}