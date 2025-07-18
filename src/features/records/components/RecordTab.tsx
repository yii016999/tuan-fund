import { COLORS, STYLES } from '@/constants/config'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface TabItem {
  key: string
  title: string
}

interface RecordTabProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
}

const RecordTab = React.memo<RecordTabProps>(({ tabs, activeTab, onTabChange }) => {
  return (
    <View
      className="flex-row rounded-lg p-1 mx-4 mb-4"
      style={{ backgroundColor: COLORS.GRAY[100] }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            className="flex-1 py-3 px-4 rounded-md"
            style={{
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              ...(isActive ? STYLES.SHADOW : {}),
            }}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              className="text-center font-medium"
              style={{
                color: isActive ? COLORS.PRIMARY : COLORS.GRAY[600]
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
})

RecordTab.displayName = 'RecordTab'

export default RecordTab 