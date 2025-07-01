import { ROOT_ROUTES } from '@/constants/routes'
import { RootStackParamList, TabParamList } from '@/navigation/types'
import { useAuthStore } from '@/store/useAuthStore'
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

type MixedNav = CompositeNavigationProp<NativeStackNavigationProp<TabParamList>, NativeStackNavigationProp<RootStackParamList>>

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user)
  const activeGroupId = useAuthStore((state) => state.activeGroupId)
  const navigation = useNavigation<MixedNav>()

  const [noGroupDialogVisible, setNoGroupDialogVisible] = useState(false)


  // 如果沒登入，導回登入頁（額外保護）
  useEffect(() => {
    if (!user) {
      // 使用 replace 會用 Auth 畫面取代目前的 Home 畫面
      // 因為沒登入，所以使用者無法返回 Home 畫面
      navigation.replace(ROOT_ROUTES.AUTH)
    }
  }, [user])

  // 如果沒有群組，顯示對話框
  useEffect(() => {
    if (!activeGroupId) {
      setNoGroupDialogVisible(true)
    }
  }, [activeGroupId])

  return (
    <View className="flex-1 justify-center items-center">
      {/* 登入成功，顯示歡迎文字，並顯示使用者名稱 */}
      <>
        <Text className="!text-green-700 text-lg font-bold">登入成功！</Text>
        <Text className="text-base mt-2">歡迎：{user?.displayName}</Text>
      </>
    </View>
  )
}