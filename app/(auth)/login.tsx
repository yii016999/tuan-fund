import ScreenWrapper from '@/components/ScreenWrapper'
import { useLoginViewModel } from "@/features/auth/viewModel/useLoginViewModel"
import { Button, Text, TextInput, View } from "react-native"

export default function LoginScreen() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    handleLogin,
    goToRegister,
  } = useLoginViewModel()

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center px-4 bg-red-100">
        <Text className="text-2xl font-bold mb-6">登入</Text>

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
            {/* 登入按鈕 */}
            <Button title="登入" onPress={handleLogin} />
          </View>
          <View className="flex-1">
            {/* 前往註冊頁 */}
            <Button title="註冊" onPress={goToRegister} />
          </View>
        </View>

        {/* 顯示錯誤訊息 */}
        {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}
      </View>
    </ScreenWrapper>
  )
}