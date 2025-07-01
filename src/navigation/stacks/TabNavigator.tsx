import { AppHeader } from '@/components/AppHeader'
import { TAB_ROUTES } from '@/constants/routes'
import { TAB_NAVIGATOR } from '@/constants/string'
import { HEADER_BACK_TYPES } from '@/constants/types'
import AddScreen from '@/features/add/screens/AddScreen'
import HomeScreen from '@/features/home/screens/HomeScreen'
import MembersScreen from '@/features/members/screens/MembersScreen'
import RecordsScreen from '@/features/records/screens/RecordsScreen'
import SettingsScreen from '@/features/settings/screens/SettingsScreen'
import Ionicons from '@expo/vector-icons/Ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabParamList } from '../types'

const Tab = createBottomTabNavigator<TabParamList>()

// 底部導航
// TABS 本身是個畫面容器，它需要被某個 Navigator 控制跳轉，因此需要作為一個「可導航的 route」被註冊在 AppStack 裡。
export default function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: true }}>
            <Tab.Screen
                name={TAB_ROUTES.HOME}
                component={HomeScreen}
                options={{
                    title: TAB_NAVIGATOR.HOME,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                    header: () => <AppHeader showBack={false} title={TAB_NAVIGATOR.HOME} />,
                }}
            />

            <Tab.Screen
                name={TAB_ROUTES.RECORDS}
                component={RecordsScreen}
                options={{
                    title: TAB_NAVIGATOR.RECORDS,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                    header: () => <AppHeader showBack={true} backType={HEADER_BACK_TYPES.ARROW} title={TAB_NAVIGATOR.RECORDS} />,
                }}
            />

            <Tab.Screen
                name={TAB_ROUTES.ADD}
                component={AddScreen}
                options={{
                    title: TAB_NAVIGATOR.ADD,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                    header: () => <AppHeader showBack={true} backType={HEADER_BACK_TYPES.CLOSE} title={TAB_NAVIGATOR.ADD} />,
                }}
            />

            <Tab.Screen
                name={TAB_ROUTES.MEMBERS}
                component={MembersScreen}
                options={{
                    title: TAB_NAVIGATOR.MEMBERS,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                    header: () => <AppHeader showBack={false} backType={HEADER_BACK_TYPES.ARROW} title={TAB_NAVIGATOR.MEMBERS} />,
                }}
            />

            <Tab.Screen
                name={TAB_ROUTES.SETTINGS}
                component={SettingsScreen}
                options={{
                    title: TAB_NAVIGATOR.SETTINGS,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                    header: () => <AppHeader showBack={false} backType={HEADER_BACK_TYPES.ARROW} title={TAB_NAVIGATOR.SETTINGS} />,
                }}
            />
        </Tab.Navigator>
    )
}





{/* <Tab.Screen
name={TAB_ROUTES.GROUPS}
component={GroupsStack}
options={{
    title: TAB_NAVIGATOR.GROUPS,
    tabBarIcon: ({ color, size }) => (
        <Ionicons name="people" size={size} color={color} />
    ),
    header: () => <AppHeader showBack={false} backType={HEADER_BACK_TYPES.ARROW} title={TAB_NAVIGATOR.GROUPS} />,
}}
/> */}