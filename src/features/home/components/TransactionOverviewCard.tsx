import { COMMON, TRANSACTION_OVERVIEW_CARD } from '@/constants/string';
import { RECORD_TRANSACTION_TYPES, RecordTransactionType } from '@/constants/types';
import React from 'react';
import { Text, View } from 'react-native';

interface Transaction {
    type: RecordTransactionType;
    amount: number;
    description: string;
}

interface TransactionOverviewCardProps {
    monthlyIncome: number;
    monthlyExpense: number;
    recentTransactions: Transaction[];
    minHeight: number;
}

export default function TransactionOverviewCard(props: TransactionOverviewCardProps) {
    // 最近交易渲染函數
    const renderRecentTransactions = () => (
        <View className="flex-1 justify-start">
            <View className="space-y-2">
                {props.recentTransactions.slice(0, 2).map((transaction, index) => (
                    <View key={index} className="flex-row justify-between items-center py-2">
                        <View className="flex-1 mr-2">
                            <Text className="text-sm text-gray-700" numberOfLines={1}>
                                {transaction.description}
                            </Text>
                        </View>
                        <Text className={`text-sm font-medium ${transaction.type === RECORD_TRANSACTION_TYPES.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === RECORD_TRANSACTION_TYPES.INCOME ? COMMON.INCOME_SIGN : COMMON.EXPENSE_SIGN}{transaction.amount.toLocaleString()}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <View
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1"
            style={{ minHeight: props.minHeight }}
        >
            <Text className="text-lg font-bold text-gray-800 mb-3">{TRANSACTION_OVERVIEW_CARD.TITLE}</Text>

            <View className="flex-1">
                {/* 收支統計 */}
                <View className="flex-row justify-between mb-6">
                    <View className="items-center">
                        <Text className="text-green-600 font-bold text-xl">{COMMON.INCOME_SIGN}{props.monthlyIncome.toLocaleString()}</Text>
                        <Text className="text-gray-500 text-xs">{TRANSACTION_OVERVIEW_CARD.MONTHLY_INCOME}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-red-600 font-bold text-xl">{COMMON.EXPENSE_SIGN}{props.monthlyExpense.toLocaleString()}</Text>
                        <Text className="text-gray-500 text-xs">{TRANSACTION_OVERVIEW_CARD.MONTHLY_EXPENSE}</Text>
                    </View>
                </View>

                {/* 最近交易 */}
                {renderRecentTransactions()}
            </View>
        </View>
    );
} 