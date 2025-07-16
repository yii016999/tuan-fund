import NoGroupSelected from '@/components/NoGroupSelected'
import { COMMON, TRANSACTION } from '@/constants/string'
import { UI } from '@/constants/config'
import { useAuthStore } from '@/store/useAuthStore'
import React, { useRef } from "react"
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Calendar } from 'react-native-calendars'
import { useAddViewModel } from '../viewmodel/useTransactionViewModel'
import { RecordTransactionType, PrepaymentStartType, RECORD_TRANSACTION_TYPES, PREPAYMENT_START_TYPES } from '@/constants/types'
import MonthYearPicker from '../components/MonthYearPicker'
import { RefObject } from 'react'

// Add type definitions
interface TransactionTypeSelectorProps {
  activeTab: RecordTransactionType
  isAdmin: boolean
  onExpensePress: () => void
  onIncomePress: () => void
}

interface TransactionFormProps {
  title: string
  amount: string
  description: string
  titleInputStyle: string
  amountInputStyle: string
  onTitleChange: (text: string) => void
  onAmountChange: (text: string) => void
  onDescriptionChange: (text: string) => void
  onTitleFocus: () => void
  onTitleBlur: () => void
  onAmountFocus: () => void
  onAmountBlur: () => void
  amountInputRef: RefObject<TextInput | null>
}

interface PrepaymentOptionsProps {
  activeTab: RecordTransactionType
  allowPrepayment: boolean
  isPrepayment: boolean
  setIsPrepayment: (value: boolean) => void
  prepaymentMonths: number
  prepaymentStartType: PrepaymentStartType
  setPrepaymentStartType: (type: PrepaymentStartType) => void
  prepaymentCustomDate: string
  onShowCustomDatePicker: () => void
  formatDisplayDate: (date: string) => string
}

interface SubmitButtonProps {
  onPress: () => void
  isLoading: boolean
  submitButtonStyle: string
  activeTab: RecordTransactionType
}

