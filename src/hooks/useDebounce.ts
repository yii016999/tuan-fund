import { useCallback, useRef, useEffect } from 'react'
import { UI } from '@/constants/config'

export const useDebounce = (delay: number = UI.DEBOUNCE_DELAY) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const debounce = useCallback((func: () => void) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(func, delay)
  }, [delay])

  // 清理函數
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return debounce
} 