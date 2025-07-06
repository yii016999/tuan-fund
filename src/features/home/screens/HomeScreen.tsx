import BalanceChart from '@/features/home/components/BalanceChart';
import FullScreenLoader from '@/components/FullScreenLoader';
import PaymentStatusCard from '@/features/home/components/PaymentStatusCard';
import TransactionOverviewCard from '@/features/home/components/TransactionOverviewCard';
import React from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useHomeViewModel } from '../viewmodel/useHomeViewModel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const { homeData, loading, error, refreshData } = useHomeViewModel();

  const cardHeight = (screenHeight - 250) * 0.4;
  const chartHeight = (screenHeight - 250) * 0.45;

  // 載入狀態
  if (loading && !homeData) {
    return <FullScreenLoader visible={loading} />;
  }

  // 錯誤狀態
  if (error && !homeData) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-red-500 text-center mb-4">載入失敗：{error}</Text>
        <TouchableOpacity
          onPress={refreshData}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 沒有數據
  if (!homeData) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-gray-500 text-center">暫無數據</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }
    >
      <View className="p-4">
        {/* 上半部：年度餘額圖表 */}
        <BalanceChart
          data={homeData.balanceData}
          height={chartHeight}
          title="年度餘額趨勢"
        />

        {/* 下半部：兩張卡片 */}
        <View className="flex-row flex-1" style={{ gap: 16 }}>
          {/* 左側：收支總覽 */}
          <View className="flex-1">
            <TransactionOverviewCard
              monthlyIncome={homeData.transactionOverview.monthlyIncome}
              monthlyExpense={homeData.transactionOverview.monthlyExpense}
              recentTransactions={homeData.transactionOverview.recentTransactions}
              minHeight={cardHeight}
            />
          </View>

          {/* 右側：繳費狀態 */}
          <View className="flex-1">
            <PaymentStatusCard
              isPaid={homeData.paymentStatus.isPaid}
              amount={homeData.paymentStatus.amount}
              period={homeData.paymentStatus.period}
              minHeight={cardHeight}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}