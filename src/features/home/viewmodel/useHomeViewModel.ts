import { useEffect, useState } from 'react';
import { DashboardSummary } from '../model/Home';
import { homeService } from '../services/HomeService';

export const useHomeViewModel = () => {
  const [homeData, setHomeData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入首頁數據
  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await homeService.getHomeData();
      setHomeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據失敗');
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 重新整理數據
  const refreshData = async () => {
    await loadHomeData();
  };

  // 組件掛載時載入數據
  useEffect(() => {
    loadHomeData();
  }, []);

  return {
    // 數據
    homeData,
    loading,
    error,

    // 操作
    refreshData,
    loadHomeData,
  };
}; 