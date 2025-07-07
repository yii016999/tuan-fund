import { MemberRole } from "@/constants/types"
import { Timestamp } from "firebase/firestore"

// 群組成員資料
export interface GroupMember {
    uid: string              // 使用者 id
    displayName: string      // 使用者名稱
    email: string            // 使用者 email
    avatarUrl?: string       // 使用者頭像
    role?: MemberRole        // 使用者角色
    joinedAt: Timestamp      // 加入時間
}

// 成員繳費狀態
export interface MemberPaymentStatus {
    currentMonthPaid: boolean,        // 當月是否已繳費
    currentMonthAmount: number,       // 當月繳費金額
    latestPaymentDate?: string,       // 最近一次繳費日期
    nextDueDate?: string,             // 下次繳費日
}

// 成員統計資料
export interface MemberStatistics {
    totalPaidAmount: number,          // 累計繳費金額
    totalPaymentCount: number,        // 繳費次數
    onTimePaymentRate: number,        // 按時繳費率 (0-1)
    averagePaymentAmount: number,     // 平均繳費金額
    memberSince: string,              // 成為成員時長 (如 "3個月")
}

// 群組成員詳細資料
export interface MemberWithDetails extends GroupMember {
    paymentStatus: MemberPaymentStatus,
    statistics: MemberStatistics,
    permissions: {
        canEdit: boolean,    // 是否可編輯此成員
        canRemove: boolean,  // 是否可移除此成員
    }
}