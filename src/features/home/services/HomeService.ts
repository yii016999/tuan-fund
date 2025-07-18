import { db } from '@/config/firebase';
import { COLLECTIONS, COLUMNS, DOCUMENTS, QUERIES } from '@/constants/firestorePaths';
import { COMMON } from '@/constants/string';
import { UI } from '@/constants/config';
import { RECORD_TRANSACTION_TYPES } from '@/constants/types';
import { MemberPaymentRecord } from '@/features/records/model/Record';
import { Transaction } from '@/features/transaction/model/Transaction';
import { collection, doc, getDoc, getDocs, limit, orderBy, OrderByDirection, query, where, WhereFilterOp } from 'firebase/firestore';
import { BalanceData, DashboardSummary, PaymentStatus, TransactionOverview } from '../model/Home';

class HomeService {
  // 獲取指定年份的餘額趨勢數據
  async getBalanceData(groupId: string, year: number = new Date().getFullYear()): Promise<BalanceData> {
    try {
      if (!groupId) {
        console.warn('Missing groupId for balance data')
        const monthlyBalance = this.getDefaultYearlyBalance(year)
        return {
          labels: monthlyBalance.labels,
          datasets: [
            {
              data: monthlyBalance.balances,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: UI.HOME.CHART_STROKE_WIDTH,
            },
          ],
        }
      }

      // 確保所有查詢參數都不是 undefined
      if (!COLUMNS.DATE || !QUERIES.GREATER_THAN_OR_EQUAL_TO || !QUERIES.LESS_THAN_OR_EQUAL_TO) {
        throw new Error('查詢常數未正確定義')
      }

      // 查詢指定年份的所有交易
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, `${year}-01-01`),
        where(COLUMNS.DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, `${year}-12-31`),
        orderBy(COLUMNS.DATE, QUERIES.ASC as OrderByDirection)
      )

      const snapshot = await getDocs(q)

