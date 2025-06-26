import ScreenWrapper from '@/components/ScreenWrapper'
import { useGroupViewModel } from '@/features/groups/viewModel/useGroupViewModel'
import { useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { Button, FlatList, Text, View } from 'react-native'

export default function GroupsScreen() {
  const navigation = useNavigation()
  const { groups, isLoading, fetchGroups } = useGroupViewModel()

  useEffect(() => {
    fetchGroups()
  }, [])

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <Text>載入中...</Text>
        </View>
      </ScreenWrapper>

    )
  }

  if (groups.length === 0) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg mb-4">你還沒有加入任何群組</Text>
          <Button title="新增群組" onPress={() => { navigation.navigate('create') }} />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text>{item.type === 'one-time' ? '一次性群組' : '長期型群組'}</Text>
          </View>
        )}
      />
      <Button title="新增群組" onPress={() => { router.push('/groups/create') }} />
    </ScreenWrapper>
  )
}