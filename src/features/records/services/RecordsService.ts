import { db } from '@/config/firebase'
import { COLLECTIONS, COLUMNS, DOCUMENTS, QUERIES } from '@/constants/firestorePaths'
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
        limit(1000)
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
        // 如果有 currentUserId，只查詢該用戶的記錄
        q = query(
          collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
          where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, currentUserId),
          where(COLUMNS.PAYMENT_DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, startDate.toISOString().split('T')[0]),
          where(COLUMNS.PAYMENT_DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDate.toISOString().split('T')[0]),
          orderBy(COLUMNS.PAYMENT_DATE, QUERIES.DESC as OrderByDirection),
          limit(1000)
        )
      } else {
        // 如果沒有 currentUserId，查詢所有記錄
        q = query(
          collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
          where(COLUMNS.PAYMENT_DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, startDate.toISOString().split('T')[0]),
          where(COLUMNS.PAYMENT_DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDate.toISOString().split('T')[0]),
          orderBy(COLUMNS.PAYMENT_DATE, QUERIES.DESC as OrderByDirection),
          limit(1000)
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

  // 刪除群組收支記錄
  static async deleteGroupTransaction(id: string, groupId: string): Promise<void> {
    try {
      // 刪除交易記錄
      await deleteDoc(doc(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`, id))
    } catch (error) {
      console.error('Error deleting group transaction:', error)
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
        for (const doc of transactionSnapshot.docs) {
          await deleteDoc(doc.ref)
        }
      }
    } catch (error) {
      console.error('Error deleting member payment:', error)
      throw error
    }
  }
}