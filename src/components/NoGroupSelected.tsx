import { TAB_ROUTES } from '@/constants/routes'
import { SETTINGS_NO_GROUP_SELECTED } from '@/constants/string'
import { TabParamList } from '@/navigation/types'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface NoGroupSelectedProps {
  joinedGroupIds: string[]
}

export default function NoGroupSelected(props: NoGroupSelectedProps) {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>()

  const content = props.joinedGroupIds.length > 0
    ? {
      title: SETTINGS_NO_GROUP_SELECTED.TITLE,
      message: SETTINGS_NO_GROUP_SELECTED.MESSAGE,
    }
    : {
      title: SETTINGS_NO_GROUP_SELECTED.NO_GROUP_TITLE,
      message: SETTINGS_NO_GROUP_SELECTED.NO_GROUP_MESSAGE,
    }

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-gray-600 text-center text-lg mb-2">
        {content.title}
      </Text>
      <Text className="text-gray-500 text-center text-sm mb-6">
        {content.message}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate(TAB_ROUTES.SETTINGS)}
        className="bg-blue-500 px-6 py-3 rounded-lg"
        accessibilityRole="button"
        accessibilityLabel={SETTINGS_NO_GROUP_SELECTED.GO_TO_SETTINGS}
      >
        <Text className="text-white font-medium text-center">
          {SETTINGS_NO_GROUP_SELECTED.GO_TO_SETTINGS}
        </Text>
      </TouchableOpacity>
    </View>
  )
}