import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersAdminService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}


  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create-user`, data);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/update-user/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/delete-user/${id}`);
  }


  createMagasinier(data: any): Observable<any> {
    return this.createUser({ ...data, role: 'magasinier' });
  }

  getMagasiniers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/magasiniers`);
  }
}
