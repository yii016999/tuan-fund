import { db } from '@/config/firebase'
import { COLLECTIONS } from '@/constants/firestorePaths'
import { COMMON, MEMBERS } from '@/constants/string'
import { MEMBER_ROLES, MemberRole, RECORD_STATUSES } from '@/constants/types'
import { MemberPaymentRecord } from '@/features/records/model/Record'
import { arrayRemove, collection, deleteField, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { MemberPaymentStatus, MemberStatistics, MemberWithDetails } from '../model/Member'

export class MemberService {
  // 獲取群組成員列表
  static async getGroupMembers(groupId: string, currentUserId: string): Promise<MemberWithDetails[]> {
    try {
      // 獲取群組資料
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      const groupSnap = await getDoc(groupRef)

      if (!groupSnap.exists()) {
        throw new Error(MEMBERS.GROUP_ERROR)
      }

      const groupData = groupSnap.data()
      const memberIds: string[] = groupData.members ?? []
      const roles: Record<string, MemberRole> = groupData.roles ?? {}
      const memberJoinedAt: Record<string, any> = groupData.memberJoinedAt ?? {}

      // 批次獲取成員的基本資料和詳細資料
      const memberPromises = memberIds.map(async (uid) => {
        const userRef = doc(db, COLLECTIONS.USERS, uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          return null
        }

        const userData = userSnap.data()

        // 組合基本成員資料
        const basicMember = {
          uid,
          displayName: userData.displayName || '',
          email: userData.email || '',
          avatarUrl: userData.avatarUrl,
          role: roles[uid] || MEMBER_ROLES.MEMBER,
          joinedAt: memberJoinedAt[uid] || groupData.createdAt
        }

        // 獲取繳費狀態和統計資料
        const [paymentStatus, statistics] = await Promise.all([
          this.getMemberPaymentStatus(groupId, uid),
          this.getMemberStatistics(groupId, uid)
        ])

        // 計算權限
        const currentUserRole = await this.getCurrentUserRole(groupId, currentUserId)
        const permissions = {
          canEdit: currentUserRole === MEMBER_ROLES.ADMIN,
          canRemove: currentUserRole === MEMBER_ROLES.ADMIN && uid !== currentUserId
        }

        return {
          ...basicMember,
          paymentStatus,
          statistics,
          permissions
        } as MemberWithDetails
      })

      const members = await Promise.all(memberPromises)
      return members.filter(member => member !== null) as MemberWithDetails[]
    } catch (error) {
      console.error('Error fetching group members:', error)
      throw error
    }
  }

  // 獲取成員繳費狀態
  static async getMemberPaymentStatus(groupId: string, memberId: string): Promise<MemberPaymentStatus> {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

      // 查詢該成員的繳費記錄
      const paymentsQuery = query(
        collection(db, `groups/${groupId}/memberPayments`),
        where('memberId', '==', memberId),
        orderBy('paymentDate', 'desc')
      )

      const paymentsSnap = await getDocs(paymentsQuery)
      const payments = paymentsSnap.docs.map(doc => doc.data() as MemberPaymentRecord)

      // 計算當月繳費狀態
      const currentMonthPayments = payments.filter(p => p.billingMonth === currentMonth)
      const currentMonthPaid = currentMonthPayments.length > 0
      const currentMonthAmount = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)

      // 最近一次繳費日期
      const latestPaymentDate = payments.length > 0 ? payments[0].paymentDate : undefined

      // 取得今日日期
      const today = new Date()

      return {
        currentMonthPaid,
        currentMonthAmount,
        latestPaymentDate,
        nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0],
      }
    } catch (error) {
      console.error('Error fetching member payment status:', error)
      throw error
    }
  }

  // 計算成員統計資料
  static async getMemberStatistics(groupId: string, memberId: string): Promise<MemberStatistics> {
    try {
      // 查詢該成員的所有繳費記錄
      const paymentsQuery = query(
        collection(db, `groups/${groupId}/memberPayments`),
        where('memberId', '==', memberId),
        orderBy('paymentDate', 'desc')
      )

      const paymentsSnap = await getDocs(paymentsQuery)
      const payments = paymentsSnap.docs.map(doc => doc.data() as MemberPaymentRecord)

      // 計算統計資料
      const totalPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
      const totalPaymentCount = payments.length
      const averagePaymentAmount = totalPaymentCount > 0 ? totalPaidAmount / totalPaymentCount : 0

      // 計算按時繳費率
      const onTimePayments = payments.filter(p => p.status === RECORD_STATUSES.PAID).length
      const onTimePaymentRate = totalPaymentCount > 0 ? onTimePayments / totalPaymentCount : 0

      // 計算成員時長
      const memberSince = this.calculateMemberSince(new Date())

      return {
        totalPaidAmount,
        totalPaymentCount,
        onTimePaymentRate,
        averagePaymentAmount,
        memberSince
      }
    } catch (error) {
      console.error('Error calculating member statistics:', error)
      throw error
    }
  }

  // 獲取單個成員詳細資料
  static async getMemberWithDetails(groupId: string, memberId: string, currentUserId: string): Promise<MemberWithDetails> {
    try {
      // 獲取基本成員資料
      const members = await this.getGroupMembers(groupId, currentUserId)
      const member = members.find(m => m.uid === memberId)

      if (!member) {
        throw new Error(MEMBERS.MEMBER_ERROR)
      }

      // 獲取繳費狀態和統計資料
      const [paymentStatus, statistics] = await Promise.all([
        this.getMemberPaymentStatus(groupId, memberId),
        this.getMemberStatistics(groupId, memberId)
      ])

      // 計算權限
      const currentUserRole = await this.getCurrentUserRole(groupId, currentUserId)
      const permissions = {
        canEdit: currentUserRole === MEMBER_ROLES.ADMIN,
        canRemove: currentUserRole === MEMBER_ROLES.ADMIN && memberId !== currentUserId
      }

      return {
        ...member,
        paymentStatus,
        statistics,
        permissions
      }
    } catch (error) {
      console.error('Error fetching member details:', error)
      throw error
    }
  }

  // 移除成員
  static async removeMember(groupId: string, memberId: string, currentUserId: string): Promise<void> {
    try {
      // 驗證權限
      const currentUserRole = await this.getCurrentUserRole(groupId, currentUserId)
      if (currentUserRole !== MEMBER_ROLES.ADMIN) {
        throw new Error('沒有權限移除成員')
      }

      if (memberId === currentUserId) {
        throw new Error('不能移除自己')
      }

      // 更新群組資料
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      await updateDoc(groupRef, {
        members: arrayRemove(memberId),
        [`roles.${memberId}`]: deleteField(),
        [`memberJoinedAt.${memberId}`]: deleteField()
      })

      // 更新用戶資料
      const userRef = doc(db, COLLECTIONS.USERS, memberId)
      await updateDoc(userRef, {
        joinedGroupIds: arrayRemove(groupId)
      })
    } catch (error) {
      console.error('Error removing member:', error)
      throw error
    }
  }

  // 獲取群組邀請碼
  static async getGroupInviteCode(groupId: string): Promise<string> {
    try {
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      const groupSnap = await getDoc(groupRef)

      if (!groupSnap.exists()) {
        throw new Error(MEMBERS.GROUP_ERROR)
      }

      const groupData = groupSnap.data()
      return groupData.inviteCode || ''
    } catch (error) {
      console.error('Error fetching invite code:', error)
      throw error
    }
  }

  // 獲取當前用戶角色
  static async getCurrentUserRole(groupId: string, userId: string): Promise<MemberRole> {
    try {
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      const groupSnap = await getDoc(groupRef)

      if (!groupSnap.exists()) {
        return MEMBER_ROLES.MEMBER
      }

      const groupData = groupSnap.data()
      const roles: Record<string, MemberRole> = groupData.roles ?? {}
      return roles[userId] || MEMBER_ROLES.MEMBER
    } catch (error) {
      console.error('Error getting user role:', error)
      return MEMBER_ROLES.MEMBER
    }
  }

  // 私有方法：計算成員時長
  private static calculateMemberSince(joinedAt: Date): string {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinedAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays}${COMMON.DAYS}`  
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months}${COMMON.MONTHS}`
    } else {
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      return years > 0 ? `${years}${COMMON.YEARS}${months}${COMMON.MONTHS}` : `${months}${COMMON.MONTHS}`
    }
  }

  // 用戶退出群組
  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      // 檢查用戶是否在群組中
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      const groupSnap = await getDoc(groupRef)

      if (!groupSnap.exists()) {
        throw new Error('群組不存在')
      }

      const groupData = groupSnap.data()
      const members: string[] = groupData.members ?? []
      const roles: Record<string, MemberRole> = groupData.roles ?? {}

      if (!members.includes(userId)) {
        throw new Error('您不在此群組中')
      }

      // 檢查是否為管理員且群組中還有其他成員
      const isAdmin = roles[userId] === MEMBER_ROLES.ADMIN
      const otherMembers = members.filter(id => id !== userId)
      
      if (isAdmin && otherMembers.length > 0) {
        throw new Error('身為管理員，您無法退出群組。請先將管理員權限轉移給其他成員，或刪除群組。')
      }

      // 如果是最後一個成員，刪除整個群組
      if (members.length === 1) {
        // TODO: 可能需要刪除群組相關的所有資料
        // 這裡先簡單處理，實際可能需要更複雜的清理邏輯
        await updateDoc(groupRef, {
          members: arrayRemove(userId),
          [`roles.${userId}`]: deleteField(),
          [`memberJoinedAt.${userId}`]: deleteField()
        })
      } else {
        // 從群組中移除用戶
        await updateDoc(groupRef, {
          members: arrayRemove(userId),
          [`roles.${userId}`]: deleteField(),
          [`memberJoinedAt.${userId}`]: deleteField()
        })
      }

      // 更新用戶的joinedGroupIds
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        joinedGroupIds: arrayRemove(groupId)
      })

    } catch (error) {
      console.error('Error leaving group:', error)
      throw error
    }
  }
}
