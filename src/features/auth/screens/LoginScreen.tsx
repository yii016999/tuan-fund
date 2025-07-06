import { AUTH_ROUTES } from '@/constants/routes';
import { useLoginViewModel } from "@/features/auth/viewmodel/useLoginViewModel";
import { AuthParamList, RootStackParamList } from '@/navigation/types';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, TextInput, TouchableOpacity, View } from "react-native";

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
    <View className="flex-1 bg-gray-50 justify-center px-6">
      {/* 主要容器 */}
      <View className="bg-white rounded-2xl shadow-lg p-8 mx-2">
        {/* 標題 */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">歡迎回來</Text>
          <Text className="text-gray-500 text-base">請登入您的帳號</Text>
        </View>

        {/* 輸入框區域 */}
        <View className="mb-6">
          <View>
            <Text className="text-gray-700 text-sm font-medium mb-2">帳號</Text>
            <TextInput
              placeholder="請輸入您的電子郵件"
              value={username}
              onChangeText={setUsername}
              className="w-full border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">密碼</Text>
            <TextInput
              placeholder="請輸入您的密碼"
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
          {/* 登入按鈕 */}
          <TouchableOpacity
            onPress={onLoginPress}
            className="bg-blue-600 rounded-xl py-4 shadow-sm active:bg-blue-700"
          >
            <Text className="text-white text-center font-semibold text-lg">登入</Text>
          </TouchableOpacity>

          {/* 註冊按鈕 */}
          <TouchableOpacity
            onPress={onRegisterPress}
            className="bg-gray-100 border border-gray-200 rounded-xl py-4 active:bg-gray-200 mt-3"
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">建立新帳號</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}