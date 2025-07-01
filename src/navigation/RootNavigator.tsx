import FullScreenLoader from '@/components/FullScreenLoader'
import { auth } from '@/config/firebase'
import { ROOT_ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/useAuthStore'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import AppNavigator from './stacks/AppNavigator'
import AuthNavigator from './stacks/AuthNavigator'
import { RootStackParamList } from './types'

// 建立 Stack Navigator 實體
const RootStack = createNativeStackNavigator<RootStackParamList>()

// 根導覽器：根據是否登入決定顯示 login 畫面或主畫面
export default function RootNavigator() {
  // 取得 setUser，未來可以透過 setUser() 儲存使用者資訊 (Zustand)
  const setUser = useAuthStore((s) => s.setUser)

  // 設定 loading 狀態，控制是否顯示 loading 畫面
  const [loading, setLoading] = useState(true)

  // 判斷使用者是否登入（null 表示尚未判斷完成）
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  // 畫面會先繪製，此時顯示 loading 畫面
  // 然後在 useEffect 中透過 onAuthStateChanged 判斷是否登入
  useEffect(() => {
    // 使用 Firebase 的 onAuthStateChanged() 設定監聽，回傳目前是否有登入者
    // 如果登入者有變化，會觸發 onAuthStateChanged()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 已登入：儲存狀態 & 導向 tabs 首頁
        setUser({
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          avatarUrl: user.photoURL ?? '',
        })
        setIsLoggedIn(true)
      } else {
        // 未登入：導向登入頁
        setIsLoggedIn(false)
      }
      setLoading(false)
    })

    // 清除監聽，避免記憶體洩漏
    return () => unsubscribe()
  }, [])

  // 尚未完成初始化時顯示 loading 畫面
  if (loading) {
    return (
      <FullScreenLoader visible={loading} />
    )
  }

  // 當初始化完成後，使用 react-navigation 導向對應畫面
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // 已登入：顯示主頁面
          <RootStack.Screen name={ROOT_ROUTES.APP} component={AppNavigator} />
        ) : (
          // 未登入：顯示登入頁面
          <RootStack.Screen name={ROOT_ROUTES.AUTH} component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}