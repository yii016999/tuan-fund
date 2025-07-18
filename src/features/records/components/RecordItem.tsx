import { COLORS, STYLES } from '@/constants/config'
import { RECORD_TYPES } from '@/constants/types'
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

const RecordItem = React.memo<RecordItemProps>(({
  record,
  transactionType,
  onEdit,
  onDelete,
  formatAmount,
  formatDate
}) => {
  const { RECORD_ITEM } = STYLES
  const isGroupTransaction = record.type === RECORD_TYPES.GROUP_TRANSACTION

  return (
    <View
      className="bg-white rounded-lg shadow-sm"
      style={{
        marginHorizontal: RECORD_ITEM.MARGIN_HORIZONTAL,
        marginBottom: RECORD_ITEM.MARGIN_BOTTOM,
        padding: RECORD_ITEM.PADDING,
        ...STYLES.SHADOW,
      }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap">
            {/* 群組收支記錄顯示創建者名稱 */}
            {isGroupTransaction && record.creatorDisplayName && (
              <Text
                className="text-lg font-medium mr-1"
                style={{ color: COLORS.PRIMARY }}
              >
                {record.creatorDisplayName}：
              </Text>
            )}
            <Text className="text-lg font-medium text-gray-900 mb-1">
              {record.title}
            </Text>
          </View>
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
                  className="rounded-full"
                  style={{
                    padding: STYLES.SPACING.XS,
                    backgroundColor: COLORS.PRIMARY + '20',
                    width: RECORD_ITEM.ICON_CONTAINER_SIZE,
                    height: RECORD_ITEM.ICON_CONTAINER_SIZE,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={onEdit}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="pencil"
                    size={RECORD_ITEM.ICON_SIZE}
                    color={COLORS.PRIMARY}
                  />
                </TouchableOpacity>
              )}

              {record.canDelete && (
                <TouchableOpacity
                  className="rounded-full"
                  style={{
                    padding: STYLES.SPACING.XS,
                    backgroundColor: COLORS.ERROR + '20',
                    width: RECORD_ITEM.ICON_CONTAINER_SIZE,
                    height: RECORD_ITEM.ICON_CONTAINER_SIZE,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => onDelete(record)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash"
                    size={RECORD_ITEM.ICON_SIZE}
                    color={COLORS.ERROR}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
})

RecordItem.displayName = 'RecordItem'

export default RecordItem 