      const transactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction))

      // 獲取該年份之前的累計餘額
      const previousBalance = await this.getPreviousYearBalance(groupId, year)

      // 計算年度月度餘額變化
      const monthlyBalance = this.calculateYearlyBalance(transactions, year, previousBalance)

      return {
        labels: monthlyBalance.labels,
        datasets: [
          {
            data: monthlyBalance.datasets[0].data as number[],
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: UI.HOME.CHART_STROKE_WIDTH,
          },
        ],
      }
    } catch (error) {
      console.error('Error fetching balance data:', error)
      throw error
    }
  }

  // 獲取交易總覽數據
  async getTransactionOverview(groupId: string): Promise<TransactionOverview> {
    try {
      if (!groupId) {
        console.warn('Missing groupId for transaction overview')
        return {
          monthlyIncome: 0,
          monthlyExpense: 0,
          recentTransactions: [],
          createdBy: '',
        }
      }

      // 確保日期計算正確
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() // 0-11
      
      const startOfMonth = new Date(currentYear, currentMonth, 1)
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0)
      
      const startDateStr = startOfMonth.toISOString().split('T')[0]
      const endDateStr = endOfMonth.toISOString().split('T')[0]

      // 確保所有查詢參數都不是 undefined
      if (!COLUMNS.DATE || !QUERIES.GREATER_THAN_OR_EQUAL_TO || !QUERIES.LESS_THAN_OR_EQUAL_TO) {
        throw new Error('查詢常數未正確定義')
      }

      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, startDateStr),
        where(COLUMNS.DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDateStr),
        orderBy(COLUMNS.DATE, QUERIES.DESC as OrderByDirection),
        limit(UI.HOME.TRANSACTION_QUERY_LIMIT)
      )

      const snapshot = await getDocs(q)

      // 如果當月沒有資料，擴大查詢範圍到最近3個月
      if (snapshot.size === 0) {
        const threeMonthsAgo = new Date(currentYear, currentMonth - UI.HOME.EXPANDED_QUERY_MONTHS, 1)
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0]
        
        const expandedQuery = query(
          collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
          where(COLUMNS.DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, threeMonthsAgoStr),
          where(COLUMNS.DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, endDateStr),
          orderBy(COLUMNS.DATE, QUERIES.DESC as OrderByDirection),
          limit(UI.HOME.TRANSACTION_QUERY_LIMIT)
        )
        
        const expandedSnapshot = await getDocs(expandedQuery)
        
        // 使用擴大查詢的結果
        const allTransactions: Transaction[] = expandedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Transaction))
        
        // 只計算當月的收支
        const currentMonthTransactions = allTransactions.filter(t => 
          t.date >= startDateStr && t.date <= endDateStr
        )
        
        let monthlyIncome = 0
        let monthlyExpense = 0
        
        currentMonthTransactions.forEach(transaction => {
          if (transaction.type === RECORD_TRANSACTION_TYPES.INCOME) {
            monthlyIncome += transaction.amount
          } else {
            monthlyExpense += transaction.amount
          }
        })
        
        // 取最近的交易記錄（不限當月）
        const recentTransactions = allTransactions.slice(0, UI.HOME.RECENT_TRANSACTIONS_LIMIT)
        
        const userIds = [...new Set(recentTransactions.map(t => t.userId))]
        const userNamesMap = await this.getUserNamesMap(userIds)
        
        const recentTransactionsWithNames = recentTransactions.map(transaction => ({
          id: transaction.id || '',
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.title,
          date: new Date(transaction.date),
          createdBy: userNamesMap[transaction.userId] || 'Unknown',
        }))
        
        return {
          monthlyIncome,
          monthlyExpense,
          recentTransactions: recentTransactionsWithNames,
          createdBy: userNamesMap[allTransactions[0]?.userId] || 'Unknown',
        }
      }

      // 原本的邏輯保持不變
      const transactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction))

      // 計算當月收支
      let monthlyIncome = 0
      let monthlyExpense = 0

      transactions.forEach(transaction => {
        if (transaction.type === RECORD_TRANSACTION_TYPES.INCOME) {
          monthlyIncome += transaction.amount
        } else {
          monthlyExpense += transaction.amount
        }
      })

      // 取最近的交易記錄
      const recentTransactions = transactions.slice(0, UI.HOME.RECENT_TRANSACTIONS_LIMIT)

      // 獲取所有相關用戶的暱稱
      const userIds = [...new Set(recentTransactions.map(t => t.userId))]
      const userNamesMap = await this.getUserNamesMap(userIds)

      const recentTransactionsWithNames = recentTransactions.map(transaction => ({
        id: transaction.id || '',
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.title,
        date: new Date(transaction.date),
        createdBy: userNamesMap[transaction.userId] || 'Unknown',
      }))

      return {
        monthlyIncome,
        monthlyExpense,
        recentTransactions: recentTransactionsWithNames,
        createdBy: userNamesMap[transactions[0]?.userId] || 'Unknown',
      }
    } catch (error) {
      console.error('Error fetching transaction overview:', error)
      throw error
    }
  }

  // 獲取用戶暱稱映射
  private async getUserNamesMap(userIds: string[]): Promise<Record<string, string>> {
    try {
      const userNamesMap: Record<string, string> = {}

      for (const userId of userIds) {
        if (userId) {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            userNamesMap[userId] = userData.displayName || 'Unknown'
          }
        }
      }

      return userNamesMap
    } catch (error) {
      console.error('Error fetching user names:', error)
      return {}
    }
  }

  // 獲取繳費狀態
  async getPaymentStatus(groupId: string, userId: string): Promise<PaymentStatus> {
    try {
      // 加強參數驗證
      if (!groupId || !userId) {
        console.log('缺少參數:', { groupId, userId })
        return {
          isPaid: false,
          amount: 0,
          period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
          dueDate: this.calculateDueDate(),
        }
      }

      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const currentMonthNum = currentMonth.replace('-', '') // YYYYMM

      // 檢查常數是否定義
      if (!COLUMNS.MEMBER_ID || !COLUMNS.BILLING_MONTH) {
        console.error('Missing column constants:', {
          MEMBER_ID: COLUMNS.MEMBER_ID,
          BILLING_MONTH: COLUMNS.BILLING_MONTH
        })
        throw new Error('系統設定錯誤：缺少欄位定義')
      }

      // 1. 先查詢當前月份的直接繳費記錄
      const currentMonthQuery = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.BILLING_MONTH, QUERIES.EQUALS as WhereFilterOp, currentMonth),
        limit(1)
      )

      const currentMonthSnapshot = await getDocs(currentMonthQuery)
      
      if (!currentMonthSnapshot.empty) {
        const paymentData = { id: currentMonthSnapshot.docs[0].id, ...currentMonthSnapshot.docs[0].data() } as MemberPaymentRecord
        return {
          isPaid: true,
          amount: paymentData.amount || 0,
          period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
          dueDate: this.calculateDueDate(),
        }
      }

      // 2. 如果沒有當月記錄，查詢預繳記錄
      const prepaymentQuery = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId)
      )

      const prepaymentSnapshot = await getDocs(prepaymentQuery)
      
      // 檢查預繳記錄是否涵蓋當前月份
      for (const doc of prepaymentSnapshot.docs) {
        const paymentData = doc.data() as MemberPaymentRecord
        
        // 檢查是否為預繳記錄
        if (paymentData.description?.includes('預繳')) {
          const prepaymentMatch = paymentData.description.match(/預繳\s*(\d{6})-(\d{6})/)
          if (prepaymentMatch) {
            const startMonth = prepaymentMatch[1]
            const endMonth = prepaymentMatch[2]
            
            // 檢查當前月份是否在預繳範圍內
            if (currentMonthNum >= startMonth && currentMonthNum <= endMonth) {
              return {
                isPaid: true,
                amount: paymentData.amount || 0,
                period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
                dueDate: this.calculateDueDate(),
              }
            }
          }
        }
      }

      // 3. 如果沒有任何繳費記錄，返回未繳費狀態
      return {
        isPaid: false,
        amount: 0,
        period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
        dueDate: this.calculateDueDate(),
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)

      // 返回預設值而不是拋出錯誤
      return {
        isPaid: false,
        amount: 0,
        period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
        dueDate: this.calculateDueDate(),
      }
    }
  }

  // 獲取首頁所有數據
  async getHomeData(groupId: string, userId: string, year?: number): Promise<DashboardSummary> {
    try {
      if (!groupId || !userId) {
        throw new Error('缺少必要參數：群組ID或用戶ID')
      }

      const [balanceData, transactionOverview, paymentStatus] = await Promise.all([
        this.getBalanceData(groupId, year),
        this.getTransactionOverview(groupId),
        this.getPaymentStatus(groupId, userId),
      ])

      return {
        balanceData,
        transactionOverview,
        paymentStatus,
      }
    } catch (error) {
      console.error('Error fetching home data:', error)
      throw error
    }
  }

  // 獲取指定年份之前的累計餘額
  private async getPreviousYearBalance(groupId: string, year: number): Promise<number> {
    try {
      if (year <= UI.HOME.EARLIEST_YEAR_FALLBACK) return 0 // 假設2020年之前沒有資料

      // 檢查常數是否定義
      if (!COLUMNS.DATE || !QUERIES.LESS_THAN) {
        console.error('查詢常數未定義:', { COLUMNS_DATE: COLUMNS.DATE, QUERIES_LESS_THAN: QUERIES.LESS_THAN })
        return 0
      }

      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.DATE, QUERIES.LESS_THAN as WhereFilterOp, `${year}-01-01`),
        orderBy(COLUMNS.DATE, QUERIES.ASC as OrderByDirection)
      )

      const snapshot = await getDocs(q)
      let balance = 0

      snapshot.docs.forEach(doc => {
        const transaction = doc.data() as Transaction
        balance += transaction.type === RECORD_TRANSACTION_TYPES.INCOME ? transaction.amount : -transaction.amount
      })

      return balance
    } catch (error) {
      console.error('Error fetching previous year balance:', error)
      return 0
    }
  }

  // 計算指定年份的月度餘額變化
  private calculateYearlyBalance(transactions: Transaction[], year: number, startingBalance: number = 0) {
    const monthlyBalances: number[] = []
    let runningBalance = startingBalance // 從之前的餘額開始

    // 先算出每月餘額
    for (let m = 1; m <= UI.TIME.MONTHS_PER_YEAR; m++) {
      const monthStr = `${year}-${m.toString().padStart(2, '0')}`
      const monthTxs = transactions.filter(tx => tx.date.startsWith(monthStr))
      
      // 計算該月的變化
      let monthlyChange = 0
      monthTxs.forEach(tx => {
        monthlyChange += tx.type === RECORD_TRANSACTION_TYPES.INCOME ? tx.amount : -tx.amount
      })
      
      runningBalance += monthlyChange
      monthlyBalances.push(runningBalance)
    }

    // 只顯示到當前年月
    const now = new Date()
    const isCurrentYear = year === now.getFullYear()
    const currentMonth = isCurrentYear ? now.getMonth() + 1 : UI.TIME.MONTHS_PER_YEAR

    // 數據和標籤都只到當前月份
    const chartData = monthlyBalances.slice(0, currentMonth)
    const allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const labels = allLabels.slice(0, currentMonth)

    return {
      labels: labels,
      datasets: [
        {
          data: chartData,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: UI.HOME.CHART_STROKE_WIDTH,
        },
      ],
    }
  }

  // 生成預設的年度餘額數據
  private getDefaultYearlyBalance(year: number) {
    // 英文月份縮寫
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // 獲取當前年月
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // 決定要顯示數據點到哪個月
    const maxMonth = year === currentYear ? currentMonth : UI.TIME.MONTHS_PER_YEAR

    // 標籤和數據都只到maxMonth
    const labels = monthLabels.slice(0, maxMonth)
    const balances = new Array(maxMonth).fill(0)

    return {
      labels: labels, // 標籤也只到當前月份
      balances, // 數據到當前月份
      maxMonth
    }
  }

  // 獲取群組月繳金額
  private async getGroupMonthlyAmount(groupId: string): Promise<number> {
    try {
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
      const snapshot = await getDoc(groupRef)

      if (snapshot.exists()) {
        const groupData = snapshot.data()
        return groupData.monthlyAmount || 0
      }

      return 0
    } catch (error) {
      console.error('Error fetching group monthly amount:', error)
      return 0
    }
  }

  // 計算繳費截止日期
  private calculateDueDate(): Date {
    const now = new Date()
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0) // 當月最後一天
    return dueDate
  }

  // 獲取群組最早交易年份
  async getEarliestTransactionYear(groupId: string): Promise<number> {
    try {
      if (!groupId) {
        console.warn('Missing groupId for earliest year')
        return new Date().getFullYear()
      }

      // 檢查常數是否定義
      if (!COLUMNS.DATE || !QUERIES.ASC) {
        console.error('查詢常數未定義:', { COLUMNS_DATE: COLUMNS.DATE, QUERIES_ASC: QUERIES.ASC })
        return new Date().getFullYear()
      }

      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        orderBy(COLUMNS.DATE, QUERIES.ASC as OrderByDirection),
        limit(1)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return new Date().getFullYear()
      }

      const earliestTransaction = snapshot.docs[0].data() as Transaction
      const earliestYear = new Date(earliestTransaction.date).getFullYear()

      return earliestYear
    } catch (error) {
      console.error('Error fetching earliest transaction year:', error)
      return new Date().getFullYear()
    }
  }
}

export const homeService = new HomeService()