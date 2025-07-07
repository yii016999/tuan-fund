import { COMMON, MEMBERS } from '@/constants/string'
import { useAuthStore } from '@/store/useAuthStore'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { MemberWithDetails } from '../model/Member'
import { MemberService } from '../services/MemberService'

export interface UseMembersViewModelResult {
  // 狀態
  members: MemberWithDetails[]
  loading: boolean
  refreshing: boolean
  error: string | null
  inviteCode: string

  // 操作方法
  loadMembers: () => Promise<void>
  refreshMembers: () => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  copyInviteCode: () => void

  // 工具方法
  canRemoveMember: (memberId: string) => boolean
  isCurrentUser: (memberId: string) => boolean
}

export const useMembersViewModel = (groupId: string): UseMembersViewModelResult => {
  // 狀態管理
  const [members, setMembers] = useState<MemberWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState('')

  // 獲取當前用戶
  const { user } = useAuthStore()
  const currentUserId = user?.uid || ''

  // 載入成員列表
  const loadMembers = useCallback(async () => {
    try {
      setError(null)

      // 並行載入成員列表和邀請碼
      const [membersData, inviteCodeData] = await Promise.all([
        MemberService.getGroupMembers(groupId, currentUserId),
        MemberService.getGroupInviteCode(groupId)
      ])

      setMembers(membersData)
      setInviteCode(inviteCodeData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MEMBERS.ERROR_LOADING_MEMBERS
      setError(errorMessage)
      console.error('Error loading members:', err)
    } finally {
      setLoading(false)
    }
  }, [groupId, currentUserId])

  // 刷新成員列表
  const refreshMembers = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadMembers()
    } finally {
      setRefreshing(false)
    }
  }, [loadMembers])

  // 移除成員
  const removeMember = useCallback(async (memberId: string) => {
    try {
      // 找到要移除的成員
      const memberToRemove = members.find(m => m.uid === memberId)
      if (!memberToRemove) {
        throw new Error(MEMBERS.MEMBER_ERROR)
      }

      // 確認對話框
      Alert.alert(
        MEMBERS.CONFIRM_REMOVE_MEMBER,
        `${MEMBERS.CONFIRM_REMOVE_MEMBER_MESSAGE} ${memberToRemove.displayName} ${COMMON.QUESTION} ${COMMON.QUESTION_MARK}`,
        [
          { text: COMMON.CANCEL, style: 'cancel' },
          {
            text: COMMON.CONFIRM,
            style: 'destructive',
            onPress: async () => {
              try {
                setError(null)
                await MemberService.removeMember(groupId, memberId, currentUserId)

                // 更新本地狀態
                setMembers(prevMembers =>
                  prevMembers.filter(m => m.uid !== memberId)
                )

                Alert.alert(COMMON.SUCCESS, MEMBERS.SUCCESS_REMOVE_MEMBER)
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : MEMBERS.ERROR_REMOVING_MEMBER_INFO
                setError(errorMessage)
                Alert.alert(COMMON.ERROR, errorMessage)
              }
            }
          }
        ]
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MEMBERS.ERROR_REMOVING_MEMBER_INFO
      setError(errorMessage)
      Alert.alert(COMMON.ERROR, errorMessage)
    }
  }, [groupId, currentUserId, members])

  // 複製邀請碼
  const copyInviteCode = useCallback(() => {
    if (inviteCode) {
      // 這裡需要使用 Clipboard API
      // 由於是 React Native，可能需要額外的套件
      Alert.alert(
        MEMBERS.INVITE_CODE_TITLE,
        `${MEMBERS.INVITE_CODE_MESSAGE}${inviteCode}`,
        [
          { text: MEMBERS.INVITE_CODE_INFO, style: 'default' }
        ]
      )
    }
  }, [inviteCode])

  // 檢查是否可以移除成員
  const canRemoveMember = useCallback((memberId: string) => {
    const member = members.find(m => m.uid === memberId)
    return member?.permissions.canRemove || false
  }, [members])

  // 檢查是否為當前用戶
  const isCurrentUser = useCallback((memberId: string) => {
    return memberId === currentUserId
  }, [currentUserId])

  // 初始載入
  useEffect(() => {
    // 如果沒有 groupId 或 currentUserId，直接返回
    if (!groupId || !groupId.trim() || !currentUserId) {
      setLoading(false)
      return
    }

    loadMembers()

    // 清理函數
    return () => {
      setMembers([])
      setError(null)
      setInviteCode('')
    }
  }, [groupId, currentUserId, loadMembers])

  // 錯誤處理
  useEffect(() => {
    if (error) {
      // 可以在這裡添加錯誤追蹤或日誌
      console.error('Members ViewModel Error:', error)
    }
  }, [error])

  // 新增：使用 useFocusEffect 在頁面獲得焦點時重新載入數據
  useFocusEffect(
    useCallback(() => {
      // 當頁面獲得焦點時，重新載入成員數據
      if (groupId && groupId.trim() && currentUserId) {
        loadMembers()
      }
    }, [groupId, currentUserId, loadMembers])
  )

  return {
    // 狀態
    members,
    loading,
    refreshing,
    error,
    inviteCode,

    // 操作方法
    loadMembers,
    refreshMembers,
    removeMember,
    copyInviteCode,

    // 工具方法
    canRemoveMember,
    isCurrentUser
  }
}