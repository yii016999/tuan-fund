import { FieldValue, Timestamp } from "firebase/firestore"

export interface User {
  uid: string
  displayName: string
  email: string
  birthday?: Date
  joinedGroupIds: string[]
  activeGroupId?: string
  createdAt: Timestamp | FieldValue // Timestamp 用於讀取資料庫，FieldValue 用於寫入資料庫
  avatarUrl?: string
}