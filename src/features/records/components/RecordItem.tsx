import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { COLORS, STYLES, UI } from '@/constants/config'
import { TRANSACTION } from '@/constants/string'
import { RecordListItem } from '../model/Record'

interface RecordItemProps {
  record: RecordListItem
  transactionType?: string
  onEdit: () => void
  onDelete: (record: RecordListItem) => void
  formatAmount: (amount: number, type?: string) => React.ReactNode
  formatDate: (dateStr: string) => string
}

// 格式化預繳範圍顯示 - 移除硬編碼
const formatPrepaymentRange = (startMonth: string, endMonth: string): string => {
  const { PREPAYMENT } = UI
  
  const formatMonth = (month: string) => {
    const year = month.substring(PREPAYMENT.YEAR_START_INDEX, PREPAYMENT.YEAR_END_INDEX)
    const monthNum = month.substring(PREPAYMENT.MONTH_START_INDEX, PREPAYMENT.MONTH_END_INDEX)
    return `${year}${monthNum}`
  }
  
  const formattedStart = formatMonth(startMonth)
  const formattedEnd = formatMonth(endMonth)
  
  if (startMonth === endMonth) {
    return `${TRANSACTION.PREPAYMENT_RANGE_PREFIX}${TRANSACTION.PREPAYMENT_KEYWORD}${formattedStart}${TRANSACTION.PREPAYMENT_RANGE_SUFFIX}`
  }
  
  return `${TRANSACTION.PREPAYMENT_RANGE_PREFIX}${TRANSACTION.PREPAYMENT_KEYWORD}${formattedStart}${TRANSACTION.PREPAYMENT_RANGE_SEPARATOR}${formattedEnd}${TRANSACTION.PREPAYMENT_RANGE_SUFFIX}`
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
            <Text className="text-lg font-medium text-gray-900 mb-1">
              {record.title}
            </Text>
            {record.prepaymentInfo && (
              <Text 
                className="text-sm ml-2 mb-1"
                style={{ color: COLORS.GRAY[500] }}
              >
                {formatPrepaymentRange(
                  record.prepaymentInfo.startMonth, 
                  record.prepaymentInfo.endMonth
                )}
              </Text>
            )}
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