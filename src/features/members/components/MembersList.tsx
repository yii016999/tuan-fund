import { MEMBER_ROLES } from '@/constants/types'
import React from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { MemberWithDetails } from '../model/Member'

interface MembersListProps {
  members: MemberWithDetails[]
  onRemoveMember: (memberId: string) => Promise<void>
  canRemoveMember: (memberId: string) => boolean
  isCurrentUser: (memberId: string) => boolean
}

export function MembersList({
  members,
  onRemoveMember,
  canRemoveMember,
  isCurrentUser
}: MembersListProps) {

  const renderMemberItem = ({ item }: { item: MemberWithDetails }) => {
    const isAdmin = item.role === MEMBER_ROLES.ADMIN
    const canRemove = canRemoveMember(item.uid)
    const isCurrent = isCurrentUser(item.uid)

    return (
      <View className="bg-white border-b border-gray-100 p-4">
        <View className="flex-row items-center justify-between">
          {/* 左側：頭像與基本資料 */}
          <View className="flex-row items-center flex-1">
            {/* 頭像 */}
            <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 justify-center items-center">
              {item.avatarUrl ? (
                <Image
                  source={{ uri: item.avatarUrl }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Text className="text-lg font-bold text-gray-600">
                  {item.displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            {/* 基本資料 */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-gray-800">
                  {item.displayName}
                </Text>
                {isCurrent && (
                  <Text className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    我
                  </Text>
                )}
                {isAdmin && (
                  <Text className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    管理員
                  </Text>
                )}
              </View>

              <Text className="text-sm text-gray-500 mt-1">
                {item.email}
              </Text>

              <Text className="text-xs text-gray-400 mt-1">
                加入時間：{new Date(item.joinedAt.toDate()).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* 右側：操作按鈕 */}
          <View className="flex-row items-center">
            {canRemove && (
              <TouchableOpacity
                onPress={() => onRemoveMember(item.uid)}
                className="bg-red-500 px-3 py-1 rounded ml-2"
              >
                <Text className="text-white text-sm">移除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 繳費狀態 */}
        <View className="mt-3 p-3 bg-gray-50 rounded-lg">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-700">繳費狀態</Text>
            <View className="flex-row items-center">
              {item.paymentStatus.currentMonthPaid ? (
                <Text className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  已繳費
                </Text>
              ) : (
                <Text className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  未繳費
                </Text>
              )}
              {item.paymentStatus.overdueDays > 0 && (
                <Text className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded ml-1">
                  逾期 {item.paymentStatus.overdueDays} 天
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-600">
              本月金額：${item.paymentStatus.currentMonthAmount.toLocaleString()}
            </Text>
            {item.paymentStatus.latestPaymentDate && (
              <Text className="text-xs text-gray-500">
                最近繳費：{item.paymentStatus.latestPaymentDate}
              </Text>
            )}
          </View>
        </View>

        {/* 統計資料 */}
        <View className="mt-2 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm font-medium text-gray-700 mb-2">統計資料</Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">累計金額</Text>
              <Text className="text-sm font-semibold text-gray-800">
                ${item.statistics.totalPaidAmount.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">繳費次數</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {item.statistics.totalPaymentCount} 次
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.uid}
      renderItem={renderMemberItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  )
}