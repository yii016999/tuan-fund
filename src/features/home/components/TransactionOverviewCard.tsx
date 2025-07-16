import { COMMON, TRANSACTION_OVERVIEW_CARD } from '@/constants/string';
import { RECORD_TRANSACTION_TYPES } from '@/constants/types';
import { Transaction } from '@/features/home/model/Home';
import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { COLORS, STYLES, UI } from '@/constants/config';

interface TransactionOverviewCardProps {
    monthlyIncome: number;
    monthlyExpense: number;
    recentTransactions: Transaction[];
    createdBy: string;
    minHeight: number;
}

const TransactionOverviewCard = React.memo<TransactionOverviewCardProps>(({
    monthlyIncome,
    monthlyExpense,
    recentTransactions,
    createdBy,
    minHeight
}) => {
    // 使用 useMemo 優化最近交易限制
    const displayTransactions = useMemo(() => 
        recentTransactions.slice(0, UI.HOME.RECENT_TRANSACTIONS_LIMIT),
        [recentTransactions]
    )

    // 使用 useCallback 優化渲染函數
    const renderTransactionItem = useCallback((transaction: Transaction, index: number) => (
        <View 
            key={index} 
            className="flex-row justify-between items-center"
            style={{ paddingVertical: STYLES.HOME.TRANSACTION_ITEM_PADDING }}
        >
            <View className="flex-1 mr-2">
                <Text className="text-sm text-gray-700" numberOfLines={1}>
                    <Text className="font-medium text-gray-800">{createdBy}</Text>
                    <Text className="text-gray-500">：</Text>
                    <Text>{transaction.description}</Text>
                </Text>
            </View>
            <Text 
                className="text-sm font-medium"
                style={{
                    color: transaction.type === RECORD_TRANSACTION_TYPES.INCOME 
                        ? COLORS.INCOME 
                        : COLORS.EXPENSE
                }}
            >
                {transaction.type === RECORD_TRANSACTION_TYPES.INCOME ? COMMON.INCOME_SIGN : COMMON.EXPENSE_SIGN}
                {transaction.amount.toLocaleString()}
            </Text>
        </View>
    ), [createdBy])

    // 最近交易渲染函數
    const renderRecentTransactions = useCallback(() => (
        <View className="flex-1 justify-start">
            {displayTransactions.length > 0 ? (
                <View style={{ gap: STYLES.SPACING.XS }}>
                    {displayTransactions.map(renderTransactionItem)}
                </View>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 text-sm">沒有資料</Text>
                </View>
            )}
        </View>
    ), [displayTransactions, renderTransactionItem])

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
            <Text className="text-lg font-bold text-gray-800 mb-3">
                {TRANSACTION_OVERVIEW_CARD.TITLE}
            </Text>

            <View className="flex-1">
                {/* 收支統計 */}
                <View 
                    className="flex-row justify-between mb-6"
                    style={{ marginBottom: STYLES.SPACING.LG }}
                >
                    <View className="items-center">
                        <Text 
                            className="font-bold text-xl"
                            style={{ color: COLORS.INCOME }}
                        >
                            {COMMON.INCOME_SIGN}{monthlyIncome.toLocaleString()}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                            {TRANSACTION_OVERVIEW_CARD.MONTHLY_INCOME}
                        </Text>
                    </View>
                    <View className="items-center">
                        <Text 
                            className="font-bold text-xl"
                            style={{ color: COLORS.EXPENSE }}
                        >
                            {COMMON.EXPENSE_SIGN}{monthlyExpense.toLocaleString()}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                            {TRANSACTION_OVERVIEW_CARD.MONTHLY_EXPENSE}
                        </Text>
                    </View>
                </View>

                {/* 最近交易 */}
                {renderRecentTransactions()}
            </View>
        </View>
    )
})

TransactionOverviewCard.displayName = 'TransactionOverviewCard'

export default TransactionOverviewCard 