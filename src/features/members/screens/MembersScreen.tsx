import FullScreenLoader from '@/components/FullScreenLoader'
import NoGroupSelected from '@/components/NoGroupSelected'
import RefreshScrollView from '@/components/RefreshScrollView'
import { COMMON, MEMBERS } from '@/constants/string'
import { MEMBER_ROLES } from '@/constants/types'
import { GroupService } from '@/features/settings/services/GroupService'
import { useAuthStore } from '@/store/useAuthStore'
import React, { useEffect, useState } from 'react'
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import CustomAmountModal from '../components/CustomAmountModal'
import { useMembersViewModel } from '../viewmodel/useMembersViewModel'

export function MembersScreen() {
  const { user, activeGroupId, joinedGroupIds } = useAuthStore()
  const [groupDetails, setGroupDetails] = useState<any>(null)
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [customAmount, setCustomAmount] = useState('')

  // 如果用戶未登入，直接返回空組件
  if (!user) {
    return null
  }

  // 獲取當前活躍群組
  const currentGroupId = activeGroupId || ''

  // 使用 ViewModel
  const {
    members,
    loading,
    refreshing,
    error,
    inviteCode,
    loadMembers,
    refreshMembers,
    removeMember,
    copyInviteCode,
    canRemoveMember,
    isCurrentUser
  } = useMembersViewModel(currentGroupId)

  // 載入群組詳細資訊
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (currentGroupId) {
        try {
          const details = await GroupService.getGroupDetails(currentGroupId)
          setGroupDetails(details)
        } catch (error) {
          console.error('Error loading group details:', error)
        }
      }
    }

    loadGroupDetails()
  }, [currentGroupId])

  // 處理設定客製化金額
  const handleSetCustomAmount = (member: any) => {
    setSelectedMember(member)
    const currentAmount = groupDetails?.memberCustomAmounts?.[member.uid] || groupDetails?.monthlyAmount || 0
    setCustomAmount(currentAmount.toString())
    setShowCustomAmountModal(true)
  }

  // 儲存客製化金額
  const saveCustomAmount = async (inputAmount?: string) => {
    if (!selectedMember || !currentGroupId) return

    try {
      // 使用傳入的參數或者 state 中的值
      const amountToSave = inputAmount || customAmount
      const amount = parseInt(amountToSave) || 0
      
      // 驗證金額範圍
      if (amount < 0 || amount > 999999) {
        Alert.alert(COMMON.ERROR, '金額必須在 0-999999 之間')
        return
      }

      await GroupService.updateMemberCustomAmount(currentGroupId, selectedMember.uid, amount)

      // 重新載入群組詳細資訊
      const details = await GroupService.getGroupDetails(currentGroupId)
      setGroupDetails(details)

      setShowCustomAmountModal(false)
      setSelectedMember(null)
      setCustomAmount('')

      Alert.alert(COMMON.SUCCESS, MEMBERS.AMOUNT_UPDATED_SUCCESS)
    } catch (error) {
      console.error('Error updating custom amount:', error)
      Alert.alert(COMMON.ERROR, MEMBERS.AMOUNT_UPDATE_FAILED)
    }
  }

  // 關閉 Modal
  const handleCloseModal = () => {
    setShowCustomAmountModal(false)
    setSelectedMember(null)
    setCustomAmount('')
  }

  // 檢查是否為管理員且群組啟用客製化金額
  const isAdmin = groupDetails?.roles?.[user.uid] === MEMBER_ROLES.ADMIN
  const enableCustomAmount = !!(groupDetails?.memberCustomAmounts) || false

  // 如果沒有選擇群組
  if (!activeGroupId) {
    return <NoGroupSelected joinedGroupIds={joinedGroupIds} />
  }

  // 載入中
  if (loading) {
    return <FullScreenLoader visible={loading} />
  }

  // 錯誤處理
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">
          {error}
        </Text>
        <TouchableOpacity
          onPress={loadMembers}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">{MEMBERS.REFRESH}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1">
      {/* 頁面標題與刷新按鈕 */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-gray-800">
            {MEMBERS.MEMBERS_COUNT} ({members.length})
          </Text>
          <TouchableOpacity
            onPress={refreshMembers}
            className="bg-gray-500 px-3 py-1 rounded-full"
            disabled={refreshing}
          >
            <Text className="text-white">{MEMBERS.REFRESH}</Text>
          </TouchableOpacity>
        </View>

        {/* 客製化金額提示 */}
        {enableCustomAmount && isAdmin && (
          <View className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
            <Text className="text-sm text-blue-800 font-medium mb-1">
              {MEMBERS.CUSTOM_AMOUNT_ENABLED}
            </Text>
            <Text className="text-xs text-blue-700">
              {MEMBERS.CUSTOM_AMOUNT_INFO}
            </Text>
          </View>
        )}
      </View>

      {/* 成員列表 - 只是加入 ScrollView */}
      {members.length === 0 ? (
        <RefreshScrollView
          onRefresh={refreshMembers}
        >
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-gray-500 text-center">
              {MEMBERS.NO_MEMBERS}
            </Text>
          </View>
        </RefreshScrollView>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {members.map((member) => (
            <View key={member.uid} className="p-4 border-b border-gray-100 bg-white">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{member.displayName}</Text>
                  <Text className="text-sm text-gray-600">{member.email}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {member.role === MEMBER_ROLES.ADMIN ? MEMBERS.ADMIN : MEMBERS.MEMBER}
                  </Text>

                  {/* 顯示客製化金額 */}
                  {enableCustomAmount && (
                    <Text className="text-xs text-blue-600 mt-1">
                      {MEMBERS.PAYMENT_AMOUNT_INFO} {COMMON.MONEY_SIGN} {groupDetails?.memberCustomAmounts?.[member.uid] || groupDetails?.monthlyAmount || 0}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center gap-2">
                  {/* 客製化金額設定按鈕 */}
                  {enableCustomAmount && isAdmin && (
                    <TouchableOpacity
                      onPress={() => handleSetCustomAmount(member)}
                      className="bg-blue-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs">{MEMBERS.SET_AMOUNT}</Text>
                    </TouchableOpacity>
                  )}

                  {/* 移除成員按鈕 */}
                  {canRemoveMember(member.uid) && (
                    <TouchableOpacity
                      onPress={() => removeMember(member.uid)}
                      className="bg-red-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs">{MEMBERS.REMOVE}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 客製化金額設定 Modal */}
      <CustomAmountModal
        visible={showCustomAmountModal}
        onClose={handleCloseModal}
        onConfirm={saveCustomAmount}
        memberName={selectedMember?.displayName || ''}
        defaultAmount={groupDetails?.monthlyAmount || 0}
        initialAmount={customAmount}
      />
    </View>
  )
}

export default MembersScreen