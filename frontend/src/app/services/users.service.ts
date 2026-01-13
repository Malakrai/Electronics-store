import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    console.log('Headers envoyés:', headers);
    return headers;
  }

  // Récupérer tous les magasiniers
  getMagasiniers(): Observable<any[]> {
    console.log('Appel GET à:', `${this.baseUrl}/magasiniers`);
    return this.http.get<any[]>(`${this.baseUrl}/magasiniers`, {
      headers: this.getHeaders()
    });
  }

  // Créer un magasinier
  createMagasinier(data: any): Observable<any> {
    console.log('Appel POST à:', `${this.baseUrl}/magasiniers`, data);
    return this.http.post<any>(`${this.baseUrl}/magasiniers`, data, {
      headers: this.getHeaders()
    });
  }

  // Mettre à jour un magasinier
  updateMagasinier(id: string, data: any): Observable<any> {
    console.log('Appel PUT à:', `${this.baseUrl}/magasiniers/${id}`, data);
    return this.http.put<any>(`${this.baseUrl}/magasiniers/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // Supprimer un magasinier
  deleteMagasinier(id: string): Observable<any> {
    console.log('Appel DELETE à:', `${this.baseUrl}/magasiniers/${id}`);
    return this.http.delete<any>(`${this.baseUrl}/magasiniers/${id}`, {
      headers: this.getHeaders()
    });
  }
}
