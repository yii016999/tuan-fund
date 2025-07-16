import NoGroupSelected from '@/components/NoGroupSelected'
import { COMMON, RECORD } from '@/constants/string'
import { COLORS, STYLES } from '@/constants/config'
import { RECORD_TAB_TYPES, RECORD_TRANSACTION_TYPES, RECORD_TYPES, RecordTabType } from '@/constants/types'
import RecordTab from '@/features/records/components/RecordTab'
import { useAuthStore } from '@/store/useAuthStore'
import { Ionicons } from '@expo/vector-icons'
import React, { useState, useCallback, useMemo } from 'react'
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import DateRangeSelector from '../components/DateRangeSelector'
import RecordItem from '../components/RecordItem'
import RecordsEmptyState from '../components/RecordsEmptyState'
import { RecordListItem } from '../model/Record'
import { useRecordsViewModel } from '../viewmodel/useRecordsViewModel'

export default function RecordsScreen() {
    const { activeGroupId, joinedGroupIds } = useAuthStore()
    const [refreshing, setRefreshing] = useState(false)
    const [datePickerVisible, setDatePickerVisible] = useState(false)

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
        updateDateRange,
    } = useRecordsViewModel(activeGroupId || '')

    // 使用 useCallback 優化函數
    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        await refreshRecords()
        setRefreshing(false)
    }, [refreshRecords])

    const handleDeleteRecord = useCallback((record: RecordListItem) => {
        Alert.alert(
            RECORD.DELETE_CONFIRM,
            RECORD.DELETE_ALERT(record.title),
            [
                { text: RECORD.CANCEL, style: 'cancel' },
                {
                    text: RECORD.DELETE,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteRecord(record.id, record.type)
                            Alert.alert(RECORD.SUCCESS, RECORD.DELETE_SUCCESS)
                        } catch (error) {
                            Alert.alert(RECORD.FAILURE, RECORD.DELETE_FAILURE)
                        }
                    }
                }
            ]
        )
    }, [deleteRecord])

    const handleEditRecord = useCallback(() => {
        Alert.alert('編輯功能', '編輯功能開發中...')
    }, [])

    const handleDateRangePress = useCallback(() => {
        setDatePickerVisible(true)
    }, [])

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        updateDateRange(startDate, endDate)
        setDatePickerVisible(false)
    }, [updateDateRange])

    // 使用 useMemo 優化格式化函數
    const formatAmount = useCallback((amount: number, type?: string) => {
        const sign = type === RECORD_TRANSACTION_TYPES.EXPENSE ? COMMON.EXPENSE_SIGN : COMMON.INCOME_SIGN
        const color = type === RECORD_TRANSACTION_TYPES.EXPENSE ? COLORS.EXPENSE : COLORS.INCOME
        return (
            <Text style={{ fontWeight: '600', color }}>
                {type && `${sign}`}{amount.toLocaleString()}
            </Text>
        )
    }, [])

    const formatDate = useCallback((dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(COMMON.ZH_TW, {
            month: '2-digit',
            day: '2-digit',
        })
    }, [])

    const getTransactionType = useCallback((record: RecordListItem) => {
        if (record.type === RECORD_TYPES.GROUP_TRANSACTION) {
            const transaction = groupTransactions.find(t => t.id === record.id)
            return transaction?.type
        }
        return undefined
    }, [groupTransactions])

    // 使用 useMemo 優化計算
    const summaryData = useMemo(() => {
        if (activeTab !== RECORD_TAB_TYPES.GROUP) return null

        const incomeTotal = groupRecords
            .filter(r => groupTransactions.find(t => t.id === r.id)?.type === RECORD_TRANSACTION_TYPES.INCOME)
            .reduce((sum, r) => sum + r.amount, 0)

        const expenseTotal = groupRecords
            .filter(r => groupTransactions.find(t => t.id === r.id)?.type === RECORD_TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, r) => sum + r.amount, 0)

        return { incomeTotal, expenseTotal }
    }, [activeTab, groupRecords, groupTransactions])

    // 使用 useMemo 優化 tabs 配置
    const tabs = useMemo(() => [
        { key: RECORD_TAB_TYPES.GROUP, title: RECORD.GROUP_RECORDS },
        { key: RECORD_TAB_TYPES.MEMBER, title: RECORD.MEMBER_RECORDS },
    ], [])

    const currentRecords = useMemo(() => 
        activeTab === RECORD_TAB_TYPES.GROUP ? groupRecords : memberRecords
    , [activeTab, groupRecords, memberRecords])

    // 如果沒有選擇群組
    if (!activeGroupId) {
        return <NoGroupSelected joinedGroupIds={joinedGroupIds} />
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
                <TouchableOpacity
                    className="flex-row items-center justify-between"
                    onPress={handleDateRangePress}
                    activeOpacity={0.7}
                >
                    <View className="flex-1">
                        <Text className="text-sm text-gray-500 mb-1">{RECORD.DATE_RANGE}</Text>
                        <Text className="text-base text-gray-900">
                            {dateRange.startDate.toLocaleDateString(COMMON.ZH_TW)} - {dateRange.endDate.toLocaleDateString(COMMON.ZH_TW)}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            點擊此處可更改查詢範圍
                        </Text>
                    </View>
                    <Ionicons name="calendar" size={20} color={COLORS.GRAY[500]} />
                </TouchableOpacity>
            </View>

            <View className="mt-4">
                <RecordTab
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabKey: string) => setActiveTab(tabKey as RecordTabType)}
                />
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading && !refreshing ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-gray-500">{COMMON.LOADING}</Text>
                    </View>
                ) : currentRecords.length === 0 ? (
                    <RecordsEmptyState activeTab={activeTab} />
                ) : (
                    <View style={{ paddingBottom: STYLES.SPACING.MD }}>
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

            {currentRecords.length > 0 && (
                <View className="bg-white px-4 py-3 border-t border-gray-200">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">
                            {RECORD.RECORDS_COUNT} {currentRecords.length} {RECORD.RECORDS_COUNT_INFO}
                        </Text>
                        {summaryData && (
                            <View className="flex-row space-x-4">
                                <Text style={{ fontSize: 14, color: COLORS.INCOME }}>
                                    {RECORD.INCOME} {summaryData.incomeTotal.toLocaleString()}
                                </Text>
                                <Text style={{ fontSize: 14, color: COLORS.EXPENSE }}>
                                    {RECORD.EXPENSE} {summaryData.expenseTotal.toLocaleString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            <DateRangeSelector
                visible={datePickerVisible}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateRangeChange={handleDateRangeChange}
                onClose={() => setDatePickerVisible(false)}
            />
        </View>
    )
}