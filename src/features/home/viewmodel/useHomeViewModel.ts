import { useEffect, useState, useCallback } from 'react';
import { DashboardSummary } from '../model/Home';
import { homeService } from '../services/HomeService';
import { useAuthStore } from '@/store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';

export const useHomeViewModel = () => {
  const [homeData, setHomeData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const { user, activeGroupId } = useAuthStore();

  // 載入首頁數據
  const loadHomeData = async (year?: number) => {
    try {
      // 檢查必要參數
      if (!activeGroupId) {
        setError('請先選擇群組');
        setLoading(false);
        return;
      }

      if (!user?.uid) {
        setError('用戶資訊錯誤，請重新登入');
        setLoading(false);
        return;
      }

      const targetYear = year || selectedYear;

      setLoading(true);
      setError(null);
      const data = await homeService.getHomeData(activeGroupId, user.uid, targetYear);
      setHomeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據失敗');
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 切換年份
  const changeYear = (year: number) => {
    setSelectedYear(year);
    loadHomeData(year);
  };

  // 上一年
  const previousYear = () => {
    const newYear = selectedYear - 1;
    changeYear(newYear);
  };

  // 下一年
  const nextYear = () => {
    const newYear = selectedYear + 1;
    changeYear(newYear);
  };

  // 重新整理數據
  const refreshData = async () => {
    await loadHomeData();
  };

  // 組件掛載時載入數據
  useEffect(() => {
    // 只有在有必要參數時才載入
    if (activeGroupId && user?.uid) {
      loadHomeData();
    } else {
      setLoading(false);
      setError(user ? '請先選擇群組' : '請先登入');
    }
  }, [activeGroupId, user?.uid]);

  // 每次進入頁面都重新獲取資料
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  return {
    // 數據
    homeData,
    loading,
    error,
    selectedYear,

    // 操作
    refreshData,
    loadHomeData,
    changeYear,
    previousYear,
    nextYear,
  };
}; 