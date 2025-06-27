import { GROUPS_ROUTES } from '@/constants/routes'
import CreateGroupScreen from '@/features/groups/screens/CreateGroupScreen'
import GroupDetailScreen from '@/features/groups/screens/GroupDetailScreen'
import GroupsScreen from '@/features/groups/screens/GroupsScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GroupsStackParamList } from '../types'

const Groups = createNativeStackNavigator<GroupsStackParamList>()

// TabNavigator 裡面的 Groups 畫面 (為了讓子頁面可以擁有Tab的樣式，因此要獨立出來)
export default function GroupsStack() {
    return (
        <Groups.Navigator screenOptions={{ headerShown: false }}>
            <Groups.Screen name={GROUPS_ROUTES.LIST} component={GroupsScreen} />
            <Groups.Screen name={GROUPS_ROUTES.CREATE} component={CreateGroupScreen} />
            <Groups.Screen name={GROUPS_ROUTES.DETAIL} component={GroupDetailScreen} />
        </Groups.Navigator>
    )
}