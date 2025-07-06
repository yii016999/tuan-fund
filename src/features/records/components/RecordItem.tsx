import { RECORD_TRANSACTION_TYPES, RECORD_TYPES } from '@/constants/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { RecordListItem } from '../model/Record'

interface RecordItemProps {
  record: RecordListItem
  transactionType?: string
  onEdit: () => void
  onDelete: (record: RecordListItem) => void
  formatAmount: (amount: number, type?: string) => React.ReactNode
  formatDate: (dateStr: string) => string
}

export default function RecordItem({ 
  record, 
  transactionType, 
  onEdit, 
  onDelete, 
  formatAmount, 
  formatDate 
}: RecordItemProps) {
  return (
    <View className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-medium text-gray-900 mb-1">
            {record.title}
          </Text>
          {record.description && (
            <Text className="text-sm text-gray-600 mb-2">
              {record.description}
            </Text>
          )}
          <Text className="text-xs text-gray-500">
            {formatDate(record.date)}
          </Text>
        </View>

        <View className="items-end">
          <View className="mb-2">
            {formatAmount(record.amount, transactionType)}
          </View>

          {(record.canEdit || record.canDelete) && (
            <View className="flex-row space-x-2 gap-2">
              {record.canEdit && (
                <TouchableOpacity
                  className="p-2 bg-blue-50 rounded-full"
                  onPress={onEdit}
                >
                  <Ionicons name="pencil" size={16} color="#3B82F6" />
                </TouchableOpacity>
              )}

              {record.canDelete && (
                <TouchableOpacity
                  className="p-2 bg-red-50 rounded-full"
                  onPress={() => onDelete(record)}
                >
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
} 