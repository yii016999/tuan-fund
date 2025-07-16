import { useEffect, useState, useCallback, useRef } from 'react'
import { DashboardSummary } from '../model/Home'
import { homeService } from '../services/HomeService'
import { useAuthStore } from '@/store/useAuthStore'
import { useFocusEffect } from '@react-navigation/native'
import { UI } from '@/constants/config'

export const useHomeViewModel = () => {
  const [homeData, setHomeData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [earliestYear, setEarliestYear] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  
  const { user, activeGroupId, joinedGroupIds } = useAuthStore()
  
  // 使用 ref 避免重複請求
  const loadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 載入最早交易年份
  const loadEarliestYear = useCallback(async () => {
    try {
      if (!activeGroupId) return
      
      const earliest = await homeService.getEarliestTransactionYear(activeGroupId)
      setEarliestYear(earliest)
    } catch (err) {
      console.error('Error loading earliest year:', err)
    }
  }, [activeGroupId])

  // 載入首頁數據（優化：防止重複請求）
  const loadHomeData = useCallback(async (year?: number) => {
    // 防止重複請求
    if (loadingRef.current) {
      return
    }

    try {
      // 檢查必要參數
      if (!activeGroupId) {
        setError('請先選擇群組')
        setLoading(false)
        return
      }

      if (!user?.uid) {
        setError('用戶資訊錯誤，請重新登入')
        setLoading(false)
        return
      }

      const targetYear = year || selectedYear

      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 創建新的 AbortController
      abortControllerRef.current = new AbortController()

      loadingRef.current = true
      setLoading(true)
      setError(null)
      
      // 並行載入首頁數據和最早年份
      const dataPromise = homeService.getHomeData(activeGroupId, user.uid, targetYear)
      const earliestYearPromise = earliestYear === undefined ? loadEarliestYear() : Promise.resolve()

      const [data] = await Promise.all([dataPromise, earliestYearPromise])

      // 檢查是否已被取消
      if (abortControllerRef.current?.signal.aborted) {
        return
      }
      
      setHomeData(data)
    } catch (err) {
      // 檢查是否是取消錯誤
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      setError(err instanceof Error ? err.message : '載入數據失敗')
      console.error('Error loading home data:', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [activeGroupId, user?.uid, selectedYear, earliestYear, loadEarliestYear])

  // 防抖的重新整理函數
  const debouncedRefresh = useCallback(
    debounce(() => {
      loadHomeData()
    }, UI.MEMBER.REFRESH_DEBOUNCE_DELAY),
    [loadHomeData]
  )

  // 切換年份
  const changeYear = useCallback((year: number) => {
    setSelectedYear(year)
    loadHomeData(year)
  }, [loadHomeData])

  // 上一年
  const previousYear = useCallback(() => {
    const newYear = selectedYear - 1
    changeYear(newYear)
  }, [selectedYear, changeYear])

  // 下一年
  const nextYear = useCallback(() => {
    const newYear = selectedYear + 1
    changeYear(newYear)
  }, [selectedYear, changeYear])

  // 重新整理數據
  const refreshData = useCallback(async () => {
    await loadHomeData()
  }, [loadHomeData])

  // 組件掛載時載入數據
  useEffect(() => {
    if (activeGroupId && user?.uid) {
      loadHomeData()
    } else {
      setLoading(false)
      setError(user ? '請先選擇群組' : '請先登入')
    }
  }, [activeGroupId, user?.uid, loadHomeData])

  // 每次進入頁面都重新獲取資料（使用防抖）
  useFocusEffect(
    useCallback(() => {
      debouncedRefresh()
    }, [debouncedRefresh])
  )

  // 清理函數
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    }, [])

  return {
    // 數據
    homeData,
    loading,
    error,
    selectedYear,
    earliestYear,
    joinedGroupIds,
    activeGroupId,
    // 操作
    refreshData,
    loadHomeData,
    changeYear,
    previousYear,
    nextYear,
  }
}

// 防抖函數
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
} 