import { db } from '@/config/firebase'
import { COLLECTIONS, COLUMNS, DOCUMENTS, QUERIES } from '@/constants/firestorePaths'
import { UI } from '@/constants/config'
import { TRANSACTION, COMMON } from '@/constants/string'
import { RECORD_TRANSACTION_TYPES } from '@/constants/types'
import { Transaction } from '@/features/transaction/model/Transaction'
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, OrderByDirection, query, Timestamp, updateDoc, where, WhereFilterOp } from 'firebase/firestore'
import { MemberPaymentRecord } from '../model/Record'

export class RecordsService {
  // 獲取群組收支記錄
  static async getGroupTransactions(groupId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, startDate.toISOString().split('T')[0]),
        where(COLUMNS.DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDate.toISOString().split('T')[0]),
        orderBy(COLUMNS.DATE, QUERIES.DESC as OrderByDirection),
        limit(UI.RECORDS_QUERY_LIMIT)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]
    } catch (error) {
      console.error('Error fetching group transactions:', error)
      throw error
    }
  }

  // 獲取個人繳費記錄
  static async getMemberPayments(groupId: string, startDate: Date, endDate: Date, currentUserId?: string): Promise<MemberPaymentRecord[]> {
    try {
      let q;

      if (currentUserId) {
        q = query(
          collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
          where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, currentUserId),
          where(COLUMNS.PAYMENT_DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, startDate.toISOString().split('T')[0]),
          where(COLUMNS.PAYMENT_DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDate.toISOString().split('T')[0]),
          orderBy(COLUMNS.PAYMENT_DATE, QUERIES.DESC as OrderByDirection),
          limit(UI.RECORDS_QUERY_LIMIT)
        )
      } else {
        q = query(
          collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
          where(COLUMNS.PAYMENT_DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, startDate.toISOString().split('T')[0]),
          where(COLUMNS.PAYMENT_DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDate.toISOString().split('T')[0]),
          orderBy(COLUMNS.PAYMENT_DATE, QUERIES.DESC as OrderByDirection),
          limit(UI.RECORDS_QUERY_LIMIT)
        )
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemberPaymentRecord[]
    } catch (error) {
      console.error('Error fetching member payments:', error)
      throw error
    }
  }

  // 為群組收支記錄獲取預繳範圍
  static async getGroupTransactionPrepaymentRange(groupId: string, userId: string, paymentDate: string): Promise<{ startMonth: string; endMonth: string } | null> {
    try {
      const { PREPAYMENT } = UI
      
      // 查詢該用戶在該日期的所有預繳記錄
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.PAYMENT_DATE, QUERIES.EQUALS as WhereFilterOp, paymentDate),
        where('description', '>=', TRANSACTION.PREPAYMENT_KEYWORD),
        where('description', '<=', TRANSACTION.PREPAYMENT_KEYWORD + PREPAYMENT.FIRESTORE_RANGE_SUFFIX),
        orderBy('description'),
        orderBy(COLUMNS.BILLING_MONTH)
      )

      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) return null

      const prepaymentRecords = querySnapshot.docs.map(doc => doc.data() as MemberPaymentRecord)
      
      // 找出預繳記錄的起始和結束月份
      const billingMonths = prepaymentRecords
        .filter(record => record.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD))
        .map(record => record.billingMonth)
        .sort()

      if (billingMonths.length === 0) return null

      return {
        startMonth: billingMonths[0].replace(COMMON.DASH, ''),
        endMonth: billingMonths[billingMonths.length - 1].replace(COMMON.DASH, '')
      }
    } catch (error) {
      console.error('Error fetching group transaction prepayment range:', error)
      return null
    }
  }

  // 修正：刪除群組收支記錄（包含相關的個人繳費記錄）
  static async deleteGroupTransaction(id: string, groupId: string): Promise<void> {
    try {
      // 1. 先獲取要刪除的交易記錄
      const transactionDoc = await getDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, id))
      
      if (!transactionDoc.exists()) {
        throw new Error('交易記錄不存在')
      }

      const transactionData = transactionDoc.data() as Transaction

      // 2. 如果是收入記錄，需要刪除相關的個人繳費記錄
      if (transactionData.type === RECORD_TRANSACTION_TYPES.INCOME) {
        await this.deleteRelatedMemberPayments(groupId, transactionData)
      }

      // 3. 刪除群組交易記錄
      await deleteDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, id))
    } catch (error) {
      console.error('Error deleting group transaction:', error)
      throw error
    }
  }

  // 刪除相關的個人繳費記錄
  private static async deleteRelatedMemberPayments(groupId: string, transactionData: Transaction): Promise<void> {
    try {
      // 查找相關的個人繳費記錄
      const memberPaymentsQuery = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, transactionData.userId),
        where(COLUMNS.PAYMENT_DATE, QUERIES.EQUALS as WhereFilterOp, transactionData.date)
      )

      const memberPaymentsSnapshot = await getDocs(memberPaymentsQuery)

      // 刪除找到的個人繳費記錄
      const deletePromises = memberPaymentsSnapshot.docs.map(doc => {
        const paymentData = doc.data() as MemberPaymentRecord
        
        // 確認是相關的繳費記錄（可能是當月繳費或預繳）
        const isRelatedPayment = 
          paymentData.amount === transactionData.amount || // 金額相同
          paymentData.description?.includes(transactionData.title) || // 描述包含交易標題
          paymentData.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD) // 或是預繳記錄
        
        if (isRelatedPayment) {
          return deleteDoc(doc.ref)
        }
        return Promise.resolve()
      })

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting related member payments:', error)
      throw error
    }
  }

  // 更新群組收支記錄
  static async updateGroupTransaction(id: string, data: Partial<Transaction>, groupId: string): Promise<void> {
    try {
      const docRef = doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating group transaction:', error)
      throw error
    }
  }

  // 更新個人繳費記錄
  static async updateMemberPayment(id: string, data: Partial<MemberPaymentRecord>, groupId: string): Promise<void> {
    try {
      const docRef = doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating member payment:', error)
      throw error
    }
  }

  // 刪除個人繳費記錄
  static async deleteMemberPayment(id: string, groupId: string): Promise<void> {
    try {
      // 先獲取要刪除的記錄資料
      const paymentDoc = await getDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`, id))

      if (paymentDoc.exists()) {
        const paymentData = paymentDoc.data() as MemberPaymentRecord

        // 刪除 memberPayments 記錄
        await deleteDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`, id))

        // 查找並刪除對應的 transactions 記錄
        const transactionsQuery = query(
          collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
          where(COLUMNS.USER_ID, QUERIES.EQUALS as WhereFilterOp, paymentData.memberId),
          where(COLUMNS.DATE, QUERIES.EQUALS as WhereFilterOp, paymentData.paymentDate),
          where(COLUMNS.AMOUNT, QUERIES.EQUALS as WhereFilterOp, paymentData.amount)
        )

        const transactionSnapshot = await getDocs(transactionsQuery)

        // 刪除找到的交易記錄
        const deletePromises = transactionSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }
    } catch (error) {
      console.error('Error deleting member payment:', error)
      throw error
    }
  }

  // 獲取預繳記錄範圍 - 移除硬編碼
  static async getPrepaymentRange(groupId: string, userId: string, paymentDate: string): Promise<{ startMonth: string; endMonth: string } | null> {
    try {
      const { PREPAYMENT } = UI
      
      // 查詢同一天的所有預繳記錄
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.PAYMENT_DATE, QUERIES.EQUALS as WhereFilterOp, paymentDate),
        where('description', '>=', TRANSACTION.PREPAYMENT_KEYWORD),
        where('description', '<=', TRANSACTION.PREPAYMENT_KEYWORD + PREPAYMENT.FIRESTORE_RANGE_SUFFIX),
        orderBy('description'),
        orderBy(COLUMNS.BILLING_MONTH)
      )

      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) return null

      const prepaymentRecords = querySnapshot.docs.map(doc => doc.data() as MemberPaymentRecord)
      
      // 找出預繳記錄的起始和結束月份
      const billingMonths = prepaymentRecords
        .filter(record => record.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD))
        .map(record => record.billingMonth)
        .sort()

      if (billingMonths.length === 0) return null

      return {
        startMonth: billingMonths[0].replace(COMMON.DASH, ''),
        endMonth: billingMonths[billingMonths.length - 1].replace(COMMON.DASH, '')
      }
    } catch (error) {
      console.error('Error fetching prepayment range:', error)
      return null
    }
  }
}