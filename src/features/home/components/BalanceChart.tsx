import { BALANCE_CHART, COMMON } from '@/constants/string';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

interface BalanceData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }[];
}

interface BalanceChartProps {
  data: BalanceData;
  height: number;
  title?: string;
}

export default function BalanceChart({ data, height, title = BALANCE_CHART.TITLE }: BalanceChartProps) {
  const currentBalance = data.datasets[0].data[data.datasets[0].data.length - 1];

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">{title}</Text>

      <LineChart
        data={data}
        width={screenWidth - 32} // 考慮 padding
        height={height}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#3b82f6',
          },
          formatYLabel: (value) => `$${(parseInt(value) / 1000).toFixed(0)}K`,
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <Text className="text-center text-gray-500 text-xs mt-2">
        {BALANCE_CHART.CURRENT_BALANCE} {COMMON.MONEY_SIGN} {currentBalance.toLocaleString()}
      </Text>
    </View>
  );
} 