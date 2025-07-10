import { db } from '@/config/firebase'
import { COLLECTIONS, COLUMNS, DOCUMENTS, GROUP_JOINED_AT_FIELD, GROUP_ROLE_FIELD, QUERIES } from '@/constants/firestorePaths'
import { COMMON, ERROR_CODE, MEMBERS } from '@/constants/string'
import { DAYS_PER_MONTH, DAYS_PER_YEAR, MS_PER_DAY } from '@/constants/time'
import { MEMBER_ROLES, MemberRole, RECORD_STATUSES } from '@/constants/types'
import { User } from '@/features/auth/model/User'
import { MemberPaymentRecord } from '@/features/records/model/Record'
import type { GroupSettings } from "@/features/settings/model/Group"
import { getDocOrThrow } from '@/utils/collectionErrorMapping'
import { arrayRemove, collection, deleteField, doc, DocumentReference, getDocs, orderBy, OrderByDirection, Query, query, Timestamp, updateDoc, where, WhereFilterOp } from 'firebase/firestore'
import { MemberPaymentStatus, MemberStatistics, MemberWithDetails } from '../model/Member'

export class MemberService {
  // 獲取群組成員列表
  static async getGroupMembers(groupId: string, currentUserId: string): Promise<MemberWithDetails[]> {
    try {
      // 獲取群組資料
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data() as GroupSettings
      const memberIds: string[] = groupData.members ?? []
      const roles: Record<string, MemberRole> = groupData.roles ?? {}
      const memberJoinedAt: Record<string, Timestamp> = groupData.memberJoinedAt ?? {}

      // 批次獲取成員的基本資料和詳細資料
      const memberPromises = memberIds.map(async (uid) => {
        const userRef = doc(db, COLLECTIONS.USERS, uid) as DocumentReference<User>
        const userSnap = await getDocOrThrow<User>(userRef)
        const userData = userSnap.data() as User

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

  // 建立成員繳費記錄查詢
  private static createMemberPaymentsQuery(groupId: string, memberId: string): Query {
    return query(
      collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
      where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, memberId),
      orderBy(COLUMNS.DATE, QUERIES.DESC as OrderByDirection)
    )
  }

  // 獲取成員繳費狀態
  static async getMemberPaymentStatus(groupId: string, memberId: string): Promise<MemberPaymentStatus> {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7)

      // 查詢該成員的繳費記錄
      const paymentsQuery = this.createMemberPaymentsQuery(groupId, memberId)

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
      const paymentsQuery = this.createMemberPaymentsQuery(groupId, memberId)

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
        throw { code: ERROR_CODE.MEMBER_NOT_EXIST, message: MEMBERS.MEMBER_NOT_EXIST }
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
        throw { code: ERROR_CODE.NO_PERMISSION_REMOVE_MEMBER, message: MEMBERS.NO_PERMISSION_REMOVE_MEMBER }
      }

      if (memberId === currentUserId) {
        throw { code: ERROR_CODE.CANNOT_REMOVE_SELF, message: MEMBERS.CANNOT_REMOVE_SELF }
      }

      // 更新群組資料
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      await updateDoc(groupRef, {
        members: arrayRemove(memberId),
        [GROUP_ROLE_FIELD(memberId)]: deleteField(),
        [GROUP_JOINED_AT_FIELD(memberId)]: deleteField()
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
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data() as GroupSettings
      return groupData.inviteCode || ''
    } catch (error) {
      console.error('Error fetching invite code:', error)
      throw error
    }
  }

  // 獲取當前用戶角色
  static async getCurrentUserRole(groupId: string, userId: string): Promise<MemberRole> {
    try {
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data() as GroupSettings
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
    const diffDays = Math.ceil(diffTime / MS_PER_DAY)

    if (diffDays < DAYS_PER_MONTH) {
      return `${diffDays}${COMMON.DAYS}`
    } else if (diffDays < DAYS_PER_YEAR) {
      const months = Math.floor(diffDays / DAYS_PER_MONTH)
      return `${months}${COMMON.MONTHS}`
    } else {
      const years = Math.floor(diffDays / DAYS_PER_YEAR)
      const months = Math.floor((diffDays % DAYS_PER_YEAR) / DAYS_PER_MONTH)
      return years > 0 ? `${years}${COMMON.YEARS}${months}${COMMON.MONTHS}` : `${months}${COMMON.MONTHS}`
    }
  }

  // 用戶退出群組
  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      // 檢查用戶是否在群組中
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId) as DocumentReference<GroupSettings>
      const groupSnap = await getDocOrThrow<GroupSettings>(groupRef)
      const groupData = groupSnap.data() as GroupSettings
      const members: string[] = groupData.members ?? []
      const roles: Record<string, MemberRole> = groupData.roles ?? {}

      // 先檢查用戶是否在群組中
      if (!members.includes(userId)) {
        throw { code: ERROR_CODE.NOT_IN_GROUP, message: MEMBERS.NOT_IN_GROUP }
      }

      // 檢查是否為管理員且群組中還有其他成員
      const isAdmin = roles[userId] === MEMBER_ROLES.ADMIN
      const otherMembers = members.filter(id => id !== userId)

      // 如果用戶是管理員且群組中還有其他成員，則不能退出群組
      if (isAdmin && otherMembers.length > 0) {
        throw {
          code: ERROR_CODE.ADMIN_MUST_TRANSFER,
          message: MEMBERS.ADMIN_MUST_TRANSFER
        }
      }

      await updateDoc(groupRef, {
        members: arrayRemove(userId),
        [GROUP_ROLE_FIELD(userId)]: deleteField(),
        [GROUP_JOINED_AT_FIELD(userId)]: deleteField()
      })

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
