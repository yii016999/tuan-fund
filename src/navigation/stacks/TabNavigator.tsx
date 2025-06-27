import { TAB_ROUTES } from '@/constants/routes'
import HomeScreen from '@/features/home/home'
import MembersScreen from '@/features/members/view/members'
import Ionicons from '@expo/vector-icons/Ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabParamList } from '../types'
import GroupsStack from './GroupsStack'

const Tab = createBottomTabNavigator<TabParamList>()

// 底部導航
// TABS 本身是個畫面容器，它需要被某個 Navigator 控制跳轉，因此需要作為一個「可導航的 route」被註冊在 AppStack 裡。
export default function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name={TAB_ROUTES.HOME}
                component={HomeScreen}
                options={{
                    title: '首頁',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={TAB_ROUTES.GROUPS}
                component={GroupsStack}
                options={{
                    title: '群組',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={TAB_ROUTES.MEMBERS}
                component={MembersScreen}
                options={{
                    title: '會員',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}