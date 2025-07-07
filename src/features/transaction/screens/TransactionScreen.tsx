import NoGroupSelected from '@/components/NoGroupSelected'
import { COMMON, TRANSACTION } from '@/constants/string'
import { useAuthStore } from '@/store/useAuthStore'
import React, { useRef } from "react"
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Calendar } from 'react-native-calendars'
import { useAddViewModel } from '../viewmodel/useTransactionViewModel'
import { RECORD_TRANSACTION_TYPES } from '@/constants/types'

export default function AddScreen() {
    // 檢查是否有選擇群組
    const { user, activeGroupId, joinedGroupIds } = useAuthStore()
    const currentGroupId = activeGroupId || ''

    const amountInputRef = useRef<TextInput>(null)
    const viewModel = useAddViewModel()

    // 如果沒有選擇群組
    if (!currentGroupId) {
        return <NoGroupSelected joinedGroupIds={joinedGroupIds} />
    }

    // 如果還在載入角色資訊
    if (viewModel.roleLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        )
    }

    return (
        <ScrollView
            className="flex-1 bg-white px-4 py-6"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* 嵌入式日曆 */}
            <View className="mb-6 rounded-lg overflow-hidden shadow-lg bg-white">
                <Calendar
                    current={viewModel.selectedDate}
                    onDayPress={viewModel.handleDateSelect}
                    markedDates={viewModel.markedDates}
                />
            </View>

            {/* 收入支出選擇 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">
                    {TRANSACTION.INCOME_OR_EXPENSE}
                </Text>
            </View>
            <View className="mb-8">
                {viewModel.isAdmin ? (
                    // 管理員可以看到收入和支出選項
                    <View className="flex-row border-2 border-gray-300 rounded-lg overflow-hidden">
                        <TouchableOpacity
                            className={viewModel.expenseButtonStyle}
                            onPress={viewModel.handleExpensePress}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-lg font-medium text-center ${viewModel.activeTab === RECORD_TRANSACTION_TYPES.EXPENSE ? 'text-white' : 'text-gray-700'
                                }`}>
                                {TRANSACTION.EXPENSE}
                            </Text>
                        </TouchableOpacity>

                        <View className="w-px bg-gray-300" />

                        <TouchableOpacity
                            className={viewModel.incomeButtonStyle}
                            onPress={viewModel.handleIncomePress}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-lg font-medium text-center ${viewModel.activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'text-white' : 'text-gray-700'
                                }`}>
                                {TRANSACTION.INCOME}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // 一般成員只能看到收入選項
                    <View className="border-2 border-gray-300 rounded-lg overflow-hidden">
                        <TouchableOpacity
                            className="py-4 px-4 bg-emerald-400"
                            onPress={viewModel.handleIncomePress}
                            activeOpacity={0.7}
                        >
                            <Text className="text-lg font-medium text-center text-white">
                                {TRANSACTION.INCOME}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* 類型標籤 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">
                    {TRANSACTION.ITEM_TITLE}
                </Text>
            </View>

            {/*標題輸入 */}
            <View className="mb-6">
                <TextInput
                    className={viewModel.titleInputStyle}
                    value={viewModel.title}
                    onChangeText={viewModel.setTitle}
                    onFocus={viewModel.handleTitleFocus}
                    onBlur={viewModel.handleTitleBlur}
                    placeholder={TRANSACTION.ITEM_TITLE_PLACEHOLDER}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* 金額標籤和輸入 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">{TRANSACTION.AMOUNT}</Text>
            </View>
            <View className="mb-6">
                <View className="relative">
                    <TextInput
                        ref={amountInputRef}
                        className={viewModel.amountInputStyle}
                        value={viewModel.amount}
                        onChangeText={viewModel.handleAmountChange}
                        onFocus={viewModel.handleAmountFocus}
                        onBlur={viewModel.handleAmountBlur}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                    />
                    <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-600">
                        {COMMON.MONEY_SIGN}
                    </Text>
                </View>
            </View>

            {/* 備註標籤 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">
                    {TRANSACTION.DESCRIPTION}
                </Text>
            </View>

            {/* 備註輸入 */}
            <View className="mb-6">
                <TextInput
                    className="py-4 px-4 border-2 rounded-lg bg-white text-lg border-gray-300"
                    style={{ height: 88 }} // 固定高度 (約三行文字 + padding)
                    value={viewModel.description}
                    onChangeText={viewModel.setDescription}
                    placeholder={TRANSACTION.DESCRIPTION_PLACEHOLDER}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            {/* 提交按鈕 */}
            <TouchableOpacity
                className={viewModel.submitButtonStyle}
                onPress={viewModel.handleSubmit}
                activeOpacity={0.8}
                disabled={viewModel.isLoading}
            >
                {viewModel.isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-medium text-center">
                        {viewModel.activeTab === RECORD_TRANSACTION_TYPES.INCOME ? TRANSACTION.ADD_INCOME : TRANSACTION.ADD_EXPENSE}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    )
}