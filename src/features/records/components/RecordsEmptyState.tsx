import { COLORS, STYLES } from '@/constants/config'
import { RECORD } from '@/constants/string'
import { RecordTabType } from '@/constants/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

interface RecordsEmptyStateProps {
  activeTab: RecordTabType
}

const RecordsEmptyState = React.memo<RecordsEmptyStateProps>(({ activeTab }) => {
  const iconSize = 48
  const iconColor = COLORS.GRAY[400]

  if (activeTab === 'member') {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ paddingVertical: STYLES.SPACING.XL * 2.5 }}
      >
        <Ionicons name="wallet-outline" size={iconSize} color={iconColor} />
        <Text
          className="mt-4 text-center"
          style={{ color: COLORS.GRAY[500] }}
        >
          {RECORD.NO_MEMBER_RECORD}
        </Text>
        <Text
          className="mt-2 text-center text-sm"
          style={{ color: COLORS.GRAY[400] }}
        >
          {RECORD.NO_MEMBER_RECORD_SELECTED}
        </Text>
      </View>
    )
  }

  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ paddingVertical: STYLES.SPACING.XL * 2.5 }}
    >
      <Ionicons name="document-text-outline" size={iconSize} color={iconColor} />
      <Text
        className="mt-4"
        style={{ color: COLORS.GRAY[500] }}
      >
        {RECORD.NO_RECORD}
      </Text>
    </View>
  )
})

RecordsEmptyState.displayName = 'RecordsEmptyState'

export default RecordsEmptyState 