// 交易類型選擇器組件
const TransactionTypeSelector = ({ activeTab, isAdmin, onExpensePress, onIncomePress }: TransactionTypeSelectorProps) => {
  if (isAdmin) {
    return (
      <View className="flex-row border-2 border-gray-300 rounded-lg overflow-hidden">
        <TouchableOpacity
          className={`flex-1 py-4 px-4 ${activeTab === RECORD_TRANSACTION_TYPES.EXPENSE ? 'bg-red-400' : 'bg-white'}`}
          onPress={onExpensePress}
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-medium text-center ${activeTab === RECORD_TRANSACTION_TYPES.EXPENSE ? 'text-white' : 'text-gray-700'}`}>
            {TRANSACTION.EXPENSE}
          </Text>
        </TouchableOpacity>

        <View className="w-px bg-gray-300" />

        <TouchableOpacity
          className={`flex-1 py-4 px-4 ${activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'bg-emerald-400' : 'bg-white'}`}
          onPress={onIncomePress}
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-medium text-center ${activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'text-white' : 'text-gray-700'}`}>
            {TRANSACTION.INCOME}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="border-2 border-gray-300 rounded-lg overflow-hidden">
      <TouchableOpacity
        className="py-4 px-4 bg-emerald-400"
        onPress={onIncomePress}
        activeOpacity={0.7}
      >
        <Text className="text-lg font-medium text-center text-white">
          {TRANSACTION.INCOME}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// 表單輸入組件
const TransactionForm = ({ 
  title, 
  amount, 
  description, 
  titleInputStyle, 
  amountInputStyle,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onTitleFocus,
  onTitleBlur,
  onAmountFocus,
  onAmountBlur,
  amountInputRef
}: TransactionFormProps) => {
  return (
    <>
      {/* 項目標題 */}
      <View className="mb-2">
        <Text className="text-gray-500 text-sm mb-1">
          {TRANSACTION.ITEM_TITLE}
        </Text>
      </View>
      <View className="mb-6">
        <TextInput
          className={titleInputStyle}
          value={title}
          onChangeText={onTitleChange}
          onFocus={onTitleFocus}
          onBlur={onTitleBlur}
          placeholder={TRANSACTION.ITEM_TITLE_PLACEHOLDER}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* 金額輸入 */}
      <View className="mb-2">
        <Text className="text-gray-500 text-sm mb-1">{TRANSACTION.AMOUNT}</Text>
      </View>
      <View className="mb-6">
        <View className="relative">
          <TextInput
            ref={amountInputRef}
            className={amountInputStyle}
            value={amount}
            onChangeText={onAmountChange}
            onFocus={onAmountFocus}
            onBlur={onAmountBlur}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />
          <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-600">
            {COMMON.MONEY_SIGN}
          </Text>
        </View>
      </View>

      {/* 備註輸入 */}
      <View className="mb-2">
        <Text className="text-gray-500 text-sm mb-1">
          {TRANSACTION.DESCRIPTION}
        </Text>
      </View>
      <View className="mb-6">
        <TextInput
          className="py-4 px-4 border-2 rounded-lg bg-white text-lg border-gray-300"
          style={{ height: UI.DESCRIPTION_INPUT_HEIGHT }}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder={TRANSACTION.DESCRIPTION_PLACEHOLDER}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </>
  )
}

// 預繳選項組件
const PrepaymentOptions = ({ 
  activeTab, 
  allowPrepayment, 
  isPrepayment, 
  setIsPrepayment, 
  prepaymentMonths,
  prepaymentStartType,
  setPrepaymentStartType,
  prepaymentCustomDate,
  onShowCustomDatePicker,
  formatDisplayDate 
}: PrepaymentOptionsProps) => {
  if (activeTab !== RECORD_TRANSACTION_TYPES.INCOME || !allowPrepayment) {
    return null
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <View className="flex-1">
          <Text className="font-medium text-blue-800 mb-1">預繳功能</Text>
          <Text className="text-sm text-blue-600">
            {isPrepayment 
              ? `可預繳 ${prepaymentMonths} 個月`
              : '勾選後溢出金額將自動預繳未來月份'
            }
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsPrepayment(!isPrepayment)}
          className={`w-12 h-6 rounded-full ${isPrepayment ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <View
            className={`w-5 h-5 bg-white rounded-full mt-0.5 ${isPrepayment ? 'ml-6' : 'ml-0.5'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        </TouchableOpacity>
      </View>

      {/* 預繳開始時間選擇 */}
      {isPrepayment && (
        <View className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="font-medium text-blue-800 mb-3">{TRANSACTION.PREPAYMENT_START_TIME}</Text>
          
          <View className="space-y-2">
            {[
              { type: PREPAYMENT_START_TYPES.PREVIOUS, label: TRANSACTION.PREPAYMENT_START_PREVIOUS },
              { type: PREPAYMENT_START_TYPES.CURRENT, label: TRANSACTION.PREPAYMENT_START_CURRENT },
              { type: PREPAYMENT_START_TYPES.CUSTOM, label: TRANSACTION.PREPAYMENT_START_CUSTOM },
            ].map((option) => (
              <TouchableOpacity
                key={option.type}
                onPress={() => setPrepaymentStartType(option.type)}
                className="flex-row items-center justify-between py-2"
              >
                <Text className="text-blue-700">{option.label}</Text>
                <View className={`w-5 h-5 rounded-full border-2 ${prepaymentStartType === option.type ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                  {prepaymentStartType === option.type && (
                    <View className="w-2 h-2 bg-white rounded-full mt-0.5 ml-0.5" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 自訂日期選擇 */}
          {prepaymentStartType === PREPAYMENT_START_TYPES.CUSTOM && (
            <View className="mt-3">
              <Text className="text-sm text-blue-600 mb-2">{TRANSACTION.PREPAYMENT_CUSTOM_DATE}</Text>
              <TouchableOpacity
                onPress={onShowCustomDatePicker}
                className="py-3 px-4 bg-white border border-blue-300 rounded-lg flex-row items-center justify-between"
              >
                <Text className={`${prepaymentCustomDate ? 'text-blue-800' : 'text-gray-400'}`}>
                  {prepaymentCustomDate 
                    ? formatDisplayDate(prepaymentCustomDate)
                    : TRANSACTION.PREPAYMENT_CUSTOM_DATE_PLACEHOLDER
                  }
                </Text>
                <Text className="text-blue-500 text-lg">📅</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// 提交按鈕組件
const SubmitButton = ({ onPress, isLoading, submitButtonStyle, activeTab }: SubmitButtonProps) => {
  return (
    <TouchableOpacity
      className={submitButtonStyle}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-lg font-medium text-center">
          {activeTab === RECORD_TRANSACTION_TYPES.INCOME ? TRANSACTION.ADD_INCOME : TRANSACTION.ADD_EXPENSE}
        </Text>
      )}
    </TouchableOpacity>
  )
}

// 主要組件
export default function TransactionScreen() {
  const { user, activeGroupId, joinedGroupIds } = useAuthStore()
  const currentGroupId = activeGroupId || ''
  const amountInputRef = useRef<TextInput>(null)
  const viewModel = useAddViewModel()

  // 格式化顯示年月
  const formatDisplayDate = (yyyymm: string) => {
    if (yyyymm.length !== 6) return ''
    const year = yyyymm.substring(0, 4)
    const month = yyyymm.substring(4, 6)
    return `${year}年${month}月`
  }

  // 取得當前選擇的日期對象（用於日期選擇器）
  const getCurrentPickerDate = () => {
    if (viewModel.prepaymentCustomDate) {
      const year = parseInt(viewModel.prepaymentCustomDate.substring(0, 4))
      const month = parseInt(viewModel.prepaymentCustomDate.substring(4, 6)) - 1
      return new Date(year, month, 1)
    }
    return new Date()
  }

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
      contentContainerStyle={{ paddingBottom: UI.SCROLL_PADDING_BOTTOM }}
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
        <TransactionTypeSelector
          activeTab={viewModel.activeTab}
          isAdmin={viewModel.isAdmin}
          onExpensePress={viewModel.handleExpensePress}
          onIncomePress={viewModel.handleIncomePress}
        />
      </View>

      {/* 表單輸入 */}
      <TransactionForm
        title={viewModel.title}
        amount={viewModel.amount}
        description={viewModel.description}
        titleInputStyle={viewModel.titleInputStyle}
        amountInputStyle={viewModel.amountInputStyle}
        onTitleChange={viewModel.setTitle}
        onAmountChange={viewModel.handleAmountChange}
        onDescriptionChange={viewModel.setDescription}
        onTitleFocus={viewModel.handleTitleFocus}
        onTitleBlur={viewModel.handleTitleBlur}
        onAmountFocus={viewModel.handleAmountFocus}
        onAmountBlur={viewModel.handleAmountBlur}
        amountInputRef={amountInputRef}
      />

      {/* 預繳選項 */}
      <PrepaymentOptions
        activeTab={viewModel.activeTab}
        allowPrepayment={viewModel.allowPrepayment}
        isPrepayment={viewModel.isPrepayment}
        setIsPrepayment={viewModel.setIsPrepayment}
        prepaymentMonths={viewModel.prepaymentMonths}
        prepaymentStartType={viewModel.prepaymentStartType}
        setPrepaymentStartType={viewModel.setPrepaymentStartType}
        prepaymentCustomDate={viewModel.prepaymentCustomDate}
        onShowCustomDatePicker={viewModel.showCustomDatePicker}
        formatDisplayDate={formatDisplayDate}
      />

      {/* 提交按鈕 */}
      <SubmitButton
        onPress={viewModel.handleSubmit}
        isLoading={viewModel.isLoading}
        submitButtonStyle={viewModel.submitButtonStyle}
        activeTab={viewModel.activeTab}
      />

      {/* 年月份選擇器 */}
      <MonthYearPicker
        isVisible={viewModel.showDatePicker}
        date={getCurrentPickerDate()}
        onConfirm={viewModel.handleDatePickerConfirm}
        onCancel={viewModel.handleDatePickerCancel}
      />
    </ScrollView>
  )
}