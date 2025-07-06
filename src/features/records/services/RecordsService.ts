import { db } from '@/config/firebase'
import { Transaction } from '@/features/transaction/model/Transaction'
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore'
import { MemberPaymentRecord } from '../model/Record'

export class RecordsService {
  // 獲取群組收支記錄 (使用正確的路徑)
  static async getGroupTransactions(
    groupId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, `groups/${groupId}/transactions`),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0]),
        orderBy('date', 'desc'),
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
  static async getMemberPayments(
    groupId: string,
    startDate: Date,
    endDate: Date,
    currentUserId?: string
  ): Promise<MemberPaymentRecord[]> {
    try {
      let q;

      if (currentUserId) {
        // 如果有 currentUserId，只查詢該用戶的記錄
        q = query(
          collection(db, `groups/${groupId}/memberPayments`),
          where('memberId', '==', currentUserId),
          where('paymentDate', '>=', startDate.toISOString().split('T')[0]),
          where('paymentDate', '<=', endDate.toISOString().split('T')[0]),
          orderBy('paymentDate', 'desc'),
          limit(1000)
        )
      } else {
        // 如果沒有 currentUserId，查詢所有記錄
        q = query(
          collection(db, `groups/${groupId}/memberPayments`),
          where('paymentDate', '>=', startDate.toISOString().split('T')[0]),
          where('paymentDate', '<=', endDate.toISOString().split('T')[0]),
          orderBy('paymentDate', 'desc'),
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
      const docRef = doc(db, `groups/${groupId}/transactions`, id)
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
      await deleteDoc(doc(db, `groups/${groupId}/transactions`, id))
    } catch (error) {
      console.error('Error deleting group transaction:', error)
      throw error
    }
  }

  // 更新個人繳費記錄
  static async updateMemberPayment(id: string, data: Partial<MemberPaymentRecord>, groupId: string): Promise<void> {
    try {
      const docRef = doc(db, `groups/${groupId}/memberPayments`, id)
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
      await deleteDoc(doc(db, `groups/${groupId}/memberPayments`, id))
    } catch (error) {
      console.error('Error deleting member payment:', error)
      throw error
    }
  }
} 