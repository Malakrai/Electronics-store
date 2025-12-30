import { Injectable } from '@angular/core';
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
  }
}
