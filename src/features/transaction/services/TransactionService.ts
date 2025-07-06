import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
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
      if (data.type === 'income') {
        await this.createMemberPayment(groupId, userId, data)
      }
      
      return transactionId
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw new Error('新增交易失敗')
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
    const memberPaymentData = {
      memberId: userId,
      groupId: groupId,
      amount: data.amount,
      paymentDate: data.date,
      billingMonth: data.date.substring(0, 7), // YYYY-MM 格式
      description: data.description || `繳費 - ${data.title}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    await addDoc(
      collection(db, this.getMemberPaymentsPath(groupId)),
      memberPaymentData
    )
  }
}