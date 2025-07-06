import FullScreenLoader from '@/components/FullScreenLoader'
import NoGroupSelected from '@/components/NoGroupSelected'
import RefreshScrollView from '@/components/RefreshScrollView'
import { useAuthStore } from '@/store/useAuthStore'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { MembersList } from '../components/MembersList'
import { useMembersViewModel } from '../viewmodel/useMembersViewModel'

export function MembersScreen() {
  const { user, activeGroupId, joinedGroupIds } = useAuthStore()

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

  // 如果沒有加入群組
  if (joinedGroupIds.length === 0) {
    return <NoGroupSelected title="沒有加入群組" message="請先至「設定」建立或加入一個群組" />
  }

  // 如果沒有選擇活躍群組
  if (!activeGroupId) {
    return <NoGroupSelected />
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
          <Text className="text-white">重新載入</Text>
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
            群組成員 ({members.length})
          </Text>
          <TouchableOpacity
            onPress={refreshMembers}
            className="bg-gray-500 px-3 py-1 rounded-full"
            disabled={refreshing}
          >
            <Text className="text-white text-sm">
              {refreshing ? '更新中...' : '刷新'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 成員列表 */}
      {members.length === 0 ? (
        <RefreshScrollView
          onRefresh={refreshMembers}
        >
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-gray-500 text-center">
              目前沒有成員
            </Text>
          </View>
        </RefreshScrollView>
      ) : (
        <MembersList
          members={members}
          onRemoveMember={removeMember}
          canRemoveMember={canRemoveMember}
          isCurrentUser={isCurrentUser}
        />
      )}
    </View>
  )
}

// 添加 default export
export default MembersScreen