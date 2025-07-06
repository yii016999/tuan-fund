import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface TabItem {
  key: string       // Tab 的唯一識別鍵
  title: string     // Tab 顯示的標題文字
}

interface RecordTabProps {
  tabs: TabItem[]                           // Tab 項目陣列
  activeTab: string                         // 當前啟用的 Tab key
  onTabChange: (tabKey: string) => void     // Tab 切換時的回調函數
}

export default function RecordTab(props: RecordTabProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-lg p-1 mx-4 mb-4">
      {props.tabs.map((tab) => {
        const isActive = props.activeTab === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            className={isActive ? 'flex-1 py-3 px-4 rounded-md bg-white' : 'flex-1 py-3 px-4 rounded-md bg-transparent'}
            onPress={() => props.onTabChange(tab.key)}
          >
            <Text className={isActive ? 'text-center font-medium text-blue-600' : 'text-center font-medium text-gray-600'}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
} 