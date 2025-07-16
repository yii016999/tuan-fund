import FullScreenLoader from '@/components/FullScreenLoader';
import NoGroupSelected from '@/components/NoGroupSelected';
import { HOME } from '@/constants/string';
import { UI } from '@/constants/config';
import BalanceChart from '@/features/home/components/BalanceChart';
import PaymentStatusCard from '@/features/home/components/PaymentStatusCard';
import TransactionOverviewCard from '@/features/home/components/TransactionOverviewCard';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useHomeViewModel } from '../viewmodel/useHomeViewModel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HomeScreen = React.memo(() => {
  const { 
    homeData, 
    loading, 
    error, 
    refreshData, 
    selectedYear, 
    earliestYear,
    previousYear, 
    nextYear, 
    joinedGroupIds, 
    activeGroupId 
  } = useHomeViewModel();

  const screenDimensions = useMemo(() => ({
    cardHeight: (screenHeight - UI.HOME.SCREEN_OFFSET) * UI.HOME.CARD_HEIGHT_RATIO,
    chartHeight: (screenHeight - UI.HOME.SCREEN_OFFSET) * UI.HOME.CHART_HEIGHT_RATIO,
  }), [screenHeight]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  if (loading && !homeData) {
    return <FullScreenLoader visible={loading} />;
  }

  if (!activeGroupId) {
    return <NoGroupSelected joinedGroupIds={joinedGroupIds} />;
  }

  // 沒有數據
  if (!homeData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50" style={{ padding: UI.HOME.SCREEN_PADDING }}>
        <Text className="text-gray-500 text-center">{HOME.NO_DATA}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      style={{ gap: UI.HOME.CARD_GAP }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      <View style={{ padding: UI.HOME.SCREEN_PADDING, gap: UI.HOME.CARD_GAP }}>
        {/* 上半部年度餘額趨勢圖表 */}
        <BalanceChart
          data={homeData.balanceData}
          height={screenDimensions.chartHeight}
          title={HOME.BALANCE_CHART_TITLE}
          selectedYear={selectedYear}
          earliestYear={earliestYear}
          onPreviousYear={previousYear}
          onNextYear={nextYear}
          isLoading={loading}
        />

        {/* 下半部 */}
        <View className="flex-row flex-1" style={{ gap: UI.HOME.CARD_GAP }}>
          {/* 左收支總覽 */}
          <View className="flex-1">
            <TransactionOverviewCard
              monthlyIncome={homeData.transactionOverview.monthlyIncome}
              monthlyExpense={homeData.transactionOverview.monthlyExpense}
              recentTransactions={homeData.transactionOverview.recentTransactions}
              createdBy={homeData.transactionOverview.createdBy}
              minHeight={screenDimensions.cardHeight}
            />
          </View>

          {/* 右繳費狀態 */}
          <View className="flex-1">
            <PaymentStatusCard
              isPaid={homeData.paymentStatus.isPaid}
              amount={homeData.paymentStatus.amount}
              period={homeData.paymentStatus.period}
              minHeight={screenDimensions.cardHeight}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;
