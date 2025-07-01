import { AUTH_ROUTES } from "@/constants/routes"
import { REGISTER } from "@/constants/string"
import { useRegisterViewModel } from "@/features/auth/viewModel/useRegisterViewModel"
import { AuthParamList } from '@/navigation/types'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button, Text, TextInput, View } from "react-native"

export default function RegisterScreen() {
    const {
        username,
        displayName,
        setDisplayName,
        setUsername,
        password,
        setPassword,
        error,
        handleRegister,
    } = useRegisterViewModel()

    const navigation = useNavigation<NativeStackNavigationProp<AuthParamList>>()

    const goToLogin = () => {
        navigation.replace(AUTH_ROUTES.LOGIN)
    }

    const onRegisterSubmitPress = async () => {
        const success = await handleRegister()
        if (success) {
            goToLogin()
        }
    }

    return (
        <View className="flex-1 justify-center items-center px-4">
            <Text className="text-2xl font-bold mb-6">{REGISTER.TITLE}</Text>

            <TextInput
                placeholder={REGISTER.DISPLAY_NAME}
                value={displayName}
                onChangeText={setDisplayName}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white"
                keyboardType="default"
                autoCapitalize="none"
            />

            <TextInput
                placeholder={REGISTER.USERNAME}
                value={username}
                onChangeText={setUsername}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white"
                keyboardType="default"
                autoCapitalize="none"
            />

            <TextInput
                placeholder={REGISTER.PASSWORD}
                value={password}
                onChangeText={setPassword}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white"
                secureTextEntry
            />

            <View className="w-full flex-row justify-between gap-4 mt-2">
                <View className="flex-1">
                    {/* 註冊按鈕 */}
                    <Button title={REGISTER.REGISTER} onPress={onRegisterSubmitPress} />
                </View>
                <View className="flex-1">
                    {/* 前往登入頁 */}
                    <Button title={REGISTER.RETURN_TO_LOGIN} onPress={goToLogin} />
                </View>
            </View>

            {/* 暫時顯示錯誤訊息 */}
            {error ? (
                <Text className="text-red-500 text-sm mb-4">{error}</Text>
            ) : null}
        </View>
    )
}