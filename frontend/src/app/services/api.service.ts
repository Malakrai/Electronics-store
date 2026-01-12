import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import {
  MonthlyBill,
  BillStatus,
  PaymentMethod,
  Customer,
  BillItem,
  Payment
} from '../models/bill.model';
export type { MonthlyBill, BillStatus, PaymentMethod, Customer, BillItem, Payment };
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  orderDate: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  customer: Customer;
  items: any[];
}

export interface CheckoutRequest {
  customerId?: number;
  customerName: string;
  customerEmail: string;
  totalAmount?: number;
  shippingAmount?: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface CheckoutResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  orderDate: string;
  billId?: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {
    console.log('ApiService: Utilisation du backend Spring');
  }

  // ========== USER METHODS ==========
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError(this.handleError<User[]>('getUsers', []))
    );
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError<User>(`getUserById(${userId})`))
    );
  }

  // ========== PRODUCT METHODS ==========
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      catchError(this.handleError<Product[]>('getProducts', []))
    );
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`).pipe(
      catchError(this.handleError<Product>(`getProductById(${productId})`))
    );
  }

  // ========== BILL/INVOICE METHODS ==========
  getAllBills(): Observable<MonthlyBill[]> {
    return this.http.get<MonthlyBill[]>(`${this.apiUrl}/bills/simple`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn('Using fallback for getAllBills:', error.status);
        return of([]);
      })
    );
  }

  getBill(billId: number): Observable<MonthlyBill> {
    return this.http.get<MonthlyBill>(`${this.apiUrl}/bills/${billId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching bill ${billId}:`, error);
        return of(this.createFallbackBill(billId));
      })
    );
  }

  getUnpaidBills(): Observable<MonthlyBill[]> {
    return this.http.get<MonthlyBill[]>(`${this.apiUrl}/bills/unpaid`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching unpaid bills:', error);
        return of([this.createFallbackBill(1)]);
      })
    );
  }

  payBill(billId: number, amount: number, method: PaymentMethod): Observable<Payment> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('method', method);

    return this.http.post<Payment>(`${this.apiUrl}/bills/${billId}/pay`, null, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error paying bill ${billId}:`, error);
        return of({
          id: Math.floor(Math.random() * 1000) + 100,
          amount: amount,
          method: method,
          paymentDate: new Date().toISOString()
        });
      })
    );
  }

  downloadBillPdf(billId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/bills/${billId}/pdf`, {
      responseType: 'blob'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error downloading PDF for bill ${billId}:`, error);
        const pdfContent = `Facture #${billId}\n\nElectroViolet\nDate: ${new Date().toLocaleDateString()}`;
        return of(new Blob([pdfContent], { type: 'application/pdf' }));
      })
    );
  }

  // ========== ORDER/CHECKOUT METHODS ==========
  initializePayment(orderId: number): Observable<MonthlyBill> {
    console.log(`ApiService: initializePayment(${orderId})`);

    return this.http.get<MonthlyBill[]>(`${this.apiUrl}/bills/order/${orderId}`).pipe(
      map(bills => {
        if (!bills || bills.length === 0) {
          return this.createFallbackBill(orderId);
        }
        return bills[0];
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn(`Using fallback bill for order ${orderId}:`, error.status);
        return of(this.createFallbackBill(orderId));
      })
    );
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`).pipe(
      catchError(this.handleError<Order>(`getOrder(${orderId})`))
    );
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/orders/checkout`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Checkout failed:', error);
        return of({
          orderId: Math.floor(Math.random() * 1000) + 100,
          orderNumber: 'ORD-' + Date.now().toString().substr(-6),
          totalAmount: request.totalAmount || 0,
          orderDate: new Date().toISOString(),
          billId: Math.floor(Math.random() * 1000) + 100,
          status: 'CONFIRMED'
        });
      })
    );
  }

  createTestBill(customerId: number): Observable<MonthlyBill> {
    return this.http.post<MonthlyBill>(`${this.apiUrl}/bills/test?customerId=${customerId}`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error creating test bill:', error);
        return of(this.createFallbackBill(customerId));
      })
    );
  }

  // ========== UTILITY METHODS ==========
  getFormattedDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr || '';
    }
  }

  toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(',', '.').replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PAID': 'Payée',
      'UNPAID': 'Impayée',
      'PENDING': 'En attente',
      'CANCELLED': 'Annulée',
      'CANCELED': 'Annulée',
      'PARTIALLY_PAID': 'Partiellement payée'
    };
    return statusMap[status?.toUpperCase()] || status || 'Inconnu';
  }

  getSubtotal(items?: BillItem[]): number {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum: number, item: BillItem) => sum + this.toNumber(item.lineTotal), 0);
  }

  getVat(items?: BillItem[]): number {
    return this.getSubtotal(items) * 0.20;
  }

  getTotal(items?: BillItem[]): number {
    return this.getSubtotal(items) + this.getVat(items);
  }

  // ========== PRIVATE METHODS ==========
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return new Observable<T>(observer => {
        if (result !== undefined) {
          observer.next(result);
        }
        observer.complete();
      });
    };
  }

  private createFallbackBill(billId?: number): MonthlyBill {
    const id = billId || Math.floor(Math.random() * 1000) + 100;
    const subtotal = 32.00;
    const vat = subtotal * 0.20;
    const total = subtotal + vat;

    return {
      id: id,
      billDate: new Date().toISOString(),
      totalAmount: total,
      status: 'UNPAID',
      customer: {
        id: 3,
        firstName: 'amjdbh',
        lastName: 'iuq',
        email: 'abdezahid2510@gmail.com',
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
