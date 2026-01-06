import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PaymentMethod = 'CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH'; // ✅ aligné avec ton enum Java
export type BillStatus = 'PENDING' | 'PAID' | 'CANCELED' | 'CANCELLED' | string;

export interface Customer {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MonthlyBill {
  id: number;
  billDate: string;
  totalAmount: number;
  status: BillStatus;
  customer: Customer;
  items: BillItem[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getBills(): Observable<MonthlyBill[]> {
    return this.http.get<MonthlyBill[]>(`${this.baseUrl}/bills`);
  }

  getBill(billId: number): Observable<MonthlyBill> {
    return this.http.get<MonthlyBill>(`${this.baseUrl}/bills/${billId}`);
  }

  // ✅ bouton "Créer facture test" => backend = POST /api/bills/test-bill
  createTestBill(): Observable<MonthlyBill> {
    return this.http.post<MonthlyBill>(`${this.baseUrl}/bills/test-bill`, {});
  }

  downloadBillPdf(billId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/bills/${billId}/pdf`, { responseType: 'blob' });
  }

  // ✅ backend attend @RequestParam amount & method
  payBill(billId: number, amount: number, method: PaymentMethod): Observable<any> {
    const params = new HttpParams()
      .set('amount', String(amount))
      .set('method', method);

    return this.http.post(`${this.baseUrl}/bills/${billId}/pay`, null, { params });
  }
}
