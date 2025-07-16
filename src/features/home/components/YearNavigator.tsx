import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { COLORS, STYLES } from '@/constants/config'

interface YearNavigatorProps {
  selectedYear: number
  title?: string
  canGoPrevious: boolean
  canGoNext: boolean
  onPreviousYear: () => void
  onNextYear: () => void
}

const YearNavigator = React.memo<YearNavigatorProps>(({
  selectedYear,
  title,
  canGoPrevious,
  canGoNext,
  onPreviousYear,
  onNextYear
}) => {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-lg font-bold">
        {selectedYear} {title}
      </Text>
      <View className="flex-row" style={{ gap: STYLES.SPACING.MD }}>
        <TouchableOpacity
          onPress={canGoPrevious ? onPreviousYear : undefined}
          disabled={!canGoPrevious}
          className="p-2"
          style={{
            opacity: canGoPrevious ? 1 : 0.3,
            width: STYLES.HOME.NAVIGATION_BUTTON_SIZE,
            height: STYLES.HOME.NAVIGATION_BUTTON_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-lg"
            style={{
              color: canGoPrevious ? COLORS.HOME.NAVIGATION_BUTTON_ACTIVE : COLORS.HOME.NAVIGATION_BUTTON_DISABLED
            }}
          >
            ◀
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={canGoNext ? onNextYear : undefined}
          disabled={!canGoNext}
          className="p-2"
          style={{
            opacity: canGoNext ? 1 : 0.3,
            width: STYLES.HOME.NAVIGATION_BUTTON_SIZE,
            height: STYLES.HOME.NAVIGATION_BUTTON_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-lg"
            style={{
              color: canGoNext ? COLORS.HOME.NAVIGATION_BUTTON_ACTIVE : COLORS.HOME.NAVIGATION_BUTTON_DISABLED
            }}
          >
            ▶
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

YearNavigator.displayName = 'YearNavigator'

export default YearNavigator 