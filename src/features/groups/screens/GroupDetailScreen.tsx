import ScreenWrapper from '@/components/ScreenWrapper'
import { AppStackParamList } from '@/navigation/types'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Text } from 'react-native'

type GroupDetailRouteProp = RouteProp<AppStackParamList, 'GroupDetail'>

export default function GroupDetailScreen() {
  const route = useRoute<GroupDetailRouteProp>()
  const { groupId } = route.params

  return (
    <ScreenWrapper safeAreaClassName="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">群組詳細資料</Text>
      <Text>Group ID: {groupId}</Text>
    </ScreenWrapper>
  )
}