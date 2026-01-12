export type PaymentMethod = 'CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH';
export type BillStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'CANCELLED' | 'CANCELED' | 'PARTIALLY_PAID';

export interface Customer {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: any;
}

export interface MonthlyBill {
  id: number;
  billDate: string;
  totalAmount: number;
  status: BillStatus;
  customer?: Customer;
  customerId?: number;
  items: BillItem[];

  // Propriétés optionnelles
  referenceNumber?: string;
  taxAmount?: number;
  shippingAmount?: number;
  amountPaid?: number;
  remainingAmount?: number;
  summary?: string;
  fullyPaid?: boolean;
  overdue?: boolean;
  notes?: string;

  // Relations
  order?: {
    id: number;
    orderNumber?: string;
    totalAmount?: number;
    status?: string;
  };

  payments?: any[];
  billItems?: any[];

  // Dates
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
}
