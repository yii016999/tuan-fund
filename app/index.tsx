import ScreenWrapper from '@/components/ScreenWrapper'
import '@/config/firebase'
import { auth } from '@/config/firebase'
import { APP_ROUTES, AUTH_ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'expo-router'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

// App 啟動時的初始判斷頁（登入、未登入 → 導向對應頁面）
export default function Index() {
  // 取得 router，未來可以透過 router.replace() 跳轉
  const router = useRouter()
  // 取得 setUser，未來可以透過 setUser() 儲存使用者資訊(Zustand)
  const setUser = useAuthStore((s) => s.setUser)
  // 設定 loading 狀態
  const [loading, setLoading] = useState(true)

  // 通常畫面會先繪製，此時顯示 loading 畫面
  // 然後在 useEffect 中透過 onAuthStateChanged 判斷是否登入
  useEffect(() => {
    // 使用 Firebase 的 onAuthStateChanged() 設定監聽，回傳目前是否有登入者
    // 如果登入者有變化，會觸發 onAuthStateChanged()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 已登入：儲存狀態 & 導向 tabs 首頁
        setUser({ uid: user.uid, email: user.email ?? '', displayName: user.displayName ?? '' })
        // 之後的真正首頁（有 tab layout）
        router.replace(APP_ROUTES.HOME)
      } else {
        // 未登入：導向登入頁
        router.replace(AUTH_ROUTES.LOGIN)
      }
      setLoading(false)
    })

    // 清除監聽，避免記憶體洩漏
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#000" />
        </View>
      </ScreenWrapper>
    )
  }

  return null
}
