import { BillingCycle, GroupRole, GroupType } from "@/constants/types"

// 整份資料，通常用在「群組詳細頁」、「API 回傳」等場景。
export interface GroupModel {
    id: string                             // Firestore document id
    name: string                           // 群組名稱
    description?: string                   // 群組介紹、備註
    type: GroupType                        // 群組類型，分為長期型和一次性
    members: string[]                      // 群組成員 userId 列表
    roles?: Record<string, GroupRole>      // 群組成員的權限角色，用來記錄各成員的權限角色
    createdBy: string                      // 發起人
    createdAt?: any                        // 建立時間（Timestamp）
    monthlyAmount?: number                 // 長期型：每月應繳
    billingCycle?: BillingCycle            // 長期型：繳費週期
    allowPrepay?: boolean                  // 是否可預繳
    latestPaidMap?: Record<string, string> // 各成員已繳到哪個月份（如 {'uid': '2025-06'}），用來記錄各成員的繳費狀態
}

// 簡單的資料，通常用在「群組列表」、「群組選擇器」等場景。
export interface GroupBrief {
    id: string
    name: string
    type: GroupType
}