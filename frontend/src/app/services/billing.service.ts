import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Export des types
export type PaymentMethod = 'CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type BillStatus = 'PAID' | 'UNPAID' | 'CANCELLED';

export interface MonthlyBill {
  id: number;
  billDate: string;
  totalAmount: number;
  status: BillStatus;
  customer: Customer;
  items: BillItem[];
}

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly apiUrl = 'http://localhost:8080/api/bills';

  constructor(private http: HttpClient) {}

  getAllBills(): Observable<MonthlyBill[]> {
    return this.http.get<MonthlyBill[]>(this.apiUrl);
  }

  getUnpaidBills(): Observable<MonthlyBill[]> {
    return this.http.get<MonthlyBill[]>(`${this.apiUrl}/unpaid`);
  }

  payBill(billId: number, amount: number, method: PaymentMethod): Observable<Payment> {
    const params = { amount: amount.toString(), method };
    return this.http.post<Payment>(`${this.apiUrl}/${billId}/pay`, null, { params });
  }

  downloadBillPdf(billId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${billId}/pdf`, {
      responseType: 'blob'
    });
  }

  getBillById(billId: number): Observable<MonthlyBill> {
    return this.http.get<MonthlyBill>(`${this.apiUrl}/${billId}`);
  }
}
