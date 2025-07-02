import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { AddData } from '../model/Add'

export class AddService {
  private static getCollectionPath(groupId: string) {
    return `groups/${groupId}/transactions`
  }

  static async create(groupId: string, userId: string, data: AddData): Promise<string> {
    try {
      // 過濾掉 undefined 值
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      ) as AddData

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
      console.error('Error creating transaction:', error)
      throw new Error('新增交易失敗')
    }
  }
}