import { MemberRole } from "@/constants/types"

export interface MemberModel {
    uid: string              // 使用者 id
    displayName: string      // 使用者名稱
    email: string            // 使用者 email
    avatarUrl?: string       // 使用者頭像
    role?: MemberRole        // 使用者角色
    joinedAt?: any           // 加入時間
}