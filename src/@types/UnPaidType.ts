export interface UnPaidType {
  id: string;
  debtId: string;
  amount: number;
  month: number;
  date: string;            
  isActive: boolean;     
  createdAt: string;
  updatedAt: string;
  Debt: {
    id: string;
    productName: string;
    date: string;          
    term: number;
    note?: string | null;  
    amount: number;        
    debtorId: string;
    sellerId: string;
    createdAt: string;
    updatedAt: string;
    Debtor: {
      id: string;
      name: string;
      address?: string | null; 
      sellerId: string;
      note?: string | null;    
      star: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}
