import { COMMON, MEMBERS } from '@/constants/string'
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

export function MembersList(props: MembersListProps) {

  const renderMemberItem = (item: MemberWithDetails) => {
    const isAdmin = item.role === MEMBER_ROLES.ADMIN
    const canRemove = props.canRemoveMember(item.uid)
    const isCurrent = props.isCurrentUser(item.uid)

    return (
      <View className="bg-white border-b border-gray-100 p-4">
        <View className="flex-row items-center justify-between">
          {/* 左側頭像與基本資料 */}
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
                    {MEMBERS.CURRENT_MEMBER}
                  </Text>
                )}
                {isAdmin && (
                  <Text className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {MEMBERS.ADMIN}
                  </Text>
                )}
              </View>

              <Text className="text-sm text-gray-500 mt-1">
                {item.email}
              </Text>

              <Text className="text-xs text-gray-400 mt-1">
                {MEMBERS.JOINED_AT}{new Date(item.joinedAt.toDate()).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* 右側操作按鈕 */}
          <View className="flex-row items-center">
            {canRemove && (
              <TouchableOpacity
                onPress={() => props.onRemoveMember(item.uid)}
                className="bg-red-500 px-3 py-1 rounded ml-2"
              >
                <Text className="text-white text-sm">{MEMBERS.REMOVE}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 繳費狀態 */}
        <View className="mt-3 p-3 bg-gray-50 rounded-lg">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-700">{MEMBERS.PAYMENT_STATUS}</Text>
            <View className="flex-row items-center">
              {item.paymentStatus.currentMonthPaid ? (
                <Text className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  {MEMBERS.PAID}
                </Text>
              ) : (
                <Text className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  {MEMBERS.UNPAID}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-600">
              {MEMBERS.CURRENT_MONTH_AMOUNT}{item.paymentStatus.currentMonthAmount.toLocaleString()}
            </Text>
            {item.paymentStatus.latestPaymentDate && (
              <Text className="text-xs text-gray-500">
                {MEMBERS.LATEST_PAYMENT_DATE}{item.paymentStatus.latestPaymentDate}
              </Text>
            )}
          </View>
        </View>

        {/* 統計資料 */}
        <View className="mt-2 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm font-medium text-gray-700 mb-2">{MEMBERS.STATISTICS}</Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">{MEMBERS.TOTAL_PAID_AMOUNT}</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {COMMON.MONEY_SIGN}{item.statistics.totalPaidAmount.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">{MEMBERS.TOTAL_PAYMENT_COUNT}</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {item.statistics.totalPaymentCount} {MEMBERS.TIMES}
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <FlatList
      data={props.members}
      keyExtractor={(item) => item.uid}
      renderItem={(item) => renderMemberItem(item.item)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  )
}