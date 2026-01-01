import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersAdminService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  createMagasinier(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create-magasinier`, data);
  }


  getMagasiniers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/magasiniers`);
  }
}
