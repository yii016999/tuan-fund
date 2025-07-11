import { COMMON, RECORD } from '@/constants/string'
import { RECORD_TYPES, RecordTabType, RecordType } from '@/constants/types'
import { Transaction } from '@/features/transaction/model/Transaction'
import { useAuthStore } from '@/store/useAuthStore'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { MemberPaymentRecord, RecordListItem } from '../model/Record'
import { RecordsService } from '../services/RecordsService'

export const useRecordsViewModel = (initialGroupId?: string) => {
    const { user, activeGroupId } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'group' | 'member'>('group')
    const [groupTransactions, setGroupTransactions] = useState<Transaction[]>([])
    const [memberPayments, setMemberPayments] = useState<MemberPaymentRecord[]>([])
    
    // 修改預設日期範圍 - 今年
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date()
        const currentYear = now.getFullYear()
        return {
            startDate: new Date(currentYear, 0, 1), // 今年1月1日
            endDate: now // 今天
        }
    })

    // 使用 activeGroupId 而不是傳入的 groupId
    const currentGroupId = activeGroupId || initialGroupId || ''

    // 獲取數據
    const fetchRecords = useCallback(async () => {
        if (!currentGroupId) {
            setGroupTransactions([])
            setMemberPayments([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const [transactions, payments] = await Promise.all([
                RecordsService.getGroupTransactions(currentGroupId, dateRange.startDate, dateRange.endDate),
                RecordsService.getMemberPayments(currentGroupId, dateRange.startDate, dateRange.endDate, user?.uid)
            ])

            setGroupTransactions(transactions)
            setMemberPayments(payments)
        } catch (error) {
            console.error('Error fetching records:', error)
        } finally {
            setLoading(false)
        }
    }, [currentGroupId, dateRange, user?.uid])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    // 使用 useMemo 來記憶化轉換後的記錄
    const groupRecords = useMemo((): RecordListItem[] =>
        groupTransactions.map(transaction => ({
            id: transaction.id!,
            type: RECORD_TYPES.GROUP_TRANSACTION,
            title: transaction.title,
            amount: transaction.amount,
            date: transaction.date,
            description: transaction.description,
            canEdit: transaction.userId === user?.uid,
            canDelete: transaction.userId === user?.uid,
        }))
        , [groupTransactions, user?.uid])

    const memberRecords = useMemo((): RecordListItem[] =>
        memberPayments.map(payment => ({
            id: payment.id,
            type: RECORD_TYPES.MEMBER_PAYMENT,
            title: payment.description || `${RECORD.PAYMENT} ${COMMON.DASH} ${payment.billingMonth}`,
            amount: payment.amount,
            date: payment.paymentDate,
            description: payment.billingMonth,
            canEdit: payment.memberId === user?.uid,
            canDelete: payment.memberId === user?.uid,
        }))
        , [memberPayments, user?.uid])

    // 編輯記錄
    const editRecord = useCallback(async (recordId: string, type: RecordType, data: any) => {
        if (!currentGroupId) return
        
        try {
            if (type === RECORD_TYPES.GROUP_TRANSACTION) {
                await RecordsService.updateGroupTransaction(recordId, data, currentGroupId)
            } else {
                await RecordsService.updateMemberPayment(recordId, data, currentGroupId)
            }
            await fetchRecords() // 重新獲取數據
        } catch (error) {
            console.error('Error editing record:', error)
            throw error
        }
    }, [fetchRecords, currentGroupId])

    // 刪除記錄
    const deleteRecord = useCallback(async (recordId: string, type: RecordType) => {
        if (!currentGroupId) return
        
        try {
            if (type === RECORD_TYPES.GROUP_TRANSACTION) {
                await RecordsService.deleteGroupTransaction(recordId, currentGroupId)
            } else {
                await RecordsService.deleteMemberPayment(recordId, currentGroupId)
            }
            await fetchRecords() // 重新獲取數據
        } catch (error) {
            console.error('Error deleting record:', error)
            throw error
        }
    }, [fetchRecords, currentGroupId])

    // 更新日期範圍 - 加入三年限制
    const updateDateRange = useCallback((startDate: Date, endDate: Date) => {
        const now = new Date()
        const threeYearsAgo = new Date()
        threeYearsAgo.setFullYear(now.getFullYear() - 3)

        // 檢查是否超過三年限制
        if (startDate < threeYearsAgo) {
            Alert.alert(
                '日期範圍限制',
                '查詢範圍不能超過三年，已自動調整為三年前開始。',
                [{ text: '確定', style: 'default' }]
            )
            startDate = threeYearsAgo
        }

        // 檢查結束日期不能是未來
        if (endDate > now) {
            endDate = now
        }

        // 檢查開始日期不能晚於結束日期
        if (startDate > endDate) {
            Alert.alert(
                '日期範圍錯誤',
                '開始日期不能晚於結束日期。',
                [{ text: '確定', style: 'default' }]
            )
            return
        }

        setDateRange({ startDate, endDate })
    }, [])

    // 使用 useCallback 來記憶化 tab 切換函數
    const handleTabChange = useCallback((newTab: RecordTabType) => {
        setActiveTab(newTab)
    }, [])

    return {
        loading,
        activeTab,
        setActiveTab: handleTabChange,
        groupRecords,
        memberRecords,
        groupTransactions,
        dateRange,
        updateDateRange,
        editRecord,
        deleteRecord,
        refreshRecords: fetchRecords,
    }
} 