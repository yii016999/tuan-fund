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
            console.error('Error refreshing:', error)
        } finally {
            setRefreshing(false)
        }
    }

    return {
        refreshing,
        handleRefresh,
    }
} 