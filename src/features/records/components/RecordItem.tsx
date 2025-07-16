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

export default function RecordItem(props: RecordItemProps) {
  return (
    <View className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-medium text-gray-900 mb-1">
            {props.record.title}
          </Text>
          {props.record.description && (
            <Text className="text-sm text-gray-600 mb-2">
              {props.record.description}
            </Text>
          )}
          <Text className="text-xs text-gray-500">
            {props.formatDate(props.record.date)}
          </Text>
        </View>

        <View className="items-end">
          <View className="mb-2">
            {props.formatAmount(props.record.amount, props.transactionType)}
          </View>

          {(props.record.canEdit || props.record.canDelete) && (
            <View className="flex-row space-x-2 gap-2">
              {props.record.canEdit && (
                <TouchableOpacity
                  className="p-2 bg-blue-50 rounded-full"
                  onPress={props.onEdit}
                >
                  <Ionicons name="pencil" size={16} color="#3B82F6" />
                </TouchableOpacity>
              )}

              {props.record.canDelete && (
                <TouchableOpacity
                  className="p-2 bg-red-50 rounded-full"
                  onPress={() => props.onDelete(props.record)}
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