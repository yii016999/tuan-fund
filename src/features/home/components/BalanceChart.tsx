import { BALANCE_CHART, COMMON } from '@/constants/string';
import { COLORS, STYLES, UI } from '@/constants/config';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import YearNavigator from './YearNavigator';

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

const BalanceChart = React.memo<BalanceChartProps>(({
  data,
  height,
  title,
  selectedYear,
  onPreviousYear,
  onNextYear,
  earliestYear,
  isLoading
}) => {
  // 使用 useMemo 優化計算
  const { cleanedData, currentBalance, safeData } = useMemo(() => {
    const filtered = data?.datasets?.[0]?.data?.filter(value => value !== null && value !== undefined) ?? [];
    const balance = filtered[filtered.length - 1] ?? 0;

    return {
      cleanedData: filtered,
      currentBalance: balance,
      safeData: {
        labels: data?.labels ?? [],
        datasets: [
          {
            ...(data?.datasets?.[0] ?? { data: [] }),
            data: filtered,
          }
        ]
      }
    };
  }, [data]);

  const navigationState = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // 只有當 props.earliestYear 有值時才允許往前導航
    const canGoPrevious = earliestYear ? selectedYear > earliestYear : false;
    const canGoNext = selectedYear < currentYear;
    
    return {
      canGoPrevious,
      canGoNext,
    };
  }, [selectedYear, earliestYear]);

  const formatYLabel = useCallback((value: number | string): string => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString();
  }, []);

  const chartConfig = useMemo(() => ({
    backgroundColor: COLORS.HOME.CHART_BACKGROUND,
    backgroundGradientFrom: COLORS.HOME.CHART_BACKGROUND,
    backgroundGradientTo: COLORS.HOME.CHART_BACKGROUND,
    decimalPlaces: UI.HOME.BALANCE_DECIMAL_PLACES,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    style: { borderRadius: STYLES.HOME.CHART_BORDER_RADIUS },
    propsForLabels: { fontSize: 10 },
    propsForDots: { r: UI.HOME.CHART_DOT_RADIUS.toString() },
    horizontalOffset: 0,
    formatYLabel: formatYLabel,
  }), [formatYLabel]);

  // 空的資料時顯示空畫面
  if (!cleanedData.length) {
    return (
      <View 
        className="bg-white rounded-xl"
        style={{ 
          padding: STYLES.HOME.CARD_PADDING,
          borderRadius: STYLES.HOME.CARD_BORDER_RADIUS,
          backgroundColor: COLORS.HOME.CARD_BACKGROUND,
        }}
      >
        <Text className="text-lg font-bold mb-4">{selectedYear} {title}</Text>
        <View className="justify-center items-center" style={{ height: height * 0.8 }}>
          <Text className="text-gray-500">暫無資料</Text>
        </View>
      </View>
    )
  }

  return (
    <View 
      className="bg-white rounded-xl"
      style={{ 
        padding: STYLES.HOME.CARD_PADDING,
        borderRadius: STYLES.HOME.CARD_BORDER_RADIUS,
        backgroundColor: COLORS.HOME.CARD_BACKGROUND,
      }}
    >
      {/* 年份導航組件 */}
      <YearNavigator
        selectedYear={selectedYear}
        title={title}
        canGoPrevious={navigationState.canGoPrevious}
        canGoNext={navigationState.canGoNext}
        onPreviousYear={onPreviousYear}
        onNextYear={onNextYear}
      />

      <LineChart
        data={safeData}
        width={screenWidth - UI.HOME.SCREEN_PADDING}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: UI.HOME.CHART_MARGIN_VERTICAL,
          borderRadius: STYLES.HOME.CHART_BORDER_RADIUS,
          marginLeft: UI.HOME.CHART_MARGIN_LEFT,
        }}
        withDots={true}
        withShadow={false}
        fromZero={true}
        segments={UI.HOME.CHART_SEGMENTS}
        withHorizontalLines={true}
        withVerticalLines={false}
      />

      <Text className="text-center text-gray-500 text-xs mt-2">
        {BALANCE_CHART.CURRENT_BALANCE} {COMMON.MONEY_SIGN} {currentBalance.toLocaleString()}
      </Text>
    </View>
  )
})

BalanceChart.displayName = 'BalanceChart'

export default BalanceChart 