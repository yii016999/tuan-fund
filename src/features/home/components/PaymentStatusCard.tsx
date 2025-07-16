import { COMMON, PAYMENT_STATUS_CARD } from '@/constants/string'
import { COLORS, STYLES, UI } from '@/constants/config'
import React from 'react'
import { Text, View } from 'react-native'

interface PaymentStatusCardProps {
    isPaid: boolean
    amount: number
    period: string
    minHeight: number
}

const PaymentStatusCard = React.memo<PaymentStatusCardProps>(({
    isPaid,
    amount,
    period,
    minHeight
}) => {
    return (
        <View
            className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1"
            style={{ 
                minHeight,
                padding: STYLES.HOME.CARD_PADDING,
                borderRadius: STYLES.HOME.CARD_BORDER_RADIUS,
                backgroundColor: COLORS.HOME.CARD_BACKGROUND,
                borderColor: COLORS.HOME.CARD_BORDER,
                ...STYLES.SHADOW,
            }}
        >
            <Text className="text-lg font-bold text-gray-800 mb-2">
                {PAYMENT_STATUS_CARD.TITLE}
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
                {period}
            </Text>

            <View className="flex-1 justify-center items-center">
                {/* 狀態圖示 */}
                <View 
                    className="rounded-full items-center justify-center mb-4"
                    style={{
                        width: STYLES.HOME.BALANCE_ICON_SIZE,
                        height: STYLES.HOME.BALANCE_ICON_SIZE,
                        backgroundColor: isPaid 
                            ? COLORS.HOME.PAYMENT_STATUS_PAID + '20' 
                            : COLORS.HOME.PAYMENT_STATUS_UNPAID + '20',
                    }}
                >
                    <Text className="text-xl">
                        {isPaid ? COMMON.OK_SIGN : COMMON.NOT_OK_SIGN}
                    </Text>
                </View>

                {/* 繳費資訊 */}
                <View className="items-center">
                    <Text 
                        className="font-semibold text-base"
                        style={{
                            color: isPaid 
                                ? COLORS.HOME.PAYMENT_STATUS_PAID 
                                : COLORS.HOME.PAYMENT_STATUS_UNPAID
                        }}
                    >
                        {isPaid ? PAYMENT_STATUS_CARD.PAID : PAYMENT_STATUS_CARD.UNPAID}
                    </Text>
                    {isPaid ? (
                        <Text className="text-gray-800 font-bold text-lg mt-2">
                            {COMMON.MONEY_SIGN} {amount.toLocaleString()}
                        </Text>
                    ) : (
                        <Text className="text-gray-500 text-sm mt-2">
                            尚未繳費
                        </Text>
                    )}
                </View>
            </View>
        </View>
    )
})

PaymentStatusCard.displayName = 'PaymentStatusCard'

export default PaymentStatusCard 