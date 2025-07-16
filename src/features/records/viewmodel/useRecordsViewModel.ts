import { COMMON, RECORD, TRANSACTION } from '@/constants/string'
import { UI } from '@/constants/config'
import { RECORD_TYPES, RECORD_TRANSACTION_TYPES, RecordTabType, RecordType } from '@/constants/types'
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
    const [prepaymentRanges, setPrepaymentRanges] = useState<Record<string, { startMonth: string; endMonth: string }>>({})
    const [groupPrepaymentRanges, setGroupPrepaymentRanges] = useState<Record<string, { startMonth: string; endMonth: string }>>({})
    
    // 使用配置常數替代硬編碼
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date()
        const yearsAgo = new Date()
        yearsAgo.setFullYear(now.getFullYear() - UI.DATE_RANGE_YEARS_LIMIT)
        return {
            startDate: new Date(yearsAgo.getFullYear(), 0, 1),
            endDate: now
        }
    })

    const currentGroupId = activeGroupId || initialGroupId || ''

    // 獲取群組收支記錄的預繳範圍資訊
    const fetchGroupPrepaymentRanges = useCallback(async (transactions: Transaction[]) => {
        if (!currentGroupId || !user?.uid) return {}

        const ranges: Record<string, { startMonth: string; endMonth: string }> = {}
        
        // 只對收入記錄檢查預繳範圍
        const incomeTransactions = transactions.filter(transaction => 
            transaction.type === RECORD_TRANSACTION_TYPES.INCOME &&
            transaction.userId === user.uid
        )

        // 為每個收入記錄查詢預繳範圍
        const rangePromises = incomeTransactions.map(async (transaction) => {
            const range = await RecordsService.getGroupTransactionPrepaymentRange(
                currentGroupId, 
                transaction.userId, 
                transaction.date
            )
            
            if (range) {
                ranges[transaction.id!] = range
            }
        })

        await Promise.all(rangePromises)
        return ranges
    }, [currentGroupId, user?.uid])

    // 獲取個人繳費記錄的預繳範圍資訊 - 移除硬編碼
    const fetchPrepaymentRanges = useCallback(async (payments: MemberPaymentRecord[]) => {
        if (!currentGroupId || !user?.uid) return {}

        const ranges: Record<string, { startMonth: string; endMonth: string }> = {}
        
        // 找出所有可能的預繳記錄
        const prepaymentCandidates = payments.filter(payment => 
            payment.description?.includes(TRANSACTION.PREPAYMENT_KEYWORD) && 
            payment.memberId === user.uid
        )

        // 按日期分組
        const groupedByDate: Record<string, MemberPaymentRecord[]> = {}
        prepaymentCandidates.forEach(payment => {
            const date = payment.paymentDate
            if (!groupedByDate[date]) {
                groupedByDate[date] = []
            }
            groupedByDate[date].push(payment)
        })

        // 為每個日期計算預繳範圍
        for (const [date, records] of Object.entries(groupedByDate)) {
            if (records.length > 1) { // 只有多筆記錄才是預繳
                const billingMonths = records
                    .map(record => record.billingMonth)
                    .sort()
                
                const startMonth = billingMonths[0].replace(COMMON.DASH, '')
                const endMonth = billingMonths[billingMonths.length - 1].replace(COMMON.DASH, '')
                
                // 為這個日期的所有記錄設定範圍
                records.forEach(record => {
                    ranges[record.id] = { startMonth, endMonth }
                })
            }
        }

        return ranges
    }, [currentGroupId, user?.uid])

    // 獲取數據
    const fetchRecords = useCallback(async () => {
        if (!currentGroupId) {
            setGroupTransactions([])
            setMemberPayments([])
            setPrepaymentRanges({})
            setGroupPrepaymentRanges({})
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
            
            // 獲取預繳範圍
            const [memberRanges, groupRanges] = await Promise.all([
                fetchPrepaymentRanges(payments),
                fetchGroupPrepaymentRanges(transactions)
            ])
            
            setPrepaymentRanges(memberRanges)
            setGroupPrepaymentRanges(groupRanges)
        } catch (error) {
            console.error('Error fetching records:', error)
            Alert.alert(COMMON.ERROR, '載入記錄失敗，請重試')
        } finally {
            setLoading(false)
        }
    }, [currentGroupId, dateRange, user?.uid, fetchPrepaymentRanges, fetchGroupPrepaymentRanges])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    // 使用 useMemo 來記憶化轉換後的記錄
    const groupRecords = useMemo((): RecordListItem[] =>
        groupTransactions.map(transaction => {
            const prepaymentInfo = groupPrepaymentRanges[transaction.id!]
            
            return {
                id: transaction.id!,
                type: RECORD_TYPES.GROUP_TRANSACTION,
                title: transaction.title,
                amount: transaction.amount,
                date: transaction.date,
                description: transaction.description,
                canEdit: transaction.userId === user?.uid,
                canDelete: transaction.userId === user?.uid,
                prepaymentInfo,
            }
        })
        , [groupTransactions, user?.uid, groupPrepaymentRanges])

    const memberRecords = useMemo((): RecordListItem[] =>
        memberPayments.map(payment => {
            const prepaymentInfo = prepaymentRanges[payment.id]
            
            return {
                id: payment.id,
                type: RECORD_TYPES.MEMBER_PAYMENT,
                title: payment.description || `${RECORD.PAYMENT} ${COMMON.DASH} ${payment.billingMonth}`,
                amount: payment.amount,
                date: payment.paymentDate,
                description: payment.billingMonth,
                canEdit: payment.memberId === user?.uid,
                canDelete: payment.memberId === user?.uid,
                prepaymentInfo,
            }
        })
        , [memberPayments, user?.uid, prepaymentRanges])

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

    // 更新日期範圍 - 使用常數
    const updateDateRange = useCallback((startDate: Date, endDate: Date) => {
        const now = new Date()
        const yearsAgo = new Date()
        yearsAgo.setFullYear(now.getFullYear() - UI.DATE_RANGE_YEARS_LIMIT)

        // 檢查是否超過年限限制
        if (startDate < yearsAgo) {
            Alert.alert(
                '日期範圍限制',
                `查詢範圍不能超過${UI.DATE_RANGE_YEARS_LIMIT}年，已自動調整為${UI.DATE_RANGE_YEARS_LIMIT}年前開始。`,
                [{ text: '確定', style: 'default' }]
            )
            startDate = yearsAgo
        }

        if (endDate > now) {
            endDate = now
        }

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