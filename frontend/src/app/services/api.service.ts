import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.getHeaders() });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Products
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`, { headers: this.getHeaders() });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/products`, product, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`, { headers: this.getHeaders() });
=======
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
>>>>>>> origin/ayoub
  }
}
