import { RECORD } from '@/constants/string'
import { RecordTabType } from '@/constants/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

interface RecordsEmptyStateProps {
  activeTab: RecordTabType
}

// 當目前選擇的tab沒有資料時，需要顯示沒有資料的樣式
export default function RecordsEmptyState({ activeTab }: RecordsEmptyStateProps) {
  if (activeTab === 'member') {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 mt-4 text-center">
          {RECORD.NO_MEMBER_RECORD}
        </Text>
        <Text className="text-gray-400 mt-2 text-center text-sm">
          {RECORD.NO_MEMBER_RECORD_SELECTED}
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
      <Text className="text-gray-500 mt-4">
        {RECORD.NO_RECORD}
      </Text>
    </View>
  )
} 