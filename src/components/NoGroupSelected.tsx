import { SETTINGS_NO_GROUP_SELECTED } from '@/constants/string'
import React from 'react'
import { Text, View } from 'react-native'

interface NoGroupSelectedProps {
  joinedGroupIds: string[]
  className?: string
}

export function NoGroupSelected({
  joinedGroupIds,
  className = 'flex-1 justify-center items-center p-4'
}: NoGroupSelectedProps) {
  if (joinedGroupIds.length > 0) {
    return (
      <View className={className}>
        <Text className="text-gray-600 text-center text-lg mb-2">{SETTINGS_NO_GROUP_SELECTED.TITLE}</Text>
        <Text className="text-gray-500 text-center text-sm">{SETTINGS_NO_GROUP_SELECTED.MESSAGE}</Text>
      </View>
    )
  } else {
    return (
      <View className={className}>
        <Text className="text-gray-600 text-center text-lg mb-2">
          {SETTINGS_NO_GROUP_SELECTED.NO_GROUP_TITLE}
        </Text>
        <Text className="text-gray-500 text-center text-sm">
          {SETTINGS_NO_GROUP_SELECTED.NO_GROUP_MESSAGE}
        </Text>
      </View>
    )
  }
}

export default NoGroupSelected 