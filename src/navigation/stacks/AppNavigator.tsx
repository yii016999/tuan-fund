import FullScreenLoader from '@/components/FullScreenLoader'
import { db } from '@/config/firebase'
import { COLLECTIONS } from '@/constants/firestorePaths'
import { APP_ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/useAuthStore'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { AppStackParamList } from '../types'
import TabNavigator from './TabNavigator'

// 寫在組件外，避免每次渲染都重新建立，可能會：
// 重新建立 Tab 實體（JS 函式重建）
// 導致 Tab.Navigator 和內部狀態重新建立，可能閃爍、失去焦點、重設畫面
const AppStack = createNativeStackNavigator<AppStackParamList>()

export default function AppNavigator() {
    // 從 store 取得使用者資訊
    const { user, setActiveGroupId } = useAuthStore()

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            if (!user?.uid) return

            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid))
            const activeGroupId = userDoc.data()?.activeGroupId ?? null

            // 設定進 auth store
            setActiveGroupId(activeGroupId)

            setLoading(false)
        }

        init()
    }, [user?.uid])

    if (loading) {
        return (
            <FullScreenLoader visible={loading} />
        )
    }

    return (
        // 當沒有設定initialRouteName的時候，會預設顯示第一個畫面
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
            {/* 需要 Tab 的畫面，直接包 TabNavigator 即可，不屬於Tab的畫面，但需要顯示Tab的樣式，會在對應的 Navigator 裡面設定 */}
            <AppStack.Screen name={APP_ROUTES.TABS} component={TabNavigator} />
            {/* 不需要 Tab 的畫面 */}
            {/* <Stack.Screen name={APP_ROUTES.GROUP_DETAIL} component={GroupDetailScreen} /> */}
        </AppStack.Navigator>
    )
}