import { RecordTransactionType } from "@/constants/types";

// 餘額數據模型
export interface BalanceData {
    labels: string[];
    datasets: Array<{
        data: number[];
        color: (opacity?: number) => string;
        strokeWidth: number;
    }>;
}

// 交易記錄模型
export interface Transaction {
    id: string;
    type: RecordTransactionType;
    amount: number;
    description: string;
    date: Date;
    groupId?: string;
}

// 收支總覽模型
export interface TransactionOverview {
    monthlyIncome: number;
    monthlyExpense: number;
    recentTransactions: Transaction[];
    createdBy: string;
}

// 繳費狀態模型
export interface PaymentStatus {
    isPaid: boolean;
    amount: number;
    period: string;
    dueDate?: Date;
}

// 首頁數據模型
export interface DashboardSummary {
    balanceData: BalanceData;
    transactionOverview: TransactionOverview;
    paymentStatus: PaymentStatus;
} 