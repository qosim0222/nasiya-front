import type { DebtType } from "./DebtType";
import type { DebtorType } from "./DebtorType";

export interface SellerType {
  id: string;
  fullname: string;
  userName: string;
  phone?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  Debt?: Array<DebtType>;
  Debtor?: Array<DebtorType>;
  totalDebt?: number;
  overdueDebts?: number;
  debtors?: number;
}