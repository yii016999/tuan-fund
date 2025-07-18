import { db } from '@/config/firebase'
import { UI } from '@/constants/config'
import { COLLECTIONS, COLUMNS, DOCUMENTS, QUERIES } from '@/constants/firestorePaths'
import { TRANSACTION } from '@/constants/string'
import { RECORD_TRANSACTION_TYPES } from '@/constants/types'
import { Transaction } from '@/features/transaction/model/Transaction'
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, OrderByDirection, query, Timestamp, updateDoc, where, WhereFilterOp } from 'firebase/firestore'
import { MemberPaymentService } from '../../transaction/services/TransactionService'
import { MemberPaymentRecord } from '../model/Record'

export class RecordsService {
  // 獲取群組收支記錄（包含創建者資訊）
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
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]

      // 獲取創建者的 displayName
      const transactionsWithCreator = await Promise.all(
        transactions.map(async (transaction) => {
          const creatorDisplayName = await this.getUserDisplayName(transaction.userId)
          return {
            ...transaction,
            creatorDisplayName
          }
        })
      )

      return transactionsWithCreator
    } catch (error) {
      console.error('Error fetching group transactions:', error)
      throw error
    }
  }

  // 獲取用戶的 displayName
  private static async getUserDisplayName(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        return userData.displayName || userData.email || '未知用戶'
      }
      return '未知用戶'
    } catch (error) {
      console.error('Error fetching user displayName:', error)
      return '未知用戶'
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

  // 簡化：獲取預繳記錄範圍 - 移除拆分邏輯
  static async getPrepaymentRange(groupId: string, userId: string, paymentDate: string): Promise<{ startMonth: string; endMonth: string } | null> {
    try {
      // 查詢該日期的繳費記錄
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.PAYMENT_DATE, QUERIES.EQUALS as WhereFilterOp, paymentDate)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return null

      const paymentRecords = querySnapshot.docs.map(doc => doc.data() as MemberPaymentRecord)

      // 檢查是否有預繳關鍵字的記錄
      const prepaymentRecord = paymentRecords.find(record =>
        record.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD)
      )

      if (!prepaymentRecord) return null

      // 從 description 中解析預繳範圍
      const description = prepaymentRecord.description || ''
      const prepaymentMatch = description.match(/預繳(\d{6})-(\d{6})/)

      if (prepaymentMatch) {
        return {
          startMonth: prepaymentMatch[1],
          endMonth: prepaymentMatch[2]
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching prepayment range:', error)
      return null
    }
  }

  // 簡化：為群組收支記錄獲取預繳範圍
  static async getGroupTransactionPrepaymentRange(groupId: string, userId: string, paymentDate: string): Promise<{ startMonth: string; endMonth: string } | null> {
    try {
      // 查詢該用戶在該日期的繳費記錄
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.PAYMENT_DATE, QUERIES.EQUALS as WhereFilterOp, paymentDate)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return null

      const paymentRecords = querySnapshot.docs.map(doc => doc.data() as MemberPaymentRecord)

      // 檢查是否有預繳關鍵字的記錄
      const prepaymentRecord = paymentRecords.find(record =>
        record.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD)
      )

      if (!prepaymentRecord) return null

      // 從 description 中解析預繳範圍
      const description = prepaymentRecord.description || ''
      const prepaymentMatch = description.match(/預繳(\d{6})-(\d{6})/)

      if (prepaymentMatch) {
        return {
          startMonth: prepaymentMatch[1],
          endMonth: prepaymentMatch[2]
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching group transaction prepayment range:', error)
      return null
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

      const memberPaymentSnapshot = await getDocs(memberPaymentsQuery)
      
      // 只用 transactionId 匹配
      const deletePromises = memberPaymentSnapshot.docs.map(doc => {
        const paymentData = doc.data() as MemberPaymentRecord
        
        if (paymentData.transactionId === transactionData.id) {
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

  // 刪除群組交易記錄
  static async deleteGroupTransaction(id: string, groupId: string): Promise<void> {
    try {
      // 先獲取要刪除的交易記錄
      const transactionDoc = await getDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, id))
      
      if (!transactionDoc.exists()) {
        throw new Error('交易記錄不存在')
      }

      const transactionData = {
        id: id,
        ...transactionDoc.data()
      } as Transaction

      // 刪除交易記錄
      await deleteDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, id))

      // 如果是收入記錄，需要同步刪除相關的個人繳費記錄
      if (transactionData.type === RECORD_TRANSACTION_TYPES.INCOME) {
        await this.deleteRelatedMemberPayments(groupId, transactionData)
      }
    } catch (error) {
      console.error('Error deleting group transaction:', error)
      throw error
    }
  }

  // 刪除個人繳費記錄
  static async deleteMemberPayment(id: string, groupId: string): Promise<void> {
    try {
      // 直接調用 MemberPaymentService 的方法
      await MemberPaymentService.deleteMemberPayment(id, groupId)
    } catch (error) {
      console.error('Error deleting member payment:', error)
      throw error
    }
  }

  // 使用匹配邏輯刪除交易記錄
  private static async deleteTransactionByMatching(groupId: string, paymentData: MemberPaymentRecord): Promise<void> {
    try {
      const isPrePayment = paymentData.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD)

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

        if (isPrePayment) {
          // 預繳記錄：標題包含預繳關鍵字且金額相同
          if (transactionData.title?.includes(TRANSACTION.PREPAYMENT_KEYWORD) &&
            transactionData.amount === paymentData.amount) {
            return deleteDoc(doc.ref)
          }
        } else {
          // 一般記錄：金額相同且不是預繳記錄
          if (transactionData.amount === paymentData.amount &&
            !transactionData.title?.includes(TRANSACTION.PREPAYMENT_KEYWORD)) {
            return deleteDoc(doc.ref)
          }
        }
        return Promise.resolve()
      })

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting transaction by matching:', error)
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
}