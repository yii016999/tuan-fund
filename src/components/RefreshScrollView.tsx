import { useRefresh } from '@/hooks/useRefresh'
import React from 'react'
import { RefreshControl, ScrollView, ScrollViewProps } from 'react-native'

interface RefreshScrollViewProps extends ScrollViewProps {
    onRefresh: () => Promise<void>
}

export default function RefreshScrollView(props: RefreshScrollViewProps) {
    const { refreshing, handleRefresh } = useRefresh({ onRefresh: props.onRefresh })

    return (
        <ScrollView
            {...props}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
            {props.children}
        </ScrollView>
    )
} 