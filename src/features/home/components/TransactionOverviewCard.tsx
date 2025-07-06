import React from 'react';
import { Text, View } from 'react-native';

interface Transaction {
    type: 'in' | 'out';
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
                        <Text className={`text-sm font-medium ${transaction.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'in' ? '+' : '-'}{transaction.amount.toLocaleString()}
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
            <Text className="text-lg font-bold text-gray-800 mb-3">收支總覽</Text>

            <View className="flex-1">
                {/* 收支統計 */}
                <View className="flex-row justify-between mb-6">
                    <View className="items-center">
                        <Text className="text-green-600 font-bold text-xl">+{props.monthlyIncome.toLocaleString()}</Text>
                        <Text className="text-gray-500 text-xs">本月收入</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-red-600 font-bold text-xl">-{props.monthlyExpense.toLocaleString()}</Text>
                        <Text className="text-gray-500 text-xs">本月支出</Text>
                    </View>
                </View>

                {/* 最近交易 */}
                {renderRecentTransactions()}
            </View>
        </View>
    );
} 