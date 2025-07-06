import { useState } from 'react'

export interface UseRefreshProps {
    onRefresh: () => Promise<void>
}

export const useRefresh = ({ onRefresh }: UseRefreshProps) => {
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            await onRefresh()
        } catch (error) {
            console.error('刷新失敗:', error)
        } finally {
            setRefreshing(false)
        }
    }

    return {
        refreshing,
        handleRefresh,
    }
} 