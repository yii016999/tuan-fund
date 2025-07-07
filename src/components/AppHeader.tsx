import { HeaderBackType } from "@/constants/types"
import { useNavigation } from "@react-navigation/native"
import { ChevronLeft, X } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'


interface AppHeaderProps {
    showBack?: boolean          // 是否顯示左側返回按鈕
    backType?: HeaderBackType   // 返回按鈕樣式：箭頭或叉叉
    title?: string              // 中間顯示的標題文字
    isBorder?: boolean          // 是否顯示下邊框
    rightSlot?: React.ReactNode // 自定義右側插槽（例如：頭像、設定按鈕）
    leftSlot?: React.ReactNode  // 自定義左側插槽（若未顯示返回按鈕時使用）
}

export const AppHeader = (props: AppHeaderProps) => {
    const navigation = useNavigation()
    // 用來抓取安全區域的邊距
    const insets = useSafeAreaInsets()


    return (
        <View className={`h-24 bg-white px-4 flex flex-row items-center justify-between ${props.isBorder ? 'border-b border-gray-200' : ''}`} style={{ paddingTop: insets.top }}>
            {/* 左側區域：顯示返回按鈕或自定義插槽 */}
            <View className="w-16">
                {props.showBack ? (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        {props.backType === 'arrow' ? <ChevronLeft size={24} /> : <X size={24} />}
                    </TouchableOpacity>
                ) : (
                    props.leftSlot ?? null
                )}
            </View>

            {/* 中間標題文字 */}
            <Text className="text-base font-semibold">{props.title}</Text>

            {/* 右側插槽（例如：設定按鈕、頭像） */}
            <View className="w-16 items-end">{props.rightSlot}</View>
        </View>
    )
}