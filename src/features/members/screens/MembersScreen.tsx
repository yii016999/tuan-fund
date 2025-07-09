import FullScreenLoader from '@/components/FullScreenLoader'
import { ModalHeader } from '@/components/ModalHeader'
import NoGroupSelected from '@/components/NoGroupSelected'
import RefreshScrollView from '@/components/RefreshScrollView'
import { COMMON, MEMBERS } from '@/constants/string'
import { MEMBER_ROLES } from '@/constants/types'
import { GroupService } from '@/features/settings/services/GroupService'
import { useAuthStore } from '@/store/useAuthStore'
import React, { useEffect, useState } from 'react'
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
  const saveCustomAmount = async () => {
    if (!selectedMember || !currentGroupId) return

    try {
      const amount = parseInt(customAmount) || 0
      await GroupService.updateMemberCustomAmount(currentGroupId, selectedMember.uid, amount)

      // 重新載入群組詳細資訊
      const details = await GroupService.getGroupDetails(currentGroupId)
      setGroupDetails(details)

      setShowCustomAmountModal(false)
      setSelectedMember(null)
      setCustomAmount('')

      Alert.alert('成功', '成員金額已更新')
    } catch (error) {
      console.error('Error updating custom amount:', error)
      Alert.alert('錯誤', '更新失敗，請重試')
    }
  }

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

  // 檢查是否為管理員且群組啟用客製化金額
  const isAdmin = groupDetails?.roles?.[user.uid] === 'admin'
  const enableCustomAmount = groupDetails?.enableCustomAmount || false

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

      {/* 成員列表 */}
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
        <View className="flex-1">
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

                <View className="flex-row items-center space-x-2">
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
        </View>
      )}

      {/* 客製化金額設定 Modal */}
      <Modal visible={showCustomAmountModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/30 justify-center items-center">
          <View className="bg-white rounded-lg p-6 w-4/5 max-w-sm">
            <ModalHeader
              title="設定繳費金額"
              onClose={() => setShowCustomAmountModal(false)}
              showBorder={false}
            />

            <View className="mt-4">
              <Text className="text-gray-700 mb-2">
                {MEMBERS.MEMBER_INFO} {selectedMember?.displayName}
              </Text>
              <Text className="text-sm text-gray-600 mb-4">
                {MEMBERS.DEFAULT_AMOUNT_INFO} {COMMON.MONEY_SIGN} {groupDetails?.monthlyAmount || 0}
              </Text>

              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder={`${COMMON.INPUT} ${COMMON.MONEY_SIGN}`}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
              />

              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setShowCustomAmountModal(false)}
                  className="bg-gray-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white">{COMMON.CANCEL}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={saveCustomAmount}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white">{COMMON.CONFIRM}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// 添加 default export
export default MembersScreen