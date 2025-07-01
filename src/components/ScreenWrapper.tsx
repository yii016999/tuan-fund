import { ReactNode } from 'react'
import { StatusBar, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ScreenWrapperProps {
    safeAreaClassName?: string
    children: ReactNode
}

// 包裝 SafeAreaView，讓所有頁面都使用 SafeAreaView，避免在不同平台有不同的 paddingTop
export default function ScreenWrapper(props: ScreenWrapperProps) {
    return (
        <View className="flex-1">
            <StatusBar hidden={true} />
            <SafeAreaView className={`flex-1 ${props.safeAreaClassName}`}>
                {props.children}
            </SafeAreaView>
        </View>
    )
}