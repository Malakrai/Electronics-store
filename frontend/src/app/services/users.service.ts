import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getMagasiniers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/magasiniers`, {
      headers: this.getHeaders()
    });
  }

  createMagasinier(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/magasiniers`, data, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/magasiniers/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/magasiniers/${id}`, {
      headers: this.getHeaders()
    });

}
