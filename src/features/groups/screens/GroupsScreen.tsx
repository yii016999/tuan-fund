import FullScreenLoader from '@/components/FullScreenLoader'
import ScreenWrapper from '@/components/ScreenWrapper'
import { GROUPS_ROUTES } from '@/constants/routes'
import { GROUP_TYPES } from '@/constants/types'
import { useGroupViewModel } from '@/features/groups/viewModel/useGroupViewModel'
import { GroupsStackParamList } from '@/navigation/types'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { Button, FlatList, Text, TouchableOpacity } from 'react-native'

export default function GroupsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GroupsStackParamList>>()
  const { groups, isLoading, fetchGroups } = useGroupViewModel()

  useEffect(() => {
    fetchGroups()
  }, [])

  if (isLoading) {
    return (
      <FullScreenLoader visible={isLoading} />
    )
  }

  if (groups.length === 0) {
    return (
      <>
        <Text className="text-lg mb-4">你還沒有加入任何群組</Text>
        <Button title="新增群組" onPress={() => { navigation.navigate(GROUPS_ROUTES.CREATE) }} />
      </>
    )
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-4 border-b border-gray-200"
            onPress={() => navigation.navigate(GROUPS_ROUTES.DETAIL, { groupId: item.id })}>
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text>{item.type === GROUP_TYPES.ONE_TIME ? '一次性群組' : '長期型群組'}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="新增群組" onPress={() => { navigation.navigate(GROUPS_ROUTES.CREATE) }} />
    </ScreenWrapper>
  )
}