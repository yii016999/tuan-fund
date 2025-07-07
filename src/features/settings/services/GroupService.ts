import { COLLECTIONS } from '@/constants/firestorePaths'
import { SETTINGS_GROUP_SWITCH } from '@/constants/string'
import { GroupType, MEMBER_ROLES, MemberRole } from '@/constants/types'
import { GroupMember } from '@/features/members/model/Member'
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { GroupSettings } from '../model/Group'

const db = getFirestore()

export const GroupService = {
  // 查詢所有 user 加入的群組
  async getGroupsByUserId(userId: string): Promise<GroupSettings[]> {
    const qs = await getDocs(collection(db, COLLECTIONS.GROUPS))
    const result: GroupSettings[] = []
    qs.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.members?.includes(userId)) {
        result.push({
          id: docSnap.id,
          name: data.name,
          type: data.type,
          description: data.description,
          members: data.members,
          createdBy: data.createdBy,
          inviteCode: data.inviteCode,
          memberJoinedAt: data.memberJoinedAt,
          monthlyAmount: data.monthlyAmount || 0,
          billingCycle: data.billingCycle || 'monthly',
          allowPrepay: data.allowPrepay || false,
          roles: data.roles,
          createdAt: data.createdAt,
          latestPaidMap: data.latestPaidMap
        })
      }
    })
    return result
  },

  // 取得某個群組名稱
  async getGroupName(groupId: string): Promise<string | undefined> {
    const ref = doc(db, COLLECTIONS.GROUPS, groupId)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as any).name : undefined
  },

  // 同步用戶的加入群組列表
  async syncUserJoinedGroups(userId: string): Promise<void> {
    try {
      // 查詢用戶實際加入的群組
      const actualGroups = await this.getGroupsByUserId(userId)
      const actualGroupIds = actualGroups.map(g => g.id)

      // 更新用戶的 joinedGroupIds
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        joinedGroupIds: actualGroupIds
      })
    } catch (error) {
      console.error('Error syncing user joined groups:', error)
      throw error
    }
  },

  // 更新用戶活躍群組（同時同步加入群組列表）
  async updateUserActiveGroup(userId: string, groupId: string) {
    try {
      // 更新活躍群組
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        activeGroupId: groupId
      })

      // 同步加入群組列表
      await this.syncUserJoinedGroups(userId)
    } catch (error) {
      console.error('Error updating user active group:', error)
      throw error
    }
  },

  // 取得某群組的所有成員詳細資料
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    // 查詢 group 拿 member id 與 role
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
    const groupSnap = await getDoc(groupRef)
    if (!groupSnap.exists()) return []

    const data = groupSnap.data()
    const memberIds: string[] = data.members ?? []
    const roles: Record<string, string> = data.roles ?? {}

    // 批次查詢所有 user 資料
    const memberDocs = await Promise.all(
      memberIds.map((uid) => getDoc(doc(db, COLLECTIONS.USERS, uid)))
    )

    // 組裝資料
    const members: GroupMember[] = memberDocs.map((snap) => {
      const user = snap.data()
      return {
        uid: snap.id,
        displayName: user?.displayName ?? "",
        email: user?.email ?? "",
        avatarUrl: user?.avatarUrl ?? "",
        role: (roles[snap.id] as MemberRole) ?? MEMBER_ROLES.MEMBER,
        joinedAt: data.createdAt,
      }
    })

    return members
  },

  // 新增群組（包含完整的用戶關聯）
  async createGroup(
    userId: string,
    name: string,
    type: GroupType,
    description?: string,
    monthlyPaymentSettings?: any
  ): Promise<string> {
    try {
      // 建立群組文檔
      const groupRef = doc(collection(db, COLLECTIONS.GROUPS))
      const groupId = groupRef.id

      // 生成邀請碼
      const inviteCode = this.generateInviteCode()

      const groupData = {
        name,
        type,
        description: description || '',
        members: [userId],  // 確保包含建立者
        roles: { [userId]: MEMBER_ROLES.ADMIN },  // 設定建立者為管理員
        createdBy: userId,
        createdAt: serverTimestamp(),
        inviteCode,
        memberJoinedAt: { [userId]: serverTimestamp() },  // 記錄加入時間
        ...(monthlyPaymentSettings || {})
      }

      await setDoc(groupRef, groupData)

      // 2. 更新用戶的 joinedGroupIds 和 activeGroupId
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const currentGroupIds = userData.joinedGroupIds || []

        await updateDoc(userRef, {
          joinedGroupIds: [...currentGroupIds, groupId],
          activeGroupId: groupId  // 設為活躍群組
        })
      }

      return groupId
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  },

  // 生成邀請碼
  generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // 更新群組財務設定
  async updateGroupFinancialSettings(
    groupId: string,
    monthlyAmount: number,
    billingCycle: string,
    allowPrepay: boolean
  ): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), {
        monthlyAmount,
        billingCycle,
        allowPrepay
      })
    } catch (error) {
      console.error('Error updating group financial settings:', error)
      throw error
    }
  },

  // 通過邀請碼加入群組
  async joinGroupByCode(userId: string, inviteCode: string): Promise<{ success: boolean; groupId?: string; groupName?: string; error?: string }> {
    try {
      // 查找具有該邀請碼的群組
      const groupsQuery = await getDocs(collection(db, COLLECTIONS.GROUPS))
      let targetGroup: any = null
      let targetGroupId: string = ''

      groupsQuery.forEach((doc) => {
        const data = doc.data()
        if (data.inviteCode === inviteCode.toUpperCase()) {
          targetGroup = data
          targetGroupId = doc.id
        }
      })

      if (!targetGroup) {
        return { success: false, error: SETTINGS_GROUP_SWITCH.ERROR_MESSAGE_JOIN_GROUP_INFO }
      }

      // 檢查用戶是否已經是群組成員
      const currentMembers = targetGroup.members || []
      if (currentMembers.includes(userId)) {
        return { success: false, error: SETTINGS_GROUP_SWITCH.ERROR_MESSAGE_JOIN_GROUP_ALREADY_JOINED }
      }

      // 將用戶添加到群組成員列表
      const updatedMembers = [...currentMembers, userId]
      const updatedRoles = { ...targetGroup.roles, [userId]: MEMBER_ROLES.MEMBER }
      const updatedMemberJoinedAt = {
        ...targetGroup.memberJoinedAt,
        [userId]: serverTimestamp()
      }

      await updateDoc(doc(db, COLLECTIONS.GROUPS, targetGroupId), {
        members: updatedMembers,
        roles: updatedRoles,
        memberJoinedAt: updatedMemberJoinedAt
      })

      // 更新用戶的群組列表和活躍群組
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const currentJoinedGroups = userData.joinedGroupIds || []

        await updateDoc(userRef, {
          joinedGroupIds: [...currentJoinedGroups, targetGroupId],
          activeGroupId: targetGroupId  // 設為活躍群組
        })
      }

      return {
        success: true,
        groupId: targetGroupId,
        groupName: targetGroup.name
      }
    } catch (error) {
      console.error('Error joining group:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error joining group'
      }
    }
  },
}