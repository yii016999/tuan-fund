import { COMMON, RECORD } from '@/constants/string'
import { RECORD_TYPES, RecordTabType, RecordType } from '@/constants/types'
import { Transaction } from '@/features/transaction/model/Transaction'
import { useAuthStore } from '@/store/useAuthStore'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MemberPaymentRecord, RecordListItem } from '../model/Record'
import { RecordsService } from '../services/RecordsService'

export const useRecordsViewModel = (groupId: string) => {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'group' | 'member'>('group')
    const [groupTransactions, setGroupTransactions] = useState<Transaction[]>([])
    const [memberPayments, setMemberPayments] = useState<MemberPaymentRecord[]>([])
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()),
        endDate: new Date()
    })

    // 獲取數據
    const fetchRecords = useCallback(async () => {
        if (!groupId) return

        setLoading(true)
        try {
            const [transactions, payments] = await Promise.all([
                RecordsService.getGroupTransactions(groupId, dateRange.startDate, dateRange.endDate),
                RecordsService.getMemberPayments(groupId, dateRange.startDate, dateRange.endDate, user?.uid)
            ])

            setGroupTransactions(transactions)
            setMemberPayments(payments)
        } catch (error) {
            console.error('Error fetching records:', error)
        } finally {
            setLoading(false)
        }
    }, [groupId, dateRange, user?.uid])

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
        try {
            if (type === RECORD_TYPES.GROUP_TRANSACTION) {
                await RecordsService.updateGroupTransaction(recordId, data, groupId)
            } else {
                await RecordsService.updateMemberPayment(recordId, data, groupId)
            }
            await fetchRecords() // 重新獲取數據
        } catch (error) {
            console.error('Error editing record:', error)
            throw error
        }
    }, [fetchRecords, groupId])

    // 刪除記錄
    const deleteRecord = useCallback(async (recordId: string, type: RecordType) => {
        try {
            if (type === RECORD_TYPES.GROUP_TRANSACTION) {
                await RecordsService.deleteGroupTransaction(recordId, groupId)
            } else {
                await RecordsService.deleteMemberPayment(recordId, groupId)
            }
            await fetchRecords() // 重新獲取數據
        } catch (error) {
            console.error('Error deleting record:', error)
            throw error
        }
    }, [fetchRecords, groupId])

    // 更新日期範圍
    const updateDateRange = useCallback((startDate: Date, endDate: Date) => {
        // 限制最多查詢三年
        const threeYearsAgo = new Date()
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

        if (startDate < threeYearsAgo) {
            startDate = threeYearsAgo
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