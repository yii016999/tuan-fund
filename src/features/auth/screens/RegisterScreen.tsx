import { AUTH_ROUTES } from "@/constants/routes"
import { REGISTER } from "@/constants/string"
import { useRegisterViewModel } from "@/features/auth/viewmodel/useRegisterViewModel"
import { AuthParamList } from '@/navigation/types'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text, TextInput, TouchableOpacity, View } from "react-native"

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
        <View className="flex-1 bg-gray-50 justify-center px-6">
            {/* 主要容器 */}
            <View className="bg-white rounded-2xl shadow-lg p-8 mx-2">
                {/* 標題 */}
                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-gray-800 mb-2">{REGISTER.TITLE}</Text>
                    <Text className="text-gray-500 text-base">{REGISTER.DISPLAY_INFO}</Text>
                </View>

                {/* 輸入框區域 */}
                <View className="mb-6">
                    <View>
                        <Text className="text-gray-700 text-sm font-medium mb-2">{REGISTER.DISPLAY_NAME}</Text>
                        <TextInput
                            placeholder={REGISTER.DISPLAY_NAME_PLACEHOLDER}
                            value={displayName}
                            onChangeText={setDisplayName}
                            className="w-full border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white"
                            keyboardType="default"
                            autoCapitalize="none"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-gray-700 text-sm font-medium mb-2">{REGISTER.USERNAME}</Text>
                        <TextInput
                            placeholder={REGISTER.USERNAME_PLACEHOLDER}
                            value={username}
                            onChangeText={setUsername}
                            className="w-full border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white"
                            keyboardType="default"
                            autoCapitalize="none"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-gray-700 text-sm font-medium mb-2">{REGISTER.PASSWORD}</Text>
                        <TextInput
                            placeholder={REGISTER.PASSWORD_PLACEHOLDER}
                            value={password}
                            onChangeText={setPassword}
                            className="w-full border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white"
                            secureTextEntry
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* 錯誤訊息 */}
                {error && (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                        <Text className="text-red-600 text-sm text-center">{error}</Text>
                    </View>
                )}

                {/* 按鈕區域 */}
                <View>
                    {/* 註冊按鈕 */}
                    <TouchableOpacity
                        onPress={onRegisterSubmitPress}
                        className="bg-blue-600 rounded-xl py-4 shadow-sm active:bg-blue-700"
                    >
                        <Text className="text-white text-center font-semibold text-lg">{REGISTER.REGISTER}</Text>
                    </TouchableOpacity>

                    {/* 返回登入按鈕 */}
                    <TouchableOpacity
                        onPress={goToLogin}
                        className="bg-gray-100 border border-gray-200 rounded-xl py-4 active:bg-gray-200 mt-3"
                    >
                        <Text className="text-gray-700 text-center font-semibold text-lg">{REGISTER.RETURN_TO_LOGIN}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}