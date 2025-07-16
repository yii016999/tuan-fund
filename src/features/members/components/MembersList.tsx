import { COLORS, STYLES } from '@/constants/config'
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

const MembersList = React.memo<MembersListProps>(({
  members,
  onRemoveMember,
  canRemoveMember,
  isCurrentUser
}) => {
  const renderMemberItem = React.useCallback((item: MemberWithDetails) => {
    const isAdmin = item.role === MEMBER_ROLES.ADMIN
    const canRemove = canRemoveMember(item.uid)
    const isCurrent = isCurrentUser(item.uid)

    return (
      <View
        className="bg-white border-b border-gray-100"
        style={{ padding: STYLES.SPACING.MD }}
      >
        <View className="flex-row items-center justify-between">
          {/* 左側頭像與基本資料 */}
          <View className="flex-row items-center flex-1">
            {/* 頭像 */}
            <View
              className="justify-center items-center mr-3"
              style={{
                width: STYLES.MEMBER.AVATAR_SIZE,
                height: STYLES.MEMBER.AVATAR_SIZE,
                borderRadius: STYLES.MEMBER.AVATAR_SIZE / 2,
                backgroundColor: COLORS.GRAY[200],
              }}
            >
              {item.avatarUrl ? (
                <Image
                  source={{ uri: item.avatarUrl }}
                  style={{
                    width: STYLES.MEMBER.AVATAR_SIZE,
                    height: STYLES.MEMBER.AVATAR_SIZE,
                    borderRadius: STYLES.MEMBER.AVATAR_SIZE / 2,
                  }}
                />
              ) : (
                <Text
                  className="font-bold"
                  style={{
                    fontSize: STYLES.MEMBER.AVATAR_PLACEHOLDER_SIZE,
                    color: COLORS.GRAY[600],
                  }}
                >
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
                  <Text
                    className="ml-2 text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: COLORS.MEMBER.CURRENT_BADGE_BG,
                      color: COLORS.MEMBER.CURRENT_BADGE_TEXT,
                    }}
                  >
                    {MEMBERS.CURRENT_MEMBER}
                  </Text>
                )}
                {isAdmin && (
                  <Text
                    className="ml-2 text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: COLORS.MEMBER.ADMIN_BADGE_BG,
                      color: COLORS.MEMBER.ADMIN_BADGE_TEXT,
                    }}
                  >
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
                onPress={() => onRemoveMember(item.uid)}
                className="px-3 py-1 rounded ml-2"
                style={{ backgroundColor: COLORS.ERROR }}
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm">{MEMBERS.REMOVE}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 繳費狀態 */}
        <View
          className="mt-3 p-3 rounded-lg"
          style={{ backgroundColor: COLORS.MEMBER.PAYMENT_STATUS_BG }}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-700">{MEMBERS.PAYMENT_STATUS}</Text>
            <View className="flex-row items-center">
              {item.paymentStatus.currentMonthPaid ? (
                <Text
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: COLORS.MEMBER.PAID_BADGE_BG,
                    color: COLORS.MEMBER.PAID_BADGE_TEXT,
                  }}
                >
                  {MEMBERS.PAID}
                </Text>
              ) : (
                <Text
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: COLORS.MEMBER.UNPAID_BADGE_BG,
                    color: COLORS.MEMBER.UNPAID_BADGE_TEXT,
                  }}
                >
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
        <View
          className="mt-2 p-3 rounded-lg"
          style={{ backgroundColor: COLORS.MEMBER.STATISTICS_BG }}
        >
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
  }, [canRemoveMember, isCurrentUser, onRemoveMember])

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.uid}
      renderItem={({ item }) => renderMemberItem(item)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: STYLES.SPACING.LG }}
    />
  )
})

MembersList.displayName = 'MembersList'

export { MembersList }
