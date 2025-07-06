import { SETTINGS_NO_GROUP_SELECTED } from '@/constants/string'
import React from 'react'
import { Text, View } from 'react-native'

interface NoGroupSelectedProps {
  title?: string
  message?: string
  className?: string
}

export function NoGroupSelected({
  title = SETTINGS_NO_GROUP_SELECTED.TITLE,
  message = SETTINGS_NO_GROUP_SELECTED.MESSAGE,
  className = 'flex-1 justify-center items-center p-4'
}: NoGroupSelectedProps) {
  return (
    <View className={className}>
      <Text className="text-gray-600 text-center text-lg mb-2">
        {title}
      </Text>
      <Text className="text-gray-500 text-center text-sm">
        {message}
      </Text>
    </View>
  )
}

export default NoGroupSelected 