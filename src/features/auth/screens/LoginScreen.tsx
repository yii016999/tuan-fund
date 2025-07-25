import { AUTH_ROUTES } from '@/constants/routes';
import { LOGIN } from '@/constants/string';
import { useLoginViewModel } from "@/features/auth/viewmodel/useLoginViewModel";
import { AuthParamList, RootStackParamList } from '@/navigation/types';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  } = useLoginViewModel()

  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // 提取重複的輸入框樣式
  const inputStyle = "w-full border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white"
  const buttonPrimaryStyle = "bg-blue-600 rounded-xl py-4 shadow-sm active:bg-blue-700"
  const buttonSecondaryStyle = "bg-gray-100 border border-gray-200 rounded-xl py-4 active:bg-gray-200 mt-3"

  // 提取錯誤顯示邏輯
  const ErrorDisplay = ({ error }: { error: string }) => (
    error ? (
      <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
        <Text className="text-red-600 text-sm text-center">{error}</Text>
      </View>
    ) : null
  )

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{
        flexGrow: 1,
        // 在沒有鍵盤時置中
        ...(keyboardHeight === 0 ? { justifyContent: 'center' } : {}),
        paddingHorizontal: 24,
        paddingTop: keyboardHeight > 0 ? 60 : 40,
        paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 40
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 主要容器 */}
      <View className="bg-white rounded-2xl shadow-lg p-8 mx-2">
        {/* 標題 */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">{LOGIN.WELCOME}</Text>
          <Text className="text-gray-500 text-base">{LOGIN.WELCOME_MESSAGE}</Text>
        </View>

        {/* 輸入框區域 */}
        <View className="mb-6">
          <View>
            <Text className="text-gray-700 text-sm font-medium mb-2">{LOGIN.USERNAME}</Text>
            <TextInput
              placeholder={LOGIN.USERNAME_PLACEHOLDER}
              value={username}
              editable={!isLoading}
              onChangeText={setUsername}
              className={inputStyle}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">{LOGIN.PASSWORD}</Text>
            <TextInput
              placeholder={LOGIN.PASSWORD_PLACEHOLDER}
              value={password}
              editable={!isLoading}
              onChangeText={setPassword}
              className={inputStyle}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* 錯誤訊息 */}
        <ErrorDisplay error={error} />

        {/* 按鈕區域 */}
        <View>
          {/* 登入按鈕 */}
          <TouchableOpacity
            onPress={onLoginPress}
            className={buttonPrimaryStyle}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">{LOGIN.LOGIN}</Text>
          </TouchableOpacity>

          {/* 註冊按鈕 */}
          <TouchableOpacity
            onPress={onRegisterPress}
            className={buttonSecondaryStyle}
            disabled={isLoading}
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">{LOGIN.CREATE_ACCOUNT}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}