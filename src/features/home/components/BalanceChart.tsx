import { BALANCE_CHART, COMMON } from '@/constants/string';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// 取得螢幕寬度
const { width: screenWidth } = Dimensions.get('window');

interface BalanceData {
  labels: string[];                           // 標籤
  datasets: {
    data: (number | null)[];                  // 資料
    color?: (opacity?: number) => string;     // 顏色
    strokeWidth?: number;                     // 線寬
  }[];
}

interface BalanceChartProps {
  data: BalanceData;                          // 資料
  height: number;                             // 高度
  title?: string;                             // 標題
  selectedYear: number;                       // 選擇的年份
  onPreviousYear: () => void;                 // 前一年
  onNextYear: () => void;                     // 後一年
  earliestYear?: number;                      // 最早的年份
  isLoading?: boolean;                        // 載入狀態
}

interface YearNavigatorProps {
  selectedYear: number;                       // 選擇的年份
  title?: string;                             // 標題
  canGoPrevious: boolean;                     // 是否可以前一年
  canGoNext: boolean;                         // 是否可以後一年
  onPreviousYear: () => void;                 // 前一年
  onNextYear: () => void;                     // 後一年
}

interface NavigationButtonProps {
  onPress: () => void;                        // 按鈕按下
  disabled: boolean;                          // 是否禁用
  icon: string;                               // 圖示
}

const CHART_CONFIG = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForLabels: { fontSize: 10 },
  propsForDots: { r: '4' },
  horizontalOffset: 0,
} as const;

export default function BalanceChart(props: BalanceChartProps) {
  // 使用 useMemo 優化計算
  const { cleanedData, currentBalance, safeData } = useMemo(() => {
    const filtered = props.data?.datasets?.[0]?.data?.filter(value => value !== null && value !== undefined) ?? [];
    const balance = filtered[filtered.length - 1] ?? 0;

    return {
      cleanedData: filtered,
      currentBalance: balance,
      safeData: {
        labels: props.data?.labels ?? [],
        datasets: [
          {
            ...(props.data?.datasets?.[0] ?? { data: [] }),
            data: filtered,
          }
        ]
      }
    };
  }, [props.data]);

  const navigationState = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // 只有當 props.earliestYear 有值時才允許往前導航
    const canGoPrevious = props.earliestYear ? props.selectedYear > props.earliestYear : false;
    const canGoNext = props.selectedYear < currentYear;
    
    return {
      canGoPrevious,
      canGoNext,
    };
  }, [props.selectedYear, props.earliestYear]);

  const YearNavigator = useCallback((props: YearNavigatorProps) => {
    return (
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold">{props.selectedYear} {props.title}</Text>
        <View className="flex-row gap-8">
          <NavigationButton
            onPress={props.onPreviousYear}
            disabled={!props.canGoPrevious}
            icon="◀"
          />
          <NavigationButton
            onPress={props.onNextYear}
            disabled={!props.canGoNext}
            icon="▶"
          />
        </View>
      </View>
    );
  }, []);

  const NavigationButton = useCallback((props: NavigationButtonProps) => {
    return (
      <TouchableOpacity
        onPress={props.disabled ? undefined : props.onPress}
        disabled={props.disabled}
        className={`p-2 ${props.disabled ? 'opacity-30' : 'opacity-100'}`}
      >
        <Text className={`text-lg ${props.disabled ? 'text-gray-300' : 'text-black'}`}>
          {props.icon}
        </Text>
      </TouchableOpacity>
    );
  }, []);

  const formatYLabel = useCallback((value: number | string): string => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString();
  }, []);

  const chartConfig = useMemo(() => ({
    ...CHART_CONFIG,
    formatYLabel: formatYLabel,
  }), [formatYLabel]);

  // 空的資料時顯示空畫面
  if (!cleanedData.length) {
    return (
      <View className="bg-white rounded-xl p-4">
        <Text className="text-lg font-bold mb-4">{props.selectedYear} {props.title}</Text>
        <View className="h-48 justify-center items-center">
          <Text className="text-gray-500">暫無資料</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4">
      {/* 年份導航組件 */}
      <YearNavigator
        selectedYear={props.selectedYear}
        title={props.title}
        canGoPrevious={navigationState.canGoPrevious}
        canGoNext={navigationState.canGoNext}
        onPreviousYear={props.onPreviousYear}
        onNextYear={props.onNextYear}
      />

      <LineChart
        data={safeData}
        width={screenWidth - 16}
        height={props.height}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginLeft: -32,
        }}
        withDots={true}
        withShadow={false}
        fromZero={true}
        segments={4}
        withHorizontalLines={true}
        withVerticalLines={false}
      />

      <Text className="text-center text-gray-500 text-xs mt-2">
        {BALANCE_CHART.CURRENT_BALANCE} {COMMON.MONEY_SIGN} {currentBalance.toLocaleString()}
      </Text>
    </View>
  );
} 