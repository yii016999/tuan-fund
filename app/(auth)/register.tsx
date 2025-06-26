import ScreenWrapper from "@/components/ScreenWrapper"
import { useRegisterViewModel } from "@/features/auth/viewModel/useRegisterViewModel"
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
        goToLogin,
    } = useRegisterViewModel()

    return (
        <ScreenWrapper>
            <View className="flex-1 justify-center items-center px-4 bg-green-100">
                <Text className="text-2xl font-bold mb-6">註冊</Text>

                <TextInput
                    placeholder="暱稱"
                    value={displayName}
                    onChangeText={setDisplayName}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="帳號"
                    value={username}
                    onChangeText={setUsername}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="密碼"
                    value={password}
                    onChangeText={setPassword}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white"
                    secureTextEntry
                />

                <View className="w-full flex-row justify-between gap-4 mt-2">
                    <View className="flex-1">
                        {/* 註冊按鈕 */}
                        <Button title="註冊" onPress={handleRegister} />
                    </View>
                    <View className="flex-1">
                        {/* 前往登入頁 */}
                        <Button title="返回登入" onPress={goToLogin} />
                    </View>
                </View>

                {/* 暫時顯示錯誤訊息 */}
                {error ? (
                    <Text className="text-red-500 text-sm mb-4">{error}</Text>
                ) : null}
            </View>
        </ScreenWrapper>
    )
}