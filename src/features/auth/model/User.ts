import { FieldValue, Timestamp } from "firebase/firestore"

export interface UserModel {
  uid: string
  displayName: string
  email: string
  birthday?: Date
  joinedGroupIds: string[]
  // Timestamp 用於讀取資料庫，FieldValue 用於寫入資料庫
  createdAt: Timestamp | FieldValue
}