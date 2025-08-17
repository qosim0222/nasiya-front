import type { DebtType } from "./DebtType";
import type { PhoneType } from "./PhooneType";

export interface DebtorAllType {
  id: string;
  fullname: string;
  address?: string;
  userId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  star?: boolean;
  Debt?: Array<DebtType>;
  user?: {
    id: string;
    fullname: string;
    userName: string;
    phone?: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
  };
  CustomerPhone?: Array<PhoneType>;
  totalDebt?: number;
}