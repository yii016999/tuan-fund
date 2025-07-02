import React, { useRef } from "react"
import { ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native"
import { Calendar } from 'react-native-calendars'
import { useAddViewModel } from '../viewModel/useAddViewModel'

export default function AddScreen() {
    const amountInputRef = useRef<TextInput>(null)
    const viewModel = useAddViewModel()

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
                    收入或支出
                </Text>
            </View>
            <View className="mb-8">
                <View className="flex-row border-2 border-gray-300 rounded-lg overflow-hidden">
                    <TouchableOpacity
                        className={viewModel.expenseButtonStyle}
                        onPress={viewModel.handleExpensePress}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-lg font-medium text-center ${viewModel.activeTab === 'expense' ? 'text-white' : 'text-gray-700'
                            }`}>
                            支出
                        </Text>
                    </TouchableOpacity>

                    <View className="w-px bg-gray-300" />

                    <TouchableOpacity
                        className={viewModel.incomeButtonStyle}
                        onPress={viewModel.handleIncomePress}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-lg font-medium text-center ${viewModel.activeTab === 'income' ? 'text-white' : 'text-gray-700'
                            }`}>
                            收入
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 類型標籤 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">
                    項目標題
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
                    placeholder="ex.某某款項..."
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* 金額標籤和輸入 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">金額</Text>
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
                        $
                    </Text>
                </View>
            </View>

            {/* 備註標籤 */}
            <View className="mb-2">
                <Text className="text-gray-500 text-sm mb-1">
                    備註 (選填)
                </Text>
            </View>

            {/* 備註輸入 */}
            <View className="mb-6">
                <TextInput
                    className="py-4 px-4 border-2 rounded-lg bg-white text-lg border-gray-300"
                    style={{ height: 88 }} // 固定高度 (約三行文字 + padding)
                    value={viewModel.description}
                    onChangeText={viewModel.setDescription}
                    placeholder="輸入備註"
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
                        {viewModel.activeTab === 'income' ? '新增收入' : '新增支出'}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    )
}