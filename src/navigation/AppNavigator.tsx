import { APP_ROUTES } from '@/constants/routes'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import { AppStackParamList } from './types'

// 寫在組件外，避免每次渲染都重新建立，可能會：
// 重新建立 Tab 實體（JS 函式重建）
// 導致 Tab.Navigator 和內部狀態重新建立，可能閃爍、失去焦點、重設畫面
const AppStack = createNativeStackNavigator<AppStackParamList>()

export default function AppNavigator() {
    return (
        // 當沒有設定initialRouteName的時候，會預設顯示第一個畫面
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
            {/* 需要 Tab 的畫面 */}
            <AppStack.Screen name={APP_ROUTES.TABS} component={TabNavigator} />
            {/* 不需要 Tab 的畫面 */}
            {/* <Stack.Screen name={APP_ROUTES.GROUP_DETAIL} component={GroupDetailScreen} /> */}
        </AppStack.Navigator>
    )
}