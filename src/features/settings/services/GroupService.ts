import { COLLECTIONS, COLUMNS } from '@/constants/firestorePaths'
import { ERROR_CODE, JOIN_GROUP, SETTINGS_NO_GROUP_SELECTED } from '@/constants/string'
import { GroupType, MEMBER_ROLES, MemberRole } from '@/constants/types'
import { User } from '@/features/auth/model/User'
import { GroupMember } from '@/features/members/model/Member'
import { MemberService } from '@/features/members/services/MemberService'
import { getDocOrThrow } from '@/utils/collectionErrorMapping'
import { collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import type { GroupSettings, MonthlyPaymentSettings } from '../model/Group'

const db = getFirestore()

export class GroupService {
  // 更新用戶文件
  private static async updateUserFields(userId: string, fields: Partial<User>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    await updateDoc(userRef, fields)
  }

  // 查詢所有 user 加入的群組
  static async getGroupsByUserId(userId: string): Promise<GroupSettings[]> {
    try {
      // 取得 user 文件（查無時自動 throw 'user/not-exist'）
      const userRef = doc(db, COLLECTIONS.USERS, userId) as DocumentReference<User>
      const userSnap = await getDocOrThrow<User>(userRef)
      const userData = userSnap.data() as User
      const joinedGroupIds: string[] = userData.joinedGroupIds || []

      if (joinedGroupIds.length === 0) {
        return []
      }

      // 批次取得群組資料
      const groupPromises = joinedGroupIds.map(async (groupId) => {
        try {
          const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
          const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
          const groupData = groupSnap.data() as GroupSettings

          // 組裝 group 回傳資料
          const memberCount = groupData.members?.length || 0
          const roles: Record<string, MemberRole> = groupData.roles || {}
          const isAdmin = roles[userId] === MEMBER_ROLES.ADMIN

          return {
            id: groupId,
            name: groupData.name,
            description: groupData.description,
            type: groupData.type,
            monthlyAmount: groupData.monthlyAmount,
            billingCycle: groupData.billingCycle,
            allowPrepay: groupData.allowPrepay,
            inviteCode: groupData.inviteCode,
            memberCount,
            isAdmin,
            createdAt: groupData.createdAt?.toDate ? groupData.createdAt.toDate() : groupData.createdAt,
          } as GroupSettings
        } catch {
          // 找不到該 group 時 return null（或你要直接 throw，也可以）
          return null
        }
      })

      const groups = await Promise.all(groupPromises)
      return groups.filter(group => group !== null) as GroupSettings[]
    } catch (error) {
      console.error('Error fetching groups by user ID:', error)
      throw error // 讓外層用 mapFirebaseError 統一處理
    }
  }

  // 取得某個群組名稱
  async getGroupName(groupId: string): Promise<string | undefined> {
    const ref = doc(db, COLLECTIONS.GROUPS, groupId)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as any).name : undefined
  }

  // 同步用戶的加入群組列表
  static async syncUserJoinedGroups(userId: string): Promise<void> {
    try {
      // 查詢用戶實際加入的群組
      const actualGroups = await this.getGroupsByUserId(userId)
      const actualGroupIds = actualGroups.map(g => g.id)

      // 更新用戶的 joinedGroupIds
      await this.updateUserFields(userId, {
        joinedGroupIds: actualGroupIds,
      })
    } catch (error) {
      console.error('Error syncing user joined groups:', error)
      throw error
    }
  }

  // 更新用戶活躍群組（同時同步加入群組列表）
  static async updateUserActiveGroup(userId: string, groupId: string) {
    try {
      // 更新活躍群組
      await this.updateUserFields(userId, {
        activeGroupId: groupId
      })

      // 同步加入群組列表
      await this.syncUserJoinedGroups(userId)
    } catch (error) {
      console.error('Error updating user active group:', error)
      throw error
    }
  }

  // 取得某群組的所有成員詳細資料
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
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
  }

  // 新增群組（包含完整的用戶關聯）
  static async createGroup(
    userId: string,
    name: string,
    type: GroupType,
    description?: string,
    monthlyPaymentSettings?: MonthlyPaymentSettings
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
        ...(monthlyPaymentSettings || {}),
        // 如果啟用客製化金額，初始化成員金額設定
        ...(monthlyPaymentSettings?.enableCustomAmount ? {
          memberCustomAmounts: {
            [userId]: monthlyPaymentSettings.monthlyAmount || 0
          }
        } : {})
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
  }

  // 生成邀請碼
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 更新群組財務設定
  static async updateGroupFinancialSettings(groupId: string, monthlyAmount: number, billingCycle: string, allowPrepay: boolean): Promise<void> {
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
  }

  // 通過邀請碼加入群組
  static async joinGroupByCode(userId: string, inviteCode: string): Promise<{ success: boolean }> {
    try {
      // 查詢符合邀請碼的群組（僅取第一筆）
      const q = query(
        collection(db, COLLECTIONS.GROUPS),
        where(COLUMNS.INVITE_CODE, '==', inviteCode.toUpperCase())
      )
      const snap = await getDocs(q)

      // 若無符合邀請碼的群組則回傳失敗
      if (snap.empty) return { success: false }

      const groupDoc = snap.docs[0]
      const targetGroup = groupDoc.data() as GroupSettings
      const groupId = groupDoc.id

      // 檢查使用者是否已經是群組成員
      if (targetGroup.members?.includes(userId)) {
        return { success: false }
      }

      // 更新群組資料（加入成員、設定角色與加入時間）
      await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), {
        members: [...(targetGroup.members || []), userId],
        roles: {
          ...targetGroup.roles,
          [userId]: MEMBER_ROLES.MEMBER,
        },
        memberJoinedAt: {
          ...targetGroup.memberJoinedAt,
          [userId]: serverTimestamp(),
        },
      })

      // 更新使用者資料（加入的群組 ID 與活躍群組 ID）
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const joinedGroupIds = userData.joinedGroupIds || []

        await updateDoc(userRef, {
          joinedGroupIds: [...joinedGroupIds, groupId],
          activeGroupId: groupId,
        })
      }

      // 加入成功
      return { success: true }

    } catch (error) {
      // 捕捉非預期錯誤，例如網路或 Firestore 存取問題
      console.error('Error joining group:', error)
      return { success: false }
    }
  }

  // 刪除群組（只有管理員可以）
  static async deleteGroup(groupId: string, adminUserId: string): Promise<void> {
    try {
      // 檢查管理員權限
      const adminRole = await MemberService.getCurrentUserRole(groupId, adminUserId)
      if (adminRole !== MEMBER_ROLES.ADMIN) {
        throw { code: ERROR_CODE.NO_PERMISSION_DELETE_GROUP, message: SETTINGS_NO_GROUP_SELECTED.NO_PERMISSION_DELETE_GROUP }
      }

      // 取得群組資料，不存在自動丟 group/not-exist
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data() as GroupSettings
      const members: string[] = groupData.members ?? []

      // 批次更新成員資料
      const updateMemberPromises = members.map(async (memberId) => {
        const userRef = doc(db, COLLECTIONS.USERS, memberId) as DocumentReference<User>
        const userSnap = await getDocOrThrow<User>(userRef) // 如果 user 文件沒了會丟錯誤
        const userData = userSnap.data() as User
        const joinedGroupIds = userData.joinedGroupIds ?? []
        const activeGroupId = userData.activeGroupId

        // 從 joinedGroupIds 中移除該群組
        const updatedJoinedGroupIds = joinedGroupIds.filter((id: string) => id !== groupId)

        // 如果 activeGroupId 是被刪除的群組，清空或切換到其他群組
        let newActiveGroupId = activeGroupId
        if (activeGroupId === groupId) {
          newActiveGroupId = updatedJoinedGroupIds.length > 0 ? updatedJoinedGroupIds[0] : undefined
        }

        await updateDoc(userRef, {
          joinedGroupIds: updatedJoinedGroupIds,
          activeGroupId: newActiveGroupId
        })
      })

      await Promise.all(updateMemberPromises)

      // TODO: 依需求刪除子集合（transactions, memberPayments 等）

      // 最後刪除群組本身
      await deleteDoc(groupRef)

    } catch (error) {
      console.error('Error deleting group:', error)
      throw error
    }
  }

  // 更新成員的客製化金額
  static async updateMemberCustomAmount(groupId: string, memberId: string, amount: number): Promise<void> {
    try {
      // 用泛型取得群組文件，查無會自動丟 'group/not-exist'
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data() as GroupSettings
      const memberCustomAmounts = groupData.memberCustomAmounts || {}

      await updateDoc(groupRef, {
        memberCustomAmounts: {
          ...memberCustomAmounts,
          [memberId]: amount
        }
      })
    } catch (error) {
      console.error('Error updating member custom amount:', error)
      throw error
    }
  }

  // 獲取群組詳細資訊（包含客製化金額設定）
  static async getGroupDetails(groupId: string): Promise<any> {
    try {
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data()
      return groupData
    } catch (error) {
      console.error('Error fetching group details:', error)
      throw error
    }
  }
}