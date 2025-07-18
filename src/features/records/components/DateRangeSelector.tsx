import { COLORS, UI } from '@/constants/config';
import { COMMON } from '@/constants/string';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  visible: boolean;
  onClose: () => void;
}

interface MarkedDate {
  selected?: boolean;
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  marked?: boolean;
  dotColor?: string;
}

// 使用常數替代硬編碼
const CALENDAR_STYLES = {
  // 日曆主題
  theme: {
    todayTextColor: COLORS.CALENDAR.TODAY,
    arrowColor: COLORS.PRIMARY,
    monthTextColor: COLORS.GRAY[800],
    indicatorColor: COLORS.PRIMARY,
    textDayFontWeight: '500' as const,
    textMonthFontWeight: '600' as const,
    textDayHeaderFontWeight: '500' as const,
    selectedDayBackgroundColor: COLORS.PRIMARY,
    selectedDayTextColor: '#FFFFFF',
    disabledArrowColor: COLORS.GRAY[300],
    textDisabledColor: COLORS.CALENDAR.DISABLED,
  },

  // 標記樣式
  markers: {
    startDate: {
      selected: true,
      startingDay: true,
      color: COLORS.PRIMARY,
      textColor: 'white',
    },
    endDate: {
      selected: true,
      endingDay: true,
      color: COLORS.SUCCESS,
      textColor: 'white',
    },
    rangeDate: {
      selected: true,
      color: COLORS.CALENDAR.RANGE,
      textColor: COLORS.CALENDAR.RANGE_TEXT,
    },
    disabledDate: {
      disabled: true,
      textColor: COLORS.CALENDAR.DISABLED,
    },
  },
} as const;

export default function DateRangeSelector(props: DateRangeSelectorProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().split('T')[0].slice(0, 7));

  // 使用常數設定日期限制
  const getDateLimits = () => {
    const now = new Date();
    const yearsAgo = new Date();
    yearsAgo.setFullYear(now.getFullYear() - UI.DATE_RANGE_YEARS_LIMIT);
    return {
      minDate: yearsAgo.toISOString().split('T')[0],
      maxDate: now.toISOString().split('T')[0],
    };
  };

  const { minDate, maxDate } = getDateLimits();

  // 重置到今天的月份
  const resetToToday = () => {
    setCurrentMonth(new Date().toISOString().split('T')[0].slice(0, 7));
  };

  // 智慧日期選擇邏輯
  const handleDayPress = (day: { dateString: string }) => {
    const selectedDate = day.dateString;

    // 檢查是否在允許範圍內
    if (selectedDate < minDate || selectedDate > maxDate) {
      Alert.alert('日期限制', `已超出可選擇範圍，請選擇${UI.DATE_RANGE_YEARS_LIMIT}年內的日期`);
      return;
    }

    if (!selectedStartDate) {
      // 第一次選擇：設為起始日期
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null);
    } else if (!selectedEndDate) {
      // 第二次選擇
      if (selectedDate >= selectedStartDate) {
        // 在起始日期之後：設為結束日期
        setSelectedEndDate(selectedDate);
      } else {
        // 在起始日期之前：重置起始日期
        setSelectedStartDate(selectedDate);
        setSelectedEndDate(null);
      }
    } else {
      // 已有完整範圍，重新開始選擇
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null);
    }
  };

  // 優化禁用日期生成邏輯
  const markedDates = useMemo(() => {
    const marked: { [key: string]: MarkedDate } = {};

    // 使用常數設定禁用日期範圍
    const startYear = new Date(minDate).getFullYear() - 1;
    const endYear = startYear - UI.CALENDAR_PAST_YEARS;

    for (let year = startYear; year >= endYear; year--) {
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          if (dateStr < minDate) {
            marked[dateStr] = CALENDAR_STYLES.markers.disabledDate;
          }
        }
      }
    }

    // 標記未來日期為禁用
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureYear = tomorrow.getFullYear() + UI.CALENDAR_FUTURE_YEARS;

    for (let year = tomorrow.getFullYear(); year <= futureYear; year++) {
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          if (dateStr > maxDate) {
            marked[dateStr] = CALENDAR_STYLES.markers.disabledDate;
          }
        }
      }
    }

    if (selectedStartDate && selectedEndDate) {
      // 有完整範圍時標記所有範圍內的日期
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      const current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];

        if (dateStr === selectedStartDate) {
          marked[dateStr] = CALENDAR_STYLES.markers.startDate;
        } else if (dateStr === selectedEndDate) {
          marked[dateStr] = CALENDAR_STYLES.markers.endDate;
        } else {
          marked[dateStr] = CALENDAR_STYLES.markers.rangeDate;
        }

        current.setDate(current.getDate() + 1);
      }
    } else if (selectedStartDate) {
      // 只有起始日期時
      marked[selectedStartDate] = CALENDAR_STYLES.markers.startDate;
    }

    return marked;
  }, [selectedStartDate, selectedEndDate, minDate, maxDate]);

  const handleConfirm = () => {
    if (!selectedStartDate || !selectedEndDate) {
      Alert.alert('請選擇完整範圍', '請選擇開始和結束日期');
      return;
    }

    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);

    props.onDateRangeChange(start, end);

    // 重置狀態並回到今天
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    resetToToday();
    props.onClose();
  };

  const handleCancel = () => {
    // 重置狀態並回到今天
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    resetToToday();
    props.onClose();
  };

  const handleReset = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  return (
    <>
      <Modal
        visible={props.visible}
        transparent
        animationType="slide"
        onRequestClose={props.onClose}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl max-h-[90%]">
            {/* 標題列 */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={handleCancel}>
                <Text className="text-gray-600 text-lg">{COMMON.CANCEL}</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">
                選擇日期範圍
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text className="text-blue-600 text-lg font-semibold">{COMMON.CONFIRM}</Text>
              </TouchableOpacity>
            </View>

            {/* 選擇狀態顯示區域 - 移到Header下方 */}
            <View className="p-4 bg-blue-50 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 items-center">
                  <Text className="text-sm text-gray-600">開始日期</Text>
                  <Text className="text-base font-semibold text-blue-600">
                    {selectedStartDate
                      ? new Date(selectedStartDate).toLocaleDateString(COMMON.ZH_TW)
                      : '未選擇'
                    }
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-sm text-gray-600">結束日期</Text>
                  <Text className="text-base font-semibold text-green-600">
                    {selectedEndDate
                      ? new Date(selectedEndDate).toLocaleDateString(COMMON.ZH_TW)
                      : '未選擇'
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* 日曆 */}
            <Calendar
              current={currentMonth}
              markingType="period"
              markedDates={markedDates}
              onDayPress={handleDayPress}
              onMonthChange={(month) => setCurrentMonth(month.dateString.slice(0, 7))}
              hideArrows={false}
              hideExtraDays={false}
              disableMonthChange={false}
              firstDay={0}
              showWeekNumbers={false}
              theme={CALENDAR_STYLES.theme}
            />
          </View>
        </View>
      </Modal>
    </>
  );
} 