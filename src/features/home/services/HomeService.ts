import { db } from '@/config/firebase';
import { COLLECTIONS, COLUMNS, DATE, DOCUMENTS, QUERIES } from '@/constants/firestorePaths';
import { COMMON } from '@/constants/string';
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
        console.warn('Missing groupId for balance data');
        const monthlyBalance = this.getDefaultYearlyBalance(year);
        return {
          labels: monthlyBalance.labels,
          datasets: [
            {
              data: monthlyBalance.balances,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        };
      }

      // 查詢指定年份的所有交易
      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, `${year}-01-01`),
        where(COLUMNS.DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, `${year}-12-31`),
        orderBy(COLUMNS.DATE, QUERIES.ASC as OrderByDirection)
      );

      const snapshot = await getDocs(q);

      const transactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));

      // 計算年度月度餘額變化
      const monthlyBalance = this.calculateYearlyBalance(transactions, year);

      return {
        labels: monthlyBalance.labels,
        datasets: [
          {
            data: monthlyBalance.datasets[0].data as number[],
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching balance data:', error);
      throw error;
    }
  }

  // 獲取交易總覽數據
  async getTransactionOverview(groupId: string): Promise<TransactionOverview> {
    try {
      if (!groupId) {
        console.warn('Missing groupId for transaction overview');
        return {
          monthlyIncome: 0,
          monthlyExpense: 0,
          recentTransactions: [],
          createdBy: '', // 添加默認值
        };
      }

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        where(COLUMNS.DATE, QUERIES.GREATER_THAN_OR_EQUAL_TO as WhereFilterOp, `${currentMonth}${COMMON.DASH}${DATE.START_OF_MONTH}`),
        where(COLUMNS.DATE, QUERIES.LESS_THAN_OR_EQUAL_TO as WhereFilterOp, `${currentMonth}${COMMON.DASH}${DATE.END_OF_MONTH}`),
        orderBy(COLUMNS.DATE, QUERIES.DESC as OrderByDirection),
        limit(50)
      );

      const snapshot = await getDocs(q);

      const transactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));

      // 計算當月收支
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      transactions.forEach(transaction => {
        if (transaction.type === RECORD_TRANSACTION_TYPES.INCOME) {
          monthlyIncome += transaction.amount;
        } else {
          monthlyExpense += transaction.amount;
        }
      });

      // 取最近的交易記錄
      const recentTransactions = transactions.slice(0, 5);

      // 獲取所有相關用戶的暱稱
      const userIds = [...new Set(recentTransactions.map(t => t.userId))];
      const userNamesMap = await this.getUserNamesMap(userIds);

      const recentTransactionsWithNames = recentTransactions.map(transaction => ({
        id: transaction.id || '',
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.title,
        date: new Date(transaction.date),
        createdBy: userNamesMap[transaction.userId] || 'Unknown',
      }));

      return {
        monthlyIncome,
        monthlyExpense,
        recentTransactions: recentTransactionsWithNames,
        createdBy: userNamesMap[transactions[0]?.userId] || 'Unknown',
      };
    } catch (error) {
      console.error('Error fetching transaction overview:', error);
      throw error;
    }
  }

  // 獲取用戶暱稱映射
  private async getUserNamesMap(userIds: string[]): Promise<Record<string, string>> {
    try {
      const userNamesMap: Record<string, string> = {};

      for (const userId of userIds) {
        if (userId) {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userNamesMap[userId] = userData.displayName || 'Unknown';
          }
        }
      }

      return userNamesMap;
    } catch (error) {
      console.error('Error fetching user names:', error);
      return {};
    }
  }

  // 獲取繳費狀態
  async getPaymentStatus(groupId: string, userId: string): Promise<PaymentStatus> {
    try {
      // 加強參數驗證
      if (!groupId || !userId) {
        console.log('缺少參數:', { groupId, userId });
        return {
          isPaid: false,
          amount: 0,
          period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
          dueDate: this.calculateDueDate(),
        };
      }

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      // 檢查常數是否定義
      if (!COLUMNS.MEMBER_ID || !COLUMNS.BILLING_MONTH) {
        console.error('Missing column constants:', {
          MEMBER_ID: COLUMNS.MEMBER_ID,
          BILLING_MONTH: COLUMNS.BILLING_MONTH
        });
        throw new Error('系統設定錯誤：缺少欄位定義');
      }

      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.MEMBER_PAYMENTS}`),
        where(COLUMNS.MEMBER_ID, QUERIES.EQUALS as WhereFilterOp, userId),
        where(COLUMNS.BILLING_MONTH, QUERIES.EQUALS as WhereFilterOp, currentMonth),
        limit(1)
      );

      const snapshot = await getDocs(q);
      const hasPayment = !snapshot.empty;

      let paymentData: MemberPaymentRecord | null = null;
      if (hasPayment) {
        paymentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MemberPaymentRecord;
      } else {
        console.log('沒有找到繳費記錄');
      }

      // 如果沒有繳費記錄，從群組設定獲取應繳金額
      const defaultAmount = await this.getGroupMonthlyAmount(groupId);

      // 修正狀態比較 - 使用正確的狀態值
      const result = {
        isPaid: hasPayment, // 暫時改為：有記錄就算已繳費
        amount: hasPayment ? (paymentData?.amount || 0) : 0,
        period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
        dueDate: this.calculateDueDate(),
      };

      return result;
    } catch (error) {
      console.error('Error fetching payment status:', error);

      // 返回預設值而不是拋出錯誤
      return {
        isPaid: false,
        amount: 0,
        period: `${new Date().getFullYear()}${COMMON.YEARS}${new Date().getMonth() + 1}${COMMON.MONTH}`,
        dueDate: this.calculateDueDate(),
      };
    }
  }

  // 獲取首頁所有數據
  async getHomeData(groupId: string, userId: string, year?: number): Promise<DashboardSummary> {
    try {
      if (!groupId || !userId) {
        throw new Error('缺少必要參數：群組ID或用戶ID');
      }

      const [balanceData, transactionOverview, paymentStatus] = await Promise.all([
        this.getBalanceData(groupId, year),
        this.getTransactionOverview(groupId),
        this.getPaymentStatus(groupId, userId),
      ]);

      return {
        balanceData,
        transactionOverview,
        paymentStatus,
      };
    } catch (error) {
      console.error('Error fetching home data:', error);
      throw error;
    }
  }

  // 計算指定年份的月度餘額變化
  private calculateYearlyBalance(transactions: Transaction[], year: number) {
    const monthlyBalances: number[] = [];
    let runningBalance = 0;

    // 先算出每月餘額
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${year}-${m.toString().padStart(2, '0')}`;
      const monthTxs = transactions.filter(tx => tx.date.startsWith(monthStr));
      monthTxs.forEach(tx => {
        runningBalance += tx.type === RECORD_TRANSACTION_TYPES.INCOME ? tx.amount : -tx.amount;
      });
      monthlyBalances.push(runningBalance);
    }

    // 只顯示到當前年月
    const now = new Date();
    const isCurrentYear = year === now.getFullYear();
    const currentMonth = isCurrentYear ? now.getMonth() + 1 : 12;

    // 數據和標籤都只到當前月份
    const chartData = monthlyBalances.slice(0, currentMonth);
    const allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = allLabels.slice(0, currentMonth);

    return {
      labels: labels, // 標籤也只到當前月份
      datasets: [
        {
          data: chartData, // 數據到當前月份
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }

  // 生成預設的年度餘額數據
  private getDefaultYearlyBalance(year: number) {
    // 英文月份縮寫
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 獲取當前年月
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // 決定要顯示數據點到哪個月
    const maxMonth = year === currentYear ? currentMonth : 12;

    // 標籤和數據都只到maxMonth
    const labels = monthLabels.slice(0, maxMonth);
    const balances = new Array(maxMonth).fill(0);

    return {
      labels: labels, // 標籤也只到當前月份
      balances, // 數據到當前月份
      maxMonth
    };
  }

  // 獲取群組月繳金額
  private async getGroupMonthlyAmount(groupId: string): Promise<number> {
    try {
      const groupRef = doc(db, COLLECTIONS.GROUPS, groupId);
      const snapshot = await getDoc(groupRef);

      if (snapshot.exists()) {
        const groupData = snapshot.data();
        return groupData.monthlyAmount || 0;
      }

      return 0;
    } catch (error) {
      console.error('Error fetching group monthly amount:', error);
      return 0;
    }
  }

  // 計算繳費截止日期
  private calculateDueDate(): Date {
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // 當月最後一天
    return dueDate;
  }

  // 獲取群組最早交易年份
  async getEarliestTransactionYear(groupId: string): Promise<number> {
    try {
      if (!groupId) {
        return new Date().getFullYear();
      }

      const q = query(
        collection(db, `${COLLECTIONS.GROUPS}${QUERIES.SLASH}${groupId}${QUERIES.SLASH}${DOCUMENTS.TRANSACTIONS}`),
        orderBy(COLUMNS.DATE, QUERIES.ASC as OrderByDirection),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return new Date().getFullYear();
      }

      const earliestTransaction = snapshot.docs[0].data() as Transaction;
      return new Date(earliestTransaction.date).getFullYear();
    } catch (error) {
      console.error('Error fetching earliest transaction year:', error);
      return new Date().getFullYear();
    }
  }
}

export const homeService = new HomeService(); 