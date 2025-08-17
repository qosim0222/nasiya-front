export interface DebtType {
  paid_amount: any;
  id: string;
  productName?: string;
  total_amount: number;
  monthly_amount?: number | null;
  deadline_months?: number | null;
  startDate?: string | null;
  note?: string | null;
  customerId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  Payment?: Array<{
    id: string;
    debtId: string;
    amount: number;
    method?: 'FULL' | 'PARTIAL' | 'BY_MONTH';
    monthNumber?: number | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  Customer?: {
    id: string;
    fullname: string;
    address?: string;
    note?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}
export type SingleDebtType = DebtType;