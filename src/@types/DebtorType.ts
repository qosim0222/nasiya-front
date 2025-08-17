import type { DebtType } from "./DebtType";
import type { PhoneType } from "./PhooneType";

export interface DebtorType {
  id: string;
  fullname: string;
  address?: string;
  userId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  star?: boolean;
}

export interface SingleDebtorType extends DebtorType {
  Debt?: DebtType[];
  CustomerPhone?: PhoneType[];
  CustomerImage?: Array<{ id: string; image: string; customerId: string; createdAt: string; updatedAt: string; }>;
  totalAmount?: number;
}