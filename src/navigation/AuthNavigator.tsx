import { AUTH_ROUTES } from '@/constants/routes'
import LoginScreen from '@/features/auth/screens/login'
import RegisterScreen from '@/features/auth/screens/register'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthParamList } from './types'

const Stack = createNativeStackNavigator<AuthParamList>()

export default function AuthNavigator() {
    return (
        // 當沒有設定initialRouteName的時候，會預設顯示第一個畫面
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={AUTH_ROUTES.LOGIN} component={LoginScreen} />
            <Stack.Screen name={AUTH_ROUTES.REGISTER} component={RegisterScreen} />
        </Stack.Navigator>
    )
}   