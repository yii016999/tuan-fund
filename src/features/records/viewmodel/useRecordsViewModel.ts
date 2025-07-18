import { UI } from '@/constants/config'
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
            Alert.alert(COMMON.ERROR, '載入記錄失敗，請重試')
        } finally {
            setLoading(false)
        }
    }, [currentGroupId, dateRange, user?.uid])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    // 提取格式化邏輯為共用函數
    const formatPrepaymentDescription = useCallback((description?: string) => {
        if (!description?.includes('預繳')) return description;

        const prepaymentMatch = description.match(/預繳\s*(\d{6})-(\d{6})/);
        if (prepaymentMatch) {
            const startMonth = prepaymentMatch[1];
            const endMonth = prepaymentMatch[2];

            // 格式化顯示範圍
            const formatMonth = (month: string) => {
                const year = month.substring(0, 4);
                const monthNum = month.substring(4, 6);
                return `${year}年${monthNum}月`;
            };

            const formattedStart = formatMonth(startMonth);
            const formattedEnd = formatMonth(endMonth);

            if (startMonth === endMonth) {
                return formattedStart;
            } else {
                return `${formattedStart} ~ ${formattedEnd}`;
            }
        }

        return description;
    }, []);

    // 群組收支記錄應用格式化
    const groupRecords = useMemo((): RecordListItem[] =>
        groupTransactions.map(transaction => ({
            id: transaction.id!,
            type: RECORD_TYPES.GROUP_TRANSACTION,
            title: transaction.title,
            amount: transaction.amount,
            date: transaction.date,
            description: formatPrepaymentDescription(transaction.description),
            canEdit: transaction.userId === user?.uid,
            canDelete: transaction.userId === user?.uid,
            creatorDisplayName: (transaction as any).creatorDisplayName,
        }))
        , [groupTransactions, user?.uid, formatPrepaymentDescription])

    // 個人繳費記錄使用共用格式化函數
    const memberRecords = useMemo((): RecordListItem[] =>
        memberPayments.map(payment => ({
            id: payment.id,
            type: RECORD_TYPES.MEMBER_PAYMENT,
            title: payment.title || `${RECORD.PAYMENT} ${COMMON.DASH} ${payment.billingMonth}`,
            amount: payment.amount,
            date: payment.paymentDate,
            description: formatPrepaymentDescription(payment.description),
            canEdit: payment.memberId === user?.uid,
            canDelete: payment.memberId === user?.uid,
        }))
        , [memberPayments, user?.uid, formatPrepaymentDescription])

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
                // 統一使用 RecordsService 刪除個人繳費記錄
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