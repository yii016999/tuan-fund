import FullScreenLoader from '@/components/FullScreenLoader';
import NoGroupSelected from '@/components/NoGroupSelected';
import { HOME } from '@/constants/string';
import BalanceChart from '@/features/home/components/BalanceChart';
import PaymentStatusCard from '@/features/home/components/PaymentStatusCard';
import TransactionOverviewCard from '@/features/home/components/TransactionOverviewCard';
import React from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useHomeViewModel } from '../viewmodel/useHomeViewModel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const { homeData, loading, error, refreshData, selectedYear, previousYear, nextYear, joinedGroupIds, activeGroupId } = useHomeViewModel();

  const cardHeight = (screenHeight - 250) * 0.4;
  const chartHeight = (screenHeight - 250) * 0.45;
  const currentGroupId = activeGroupId || ''

  if (loading && !homeData) {
    return <FullScreenLoader visible={loading} />;
  }

  if (!currentGroupId) {
    return <NoGroupSelected joinedGroupIds={joinedGroupIds} />;
  }

  // 沒有數據
  if (!homeData) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-gray-500 text-center">{HOME.NO_DATA}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 gap-8"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }
    >
      <View className="p-4 gap-8">
        {/* 上半部年度餘額趨勢圖表 */}
        <BalanceChart
          data={homeData.balanceData}
          height={chartHeight}
          title={HOME.BALANCE_CHART_TITLE}
          selectedYear={selectedYear}
          onPreviousYear={previousYear}
          onNextYear={nextYear}
        />

        {/* 下半部 */}
        <View className="flex-row flex-1 gap-4">
          {/* 左收支總覽 */}
          <View className="flex-1">
            <TransactionOverviewCard
              monthlyIncome={homeData.transactionOverview.monthlyIncome}
              monthlyExpense={homeData.transactionOverview.monthlyExpense}
              recentTransactions={homeData.transactionOverview.recentTransactions}
              createdBy={homeData.transactionOverview.createdBy}
              minHeight={cardHeight}
            />
          </View>

          {/* 右繳費狀態 */}
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