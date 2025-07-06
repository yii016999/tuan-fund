import { BalanceData, HomeModel, PaymentStatus, Transaction, TransactionOverview } from '../model/Home';

class HomeService {
  // 獲取餘額趨勢數據
  async getBalanceData(): Promise<BalanceData> {
    // 模擬 API 調用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [
            {
              data: [10000, 15000, 12000, 18000, 16000, 20000],
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        });
      }, 500);
    });
  }

  // 獲取交易總覽數據
  async getTransactionOverview(): Promise<TransactionOverview> {
    // 模擬 API 調用
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'in',
            amount: 5000,
            description: '張三繳費',
            date: new Date(),
          },
          {
            id: '2',
            type: 'out',
            amount: 2000,
            description: '聚餐費用',
            date: new Date(),
          },
          {
            id: '3',
            type: 'in',
            amount: 3000,
            description: '李四繳費',
            date: new Date(),
          },
        ];

        resolve({
          monthlyIncome: 8000,
          monthlyExpense: 2000,
          recentTransactions: mockTransactions,
        });
      }, 300);
    });
  }

  // 獲取繳費狀態
  async getPaymentStatus(): Promise<PaymentStatus> {
    // 模擬 API 調用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isPaid: true,
          amount: 3000,
          period: '2024年6月',
          dueDate: new Date('2024-06-30'),
        });
      }, 200);
    });
  }

  // 獲取首頁所有數據
  async getHomeData(): Promise<HomeModel> {
    try {
      const [balanceData, transactionOverview, paymentStatus] = await Promise.all([
        this.getBalanceData(),
        this.getTransactionOverview(),
        this.getPaymentStatus(),
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
}

export const homeService = new HomeService(); 