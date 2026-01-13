import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private baseUrl = 'http://localhost:8080/stats';

  constructor(private http: HttpClient) {}

  // ===== KPI =====
  getTotalOrders(year?: number): Observable<number> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<any>(`${this.baseUrl}/total-orders`, { params }).pipe(map(v => Number(v.value ?? 0)));
  }

  getTotalCustomers(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/total-customers`).pipe(map(v => Number(v.value ?? 0)));
  }

  getTotalRevenue(year?: number): Observable<number> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<any>(`${this.baseUrl}/total-revenue`, { params }).pipe(map(v => Number(v.value ?? 0)));
  }

  getItemsPerOrder(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/items-per-order`).pipe(map(v => Number(v.value ?? 0)));
  }

  // ===== TIME =====
  getOrdersPerMonth(year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<any[]>(`${this.baseUrl}/orders-per-month`, { params });
  }

  getRevenueByMonth(year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<any[]>(`${this.baseUrl}/revenue-by-month`, { params });
  }

  // ===== PRODUCTS =====
  getTopProducts(limit = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any[]>(`${this.baseUrl}/top-products`, { params });
  }

  getTopProductsMonth(month: string, limit = 10): Observable<any[]> {
    const params = new HttpParams().set('month', month).set('limit', limit);
    return this.http.get<any[]>(`${this.baseUrl}/top-products/month`, { params });
  }

  getTopProductsYear(year: number, limit = 10): Observable<any[]> {
    const params = new HttpParams().set('year', year).set('limit', limit);
    return this.http.get<any[]>(`${this.baseUrl}/top-products/year`, { params });
  }

  getTopProductsByRevenue(limit = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any[]>(`${this.baseUrl}/top-products/revenue`, { params });
  }

  // ===== CATEGORY =====
  getCategoryShare(year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<any[]>(`${this.baseUrl}/category/share`, { params });
  }

  getCategoryMargin(year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<any[]>(`${this.baseUrl}/category/margin`, { params });
  }
}
