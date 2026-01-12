export type PaymentMethodType = 'CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'COD';

export type OrderStatus =
  'PENDING_PAYMENT' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' |
  'RETURN_REQUESTED' | 'RETURNED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type InvoiceStatus = 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface Address {
  id: number;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  zip: string;
  country: string;
}

export interface CartItem {
  id: number;
  title: string;
  qty: number;
  unitPrice: number;
}

export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  token: string;      // IMPORTANT: token only (simulation)
  brand?: string;     // VISA / MC
  last4?: string;     // **** 4242
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
}

export interface Order {
  id: number;
  status: OrderStatus;
  createdAt: string;
  items: CartItem[];
  shippingMethod: 'STANDARD' | 'EXPRESS';
  shippingPrice: number;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface Payment {
  id: number;
  orderId: number;
  method: PaymentMethodType;
  amount: number;
  status: PaymentStatus;
  providerRef?: string;
  paidAt?: string;
  failReason?: string;
}

export interface Invoice {
  id: number;
  orderId: number;
  number: string; // FAC-2025-000123
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
  total: number;
}
