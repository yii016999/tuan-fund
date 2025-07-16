import { COMMON, TRANSACTION } from '@/constants/string';
import { UI } from '@/constants/config';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';

interface MonthYearPickerProps {
  isVisible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minDate?: Date;
  maxDate?: Date;
  yearRange?: number; // 年份範圍，預設為3年
}

const { height: screenHeight } = Dimensions.get('window');

// 將常量提取到組件外部
const MONTH_LABELS = [
  '01月', '02月', '03月', '04月', '05月', '06月',
  '07月', '08月', '09月', '10月', '11月', '12月'
];

const MonthYearPicker = React.memo(({ 
  isVisible, 
  date, 
  onConfirm, 
  onCancel, 
  minDate, 
  maxDate, 
  yearRange = UI.DEFAULT_YEAR_RANGE  // 使用常數
}: MonthYearPickerProps) => {
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth() + 1);

  // 使用 useMemo 優化年份和月份選項的計算
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const halfRange = Math.floor(yearRange / 2);
    const startYear = currentYear - halfRange;
    const endYear = currentYear + halfRange;
    
    return Array.from({ length: yearRange }, (_, i) => startYear + i);
  }, [yearRange]);

  const months = useMemo(() => {
    return MONTH_LABELS.map((label, index) => ({
      value: index + 1,
      label
    }));
  }, []);

  // 檢查日期是否在有效範圍內
  const isDateValid = useCallback((year: number, month: number) => {
    const checkDate = new Date(year, month - 1, 1);
    
    if (minDate && checkDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      return false;
    }
    
    if (maxDate && checkDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
      return false;
    }
    
    return true;
  }, [minDate, maxDate]);

  // 當 date prop 改變時更新選擇
  useEffect(() => {
    setSelectedYear(date.getFullYear());
    setSelectedMonth(date.getMonth() + 1);
  }, [date]);

  const handleConfirm = useCallback(() => {
    if (!isDateValid(selectedYear, selectedMonth)) {
      return;
    }
    
    const newDate = new Date(selectedYear, selectedMonth - 1, 1);
    onConfirm(newDate);
  }, [selectedYear, selectedMonth, isDateValid, onConfirm]);

  const handleYearSelect = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    setSelectedMonth(month);
  }, []);

  const renderYearPicker = () => (
    <View className="flex-1">
      <Text className="text-center text-lg font-semibold text-gray-700 mb-4">
        {COMMON.YEARS}
      </Text>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel="年份選擇器"
      >
        {years.map((year) => {
          const isSelected = selectedYear === year;
          const isValidYear = months.some(month => isDateValid(year, month.value));
          
          return (
            <TouchableOpacity
              key={year}
              onPress={() => handleYearSelect(year)}
              disabled={!isValidYear}
              className={`py-3 px-4 mx-2 my-1 rounded-lg ${
                isSelected ? 'bg-blue-500' : 
                isValidYear ? 'bg-gray-100' : 'bg-gray-50'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${year}年`}
            >
              <Text className={`text-center text-lg ${
                isSelected ? 'text-white font-semibold' : 
                isValidYear ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {year}年
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderMonthPicker = () => (
    <View className="flex-1">
      <Text className="text-center text-lg font-semibold text-gray-700 mb-4">
        {COMMON.MONTH}
      </Text>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel="月份選擇器"
      >
        {months.map((month) => {
          const isSelected = selectedMonth === month.value;
          const isValidMonth = isDateValid(selectedYear, month.value);
          
          return (
            <TouchableOpacity
              key={month.value}
              onPress={() => handleMonthSelect(month.value)}
              disabled={!isValidMonth}
              className={`py-3 px-4 mx-2 my-1 rounded-lg ${
                isSelected ? 'bg-blue-500' : 
                isValidMonth ? 'bg-gray-100' : 'bg-gray-50'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={month.label}
            >
              <Text className={`text-center text-lg ${
                isSelected ? 'text-white font-semibold' : 
                isValidMonth ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {month.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const isConfirmDisabled = !isDateValid(selectedYear, selectedMonth);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View 
          className="bg-white rounded-xl mx-4 overflow-hidden"
          style={{ 
            maxHeight: screenHeight * UI.MODAL_MAX_HEIGHT_RATIO, 
            width: UI.MODAL_WIDTH 
          }}
        >
          {/* 標題欄 */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <TouchableOpacity 
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="取消"
            >
              <Text className="text-gray-600 text-lg">{COMMON.CANCEL}</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              {TRANSACTION.PREPAYMENT_CUSTOM_DATE}
            </Text>
            <TouchableOpacity 
              onPress={handleConfirm}
              disabled={isConfirmDisabled}
              accessibilityRole="button"
              accessibilityLabel="確認"
              accessibilityState={{ disabled: isConfirmDisabled }}
            >
              <Text className={`text-lg font-semibold ${
                isConfirmDisabled ? 'text-gray-400' : 'text-blue-600'
              }`}>
                {COMMON.CONFIRM}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 當前選擇顯示 */}
          <View className="p-4 bg-blue-50 border-b border-blue-200">
            <Text className="text-center text-lg font-semibold text-blue-800">
              已選擇：{selectedYear}年{selectedMonth.toString().padStart(2, '0')}月
            </Text>
          </View>

          {/* 選擇器區域 */}
          <View 
            className="flex-row"
            style={{ height: screenHeight * UI.PICKER_HEIGHT_RATIO }}
          >
            {renderYearPicker()}
            <View className="w-px bg-gray-200" />
            {renderMonthPicker()}
          </View>
        </View>
      </View>
    </Modal>
  );
});

MonthYearPicker.displayName = 'MonthYearPicker';

export default MonthYearPicker; 