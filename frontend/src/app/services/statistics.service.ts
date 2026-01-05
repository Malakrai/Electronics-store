import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private baseUrl = 'http://localhost:8080/stats';

  constructor(private http: HttpClient) {}

  // ------- IMPORTANT : ces 3 endpoints renvoient un nombre brut ---------
  getTotalOrders(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/total-orders`)
      .pipe(map(v => v.value));
  }

  getTotalCustomers(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/total-customers`)
      .pipe(map(v => v.value));
  }

  getTotalRevenue(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/total-revenue`)
      .pipe(map(v => v.value));
  }

  // ---------------------- Listes JSON : OK -----------------------
  getTopProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/top-products`);
  }

  getTopClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/top-clients`);
  }

  getOrdersPerMonth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders-per-month`);
  }

  getRevenueByMonth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/revenue-by-month`);
  }

  getStatsByCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/category`);
  }
}

