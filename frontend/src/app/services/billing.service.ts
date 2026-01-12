import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MonthlyBill,
  BillStatus,
  PaymentMethod,
  Customer,
  BillItem,
  Payment
} from '../models/bill.model';
export type { MonthlyBill, BillStatus, PaymentMethod, Customer, BillItem, Payment };@Injectable({
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

  getBillsByOrder(orderId: number): Observable<MonthlyBill[]> {
    return this.http.get<MonthlyBill[]>(`${this.apiUrl}/order/${orderId}`);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getFormattedDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  public createFallbackBill(billId?: number): MonthlyBill {
    const id = billId || Math.floor(Math.random() * 1000) + 100;
    const subtotal = 32.0;
    const vat = subtotal * 0.20;
    const total = subtotal + vat;

    return {
      id: id,
      billDate: new Date().toISOString(),
      totalAmount: total,
      status: 'UNPAID',
      customer: {
        id: 3,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+33600000000'
      },
      items: [
        {
          id: 1,
          description: 'Produit depuis panier',
          quantity: 1,
          unitPrice: subtotal,
          lineTotal: subtotal
        }
      ],
      referenceNumber: `BILL-${id}`,
      taxAmount: vat,
      shippingAmount: 0,
      amountPaid: 0
    };
  }
}
