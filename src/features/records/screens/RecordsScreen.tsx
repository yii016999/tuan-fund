import { COMMON, RECORD, RECORD_MESSAGES } from '@/constants/string'
import { RECORD_TAB_TYPES, RECORD_TRANSACTION_TYPES, RECORD_TYPES, RecordTabType } from '@/constants/types'
import RecordTab from '@/features/records/components/RecordTab'
import { useAuthStore } from '@/store/useAuthStore'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import RecordItem from '../components/RecordItem'
import RecordsEmptyState from '../components/RecordsEmptyState'
import { RecordListItem } from '../model/Record'
import { useRecordsViewModel } from '../viewmodel/useRecordsViewModel'

export default function RecordsScreen() {
    const { activeGroupId } = useAuthStore()
    const [refreshing, setRefreshing] = useState(false)

    // 如果沒有 activeGroupId，沒有選擇任何群組，顯示錯誤訊息
    if (!activeGroupId) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-red-500 text-lg">{RECORD_MESSAGES.NO_GROUP}</Text>
                <Text className="text-gray-500 mt-2">{RECORD_MESSAGES.NO_GROUP_SELECTED}</Text>
            </View>
        )
    }

    // 引入 useRecordsViewModel 來管理記錄相關邏輯
    const {
        loading,
        activeTab,
        setActiveTab,
        groupRecords,
        memberRecords,
        groupTransactions,
        dateRange,
        deleteRecord,
        refreshRecords,
    } = useRecordsViewModel(activeGroupId)

    // 下拉刷新事件
    const handleRefresh = async () => {
        setRefreshing(true)
        await refreshRecords()
        setRefreshing(false)
    }

    // 刪除記錄事件
    const handleDeleteRecord = (record: RecordListItem) => {
        Alert.alert(
            RECORD.DELETE_CONFIRM,
            RECORD_MESSAGES.DELETE_ALERT(record.title),
            [
                { text: RECORD.CANCEL, style: 'cancel' },
                {
                    text: RECORD.DELETE,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteRecord(record.id, record.type)
                            Alert.alert(RECORD.SUCCESS, RECORD_MESSAGES.DELETE_SUCCESS)
                        } catch (error) {
                            Alert.alert(RECORD.FAILURE, RECORD_MESSAGES.DELETE_FAILURE)
                        }
                    }
                }
            ]
        )
    }

    // 編輯記錄事件
    const handleEditRecord = () => {
        // TODO: 實現編輯功能
        Alert.alert('編輯功能', '編輯功能開發中...')
    }

    // 日期選擇事件
    const handleDateRangePress = () => {
        // TODO: 實現日期選擇器
        Alert.alert('日期選擇', '日期選擇功能開發中...')
    }

    // 格式化金額
    const formatAmount = (amount: number, type?: string) => {
        const sign = type === RECORD_TRANSACTION_TYPES.EXPENSE ? RECORD.EXPENSE_SIGN : RECORD.INCOME_SIGN
        const color = type === RECORD_TRANSACTION_TYPES.EXPENSE ? 'text-red-600' : 'text-green-600'
        return (
            <Text className={`font-semibold ${color}`}>
                {type && `${sign}`}${amount.toLocaleString()}
            </Text>
        )
    }

    // 格式化日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(COMMON.ZH_TW, {
            month: '2-digit',
            day: '2-digit',
        })
    }

    // 獲取交易類型(群組收支、個人繳費)
    const getTransactionType = (record: RecordListItem) => {
        if (record.type === RECORD_TYPES.GROUP_TRANSACTION) {
            const transaction = groupTransactions.find(t => t.id === record.id)
            return transaction?.type
        }
        return undefined
    }

    // 總結欄
    const renderSummary = () => {
        if (activeTab !== 'group') return null

        // 收入總額
        const incomeTotal = groupRecords
            .filter(r => groupTransactions.find(t => t.id === r.id)?.type === RECORD_TRANSACTION_TYPES.INCOME)
            .reduce((sum, r) => sum + r.amount, 0)

        // 支出總額
        const expenseTotal = groupRecords
            .filter(r => groupTransactions.find(t => t.id === r.id)?.type === RECORD_TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, r) => sum + r.amount, 0)

        return (
            <View className="flex-row space-x-4">
                <Text className="text-sm text-green-600">
                    {RECORD.INCOME} {incomeTotal.toLocaleString()}
                </Text>
                <Text className="text-sm text-red-600">
                    {RECORD.EXPENSE} {expenseTotal.toLocaleString()}
                </Text>
            </View>
        )
    }

    // 資料和配置
    const tabs: Array<{ key: RecordTabType; title: string }> = [
        { key: RECORD_TAB_TYPES.GROUP, title: RECORD.GROUP_RECORDS },
        { key: RECORD_TAB_TYPES.MEMBER, title: RECORD.MEMBER_RECORDS },
    ]

    // 目前顯示的記錄
    const currentRecords = activeTab === 'group' ? groupRecords : memberRecords

    return (
        <View className="flex-1 bg-gray-50">
            {/* 日期範圍選擇器 */}
            <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
                <TouchableOpacity
                    className="flex-row items-center justify-between"
                    onPress={handleDateRangePress}
                >
                    <View>
                        <Text className="text-sm text-gray-500 mb-1">{RECORD.DATE_RANGE}</Text>
                        <Text className="text-base text-gray-900">
                            {dateRange.startDate.toLocaleDateString(COMMON.ZH_TW)} - {dateRange.endDate.toLocaleDateString(COMMON.ZH_TW)}
                        </Text>
                    </View>
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Tab 切換 */}
            <View className="mt-4">
                <RecordTab
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabKey: string) => setActiveTab(tabKey as 'group' | 'member')}
                />
            </View>

            {/* 記錄列表 */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {loading && !refreshing ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-gray-500">{COMMON.LOADING}</Text>
                    </View>
                ) : currentRecords.length === 0 ? (
                    <RecordsEmptyState activeTab={activeTab} />
                ) : (
                    <View className="pb-4">
                        {/* 實際使用的記錄列表 */}
                        {currentRecords.map(record => (
                            <RecordItem
                                key={record.id}
                                record={record}
                                transactionType={getTransactionType(record)}
                                onEdit={handleEditRecord}
                                onDelete={handleDeleteRecord}
                                formatAmount={formatAmount}
                                formatDate={formatDate}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* 總結欄 */}
            {currentRecords.length > 0 && (
                <View className="bg-white px-4 py-3 border-t border-gray-200">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">
                            共 {currentRecords.length} 筆記錄
                        </Text>
                        {/* 總結欄 */}
                        {renderSummary()}
                    </View>
                </View>
            )}
        </View>
    )
}