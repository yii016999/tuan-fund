import { COMMON, PAYMENT_STATUS_CARD } from '@/constants/string';
import React from 'react';
import { Text, View } from 'react-native';

interface PaymentStatusCardProps {
    isPaid: boolean;
    amount: number;
    period: string;
    minHeight: number;
}

// 繳費狀態卡片
export default function PaymentStatusCard(props: PaymentStatusCardProps) {
    return (
        <View
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1"
            style={{ minHeight: props.minHeight }}
        >
            <Text className="text-lg font-bold text-gray-800 mb-6">{PAYMENT_STATUS_CARD.TITLE}</Text>

            <View className="flex-1 justify-start items-center pt-4">
                {/* 狀態圖示 */}
                <View className={`w-16 h-16 ${props.isPaid ? 'bg-green-100' : 'bg-red-100'} rounded-full items-center justify-center mb-6`}>
                    <Text className="text-xl">{props.isPaid ? COMMON.OK_SIGN : COMMON.NOT_OK_SIGN}</Text>
                </View>

                {/* 繳費資訊 */}
                <View className="items-center">
                    <Text className={`font-semibold text-base ${props.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {props.isPaid ? PAYMENT_STATUS_CARD.PAID : PAYMENT_STATUS_CARD.UNPAID}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">{props.period}</Text>
                    <Text className="text-gray-800 font-bold text-lg mt-2">{COMMON.MONEY_SIGN} {props.amount.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
} 