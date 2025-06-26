import ScreenWrapper from '@/components/ScreenWrapper'
import { AUTH_ROUTES, ROOT_ROUTES } from '@/constants/routes'
import { useLoginViewModel } from "@/features/auth/viewModel/useLoginViewModel"
import { AuthParamList, RootStackParamList } from '@/navigation/types'
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button, Text, TextInput, View } from "react-native"

export default function LoginScreen() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    handleLogin,
  } = useLoginViewModel()

  // 判斷當前畫面屬於哪個 Navigator，要看此頁是在哪個 Navigator 中被註冊
  // 因為現在我的系統整合了兩個 Navigator，所以需要使用 MixedNav 來讓 navigation 可以跳轉到兩個 Navigator 分類的畫面
  type MixedNav = CompositeNavigationProp<NativeStackNavigationProp<AuthParamList>, NativeStackNavigationProp<RootStackParamList>>
  const navigation = useNavigation<MixedNav>()

  const onRegisterPress = async () => {
    // 使用 navigate 會將 Register 畫面堆疊起來
    // 使用者可透過返回鍵回到 Login
    navigation.navigate(AUTH_ROUTES.REGISTER)
  }

  const onLoginPress = async () => {
    // 跳轉登入頁已由RootNavigator監聽與掌管，因此請求完登入之後，就可以直接跳轉
    await handleLogin()
  }

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
            <Button title="登入" onPress={onLoginPress} />
          </View>
          <View className="flex-1">
            {/* 前往註冊頁 */}
            <Button title="註冊" onPress={onRegisterPress} />
          </View>
        </View>

        {/* 顯示錯誤訊息 */}
        {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}
      </View>
    </ScreenWrapper>
  )
}